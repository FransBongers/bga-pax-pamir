<?php

namespace PaxPamir\States;

use JetBrains\PhpStorm\NoReturn;
use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\DominanceCheck;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Wakhan;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;
use PaxPamir\Models\PaxPamirPlayer;

trait WakhanActionWithInstructionsTrait
{

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

  /**
   * wakhan_card_1
   * If military cards are favored, radicalize the highest ranked military card.
   */
  function wakhanIfMilitaryFavoredRadicalizeHighestRankedMilitary()
  {
    if (Globals::getFavoredSuit() !== MILITARY) {
      Wakhan::actionNotValid();
      return;
    }
    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $card = $this->wakhanGetHighestRankedCardOfSuit($availableCards, MILITARY);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }

    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * wakhan_card_2
   * If political cards are favored, radicalize the highest ranked economic card.
   */
  function wakhanIfPoliticalFavoredRadicalizeHighestRankedEconomic()
  {
    if (Globals::getFavoredSuit() !== POLITICAL) {
      Wakhan::actionNotValid();
      return;
    }
    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $card = $this->wakhanGetHighestRankedCardOfSuit($availableCards, ECONOMIC);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }

    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * wakhan_card_2, wakhan_card_3
   * If political cards are favored, radicalize the highest ranked economic card.
   */
  function wakhanRadicalizeHighestRankedOfSuit($suit)
  {
    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $card = $this->wakhanGetHighestRankedCardOfSuit($availableCards, $suit);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }

    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * wakhan_card_4
   * If Wakhan has fewer than 2 Rupees, radicalize the card that will net the most rupees
   */
  function wakhanIfFewerThan2RupeesRadicalizeMostNetRupees()
  {
    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $rupees = $wakhanPlayer->getRupees();
    Notifications::log('rupees',$rupees);
    if ($rupees >= 2) {
      Wakhan::actionNotValid();
      return;
    }

    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $selectedCard = $this->selectCardThatWouldNetMostRupees($availableCards);

    if ($selectedCard === null || $selectedCard['netRupees'] <= 0) {
      Wakhan::actionNotValid();
      return;
    }

    $this->wakhanResolveRadicalizeCard($selectedCard);
  }

