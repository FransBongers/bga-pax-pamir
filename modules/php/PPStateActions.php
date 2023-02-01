<?php
namespace PaxPamir;

use PaxPamir\Core\Globals;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PPStateActionsTrait
{


  //////////////////////////////////////////////////////////////////////////////
  //////////// Game state actions
  ////////////

  /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

  /*
        Triggered at end of a players turn. Checks if player needs to discard any cards from court or hand.
    */
  function stCleanup()
  {
    /**
     * 0. Set cards back to unused
     * 1. discard court cards if needed
     * 2. discard hand cards if needed
     * 3. discard events in leftmost column (TODO)
     * 4. refreshMarket
     */

    $player_id = self::getActivePlayerId();

    $court_cards = Cards::getInLocation(['court', $player_id], null, null, 1);
    foreach ($court_cards as $card) {
      Cards::setUsed($card["id"], 0);
    }

    $discards = $this->checkDiscardsForPlayer($player_id);

    if ($discards['court'] > 0) {
      $this->gamestate->nextState('discard_court');
    } elseif ($discards['hand'] > 0) {
      $this->gamestate->nextState('discard_hand');
    } else {
      $this->gamestate->nextState('discard_events');
    }
  }

  function stCleanupDiscardEvents()
  {

    // Discard events at front of market
    // NOTE: perhaps move this to separate state for handling execution of the event
    $top_card = Cards::getInLocation('market_0_0')->first();
    $bottom_card = Cards::getInLocation('market_1_0')->first();
    if ($top_card != null && $this->cards[$top_card['id']]['type'] == EVENT_CARD) {
      Cards::move($top_card['id'], 'discard');
      // $card_name = $this->cards[$top_card['id']]['name'];
      self::notifyAllPlayers("discardCard", 'event is discarded from the market.', array(
        // 'card_name' => $card_name,
        'cardId' => $top_card['id'],
        'from' => 'market_0_0'
      ));
    };
    if ($bottom_card != null && $this->cards[$bottom_card['id']]['type'] == EVENT_CARD) {
      Cards::move($bottom_card['id'], 'discard');
      // $card_name = $this->cards[$bottom_card['id']]['name'];
      self::notifyAllPlayers("discardCard", 'event is discarded from the market.', array(
        // 'card_name' => $card_name,
        'cardId' => $bottom_card['id'],
        'from' => 'market_1_0'
      ));
    };

    $this->gamestate->nextState('refresh_market');
  }

  function stDominanceCheck()
  {
    // TODO: increase by 2 in case of instability
    Globals::incDominanceChecksResolved(1);
    // Determine if check is successful
    // Get counts of all blocks left in pool
    $coalition_block_counts = array();
    $i = 0;
    foreach ($this->locations['pools'] as $coalitionId => $coalitionPool) {
      $coalition_block_counts[$i] = array(
        'count' => Tokens::countInLocation($coalitionPool),
        'coalition' => $coalitionId,
      );
      $i += 1;
    }
    // sort array lowest to highest. Since we count remaining blocks the coalition with the lowest
    // number has the most blocks in play
    usort($coalition_block_counts, function ($a, $b) {
      return $a['count'] - $b['count'];
    });
    $check_successful = $coalition_block_counts[1]['count'] - $coalition_block_counts[0]['count'] >= 4;

    // scores object which will be returned with notification
    $scores = array();
    $moves = array();
    if ($check_successful) {
      $dominant_coalition =  $coalition_block_counts[0]['coalition'];
      $players = $this->loadPlayersBasicInfos();

      // Create array of players loyal to dominant coalition and their total influence
      $loyal_players = array();
      foreach ($players as $player_id => $player_info) {
        if (Players::get($player_id)->getLoyalty() == $dominant_coalition) {
          $loyal_players[] = array(
            'player_id' => $player_id,
            'count' => $this->getPlayerInfluence($player_id),
          );
        }
      };

      // Sort array so leader is at position 0
      usort($loyal_players, function ($a, $b) {
        return $b['count'] - $a['count'];
      });

      $available_points = [5, 3, 1];
      if (Globals::getDominanceChecksResolved() == 4) {
        $available_points = [10, 6, 2];
      }
      $scores = $this->determineVictoryPoints($loyal_players, $available_points);
      $moves = $this->handleSuccessfulDominanceCheck();
    } else {
      // Determine numer of cylinders in play by each player
      $cylinder_counts = $this->getCylindersInPlayPerPlayer();

      // Sort array so player with highest number is at 0.
      usort($cylinder_counts, function ($a, $b) {
        return $b['count'] - $a['count'];
      });

      // Determine VPs
      $available_points = [3, 1];
      if (Globals::getDominanceChecksResolved() == 4) {
        $available_points = [6, 2];
      }
      $scores = $this->determineVictoryPoints($cylinder_counts, $available_points);
    }
    self::notifyAllPlayers("dominanceCheck", clienttranslate('A Dominance Check has been resolved.'), array(
      'scores' => $scores,
      'successful' => $check_successful,
      'moves' => $moves,
    ));

    // TODO: Frans: if one player leads by 4 or more end the game
    $this->gamestate->nextState('action');
  }

  function getCylindersInPlayPerPlayer()
  {
    $counts = array();
    $players = $this->loadPlayersBasicInfos();
    $i = 0;
    foreach ($players as $player_id => $player_info) {
      $counts[$i] = array(
        'count' => 10 - Tokens::countInLocation(['cylinders', $player_id]),
        'player_id' => $player_id,
      );
      $i += 1;
    }

    return $counts;
  }

  function stResolveImpactIcons()
  {
    $player_id = self::getActivePlayerId();
    $card_id = 'card_' . Globals::getResolveImpactIconsCardId();
    $current_impact_icon_index = Globals::getResolveImpactIconsCurrentIcon();
    $card_info = $this->cards[$card_id];
    $impact_icons = $card_info['impact_icons'];
    self::dump('----------- resolving impact icons for card', $card_id);
    self::dump('----------- resolving impact icons current icon', $current_impact_icon_index);
    self::dump('----------- resolving impact icons number of icons', count($impact_icons));
    $card_region = $card_info['region'];

    if ($current_impact_icon_index >= count($impact_icons)) {
      // $this->setGameStateValue("resolve_impact_icons_card_id", explode("_", $card_id)[1]);
      // $this->setGameStateValue("resolve_impact_icons_current_icon", 0);
      $this->gamestate->nextState('action');
      return;
    }

    $current_icon = $impact_icons[$current_impact_icon_index];
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
                'token_id' => $army['id'],
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
              'token_id' => 'favored_suit_marker',
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
              'token_id' => 'favored_suit_marker',
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
              'token_id' => 'favored_suit_marker',
            )
          )
        ));
        break;
      case LEVERAGE:
        Players::get($player_id)->incRupees(2);
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
              'token_id' => 'favored_suit_marker',
            )
          )
        ));
        break;
      case ROAD:
        $next_state = "place_road";
        break;
      case SPY:
        $next_state = "place_spy";
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
                'token_id' => $cylinder['id'],
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
      // increase index for currently resolved icon, then transition to resolve_impact_icons state again
      // to check if there are more that need to be resolved.
      Globals::setResolveImpactIconsCurrentIcon($current_impact_icon_index + 1);
      $this->gamestate->nextState('resolve_impact_icons');
    }
  }



  /**
   * Refresh market at end of a players turn
   */
  function stRefreshMarket()
  {

    // Refill market

    $empty_top = array();
    $empty_bottom = array();
    $card_moves = array();
    $new_cards = array();

    for ($i = 0; $i < 6; $i++) {
      $from_location = 'market_0_' . $i;
      $card = Cards::getTopOf($from_location);
      if ($card == null) {
        $empty_top[] = $i;
      } else {
        Cards::setUsed($card["id"], 0); // unavailable false
        if (count($empty_top) > 0) {
          $to_locaction = 'market_0_' . array_shift($empty_top);
          Cards::move($card['id'], $to_locaction);
          Tokens::moveAllInLocation([$from_location, 'rupees'], [$to_locaction, 'rupees']);
          $empty_top[] = $i;
          $card_moves[] = array(
            'cardId' => $card['id'],
            'from' => $from_location,
            'to' => $to_locaction
          );

          self::notifyAllPlayers("refreshMarket", '', array(
            'cardMoves' => $card_moves,
            'newCards' => $new_cards,
          ));

          $this->gamestate->nextState('refresh_market');
          return;
        }
      }

      $from_location = 'market_1_' . $i;
      $card = Cards::getInLocation($from_location)->first();
      if ($card == null) {
        $empty_bottom[] = $i;
      } else {
        Cards::setUsed($card["id"], 0);
        if (count($empty_bottom) > 0) {
          $to_locaction = 'market_1_' . array_shift($empty_bottom);
          Cards::move($card['id'], $to_locaction);
          Tokens::moveAllInLocation([$from_location, 'rupees'], [$to_locaction, 'rupees']);
          $empty_bottom[] = $i;
          $card_moves[] = array(
            'cardId' => $card['id'],
            'from' => $from_location,
            'to' => $to_locaction
          );

          self::notifyAllPlayers("refreshMarket", '', array(
            'cardMoves' => $card_moves,
            'newCards' => $new_cards,
          ));

          $this->gamestate->nextState('refresh_market');
          return;
        }
      }
    }

    foreach ($empty_top as $i) {
      $card = Cards::pickOneForLocation('deck', ['market_0', $i]);
      $new_cards[] = array(
        'cardId' => $card['id'],
        'from' => 'deck',
        'to' => 'market_0_' . $i
      );
    }

    foreach ($empty_bottom as $i) {
      $card = Cards::pickOneForLocation('deck', ['market_1', $i]);
      $new_cards[] = array(
        'cardId' => $card['id'],
        'from' => 'deck',
        'to' => 'market_1_' . $i
      );
    }

    self::notifyAllPlayers("refreshMarket", clienttranslate('The market has been refreshed.'), array(
      'cardMoves' => $card_moves,
      'newCards' => $new_cards,
    ));

    $this->gamestate->nextState('next_turn');
  }
}
