<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use Paxpamir\Managers\PaxPamirPlayers;
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
      ActionStack::set($actionStack);
      $this->nextState('dispatchAction');
      return;
    }

    // CHECK: we could add action to stack to check ruler change instead of after each single icon

    $impactIcons = array_reverse($card['impactIcons']);
    foreach ($impactIcons as $index => $icon) {
      $actionStack[] = ActionStack::createAction(
        IMPACT_ICON_DISPATCH_MAP[$icon],
        $playerId,
        [
          'cardId' => $cardId,
          'region' => $card['region'],
          'type' => $icon === TRIBE ? TRIBE  : null,
        ]
      );
    }
    ActionStack::set($actionStack);
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


  /**
   * Place cylinder
   * NOTE: might be a better place to put this instead of with impact icons?
   */
  function dispatchPlaceCylinder($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];

    $playerId = $action['playerId'];
    $player = PaxPamirPlayers::get($playerId);

    $pool = "cylinders_" . $playerId;

    $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;
    $cylinder = $selectedPiece !== null ? Tokens::get($selectedPiece) : Tokens::getTopOf($pool);

    if ($cylinder === null) {
      $this->nextState('selectPiece', $playerId);
      return;
    }

    $cylinderType = $action['data']['type'];

    $this->resolvePlaceCylinder($player, $cylinder, $cylinderType, $action['data']);

    array_pop($actionStack);
    ActionStack::next($actionStack);
  }


  /**
   * Impact icon economic
   */
  function dispatchResolveImpactIconEconomic($actionStack)
  {
    array_pop($actionStack);
    ActionStack::set($actionStack);

    $this->resolveFavoredSuitChange(ECONOMIC);

    $this->nextState('dispatchAction');
  }


  /**
   * Impact icon intelligence
   */
  function dispatchResolveImpactIconIntelligence($actionStack)
  {
    array_pop($actionStack);
    ActionStack::set($actionStack);

    $this->resolveFavoredSuitChange(INTELLIGENCE);

    $this->nextState('dispatchAction');
  }


  /**
   * Impact icon military
   */
  function dispatchResolveImpactIconMilitary($actionStack)
  {
    array_pop($actionStack);
    ActionStack::set($actionStack);

    $this->resolveFavoredSuitChange(MILITARY);

    $this->nextState('dispatchAction');
  }


  /**
   * Impact icon leverage
   */
  function dispatchResolveImpactIconLeverage($actionStack)
  {
    $action = array_pop($actionStack);
    ActionStack::set($actionStack);

    $playerId = $action['playerId'];

    $this->resolveLeverage($playerId);

    $this->nextState('dispatchAction');
  }


  /**
   * Impact icon political
   */
  function dispatchResolveImpactIconPolitical($actionStack)
  {
    array_pop($actionStack);
    ActionStack::set($actionStack);

    $this->resolveFavoredSuitChange(POLITICAL);

    $this->nextState('dispatchAction');
  }


  /**
   * Impact icon road
   */
  function dispatchResolveImpactIconRoad($actionStack)
  {
    $this->nextState('placeRoad');
  }


  /**
   * Impact icon spy
   */
  function dispatchResolveImpactIconSpy($actionStack)
  {
    $this->gamestate->nextState('placeSpy');
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
    $loyalty = PaxPamirPlayers::get($playerId)->getLoyalty();
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
      $customMessage = clienttranslate('${tkn_playerName} chooses ${logTokenFavoredSuit}');
    };
    // Update favored suit
    Globals::setFavoredSuit($newSuit);
    // Suit change notification
    $currentSuitId = $this->suits[$currentSuit]['id'];
    Notifications::changeFavoredSuit($currentSuitId, $newSuit, $customMessage);
  }

  function resolveLeverage($playerId)
  {
    PaxPamirPlayers::incRupees($playerId, 2);
    Notifications::leveragedCardPlay(PaxPamirPlayers::get($playerId), 2);
  }

  function resolvePlaceCylinder($player, $cylinder, $cylinderType, $actionData)
  {

    $cylinderId = $cylinder['id'];
    $from = $cylinder['location'];
    $to = '';
    $playerId = $player->getId();

    if ($cylinderType === TRIBE) {
      $regionId = $actionData['region'];
      $to = $this->locations["tribes"][$regionId];
      Notifications::placeTribe($cylinderId, $player, $regionId, $from, $to);
    } else if ($cylinderType === SPY) {
      $cardId = $actionData['cardId'];
      $to = 'spies_' . $cardId;
      Notifications::placeSpy($cylinderId, $player, $cardId, $from, $to);
    } else if ($cylinderType === GIFT) {
      $value = $actionData['value'];
      $to = 'gift_' . $value . '_' . $playerId;
      Notifications::placeGift($cylinderId, $player, $from, $to);
    }

    Tokens::move($cylinderId, $to);
    Tokens::setUsed($cylinderId, USED);

    $fromRegionId = explode('_', $from)[1];
    $wasTribe = Utils::startsWith($from, 'tribes');
    // Ruler change in former region: 
    // - the moved piece was a tribe
    // - from region is not the same as the to region
    if ($wasTribe && $from !== $to) {
      Map::checkRulerChange($fromRegionId);
    }
    // $isTribe = Utils::startsWith($from, 'tribes');
    // if ($from !== "cylinders_" . $playerId && ($isTribe && (($cylinderType === SPY || $cylinderType === GIFT) || (isset($regionId) &&  $fromRegionId !== $regionId)))) {
    //   Map::checkRulerChange($fromRegionId);
    // }

    if ($cylinderType === TRIBE) {
      $regionId = $actionData['region'];
      Map::checkRulerChange($regionId);
    }
  }
}
