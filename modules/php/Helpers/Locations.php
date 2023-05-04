<?php

namespace PaxPamir\Helpers;

abstract class Locations extends \APP_DbObject
{

  public static function discardPile()
  {
    return DISCARD;
  }

  public static function prizes($playerId)
  {
    return 'prizes_'.$playerId;
  }
}
