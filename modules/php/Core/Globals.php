<?php

namespace PaxPamir\Core;

use PaxPamir\Core\Game;
use PaxPamir\Managers\Players;

/*
 * Globals
 */

class Globals extends \PaxPamir\Helpers\DB_Manager
{
  protected static $initialized = false;
  protected static $variables = [
    'changeActivePlayer' => 'obj', // Used for the generic "changeActivePlayer" state
    'logState' => 'int', // Used to store state id when enabling the log
    'actionStack' => 'obj',
    // 'activePlayerId' => 'int',
    "dominanceChecksResolved" => "int",
    "favoredSuit" => "str",
    "remainingActions" => "int",
    "negotiatedBribe" => "obj",
    "bribeClearLogs" => "bool", // TODO check if we can remove this one
    "leverageData" => "obj",
    "rulers" => "obj",
    "loyaltyChangeInput" => "obj",
    "currentEvent" => "obj",
    "setup" => "int",
    "specialAbilityData" => "obj",
    "openHands" => 'bool',
    'wakhanActionsSkipped' => 'int',
    'wakhanActive' => 'bool',
    'wakhanCurrentAction' => 'int',
    'wakhanEnabled' => 'bool',
    'wakhanOption' => 'str',
    'wakhanVariantSavvyPurchasing' => 'bool',
    'wakhanVariantSpyMovement' => 'bool',
    'wakhanVariantSteadfastPragmaticLoyalty' => 'bool',
  ];

  protected static $table = 'global_variables';
  protected static $primary = 'name';
  protected static function cast($row)
  {
    $val = json_decode(\stripslashes($row['value']), true);
    return (self::$variables[$row['name']] ?? null) == 'int' ? ((int) $val) : $val;
  }

  /*
   * Fetch all existings variables from DB
   */
  protected static $data = [];
  public static function fetch()
  {
    // Turn of LOG to avoid infinite loop (Globals::isLogging() calling itself for fetching)
    $tmp = self::$log;
    self::$log = false;

    foreach (self::DB()
        ->select(['value', 'name'])
        ->get()
      as $name => $variable) {
      if (\array_key_exists($name, self::$variables)) {
        self::$data[$name] = $variable;
      }
    }
    self::$initialized = true;
    self::$log = $tmp;
  }

  /*
   * Create and store a global variable declared in this file but not present in DB yet
   *  (only happens when adding globals while a game is running)
   */
  public static function create($name)
  {
    if (!\array_key_exists($name, self::$variables)) {
      return;
    }

    $default = [
      'int' => 0,
      'obj' => [],
      'bool' => false,
      'str' => '',
    ];
    $val = $default[self::$variables[$name]];
    self::DB()->insert(
      [
        'name' => $name,
        'value' => \json_encode($val),
      ],
      true
    );
    self::$data[$name] = $val;
  }

  /*
   * Magic method that intercept not defined static method and do the appropriate stuff
   */
  public static function __callStatic($method, $args)
  {
    if (!self::$initialized) {
      self::fetch();
    }

    if (preg_match('/^([gs]et|inc|is)([A-Z])(.*)$/', $method, $match)) {
      // Sanity check : does the name correspond to a declared variable ?
      $name = mb_strtolower($match[2]) . $match[3];
      if (!\array_key_exists($name, self::$variables)) {
        throw new \InvalidArgumentException("Property {$name} doesn't exist");
      }

      // Create in DB if don't exist yet
      if (!\array_key_exists($name, self::$data)) {
        self::create($name);
      }

      if ($match[1] == 'get') {
        // Basic getters
        return self::$data[$name];
      } elseif ($match[1] == 'is') {
        // Boolean getter
        if (self::$variables[$name] != 'bool') {
          throw new \InvalidArgumentException("Property {$name} is not of type bool");
        }
        return (bool) self::$data[$name];
      } elseif ($match[1] == 'set') {
        // Setters in DB and update cache
        if (!isset($args[0])) {
          throw new \InvalidArgumentException("Setting {$name} require a value");
        }
        $value = $args[0];
        if (self::$variables[$name] == 'int') {
          $value = (int) $value;
        }
        if (self::$variables[$name] == 'bool') {
          $value = (bool) $value;
        }

        self::$data[$name] = $value;
        self::DB()->update(['value' => \addslashes(\json_encode($value))], $name);
        return $value;
      } elseif ($match[1] == 'inc') {
        if (self::$variables[$name] != 'int') {
          throw new \InvalidArgumentException("Trying to increase {$name} which is not an int");
        }

        $getter = 'get' . $match[2] . $match[3];
        $setter = 'set' . $match[2] . $match[3];
        return self::$setter(self::$getter() + (empty($args) ? 1 : $args[0]));
      }
    }
    // return undefined;
  }

  /*
   * Setup new game
   */
  public static function setupNewGame($players, $options)
  {
    self::setDominanceChecksResolved(0);
    self::setFavoredSuit("political");
    self::setRulers(array(
      HERAT => null,
      KABUL => null,
      KANDAHAR => null,
      PERSIA => null,
      PUNJAB => null,
      TRANSCASPIA => null,
    ));
    self::setRemainingActions(2);
    self::setSetup(1);
    self::setBribeClearLogs(true);
    self::setNegotiatedBribe([]);
    self::setActionStack([]);
    self::setOpenHands(($options[\PaxPamir\OPTION_OPEN_HANDS] ?? null) == \PaxPamir\OPTION_OPEN_HANDS_ENABLED);
    $optionWakhan = $options[\PaxPamir\OPTION_WAKHAN] ?? 'null';
    self::setWakhanOption($optionWakhan);
    self::setWakhanEnabled(in_array($optionWakhan, [\PaxPamir\OPTION_WAKHAN_BASIC, \PaxPamir\OPTION_WAKHAN_IMPROVED, \PaxPamir\OPTION_WAKHAN_CUSTOM]));
    
    $optionImprovedWakhan = $optionWakhan == \PaxPamir\OPTION_WAKHAN_IMPROVED;
    self::setWakhanVariantSavvyPurchasing($optionImprovedWakhan || ($options[\PaxPamir\OPTION_WAKHAN_VARIANT_SAVVY_PURCHASING] ?? null) == \PaxPamir\OPTION_WAKHAN_VARIANT_SAVVY_PURCHASING_ENABLED);
    self::setWakhanVariantSpyMovement($optionImprovedWakhan || ($options[\PaxPamir\OPTION_WAKHAN_VARIANT_SPY_MOVEMENT] ?? null) == \PaxPamir\OPTION_WAKHAN_VARIANT_SPY_MOVEMENT_ENABLED);
    self::setWakhanVariantSteadfastPragmaticLoyalty($optionImprovedWakhan || ($options[\PaxPamir\OPTION_WAKHAN_VARIANT_STEADFAST_PRAGMATIC_LOYALTY] ?? null) == \PaxPamir\OPTION_WAKHAN_VARIANT_STEADFAST_PRAGMATIC_LOYALTY_ENABLED);
    
  }
}
