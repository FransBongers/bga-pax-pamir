<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait ChangeLoyaltyTrait
{


  // ..######......###....##.....##.########
  // .##....##....##.##...###...###.##......
  // .##.........##...##..####.####.##......
  // .##...####.##.....##.##.###.##.######..
  // .##....##..#########.##.....##.##......
  // .##....##..##.....##.##.....##.##......
  // ..######...##.....##.##.....##.########

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.


  function stChangeLoyalty()
  {
    // should contain new loyalty
    $input = Globals::getLoyaltyChangeInput();
    $coalition = $input['loyalty'];
    $this->handleLoyaltyChange($coalition);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function checkLoyaltyChange($coalition)
  {
    $player = Players::get();
    $current_loyaly = $player->getLoyalty();
    // check of loyalty needs to change. If it does not return
    if ($current_loyaly == $coalition) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * checks if coalition is different from current loyalty.
   * Handles any changes it it is.
   */
  function handleLoyaltyChange($coalition)
  {
    $player = Players::get();
    $playerId = $player->getId();

    Players::get()->setLoyalty($coalition);

    Notifications::changeLoyalty($coalition);
    $this->returnGifts($playerId);
    $this->discardPrizes($playerId, $coalition);
    $this->discardPatriots($playerId, $coalition);
  }

  function returnGifts($playerId)
  {
    $giftValues = [2, 4, 6];
    $moves = [];
    $cylinders = [];
    foreach ($giftValues as $index => $value) {
      $location = 'gift_' . $value . '_' . $playerId;
      $tokenInLocation = Tokens::getInLocation($location)->first();
      if ($tokenInLocation === null) {
        continue;
      }
      $cylinders[] = $tokenInLocation;
      $to = 'cylinders_' . $playerId;
      $state = Tokens::insertOnTop($tokenInLocation['id'], $to);
      $moves[] =  [
        'from' => $location,
        'to' => $to,
        'tokenId' => $tokenInLocation['id'],
        'weight' => $state,
      ];
      Notifications::log('in location', $tokenInLocation);
    };
    if (count($moves) > 0) {
      Notifications::returnGifts($cylinders, $moves);
    }
  }

  function discardPrizes($playerId, $coalition)
  {
    $from = Locations::prizes($playerId);
    $prizes = Cards::getInLocation($from)->toArray();
    // TODO: check if this filter is needed?
    $prizes = Utils::filter($prizes, function ($prize) use ($coalition) {
      return $prize['loyalty'] !== $coalition;
    });

    foreach ($prizes as $index => $card) {
      $to = Locations::discardPile();

      Cards::insertOnTop($card['id'], $to);
    };
    if (count($prizes) > 0) {
      Notifications::discardPrizes($prizes, $playerId);
    }
  }

  function discardPatriots($playerId, $coalition)
  {
    $playerId = intval($playerId);
    $courtCards = Players::get($playerId)->getCourtCards();
    Notifications::log('courtCards', $courtCards);
    $patriots = Utils::filter($courtCards, function ($card) use ($coalition) {
      return $card['loyalty'] !== null && $card['loyalty'] !== $coalition;
    });
    Notifications::log('patriots', $patriots);
    if (count($patriots) > 0) {
      $player = Players::get($playerId);
      Notifications::discardPatriots($player);
      $this->executeDiscards($patriots, $player, [
        'activePlayerId' => $playerId,
        'transition' => 'playerActions'
      ]);
    } else {
      $this->nextState('playerActions', $playerId);
    }
  }
}
