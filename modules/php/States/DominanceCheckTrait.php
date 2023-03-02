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
    $coalitionBlockCounts = array();
    $i = 0;
    foreach ($this->locations['pools'] as $coalitionId => $coalitionPool) {
      $coalitionBlockCounts[$i] = array(
        'count' => Tokens::countInLocation($coalitionPool),
        'coalition' => $coalitionId,
      );
      $i += 1;
    }
    // sort array lowest to highest. Since we count remaining blocks the coalition with the lowest
    // number has the most blocks in play
    usort($coalitionBlockCounts, function ($a, $b) {
      return $a['count'] - $b['count'];
    });
    $checkSuccessful = $coalitionBlockCounts[1]['count'] - $coalitionBlockCounts[0]['count'] >= 4;

    // scores object which will be returned with notification
    $scores = array();
    $moves = array();
    if ($checkSuccessful) {
      $dominantCoalition =  $coalitionBlockCounts[0]['coalition'];
      $players = $this->loadPlayersBasicInfos();

      // Create array of players loyal to dominant coalition and their total influence
      $loyalPlayers = array();
      foreach ($players as $playerId => $playerInfo) {
        $player = Players::get($playerId);
        if ($player->getLoyalty() == $dominantCoalition) {
          $loyalPlayers[] = array(
            'playerId' => $playerId,
            'count' => $player->getInfluence(),
          );
        }
      };

      // Sort array so leader is at position 0
      usort($loyalPlayers, function ($a, $b) {
        return $b['count'] - $a['count'];
      });

      $availablePoints = [5, 3, 1];
      if (Globals::getDominanceChecksResolved() == 4) {
        $availablePoints = [10, 6, 2];
      }
      $scores = $this->determineVictoryPoints($loyalPlayers, $availablePoints);
      $moves = $this->handleSuccessfulDominanceCheck();
    } else {
      // Determine numer of cylinders in play by each player
      $cylinderCounts = $this->getCylindersInPlayPerPlayer();

      // Sort array so player with highest number is at 0.
      usort($cylinderCounts, function ($a, $b) {
        return $b['count'] - $a['count'];
      });

      // Determine VPs
      $availablePoints = [3, 1];
      if (Globals::getDominanceChecksResolved() == 4) {
        $availablePoints = [6, 2];
      }
      $scores = $this->determineVictoryPoints($cylinderCounts, $availablePoints);
    }
    self::notifyAllPlayers("dominanceCheck", clienttranslate('A Dominance Check has been resolved.'), array(
      'scores' => $scores,
      'successful' => $checkSuccessful,
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
    foreach ($players as $playerId => $playerInfo) {
      $counts[$i] = array(
        'count' => 10 - Tokens::countInLocation(['cylinders', $playerId]),
        'playerId' => $playerId,
      );
      $i += 1;
    }

    return $counts;
  }

  /**
   * Calculates VPs based on an array with available point [5,3,1] and 
   * a ranking of players and count with first player on position 0.
   */
  function determineVictoryPoints($playerRanking, $availablePoints)
  {
    $scores = array();
    while (count($availablePoints) > 0 && count($playerRanking) > 0) {
      $currentHighestInfluence = $playerRanking[0]['count'];

      // Filter to get all players with the same score as the leading player
      $sameScore = array_filter($playerRanking, function ($element) use ($currentHighestInfluence) {
        return $element['count'] == $currentHighestInfluence;
      });
      $countSameScore = count($sameScore);

      // Calculate points earned per player based on numer of players
      $totalPoints = 0;
      for ($i = 0; $i < $countSameScore; $i++) {
        $totalPoints += $availablePoints[$i];
      }
      $pointsPerPlayer = floor($totalPoints / $countSameScore);

      // Update database and add data to scores object for notifictation
      for ($i = 0; $i < $countSameScore; $i++) {
        $playerId = $playerRanking[$i]['playerId'];
        $currentScore = Players::get($playerId)->getScore();
        $scores[$playerId] = array(
          'playerId' => $playerId,
          'currentScore' => $currentScore,
          'newScore' => $currentScore + $pointsPerPlayer,
        );
        Players::get($playerId)->incScore($pointsPerPlayer);
      }

      // Slice data that was just used from arrays
      $availablePoints = array_slice($availablePoints, $countSameScore);
      $playerRanking = array_slice($playerRanking, $countSameScore);
    };
    return $scores;
  }

  function handleSuccessfulDominanceCheck()
  {
    $moves = array();
    // return all coalition blocks to their pools
    $afghanBlocks = Tokens::getInLocation(BLOCKS_AFGHAN_SUPPLY);
    foreach ($afghanBlocks as $tokenId => $tokenInfo) {
      if (!$this->startsWith($tokenInfo['location'], "blocks")) {
        $moves[] = array(
          'tokenId' => $tokenId,
          'from' => $tokenInfo['location'],
          'to' => BLOCKS_AFGHAN_SUPPLY
        );
        Tokens::move($tokenId, BLOCKS_AFGHAN_SUPPLY);
      };
    };

    $russianBlocks = Tokens::getInLocation(BLOCKS_RUSSIAN_SUPPLY);
    foreach ($russianBlocks as $tokenId => $tokenInfo) {
      if (!$this->startsWith($tokenInfo['location'], "blocks")) {
        $moves[] = array(
          'tokenId' => $tokenId,
          'from' => $tokenInfo['location'],
          'to' => BLOCKS_RUSSIAN_SUPPLY
        );
        Tokens::move($tokenId, BLOCKS_RUSSIAN_SUPPLY);
      };
    };

    $britishBlocks = Tokens::getInLocation(BLOCKS_BRITISH_SUPPLY);
    foreach ($britishBlocks as $tokenId => $tokenInfo) {
      if (!$this->startsWith($tokenInfo['location'], "blocks")) {
        $moves[] = array(
          'tokenId' => $tokenId,
          'from' => $tokenInfo['location'],
          'to' => BLOCKS_BRITISH_SUPPLY
        );
        Tokens::move($tokenId, BLOCKS_BRITISH_SUPPLY);
      };
    };

    return $moves;
  }
}
