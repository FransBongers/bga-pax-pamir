<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Wakhan;
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

  function wakhanResolveImpactIcons($card)
  {
    $loyalty = Wakhan::getPragmaticLoyalty();
    $impactIcons = $card['impactIcons'];
    $roadsPlaced = false;
    foreach ($impactIcons as $index => $icon) {
      switch ($icon) {
        case ARMY:
          $this->wakhanPlaceArmy($card['region'], $loyalty);
          break;
        case LEVERAGE:
          $this->resolveLeverage(WAKHAN_PLAYER_ID);
          break;
        case ROAD:
          if (!$roadsPlaced) {
            $this->wakhanPlaceRoads($card, $loyalty, array_count_values($impactIcons)[ROAD]);
            $roadsPlaced = true;
          }
          break;
        case SPY:
          $this->wakhanPlaceSpy($card);
          break;
        case TRIBE:
          $this->wakhanPlaceTribe($card);
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

  function wakhanPlaceArmy($regionId, $loyalty)
  {
    $army = Wakhan::getCoalitionBlockToPlace($loyalty);

    $this->resolvePlaceArmy(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $army, $loyalty, $regionId);
  }

  function wakhanPlaceRoads($card, $loyalty,$number)
  {
    $cardRegion = $card['region'];

    for ($i = 0; $i < $number; $i++) {
      $block = Wakhan::getCoalitionBlockToPlace($loyalty);
      $borderOrder = Wakhan::getBorderOrder($cardRegion);
      $borderId = $borderOrder[$i % count($borderOrder)];

      $this->resolvePlaceRoad(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $block, $loyalty, $borderId);
    }
  }

  function wakhanPlaceSpy($card)
  {
    $region = $card['region'];
    $cardToPlaceSpy = Wakhan::selectCardToPlaceSpy($region);

    $cylinder = Wakhan::getCylinderToPlace();

    $this->resolvePlaceCylinder(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $cylinder, SPY, ['cardId' => $cardToPlaceSpy['id']]);
  }

  function wakhanPlaceTribe($card)
  {
    $cylinder = Wakhan::getCylinderToPlace();

    $this->resolvePlaceCylinder(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $cylinder, TRIBE, ['region' => $card['region']]);
  }
}
