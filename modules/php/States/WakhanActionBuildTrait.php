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

trait WakhanActionBuildTrait
{

  // .########..####..######..########.....###....########..######..##.....##
  // .##.....##..##..##....##.##.....##...##.##......##....##....##.##.....##
  // .##.....##..##..##.......##.....##..##...##.....##....##.......##.....##
  // .##.....##..##...######..########..##.....##....##....##.......#########
  // .##.....##..##........##.##........#########....##....##.......##.....##
  // .##.....##..##..##....##.##........##.....##....##....##....##.##.....##
  // .########..####..######..##........##.....##....##.....######..##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.



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

  function wakhanBuild()
  {
    $card = $this->wakhanGetCourtCardToPerformAction(BUILD);
    Notifications::log('card', $card);
    if ($card === null) {
      Wakhan::actionNotValid();
      return;
    }

    $region = $this->wakhanGetRegionToBuild();
    if ($region === null) {
      Wakhan::actionNotValid();
      return;
    }

    // if $card !== null we know Wakhan is able to pay for the build and for the bribe
    $this->wakhanPayHostageBribeIfNeeded($card, GIFT);

    Notifications::log('region', $region);

    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $numberOfArmiesWakhanCanAfford = floor($wakhanPlayer->getRupees() / 2);
    $nationBuildingMultiplier = Events::isNationBuildingActive($wakhanPlayer) ? 2 : 1;

    $numberOfArmiesWakhanWillPlace = min($numberOfArmiesWakhanCanAfford, 3) * $nationBuildingMultiplier;

    $cost = $numberOfArmiesWakhanCanAfford * 2;
    $rupeesOnCards = $this->payActionCosts($cost);

    PaxPamirPlayers::incRupees(WAKHAN_PLAYER_ID, -$cost);

    Notifications::build($card['id'], $wakhanPlayer, $rupeesOnCards);

    $pragmaticLoyalty = Wakhan::getPragmaticLoyalty();
    for ($i = 0; $i < $numberOfArmiesWakhanWillPlace; $i++) {
      $this->wakhanPlaceArmy($region, $pragmaticLoyalty);
    }


    Cards::setUsed($card['id'], 1); // unavailable
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($card)) {
      Globals::incRemainingActions(-1);
    }

    if ($wakhanPlayer->hasSpecialAbility(SA_INFRASTRUCTURE)) {
      Notifications::buildInfrastructure($wakhanPlayer);
      $this->wakhanPlaceArmy($region, $pragmaticLoyalty);
    }
    Map::checkRulerChange($region);
    Wakhan::actionValid();
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanGetRegionToBuild()
  {
    $rulers = Globals::getRulers();
    $regionOrder = Wakhan::getRegionOrder();

    foreach ($regionOrder as $index => $region) {
      if ($rulers[$region] === WAKHAN_PLAYER_ID) {
        return $region;
      }
    }
    return null;
  }
}
