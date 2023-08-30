<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayerActionTaxTrait
{
  //  .########..##..........###....##....##.########.########.
  //  .##.....##.##.........##.##....##..##..##.......##.....##
  //  .##.....##.##........##...##....####...##.......##.....##
  //  .########..##.......##.....##....##....######...########.
  //  .##........##.......#########....##....##.......##...##..
  //  .##........##.......##.....##....##....##.......##....##.
  //  .##........########.##.....##....##....########.##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function tax($cardId, $market, $players,$offeredBribeAmount = null)
  {
    self::checkAction('tax');

    $cardInfo = Cards::get($cardId);
    $this->isValidCardAction($cardInfo, TAX);

    $activePlayer = PaxPamirPlayers::get();

    $resolved = $this->resolveBribe($cardInfo, $activePlayer,TAX, $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }

    $selectedFromMarket = explode(' ', $market);
    $selectedPlayers = explode(' ', $players);
    $numberOfRupeesSelectedFromMarket = 0;
    $numberOfRupeesSelectedFromPlayers = 0;
    // Check if rupee is in market
    foreach ($selectedFromMarket as $index => $rupeeId) {
      if (strlen($rupeeId) == 0) {
        continue;
      };
      $rupee = Tokens::get($rupeeId);
      $location = $rupee['location'];

      if (!Utils::startsWith($location, 'market')) {
        throw new \feException("Selected rupee is not in the market");
      };
      $numberOfRupeesSelectedFromMarket += 1;
    }
    // $activePlayer = PaxPamirPlayers::get();
    $activePlayerId = $activePlayer->getId();
    $rulers = Globals::getRulers();

    $hasClaimOfAncientLineage = Cards::get(SA_CLAIM_OF_ANCIENT_LINEAGE_CARD_ID)['location'] === Locations::court($activePlayerId);

    // Checks for selected players
    foreach ($selectedPlayers as $index => $selectedPlayer) {
      if (strlen($selectedPlayer) == 0) {
        continue;
      };
      $playerInput = explode('_', $selectedPlayer);
      $playerId = $playerInput[0];
      $selectedRupees = intval($playerInput[1]);
      $player = PaxPamirPlayers::get($playerId);

      if (!$hasClaimOfAncientLineage) {
        // Player owns card of region ruled by active player
        $courtCards = $player->getCourtCards();

        $hasCardRuledByActivePlayer = Utils::array_some($courtCards, function ($courtCard) use ($activePlayerId, $rulers) {
          return $rulers[$courtCard['region']] === $activePlayerId;
        });
        if (!$hasCardRuledByActivePlayer) {
          throw new \feException("Seelcted player does not have a court card ruled by active player");
        }
      }
      // Amount taxed from player is allowed
      $playerRupees = $player->getRupees();
      $taxShelter = $player->getSuitTotals()[ECONOMIC];
      $maxTaxable = $playerRupees - $taxShelter;
      if ($selectedRupees > $maxTaxable) {
        throw new \feException("More rupees selected for player than allowed");
      };
      $numberOfRupeesSelectedFromPlayers += $selectedRupees;
    }
    $totalSelected = $numberOfRupeesSelectedFromMarket + $numberOfRupeesSelectedFromPlayers;
    // Total number of rupees selected does not exceed card rank
    if ($totalSelected > $cardInfo['rank']) {
      throw new \feException("More rupees selected for player than allowed by card rank");
    }

    Cards::setUsed($cardId, 1);
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }
    Notifications::tax($cardId, $activePlayer);
    PaxPamirPlayers::incRupees($activePlayerId, $totalSelected);

    $rupeesInMarket = [];
    // Check if rupee is in market
    foreach ($selectedFromMarket as $index => $rupeeId) {
      if (strlen($rupeeId) == 0) {
        continue;
      };
      $rupee = Tokens::get($rupeeId);
      $location = explode('_', $rupee['location']);
      $rupeesInMarket[] = [
        'rupeeId' => $rupeeId,
        'row' => intval($location[1]),
        'column' => intval($location[2])
      ];
      Tokens::move($rupeeId, RUPEE_SUPPLY);
    };
    if ($numberOfRupeesSelectedFromMarket > 0) {
      Notifications::taxMarket($numberOfRupeesSelectedFromMarket, $activePlayer, $rupeesInMarket);
    }

    foreach ($selectedPlayers as $index => $selectedPlayer) {
      if (strlen($selectedPlayer) == 0) {
        continue;
      };
      $playerInput = explode('_', $selectedPlayer);
      $playerId = $playerInput[0];
      $numberOfRupees = intval($playerInput[1]);

      PaxPamirPlayers::incRupees($playerId, -$numberOfRupees);
      Notifications::taxPlayer($numberOfRupees, $activePlayer, $playerId);
    };

    $this->gamestate->nextState('playerActions');
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...



}
