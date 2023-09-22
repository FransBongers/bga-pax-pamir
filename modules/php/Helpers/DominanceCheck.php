<?php

namespace PaxPamir\Helpers;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Core\Notifications;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;

class DominanceCheck
{

  public static function getDominantCoalition()
  {
    // Determine number of blocks left for each pool
    $coalitionBlockCounts = [];
    $pools = [
      AFGHAN => BLOCKS_AFGHAN_SUPPLY,
      BRITISH => BLOCKS_BRITISH_SUPPLY,
      RUSSIAN => BLOCKS_RUSSIAN_SUPPLY
    ];
    foreach ($pools as $coalitionId => $coalitionPool) {
      $coalitionBlockCounts[] = [
        'count' => Tokens::countInLocation($coalitionPool),
        'coalition' => $coalitionId,
      ];
    }

    // sort array lowest to highest. Since we count remaining blocks the coalition with the lowest
    // number has the most blocks in play
    usort($coalitionBlockCounts, function ($a, $b) {
      return $a['count'] - $b['count'];
    });

    $requiredDifferenceToBeDominant = Events::isConflictFatigueActive() ? 2 : 4;
    $checkSuccessful = $coalitionBlockCounts[1]['count'] - $coalitionBlockCounts[0]['count'] >= $requiredDifferenceToBeDominant;
    if ($checkSuccessful) {
      return $coalitionBlockCounts[0]['coalition'];
    }
    return null;
  }
}
