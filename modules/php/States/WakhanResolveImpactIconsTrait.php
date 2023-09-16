<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;

trait WakhanResolveImpactIconsTrait
{

  // .##......##....###....##....##.##.....##....###....##....##
  // .##..##..##...##.##...##...##..##.....##...##.##...###...##
  // .##..##..##..##...##..##..##...##.....##..##...##..####..##
  // .##..##..##.##.....##.#####....#########.##.....##.##.##.##
  // .##..##..##.#########.##..##...##.....##.#########.##..####
  // .##..##..##.##.....##.##...##..##.....##.##.....##.##...###
  // ..###..###..##.....##.##....##.##.....##.##.....##.##....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function wakhanResolveImpactIcons($card, $back, $front)
  {
    $loyalty = $this->getWakhanLoyalty($front['pragmaticLoyalty']);
    $impactIcons = $card['impactIcons'];
    $roadsPlaced = false;
    foreach ($impactIcons as $index => $icon) {
      switch ($icon) {
        case ARMY:
          $this->wakhanPlaceArmy($card, $loyalty, $front);
          break;
        case LEVERAGE:
          $this->resolveLeverage(WAKHAN_PLAYER_ID);
          break;
        case ROAD:
          if (!$roadsPlaced) {
            $this->wakhanPlaceRoads($card, $loyalty, $front, array_count_values($impactIcons)[ROAD]);
            $roadsPlaced = true;
          }
          break;
        case SPY:
          $this->wakhanPlaceSpy($card,$front);
          break;
        case TRIBE:
          $this->wakhanPlaceTribe($card,$front);
          break;
        case ECONOMIC_SUIT:
          $this->resolveFavoredSuitChange(ECONOMIC);
          break;
        case INTELLIGENCE_SUIT:
          $this->resolveFavoredSuitChange(INTELLIGENCE);
          break;
        case MILITARY_SUIT:
          $this->resolveFavoredSuitChange(MILITARY);
          break;
        case POLITICAL_SUIT:
          $this->resolveFavoredSuitChange(POLITICAL);
          break;
      }
    }
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  /**
   * Returns order for borders for given region, based on regionOrder
   * of the revealed AI card.
   */
  function wakhanGetBorderOrder($region,$regionOrder)
  {
    $borders = $this->regions[$region]['borders'];
    $borderOrder = Utils::filter(array_map(function ($region2) use ($region) {
      return Utils::getBorderName($region2, $region);
    }, $regionOrder), function ($border) use ($borders) {
      return in_array($border, $borders);
    });
    return $borderOrder;
  }

  function wakhanPlaceArmy($card, $loyalty, $front)
  {
    $regionId = $card['region'];
    $pool = $this->locations['pools'][$loyalty];

    $army = Tokens::getTopOf($pool);
    if ($army === null) {
      // Pool is empty. Select piece according to card order
      $army = $this->wakhanSelectBlockToPlace($loyalty, $front);
    }
    $this->resolvePlaceArmy(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $army, $loyalty, $regionId);
  }

  function wakhanPlaceRoads($card, $loyalty, $front, $number)
  {
    $regionOrder = $front['regionOrder'];
    $pool = $this->locations['pools'][$loyalty];
    $cardRegion = $card['region'];

    for ($i = 0; $i < $number; $i++) {
      $block = Tokens::getTopOf($pool);
      if ($block === null) {
        // Pool is empty. Select piece according to card order
        $block = $this->wakhanSelectBlockToPlace($loyalty, $front);
      }
      $borderOrder = $this->wakhanGetBorderOrder($cardRegion,$regionOrder);
      $borderId = $borderOrder[$i % count($borderOrder)];

      $this->resolvePlaceRoad(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $block, $loyalty, $borderId);
    }
  }

  function wakhanPlaceSpy($card,$front)
  {
    $region = $card['region'];
    $cardToPlaceSpy = $this->wakhanSelectCardToPlaceSpy($region);

    $pool = "cylinders_" . WAKHAN_PLAYER_ID;
    $cylinder = Tokens::getTopOf($pool);

    if ($cylinder === null) {
      $cylinder = $this->wakhanSelectCylinderToPlace($front);
    }

    $this->resolvePlaceCylinder(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $cylinder, SPY, ['cardId' => $cardToPlaceSpy['id']]);
  }

  function wakhanPlaceTribe($card, $front)
  {
    $pool = "cylinders_" . WAKHAN_PLAYER_ID;
    $cylinder = Tokens::getTopOf($pool);

    if ($cylinder === null) {
      $cylinder = $this->wakhanSelectCylinderToPlace($front);
    }

    $this->resolvePlaceCylinder(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $cylinder, TRIBE, ['region' => $card['region']]);
  }

  // Remove tribes first, then armies, then roads and then spies, in that order. Use the current AI card to decide between locations of Tribes,
  // Armies and Roads removed. For Spies, use card priority order.
  function wakhanSelectBlockToPlace($loyalty, $front)
  {
    $regionOrder = $front['regionOrder'];
    // Select army of possible
    foreach ($regionOrder as $index => $region) {
      $armies = Utils::filter(Tokens::getInLocation(Locations::armies($region))->toArray(), function ($block) use ($loyalty) {
        return explode('_', $block['id'])[1] === $loyalty && intval($block['used']) === 0;
      });
      if (count($armies) > 0) {
        return $armies[count($armies) - 1];
      }
    }
    // otherwise select road
    foreach ($regionOrder as $index => $region) {
      $borderOrder = $this->wakhanGetBorderOrder($region,$regionOrder);

      foreach($borderOrder as $index => $border) {
        $roads = Utils::filter(Tokens::getInLocation(Locations::roads($border))->toArray(), function ($block) use ($loyalty) {
          return explode('_', $block['id'])[1] === $loyalty && intval($block['used']) === 0;
        });
        if (count($roads) > 0) {
          return $roads[count($roads) - 1];
        }
      }
    }
  }

  // Remove tribes first, then armies, then roads and then spies, in that order. Use the current AI card to decide between locations of
  //  Tribes, Armies and Roads removed. For Spies, use card priority order.
  function wakhanSelectCylinderToPlace($front)
  {
    $regionOrder = $front['regionOrder'];
    foreach ($regionOrder as $index => $region) {
      $tribes = Utils::filter(Tokens::getInLocation(Locations::tribes($region))->toArray(), function ($block) {
        return intval(explode('_', $block['id'])[1]) === WAKHAN_PLAYER_ID && intval($block['used']) === 0;
      });
      if (count($tribes) > 0) {
        return $tribes[count($tribes) - 1];
      }
    }

    $courtCards = $this->getAllCourtCardsOrdered();
    $cardsWithWakhanSpies = Utils::filter($courtCards, function ($card) {
      $spyOwnerIds = array_map(function ($spy) {
        return intval(explode('_',$spy['id'])[1]);
      }, Tokens::getInLocation(['spies', $card['id']])->toArray());
      return in_array(WAKHAN_PLAYER_ID,$spyOwnerIds);
    });
    $cardToRemoveSpyFrom = $this->wakhanSelectCard($cardsWithWakhanSpies);
    $spies = Tokens::getInLocation(['spies', $cardToRemoveSpyFrom['id']])->toArray();
    $wakhanSpies = Utils::filter($spies, function ($spy) {
      return intval(explode('_',$spy['id'])[1]) === WAKHAN_PLAYER_ID;
    });
    return $wakhanSpies[count($wakhanSpies) - 1];
  }
}
