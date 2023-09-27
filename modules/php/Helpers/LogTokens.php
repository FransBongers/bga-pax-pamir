<?php

namespace PaxPamir\Helpers;

use PaxPamir\Core\Globals;

abstract class LogTokens extends \APP_DbObject
{


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

  public static function keyPlayerName($playerId)
  {
    return implode(':', ['token',LOG_TOKEN_PLAYER_NAME, $playerId]);
  }
}
