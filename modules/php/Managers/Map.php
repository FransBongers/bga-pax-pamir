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
    $new_ruler = self::determineRuler($region);
    $rulers = Globals::getRulers();
    $current_ruler = $rulers[$region];
    if ($new_ruler !== $current_ruler) {
      $rulers[$region] = $new_ruler;
      Globals::setRulers($rulers);
      Notifications::changeRuler($current_ruler, $new_ruler, $region);
    };
  }


  /**
   * Returns playerId if there is a ruler. Otherwise returns 0.
   */
  public static function determineRuler($region)
  {
    $tribes = Tokens::getInLocation('tribes_' . $region)->toArray();
    $player_ids = Players::getAll()->getIds();
    $ruling_pieces = array();
    $tribes_per_player = array();
    foreach ($player_ids as $player_id) {
      // $ruling_pieces[$player_id] = 0;
      $tribes_per_player[$player_id] = 0;
    }

    foreach ($tribes as $tribe) {
      $player_id = explode("_", $tribe['id'])[1];
      $tribes_per_player[$player_id] += 1;
    };

    $armies = Tokens::getInLocation('armies_' . $region);
    $army_counts = array();
    foreach (COALITIONS as $coalition) {
      $army_counts[$coalition] = count($armies->filter(function ($army) use ($coalition) {
        return explode('_', $army['id'])[1] === $coalition;
      }));
    }

    foreach ($player_ids as $player_id) {
      $loyalty = Players::get($player_id)->getLoyalty();
      $ruling_pieces[$player_id] = $tribes_per_player[$player_id] + $army_counts[$loyalty];
    };

    $players_with_highest_strength = array_keys($ruling_pieces, max($ruling_pieces));
    if (count($players_with_highest_strength) === 1 && $tribes_per_player[$players_with_highest_strength[0]]  > 0) {
      return $players_with_highest_strength[0];
    };
    return null;
  }
}
