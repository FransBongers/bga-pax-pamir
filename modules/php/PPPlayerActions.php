<?php


trait PPPlayerActionsTrait
{
  //////////////////////////////////////////////////////////////////////////////
  //////////// Player actions
  //////////// 

  /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in paxpamireditiontwo.action.php)
        NOTE: put in alphabetical order.
    *

  /**
   * Part of set up when players need to select loyalty.
   */
  function chooseLoyalty($coalition)
  {
    self::checkAction('chooseLoyalty');

    $player_id = self::getActivePlayerId();
    $coalition_name = $this->loyalty[$coalition]['name'];

    $this->setPlayerLoyalty($player_id, $coalition);

    // Notify
    self::notifyAllPlayers("chooseLoyalty", clienttranslate('${player_name} selected ${coalition_name}.'), array(
      'player_id' => $player_id,
      'player_name' => self::getActivePlayerName(),
      'coalition' => $coalition,
      'coalition_name' => $coalition_name
    ));

    $this->gamestate->nextState('next');
  }



  /**
   * Discard cards action when needed at end of a players turn
   */
  function discardCards($cards, $from_hand)
  {
    self::checkAction('discardCards');

    $player_id = self::getActivePlayerId();
    $discards = $this->checkDiscardsForPlayer($player_id);

    if ($from_hand) {
      if (count($cards) !== $discards['hand'])
        throw new feException("Incorrect number of discards");

      foreach ($cards as $card_id) {
        $this->tokens->moveToken($card_id, 'discard');
        $card_name = $this->cards[$card_id]['name'];
        $removed_card = $this->tokens->getTokenInfo($card_id);
        $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state');

        self::notifyAllPlayers("discardCard", '${player_name} discarded ${card_name} from their hand.', array(
          'player_id' => $player_id,
          'player_name' => self::getActivePlayerName(),
          'card_name' => $card_name,
          'court_cards' => $court_cards,
          'card_id' => $card_id,
          'from' => 'hand'
        ));
      }
    } else {
      if (count($cards) != $discards['court'])
        throw new feException("Incorrect number of discards");

      foreach ($cards as $card_id) {

        // Move all spies back to players cylinder pool
        $spiesOnCard = $this->tokens->getTokensOfTypeInLocation('cylinder', 'spies_' . $card_id, null, 'state');
        self::dump("spiesOnCard", $spiesOnCard);
        foreach ($spiesOnCard as $spy) {
          $spyOwner = explode("_", $spy['key'])[1];
          $this->tokens->moveToken($spy['key'], 'cylinders_' . $spyOwner);
        }

        // move card to discard location
        $this->tokens->moveToken($card_id, 'discard');
        $card_name = $this->cards[$card_id]['name'];
        $removed_card = $this->tokens->getTokenInfo($card_id);
        $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state');

        // slide card positions down to fill in gap
        foreach ($court_cards as $c) {
          if ($c['state'] > $removed_card['state'])
            $this->tokens->setTokenState($c['key'], $c['state'] - 1);
        }

        $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state');

        self::notifyAllPlayers("discardCard", '${player_name} discarded ${card_name} from their court.', array(
          'player_id' => $player_id,
          'player_name' => self::getActivePlayerName(),
          'card_name' => $card_name,
          'court_cards' => $court_cards,
          'card_id' => $card_id,
          'from' => 'court'
        ));
      }
    }

    $this->updatePlayerCounts();

    $this->gamestate->nextState('cleanup');
  }

  function pass()
  {
    //
    // pass remaining player actions
    //

    self::checkAction('pass');

    $player_id = self::getActivePlayerId();

    $remaining_actions = $this->getGameStateValue("remaining_actions");
    $state = $this->gamestate->state();

    if (($remaining_actions > 0) and ($state['name'] == 'playerActions')) {
      // self::incStat($remaining_actions, "skip", $player_id);
      $this->setGameStateValue("remaining_actions", 0);

      // Notify
      self::notifyAllPlayers("pass", clienttranslate('${player_name} ended their turn.'), array(
        'player_id' => $player_id,
        'player_name' => self::getActivePlayerName(),
      ));
    }

    $this->gamestate->nextState('cleanup');
  }

  /**
   * Places road on a border for loyalty of active player
   */
  function placeRoad($border)
  {
    self::checkAction('placeRoad');
    self::dump("placeRoad on ", $border);
    $player_id = self::getActivePlayerId();
    // TODO: check if allowed based on resolve_impact_icons_card_id
    $loyalty = $this->getPlayerLoyalty($player_id);
    $location = $this->locations['pools'][$loyalty];
    $road = $this->tokens->getTokenOnTop($location);
    if ($road != null) {
      $to = $this->locations['roads'][$border];
      $this->tokens->moveToken($road['key'], $to);
      self::notifyAllPlayers("moveToken", "", array(
        'moves' => array(
          0 => array(
            'from' => $location,
            'to' => $to,
            'token_id' => $road['key'],
          )
        )
      ));
    }
    $this->incGameStateValue("resolve_impact_icons_current_icon", 1);
    $this->gamestate->nextState('resolve_impact_icons');
  }

  /**
   * Places spy on card
   */
  function placeSpy($card_id)
  {
    self::checkAction('placeSpy');
    self::dump("placeSpy on ", $card_id);

    $player_id = self::getActivePlayerId();
    $from = "cylinders_" . $player_id;
    $cylinder = $this->tokens->getTokenOnTop($from);

    if ($cylinder != null) {
      $to = 'spies_' . $card_id;
      $this->tokens->moveToken($cylinder['key'], $to);
      self::notifyAllPlayers("moveToken", "", array(
        'moves' => array(
          0 => array(
            'from' => $from,
            'to' => $to,
            'token_id' => $cylinder['key'],
          )
        )
      ));
    }
    $this->incGameStateValue("resolve_impact_icons_current_icon", 1);
    $this->gamestate->nextState('resolve_impact_icons');
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
    $card = $this->tokens->getTokenInfo($card_id);
    $card_name = $this->cards[$card_id]['name'];

    $bribe_card_id = $this->getGameStateValue("bribe_card_id");
    $bribe_ruler = $this->getRegionRulerForCard($bribe_card_id);
    $bribe_amount = $this->getGameStateValue("bribe_amount");

    $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state');

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

    if ($this->getGameStateValue("remaining_actions") > 0) {
      // check if loyaly change
      $card_loyalty = $this->cards[$card_id]['loyalty'];
      if ($card_loyalty != null) {
        $this->checkAndHandleLoyaltyChange($card_loyalty);
      }

      if ($left_side) {
        for ($i = 0; $i < count($court_cards); $i++) {
          // $this->tokens->setTokenState($court_cards[$i].key, $court_cards[$i].state+1);
          $this->tokens->setTokenState($court_cards[$i]['key'], $i + 2);
        }
        $this->tokens->moveToken($card_id, 'court_' . $player_id, 1);
        $message = clienttranslate('${player_name} played ${card_name} to the left side of their court');
      } else {
        $this->tokens->moveToken($card_id, 'court_' . $player_id, count($court_cards) + 1);
        $message = clienttranslate('${player_name} played ${card_name} to the right side of their court');
      }
      $this->incGameStateValue("remaining_actions", -1);
      $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state');

      self::notifyAllPlayers("playCard", $message, array(
        'player_id' => $player_id,
        'player_name' => self::getActivePlayerName(),
        'card' => $card,
        'card_name' => $card_name,
        'court_cards' => $court_cards,
        'bribe' => false,
      ));

      $this->updatePlayerCounts();

      $this->setGameStateValue("bribe_card_id", 0);
      $this->setGameStateValue("bribe_amount", -1);

      $this->setGameStateValue("resolve_impact_icons_card_id", explode("_", $card_id)[1]);
      $this->setGameStateValue("resolve_impact_icons_current_icon", 0);
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
    $card = $this->tokens->getTokenInfo($card_id);
    $card_info = $this->cards[$card_id];

    // Throw error if card is unavailble for purchase
    if ($card['used'] == 1) {
      throw new feException("Card is unavailble");
    }

    $card_name = $this->cards[$card_id]['name'];
    $market_location = $card['location'];
    self::dump("purchaseCard", $card_id, $player_id, $card);
    $row = explode("_", $market_location)[1];
    $row_alt = ($row == 0) ? 1 : 0;
    $col = $cost = explode("_", $market_location)[2];
    self::dump("row", $row);

    $next_state = 'action';
    if ($this->getGameStateValue("remaining_actions") > 0) {

      // check cost
      if ($cost > $this->getPlayerRupees($player_id)) {
        throw new feException("Not enough rupees");
      } else {
        // if enough rupees reduce player rupees
        $this->incPlayerRupees($player_id, -$cost);
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
      $this->tokens->moveToken($card_id, $new_location);
      $this->incGameStateValue("remaining_actions", -1);

      // add rupees on card to player totals. Then put them in rupee_pool location
      $rupees = $this->tokens->getTokensOfTypeInLocation('rupee', $market_location . '_rupees');
      $this->incPlayerRupees($player_id, count($rupees));
      $this->tokens->moveAllTokensInLocation($market_location . '_rupees', RUPEE_SUPPLY);

      // TODO (Frans): better check below code, but assume it adds rupees to the cards in the market
      $updated_cards = array();

      for ($i = $col - 1; $i >= 0; $i--) {
        $location = 'market_' . $row . '_' . $i;
        $use_row_alt = false;
        $m_card = $this->tokens->getTokenOnLocation($location);
        if ($m_card == NULL) {
          $use_row_alt = true;
          $location = 'market_' . $row_alt . '_' . $i;
          $m_card = $this->tokens->getTokenOnLocation($location);
        }
        if ($m_card !== NULL) {
          $rupee = $this->tokens->getTokenOnTop(RUPEE_SUPPLY);
          $this->tokens->moveToken($rupee['key'], $location . '_rupees');
          $this->tokens->setTokenUsed($m_card["key"], 1); // set unavailable
          $updated_cards[] = array(
            'row' => intval($use_row_alt ? $row_alt : $row), 
            'column' => $i,
            'cardId' => $m_card["key"],
            'rupeeId' => $rupee['key']
          );
        }
      }

      self::notifyAllPlayers("purchaseCard", clienttranslate('${playerName} purchased ${cardName}'), array(
        'playerId' => $player_id,
        'playerName' => self::getActivePlayerName(),
        'card' => $card,
        'cardName' => $card_name,
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
      $market_card = $this->tokens->getTokenOnLocation($location);
      if ($market_card !== NULL) {
        $rupee = $this->tokens->getTokenOnTop(RUPEE_SUPPLY);
        $this->tokens->moveToken($rupee['key'], $location . '_rupees');
        $this->tokens->setTokenUsed($market_card["key"], 1); // set unavailable
        $updated_cards[] = array(
          'location' => $location,
          'card_id' => $market_card["key"],
          'rupee_id' => $rupee['key']
        );
        $remaining_rupees--;
      }
    }
    return $updated_cards;
  }

  function isCardFavoredSuit($card_id)
  {
    $card_info = $this->cards[$card_id];
    return $this->suits[$this->getGameStateValue("favored_suit")]['suit'] == $card_info['suit'];
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
    $rupees = $this->getPlayerRupees($player_id);
    // Player should have enough rupees
    if ($rupees < $selected_gift) {
      throw new feException("Not enough rupees to pay for the gift.");
    }
    $location = 'gift_' . $selected_gift . '_' . $player_id;
    $tokens_in_location = $this->tokens->getTokensInLocation($location);
    if (count($tokens_in_location) > 0) {
      throw new feException("Already a cylinder in selected location.");
    }

    $from = "cylinders_" . $player_id;
    $cylinder = $this->tokens->getTokenOnTop($from);

    // If null player needs to select cylinder from somewhere else
    if ($cylinder != null) {
      $this->tokens->moveToken($cylinder['key'], $location);
      $this->tokens->setTokenUsed($card_id, 1); // unavailable false
      self::notifyAllPlayers("moveToken", "", array(
        'moves' => array(
          0 => array(
            'from' => $from,
            'to' => $location,
            'token_id' => $cylinder['key'],
          )
        )
      ));
    }

    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card_id)) {
      $this->incGameStateValue("remaining_actions", -1);
    }

    $number_rupees_per_row = $selected_gift / 2;
    $updated_cards = [];
    $updated_cards = array_merge($updated_cards, $this->placeRupeesInMarketRow(0, $number_rupees_per_row));
    $updated_cards = array_merge($updated_cards, $this->placeRupeesInMarketRow(1, $number_rupees_per_row));
    $this->incPlayerRupees($player_id, -$selected_gift);

    $updated_counts = array(
      'rupees' => $rupees - $selected_gift,
      'influence' => $this->getPlayerInfluence($player_id),
    );

    self::notifyAllPlayers("selectGift", clienttranslate('${player_name} purchased a gift for ${value} rupees'), array(
      'player_id' => $player_id,
      'player_name' => self::getActivePlayerName(),
      'value' => $selected_gift,
      'updated_cards' => $updated_cards,
      'rupee_count' => $rupees - $selected_gift,
      'updated_counts' => $updated_counts,
    ));

    $this->gamestate->nextState('action');
  }
}
