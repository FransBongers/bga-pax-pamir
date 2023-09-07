<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use Paxpamir\Managers\PaxPamirPlayers;
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
    self::checkAction('purchaseCard');

    $card = Cards::get($cardId);
    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();
    

    $checkData = $this->isValidPurchaseCard($player, $card);

    $cost = $checkData['cost'];
    $marketLocation = $checkData['marketLocation'];

    PaxPamirPlayers::incRupees($playerId, -$cost);
    Globals::incRemainingActions(-1);

    $rupeesOnCards = $this->putRupeesOnCards($cost,$checkData['row'],$checkData['column']);

    // add all rupees on card to player totals. Then put them in rupee_pool location
    $receivedRupees = count(Tokens::getInLocation([$marketLocation, 'rupees']));
    PaxPamirPlayers::incRupees($playerId, $receivedRupees);
    Tokens::moveAllInLocation([$marketLocation, 'rupees'], RUPEE_SUPPLY);

    $actionStack = [
      ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
        'transition' => 'playerActions',
      ]),
    ];


    // move card based on card type
    // TODO (event cards)
    $newLocation = 'hand_' . $playerId;
    if ($card['type'] === EVENT_CARD) {
      $newLocation = Events::getPurchasedEventLocation($card['purchased']['effect'], $playerId);
      $actionStack[] = ActionStack::createAction(DISPATCH_EVENT_RESOLVE_PURCHASED, $playerId, [
        'cardId' => $cardId,
        'event' => $card['purchased']['effect']
      ]);
    };
    Cards::insertOnTop($cardId, $newLocation);

    Notifications::purchaseCard($card, $marketLocation, $newLocation, $receivedRupees, $rupeesOnCards);

    ActionStack::set($actionStack);
    $this->nextState('dispatchAction');
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  function getCardCostBase()
  {
    return Globals::getFavoredSuit() === MILITARY ? 2 : 1;
  }

  function getCardCost($player, $column, $card)
  {
    if ($card['type'] === COURT_CARD && $card['region'] === HERAT && $player->hasSpecialAbility(SA_HERAT_INFLUENCE)) {
      return 0;
    };
    if ($card['type'] === COURT_CARD && $card['region'] === PERSIA && $player->hasSpecialAbility(SA_PERSIAN_INFLUENCE)) {
      return 0;
    };
    if ($card['type'] === COURT_CARD && $card['loyalty'] === RUSSIAN && $player->hasSpecialAbility(SA_RUSSIAN_INFLUENCE)) {
      return 0;
    };
    return $column * $this->getCardCostBase();
  }

  function isValidPurchaseCard($player, $card)
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
    $cost = $this->getCardCost($player, $column, $card);
    // Player should be able to afford card
    if ($cost > $player->getRupees()) {
      throw new \feException("Not enough rupees");
    }
    return [
      'row' => $row,
      'column' => $column,
      'cost' => $cost,
      'marketLocation' => $marketLocation,
    ];
  }

  function putRupeesOnCards($cost, $row, $column)
  {
    $rupeesOnCards = [];
    if ($cost === 0) {
      return $rupeesOnCards;
    }
    $baseCost = $this->getCardCostBase();
    $rowAlt = ($row == 0) ? 1 : 0;
    // Place rupees on market cards
    for ($i = $column - 1; $i >= 0; $i--) {
      $location = ['market', $row, $i];
      $marketCard = Cards::getInLocation($location)->first();
      // If location is empty put rupee(s) on the other row
      if ($marketCard === null) {
        $location[1] = $rowAlt;
        $marketCard = Cards::getInLocation($location)->first();
      }
      if ($marketCard !== null) {
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

    return $rupeesOnCards;
  }
}
