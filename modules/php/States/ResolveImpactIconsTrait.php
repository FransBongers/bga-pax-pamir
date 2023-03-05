<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
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
      // $this->setGameStateValue("resolve_impactIcons_card_id", explode("_", $card_id)[1]);
      // $this->setGameStateValue("resolve_impactIcons_current_icon", 0);
      if (in_array(TRIBE, $impactIcons, true) || in_array(ARMY, $impactIcons, true)) {
        Map::checkRulerChange($card_region);
      };
      $this->gamestate->nextState('action');
      return;
    }

    $current_icon = $impactIcons[$current_impact_icon_index];
    $next_state = null;

    switch ($current_icon) {
      case ARMY:
        $loyalty = Players::get()->getLoyalty();
        $location = $this->locations['pools'][$loyalty];
        $army = Tokens::getInLocation($location)->first();
        if ($army != null) {
          $to = $this->locations['armies'][$card_region];
          Tokens::move($army['id'], $this->locations['armies'][$card_region]);
          self::notifyAllPlayers("moveToken", "", array(
            'moves' => array(
              0 => array(
                'from' => $location,
                'to' => $to,
                'tokenId' => $army['id'],
              )
            )
          ));
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
        self::notifyAllPlayers("moveToken", $message, array(
          'moves' => array(
            0 => array(
              'from' => 'favored_suit_' . $previous_suit_id,
              'to' => 'favored_suit_' . ECONOMIC,
              'tokenId' => 'favored_suit_marker',
            )
          )
        ));
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
        self::notifyAllPlayers("moveToken", $message, array(
          'moves' => array(
            0 => array(
              'from' => 'favored_suit_' . $previous_suit_id,
              'to' => 'favored_suit_' . INTELLIGENCE,
              'tokenId' => 'favored_suit_marker',
            )
          )
        ));
        break;
      case MILITARY_SUIT:
        $previous_suit = Globals::getFavoredSuit();
        if ($previous_suit == MILITARY) {
          break;
        }
        // Update favored suit
        Globals::setFavoredSuit(MILITARY);

        // Suit change notification
        $message = $this->suits[MILITARY]['change'];
        $previous_suit_id = $this->suits[$previous_suit]['id'];
        self::notifyAllPlayers("moveToken", $message, array(
          'moves' => array(
            0 => array(
              'from' => 'favored_suit_' . $previous_suit_id,
              'to' => 'favored_suit_' . MILITARY,
              'tokenId' => 'favored_suit_marker',
            )
          )
        ));
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

        // Suit change notification
        $message = $this->suits[POLITICAL]['change'];
        $previous_suit_id = $this->suits[$previous_suit]['id'];
        self::notifyAllPlayers("moveToken", $message, array(
          'moves' => array(
            0 => array(
              'from' => 'favored_suit_' . $previous_suit_id,
              'to' => 'favored_suit_' . POLITICAL,
              'tokenId' => 'favored_suit_marker',
            )
          )
        ));
        break;
      case ROAD:
        $next_state = "placeRoad";
        break;
      case SPY:
        $next_state = "placeSpy";
        break;
      case TRIBE:
        $from = "cylinders_" . $player_id;
        $cylinder = Tokens::getInLocation($from)->first();
        $to = $this->locations["tribes"][$card_region];
        if ($cylinder != null) {
          Tokens::move($cylinder['id'], $to);
          self::notifyAllPlayers("moveToken", "", array(
            'moves' => array(
              0 => array(
                'from' => $from,
                'to' => $to,
                'tokenId' => $cylinder['id'],
              )
            )
          ));
        }
        break;
      default:
        break;
    }


    if ($next_state != null) {
      $this->gamestate->nextState($next_state);
    } else {
      // increase index for currently resolved icon, then transition to resolveImpactIcons state again
      // to check if there are more that need to be resolved.
      Globals::setResolveImpactIconsCurrentIcon($current_impact_icon_index + 1);
      $this->gamestate->nextState('resolveImpactIcons');
    }
  }
}
