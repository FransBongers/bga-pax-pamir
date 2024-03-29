<?php

namespace PaxPamir\Managers;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Core\Notifications;

class Map
{

  /*
    Returns all data to setup map in frontend
  */
  public static function getUiData()
  {
    $data = [
      'rulers' => Map::getRulers(),
    ];
    $game = Game::get();

    foreach ($game->regions as $region => $regionInfo) {
      $regionInfo = self::getRegionInfo($region);
      $data['regions'][$region]['armies'] = Tokens::getInLocation(['armies', $region])->toArray();
      $data['regions'][$region]['tribes'] = Tokens::getInLocation(['tribes', $region])->toArray();
      $data['regions'][$region]['borders'] = $regionInfo['borders'];
      $data['regions'][$region]['name'] = $regionInfo['name'];
    }

    foreach ($game->borders as $border => $borderInfo) {
      $data['borders'][$border]['roads'] = Tokens::getInLocation(['roads', $border])->toArray();
    }

    return $data;
  }

  public static function getRegionInfo($region)
  {
    return Game::get()->regions[$region];
  }

  public static function getRegionsAdjacentToRegion($region)
  {
    $borders = Map::getRegionInfo($region)['borders'];
    $adjecentRegions = array_map(function ($border) use ($region) {
      $borderRegions = explode('_', $border);
      return $region === $borderRegions[0] ? $borderRegions[1] : $borderRegions[0];
    }, $borders);
    return $adjecentRegions;
  }

  public static function borderHasRoadForCoalition($border, $coalition)
  {
    $roads = Tokens::getInLocation(['roads', $border])->toArray();
    return Utils::array_some($roads, function ($road) use ($coalition) {
      return explode('_', $road['id'])[1] === $coalition;
    });
  }

  /**
   * Returns playerId if there is a ruler. Otherwise returns null.
   * Additional arguments are there to make a virtual calculation: who would rule if certain pieces
   * would be removed or added
   */
  public static function determineRuler($region, $piecesToIgnore = [], $armiesToAdd = [], $tribesToAdd = [])
  {
    $tribeIds = array_map(function ($tribe) {
      return $tribe['id'];
    }, Tokens::getInLocation('tribes_' . $region)->toArray());
    // Filter tribes that need to be ignored
    $tribeIds = Utils::filter($tribeIds, function ($tribeId) use ($piecesToIgnore) {
      return !in_array($tribeId, $piecesToIgnore);
    });
    $tribeIds = array_unique(array_merge($tribeIds, $tribesToAdd));

    $playerIds = PaxPamirPlayers::getAll()->getIds();
    $rulingPieces = [];
    $tribesPerPlayer = [];
    foreach ($playerIds as $playerId) {
      // $rulingPieces[$playerId] = 0;
      $tribesPerPlayer[$playerId] = 0;
    }
    
    foreach ($tribeIds as $index => $tribeId) {
      $playerId = explode("_", $tribeId)[1];
      $tribesPerPlayer[$playerId] += 1;
    };

    $armyIds = array_map(function ($army) {
      return $army['id'];
    }, Tokens::getInLocation('armies_' . $region)->toArray());
    $armyIds = Utils::filter($armyIds, function ($armyId) use ($piecesToIgnore) {
      return !in_array($armyId, $piecesToIgnore);
    });
    $armyIds = array_unique(array_merge($armyIds, $armiesToAdd));

    $armyCounts = [];
    foreach (COALITIONS as $coalition) {
      $armiesLoyalToCoalition = Utils::filter($armyIds, function ($armyId) use ($coalition) {
        return explode('_', $armyId)[1] === $coalition;
      });
      $armyCounts[$coalition] = count($armiesLoyalToCoalition);
    }

    foreach ($playerIds as $playerId) {
      if ($playerId === WAKHAN_PLAYER_ID) {
        $rulingPieces[$playerId] = $tribesPerPlayer[$playerId] + max($armyCounts[AFGHAN], $armyCounts[BRITISH], $armyCounts[RUSSIAN]);
      } else {
        $loyalty = PaxPamirPlayers::get($playerId)->getLoyalty();
        $rulingPieces[$playerId] = $tribesPerPlayer[$playerId] + $armyCounts[$loyalty];
      }
    };
    $playersWithHighestStrength = array_keys($rulingPieces, max($rulingPieces));
    $highestCoalitionStrength = max(array_values($armyCounts));

    if (count($playersWithHighestStrength) === 1 && $tribesPerPlayer[$playersWithHighestStrength[0]]  > 0 && $rulingPieces[$playersWithHighestStrength[0]] > $highestCoalitionStrength) {
      return $playersWithHighestStrength[0];
    };
    return null;
  }

