<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PurchaseCardTrait
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
   * purchase card from market
   */
  function purchaseCard($cardId)
  {
    self::dump("purchaseCard", $cardId);
    self::checkAction('purchaseCard');


    $card = Cards::get($cardId);
    $player = Players::get();
    $playerId = $player->getId();
    $baseCost = Globals::getFavoredSuit() === MILITARY ? 2 : 1;

    $checkData = $this->isValidPurchaseCard($player, $card, $baseCost);
    $row = $checkData['row'];
    $column = $checkData['column'];
    $cost = $checkData['cost'];
    $rowAlt = $checkData['rowAlt'];
    $marketLocation = $checkData['marketLocation'];

    Players::incRupees($playerId, -$cost);
    Globals::incRemainingActions(-1);


    $rupeesOnCards = array();

    // Place rupees on market cards
    for ($i = $column - 1; $i >= 0; $i--) {
      $location = ['market', $row, $i];
      $marketCard = Cards::getInLocation($location)->first();
      // If location is empty put rupee(s) on the other row
      if ($marketCard == NULL) {
        $location[1] = $rowAlt;
        $marketCard = Cards::getInLocation($location)->first();
      }
      if ($marketCard !== NULL) {
        Cards::setUsed($marketCard["id"], 1); // set unavailable
        // Add rupees base on card cost (ie add two if favored suit is military)
        for ($j = 1; $j <= $baseCost; $j++) {
          $rupee = Tokens::getInLocation(RUPEE_SUPPLY)->first();
          Tokens::move($rupee['id'], [implode('_', $location), 'rupees']);
          $rupeesOnCards[] = array(
            'row' => $location[1],
            'column' => $i,
            'cardId' => $marketCard["id"],
            'rupeeId' => $rupee['id']
          );
        }
      }
    }

    // add all rupees on card to player totals. Then put them in rupee_pool location
    $receivedRupees = count(Tokens::getInLocation([$marketLocation, 'rupees']));
    Players::incRupees($playerId, $receivedRupees);
    Tokens::moveAllInLocation([$marketLocation, 'rupees'], RUPEE_SUPPLY);

    $isEventCard = $card['type'] == EVENT_CARD;
    // move card based on card type
    // TODO (event cards)
    $newLocation = 'hand_' . $playerId;
    if ($isEventCard) {
      $newLocation = Events::getPurchasedEventLocation($card['purchased']['effect'], $playerId);
    };
    Cards::move($cardId, $newLocation);

    Notifications::purchaseCard($card, $marketLocation, $newLocation, $receivedRupees, $rupeesOnCards);

    if ($isEventCard) {
      $this->resolvePurchasedEventEffect($card['purchased']['effect']);
    } else {
      $this->gamestate->nextState('playerActions');
    }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  function isValidPurchaseCard($player, $card, $baseCost)
  {
    // Player should have remaining actions
    if (Globals::getRemainingActions() <= 0) {
      throw new \feException("No remaining actions");
    }
    // Card should be available
    if ($card['used'] == 1) {
      throw new \feException("Card is unavailble");
    }
    if ($card['id'] == 'card_111') {
      throw new \feException("Not allowed to purchase Public Withdrawal");
    }
    // Card should be in the market
    if (!Utils::startsWith($card['location'], "market")) {
      throw new \feException("Card is not in the market");
    }
    $marketLocation = $card['location'];
    $explodedLocation = explode("_", $card['location']);
    $row = intval($explodedLocation[1]);
    $column = intval($explodedLocation[2]);
    $rowAlt = ($row == 0) ? 1 : 0;
    $cost = $column * $baseCost;
    // Player should be able to afford card
    if ($cost > $player->getRupees()) {
      throw new \feException("Not enough rupees");
    }
    return [
      'row' => $row,
      'column' => $column,
      'rowAlt' => $rowAlt,
      'cost' => $cost,
      'marketLocation' => $marketLocation,
    ];
  }

  function resolvePurchasedEventEffect($event)
  {
    switch ($event) {
      case ECE_DOMINANCE_CHECK:
        $this->gamestate->nextState('dominanceCheck');
        break;
      case ECE_NEW_TACTICS: // card_105
        $this->gamestate->nextState('playerActions');
        break;
      case ECE_KOH_I_NOOR_RECOVERED: // card_106
        $this->gamestate->nextState('playerActions');
        break;
      case ECE_COURTLY_MANNERS: // card_107
        $this->gamestate->nextState('playerActions');
        break;
      case ECE_RUMOR: // card_108
        Events::setCurrentEventGlobalState(ECE_RUMOR);
        $this->nextState("resolveEvent");
        break;
      case ECE_CONFLICT_FATIGUE: // card_109
        break;
      case ECE_NATIONALISM: // card_110
        break;
      case ECE_PUBLIC_WITHDRAWAL: // card_111
        $this->gamestate->nextState('playerActions');
        break;
      case ECE_NATION_BUILDING: // card_112
        $this->gamestate->nextState('playerActions');
        break;
      case ECE_BACKING_OF_PERSIAN_ARISTOCRACY: // card_113
        Events::backingOfPersianAristocracy();
        $this->gamestate->nextState('playerActions');
        break;
      case ECE_OTHER_PERSUASIVE_METHODS: // card_114
        Events::setCurrentEventGlobalState(ECE_OTHER_PERSUASIVE_METHODS);
        $this->nextState("resolveEvent");
        break;
      case ECE_PASHTUNWALI_VALUES: // card_115
        Events::setCurrentEventGlobalState(ECE_PASHTUNWALI_VALUES);
        $this->nextState("resolveEvent");
        break;
      case ECE_REBUKE: // card_116
        Events::setCurrentEventGlobalState(ECE_REBUKE);
        $this->nextState("resolveEvent");
        break;
      default:
        $this->gamestate->nextState('playerActions');
    }
  }
}
