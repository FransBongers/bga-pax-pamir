<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait ResolveImpactIconsTrait
{

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  /**
   * Setup for resolving impact iconst
   * 1. Check if card is still in court. There is an edge case scenario where card might be 
   * discarded before impact icons are resolved
   * 2. Add all impact icons to action stack
   */
  function dispatchResolveImpactIcons($actionStack)
  {
    $action = array_pop($actionStack);


    $playerId = $action['playerId'];
    $cardId = $action['data']['cardId'];
    $card = Cards::get($cardId);

    // Card is not in court anymore so do not resolve impact icons
    // and go back to player actions
    if ($card['location'] !== Locations::court($playerId)) {
      Globals::setActionStack($actionStack);
      $this->nextState('dispatchAction');
      return;
    }

    // CHECK: we could add state to check ruler change instead of after each single icon

    $impactIcons = array_reverse($card['impactIcons']);
    foreach ($impactIcons as $index => $icon) {
      $actionStack[] = [
        'action' => IMPACT_ICON_DISPATCH_MAP[$icon],
        'playerId' => $playerId,
        'data' => [
          'cardId' => $cardId
        ],
      ];
    }
    Globals::setActionStack($actionStack);
    $this->nextState('dispatchAction');
  }


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

  function dispatchResolveImpactIconArmy($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];
    // $action = array_pop($actionStack);
    // Globals::setActionStack($actionStack);
    $playerId = $action['playerId'];
    $cardId = $action['data']['cardId'];
    $region = Cards::get($cardId)['region'];
    $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;

    $armyPlaced = $this->resolvePlaceArmy($region, $selectedPiece);
    if ($armyPlaced) {
      array_pop($actionStack);

      Globals::setActionStack($actionStack);
      $this->nextState('dispatchAction');
    } else {
      // No army available in supply, player needs to select
      $this->nextState('selectPiece', $playerId);
    }
  }

  function dispatchResolveImpactIconEconomic($actionStack)
  {
    array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $this->resolveFavoredSuitChange(ECONOMIC);

    $this->nextState('dispatchAction');
  }

  function dispatchResolveImpactIconIntelligence($actionStack)
  {
    array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $this->resolveFavoredSuitChange(INTELLIGENCE);

    $this->nextState('dispatchAction');
  }

  function dispatchResolveImpactIconMilitary($actionStack)
  {
    array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $this->resolveFavoredSuitChange(MILITARY);

    $this->nextState('dispatchAction');
  }

  function dispatchResolveImpactIconLeverage($actionStack)
  {
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $playerId = $action['playerId'];
    Players::incRupees($playerId, 2);

    Notifications::leveragedCardPlay(Players::get($playerId), 2);

    $this->nextState('dispatchAction');
  }

  function dispatchResolveImpactIconPolitical($actionStack)
  {
    array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $this->resolveFavoredSuitChange(POLITICAL);

    $this->nextState('dispatchAction');
  }

  function dispatchResolveImpactIconRoad($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];

    if ($this->isBlockAvailableForAction($action)) {
      $this->gamestate->nextState('placeRoad');
    } else {
      $playerId = $action['playerId'];
      $this->nextState('selectPiece', $playerId);
    }
  }

  function dispatchResolveImpactIconSpy($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];

    if ($this->isCylinderAvailableForAction($action)) {
      $this->gamestate->nextState('placeSpy');
    } else {
      $playerId = $action['playerId'];
      $this->nextState('selectPiece', $playerId);
    }
  }

  function dispatchResolveImpactIconTribe($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];
    $playerId = $action['playerId'];

    if ($this->isCylinderAvailableForAction($action)) {
      array_pop($actionStack);
      Globals::setActionStack($actionStack);

      $cardId = $action['data']['cardId'];
      $region = Cards::get($cardId)['region'];
      $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;

      $this->resolvePlaceTribe($region, $playerId, $selectedPiece);
      $this->nextState('dispatchAction');
    } else {
      $this->nextState('selectPiece', $playerId);
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  /**
   * There is a block available if it either has been selected or if there is a block in the pool
   */
  function isBlockAvailableForAction($action)
  {
    $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;
    if ($selectedPiece !== null) {
      return true;
    }

    $playerId = $action['playerId'];
    $loyalty = Players::get($playerId)->getLoyalty();
    $location = $this->locations['pools'][$loyalty];
    $road = Tokens::getTopOf($location);
    if ($road !== null) {
      return true;
    }

    return false;
  }

  /**
   * There is a block available if it either has been selected or if there is a block in the pool
   */
  function isCylinderAvailableForAction($action)
  {

    $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;
    if ($selectedPiece !== null) {
      return true;
    }

    $playerId = $action['playerId'];
    $pool = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($pool);
    if ($cylinder !== null) {
      return true;
    }

    return false;
  }

  function resolvePlaceArmy($regionId, $selectedPiece = null, $playerId = null)
  {
    $player = $playerId !== null ? Players::get($playerId) : Players::get();
    $loyalty = $player->getLoyalty();
    $location = $this->locations['pools'][$loyalty];

    $army = $selectedPiece !== null ? Tokens::get($selectedPiece) : Tokens::getTopOf($location);
    if ($army === null) {
      return false;
    }
    $to = $this->locations['armies'][$regionId];
    $from = $army['location'];
    Tokens::move($army['id'], $this->locations['armies'][$regionId]);
    Tokens::setUsed($army['id'], USED);

    // TODO: (add from log in case it was a selected pieces)
    $message = clienttranslate('${player_name} places ${logTokenArmy} in ${logTokenRegionName}');
    Notifications::moveToken($message, [
      'player' => $player,
      'logTokenArmy' => Utils::logTokenArmy($loyalty),
      'logTokenRegionName' => Utils::logTokenRegionName($regionId),
      'moves' => [
        [
          'from' => $from,
          'to' => $to,
          'tokenId' => $army['id'],
        ]
      ],
    ]);

    if ($selectedPiece !== null) {
      $fromRegionId = explode('_', $from)[1];
      Notifications::log('fromRegionId', $fromRegionId);
      $isArmy = Utils::startsWith($from, 'armies');
      Notifications::log('isArmy', $isArmy);
      if ($isArmy && explode('_', $from)[1] !== $regionId) {
        Map::checkRulerChange($fromRegionId);
        Notifications::log('selectedPieceFrom', $fromRegionId);
      }
    }
    Map::checkRulerChange($regionId);

    return true;
  }

  function resolveFavoredSuitChange($newSuit, $source = null)
  {
    $currentSuit = Globals::getFavoredSuit();
    if ($currentSuit === $newSuit || ($source !== ECE_PASHTUNWALI_VALUES && Events::isPashtunwaliValuesActive())) {
      return;
    }
    $customMessage = null;
    if (in_array($source, [ECE_MILITARY_SUIT, ECE_INTELLIGENCE_SUIT, ECE_POLITICAL_SUIT])) {
      $customMessage = clienttranslate('The favored suit changes to ${logTokenFavoredSuit}');
    } else if ($source === ECE_PASHTUNWALI_VALUES) {
      $customMessage = clienttranslate('${player_name} chooses ${logTokenFavoredSuit}');
    };
    // Update favored suit
    Globals::setFavoredSuit($newSuit);
    // Suit change notification
    $currentSuitId = $this->suits[$currentSuit]['id'];
    Notifications::changeFavoredSuit($currentSuitId, $newSuit, $customMessage);
  }

  function resolvePlaceTribe($regionId, $playerId, $selectedPiece = null)
  {
    $player = Players::get($playerId);
    $from = "cylinders_" . $playerId;
    $cylinder = $selectedPiece !== null ? Tokens::get($selectedPiece) : Tokens::getTopOf($from);
    $to = $this->locations["tribes"][$regionId];
    if ($cylinder === null) {
      return;
    }
    Tokens::move($cylinder['id'], $to);
    Tokens::setUsed($cylinder['id'], USED);
    $from = $cylinder['location'];
    $message = clienttranslate('${player_name} places ${logTokenCylinder} in ${logTokenRegionName}');
    Notifications::moveToken($message, [
      'player' => $player,
      'logTokenCylinder' => Utils::logTokenCylinder($playerId),
      'logTokenRegionName' => Utils::logTokenRegionName($regionId),
      'moves' => [
        [
          'from' => $from,
          'to' => $to,
          'tokenId' => $cylinder['id'],
        ]
      ]
    ]);

    if ($selectedPiece !== null) {
      $fromRegionId = explode('_', $from)[1];
      Notifications::log('fromRegionId', $fromRegionId);
      $isTribe = Utils::startsWith($from, 'tribes');
      Notifications::log('isTribe', $isTribe);
      if ($isTribe && $fromRegionId !== $regionId) {
        Map::checkRulerChange($fromRegionId);
        Notifications::log('selectedPieceFrom', $fromRegionId);
      }
    }
    Map::checkRulerChange($regionId);
  }
}
