<?php

namespace PaxPamir\Managers;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Preferences;
use PaxPamir\Helpers\Collection;
use PaxPamir\Helpers\Utils;

/*
 * PaxPamir Players manager : allows to easily access players, including automas
 */

class PaxPamirPlayers extends \PaxPamir\Helpers\DB_Manager
{
  protected static $table = 'player_extra';
  protected static $primary = 'player_id';
  protected static function cast($row)
  {
    return new \PaxPamir\Models\PaxPamirPlayer($row);
  }

  // setup player. Arguments for score, score_aux, rupees, loyalty added so we can use function for db upgrade for games in progress
  public static function setupPlayer($player, $player_score = 0, $player_score_aux = 0, $player_rupees = 4, $player_loyalty = null)
  {
    $playerId = $player->getId();
    self::DB()->insert([
      'player_id' => $playerId,
      'player_name' => $player->getName(),
      'player_avatar' => $player->getAvatar(),
      'player_hex_color' => $player->getColor(),
      'player_color' => COLOR_MAP[$player->getColor()],
      'player_no' => $player->getNo(),
      'player_score' => $player_score,
      'player_score_aux' => $player_score_aux,
      'player_rupees' => $player_rupees,
      'player_loyalty' => $player_loyalty
    ]);

    self::setupTokens($playerId);
  }

  public static function setupTokens($pId)
  {
    Tokens::create([
      [
        "id" => "cylinder_" . $pId . "_{INDEX}",
        "nbr" => 10,
        "nbrStart" => 1,
        "location" => "cylinders_" . $pId,
        "used" => 0,
      ]
    ]);
    Tokens::shuffle("cylinders_" . $pId);
  }

  public static function setupWakhan()
  {
    $humanPlayers = self::getAll();
    foreach ($humanPlayers as $playerId => $player) {
      if ($player->getNo() === 2) {
        $player->setNo(3);
      }
    }
    self::DB()->insert([
      'player_id' => WAKHAN_PLAYER_ID,
      'player_name' => 'Wakhan',
      'player_avatar' => '000000', // Check if we can use an avatar?
      'player_hex_color' => '8A70B2',
      'player_color' => COLOR_MAP['8A70B2'],
      'player_no' => 2,
      'player_score' => 0,
      'player_score_aux' => 0,
      'player_rupees' => 4,
      'player_loyalty' => null
    ]);
    self::setupTokens(WAKHAN_PLAYER_ID);
  }



  public static function getActiveId()
  {
    if (Globals::getWakhanActive() === true) {
      return WAKHAN_PLAYER_ID;
    } else {
      return (int) Game::get()->getActivePlayerId();
    }

  }

  public static function getCurrentId()
  {
    return Game::get()->getCurrentPId();
  }

  public static function getAll()
  {
    $players = self::DB()->get(false);
    return $players;
  }

  /*
   * get : returns the Player object for the given player ID
   */
  public static function get($pId = null)
  {
    $pId = $pId ?: self::getActiveId();
    return self::DB()
      ->where($pId)
      ->getSingle();
  }

  /*
   * Workaroud function since db calls from Player model don't seem to be logged
   * TODO: check if we can handle it from Player model
   */
  public static function incRupees($pId, $increment)
  {
    $value = self::get($pId)->getRupees() + $increment;
    return self::DB()->update(['player_rupees' => $value], $pId);
  }

  public static function incScore($pId, $increment)
  {
    $value = self::get($pId)->getScore() + $increment;
    return self::DB()->update(['player_score' => $value], $pId);
  }

  public static function setPlayerScoreAux($pId, $value)
  {
    return self::DB()->update(['player_score_aux' => $value], $pId);
  }

  public static function setLoyalty($pId, $coalition)
  {
    return self::DB()->update(['player_loyalty' => $coalition], $pId);
  }

  public function getMany($pIds)
  {
    $players = self::DB()
      ->whereIn($pIds)
      ->get();
    return $players;
  }

  public static function getActive()
  {
    return self::get();
  }

  public static function getCurrent()
  {
    return self::get(self::getCurrentId());
  }

  public static function getPlayerOrder()
  {
    $players = self::getAll()->toArray();
    usort($players, function ($a, $b) {
      return $a->getNo() - $b->getNo();
    });
    $playerOrder = array_map(function ($player) {
      return $player->getId();
    }, $players);
    return $playerOrder;
  }

  public static function getNextId($player)
  {
    $pId = is_int($player) ? $player : $player->getId();

    $players = self::getAll()->toArray();
    usort($players, function ($a, $b) {
      return $a->getNo() - $b->getNo();
    });

    $playerIndex = Utils::array_find_index($players, function ($player) use ($pId) {
      return $player->getId() === $pId;
    });

    if ($playerIndex === count($players) - 1) {
      return $players[0]->getId();
    } else {
      return $players[$playerIndex + 1]->getId();
    }
  }

  public static function getPrevId($player)
  {
    $pId = is_int($player) ? $player : $player->getId();

    $players = self::getAll()->toArray();
    usort($players, function ($a, $b) {
      return $a->getNo() - $b->getNo();
    });

    $playerIndex = Utils::array_find_index($players, function ($player) use ($pId) {
      return $player->getId() === $pId;
    });

    if ($playerIndex === 0) {
      return $players[count($players) - 1]->getId();
    } else {
      return $players[$playerIndex - 1]->getId();
    }
  }

  /*
   * Return the number of players
   */
  public function count()
  {
    return self::DB()->count();
  }

  /*
   * getUiData : get all ui data of all players
   */
  public static function getUiData($pId)
  {
    return self::getAll()->map(function ($player) use ($pId) {
      return $player->jsonSerialize($pId);
    });
  }

  /**
   * This activate next player
   */
  public function activeNext()
  {
    $pId = self::getActiveId();
    $nextPlayer = self::getNextId((int) $pId);

    Game::get()->gamestate->changeActivePlayer($nextPlayer);
    return $nextPlayer;
  }

  /**
   * This allow to change active player
   */
  public function changeActive($pId)
  {
    Game::get()->gamestate->changeActivePlayer($pId);
  }
}
