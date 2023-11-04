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

trait WakhanRadicalizeTrait
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

  // Used when Wakhan gets cards from OtherPersuasiveMethods events
  function wakhanPlayCardsFromHand()
  {
    $handCards = PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getHandCards();
    if (count($handCards) === 0) {
      return;
    }

    shuffle($handCards);

    $back = WakhanCards::getTopOf(DECK)['back'];
    $front = WakhanCards::getTopOf(DISCARD)['front'];

    foreach ($handCards as $index => $card) {
      $bribe = $this->determineBribe($card, PaxPamirPlayers::get(WAKHAN_PLAYER_ID), null, 'playCard');

      if ($bribe !== null && $bribe['amount'] > PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees()) {
        Cards::insertOnTop($card['id'], DISCARD);
        Notifications::discardMessage($card, PaxPamirPlayers::get(WAKHAN_PLAYER_ID), HAND, null);
        Notifications::discard($card, PaxPamirPlayers::get(WAKHAN_PLAYER_ID), HAND, DISCARD);
        return;
      } else if ($bribe !== null) {
        $this->payBribe(WAKHAN_PLAYER_ID, $bribe['bribeeId'], $bribe['amount']);
      }
      // Play card to court and resolve impact icons
      $side = $back['rowSide'][$front['rowSideArrow']] === TOP_LEFT ? 'left' : 'right';
      $firstCard = $this->moveCardToCourt(WAKHAN_PLAYER_ID, $card['id'], $side);
      // Get card data again to have up to date state
      $card = Cards::get($card['id']);

      Notifications::playCard($card, $firstCard, $side, WAKHAN_PLAYER_ID);
      $this->wakhanResolveImpactIcons($card);
    }
  }

  function wakhanRadicalize($deckCard, $discardCard)
  {
    $back = $deckCard['back'];
    $front = $discardCard['front'];
    $marketHasDominanceCheck = $this->marketHasDominanceCheck();
    $card = $marketHasDominanceCheck ? $this->radicalizeSelectCardDominanceCheckInMarket() : $this->radicalizeSelectCard($back, $front);

    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }
    $this->wakhanResolveRadicalizeCard($card);
  }

  function wakhanResolveRadicalizeCard($card)
  {
    $row = explode('_', $card['location'])[1];
    $column = explode('_', $card['location'])[2];
    $cost = Utils::getCardCost(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $card);

    Wakhan::actionValid();

    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, -$cost);
    Globals::incRemainingActions(-1);

    $rupeesOnCards = $this->putRupeesOnCards($cost, $row, $column);

    // add all rupees on card to player totals. Then put them in rupee_pool location

    $receivedRupees = count(Tokens::getInLocation(Locations::marketRupees($row, $column)));
    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, $receivedRupees);
    Tokens::moveAllInLocation(Locations::marketRupees($row, $column), RUPEE_SUPPLY);

    if ($card['type'] === EVENT_CARD) {
      $newLocation = Events::getPurchasedEventLocation($card['purchased']['effect'], WAKHAN_PLAYER_ID);
      Cards::insertOnTop($card['id'], $newLocation);
      // Execute event / move to player events
      Notifications::wakhanRadicalize($card, 'eventCard', null, $rupeesOnCards, $receivedRupees, Locations::market($row, $column), $newLocation);
      $this->wakhanResolvePurchasedEventEffect($card);
      return;
    }
    // Court Card

    $bribe = $this->determineBribe($card, PaxPamirPlayers::get(WAKHAN_PLAYER_ID), null, 'playCard');

    if ($bribe !== null && $bribe['amount'] > PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees()) {
      Cards::insertOnTop($card['id'], DISCARD);
      Notifications::wakhanRadicalizeDiscard($card, $rupeesOnCards, $receivedRupees, Locations::market($row, $column), DISCARD);
      return;
    } else if ($bribe !== null) {
      $this->payBribe(WAKHAN_PLAYER_ID, $bribe['bribeeId'], $bribe['amount']);
    }

    // Play card to court and resolve impact icons
    // $side = $this->wakhanGetRedArrowValue();
    $side = $this->wakhanGetRedArrowValue() === TOP_LEFT ? 'left' : 'right';
    $firstCard = $this->moveCardToCourt(WAKHAN_PLAYER_ID, $card['id'], $side);
    // Get card data again to have up to date state
    $card = Cards::get($card['id']);
    $type = $firstCard ? 'firstCourtCard' : 'courtCard';
    Notifications::wakhanRadicalize($card, $type, $side, $rupeesOnCards, $receivedRupees, Locations::market($row, $column), Locations::court(WAKHAN_PLAYER_ID));
    $this->wakhanResolveImpactIcons($card);
  }

  function wakhanCheckForSavvyPurchasingAndReturn($selectedCard)
  {
    if (!Globals::getWakhanVariantSavvyPurchasing() || $selectedCard === null || $selectedCard['type'] === EVENT_CARD) {
      return $selectedCard;
    }
    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $selectedCardCost = Utils::getCardCost($wakhanPlayer, $selectedCard);
    $availbleCards = Wakhan::getCourtCardsWakhanCanPurchase();

    // cheaper card of same suit and equal or higher rank
    $alternativeCards = [];

    foreach ($availbleCards as $index => $card) {
      $cost = Utils::getCardCost($wakhanPlayer, $card);
      $cardIsCheaper = $cost  < $selectedCardCost;
      $sameSuit = $card['suit'] === $selectedCard['suit'];
      $equalOrHigherRank = $card['rank'] >= $selectedCard['rank'];
      if (!($cardIsCheaper && $sameSuit && $equalOrHigherRank)) {
        continue;
      }
      $card['cost'] = $cost;
      $alternativeCards[] = $card;
    }

    if (count($alternativeCards) === 0) {
      return $selectedCard;
    }

    $lowestCost = min(array_map(function ($card) {
      return $card['cost'];
    }, $alternativeCards));

    $cardsWithLowestCost = Utils::filter($alternativeCards, function ($card) use ($lowestCost) {
      return $card['cost'] === $lowestCost;
    });

    usort($cardsWithLowestCost, function ($a, $b) {
      $costDifference = $a['cost'] - $b['cost'];
      if ($costDifference !== 0) {
        return $costDifference;
      }
      $columnNumberDifference = intval(explode('_', $a['location'])[2]) - intval(explode('_', $b['location'])[2]);
      if ($columnNumberDifference !== 0) {
        return $columnNumberDifference;
      }
      $redArrow = $this->wakhanGetRedArrowValue();
      $aRow = intval(explode('_', $a['location'])[1]);
      $bRow = intval(explode('_', $b['location'])[1]);
      $bInRedArrowRow = ($redArrow === BOTTOM_RIGHT && $bRow === 1) || ($redArrow === TOP_LEFT && $bRow === 0) ? 1 : 0;
      $aInRedArrowRow = ($redArrow === BOTTOM_RIGHT && $aRow === 1) || ($redArrow === TOP_LEFT && $aRow === 0) ? 1 : 0;
      return $bInRedArrowRow - $aInRedArrowRow;
    });

    return $cardsWithLowestCost[0];
  }

  function radicalizeSelectCard($back, $front)
  {
    $row = $back['rowSide'][$front['rowSideArrow']] === TOP_LEFT ? 0 : 1;
    $column = $back['columnNumbers'][$front['columnArrow']];

    // Get card from row specified by card
    $card = $this->radicalizeSelectCardInRow($row, $column, PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees());
    if ($card !== null) {
      return $this->wakhanCheckForSavvyPurchasingAndReturn($card);
    }
    // If no card was available in specified row, try again with other row
    $card = $this->radicalizeSelectCardInRow($row === 0 ? 1 : 0, $column, PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees());

    return $this->wakhanCheckForSavvyPurchasingAndReturn($card);
  }

  function radicalizeSelectCardInRow($row, $startColumn, $wakhanRupees)
  {
    for ($column = $startColumn; $column >= 0; $column--) {
      $courtCard = Cards::getInLocation(Locations::market($row, $column))->first();
      if ($courtCard === null || ($courtCard['type'] === EVENT_CARD && $courtCard['purchased']['effect'] === ECE_PUBLIC_WITHDRAWAL)) {
        continue;
      }

      $cost = Utils::getCardCost(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $courtCard);
      // Card is valid for purchase if it is not a dominance check, has not had rupees placed on it, and Wakhan has enough rupees
      if ($courtCard['used'] === 0 && !$this->isDominanceCheck($courtCard) && $cost <= $wakhanRupees) {
        return $courtCard;
      }
    }
    return null;
  }

  function radicalizeSelectCardDominanceCheckInMarket()
  {
    // Get all court cards that Wakhan can afford and have not been used yet
    $courtCardsInMarket = Wakhan::getCourtCardsWakhanCanPurchase();
    if (count($courtCardsInMarket) === 0) {
      return null;
    }

    $dominantCoalition = $this->getDominantCoalition();

    if ($dominantCoalition !== null) {
      /**
       * 1. cheapest Patriot loyal to dominant coalition
       * 2. Cheapest card with most Army + Road impact icons
       * Tie breaker: Highest card number
       */
      $patriot = $this->wakhanRadicalizeGetLoyalPatriot($courtCardsInMarket, $dominantCoalition);
      if ($patriot !== null) {
        return $patriot;
      }
      return $this->wakhanRadicalizeGetCardWithMostBlocks($courtCardsInMarket);
    } else {
      /**
       * 1. Most spy / tribe impact icons
       * 2. Highest card number
       */
      return $this->wakhanRadicalizeGetCardWithMostCylinders($courtCardsInMarket);
    }
    return null;
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanRadicalizeGetLoyalPatriot($courtCardsInMarket, $dominantCoalition)
  {
    $patriots = Utils::filter($courtCardsInMarket, function ($card) use ($dominantCoalition) {

      $cardIsLoyalToDominantCoalition = $card['loyalty'] === $dominantCoalition;

      return $cardIsLoyalToDominantCoalition;
    });
    return Wakhan::getCheapestThenHighestCardNumber($patriots);
  }

  function wakhanRadicalizeGetCardWithMostBlocks($courtCardsInMarket)
  {
    $cardsThatPlaceMostBlocks = Wakhan::getCourtCardsThatWouldPlaceMostBlocks($courtCardsInMarket);
    return Wakhan::getCheapestThenHighestCardNumber($cardsThatPlaceMostBlocks);
  }

  /**
   * If there is a Dominance Check in the market and no coalition is dominant but Wakhan cannot purchase a card with any Spies/Tribes, what does she do? She will purchase the card in the 0 spot with the highest card number. 
   * Savvy Purchasing Variant: instead, purchase the card that will net her the most coins; only then use the cheapest card with the highest card number as the fallback tie-breaker.
   */
  function wakhanRadicalizeGetCardWithMostCylinders($courtCardsInMarket)
  {
    $cardsThatPlaceMostCylinders = Wakhan::getCourtCardsThatWouldPlaceMostCylinders($courtCardsInMarket);

    if (Globals::getWakhanVariantSavvyPurchasing() && Utils::getImpactIconCount($cardsThatPlaceMostCylinders[0], [TRIBE, SPY]) === 0) {
      return $this->selectCardThatWouldNetMostRupees($courtCardsInMarket);
    }

    return Wakhan::getCheapestThenHighestCardNumber($cardsThatPlaceMostCylinders);
  }

  function wakhanResolvePurchasedEventEffect($card)
  {
    $event = $card['purchased']['effect'];
    $playerId = WAKHAN_PLAYER_ID;
    switch ($event) {
      case ECE_DOMINANCE_CHECK:
        ActionStack::push(ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_SETUP, $playerId, [
          'cards' => [$card['id']],
        ]));
        break;
      case ECE_KOH_I_NOOR_RECOVERED: // card_106
        Events::updateInfluence();
        break;
      case ECE_RUMOR: // card_108
        $this->wakhanResolveEventCardRumor();
        break;
      case ECE_BACKING_OF_PERSIAN_ARISTOCRACY: // card_113
        Events::backingOfPersianAristocracy($playerId);
        break;
      case ECE_OTHER_PERSUASIVE_METHODS: // card_114
        $this->wakhanResolveEventCardOtherPersuasiveMethods();
        break;

      case ECE_REBUKE: // card_116
        $this->wakhanResolveEventCardRebuke();
        break;
      case ECE_PASHTUNWALI_VALUES: // card_115 // Wakhan selects current favored suit so nothing happens
      case ECE_NEW_TACTICS: // card_105
      case ECE_COURTLY_MANNERS: // card_107
      case ECE_CONFLICT_FATIGUE: // card_109
      case ECE_NATIONALISM: // card_110
      case ECE_PUBLIC_WITHDRAWAL: // card_111

      default:
        break;
    }
  }

  // Switch all cards with player, then play them to court straight away
  function wakhanResolveEventCardOtherPersuasiveMethods()
  {
    // choose player based on red arrow
    $redArrow = $this->wakhanGetRedArrowValue();
    $playerId = $redArrow === TOP_LEFT ? PaxPamirPlayers::getPrevId(WAKHAN_PLAYER_ID) : PaxPamirPlayers::getNextId(WAKHAN_PLAYER_ID);
    $this->resolveEventCardOtherPersuasiveMethods(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), PaxPamirPlayers::get($playerId));
  }

  function wakhanResolveEventCardRebuke()
  {
    $regionId = WakhanCards::getTopOf(DISCARD)['front']['regionOrder'][0];
    $tribeResult = $this->resolveEventCardRebuke($regionId);
    Notifications::log('tribeResult', $tribeResult);
    if (count($tribeResult['actions']) > 0) {
      ActionStack::push($tribeResult['actions']);
    }
  }

  function wakhanResolveEventCardRumor()
  {
    // choose player based on red arrow
    $redArrow = $this->wakhanGetRedArrowValue();
    $playerId = $redArrow === TOP_LEFT ? PaxPamirPlayers::getPrevId(WAKHAN_PLAYER_ID) : PaxPamirPlayers::getNextId(WAKHAN_PLAYER_ID);
    $this->resolveEventCardRumor(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), PaxPamirPlayers::get($playerId));
  }
}