  /**
   * * wakhan_card_5
   * Radicalize a card that will gain Wakhan control of a region
   */
  function wakhanRadicalizeCardThatGivesControlOfARegion()
  {
    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $rulers = Globals::getRulers();
    $wakhanLoyalty = Wakhan::getPragmaticLoyalty();

    $cardsThatGainWakhanControlOfARegion = Utils::filter($availableCards, function ($card) use ($rulers, $wakhanLoyalty) {
      $region = $card['region'];
      // Wakhan already rules the region
      if ($rulers[$region] === WAKHAN_PLAYER_ID) {
        return false;
      }
      $tribesToAdd = [];
      $armiesToAdd = [];
      foreach ($card['impactIcons'] as $index => $icon) {
        if ($icon === ARMY) {
          $block = Wakhan::getCoalitionBlockToPlace($wakhanLoyalty, $armiesToAdd);
          $armiesToAdd[] = $block['id'];
        } else if ($icon === TRIBE) {
          $cylinder = Wakhan::getCylinderToPlace($tribesToAdd);
          $tribesToAdd[] = $cylinder['id'];
        }
      }
      $ruler = Map::determineRuler($region, [], $armiesToAdd, $tribesToAdd);
      if ($ruler === WAKHAN_PLAYER_ID) {
        return true;
      }
      return false;
    });

    $card = Wakhan::getCheapestThenHighestCardNumber($cardsThatGainWakhanControlOfARegion);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }

    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * * wakhan_card_6
   * Radicalize an intelligence card
   */
  function wakhanRadicalizeCardOfSuit($suit)
  {
    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $cardsOfSuit = Utils::filter($availableCards, function ($card) use ($suit) {
      return $card['suit'] === $suit;
    });

    $card = Wakhan::getCheapestThenHighestCardNumber($cardsOfSuit);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }

    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * * wakhan_card_9
   * Radicalize the card that would place most armies and/or roads
   */
  function wakhanRadicalizeCardThatWouldPlaceMostBlocks()
  {
    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $cardsThatWouldPlaceMostBlocks = Wakhan::getCourtCardsThatWouldPlaceMostBlocks($availableCards);

    $card = Wakhan::getCheapestThenHighestCardNumber($cardsThatWouldPlaceMostBlocks);
    $numberOfBlocksPlaced = Utils::getImpactIconCount($card, [ARMY, ROAD]);
    if ($card === null || $numberOfBlocksPlaced === 0) {
      Wakhan::actionNotValid();
      return;
    }
    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * * wakhan_card_11, wakhan_card_13, wakhan_card_16
   * If no coalition has dominance, radicalize the card that would place the most spies and/or tribes
   */
  function wakhanRadicalizeIfNoDominantCoalitionCardThatWouldPlaceMostCylinders()
  {
    $dominantCoalition = DominanceCheck::getDominantCoalition();

    if ($dominantCoalition !== null) {
      Wakhan::actionNotValid();
      return;
    }

    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $cardsThatWouldPlaceMostCylinders = Wakhan::getCourtCardsThatWouldPlaceMostCylinders($availableCards);

    $card = Wakhan::getCheapestThenHighestCardNumber($cardsThatWouldPlaceMostCylinders);
    $numberOfCylindersPlaced = Utils::getImpactIconCount($card, [SPY, TRIBE]);
    if ($card === null || $numberOfCylindersPlaced === 0) {
      Wakhan::actionNotValid();
      return;
    }
    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * wakhan_card_10
   * If Wakhan has no card with the move action, radicalize a card with the move action
   */
  function wakhanRadicalizeIfNoCardWithMoveCardWithMove()
  {
    $courtCards = PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getCourtCards();

    $hasCardsWithMoveAction = Utils::array_some($courtCards, function ($card) {
      return in_array(MOVE, array_keys($card['actions']));
    });

    if ($hasCardsWithMoveAction) {
      Wakhan::actionNotValid();
      return;
    }

    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $cardsWithMoveAction = Utils::filter($availableCards, function ($card) {
      return in_array(MOVE, array_keys($card['actions']));
    });

    $card = Wakhan::getCheapestThenHighestCardNumber($cardsWithMoveAction);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }
    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * wakhan_card_13
   * If a coalition has dominance radicalize a matching patriot
   */
  function wakhanRadicalizeIfDominantCoalitionMatchingPatriot()
  {
    $dominantCoalition = DominanceCheck::getDominantCoalition();

    if ($dominantCoalition === null) {
      Wakhan::actionNotValid();
      return;
    }

    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $cardsWithMatchingPatriot = Utils::filter($availableCards, function ($card) use ($dominantCoalition) {
      return $card['loyalty'] === $dominantCoalition;
    });

    $card = Wakhan::getCheapestThenHighestCardNumber($cardsWithMatchingPatriot);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }
    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * wakhan_card_17
   * 'If Wakhan\'s court size is at its limit, radicalize the highest ranked political card'
   */
  function wakhanRadicalizeIfCourtSizeAtLimitHighestRankedPolitical()
  {
    $courtCards = Wakhan::getCourtCards();
    $courtLimit = 3 + PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getSuitTotals()['political'];
    if (count($courtCards) < $courtLimit) {
      Wakhan::actionNotValid();
      return;
    }

    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $card = $this->wakhanGetHighestRankedCardOfSuit($availableCards, POLITICAL);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }
    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * wakhan_card_24
   * If Wakhan has fewer spies than another player then radicalize the highest ranked intelligence card
   */
  function wakhanRadicalizeIfFewerSpiesThanAnotherPlayerHighestRankedIntelligence()
  {
    $spies = Tokens::getOfTypeInLocation('cylinder', 'spies');
    $players = PaxPamirPlayers::getAll();

    // Determine number of spies per player
    $spyCountPerPlayer = [];
    foreach ($players as $playerId => $player) {
      $count = count(Utils::filter($spies, function ($cylinder) use ($playerId) {
        return Utils::getPlayerIdForCylinderId($cylinder['id']) === $playerId;
      }));
      $spyCountPerPlayer[$playerId] = $count;
    }

    $max = max(array_values($spyCountPerPlayer));
    if ($max <= $spyCountPerPlayer[WAKHAN_PLAYER_ID]) {
      Wakhan::actionNotValid();
      return;
    }

    $availableCards = Wakhan::getCourtCardsWakhanCanPurchase();

    $card = $this->wakhanGetHighestRankedCardOfSuit($availableCards, INTELLIGENCE);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }
    $this->wakhanResolveRadicalizeCard($card);
  }

  /**
   * wakhan_card_14, wakhan_card_16, wakhan_card_22, wakhan_card_24
   * Battle on the highest priority court card with the most spies where Wakhan also has at least one spy
   */
  function battleHighestPriorityCourtCardWithMostSpiesWhereWakhanHasSpy()
  {
    $cardToPerformActionWith = $this->wakhanGetCourtCardToPerformAction(BATTLE);

    if ($cardToPerformActionWith === null) {
      Wakhan::actionNotValid();
      return false;
    }

    $spies = Tokens::getOfTypeInLocation('cylinder', 'spies');
    if (count($spies) === 0) {
      Wakhan::actionNotValid();
      return;
    }
    $courtCards = PaxPamirPlayers::getAllCourtCardsOrdered();

    $courtCardsWithWakhanAndEnemySpies = [];

    foreach ($courtCards as $index => $card) {
      $wakhanSpyCount = $this->getLoyalSpyCount(WAKHAN_PLAYER_ID, $card['id']);
      if ($wakhanSpyCount === 0) {
        continue;
      }
      $enemySpyCount = count($this->getEnemySpiesOnCard(WAKHAN_PLAYER_ID, $card['id']));
      if ($enemySpyCount === 0) {
        continue;
      }
      $card['spyCount'] = $wakhanSpyCount + $enemySpyCount;
      $courtCardsWithWakhanAndEnemySpies[] = $card;
    }

    if (count($courtCardsWithWakhanAndEnemySpies) === 0) {
      Wakhan::actionNotValid();
      return;
    }

    $maxSpyCount = max(array_map(function ($card) {
      return $card['spyCount'];
    }, $courtCardsWithWakhanAndEnemySpies));

    $cardsWithMaxSpyCount = Utils::filter($courtCardsWithWakhanAndEnemySpies, function ($card) use ($maxSpyCount) {
      return $card['spyCount'] === $maxSpyCount;
    });

    $cardToBattleOn = Wakhan::selectHighestPriorityCard($cardsWithMaxSpyCount);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }

    Wakhan::actionValid();
    $this->wakhanPayHostageBribeIfNeeded($cardToPerformActionWith, BATTLE);
    $this->wakhanResolveBattleOnCourtCard($cardToPerformActionWith, $cardToBattleOn);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function selectCardThatWouldNetMostRupees($availableCards)
  {
    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);

    $cardsWithNetRupees = array_map(function ($card) use ($wakhanPlayer) {
      $card['netRupees'] = $this->getNetRupeesForMarketCard($card, $wakhanPlayer);
      return $card;
    }, $availableCards);

    $maxGain = max(array_map(function ($card) {
      return $card['netRupees'];
    }, $cardsWithNetRupees));

    $potentialCards = Utils::filter($cardsWithNetRupees, function ($card) use ($maxGain) {
      return $card['netRupees'] === $maxGain;
    });
    $selectedCard = Wakhan::getCheapestThenHighestCardNumber($potentialCards);
    return $selectedCard;
  }

  // Net rupees is rupees on card minus cost + leverage
  function getNetRupeesForMarketCard($card, $player)
  {
    $cost = Utils::getCardCost($player, $card);
    $row = explode('_', $card['location'])[1];
    $column = explode('_', $card['location'])[2];
    $receivedRupees = count(Tokens::getInLocation(Locations::marketRupees($row, $column)));
    $leverageGain = in_array(LEVERAGE, $card['impactIcons']) ? 2 : 0;
    return $receivedRupees - $cost + $leverageGain;
  }

  function wakhanGetHighestRankedCardOfSuit($cards, $suit)
  {
    $cardsOfSuit = Utils::filter($cards, function ($card) use ($suit) {
      return $card['suit'] === $suit;
    });
    if (count($cardsOfSuit) === 0) {
      return null;
    }

    $maxRank = max(array_map(function ($card) {
      return $card['rank'];
    }, $cardsOfSuit));

    return Wakhan::getCheapestThenHighestCardNumber(Utils::filter($cardsOfSuit, function ($card) use ($maxRank) {
      return $card['rank'] === $maxRank;
    }));
  }
}
