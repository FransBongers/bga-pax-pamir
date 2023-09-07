<?php

namespace PaxPamir\Helpers;

abstract class Locations extends \APP_DbObject
{
  public static function court($playerId)
  {
    return 'court_' . $playerId;
  }

  public static function discardPile()
  {
    return DISCARD;
  }

  public static function market($row, $column)
  {
    return 'market_' . $row . '_' . $column;
  }

  public static function marketRupees($row, $column)
  {
    return 'market_' . $row . '_' . $column . '_rupees';
  }

  public static function hand($playerId)
  {
    return 'hand_' . $playerId;
  }

  public static function playerEvent($playerId)
  {
    return 'events_' . $playerId;
  }

  public static function prizes($playerId)
  {
    return 'prizes_' . $playerId;
  }

  public static function spies($cardId)
  {
    return 'spies_' . $cardId;
  }
}
