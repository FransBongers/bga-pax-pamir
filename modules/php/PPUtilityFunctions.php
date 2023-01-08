<?php

trait PPUtilityFunctionsTrait
{

  //////////////////////////////////////////////////////////////////////////////
  //////////// Utility functions
  ////////////    

  /*
        In this space, you can put any utility methods useful for your game logic.
        NOTE: put them in alphabetical order
    */


  /**
   * checks if coalition is different from current loyalty.
   * Handles any changes it it is.
   */
  function checkAndHandleLoyaltyChange($coalition)
  {

    $player_id = self::getActivePlayerId();
    $current_loyaly = $this->getPlayerLoyalty($player_id);
    // check of loyalty needs to change. If it does not return
    if ($current_loyaly == $coalition) {
      return;
    }


    // TODO:
    // 1. Return gifts
    // 2. Discard prizes and patriots
    // 3. Update loyalty
    $this->setPlayerLoyalty($player_id, $coalition);

    // Notify
    $coalition_name = $this->loyalty[$coalition]['name'];
    self::notifyAllPlayers("chooseLoyalty", clienttranslate('${player_name} changed loyalty to ${coalition_name}.'), array(
      'player_id' => $player_id,
      'player_name' => self::getActivePlayerName(),
      'coalition' => $coalition,
      'coalition_name' => $coalition_name
    ));
  }


  /*
      Returns the number of hand and court cards that need to be discarded by the player.
  */
  function checkDiscardsForPlayer($player_id)
  {
    //
    // check for extra cards in hand and court
    //
    $result = array();
    $suits = $this->getPlayerSuitsTotals($player_id);
    $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state');
    $hand = $this->tokens->getTokensOfTypeInLocation('card', 'hand_' . $player_id, null, 'state');

    $result['court'] = count($court_cards) - $suits['political'] - 3;
    $result['court'] = max($result['court'], 0);

    $result['hand'] = count($hand) - $suits['intelligence'] - 2;
    $result['hand'] = max($result['hand'], 0);

    return $result;
  }

  /**
   * Calculates VPs based on an array with available point [5,3,1] and 
   * a ranking of players and count with first player on position 0.
   */
  function determineVictoryPoints($player_ranking, $available_points)
  {
    $scores = array();
    while (count($available_points) > 0 && count($player_ranking) > 0) {
      $current_highest_influence = $player_ranking[0]['count'];

      // Filter to get all players with the same score as the leading player
      $same_score = array_filter($player_ranking, function ($element) use ($current_highest_influence) {
        return $element['count'] == $current_highest_influence;
      });
      $count_same_score = count($same_score);

      // Calculate points earned per player based on numer of players
      $total_points = 0;
      for ($i = 0; $i < $count_same_score; $i++) {
        $total_points += $available_points[$i];
      }
      $points_per_player = floor($total_points / $count_same_score);

      // Update database and add data to scores object for notifictation
      for ($i = 0; $i < $count_same_score; $i++) {
        $player_id = $player_ranking[$i]['player_id'];
        $current_score = $this->getPlayerScore($player_id);
        $scores[$player_id] = array(
          'player_id' => $player_id,
          'current_score' => $current_score,
          'new_score' => $current_score + $points_per_player,
        );
        $this->incPlayerScore($player_id, $points_per_player);
      }

      // Slice data that was just used from arrays
      $available_points = array_slice($available_points, $count_same_score);
      $player_ranking = array_slice($player_ranking, $count_same_score);
    };
    return $scores;
  }

  /*
      Returns rulers for all regions. Value will either be 0 (no ruler) or
      the playerId of the player ruling the region
  */
  function getAllRegionRulers()
  {

    $result = array();

    $result['transcaspia'] = $this->getGameStateValue('ruler_transcaspia');
    $result['kabul'] = $this->getGameStateValue('ruler_kabul');
    $result['persia'] = $this->getGameStateValue('ruler_persia');
    $result['herat'] = $this->getGameStateValue('ruler_herat');
    $result['kandahar'] = $this->getGameStateValue('ruler_kandahar');
    $result['punjab'] = $this->getGameStateValue('ruler_punjab');

    return $result;
  }

  /**
   *   Returns total influence for player
   */
  function getPlayerInfluence($player_id)
  {
    $influence = 1;
    $player_loyalty = $this->getPlayerLoyalty($player_id);

    // Patriots
    $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state');
    for ($i = 0; $i < count($court_cards); $i++) {
      $card_loyalty = $this->cards[$court_cards[$i]['key']]['loyalty'];
      if ($card_loyalty == $player_loyalty) {
        $influence += 1;
      }
    }
    for ($i = 1; $i <= 3; $i++) {
      $value = $i * 2;
      $tokens_in_location = $this->tokens->getTokensInLocation('gift_' . $value . '_' . $player_id);
      if (count($tokens_in_location) > 0) {
        $influence += 1;
      }
    }


    // $this->tokens->getTokensOfTypeInLocation('cylinder', 'court_'.$player_id, null, 'state');
    // TODO (Frans): get information about courd cards and add influence if patriot
    // Add number of prizes

    return $influence;
  }

  /**
   * Get loyalty for player
   */
  function getPlayerLoyalty($player_id)
  {
    $sql = "SELECT loyalty FROM player WHERE  player_id='$player_id' ";
    return $this->getUniqueValueFromDB($sql);
  }

  /**
   * Get total number of rupees owned by player
   */
  function getPlayerRupees($player_id)
  {
    $sql = "SELECT rupees FROM player WHERE  player_id='$player_id' ";
    return $this->getUniqueValueFromDB($sql);
  }

