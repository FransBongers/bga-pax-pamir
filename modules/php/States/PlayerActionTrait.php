<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayerActionTrait
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

    $player_id = Players::getActiveId();
    $coalition_name = $this->loyalty[$coalition]['name'];

    $this->setPlayerLoyalty($player_id, $coalition);

    // Notify
    self::notifyAllPlayers("chooseLoyalty", clienttranslate('${player_name} selected ${coalition_name}.'), array(
      'player_id' => $player_id,
      'player_name' => Game::get()->getActivePlayerName(),
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
        throw new \feException("Incorrect number of discards");

      foreach ($cards as $card_id) {
        Cards::move($card_id, 'discard');
        $card_name = $this->cards[$card_id]['name'];
        $removed_card = Cards::get($card_id);
        $court_cards = Cards::getInLocation(['court', $player_id])->toArray();

        self::notifyAllPlayers("discardCard", '${playerName} discarded ${cardName} from their hand.', array(
          'playerId' => $player_id,
          'playerName' => self::getActivePlayerName(),
          'cardName' => $card_name,
          'courtCards' => $court_cards,
          'cardId' => $card_id,
          'from' => 'hand'
        ));
      }
    } else {
      if (count($cards) != $discards['court'])
        throw new \feException("Incorrect number of discards");

      foreach ($cards as $card_id) {

        // Move all spies back to players cylinder pool
        $spiesOnCard = Tokens::getInLocation(['spies', $card_id]);
        self::dump("spiesOnCard", $spiesOnCard);
        foreach ($spiesOnCard as $spy) {
          $spyOwner = explode("_", $spy['id'])[1];
          Tokens::move($spy['id'], ['cylinders', $spyOwner]);
        }

        // move card to discard location
        Cards::move($card_id, 'discard');
        $card_name = $this->cards[$card_id]['name'];
        $removed_card = Cards::get($card_id);
        $court_cards = Cards::getInLocation(['court', $player_id]);

        // slide card positions down to fill in gap
        foreach ($court_cards as $c) {
          if ($c['state'] > $removed_card['state'])
            Cards::setState($c['id'], $c['state'] - 1);
        }

        $court_cards = Cards::getInLocation(['court', $player_id])->toArray();

        self::notifyAllPlayers("discardCard", '${playerName} discarded ${cardName} from their court.', array(
          'playerId' => $player_id,
          'playerName' => self::getActivePlayerName(),
          'cardName' => $card_name,
          'courtCards' => $court_cards,
          'cardId' => $card_id,
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
   * Places road on a border for loyalty of active player
   */
  function placeRoad($border)
  {
    self::checkAction('placeRoad');
    self::dump("placeRoad on ", $border);
    $player_id = self::getActivePlayerId();
    // TODO: check if allowed based on resolve_impact_icons_card_id
    $loyalty = Players::get()->getLoyalty();
    $location = $this->locations['pools'][$loyalty];
    $road = Tokens::getInLocation($location)->first();
    if ($road != null) {
      $to = $this->locations['roads'][$border];
      Tokens::move($road['id'], $to);
      self::notifyAllPlayers("moveToken", "", array(
        'moves' => array(
          0 => array(
            'from' => $location,
            'to' => $to,
            'token_id' => $road['id'],
          )
        )
      ));
    }
    Globals::incResolveImpactIconsCurrentIcon(1);
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
    $cylinder = Tokens::getInLocation($from)->first();

    if ($cylinder != null) {
      $to = 'spies_' . $card_id;
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
    Globals::incResolveImpactIconsCurrentIcon(1);
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
    $card = Cards::get($card_id);
    $card_name = $this->cards[$card_id]['name'];

    // $bribe_card_id = $this->getGameStateValue("bribe_card_id");
    // $bribe_ruler = $this->getRegionRulerForCard($bribe_card_id);
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
        $message = clienttranslate('${playerName} played ${cardName} to the left side of their court');
      } else {
        Cards::move($card_id, ['court', $player_id], count($court_cards) + 1);
        $message = clienttranslate('${playerName} played ${cardName} to the right side of their court');
      }
      Globals::incRemainingActions(-1);
      $court_cards = Cards::getInLocationOrdered(['court', $player_id])->toArray();

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

      Globals::setResolveImpactIconsCardId(explode("_", $card_id)[1]);
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

    // Throw error if card is unavailble for purchase
    if ($card['used'] == 1) {
      throw new \feException("Card is unavailble");
    }

    $card_name = $this->cards[$card_id]['name'];
    $market_location = $card['location'];
    self::dump("purchaseCard", $card_id, $player_id, $card);
    $row = explode("_", $market_location)[1];
    $row_alt = ($row == 0) ? 1 : 0;
    $col = $cost = explode("_", $market_location)[2];
    self::dump("row", $row);

    $next_state = 'action';
    if (Globals::getRemainingActions() > 0) {

      // check cost
      if ($cost > Players::get($player_id)->getRupees()) {
        throw new \feException("Not enough rupees");
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
      Cards::move($card_id, $new_location);
      Globals::incRemainingActions(-1);

      // add rupees on card to player totals. Then put them in rupee_pool location
      $rupees = Tokens::getInLocation([$market_location, 'rupees']);
      $this->incPlayerRupees($player_id, count($rupees));
      Tokens::moveAllInLocation([$market_location, 'rupees'], RUPEE_SUPPLY);

      // TODO (Frans): better check below code, but assume it adds rupees to the cards in the market
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
          $rupee = Tokens::getInLocation(RUPEE_SUPPLY)->first();
          Tokens::move($rupee['id'], [$location, 'rupees']);
          Cards::setUsed($m_card["id"], 1); // set unavailable
          $updated_cards[] = array(
            'row' => intval($use_row_alt ? $row_alt : $row),
            'column' => $i,
            'cardId' => $m_card["id"],
            'rupeeId' => $rupee['id']
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
