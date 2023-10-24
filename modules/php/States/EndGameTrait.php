<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Stats;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait EndGameTrait
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

  /**
   * At end of the game calculate tie breakers for each player and set scores.
   */
  function stCalculateTieBreaker()
  {
    $players = PaxPamirPlayers::getAll()->toArray();

    if (count(Players::getAll()->toArray()) === 1) {
      $this->setSoloPlayerScore($players);
    } else {
      $this->setPlayerScores($players);
    }

    $this->nextState('endGame');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function setPlayerScores($players)
  {
    foreach ($players as $index => $player) {
      if ($player->isWakhan()) {
        continue;
      }
      $playerScoreAux = $this->getPlayerTieBreaker($player);

      Players::setPlayerScore($player->getId(), $player->getScore());
      Players::setPlayerScoreAux($player->getId(), $playerScoreAux);
    }

    if (Globals::getWakhanEnabled()) {
      $this->setWakhanWinsStat();
    }
  }

  function setSoloPlayerScore($players)
  {
    $wakhan = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $wakhanScore = $wakhan->getScore();
    $wakhanTieBreaker = $this->getPlayerTieBreaker($wakhan);

    foreach ($players as $index => $player) {
      if ($player->isWakhan()) {
        continue;
      }
      $playerScore = $player->getScore() - $wakhanScore;
      $playerScoreAux = $this->getPlayerTieBreaker($player);
      if ($playerScore === 0 && $playerScoreAux >= $wakhanTieBreaker) {
        $playerScore = 1;
      }
  
      Players::setPlayerScore($player->getId(), $playerScore);
      Players::setPlayerScoreAux($player->getId(), $playerScoreAux);
  
      if ($playerScore <= 0) {
        Stats::setWakhanWins(1);
      }
    }
  }

  function setWakhanWinsStat()
  {
    $wakhan = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $wakhanScore = $wakhan->getScore();
    $wakhanTieBreaker = $this->getPlayerTieBreaker($wakhan);


    $players = Players::getAll()->toArray();

    $playerBeatWakhan = Utils::array_some($players, function ($player) use ($wakhanScore, $wakhanTieBreaker) {
      $playerScore = $player->getScore();
      $playerScoreAux = $player->getScoreAux();
      $playerBeatWakhan = $playerScore > $wakhanScore;
      $playerWinsTieBreaker = $playerScore === $wakhanScore && $playerScoreAux > $wakhanTieBreaker;
      return $playerBeatWakhan || $playerWinsTieBreaker;
    });

    if (!$playerBeatWakhan) {
      Stats::setWakhanWins(1);
    }
  }

  function getPlayerTieBreaker($player)
  {
    $militaryTotal = $player->getSuitTotals()[MILITARY];
    $rupees = $player->getRupees();
    return $militaryTotal * 100 + $rupees;
  }
}
