<?php

namespace PaxPamir\Managers;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Preferences;
use PaxPamir\Helpers\Collection;

/*
 * Players manager : allows to easily access players ...
 *  a player is an instance of Player class
 */

class Players extends \PaxPamir\Helpers\DB_Manager
{
  protected static $table = 'player';
  protected static $primary = 'player_id';
  protected static function cast($row)
  {
    return new \PaxPamir\Models\Player($row);
  }

  public static function setupNewGame($players, $options)
  {
    // Create players
    $gameInfos = Game::get()->getGameinfos();
    $colors = $gameInfos['player_colors'];
    $query = self::DB()->multipleInsert([
      'player_id',
      'player_color',
      'player_canal',
      'player_name',
      'player_avatar',
      'player_score',
      'rupees'
    ]);

    $values = [];
    foreach ($players as $pId => $player) {
      $color = array_shift($colors);
      $values[] = [$pId, $color, $player['player_canal'], $player['player_name'], $player['player_avatar'], 0, 4];
    }
    $query->values($values);

    Game::get()->reattributeColorsBasedOnPreferences($players, $gameInfos['player_colors']);
    Game::get()->reloadPlayersBasicInfos();
  }

  public static function getActiveId()
  {
    return (int) Game::get()->getActivePlayerId();
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
    return self::DB()->update(['rupees' => $value], $pId);
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
    return self::DB()->update(['loyalty' => $coalition], $pId);
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

  public function getNextId($player)
  {
    $pId = is_int($player) ? $player : $player->getId();

    $table = Game::get()->getNextPlayerTable();
    return (int) $table[$pId];
  }

  public function getPrevId($player)
  {
    $pId = is_int($player) ? $player : $player->getId();

    $table = Game::get()->getPrevPlayerTable();
    $pId = (int) $table[$pId];

    return $pId;
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
