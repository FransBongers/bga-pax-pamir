<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait DominanceCheckTrait
{

  // .########..####..######..########.....###....########..######..##.....##
  // .##.....##..##..##....##.##.....##...##.##......##....##....##.##.....##
  // .##.....##..##..##.......##.....##..##...##.....##....##.......##.....##
  // .##.....##..##...######..########..##.....##....##....##.......#########
  // .##.....##..##........##.##........#########....##....##.......##.....##
  // .##.....##..##..##....##.##........##.....##....##....##....##.##.....##
  // .########..####..######..##........##.....##....##.....######..##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function dispatchDominanceCheckSetup($actionStack)
  {
    $action = array_pop($actionStack);
    $cards = $action['data']['cards'];
    $playerId = $action['playerId'];

    $actionStack = array_merge($actionStack, [
      ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_DISCARD_EVENTS_IN_PLAY, $playerId, []),
      ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_AFTER_ABILITIES, $playerId, []),
      ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_END_GAME_CHECK, $playerId, []),
      ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_RESOLVE, $playerId, [
        'cards' => $cards,
      ]),
    ]);
    ActionStack::next($actionStack);
  }


  function dispatchDominanceCheckResolve($actionStack)
  {
    $action = array_pop($actionStack);
    $cards = $action['data']['cards'];
    $playerId = $action['playerId'];

    Globals::incDominanceChecksResolved(count($cards));
    Notifications::message('A Dominance Check is resolved');

    // Determine if there is a dominant coalition
    $dominantCoalition = $this->getDominantCoalition();
    $checkSuccessful = $dominantCoalition !== null;

    // Determine scores
    $scores = $checkSuccessful ? $this->getScoresSuccessFulCheck($dominantCoalition) : $this->getScoresUnsuccessFulCheck();

    Notifications::dominanceCheckResult($scores, $checkSuccessful, $dominantCoalition);

    if ($checkSuccessful) {
      $actionStack[] = ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_REMOVE_COALITION_BLOCKS, $playerId, []);
    };
    ActionStack::next($actionStack);
  }


  function dispatchDominanceCheckRemoveCoalitionBlocks($actionStack)
  {
    $moves = array_merge(
      Map::removeAllBlocksForCoalition(AFGHAN),
      Map::removeAllBlocksForCoalition(BRITISH),
      Map::removeAllBlocksForCoalition(RUSSIAN)
    );
    Notifications::dominanceCheckReturnCoalitionBlocks($moves);
    array_pop($actionStack);
    ActionStack::next($actionStack);
  }


  function dispatchDominanceCheckEndGameCheck($actionStack)
  {
    if ($this->didPlayerWin()) {
      $this->nextState('endGame');
      return;
    }
    array_pop($actionStack);
    ActionStack::next($actionStack);
  }

  function dispatchDominanceCheckAfterAbilities($actionStack)
  {
    array_pop($actionStack);
    // SA_INSURRECTION
    // TODO (Frans): action stack so pieces can be selected if needed
    $card = Cards::get('card_3');
    if (Utils::startsWith($card['location'], 'court_')) {
      $playerId = intval(explode('_', $card['location'])[1]);
      Notifications::insurrection(Players::get($playerId));
      for ($i = 0; $i < 2; $i++) {
        $actionStack[] = ActionStack::createAction(
          DISPATCH_PLACE_ARMY,
          $playerId,
          [
            'region' => KABUL,
          ]
        );
      }
    }
    ActionStack::next($actionStack);
  }

  function dispatchDominanceCheckDiscardEventInPlay($actionStack)
  {
    array_pop($actionStack);

    $eventCardsPossiblyInPlay = ['card_105','card_106','card_107','card_108','card_109','card_110','card_112','card_115'];
    $eventCards = Cards::get($eventCardsPossiblyInPlay)->toArray();

    foreach(array_reverse($eventCards) as $index => $card)
    {
      $location = $card['location'];
      if(!($location === ACTIVE_EVENTS || Utils::startsWith($location, 'events_'))) {
        continue;
      };
      $isGlobalEvent = $location === ACTIVE_EVENTS;
      $cardOwnerId = Utils::startsWith($location, 'events_') ? intval(explode('_',$location)[1]) : null;
      $actionStack[] = ActionStack::createAction(DISPATCH_DISCARD_SINGLE_CARD,$isGlobalEvent ? Players::get()->getId() : $cardOwnerId,[
        'cardId' => $card['id'],
        'to' => DISCARD,
        'from' => $location,
      ]); 
    }

    ActionStack::next($actionStack);
  }



  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function getDominantCoalition()
  {
    // Determine number of blocks left for each pool
    $coalitionBlockCounts = [];
    foreach ($this->locations['pools'] as $coalitionId => $coalitionPool) {
      $coalitionBlockCounts[] = [
        'count' => Tokens::countInLocation($coalitionPool),
        'coalition' => $coalitionId,
      ];
    }

    // sort array lowest to highest. Since we count remaining blocks the coalition with the lowest
    // number has the most blocks in play
    usort($coalitionBlockCounts, function ($a, $b) {
      return $a['count'] - $b['count'];
    });

    $requiredDifferenceToBeDominant = Events::isConflictFatigueActive() ? 2 : 4;
    $checkSuccessful = $coalitionBlockCounts[1]['count'] - $coalitionBlockCounts[0]['count'] >= $requiredDifferenceToBeDominant;
    if ($checkSuccessful) {
      return $coalitionBlockCounts[0]['coalition'];
    }
    return null;
  }

  function getScoresSuccessFulCheck($dominantCoalition)
  {
    $players = Players::getAll();

    // Create array of players loyal to dominant coalition and their total influence
    $loyalPlayers = [];
    foreach ($players as $playerId => $player) {
      if ($player->getLoyalty() === $dominantCoalition) {
        $loyalPlayers[] = [
          'playerId' => $playerId,
          'count' => $player->getInfluence(),
        ];
      }
    };

    // Sort array so leader is at position 0
    usort($loyalPlayers, function ($a, $b) {
      return $b['count'] - $a['count'];
    });

    $availablePoints = Globals::getDominanceChecksResolved() === 4 ? [10, 6, 2] : [5, 3, 1];

    return $this->determineVictoryPoints($loyalPlayers, $availablePoints);
  }

  function getScoresUnsuccessFulCheck()
  {
    // Determine number of cylinders in play by each player
    $cylinderCounts = $this->getCylindersInPlayPerPlayer();

    // Sort array so player with highest number is at 0.
    usort($cylinderCounts, function ($a, $b) {
      return $b['count'] - $a['count'];
    });

    // Determine VPs
    $availablePoints = Globals::getDominanceChecksResolved() === 4 ? [6, 2] :  [3, 1];
    return $this->determineVictoryPoints($cylinderCounts, $availablePoints);
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


  function didPlayerWin()
  {
    if (Globals::getDominanceChecksResolved() >= 4) {
      return true;
    }
    $players = Players::getAll()->toArray();
    usort($players, function ($a, $b) {
      return $b->getScore() - $a->getScore();
    });
    if ($players[0]->getScore() - $players[1]->getScore() >= 4) {
      return true;
    };
    return false;
  }
}
