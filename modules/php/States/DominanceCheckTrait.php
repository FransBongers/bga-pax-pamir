<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
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
    $this->resolveDominanceCheck();

    // TODO: Frans: if one player leads by 4 or more end the game
    if ($this->didPlayerWin() && false) {
      $this->nextState('endGame');
    } else {
      $this->gamestate->nextState('playerActions');
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function resolveDominanceCheck()
  {
    // TODO: increase by 2 in case of instability
    Globals::incDominanceChecksResolved(1);
    Notifications::message('A Dominance Check is resolved');
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

    $requiredDifferenceToBeDominant = Events::isConflictFatigueActive() ? 2 : 4;
    $checkSuccessful = $coalitionBlockCounts[1]['count'] - $coalitionBlockCounts[0]['count'] >= $requiredDifferenceToBeDominant;
    $dominantCoalition = null;

    // scores object which will be returned with notification
    $scores = array();

    if ($checkSuccessful) {
      $dominantCoalition =  $coalitionBlockCounts[0]['coalition'];
      // Notifications::dominanceCheckSuccessful($dominantCoalition);
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
    } else {
      // Notifications::dominanceUnsuccessful();
      // Determine number of cylinders in play by each player
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

    // Notifications::dominanceCheckScores($scores,$moves);
    Notifications::dominanceCheckResult($scores, $checkSuccessful, $dominantCoalition);

    // self::notifyAllPlayers("dominanceCheck", clienttranslate('A Dominance Check has been resolved.'), array(
    //   'scores' => $scores,
    //   'successful' => $checkSuccessful,
    //   'moves' => $moves,
    // ));
    if ($checkSuccessful) {
      $this->returnCoalitionBlocks();
    };
    $this->returnEventCards();
    $this->afterDominanceCheckAbilities();
  }

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
    $scores = [];
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
        $totalPoints += array_key_exists($i, $availablePoints) ? $availablePoints[$i] : 0;
      }
      $pointsPerPlayer = floor($totalPoints / $countSameScore);

      if ($pointsPerPlayer > 0) {
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
      }

      // Slice data that was just used from arrays
      $availablePoints = array_slice($availablePoints, $countSameScore);
      $playerRanking = array_slice($playerRanking, $countSameScore);
    };
    return $scores;
  }

  function returnCoalitionBlocks()
  {
    $moves = [];
    // return all coalition blocks to their pools
    $afghanBlocks = Tokens::getOfType('block_' . AFGHAN);
    foreach ($afghanBlocks as $index => $tokenInfo) {
      if (!Utils::startsWith($tokenInfo['location'], "blocks")) {
        $weight = Tokens::insertOnTop($tokenInfo['id'], BLOCKS_AFGHAN_SUPPLY);
        $moves[] = array(
          'tokenId' => $tokenInfo['id'],
          'from' => $tokenInfo['location'],
          'to' => BLOCKS_AFGHAN_SUPPLY,
          'weight' => $weight
        );
      };
    };
    

    $russianBlocks = Tokens::getOfType('block_' . RUSSIAN);
    Notifications::log('russianBlocks', $russianBlocks);
    foreach ($russianBlocks as $index => $tokenInfo) {
      if (!Utils::startsWith($tokenInfo['location'], "blocks")) {
        $weight = Tokens::insertOnTop($tokenInfo['id'], BLOCKS_RUSSIAN_SUPPLY);
        $moves[] = array(
          'tokenId' =>  $tokenInfo['id'],
          'from' => $tokenInfo['location'],
          'to' => BLOCKS_RUSSIAN_SUPPLY,
          'weight' => $weight
        );
      };
    };

    $britishBlocks = Tokens::getOfType('block_' . BRITISH);
    Notifications::log('britishBlocks', $britishBlocks);
    foreach ($britishBlocks as $index => $tokenInfo) {
      if (!Utils::startsWith($tokenInfo['location'], "blocks")) {
        $weight = Tokens::insertOnTop($tokenInfo['id'], BLOCKS_BRITISH_SUPPLY);
        $moves[] = array(
          'tokenId' =>  $tokenInfo['id'],
          'from' => $tokenInfo['location'],
          'to' => BLOCKS_BRITISH_SUPPLY,
          'weight' => $weight
        );
      };
    };
    Notifications::dominanceCheckReturnCoalitionBlocks($moves);
  }

  function returnEventCards()
  {
  }

  function afterDominanceCheckAbilities()
  {
    // SA_INSURRECTION
    // TODO (Frans): action stack so pieces can be selected if needed
    $card = Cards::get('card_3');
    if(Utils::startsWith($card['location'],'court')) {
      $playerId = intval(explode('_',$card['location'])[1]);
      $this->resolvePlaceArmy(KABUL,null,$playerId);
      $this->resolvePlaceArmy(KABUL,null,$playerId);
    }
  }

  function didPlayerWin()
  {
    $players = Players::getAll()->toArray();
    usort($players,function ($a,$b) {
      return $b->getScore() - $a->getScore();
    });
    Notifications::log('player',$players);
    if ($players[0]->getScore() - $players[1]->getScore() >= 4) {
      return true;
    };
    return false;
    // Notifications::log('score',$players[0]->getScore());
  }
}
