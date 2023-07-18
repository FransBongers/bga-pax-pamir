<?php

namespace PaxPamir\Managers;

use PaxPamir\Core\Globals;
use PaxPamir\Core\Game;
use PaxPamir\Core\Notifications;
use PaxPamir\Managers\Players;
use PaxPamir\Helpers\Utils;

/**
 * Tokens
 */
class Tokens extends \PaxPamir\Helpers\Pieces
{
  protected static $table = 'tokens';
  protected static $prefix = 'token_';
  protected static $customFields = ['used'];
  protected static $autoreshuffle = false;
  protected static $autoIncrement = false;
  protected static function cast($token)
  {
    return [
      'id' => $token['id'],
      'location' => $token['location'],
      'state' => intval($token['state']),
      'used' => intval($token['used']),
    ];
  }

  //////////////////////////////////
  //////////////////////////////////
  //////////// GETTERS //////////////
  //////////////////////////////////
  //////////////////////////////////

  /**
   * getOfPlayer: return the cards in the hand of given player
   */
  // public static function getOfPlayer($pId)
  // {
  //   return self::getInLocation(['hand', $pId]);
  // }

  public static function getOfType($type)
  {
    return self::getSelectQuery()
      ->where(static::$prefix . 'id', 'LIKE', $type . '%')
      ->get()
      ->toArray();
  }

  // public static function getOfTypeInLocation($type, $location)
  // {
  //   return self::getSelectQuery()
  //     ->where(static::$prefix . 'id', 'LIKE', $type . '%')
  //     ->where(static::$prefix . 'location', $location)
  //     ->get()
  //     ->toArray();
  // }

  //////////////////////////////////
  //////////////////////////////////
  ///////////// SETTERS //////////////
  //////////////////////////////////
  //////////////////////////////////

  /**
   * setupNewGame: create the deck of cards
   */
  public static function setupNewGame($players, $options)
  {
    self::createTokens(count($players));
  }

  private function createTokens()
  {
    $tokens = [];
    array_push($tokens, [
      "id" => "rupee_{INDEX}",
      "nbr" => 36,
      "nbrStart" => 1,
      "location" => RUPEE_SUPPLY,
      "used" => 0,
    ]);
    array_push($tokens, [
      "id" => "block_afghan_{INDEX}",
      "nbr" => 12,
      "nbrStart" => 1,
      "location" => BLOCKS_AFGHAN_SUPPLY,
      "used" => 0,
    ]);
    array_push($tokens, [
      "id" => "block_british_{INDEX}",
      "nbr" => 12,
      "nbrStart" => 1,
      "location" => BLOCKS_BRITISH_SUPPLY,
      "used" => 0,
    ]);
    array_push($tokens, [
      "id" => "block_russian_{INDEX}",
      "nbr" => 12,
      "nbrStart" => 1,
      "location" => BLOCKS_RUSSIAN_SUPPLY,
      "used" => 0,
    ]);
    self::create($tokens);
    self::shuffle(BLOCKS_AFGHAN_SUPPLY);
    self::shuffle(BLOCKS_BRITISH_SUPPLY);
    self::shuffle(BLOCKS_RUSSIAN_SUPPLY);
  }

  public static function setUsed($id, $value)
  {
    self::DB()->update([
      'used' => $value,
    ], $id);
  }

  public static function resetUsed()
  {
    self::DB()->update(['used' => 0])->run();
  }
}
