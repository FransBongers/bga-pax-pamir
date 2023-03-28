<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Log;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
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

  function stResolveImpactIcons()
  {
    $player_id = self::getActivePlayerId();
    $card_id = Globals::getResolveImpactIconsCardId();
    $current_impact_icon_index = Globals::getResolveImpactIconsCurrentIcon();
    $card_info = $this->cards[$card_id];
    $impactIcons = $card_info['impactIcons'];
    self::dump('----------- resolving impact icons for card', $card_id);
    self::dump('----------- resolving impact icons current icon', $current_impact_icon_index);
    self::dump('----------- resolving impact icons number of icons', count($impactIcons));
    $card_region = $card_info['region'];

    if ($current_impact_icon_index >= count($impactIcons)) {
      if (Globals::getBribeClearLogs()) {
        Globals::setBribeClearLogs(false);
        Log::enable();
        Log::clearAll();
      }
      // $this->setGameStateValue("resolve_impactIcons_card_id", explode("_", $card_id)[1]);
      // $this->setGameStateValue("resolve_impactIcons_current_icon", 0);
      if (in_array(TRIBE, $impactIcons, true) || in_array(ARMY, $impactIcons, true)) {
        Map::checkRulerChange($card_region);
      };
      $this->gamestate->nextState('playerActions');
      return;
    }

    $current_icon = $impactIcons[$current_impact_icon_index];
    $next_state = null;

    switch ($current_icon) {
      case ARMY:
        $loyalty = Players::get()->getLoyalty();
        $location = $this->locations['pools'][$loyalty];
        $army = Tokens::getTopOf($location);
        if ($army != null) {
          $to = $this->locations['armies'][$card_region];
          Tokens::move($army['id'], $this->locations['armies'][$card_region]);
          $message = clienttranslate('${player_name} places ${logTokenArmy} in ${region}');
          Notifications::moveToken($message, [
            'player' => Players::get(),
            'logTokenArmy' => $loyalty,
            'region' => Map::getRegionInfo($card_region)['name'],
            'moves' => [
              [
                'from' => $location,
                'to' => $to,
                'tokenId' => $army['id'],
              ]
            ]
          ]);
        }
        break;
      case ECONOMIC_SUIT:
        $previous_suit = Globals::getFavoredSuit();
        if ($previous_suit == ECONOMIC) {
          break;
        }
        // Update favored suit
        Globals::setFavoredSuit(ECONOMIC);

        // Suit change notification
        $message = $this->suits[ECONOMIC]['change'];
        $previous_suit_id = $this->suits[$previous_suit]['id'];
        $message = clienttranslate('${player_name} changes favored suit to ${logTokenFavoredSuit}');
        Notifications::moveToken($message, [
          'player' => Players::get(),
          'logTokenFavoredSuit' => ECONOMIC,
          'moves' => [
            [
              'from' => 'favored_suit_' . $previous_suit_id,
              'to' => 'favored_suit_' . ECONOMIC,
              'tokenId' => 'favored_suit_marker',
            ]
          ]
        ]);
        break;
      case INTELLIGENCE_SUIT:
        $previous_suit = Globals::getFavoredSuit();
        if ($previous_suit == INTELLIGENCE) {
          break;
        }
        // Update favored suit
        Globals::setFavoredSuit(INTELLIGENCE);

        // Suit change notification
        $message = $this->suits[INTELLIGENCE]['change'];
        $previous_suit_id = $this->suits[$previous_suit]['id'];
        $message = clienttranslate('${player_name} changes favored suit to ${logTokenFavoredSuit}');
        Notifications::moveToken($message, [
          'player' => Players::get(),
          'logTokenFavoredSuit' => INTELLIGENCE,
          'moves' => [
            [
              'from' => 'favored_suit_' . $previous_suit_id,
              'to' => 'favored_suit_' . INTELLIGENCE,
              'tokenId' => 'favored_suit_marker',
            ]
          ]
        ]);
        break;
      case MILITARY_SUIT:
        $previous_suit = Globals::getFavoredSuit();
        if ($previous_suit == MILITARY) {
          break;
        }
        // Update favored suit
        Globals::setFavoredSuit(MILITARY);

        // Suit change notification
        $previous_suit_id = $this->suits[$previous_suit]['id'];
        $message = clienttranslate('${player_name} changes favored suit to ${logTokenFavoredSuit}');
        Notifications::moveToken($message, [
          'player' => Players::get(),
          'logTokenFavoredSuit' => MILITARY,
          'moves' => [
            [
              'from' => 'favored_suit_' . $previous_suit_id,
              'to' => 'favored_suit_' . MILITARY,
              'tokenId' => 'favored_suit_marker',
            ]
          ]
        ]);
        break;
      case LEVERAGE:
        Players::incRupees($player_id, 2);
        $this->updatePlayerCounts();
        break;
      case POLITICAL_SUIT:
        $previous_suit = Globals::getFavoredSuit();
        if ($previous_suit == POLITICAL) {
          break;
        }
        // Update favored suit
        Globals::setFavoredSuit(POLITICAL);

        // Suit change notificationx§
        $previous_suit_id = $this->suits[$previous_suit]['id'];
        $message = clienttranslate('${player_name} changes favored suit to ${logTokenFavoredSuit}');
        Notifications::moveToken($message, [
          'player' => Players::get(),
          'logTokenFavoredSuit' => POLITICAL,
          'moves' => [
            [
              'from' => 'favored_suit_' . $previous_suit_id,
              'to' => 'favored_suit_' . POLITICAL,
              'tokenId' => 'favored_suit_marker',
            ]
          ]
        ]);
        break;
      case ROAD:
        $next_state = "placeRoad";
        break;
      case SPY:
        $next_state = "placeSpy";
        break;
      case TRIBE:
        $from = "cylinders_" . $player_id;
        $cylinder = Tokens::getTopOf($from);
        $to = $this->locations["tribes"][$card_region];
        if ($cylinder != null) {
          Tokens::move($cylinder['id'], $to);
          $message = clienttranslate('${player_name} places ${logTokenCylinder} in ${region}');
          Notifications::moveToken($message, [
            'player' => Players::get(),
            'logTokenCylinder' => Players::get()->getColor(),
            'region' => Map::getRegionInfo($card_region)['name'],
            'moves' => [
              [
                'from' => $from,
                'to' => $to,
                'tokenId' => $cylinder['id'],
              ]
            ]
          ]);
        }
        break;
      default:
        break;
    }


    if ($next_state != null) {
      if (Globals::getBribeClearLogs()) {
        Globals::setBribeClearLogs(false);
        Log::enable();
        Log::clearAll();
      }
      $this->gamestate->nextState($next_state);
    } else {
      // increase index for currently resolved icon, then transition to resolveImpactIcons state again
      // to check if there are more that need to be resolved.
      Globals::setResolveImpactIconsCurrentIcon($current_impact_icon_index + 1);
      $this->gamestate->nextState('resolveImpactIcons');
    }
  }
}
