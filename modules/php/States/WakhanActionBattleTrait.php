<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Wakhan;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;
use PaxPamir\Models\PaxPamirPlayer;

trait WakhanActionBattleTrait
{

  // .########..####..######..########.....###....########..######..##.....##
  // .##.....##..##..##....##.##.....##...##.##......##....##....##.##.....##
  // .##.....##..##..##.......##.....##..##...##.....##....##.......##.....##
  // .##.....##..##...######..########..##.....##....##....##.......#########
  // .##.....##..##........##.##........#########....##....##.......##.....##
  // .##.....##..##..##....##.##........##.....##....##....##....##.##.....##
  // .########..####..######..##........##.....##....##.....######..##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.



  // .##......##....###....##....##.##.....##....###....##....##
  // .##..##..##...##.##...##...##..##.....##...##.##...###...##
  // .##..##..##..##...##..##..##...##.....##..##...##..####..##
  // .##..##..##.##.....##.#####....#########.##.....##.##.##.##
  // .##..##..##.#########.##..##...##.....##.#########.##..####
  // .##..##..##.##.....##.##...##..##.....##.##.....##.##...###
  // ..###..###..##.....##.##....##.##.....##.##.....##.##....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function wakhanBattle($card = null)
  {
    if ($card === null) {
      $card = $this->wakhanGetCourtCardToPerformAction(BATTLE);
    }
    
    Notifications::log('card', $card);
    if ($card === null) {
      Wakhan::actionNotValid();
      return false;
    }

    // Perform action
    $topOfWakhanDiscard = WakhanCards::getTopOf(DISCARD);

    $battleInRegionData = $this->wakhanGetRegionToBattle($topOfWakhanDiscard['front']['regionOrder']);

    if ($battleInRegionData !== null) {
      Wakhan::actionValid();
      $this->wakhanPayHostageBribeIfNeeded($card, BATTLE);
      $this->wakhanResolveBattleInRegion($card, $battleInRegionData);
      return true;
    }

    $cardToBattleOn = $this->wakhanGetCardToBattleOn();
    if ($cardToBattleOn !== null) {
      Wakhan::actionValid();
      $this->wakhanPayHostageBribeIfNeeded($card, BATTLE);
      $this->wakhanResolveBattleOnCourtCard($card, $cardToBattleOn);
      return true;
    }

    Wakhan::actionNotValid();
    return false;
  }

  // ..######.....###....########..########.
  // .##....##...##.##...##.....##.##.....##
  // .##........##...##..##.....##.##.....##
  // .##.......##.....##.########..##.....##
  // .##.......#########.##...##...##.....##
  // .##....##.##.....##.##....##..##.....##
  // ..######..##.....##.##.....##.########.

  function wakhanResolveBattleOnCourtCard($card, $cardToBattleOn)
  {
    Cards::setUsed($card['id'], 1);
    // if not bonus action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card)) {
      Globals::incRemainingActions(-1);
    }
    Notifications::battleCard($cardToBattleOn['id']);

    $wakhanSpyCount = $this->getLoyalSpyCount(WAKHAN_PLAYER_ID, $card['id']);
    $enemySpies = $this->getEnemySpiesOnCard(WAKHAN_PLAYER_ID, $cardToBattleOn['id']);

    $side = $this->wakhanGetRedArrowValue();
    $targetedPlayerId = $side === TOP_LEFT ? PaxPamirPlayers::getPrevId(WAKHAN_PLAYER_ID) : PaxPamirPlayers::getNextId(WAKHAN_PLAYER_ID);
    $targetOrder = $this->wakhanBattlePrioritizeCylinders($enemySpies, $targetedPlayerId);

    $numberOfPiecesToRemove = min($wakhanSpyCount, $card['rank']);

    $protectedBySafeHouse = [];
    $safeHouseOwners = $this->getSafeHouseOwners();

    for ($i = 0; $i < $numberOfPiecesToRemove; $i++) {
      if (!isset($targetOrder[$i])) {
        continue;
      }
      $cylinderId = $targetOrder[$i]['id'];
      $cylinderOwnerPlayerId = Utils::getPlayerIdForCylinderId($cylinderId);
      if (in_array($cylinderOwnerPlayerId, $safeHouseOwners)) {
        $protectedBySafeHouse[$cylinderId] = [
          'tokenId' => $cylinderId,
          'playerId' => $cylinderOwnerPlayerId,
          'from' => $targetOrder[$i]['location'],
        ];
      } else {
        $to = implode('_', ['cylinders', $cylinderOwnerPlayerId]);
        $state = Tokens::insertOnTop($cylinderId, $to);
        Notifications::returnCylinder(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $cylinderOwnerPlayerId, $cardToBattleOn['id'], $cylinderId, $state);
      };
    }