  /**
   * Get current score for player
   */
  function getPlayerScore($player_id)
  {
    $sql = "SELECT player_score FROM player WHERE  player_id='$player_id' ";
    return $this->getUniqueValueFromDB($sql);
  }

  /**
   * Calculates total number of ranks for each suit for cards in a players court
   */
  function getPlayerSuitsTotals($player_id)
  {
    $suits = array(
      POLITICAL => 0,
      MILITARY => 0,
      ECONOMIC => 0,
      INTELLIGENCE => 0
    );
    $court_cards = $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state');
    for ($i = 0; $i < count($court_cards); $i++) {
      $card_info = $this->cards[$court_cards[$i]['key']];
      $suits[$card_info['suit']] += $card_info['rank'];
    }
    return $suits;
  }

  /**
   * Returns ruler of the region a card belongs to. 0 if no ruler, otherwise playerId.
   */
  function getRegionRulerForCard($card_id)
  {
    if ($card_id == 0) return 0;

    $rulers = $this->getAllRegionRulers();
    $region = $this->cards[$card_id]['region'];

    return $rulers[$region];
  }

  /**
   * Should returns the cards that are not available for sale (because player already put rupee on it)
   */
  function getUnavailableCards()
  {
    $result = array();

    for ($i = 0; $i < 2; $i++) {
      for ($j = 0; $j < 6; $j++) {
        $res = $this->tokens->getTokensOfTypeInLocation('card', 'market_' . $i . '_' . $j, null, null, 1);
        self::dump("unavailableCards getTokensOfType", $res);
        $card = array_shift($res);
        if (($card !== NULL) and ($card['used'] == 1)) {
          $result[] = $card['key'];
        }
      }
    }

    return $result;
  }


  function handleSuccessfulDominanceCheck()
  {
    $moves = array();
    // return all coalition blocks to their pools
    $afghan_blocks = $this->tokens->getTokensOfTypeInLocation('block_afghan');
    foreach ($afghan_blocks as $token_id => $token_info) {
      if (!$this->startsWith($token_info['location'], "blocks")) {
        $moves[] = array(
          'token_id' => $token_id,
          'from' => $token_info['location'],
          'to' => BLOCKS_AFGHAN_SUPPLY
        );
        $this->tokens->moveToken($token_id, BLOCKS_AFGHAN_SUPPLY);
      };
    };

    $russian_blocks = $this->tokens->getTokensOfTypeInLocation('block_russian');
    foreach ($russian_blocks as $token_id => $token_info) {
      if (!$this->startsWith($token_info['location'], "blocks")) {
        $moves[] = array(
          'token_id' => $token_id,
          'from' => $token_info['location'],
          'to' => BLOCKS_RUSSIAN_SUPPLY
        );
        $this->tokens->moveToken($token_id, BLOCKS_RUSSIAN_SUPPLY);
      };
    };

    $british_blocks = $this->tokens->getTokensOfTypeInLocation('block_british');
    foreach ($british_blocks as $token_id => $token_info) {
      if (!$this->startsWith($token_info['location'], "blocks")) {
        $moves[] = array(
          'token_id' => $token_id,
          'from' => $token_info['location'],
          'to' => BLOCKS_BRITISH_SUPPLY
        );
        $this->tokens->moveToken($token_id, BLOCKS_BRITISH_SUPPLY);
      };
    };

    return $moves;
  }

  /**
   * Update the number of rupees for a player in database
   */
  function incPlayerRupees($player_id, $value)
  {
    $rupees = $this->getPlayerRupees($player_id);
    $rupees += $value;
    $sql = "UPDATE player SET rupees='$rupees' 
              WHERE  player_id='$player_id' ";
    self::DbQuery($sql);
  }

  /**
   * Update a players score
   */
  function incPlayerScore($player_id, $value)
  {
    $score = $this->getPlayerScore($player_id);
    $score += $value;
    $sql = "UPDATE player SET player_score='$score' 
              WHERE  player_id='$player_id' ";
    self::DbQuery($sql);
  }

  /**
   * Set loyalty for player in database
   */
  function setPlayerLoyalty($player_id, $coalition)
  {
    $sql = "UPDATE player SET loyalty='$coalition' 
      WHERE  player_id='$player_id' ";
    self::DbQuery($sql);
  }

  /**
   * Check is string starts with a specific substring. Returns boolean
   */
  function startsWith($string, $startString)
  {
    $len = strlen($startString);
    return (substr($string, 0, $len) === $startString);
  }

  /**
   * Calculates current totals for all player information and sends notification to all players
   */
  function updatePlayerCounts()
  {
    $counts = array();
    $players = $this->loadPlayersBasicInfos();
    // $sql = "SELECT player_id id, player_score score, loyalty, rupees FROM player ";
    // $result['players'] = self::getCollectionFromDb( $sql );
    foreach ($players as $player_id => $player_info) {
      $counts[$player_id] = array();
      $counts[$player_id]['rupees'] = $this->getPlayerRupees($player_id);
      $counts[$player_id]['cylinders'] = 10 - count($this->tokens->getTokensOfTypeInLocation('cylinder', 'cylinders_' . $player_id));
      $counts[$player_id]['cards'] = count($this->tokens->getTokensOfTypeInLocation('card', 'hand_' . $player_id));
      $counts[$player_id]['suits'] = $this->getPlayerSuitsTotals($player_id);
      $counts[$player_id]['influence'] = $this->getPlayerInfluence($player_id);
    }

    self::notifyAllPlayers("updatePlayerCounts", '', array(
      'counts' => $counts
    ));
  }
}
