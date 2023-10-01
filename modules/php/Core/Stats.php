<?php
namespace PaxPamir\Core;
use PaxPamir\Managers\Players;

class Stats extends \PaxPamir\Helpers\DB_Manager
{
  protected static $table = 'stats';
  protected static $primary = 'stats_id';
  protected static function cast($row)
  {
    return [
      'id' => $row['stats_id'],
      'type' => $row['stats_type'],
      'pId' => $row['stats_player_id'],
      'value' => $row['stats_value'],
    ];
  }

  /*
   * Create and store a stat declared but not present in DB yet
   *  (only happens when adding stats while a game is running)
   */
  public static function checkExistence()
  {
    $default = [
      'int' => 0,
      'float' => 0,
      'bool' => false,
      'str' => '',
    ];

    // Fetch existing stats, all stats
    $stats = Game::get()->getStatTypes();
    $existingStats = self::DB()
      ->get()
      ->map(function ($stat) {
        return $stat['type'] . ',' . ($stat['pId'] == null ? 'table' : 'player');
      })
      ->toArray();

    $values = [];
    // Deal with table stats first
    foreach ($stats['table'] as $stat) {
      if ($stat['id'] < 10) {
        continue;
      }

      if (!in_array($stat['id'] . ',table', $existingStats)) {
        $values[] = [
          'stats_type' => $stat['id'],
          'stats_player_id' => null,
          'stats_value' => $default[$stat['type']],
        ];
      }
    }

    // Deal with player stats
    $playerIds = Players::getAll()->getIds();
    foreach ($stats['player'] as $stat) {
      if ($stat['id'] < 10) {
        continue;
      }

      if (!in_array($stat['id'] . ',player', $existingStats)) {
        foreach ($playerIds as $i => $pId) {
          $value = $default[$stat['type']];
          $values[] = [
            'stats_type' => $stat['id'],
            'stats_player_id' => $pId,
            'stats_value' => $value,
          ];
        }
      }
    }

    // Insert if needed
    if (!empty($values)) {
      self::DB()
        ->multipleInsert(['stats_type', 'stats_player_id', 'stats_value'])
        ->values($values);
    }
  }

  public static function getUiData()
  {
    return self::DB()
      ->get()
      ->toArray();
  }

  protected static function getFilteredQuery($id, $pId)
  {
    $query = self::DB()->where('stats_type', $id);
    if (is_null($pId)) {
      $query = $query->whereNull('stats_player_id');
    } else {
      $query = $query->where('stats_player_id', is_int($pId) ? $pId : $pId->getId());
    }
    return $query;
  }

  /*
   * Magic method that intercept not defined static method and do the appropriate stuff
   */
  public static function __callStatic($method, $args)
  {
    if (preg_match('/^([gs]et|inc)([A-Z])(.*)$/', $method, $match)) {
      $stats = Game::get()->getStatTypes();

      // Sanity check : does the name correspond to a declared variable ?
      $name = mb_strtolower($match[2]) . $match[3];
      $isTableStat = \array_key_exists($name, $stats['table']);
      $isPlayerStat = \array_key_exists($name, $stats['player']);
      if (!$isTableStat && !$isPlayerStat) {
        throw new \InvalidArgumentException("Statistic {$name} doesn't exist");
      }

      if ($match[1] == 'get') {
        // Basic getters
        $id = null;
        $pId = null;
        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
        } else {
          if (empty($args)) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
        }

        if ($pId === WAKHAN_PLAYER_ID) {
          return null;
        }

        $row = self::getFilteredQuery($id, $pId)->get(true);
        return $row['value'];
      } elseif ($match[1] == 'set') {
        // Setters in DB and update cache
        $id = null;
        $pId = null;
        $value = null;

        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
          $value = $args[0];
        } else {
          if (count($args) < 2) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
          $value = $args[1];
        }

        if ($pId === WAKHAN_PLAYER_ID) {
          return;
        }

        if (self::getFilteredQuery($id, $pId)->count() == 0) {
          self::DB()->insert(['stats_type' => $id, 'stats_player_id' => $pId, 'stats_value' => $value]);
        } else {
          self::getFilteredQuery($id, $pId)
            ->update(['stats_value' => $value])
            ->run();
        }
        return $value;
      } elseif ($match[1] == 'inc') {
        $id = null;
        $pId = null;
        $value = null;

        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
          $value = $args[0] ?? 1;
        } else {
          if (count($args) < 1) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
          $value = $args[1] ?? 1;
        }

        if ($pId === WAKHAN_PLAYER_ID) {
          return;
        }

        self::getFilteredQuery($id, $pId)
          ->inc(['stats_value' => $value])
          ->run();
        return $value;
      }
    }
    return null;
  }
  // /*************************
  //  **** GENERIC METHODS ****
  //  *************************/
  // protected static function init($type, $name, $value = 0)
  // {
  //   Game::get()->initStat($type, $name, $value);
  // }

  // public static function inc($name, $player = null, $value = 1, $log = true)
  // {
  //   $pId = is_null($player) ? null : (is_int($player) ? $player : $player->getId());
  //   if ($pId === WAKHAN_PLAYER_ID) {
  //     return;
  //   }
  //   Game::get()->incStat($value, $name, $pId);
  // }

  // protected static function get($name, $player = null)
  // {
  //   $pId = is_null($player) ? null : (is_int($player) ? $player : $player->getId());
  //   if ($pId === WAKHAN_PLAYER_ID) {
  //     return null;
  //   }
  //   Game::get()->getStat($name, $player);
  // }

  // protected static function set($value, $name, $player = null)
  // {
  //   $pId = is_null($player) ? null : (is_int($player) ? $player : $player->getId());
  //   if ($pId === WAKHAN_PLAYER_ID) {
  //     return;
  //   }
  //   Game::get()->setStat($value, $name, $pId);
  // }

  // /*********************
  //  **********************
  //  *********************/
  // public static function setupNewGame()
  // {
  //   $stats = Game::get()->getStatTypes();
  //   Notifications::log('stats',$stats);
  // }
}

?>
