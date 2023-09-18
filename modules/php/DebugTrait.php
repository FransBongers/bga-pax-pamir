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
use PaxPamir\Managers\WakhanCards;
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
    // $this->wakhanTax();
    $this->wakhanPlayCardsFromHand();
    // Cards::move('card_41',Locations::hand(WAKHAN_PLAYER_ID));
    // Cards::move('card_36',Locations::hand(WAKHAN_PLAYER_ID));
    // Cards::move('card_1',Locations::hand(WAKHAN_PLAYER_ID));
    // Cards::move('card_116','market_1_2');
    // Notifications::log('min',min(1,2));
    // $courtCards = $this->getAllCourtCardsOrdered();
    // $cardsWithWakhanSpies = Utils::filter($courtCards, function ($card) {
    //   $spyOwnerIds = array_map(function ($spy) {
    //     return intval(explode('_',$spy['id'])[1]);
    //   }, Tokens::getInLocation(['spies', $card['id']])->toArray());
    //   return in_array(WAKHAN_PLAYER_ID,$spyOwnerIds);
    // });
    // $cardToRemoveSpyFrom = $this->wakhanSelectCard($cardsWithWakhanSpies);
    // Notifications::log('selectedCard',$cardToRemoveSpyFrom);
    // $spies = Tokens::getInLocation(['spies', $cardToRemoveSpyFrom['id']])->toArray();
    // $wakhanSpies = Utils::filter($spies, function ($spy) {
    //   return intval(explode('_',$spy['id'])[1]) === WAKHAN_PLAYER_ID;
    // });
    // return $wakhanSpies[count($wakhanSpies) - 1];

    // Tokens::move('cylinder_1_8',Locations::spies('card_95'));
    // Cards::move('card_14',DISCARD);
    // Cards::move('card_52',DISCARD);
    // Cards::move('card_5','market_0_0');
    // Cards::move('card_6','market_1_0');
    // $this->debugCreateSpy('card_68',WAKHAN_PLAYER_ID);
    // $this->debugCreateSpy('card_7',WAKHAN_PLAYER_ID);
    // $this->debugCreateSpy('card_6',WAKHAN_PLAYER_ID);
    // $this->debugCreateSpy('card_44',WAKHAN_PLAYER_ID);
    // $this->debugCreateSpy('card_95',WAKHAN_PLAYER_ID);
    // $this->debugCreateSpy('card_58',WAKHAN_PLAYER_ID);
    // $this->debugCreateSpy('card_30',WAKHAN_PLAYER_ID);
    // $this->debugCreateSpy('card_58',WAKHAN_PLAYER_ID);
    // $this->debugCreateSpy('card_30',WAKHAN_PLAYER_ID);
    // $this->debugCreateTribe(TRANSCASPIA,WAKHAN_PLAYER_ID);
    // $this->debugCreateTribe(PUNJAB,WAKHAN_PLAYER_ID);
    // $this->debugCreateTribe(PERSIA,WAKHAN_PLAYER_ID);

    // $this->debugCreateRoad(KABUL.'_'.PUNJAB ,RUSSIAN);
    // $this->debugCreateRoad(KABUL.'_'.PUNJAB ,RUSSIAN);
    // $this->debugCreateRoad(KABUL.'_'.TRANSCASPIA ,RUSSIAN);
    // $this->debugCreateRoad(KABUL.'_'.KANDAHAR ,RUSSIAN);
    // $this->debugCreateRoad(KANDAHAR.'_'.PUNJAB ,RUSSIAN);
    // $this->debugCreateRoad(KANDAHAR.'_'.PUNJAB ,RUSSIAN);
    // $this->debugCreateRoad(PERSIA.'_'.TRANSCASPIA ,RUSSIAN);
    // $this->debugCreateRoad(HERAT.'_'.TRANSCASPIA ,RUSSIAN);
    // $this->debugCreateRoad(HERAT.'_'.PERSIA ,RUSSIAN);
    // $this->debugCreateRoad(HERAT.'_'.KANDAHAR ,RUSSIAN);
    // $this->debugCreateRoad(HERAT.'_'.KABUL ,RUSSIAN);
    // $this->debugCreateRoad(HERAT.'_'.KABUL ,RUSSIAN);
    
    // Notifications::log('wakhanEnabled',Globals::getWakhanEnabled());
    // Notifications::log('wakhanOption',Globals::getWakhanOption());
    
    // Notifications::log('getWakhanVariantSavvyPurchasing',Globals::getWakhanVariantSavvyPurchasing());
    // Notifications::log('getWakhanVariantSpyMovement',Globals::getWakhanVariantSpyMovement());
    // Notifications::log('getWakhanVariantSteadfastPragmaticLoyalty',Globals::getWakhanVariantSteadfastPragmaticLoyalty());

    // Tokens::move('block_afghan_6','roads_'.KANDAHAR.'_'.PUNJAB);
    // $front = WakhanCards::getTopOf(DISCARD)['front'];
    // $block = $this->wakhanSelectBlockToPlace(AFGHAN, $front);
    // Notifications::log('block',$block);
    // $this->wakhanDiscardCourtCards(1);

    // Notifications::log('actionStack', ActionStack::get());
    // Cards::move('card_101', 'market_0_0');

  }

  function debugAddCardToCourt($cardId, $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
    Cards::move($cardId, ['court', $playerId]);
    // $this->reassignCourtState($playerId);
  }

  function debugAddCardToHand($cardId, $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
    Cards::move($cardId, ['hand', $playerId]);
  }

  function debugCreateArmy($region, $coalition = null)
  {
    $coalition = $coalition === null ? PaxPamirPlayers::get()->getLoyalty() : $coalition;
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
        'player' => PaxPamirPlayers::get(),
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
    $coalition = $coalition === null ? PaxPamirPlayers::get()->getLoyalty() : $coalition;
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
        'player' => PaxPamirPlayers::get(),
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
        'player' => PaxPamirPlayers::get($playerId),
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
        'player' => PaxPamirPlayers::get($playerId),
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
    $playerId = $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
    PaxPamirPlayers::incRupees($playerId, $rupees);
  }

  function debugIncScore($score, $playerId = null)
  {
    $score = intval($score);
    $player = $playerId === null ? PaxPamirPlayers::get() : PaxPamirPlayers::get(intval($playerId));
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
    return $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
  }
}
