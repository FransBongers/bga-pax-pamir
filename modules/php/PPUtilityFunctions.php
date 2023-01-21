<?php

trait PPUtilityFunctionsTrait
{

  //////////////////////////////////////////////////////////////////////////////
  //////////// Utility functions
  ////////////    

  /**
   * Generic functions
   */

  function array_find(array $array, callable $fn)
  {
    foreach ($array as $value) {
      if ($fn($value)) {
        return $value;
      }
    }
    return null;
  }

  function array_find_index(array $array, callable $fn)
  {
    foreach ($array as $index => $value) {
      if ($fn($value)) {
        return $index;
      }
    }
    return null;
  }

  function array_some(array $array, callable $fn)
  {
    foreach ($array as $value) {
      if ($fn($value)) {
        return true;
      }
    }
    return false;
  }

  function array_every(array $array, callable $fn)
  {
    foreach ($array as $value) {
      if (!$fn($value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Save (insert or update) any object/array as variable.
   */
  function setGlobalVariable(string $name, /*object|array*/ $obj)
  {
    $jsonObj = json_encode($obj);
    $this->DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
  }

  /**
   * Return a variable object/array.
   * To force object/array type, set $asArray to false/true.
   */
  function getGlobalVariable(string $name, $asArray = null)
  {
    $json_obj = $this->getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
    if ($json_obj) {
      $object = json_decode($json_obj, $asArray);
      return $object;
    } else {
      return null;
    }
  }

  /**
   * Delete a variable object/array.
   */
  function deleteGlobalVariable(string $name)
  {
    $this->DbQuery("DELETE FROM `global_variables` where `name` = '$name'");
  }

  function getPlayersIds()
  {
    return array_keys($this->loadPlayersBasicInfos());
  }

  function getPlayerCount()
  {
    return count($this->getPlayersIds());
  }

  function getPlayerName(int $playerId)
  {
    return self::getUniqueValueFromDb("SELECT player_name FROM player WHERE player_id = $playerId");
  }

  function getPlayerScore(int $playerId)
  {
    return $this->getUniqueIntValueFromDB("SELECT player_score FROM player where `player_id` = $playerId");
  }

  function incScore(int $playerId, int $delta, $message = null, $messageArgs = [])
  {
    self::DbQuery("UPDATE player SET `player_score` = `player_score` + $delta where `player_id` = $playerId");

    self::notifyAllPlayers('points', $message !== null ? $message : '', [
      'playerId' => $playerId,
      'player_name' => $this->getPlayerName($playerId),
      'points' => $this->getPlayerScore($playerId),
      'delta' => $delta,
    ] + $messageArgs);
  }

  function getUniqueIntValueFromDB(string $sql)
  {
    return intval(self::getUniqueValueFromDB($sql));
  }


  /**
   * Validate card action
   */
  function isValidCardAction($card_id, $card_action)
  {
    self::dump("cardAction: card_id", $card_id);
    self::dump("cardAction: card_action", $card_action);

    $token_info = $this->tokens->getTokenInfo($card_id);
    $card_info = $this->cards[$card_id];
    $player_id = self::getActivePlayerId();
    $location_info = explode("_", $token_info['location']);

    // Checks to determine if it is a valid action
    // Card should be in players court
    if ($location_info[0] != 'court' || $location_info[1] != $player_id) {
      throw new feException("Not a valid card action for player.");
    }
    // Card should not have been used yet
    if ($token_info['used'] != 0) {
      throw new feException("Card has already been used this turn.");
    }
    // Card should have the card action
    if (!isset($card_info['actions'][$card_action])) {
      throw new feException("Action does not exist on selected card.");
    }

    // $next_state = 'action';
    if (!($this->getGameStateValue("remaining_actions") > 0 || $this->suits[$this->getGameStateValue("favored_suit")]['suit'] == $card_info['suit'])) {
      throw new feException("No remaining actions and not a free action.");
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

  /**
   * Returns card info from material.inc.php file.
   * Input is row from token table
   */
  function getCardInfo($token)
  {
    return $this->cards[$token['key']];
  }


  // /**
  //  * Get current score for player
  //  */
  // function getPlayerScore($player_id)
  // {
  //   $sql = "SELECT player_score FROM player WHERE  player_id='$player_id' ";
  //   return $this->getUniqueValueFromDB($sql);
  // }



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
