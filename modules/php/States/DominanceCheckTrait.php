<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait DominanceCheckTrait
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
        $player = Players::get($player_id);
        if ($player->getLoyalty() == $dominant_coalition) {
          $loyal_players[] = array(
            'player_id' => $player_id,
            'count' => $player->getInfluence(),
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

// .##.....##.########.####.##.......####.########.##....##
// .##.....##....##.....##..##........##.....##.....##..##.
// .##.....##....##.....##..##........##.....##......####..
// .##.....##....##.....##..##........##.....##.......##...
// .##.....##....##.....##..##........##.....##.......##...
// .##.....##....##.....##..##........##.....##.......##...
// ..#######.....##....####.########.####....##.......##...

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
        $current_score = Players::get($player_id)->getScore();
        $scores[$player_id] = array(
          'player_id' => $player_id,
          'current_score' => $current_score,
          'new_score' => $current_score + $points_per_player,
        );
        Players::get($player_id)->incScore($points_per_player);
      }

      // Slice data that was just used from arrays
      $available_points = array_slice($available_points, $count_same_score);
      $player_ranking = array_slice($player_ranking, $count_same_score);
    };
    return $scores;
  }

  function handleSuccessfulDominanceCheck()
  {
    $moves = array();
    // return all coalition blocks to their pools
    $afghan_blocks = Tokens::getInLocation('block_afghan');
    foreach ($afghan_blocks as $token_id => $token_info) {
      if (!$this->startsWith($token_info['location'], "blocks")) {
        $moves[] = array(
          'token_id' => $token_id,
          'from' => $token_info['location'],
          'to' => BLOCKS_AFGHAN_SUPPLY
        );
        Tokens::move($token_id, BLOCKS_AFGHAN_SUPPLY);
      };
    };

    $russian_blocks = Tokens::getInLocation('block_russian');
    foreach ($russian_blocks as $token_id => $token_info) {
      if (!$this->startsWith($token_info['location'], "blocks")) {
        $moves[] = array(
          'token_id' => $token_id,
          'from' => $token_info['location'],
          'to' => BLOCKS_RUSSIAN_SUPPLY
        );
        Tokens::move($token_id, BLOCKS_RUSSIAN_SUPPLY);
      };
    };

    $british_blocks = Tokens::getInLocation('block_british');
    foreach ($british_blocks as $token_id => $token_info) {
      if (!$this->startsWith($token_info['location'], "blocks")) {
        $moves[] = array(
          'token_id' => $token_id,
          'from' => $token_info['location'],
          'to' => BLOCKS_BRITISH_SUPPLY
        );
        Tokens::move($token_id, BLOCKS_BRITISH_SUPPLY);
      };
    };

    return $moves;
  }
}
