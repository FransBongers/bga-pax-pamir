<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayerActionTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argPlayerActions()
  {
    $player_id = self::getActivePlayerId();
    $current_player_id = self::getCurrentPlayerId();
    $player = Players::get($player_id);
    return array(
      'remainingActions' => Globals::getRemainingActions(),
      'unavailableCards' => Cards::getUnavailableCards(),
      'hand' => Cards::getInLocation(['hand', $current_player_id]),
      'court' => Cards::getInLocationOrdered(['court', $player_id])->toArray(),
      'suits' => $player->getSuitTotals(),
      'rulers' => Map::getRulers(),
      'favoredSuit' => Globals::getFavoredSuit(),
      'rupees' => $player->getRupees(),
    );
  }

  //  .########..##..........###....##....##.########.########.
  //  .##.....##.##.........##.##....##..##..##.......##.....##
  //  .##.....##.##........##...##....####...##.......##.....##
  //  .########..##.......##.....##....##....######...########.
  //  .##........##.......#########....##....##.......##...##..
  //  .##........##.......##.....##....##....##.......##....##.
  //  .##........########.##.....##....##....########.##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  /**
   * Part of set up when players need to select loyalty.
   */
  function chooseLoyalty($coalition)
  {
    self::checkAction('chooseLoyalty');

    $player_id = Players::getActiveId();
    $coalition_name = $this->loyalty[$coalition]['name'];

    Players::get()->setLoyalty($coalition);

    // Notify
    // TODO (Frans): check i18n for coalition name
    self::notifyAllPlayers("chooseLoyalty", clienttranslate('${player_name} sets loyalty to ${coalition_name} ${coalition_log_token}'), array(
      'player_id' => $player_id,
      'player_name' => Game::get()->getActivePlayerName(),
      'coalition' => $coalition,
      'coalition_name' => $coalition_name,
      'coalition_log_token' => $coalition,
    ));

    $this->gamestate->nextState('next');
  }





  function pass()
  {
    //
    // pass remaining player actions
    //

    self::checkAction('pass');

    $player_id = self::getActivePlayerId();

    $remaining_actions = Globals::getRemainingActions();
    $state = $this->gamestate->state();

    if (($remaining_actions > 0) and ($state['name'] == 'playerActions')) {
      // self::incStat($remaining_actions, "skip", $player_id);
      Globals::setRemainingActions(0);

      // Notify
      self::notifyAllPlayers("pass", clienttranslate('${player_name} ended their turn.'), array(
        'player_id' => $player_id,
        'player_name' => self::getActivePlayerName(),
      ));
    }

    $this->gamestate->nextState('cleanup');
  }


  /**
   * Play card from hand to court
   */
  function playCard($card_id, $left_side = true, $bribe = null)
  {
    //
    // play a card from hand into the court on either the left or right side
    //

    self::checkAction('playCard');

    $player_id = self::getActivePlayerId();
    $card = Cards::get($card_id);
    $card_name = $this->cards[$card_id]['name'];

    // $bribe_card_id = $this->getGameStateValue("bribe_card_id");
    // $bribe_ruler = Cards::getRegionRulerForCard($bribe_card_id);
    // $bribe_amount = $this->getGameStateValue("bribe_amount");

    $court_cards = Cards::getInLocationOrdered(['court', $player_id])->toArray();

    // TODO (Frans): decide how we want to implement bribes
    // if (($bribe_ruler != 0) and ($bribe_ruler != $player_id)) {
    //     if ($bribe_amount == -1) {
    //         $this->setGameStateValue("bribe_card_id", $card_id);
    //         $this->gamestate->setPlayersMultiactive( [$bribe_ruler], 'negotiate_bribe', $bExclusive = true );
    //         self::notifyAllPlayers( "playCard", $message, array(
    //             'player_id' => $player_id,
    //             'player_name' => self::getActivePlayerName(),
    //             'card' => $card,
    //             'card_name' => $card_name,
    //             'court_cards' => $court_cards,
    //             'bribe' => true,
    //         ) );
    //         return;
    //     } elseif ($bribe != $bribe_amount) {
    //         throw new feException( "Bribe is incorrect value" );
    //         return;
    //     } else {
    //         $this->incPlayerCoins($player_id, -$bribe);
    //     }
    // }

    if (Globals::getRemainingActions() > 0) {
      // check if loyaly change
      $card_loyalty = $this->cards[$card_id]['loyalty'];
      if ($card_loyalty != null) {
        $this->checkAndHandleLoyaltyChange($card_loyalty);
      }

      if ($left_side) {
        for ($i = 0; $i < count($court_cards); $i++) {
          Cards::setState($court_cards[$i]['id'], $i + 2);
        }
        Cards::move($card_id, ['court', $player_id], 1);
        $message = clienttranslate('${playerName} plays ${cardName} to the left side of their court');
      } else {
        Cards::move($card_id, ['court', $player_id], count($court_cards) + 1);
        $message = clienttranslate('${playerName} plays ${cardName} to the right side of their court');
      }
      Globals::incRemainingActions(-1);
      $court_cards = Cards::getInLocationOrdered(['court', $player_id])->toArray();
      $card = Cards::get($card_id);
      self::notifyAllPlayers("playCard", $message, array(
        'playerId' => $player_id,
        'playerName' => self::getActivePlayerName(),
        'card' => $card,
        'cardName' => $card_name,
        'courtCards' => $court_cards,
        'bribe' => false,
      ));

      $this->updatePlayerCounts();

      // $this->setGameStateValue("bribe_card_id", 0);
      // $this->setGameStateValue("bribe_amount", -1);

      Globals::setResolveImpactIconsCardId($card_id);
      Globals::setResolveImpactIconsCurrentIcon(0);
      $this->gamestate->nextState('resolve_impact_icons');
    }
  }

  /**
   * purchase card from market
   */
  function purchaseCard($card_id)
  {
    self::dump("purchaseCard", $card_id);
    self::checkAction('purchaseCard');

    $player_id = self::getActivePlayerId();
    $card = Cards::get($card_id);
    $card_info = $this->cards[$card_id];

    $base_cost = Globals::getFavoredSuit() === MILITARY ? 2 : 1;

    // Throw error if card is unavailble for purchase
    if ($card['used'] == 1) {
      throw new \feException("Card is unavailble");
    }

    $card_name = $this->cards[$card_id]['name'];
    $market_location = $card['location'];
    self::dump("purchaseCard", $card_id, $player_id, $card);
    $row = explode("_", $market_location)[1];
    $row_alt = ($row == 0) ? 1 : 0;
    $col = intval(explode("_", $market_location)[2]);
    $cost = $col * $base_cost;
    self::dump("row", $row);

    $next_state = 'action';
    if (Globals::getRemainingActions() > 0) {

      // check cost
      if ($cost > Players::get($player_id)->getRupees()) {
        throw new \feException("Not enough rupees");
      } else {
        // if enough rupees reduce player rupees
        Players::get($player_id)->incRupees(-$cost);
      };

      // TODO (Frans): check if this is an event card or court card
      // move card to player hand location and reduce number of remaining actions
      $new_location = 'hand_' . $player_id;
      if ($card_info['type'] == EVENT_CARD) {
        $new_location = 'active_events';
      } else if ($card_info['type'] == DOMINANCE_CHECK_CARD) {
        $new_location = 'discard';
        $next_state = 'dominance_check';
      }
      Cards::move($card_id, $new_location);
      Globals::incRemainingActions(-1);

      $updated_cards = array();

      for ($i = $col - 1; $i >= 0; $i--) {
        $location = 'market_' . $row . '_' . $i;
        $use_row_alt = false;
        $m_card = Cards::getInLocation($location)->first();
        if ($m_card == NULL) {
          $use_row_alt = true;
          $location = 'market_' . $row_alt . '_' . $i;
          $m_card = Cards::getInLocation($location)->first();
        }
        if ($m_card !== NULL) {
          Cards::setUsed($m_card["id"], 1); // set unavailable
          for ($j = 1; $j <= $base_cost; $j++) {
            $rupee = Tokens::getInLocation(RUPEE_SUPPLY)->first();
            Tokens::move($rupee['id'], [$location, 'rupees']);
            $updated_cards[] = array(
              'row' => intval($use_row_alt ? $row_alt : $row),
              'column' => $i,
              'cardId' => $m_card["id"],
              'rupeeId' => $rupee['id']
            );
          }
        }
      }

      // add rupees on card to player totals. Then put them in rupee_pool location
      $rupees = Tokens::getInLocation([$market_location, 'rupees']);
      Players::get($player_id)->incRupees(count($rupees));
      Tokens::moveAllInLocation([$market_location, 'rupees'], RUPEE_SUPPLY);

      self::notifyAllPlayers("purchaseCard", clienttranslate('${player_name} purchases ${cardName} ${card_log}'), array(
        'playerId' => $player_id,
        'player_name' => self::getActivePlayerName(),
        'card' => $card,
        'cardName' => $card_name,
        'card_log' => $card['id'],
        'marketLocation' => $market_location,
        'newLocation' => $new_location,
        'updatedCards' => $updated_cards,
      ));

      $this->updatePlayerCounts();
    }

    $this->gamestate->nextState($next_state);
  }

  function placeRupeesInMarketRow($row, $remaining_rupees)
  {
    $updated_cards = [];
    // $remaining_rupees = $number_rupees;
    for ($i = 5; $i >= 0; $i--) {
      if ($remaining_rupees <= 0) {
        break;
      }
      $location = 'market_' . $row . '_' . $i;
      $market_card = Cards::getInLocation($location)->first();
      if ($market_card !== NULL) {
        $rupee = Tokens::getInLocation(RUPEE_SUPPLY)->first();
        Tokens::move($rupee['id'], [$location, 'rupees']);
        Cards::setUsed($market_card["id"], 1); // set unavailable
        $updated_cards[] = array(
          'location' => $location,
          'card_id' => $market_card["id"],
          'rupee_id' => $rupee['id']
        );
        $remaining_rupees--;
      }
    }
    return $updated_cards;
  }

  function isCardFavoredSuit($card_id)
  {
    $card_info = $this->cards[$card_id];
    return Globals::getFavoredSuit() == $card_info['suit'];
  }

  /**
   * Play card from hand to court
   */
  function selectGift($selected_gift, $card_id)
  {
    self::checkAction('selectGift');
    self::dump("selected_gift", $selected_gift);
    if (!$this->isValidCardAction($card_id, 'gift')) {
      return;
    }

    $player_id = self::getActivePlayerId();
    $rupees = Players::get()->getRupees();
    // Player should have enough rupees
    if ($rupees < $selected_gift) {
      throw new \feException("Not enough rupees to pay for the gift.");
    }
    $location = 'gift_' . $selected_gift . '_' . $player_id;
    $token_in_location = Tokens::getInLocation($location)->first();
    if ($token_in_location != null) {
      throw new \feException("Already a cylinder in selected location.");
    }

    $from = "cylinders_" . $player_id;
    $cylinder = Tokens::getInLocation($from)->first();

    // If null player needs to select cylinder from somewhere else
    if ($cylinder != null) {
      Tokens::move($cylinder['id'], $location);
      Cards::setUsed($card_id, 1); // unavailable false
      self::notifyAllPlayers("moveToken", "", array(
        'moves' => array(
          0 => array(
            'from' => $from,
            'to' => $location,
            'token_id' => $cylinder['id'],
          )
        )
      ));
    }

    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card_id)) {
      Globals::incRemainingActions(-1);
    }

    $number_rupees_per_row = $selected_gift / 2;
    $updated_cards = [];
    $updated_cards = array_merge($updated_cards, $this->placeRupeesInMarketRow(0, $number_rupees_per_row));
    $updated_cards = array_merge($updated_cards, $this->placeRupeesInMarketRow(1, $number_rupees_per_row));
    Players::get($player_id)->incRupees(-intval($selected_gift));

    $updated_counts = array(
      'rupees' => $rupees - $selected_gift,
      'influence' => Players::get($player_id)->getInfluence(),
    );

    self::notifyAllPlayers("selectGift", clienttranslate('${player_name} purchases a gift for ${value} rupees'), array(
      'player_id' => $player_id,
      'player_name' => self::getActivePlayerName(),
      'value' => $selected_gift,
      'updated_cards' => $updated_cards,
      'rupee_count' => $rupees - $selected_gift,
      'updated_counts' => $updated_counts,
    ));

    $this->gamestate->nextState('action');
  }


  /**
   * Validate card action
   */
  function isValidCardAction($card_id, $card_action)
  {
    self::dump("cardAction: card_id", $card_id);
    self::dump("cardAction: card_action", $card_action);

    $token_info = Cards::get($card_id);
    $card_info = $this->cards[$card_id];
    $player_id = self::getActivePlayerId();
    $location_info = explode("_", $token_info['location']);

    // Checks to determine if it is a valid action
    // Card should be in players court
    if ($location_info[0] != 'court' || $location_info[1] != $player_id) {
      throw new \feException("Not a valid card action for player.");
    }
    // Card should not have been used yet
    if ($token_info['used'] != 0) {
      throw new \feException("Card has already been used this turn.");
    }
    // Card should have the card action
    if (!isset($card_info['actions'][$card_action])) {
      throw new \feException("Action does not exist on selected card.");
    }

    // $next_state = 'action';
    if (!(Globals::getRemainingActions() > 0 || Globals::getFavoredSuit() == $card_info['suit'])) {
      throw new \feException("No remaining actions and not a free action.");
      // $this->setGameStateValue("card_action_card_id", explode("_", $card_id)[1]);

      // switch ($card_action) {
      //   case BATTLE:
      //     break;
      //   case BETRAY:
      //     break;
      //   case BUILD:
      //     break;
      //   case GIFT:
      //     $next_state = 'card_action_gift';
      //     break;
      //   case MOVE:
      //     break;
      //   case TAX:
      //     break;
      //   default:
      //     break;
      // };

      // self::notifyAllPlayers("cardAction", clienttranslate('${player_name} uses ${card_name} to ${card_action}.'), array(
      //   'player_id' => $player_id,
      //   'player_name' => self::getActivePlayerName(),
      //   'card_action' => $card_action,
      //   'card_name' => $this->cards[$card_id]['name'],
      // ));
    };
    return true;
    // $this->gamestate->nextState($next_state);
  }

  /**
   * checks if coalition is different from current loyalty.
   * Handles any changes it it is.
   */
  function checkAndHandleLoyaltyChange($coalition)
  {

    $player_id = self::getActivePlayerId();
    $current_loyaly = Players::get()->getLoyalty();
    // check of loyalty needs to change. If it does not return
    if ($current_loyaly == $coalition) {
      return;
    }


    // TODO:
    // 1. Return gifts
    // 2. Discard prizes and patriots
    // 3. Update loyalty
    Players::get()->setLoyalty($coalition);

    // Notify
    $coalition_name = $this->loyalty[$coalition]['name'];
    self::notifyAllPlayers("chooseLoyalty", clienttranslate('${player_name} changes loyalty to ${coalition_name}'), array(
      'player_id' => $player_id,
      'player_name' => self::getActivePlayerName(),
      'coalition' => $coalition,
      'coalition_name' => $coalition_name
    ));
  }
}