    if (count($protectedBySafeHouse) > 0) {
      $extraActions = $this->getSafeHouseActions($protectedBySafeHouse);
      ActionStack::push($extraActions);
    }
  }

  function wakhanGetCardToBattleOn()
  {
    $courtCards = PaxPamirPlayers::getAllCourtCardsOrdered();
    $courtCardsWakhanCanBattleOn = Utils::filter($courtCards, function ($card) {
      $wakhanSpyCount = $this->getLoyalSpyCount(WAKHAN_PLAYER_ID, $card['id']);
      if ($wakhanSpyCount === 0) {
        return false;
      }
      $enemySpyCount = count($this->getEnemySpiesOnCard(WAKHAN_PLAYER_ID, $card['id']));
      if ($enemySpyCount === 0) {
        return false;
      }
      return true;
    });
    $count = count($courtCardsWakhanCanBattleOn);
    if ($count === 0) {
      return null;
    } else if ($count === 1) {
      return $courtCardsWakhanCanBattleOn[0];
    } else {
      return Wakhan::selectHighestPriorityCard($courtCardsWakhanCanBattleOn);
    }
  }

  function getEnemySpiesOnCard($playerId, $cardId)
  {
    $spiesOnCard = Tokens::getInLocation(['spies', $cardId])->toArray();
    $enemySpies = Utils::filter($spiesOnCard, function ($cylinder) use ($playerId) {
      $cylinderOwnerId = Utils::getPlayerIdForCylinderId($cylinder['id']);
      if ($cylinderOwnerId === $playerId) {
        return false;
      }
      if (PaxPamirPlayers::get($cylinderOwnerId)->hasSpecialAbility(SA_INDISPENSABLE_ADVISORS)) {
        return false;
      }
      return true;
    });
    return $enemySpies;
  }


  // .########..########..######...####..#######..##....##
  // .##.....##.##.......##....##...##..##.....##.###...##
  // .##.....##.##.......##.........##..##.....##.####..##
  // .########..######...##...####..##..##.....##.##.##.##
  // .##...##...##.......##....##...##..##.....##.##..####
  // .##....##..##.......##....##...##..##.....##.##...###
  // .##.....##.########..######...####..#######..##....##

  function wakhanResolveBattleInRegion($card, $data)
  {
    $region = $data['region'];
    Notifications::battleRegion(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $region);

    Cards::setUsed($card['id'], 1);
    // if not bonus action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card)) {
      Globals::incRemainingActions(-1);
    }

    $side = $this->wakhanGetRedArrowValue();
    $targetedPlayerId = $side === TOP_LEFT ? PaxPamirPlayers::getPrevId(WAKHAN_PLAYER_ID) : PaxPamirPlayers::getNextId(WAKHAN_PLAYER_ID);
    $targetedPlayerLoyalty = PaxPamirPlayers::get($targetedPlayerId)->getLoyalty();

    $targetOrder = array_merge(
      $this->wakhanBattlePrioritizeCylinders($data['enemyPieces']['tribes'], $targetedPlayerId),
      $this->wakhanBattlePrioritizeBlocks($data['enemyPieces']['armies'], $targetedPlayerLoyalty),
      $this->wakhanBattlePrioritizeBlocks($data['enemyPieces']['roads'], $targetedPlayerLoyalty),
    );

    $numberOfLoyalPieces = $data['loyalArmyCount'];
    $numberOfPiecesToRemove = min($numberOfLoyalPieces, $card['rank']);

    $playersWithRemovedCylinders = [];
    for ($i = 0; $i < $numberOfPiecesToRemove; $i++) {
      if (!isset($targetOrder[$i])) {
        continue;
      }

      $piece = $targetOrder[$i];
      if (Utils::isCylinder($piece['id'])) {
        $this->wakhanReturnCylinder($piece, $data['region']);

        $cylinderOwnerPlayerId = Utils::getPlayerIdForCylinderId($piece['id']);
        if (!in_array($cylinderOwnerPlayerId, $playersWithRemovedCylinders)) {
          $playersWithRemovedCylinders[] = $cylinderOwnerPlayerId;
        }
      } else {
        $this->wakhanReturnCoalitionBlock($piece);
      }
    }

    Map::checkRulerChange($data['region']);

    $extraActions = [];
    foreach ($playersWithRemovedCylinders as $index => $playerId) {
      $extraActions[] = ActionStack::createAction(DISPATCH_OVERTHROW_TRIBE, $playerId, [
        'region' => $data['region']
      ]);
    }
    if (count($extraActions) > 0) {
      ActionStack::push($extraActions);
    }
  }

  function wakhanGetRegionToBattle($regionOrder)
  {
    foreach ($regionOrder as $index => $region) {
      $wakhanLoyalArmyCount = $this->wakhanLoyalArmyCount($region);
      if ($wakhanLoyalArmyCount === 0) {
        continue;
      }

      $enemyPieces = $this->wakhanGetEnemyPiecesInRegion($region);

      if ($enemyPieces['count'] === 0) {
        continue;
      }

      return [
        'enemyPieces' => $enemyPieces,
        'loyalArmyCount' => $wakhanLoyalArmyCount,
        'region' => $region,
      ];
    }
    return null;
  }

  function wakhanLoyalArmyCount($region)
  {
    $pragmaticLoyalty = Wakhan::getPragmaticLoyalty();
    $armies = Tokens::getInLocation(Locations::armies($region))->toArray();
    $count = count(Utils::filter($armies, function ($army) use ($pragmaticLoyalty) {
      return explode('_', $army['id'])[1] === $pragmaticLoyalty;
    }));
    if (Events::isNationalismActive(WAKHAN_PLAYER_ID)) {
      $count += count(Map::getPlayerTribesInRegion($region, WAKHAN_PLAYER_ID));
    }
    return $count;
  }

  function wakhanGetEnemyPiecesInRegion($region)
  {
    $armies = $this->wakhanGetEnemyArmies($region);
    $roads = $this->wakhanGetEnemyRoads($region);
    $tribes = $this->wakhanGetEnemyTribes($region);

    return [
      'armies' => $armies,
      'roads' => $roads,
      'tribes' => $tribes,
      'count' => count($armies) + count($roads) + count($tribes)
    ];
  }

  function wakhanGetEnemyArmies($region)
  {
    $otherPlayerLoyalties = Wakhan::getOtherPlayerLoyalties();

    $armies = Tokens::getInLocation(Locations::armies($region))->toArray();
    $armiesLoyalToOtherPlayer = Utils::filter($armies, function ($army) use ($otherPlayerLoyalties) {
      return in_array(explode('_', $army['id'])[1], $otherPlayerLoyalties);
    });

    return $armiesLoyalToOtherPlayer;
  }

  function wakhanGetEnemyRoads($region)
  {
    $otherPlayerLoyalties = Wakhan::getOtherPlayerLoyalties();
    $borders = $this->regions[$region]['borders'];

    $roads = array_merge(...array_map(function ($border) {
      return Tokens::getInLocation(Locations::roads($border))->toArray();
    }, $borders));
    $roadsLoyalToOtherPlayer = Utils::filter($roads, function ($road) use ($otherPlayerLoyalties) {
      return in_array(explode('_', $road['id'])[1], $otherPlayerLoyalties);
    });

    return $roadsLoyalToOtherPlayer;
  }

  function wakhanGetEnemyTribes($region)
  {
    $citadelKabulLocation = Cards::get(SA_CITADEL_KABUL_CARD_ID)['location'];
    $citadelTranscaspiaLocation = Cards::get(SA_CITADEL_TRANSCASPIA_CARD_ID)['location'];

    $tribes = Tokens::getInLocation(Locations::tribes($region))->toArray();
    $otherPlayerTribes = Utils::filter($tribes, function ($tribe) use ($region, $citadelKabulLocation, $citadelTranscaspiaLocation) {
      $playerId = intval(explode('_', $tribe['id'])[1]);
      if ($playerId === WAKHAN_PLAYER_ID) {
        return false;
      }
      if ($region === KABUL && $citadelKabulLocation === Locations::court($playerId)) {
        return false;
      }
      if ($region === TRANSCASPIA && $citadelTranscaspiaLocation === Locations::court($playerId)) {
        return false;
      }
      return true;
    });
    return $otherPlayerTribes;
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanBattlePrioritizeCylinders($cylinders, $prioritizedPlayerId)
  {
    usort($cylinders, function ($a, $b) use ($prioritizedPlayerId) {
      $playerIdA = Utils::getPlayerIdForCylinderId($a['id']);
      $playerIdB = Utils::getPlayerIdForCylinderId($b['id']);
      $compareValueA = $playerIdA === $prioritizedPlayerId ? 1 : 0;
      $compareValueB = $playerIdB === $prioritizedPlayerId ? 1 : 0;
      return $compareValueB - $compareValueA;
    });
    return $cylinders;
  }

  function wakhanBattlePrioritizeBlocks($blocks, $prioritizedLoyalty)
  {
    usort($blocks, function ($a, $b) use ($prioritizedLoyalty) {
      $coalitionA = Utils::getCoalitionForBlockId($a['id']);
      $coalitionB = Utils::getCoalitionForBlockId($b['id']);
      $compareValueA = $coalitionA === $prioritizedLoyalty ? 1 : 0;
      $compareValueB = $coalitionB === $prioritizedLoyalty ? 1 : 0;
      return $compareValueB - $compareValueA;
    });
    return $blocks;
  }

  function wakhanReturnCoalitionBlock($block)
  {
    $blockId = $block['id'];
    $from = $block['location'];
    $coalition = explode('_', $blockId)[1];
    $to = implode('_', ['blocks', $coalition]);
    $logTokenType = Utils::startsWith($from, "armies") ? 'army' : 'road';
    $logTokenData = $coalition;

    $state = Tokens::insertOnTop($blockId, $to);
    Notifications::returnCoalitionBlock(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $logTokenType, $logTokenData, $from, $blockId, $state);
  }

  function wakhanReturnCylinder($cylinder, $battleLocation)
  {
    $cylinderId = $cylinder['id'];
    $cylinderOwnerPlayerId = Utils::getPlayerIdForCylinderId($cylinderId);
    $to = implode('_', ['cylinders', $cylinderOwnerPlayerId]);
    $state = Tokens::insertOnTop($cylinderId, $to);
    Notifications::returnCylinder(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $cylinderOwnerPlayerId, $battleLocation, $cylinderId, $state);
  }
}
