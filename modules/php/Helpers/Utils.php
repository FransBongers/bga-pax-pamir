<?php

namespace PaxPamir\Helpers;

use PaxPamir\Core\Globals;

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

  public static function array_is_list(array $arr)
  {
    if ($arr === []) {
      return true;
    }
    return array_keys($arr) === range(0, count($arr) - 1);
  }

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

  public static function getCardCostBase()
  {
    return Globals::getFavoredSuit() === MILITARY ? 2 : 1;
  }

  public static function getCardCost($player, $card)
  {
    if ($card['type'] === COURT_CARD && $card['region'] === HERAT && $player->hasSpecialAbility(SA_HERAT_INFLUENCE)) {
      return 0;
    };
    if ($card['type'] === COURT_CARD && $card['region'] === PERSIA && $player->hasSpecialAbility(SA_PERSIAN_INFLUENCE)) {
      return 0;
    };
    if ($card['type'] === COURT_CARD && $card['loyalty'] === RUSSIAN && $player->hasSpecialAbility(SA_RUSSIAN_INFLUENCE)) {
      return 0;
    };
    $column = intval(explode('_', $card['location'])[2]);
    return $column * Utils::getCardCostBase();
  }

  public static function getImpactIconCount($card, $icons)
  {
    $total = 0;
    $array_count_values = array_count_values($card['impactIcons']);
    foreach ($icons as $index => $icon) {
      $iconCount = isset($array_count_values[$icon]) ? $array_count_values[$icon] : 0;
      $total += $iconCount;
    }
    return $total;
  }

  public static function getPlayerIdForCylinderId($cylinderId)
  {
    return intval(explode('_', $cylinderId)[1]);
  }

  public static function getCoalitionForBlockId($blockId)
  {
    return explode('_', $blockId)[1];
  }

  public static function getBorderName($region1, $region2)
  {
    $border = [$region1, $region2];
    sort($border);
    return implode('_', $border);
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
