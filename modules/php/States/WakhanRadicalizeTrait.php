<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
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
    
    foreach($handCards as $index => $card) {
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
      $this->wakhanResolveImpactIcons($card, $back, $front);
    }
  }

  function wakhanRadicalize($deckCard, $discardCard)
  {
    $back = $deckCard['back'];
    $front = $discardCard['front'];

    $result = $this->radicalizeSelectCard($back, $front);
    Notifications::log('radicalizeResult',$result);
    if ($result === null) {
      $this->wakhanActionNotValid();
      return;
    }
    $this->wakhanActionValid();
    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, -$result['cost']);
    Globals::incRemainingActions(-1);
    $card = $result['card'];
    $row = $result['row'];
    $column = $result['column'];
    $rupeesOnCards = $this->putRupeesOnCards($result['cost'], $row, $column);

    // add all rupees on card to player totals. Then put them in rupee_pool location

    $receivedRupees = count(Tokens::getInLocation(Locations::marketRupees($result['row'], $result['column'])));
    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, $receivedRupees);
    Tokens::moveAllInLocation(Locations::marketRupees($result['row'], $result['column']), RUPEE_SUPPLY);

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
    $side = $back['rowSide'][$front['rowSideArrow']] === TOP_LEFT ? 'left' : 'right';
    $firstCard = $this->moveCardToCourt(WAKHAN_PLAYER_ID, $card['id'], $side);
    // Get card data again to have up to date state
    $card = Cards::get($card['id']);
    $type = $firstCard ? 'firstCourtCard' : 'courtCard';
    Notifications::wakhanRadicalize($card, $type, $side, $rupeesOnCards, $receivedRupees, Locations::market($row, $column), Locations::court(WAKHAN_PLAYER_ID));
    $this->wakhanResolveImpactIcons($card, $back, $front);
  }

  function radicalizeSelectCard($back, $front)
  {
    $marketHasDominanceCheck = $this->marketHasDominanceCheck();
    if ($marketHasDominanceCheck) {
      // if dominant coalition: choose cheapest patriot loyal to dominant coalition, then cheapest card with mose army and or road impact icons
      // if no dominance coalition: cheapest card with most spy / tribe impact icons
      // in case of tie use highest card number
    }
    $row = $back['rowSide'][$front['rowSideArrow']] === TOP_LEFT ? 0 : 1;
    $column = $back['columnNumbers'][$front['columnArrow']];
    Notifications::log('radicalize', ['row' => $row, 'column' => $column]);

    // Get card from row specified by card
    $result = $this->radicalizeSelectCardInRow($row, $column, PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees());
    Notifications::log('radicalizeSelectCardInRowInitial', $result);
    if ($result !== null) {
      return $result;
    }
    // If no card was available in specified row, try again with other row
    $result = $this->radicalizeSelectCardInRow($row === 0 ? 1 : 0, $column, PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees());
    Notifications::log('radicalizeSelectCardInRowAlt', $result);
    return $result;
  }

  function radicalizeSelectCardInRow($row, $startColumn, $wakhanRupees)
  {
    $result = null;
    for ($column = $startColumn; $column >= 0; $column--) {
      $courtCard = Cards::getInLocation(Locations::market($row, $column))->first();
      if ($courtCard === null) {
        continue;
      }

      $cost = $this->getCardCost(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $column, $courtCard);
      // Card is valid for purchase if it is not a dominance check, has not had rupees placed on it, and Wakhan has enough rupees
      if ($courtCard['used'] === 0 && !$this->isDominanceCheck($courtCard) && $cost <= $wakhanRupees) {
        return [
          'card' => $courtCard,
          'column' => $column,
          'cost' => $cost,
          'row' => $row,
        ];
      }
    }
    return $result;
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanResolvePlayCard()
  {
    
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
    Notifications::log('tribeResult',$tribeResult);
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
