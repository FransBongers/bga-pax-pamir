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


  // function stResolveImpactIcons()
  // {
  //   $player_id = self::getActivePlayerId();
  //   $card_id = Globals::getResolveImpactIconsCardId();
  //   $current_impact_icon_index = Globals::getResolveImpactIconsCurrentIcon();
  //   $card_info = $this->cards[$card_id];
  //   $impactIcons = $card_info['impactIcons'];
  //   $card_region = $card_info['region'];

  //   if ($current_impact_icon_index >= count($impactIcons)) {
  //     if (Globals::getBribeClearLogs()) {
  //       Globals::setBribeClearLogs(false);
  //       Log::enable();
  //       Log::clearAll();
  //     }
  //     // $this->setGameStateValue("resolve_impactIcons_card_id", explode("_", $card_id)[1]);
  //     // $this->setGameStateValue("resolve_impactIcons_current_icon", 0);
  //     if (in_array(TRIBE, $impactIcons, true) || in_array(ARMY, $impactIcons, true)) {
  //       Map::checkRulerChange($card_region);
  //     };
  //     $this->nextState('playerActions');
  //     return;
  //   }

  //   $current_icon = $impactIcons[$current_impact_icon_index];
  //   $next_state = null;

  //   switch ($current_icon) {
  //     case ARMY:
  //       $this->resolvePlaceArmy($card_region);
  //       break;
  //     case ECONOMIC_SUIT:
  //       $this->resolveFavoredSuitChange(ECONOMIC);
  //       break;
  //     case INTELLIGENCE_SUIT:
  //       $this->resolveFavoredSuitChange(INTELLIGENCE);
  //       break;
  //     case MILITARY_SUIT:
  //       $this->resolveFavoredSuitChange(MILITARY);
  //       break;
  //     case LEVERAGE:
  //       Players::incRupees($player_id, 2);
  //       Notifications::leveragedCardPlay(Players::get(), 2);
  //       break;
  //     case POLITICAL_SUIT:
  //       $this->resolveFavoredSuitChange(POLITICAL);
  //       break;
  //     case ROAD:
  //       $next_state = "placeRoad";
  //       break;
  //     case SPY:
  //       $next_state = "placeSpy";
  //       break;
  //     case TRIBE:
  //       $from = "cylinders_" . $player_id;
  //       $cylinder = Tokens::getTopOf($from);
  //       $to = $this->locations["tribes"][$card_region];
  //       if ($cylinder != null) {
  //         Tokens::move($cylinder['id'], $to);
  //         $message = clienttranslate('${player_name} places ${logTokenCylinder} in ${logTokenRegionName}');
  //         Notifications::moveToken($message, [
  //           'player' => Players::get(),
  //           'logTokenCylinder' => Utils::logTokenCylinder(Players::get()->getId()),
  //           'logTokenRegionName' => Utils::logTokenRegionName($card_region),
  //           'moves' => [
  //             [
  //               'from' => $from,
  //               'to' => $to,
  //               'tokenId' => $cylinder['id'],
  //             ]
  //           ]
  //         ]);
  //       }
  //       break;
  //     default:
  //       break;
  //   }


  //   if ($next_state != null) {
  //     if (Globals::getBribeClearLogs()) {
  //       Globals::setBribeClearLogs(false);
  //       Log::enable();
  //       Log::clearAll();
  //     }
  //     $this->gamestate->nextState($next_state);
  //   } else {
  //     // increase index for currently resolved icon, then transition to resolveImpactIcons state again
  //     // to check if there are more that need to be resolved.
  //     Globals::setResolveImpactIconsCurrentIcon($current_impact_icon_index + 1);
  //     $this->gamestate->nextState('resolveImpactIcons');
  //   }
  // }

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
