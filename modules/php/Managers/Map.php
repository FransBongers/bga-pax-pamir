<?php

namespace PaxPamir\Managers;

use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;

class Map
{

  /*
    Returns rulers for all regions. Value will either be 0 (no ruler) or
    the playerId of the player ruling the region
  */
  public static function getRulers()
  {
    return Globals::getRulers();
  }

  public static function checkRulerChange($region)
  {
    $newRuler = self::determineRuler($region);
    $rulers = Globals::getRulers();
    $currentRuler = $rulers[$region];
    if ($newRuler !== $currentRuler) {
      $rulers[$region] = $newRuler;
      Globals::setRulers($rulers);
      Notifications::changeRuler($currentRuler, $newRuler, $region);
    };
  }


  /**
   * Returns playerId if there is a ruler. Otherwise returns 0.
   */
  public static function determineRuler($region)
  {
    $tribes = Tokens::getInLocation('tribes_' . $region)->toArray();
    $playerIds = Players::getAll()->getIds();
    $rulingPieces = array();
    $tribesPerPlayer = array();
    foreach ($playerIds as $playerId) {
      // $rulingPieces[$playerId] = 0;
      $tribesPerPlayer[$playerId] = 0;
    }

    foreach ($tribes as $tribe) {
      $playerId = explode("_", $tribe['id'])[1];
      $tribesPerPlayer[$playerId] += 1;
    };

    $armies = Tokens::getInLocation('armies_' . $region);
    $armyCounts = array();
    foreach (COALITIONS as $coalition) {
      $armyCounts[$coalition] = count($armies->filter(function ($army) use ($coalition) {
        return explode('_', $army['id'])[1] === $coalition;
      }));
    }

    foreach ($playerIds as $playerId) {
      $loyalty = Players::get($playerId)->getLoyalty();
      $rulingPieces[$playerId] = $tribesPerPlayer[$playerId] + $armyCounts[$loyalty];
    };

    $playersWithHighestStrength = array_keys($rulingPieces, max($rulingPieces));
    if (count($playersWithHighestStrength) === 1 && $tribesPerPlayer[$playersWithHighestStrength[0]]  > 0) {
      return $playersWithHighestStrength[0];
    };
    return null;
  }
}