  public static function getLoyalArmiesInRegion($region, $loyalty)
  {
    $loyalArmies = Utils::filter(Tokens::getInLocationOrdered(Locations::armies($region))->toArray(), function ($army) use ($loyalty) {
      return explode('_', $army['id'])[1] === $loyalty;
    });
    return $loyalArmies;
  }

  public static function getPlayerTribesInRegion($region, $playerId)
  {
    $tribes = Tokens::getInLocationOrdered('tribes_' . $region)->toArray();
    $playerTribes = Utils::filter($tribes, function ($cylinder) use ($playerId) {
      return Utils::getPlayerIdForCylinderId($cylinder['id']) === $playerId;
    });
    return $playerTribes;
  }


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
   * Moves all armies in region to supply. Returns array of moves
   * that can be used for notification
   */
  public static function removeArmiesFromRegion($regionId)
  {
    $returnedArmies = [];
    $from = "armies_" . $regionId;
    $armies = Tokens::getInLocation($from)->toArray();
    foreach ($armies as $index => $army) {
      $tokenId = $army['id'];
      $coalition = explode('_', $tokenId)[1];
      $to = 'blocks_' . $coalition;
      $weight = Tokens::insertOnTop($tokenId, $to);
      if (array_key_exists($coalition, $returnedArmies)) {
        $returnedArmies[$coalition][] =  [
          'tokenId' => $tokenId,
          'weight' => $weight,
        ];
      } else {
        $returnedArmies[$coalition] = [
          [
            'tokenId' => $tokenId,
            'weight' => $weight,
          ]
        ];
      }
    }
    return $returnedArmies;
  }

  public static function removeAllBlocksForCoalition($coalition)
  {
    $returnedBlocks = [];
    $fromLocations = [];
    // return all coalition blocks to their pools
    $coalitionBlocks = Tokens::getOfType('block_' . $coalition);
    foreach ($coalitionBlocks as $index => $tokenInfo) {
      if (!Utils::startsWith($tokenInfo['location'], "blocks")) {
        $weight = Tokens::insertOnTop($tokenInfo['id'], 'blocks_' . $coalition);
        $returnedBlocks[] = [
          'id' => $tokenInfo['id'],
          'weight' => $weight
        ];
        $fromLocations[] = $tokenInfo['location'];
      };
    };
    return [
      'returnedBlocks' => $returnedBlocks,
      'fromLocations' => $fromLocations,
    ];
  }

  /**
   * Moves all tribes in region to supply. Returns array of moves
   * that can be used for notification
   */
  public static function removeTribesFromRegion($regionId)
  {
    $returnedTribes = [];
    $playersWithRemovedCylinders = [];
    $from = "tribes_" . $regionId;
    $tribes = Tokens::getInLocation($from)->toArray();
    foreach ($tribes as $index => $tribe) {

      $tokenId = $tribe['id'];
      $cylinderOwnerId = intval(explode('_', $tokenId)[1]);
      $to = 'cylinders_' . $cylinderOwnerId;
      $weight = Tokens::insertOnTop($tokenId, $to);
      if (array_key_exists($cylinderOwnerId, $returnedTribes)) {
        $returnedTribes[$cylinderOwnerId][] =  [
          'tokenId' => $tokenId,
          'weight' => $weight,
        ];
      } else {
        $returnedTribes[$cylinderOwnerId] =  [[
          'tokenId' => $tokenId,
          'weight' => $weight,
        ]];
      }

      if (!in_array($cylinderOwnerId, $playersWithRemovedCylinders)) {
        $playersWithRemovedCylinders[] = $cylinderOwnerId;
      };
    }
    $actions = [];
    foreach ($playersWithRemovedCylinders as $index => $playerId) {
      $actions[] = ActionStack::createAction(DISPATCH_OVERTHROW_TRIBE, $playerId, [
        'region' => $regionId
      ]);
    }
    return [
      'actions' => $actions,
      'tribes' => $returnedTribes,
    ];
  }
}
