<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayerActionBattleTrait
{
  //  .########..##..........###....##....##.########.########.
  //  .##.....##.##.........##.##....##..##..##.......##.....##
  //  .##.....##.##........##...##....####...##.......##.....##
  //  .########..##.......##.....##....##....######...########.
  //  .##........##.......#########....##....##.......##...##..
  //  .##........##.......##.....##....##....##.......##....##.
  //  .##........########.##.....##....##....########.##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  /**
   * Perform battle in region or on court card
   */
  function battle($cardId, $location, $removedPieces, $offeredBribeAmount = null)
  {
    self::checkAction(BATTLE);

    $cardInfo = Cards::get($cardId);
    $isBattleInRegion = !Utils::startsWith($location, "card");

    $this->isValidCardAction($cardInfo, BATTLE);

    $player = Players::get();

    $resolved = $this->resolveBribe($cardInfo, $player, BATTLE, $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }

    // Should not remove more pieces than allowed by rank
    if (count($removedPieces) > $cardInfo['rank']) {
      throw new \feException("More pieces to remove than allowed by rank of card");
    }

    if ($isBattleInRegion) {
      $this->resolveBattleInRegion($cardInfo, $location, $removedPieces);
    } else {
      $this->resolveBattleOnCourtCard($cardInfo, $location, $removedPieces);
    }
  }



  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function resolveBattleInRegion($cardInfo, $location, $removedPieces)
  {
    Notifications::battleRegion($location);

    // All checks have been done. Execute battle
    Cards::setUsed($cardInfo['id'], 1);
    // if not bonus action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }


    $player = Players::get();
    $loyalty = $player->getLoyalty();
    $numberOfLoyalPieces = $this->getNumberOfLoyalArmies($player, $location);
    // Needs loyal pieces to remove enemy pieces
    // Notifications::log('battle debug', [$loyalPieces,$removedPieces]);
    if ($numberOfLoyalPieces < count($removedPieces)) {
      throw new \feException("Not enough loyal pieces");
    }

    $playersWithRemovedCylinders = [];

    // TODO: split below in two different funtions: remove cylinder / remove block
    foreach ($removedPieces as $index => $tokenId) {
      $splitTokenId = explode("_", $tokenId);
      $isCylinder = $splitTokenId[0] === "cylinder";
      $isBlock = $splitTokenId[0] === "block";
      // enemy pieces may not have the same loyalty
      if ($isBlock && $splitTokenId[1] === $loyalty) {
        throw new \feException("Piece to remove has same loyalty as active player");
      };
      if ($isCylinder && Players::get($splitTokenId[1])->getLoyalty() === $loyalty) {
        throw new \feException("Piece to remove has same loyalty as active player");
      };
      if ($location === KABUL && $isCylinder && Cards::get(SA_CITADEL_KABUL_CARD_ID)['location'] === Locations::court($splitTokenId[1])) {
        throw new \feException("Player has Citadel special ability");
      };
      if ($location === TRANSCASPIA && $isCylinder && Cards::get(SA_CITADEL_TRANSCASPIA_CARD_ID)['location'] === Locations::court($splitTokenId[1])) {
        throw new \feException("Player has Citadel special ability");
      };

      $tokenInfo = Tokens::get($tokenId);
      $tokenLocation = $tokenInfo['location'];
      $explodedTokenLocation = explode("_", $tokenLocation);

      // enemy pieces should be in location of battle
      if ((Utils::startsWith($tokenLocation, "armies") || Utils::startsWith($tokenLocation, "tribes")) && $explodedTokenLocation[1] !== $location) {
        throw new \feException("Piece is not in the same region as the battle");
      }
      if (Utils::startsWith($tokenLocation, "roads") && !in_array($location, $this->borders[$explodedTokenLocation[1] . '_' . $explodedTokenLocation[2]]['regions'])) {
        throw new \feException("Piece is not on a border connected to the region of the battle");
      }


      $from = $tokenInfo['location'];
      $to = '';
      $logTokenType = '';
      $logTokenData = '';
      if ($isBlock) {
        $to = implode('_', ['blocks', $splitTokenId[1]]);
        $logTokenData = $splitTokenId[1];
        if (Utils::startsWith($from, "armies")) {
          $logTokenType = 'army';
        }
        if (Utils::startsWith($from, "roads")) {
          $logTokenType = 'road';
        }
      };

      if ($isCylinder) {
        $cylinderOwnerPlayerId = intval($splitTokenId[1]);
        $to = implode('_', ['cylinders', $cylinderOwnerPlayerId]);
        $logTokenType = 'cylinder';
        $logTokenData = $cylinderOwnerPlayerId;

        if (!in_array($cylinderOwnerPlayerId, $playersWithRemovedCylinders)) {
          $playersWithRemovedCylinders[] = $cylinderOwnerPlayerId;
        }
      }
      $state = Tokens::insertOnTop($tokenId, $to);
      $message = clienttranslate('${player_name} removes ${logTokenRemoved}');


      Notifications::moveToken($message, [
        'player' => Players::get(),
        'logTokenRemoved' => implode(':', [$logTokenType, $logTokenData]),
        'moves' => [
          [
            'from' => $from,
            'to' => $to,
            'tokenId' => $tokenId,
            'weight' => $state,
          ]
        ]
      ]);
    };

    Map::checkRulerChange($location);

    if (count($playersWithRemovedCylinders) === 0) {
      $this->gamestate->nextState('playerActions');
      return;
    }

    $actions = [
      ActionStack::createAction(DISPATCH_TRANSITION, $player->getId(), [
        'transition' => 'playerActions'
      ])
    ];
    foreach ($playersWithRemovedCylinders as $index => $playerId) {
      $actions[] = ActionStack::createAction(DISPATCH_OVERTHROW_TRIBE, $playerId, [
        'region' => $location
      ]);
    }
    $this->pushActionsToActionStack($actions);
    $this->nextState('dispatchAction');
  }

  function resolveBattleOnCourtCard($cardInfo, $location, $removedPieces)
  {
    $player = Players::get();

    if ($this->getNumberLoyalSpies($player, $location) < count($removedPieces)) {
      throw new \feException("Not enough loyal pieces");
    }


    foreach ($removedPieces as $index => $tokenId) {
      $splitTokenId = explode("_", $tokenId);

      if (Players::get($splitTokenId[1])->hasSpecialAbility(SA_INDISPENSABLE_ADVISORS)) {
        throw new \feException("Player's spies can not be removed in battles with other spies");
      }
      $tokenInfo = Tokens::get($tokenId);
      $tokenLocation = $tokenInfo['location'];
      // enemy pieces should be in location of battle
      if (Utils::startsWith($tokenLocation, "spies") && $tokenInfo['location'] !== 'spies_' . $location) {
        throw new \feException("Piece is not on the same card as the battle");
      }
    };


    // All checks have been done. Execute battle

    Cards::setUsed($cardInfo['id'], 1);
    // if not bonus action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }
    Notifications::battleCard($location);

    $protectedBySafeHouse = [];
    $safeHouseOwners = $this->getSafeHouseOwners();

    foreach ($removedPieces as $index => $tokenId) {
      $splitTokenId = explode("_", $tokenId);
      $tokenInfo = Tokens::get($tokenId);
      $from = $tokenInfo['location'];

      $cylinderOwnerPlayerId = intval($splitTokenId[1]);
      $moves = [];
      if (in_array($cylinderOwnerPlayerId, $safeHouseOwners)) {
        $protectedBySafeHouse[$tokenId] = [
          'tokenId' => $tokenId,
          'playerId' => $cylinderOwnerPlayerId,
          'from' => $from,
        ];
      } else {
        $to = implode('_', ['cylinders', $cylinderOwnerPlayerId]);
        $state = Tokens::insertOnTop($tokenId, $to);
        $moves[] = [
          'from' => $from,
          'to' => $to,
          'tokenId' => $tokenId,
          'weight' => $state,
        ];
      };
      $message = clienttranslate('${player_name} removes ${logTokenRemoved}');
      Notifications::moveToken($message, [
        'player' => Players::get(),
        'logTokenRemoved' => Utils::logTokenCylinder($cylinderOwnerPlayerId),
        'moves' => $moves,
      ]);
    };

    if (count($protectedBySafeHouse) > 0) {
      ksort($protectedBySafeHouse);
      Globals::setSpecialAbilityData([
        'specialAbility' => SA_SAFE_HOUSE,
        'args' => [
          'activePlayerId' => $player->getId(),
          'cylinders' => array_values($protectedBySafeHouse),
        ],
      ]);
      $this->nextState('specialAbilitySafeHouse', array_values($protectedBySafeHouse)[0]['playerId']);
      // Notifications::log('result', array_values($protectedBySafeHouse)[0]['playerId']);
    } else {
      $this->gamestate->nextState('playerActions');
    }
  }

  function getSafeHouseOwners()
  {
    $owners = [];
    foreach (SA_SAFE_HOUSE_CARD_IDS as $index => $cardId) {
      $location = Cards::get($cardId)['location'];

      if (Utils::startsWith($location, 'court')) {
        $owners[] = intval(explode('_', $location)[1]);
      }
    }
    return $owners;
  }

  function getNumberOfLoyalArmies($player, $location)
  {
    $loyalty = $player->getLoyalty();
    $armiesInLocation = Tokens::getInLocation(['armies', $location])->toArray();
    $loyalArmies = array_values(array_filter($armiesInLocation, function ($army) use ($loyalty) {
      return explode("_", $army['id'])[1] === $loyalty;
    }));
    // $player = Players::get(); // to check: is there a reason we get $player again?
    $extraPiecesActive = 0;
    if (Events::isNationalismActive($player)) {
      $extraPiecesActive += count(Map::getPlayerTribesInRegion($location, $player));
    }

    return count($loyalArmies) + $extraPiecesActive;
  }

  function getNumberLoyalSpies($player, $location)
  {
    $playerId = $player->getId();
    $spiesOnCard = Tokens::getInLocation(['spies', $location])->toArray();
    $loyalSpies = array_values(array_filter($spiesOnCard, function ($cylinder) use ($playerId) {
      return intval(explode("_", $cylinder['id'])[1]) === $playerId;
    }));
    return count($loyalSpies);
  }
}
