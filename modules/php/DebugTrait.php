<?php

namespace PaxPamir;


use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Preferences;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\Players;
use PaxPamir\Models\PaxPamirPlayer;
use PaxPamir\Models\Player;

trait DebugTrait
{
  function debugSetupCourt()
  {
    $this->debugAddCardToCourt('card_32');
    $this->debugAddCardToCourt('card_19');
    $this->debugAddCardToCourt('card_27', '2371052');
    $this->debugAddCardToCourt('card_52', '2371052');
  }

  function debugSetupTokens()
  {
    // $this->debugCreateArmy(KABUL);

    // $this->debugCreateRoad('kabul_punjab');
    // $this->debugCreateSpy('card_32');
    // $this->debugCreateSpy('card_27');
    $this->debugCreateTribe(PUNJAB);
    $this->debugCreateTribe(PUNJAB);
    $this->debugCreateTribe(PUNJAB);
    $this->debugCreateTribe(PUNJAB);
    $this->debugCreateTribe(KABUL);
    $this->debugCreateTribe(KABUL);
    $this->debugCreateTribe(TRANSCASPIA);
    $this->debugCreateTribe(TRANSCASPIA);
    $this->debugCreateTribe(TRANSCASPIA);
    $this->debugCreateTribe(TRANSCASPIA);
  }

  function test()
  {
    
    // Notifications::log('loyalty',PaxPamirPlayers::get()->getLoyalty() === null);
    // Notifications::log('wakhan_enabled',Globals::getWakhanEnabled());
    // Notifications::log('next',PaxPamirPlayers::getPrevId(2371052));
    Notifications::log('order',PaxPamirPlayers::getPlayerOrder());
    
    
    // $openHandsGlobals = Globals::getOpenHands();
    // Notifications::log('openHands',$openHandsGlobals);
    // $openHands = $this->getGameOptionValue(OPTION_OPEN_HANDS);
    // Notifications::log('option open hands', $openHands);
    // Notifications::log('option open null', $openHands === null);
    // $discardPile = Cards::getInLocationOrdered(DISCARD)->toArray();
    // $discardPileCount = count($discardPile);


    // Notifications::log('discardPile', $discardPile);

    // Cards::move('card_35', 'deck');
    // Cards::move('card_71', 'deck');
    // Cards::move('card_6', 'deck');
    // Cards::move('card_81', 'deck');
    // Cards::move(ECE_CONFLICT_FATIGUE_CARD_ID, 'events_2371053');
    // Cards::move('card_101', 'market_0_0');
    // Cards::move('card_115', 'market_0_1');
    // Cards::move('card_116', 'market_0_2');
    // Cards::move('card_111', 'market_0_3');
    // Cards::move('card_19', 'prizes_2371053');


    // Cards::move('card_107',ACTIVE_EVENTS);

    // $this->dispatchRefillMarketDrawCards([]);

    // Notifications::log('getInLocation',Cards::getOfTypeInLocation('card','market'));
    // $this->debugAddCardToHand('card_1');
    // $this->debugAddCardToHand('card_2');
    // $this->debugAddCardToHand('card_3');
    // $this->debugAddCardToHand('card_4');
    // $actionStack = ActionStack::get();
    // Notifications::log('actions', $actionStack);
    // ActionStack::next($actionStack);

    // ActionStack::set([]);
    // $this->nextState('playerActions');
    // $this->pushActionsToActionStack([
    //   [
    //     'action' => 'discard',
    //     'data' => [
    //       'source' => 'hand',
    //     ],
    //   ],
    //   [
    //     'action' => 'discard',
    //     'data' => [
    //       'source' => 'court',
    //     ],
    //   ],
    // ]);
    // Notifications::log('actionStack', ActionStack::get());
    // $actionStack = ActionStack::get();
    // Notifications::log('actionStack before', $actionStack);
    // $action = array_pop($actionStack);
    // Notifications::log('action', $action);
    // Notifications::log('actionStack after', $actionStack);
  }

  function debugAddCardToCourt($cardId, $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? Players::get()->getId() : intval($playerId);
    Cards::move($cardId, ['court', $playerId]);
    // $this->reassignCourtState($playerId);
  }

  function debugAddCardToHand($cardId, $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? Players::get()->getId() : intval($playerId);
    Cards::move($cardId, ['hand', $playerId]);
  }

  function debugCreateArmy($region, $coalition = null)
  {
    $coalition = $coalition === null ? Players::get()->getLoyalty() : $coalition;
    if (!($this->regions[$region] && $this->loyalty[$coalition])) {
      return;
    }

    $location = $this->locations['pools'][$coalition];
    $army = Tokens::getTopOf($location);
    if ($army != null) {
      $to = $this->locations['armies'][$region];
      Tokens::move($army['id'], $this->locations['armies'][$region]);
      $message = clienttranslate('${player_name} places ${logTokenArmy} in ${logTokenRegionName}');
      Notifications::moveToken($message, [
        'player' => Players::get(),
        'logTokenArmy' => Utils::logTokenArmy($coalition),
        'logTokenRegionName' => Utils::logTokenRegionName($region),
        'move' => [
          'from' => $location,
          'to' => $to,
          'tokenId' => $army['id'],
        ]
      ]);
      Map::checkRulerChange($region);
    }
  }

