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
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $cardId = $action['data']['cardId'];
    $region = Cards::get($cardId)['region'];

    $this->resolvePlaceArmy($region);
    Map::checkRulerChange($region);

    $this->nextState('dispatchAction');
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
    $this->gamestate->nextState('placeRoad');
  }

  function dispatchResolveImpactIconSpy($actionStack)
  {
    $this->gamestate->nextState('placeSpy');
  }

  function dispatchResolveImpactIconTribe($actionStack)
  {
    $action = array_pop($actionStack);
    Globals::setActionStack($actionStack);

    $playerId = $action['playerId'];
    $cardId = $action['data']['cardId'];
    $region = Cards::get($cardId)['region'];
    
    $this->resolvePlaceTribe($region, $playerId);
    Map::checkRulerChange($region);

    $this->nextState('dispatchAction');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function resolvePlaceArmy($regionId, $playerId = null)
  {
    $player = $playerId !== null ? Players::get($playerId) : Players::get();
    $loyalty = $player->getLoyalty();
    $location = $this->locations['pools'][$loyalty];
    $army = Tokens::getTopOf($location);
    if ($army != null) {
      $to = $this->locations['armies'][$regionId];
      Tokens::move($army['id'], $this->locations['armies'][$regionId]);
      $message = clienttranslate('${player_name} places ${logTokenArmy} in ${logTokenRegionName}');
      Notifications::moveToken($message, [
        'player' => $player,
        'logTokenArmy' => Utils::logTokenArmy($loyalty),
        'logTokenRegionName' => Utils::logTokenRegionName($regionId),
        'moves' => [
          [
            'from' => $location,
            'to' => $to,
            'tokenId' => $army['id'],
          ]
        ]
      ]);
    }
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

  function resolvePlaceTribe($regionId, $playerId)
  {
    $player = Players::get($playerId);
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);
    $to = $this->locations["tribes"][$regionId];
    if ($cylinder != null) {
      Tokens::move($cylinder['id'], $to);
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
    }
  }
}
