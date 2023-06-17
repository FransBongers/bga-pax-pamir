<?php

namespace PaxPamir;


use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Preferences;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\Players;
use PaxPamir\Models\Player;

trait DebugTrait
{
  function debugSetupCourt()
  {
    $this->debugAddCardToCourt('card_32');
    $this->debugAddCardToCourt('card_19');
    $this->debugAddCardToCourt('card_27','2371052');
    $this->debugAddCardToCourt('card_52','2371052');
  }

  function debugSetupTokens()
  {
    $this->debugCreateArmy(KABUL);
    $this->debugCreateArmy(PERSIA);
    $this->debugCreateRoad('herat_kabul');
    $this->debugCreateRoad('herat_persia');
    $this->debugCreateRoad('kabul_punjab');
    $this->debugCreateSpy('card_32');
    $this->debugCreateSpy('card_27');
  }

  function test()
  {
    // Notifications::log('player',Players::get()->hasSpecialAbility(SA_RUSSIAN_INFLUENCE));
    // Globals::setRemainingActions(2);
    // Cards::move('card_107',ACTIVE_EVENTS);
    // Cards::move('card_114','market_0_2');
    // Cards::move('card_107','market_1_0');
    
    // Notifications::log('isConflictFatigueActive',Events::isConflictFatigueActive());
    // Cards::move('card_38','deck');
    // $rupee = Tokens::getTopOf(RUPEE_SUPPLY);
    // Tokens::move($rupee['id'],['market_0_0','rupees']);
    // Cards::move('card_106','market_1_0');
    // Notifications::log('isNationalismActive',Events::isNationalismActive(Players::get()));
    // Notifications::log('isActive',$result);
    $this->debugCreateArmy(PERSIA,BRITISH);
    $this->debugCreateArmy(PERSIA,BRITISH);
    $this->debugCreateArmy(PERSIA,AFGHAN);
    $this->debugCreateArmy(PERSIA,AFGHAN);
    $this->debugCreateArmy(PERSIA,RUSSIAN);
    $this->debugCreateRoad('herat_kabul',RUSSIAN);
    $this->debugCreateArmy(KABUL,AFGHAN);
    // $this->debugCreateTribe(PERSIA);
    // $this->debugCreateTribe(PERSIA);
    // Map::removeTribesFromRegion(PERSIA);
  }

  function debugAddCardToCourt($cardId, $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? Players::get()->getId() : intval($playerId);
    Cards::move($cardId, ['court', $playerId]);
    $this->reassignCourtState($playerId);
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
        'moves' => [
          [
            'from' => $location,
            'to' => $to,
            'tokenId' => $army['id'],
          ]
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
        'moves' => [
          [
            'from' => $location,
            'to' => $to,
            'tokenId' => $road['id'],
          ]
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
        'moves' => [
          [
            'from' => $from,
            'to' => $to,
            'tokenId' => $cylinder['id'],
          ]
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
        'moves' => [
          [
            'from' => $from,
            'to' => $to,
            'tokenId' => $cylinder['id'],
          ]
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

  function debugSetFavoredSuit($suitId)
  {
    $previous_suit_id = Globals::getFavoredSuit();
    Globals::setFavoredSuit($suitId);
    Notifications::changeFavoredSuit($previous_suit_id, $suitId,false);
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

  function debugCreatePrize($cardId,$playerId = null)
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