  function debugCreateRoad($border, $coalition = null)
  {
    $coalition = $coalition === null ? Players::get()->getLoyalty() : $coalition;
    if (!($this->borders[$border] && $this->loyalty[$coalition])) {
      return;
    }
    $location = $this->locations['pools'][$coalition];
    $road = Tokens::getTopOf($location);
    if ($road != null) {
      $to = $this->locations['roads'][$border];
      $region0 = explode("_", $border)[0];
      $region1 = explode("_", $border)[1];
      Tokens::move($road['id'], $to);
      $message = clienttranslate('${player_name} places ${logTokenRoad} on the border between ${logTokenRegionName0} and ${logTokenRegionName1}');
      Notifications::moveToken($message, [
        'player' => Players::get(),
        'logTokenRoad' => Utils::logTokenRoad($coalition),
        'logTokenRegionName0' => Utils::logTokenRegionName($region0),
        'logTokenRegionName1' => Utils::logTokenRegionName($region1),
        'move' => [
          'from' => $location,
          'to' => $to,
          'tokenId' => $road['id'],
        ]
      ]);
    }
  }

  function debugCreateTribe($region, $playerId = null)
  {
    if (!($this->regions[$region])) {
      return;
    }
    $playerId = $playerId === null ? Players::get()->getId() : intval($playerId);
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);
    $to = $this->locations["tribes"][$region];
    if ($cylinder != null) {
      Tokens::move($cylinder['id'], $to);
      $message = clienttranslate('${player_name} places ${logTokenCylinder} in ${logTokenRegionName}');
      Notifications::moveToken($message, [
        'player' => Players::get($playerId),
        'logTokenCylinder' => Utils::logTokenCylinder($playerId),
        'logTokenRegionName' => Utils::logTokenRegionName($region),
        'move' => [
          'from' => $from,
          'to' => $to,
          'tokenId' => $cylinder['id'],
        ]
      ]);
      Map::checkRulerChange($region);
    }
  }

  function debugCreateSpy($cardId, $playerId = null)
  {
    $card = Cards::get($cardId);
    if (!Utils::startsWith($card['location'], "court")) {
      return;
    };

    $playerId = $playerId === null ? Players::get()->getId() : intval($playerId);
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);

    if ($cylinder != null) {
      $to = 'spies_' . $cardId;
      Tokens::move($cylinder['id'], $to);
      $message = clienttranslate('${player_name} places ${logTokenCylinder} on ${logTokenCardName}${logTokenLargeCard}');
      Notifications::moveToken($message, [
        'player' => Players::get($playerId),
        'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
        'logTokenCylinder' => Utils::logTokenCylinder($playerId),
        'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
        'move' => [
          'from' => $from,
          'to' => $to,
          'tokenId' => $cylinder['id'],
        ]
      ]);
    }
  }

  function debugIncPlayerRupees($rupees, $playerId = null)
  {
    $rupees = intval($rupees);
    $playerId = $playerId === null ? Players::get()->getId() : intval($playerId);
    Players::incRupees($playerId, $rupees);
  }

  function debugIncScore($score, $playerId = null)
  {
    $score = intval($score);
    $player = $playerId === null ? Players::get() : Players::get(intval($playerId));
    $player->incScore($score);
  }

  function debugSetFavoredSuit($suitId)
  {
    $previous_suit_id = Globals::getFavoredSuit();
    Globals::setFavoredSuit($suitId);
    Notifications::changeFavoredSuit($previous_suit_id, $suitId, false);
  }

  function debugGetState()
  {
    $state = $this->gamestate->state(true, false, true);
    Notifications::log('state', $state);
  }

  function debugCreateGift($value, $playerId = null)
  {
    $playerId = $this->debugGetPlayerId($playerId);
    $value = intval($value);
    $to = 'gift_' . $value . '_' . $playerId;
    $current = Tokens::getTopOf($to);
    if ($current !== null) {
      return;
    }
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);
    if ($cylinder === null) {
      return;
    }
    Tokens::move($cylinder['id'], $to);
  }

  function debugCreatePrize($cardId, $playerId = null)
  {
    $playerId = $this->debugGetPlayerId($playerId);
    Cards::move($cardId, Locations::prizes($playerId));
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function debugGetPlayerId($playerId = null)
  {
    return $playerId === null ? Players::get()->getId() : intval($playerId);
  }
}
