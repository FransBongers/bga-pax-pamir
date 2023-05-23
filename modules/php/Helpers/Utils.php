<?php

namespace PaxPamir\Helpers;

abstract class Utils extends \APP_DbObject
{


  public static function die($args = null)
  {
    if (is_null($args)) {
      throw new \BgaVisibleSystemException(implode('<br>', self::$logmsg));
    }
    throw new \BgaVisibleSystemException(json_encode($args));
  }

  // ....###....########..########.....###....##....##
  // ...##.##...##.....##.##.....##...##.##....##..##.
  // ..##...##..##.....##.##.....##..##...##....####..
  // .##.....##.########..########..##.....##....##...
  // .#########.##...##...##...##...#########....##...
  // .##.....##.##....##..##....##..##.....##....##...
  // .##.....##.##.....##.##.....##.##.....##....##...

  public static function filter($data, $filter)
  {
    return array_values(array_filter($data, $filter));
  }


  public static function diff(&$data, $arr)
  {
    $data = array_values(array_diff($data, $arr));
  }

  public static function shuffle_assoc(&$array)
  {
    $keys = array_keys($array);
    shuffle($keys);

    foreach ($keys as $key) {
      $new[$key] = $array[$key];
    }

    $array = $new;
    return true;
  }

  public static function array_find(array $array, callable $fn)
  {
    foreach ($array as $value) {
      if ($fn($value)) {
        return $value;
      }
    }
    return null;
  }

  public static function array_find_index(array $array, callable $fn)
  {
    foreach ($array as $index => $value) {
      if ($fn($value)) {
        return $index;
      }
    }
    return null;
  }

  public static function array_some(array $array, callable $fn)
  {
    foreach ($array as $value) {
      if ($fn($value)) {
        return true;
      }
    }
    return false;
  }

  public static function array_every(array $array, callable $fn)
  {
    foreach ($array as $value) {
      if (!$fn($value)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check is string starts with a specific substring. Returns boolean
   */
  public static function startsWith($string, $startString)
  {
    $len = strlen($startString);
    return (substr($string, 0, $len) === $startString);
  }

  // .##........#######...######......########..#######..##....##.########.##....##..######.
  // .##.......##.....##.##....##........##....##.....##.##...##..##.......###...##.##....##
  // .##.......##.....##.##..............##....##.....##.##..##...##.......####..##.##......
  // .##.......##.....##.##...####.......##....##.....##.#####....######...##.##.##..######.
  // .##.......##.....##.##....##........##....##.....##.##..##...##.......##..####.......##
  // .##.......##.....##.##....##........##....##.....##.##...##..##.......##...###.##....##
  // .########..#######...######.........##.....#######..##....##.########.##....##..######.


  // const LOG_TOKEN_ARMY = 'army';
  // const LOG_TOKEN_CARD = 'card';
  // const LOG_TOKEN_LARGE_CARD = 'largeCard';
  // const LOG_TOKEN_CARD_NAME = 'cardName';
  // const LOG_TOKEN_COALITION = 'coalition';
  // const LOG_TOKEN_FAVORED_SUIT = 'favoredSuit';
  // const LOG_TOKEN_ROAD = 'road';
  // const LOG_TOKEN_CYLINDER = 'cylinder';
  // const LOG_TOKEN_PLAYER_NAME = 'playerName';
  // const LOG_TOKEN_REGION_NAME = 'regionName';

  public static function logTokenArmy($coalition)
  {
    return implode(':', [LOG_TOKEN_ARMY, $coalition]);
  }

  public static function logTokenCard($cardId)
  {
    return implode(':', [LOG_TOKEN_CARD, $cardId]);
  }

  public static function logTokenLargeCard($cardId)
  {
    return implode(':', [LOG_TOKEN_LARGE_CARD, $cardId]);
  }

  // TODO: replace with cardId as input?
  public static function logTokenCardName($cardName)
  {
    return implode(':', [LOG_TOKEN_CARD_NAME, $cardName]);
  }

  public static function logTokenCoalition($coalition)
  {
    return implode(':', [LOG_TOKEN_COALITION, $coalition]);
  }

  public static function logTokenCylinder($playerId)
  {
    return implode(':', [LOG_TOKEN_CYLINDER, $playerId]);
  }

  public static function logFavoredSuit($suitId)
  {
    return implode(':', [LOG_TOKEN_FAVORED_SUIT, $suitId]);
  }

  public static function logTokenLeverage()
  {
    return implode(':', [LOG_TOKEN_LEVERAGE, '']);
  }

  public static function logTokenNewLine()
  {
    return implode(':', [LOG_TOKEN_NEW_LINE, '']);
  }

  public static function logTokenPlayerName($playerId)
  {
    return implode(':', [LOG_TOKEN_PLAYER_NAME, $playerId]);
  }

  public static function logTokenRoad($coalition)
  {
    return implode(':', [LOG_TOKEN_ROAD, $coalition]);
  }

  public static function logTokenRegionName($regionId)
  {
    return implode(':', [LOG_TOKEN_REGION_NAME, $regionId]);
  }

  public static function logTokenRupee()
  {
    return implode(':', [LOG_TOKEN_RUPEE, '']);
  }

  // .##.....##.########.##.......########..########.########...######.
  // .##.....##.##.......##.......##.....##.##.......##.....##.##....##
  // .##.....##.##.......##.......##.....##.##.......##.....##.##......
  // .#########.######...##.......########..######...########...######.
  // .##.....##.##.......##.......##........##.......##...##.........##
  // .##.....##.##.......##.......##........##.......##....##..##....##
  // .##.....##.########.########.##........########.##.....##..######.

  public static function isBlock($pieceId)
  {
    return Utils::startsWith($pieceId, "block");
  }

  public static function isCylinder($pieceId)
  {
    return Utils::startsWith($pieceId, "cylinder");
  }

  // .##.....##....###....##.......####.########.....###....########.####..#######..##....##
  // .##.....##...##.##...##........##..##.....##...##.##......##.....##..##.....##.###...##
  // .##.....##..##...##..##........##..##.....##..##...##.....##.....##..##.....##.####..##
  // .##.....##.##.....##.##........##..##.....##.##.....##....##.....##..##.....##.##.##.##
  // ..##...##..#########.##........##..##.....##.#########....##.....##..##.....##.##..####
  // ...##.##...##.....##.##........##..##.....##.##.....##....##.....##..##.....##.##...###
  // ....###....##.....##.########.####.########..##.....##....##....####..#######..##....##

  public static function validateJSonAlphaNum($value, $argName = 'unknown')
  {
    if (is_array($value)) {
      foreach ($value as $key => $v) {
        Utils::validateJSonAlphaNum($key, $argName);
        Utils::validateJSonAlphaNum($v, $argName);
      }
      return true;
    }
    if (is_int($value)) {
      return true;
    }
    $bValid = preg_match("/^[_0-9a-zA-Z- ]*$/", $value) === 1;
    if (!$bValid) {
      throw new BgaSystemException("Bad value for: $argName", true, true, FEX_bad_input_argument);
    }
    return true;
  }
}
