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


  // function stChangeLoyalty()
  // {
  //   // should contain new loyalty
  //   $input = Globals::getLoyaltyChangeInput();
  //   $coalition = $input['loyalty'];
  //   $this->handleLoyaltyChange($coalition);
  // }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  /**
   * Returns action stack items needed for loyalty change
   */
  function getLoyaltyChangeActions($playerId, $coalition)
  {
    return [
      [
        'action' => 'changeLoyalty',
        'playerId' => $playerId,
        'data' => [
          'coalition' => $coalition
        ],
      ],
      [
        'action' => 'discardPatriots',
        'playerId' => $playerId,
        'data' => [
          'coalition' => $coalition
        ],
      ],
      [
        'action' => 'returnGiftsAndDiscardPrizes',
        'playerId' => $playerId,
        'data' => [
          'coalition' => $coalition
        ],
      ],
    ];
  }

  /**
   * Check if player changes loyalty
   */
  function checkLoyaltyChange($player, $coalition)
  {
    $currentLoyaly = $player->getLoyalty();
    if ($currentLoyaly === $coalition) {
      return false;
    } else {
      return true;
    }
  }

  function changeLoyaltyReturnGiftsDiscardPrizes($action)
  {

    $playerId = $action['playerId'];
    $coalition = $action['data']['coalition'];

    Notifications::changeLoyaltyMessage($coalition);

    $this->returnGifts($playerId);
    $this->discardPrizes($playerId);

    $this->nextState('dispatchAction');
  }

  function changeLoyalty($action)
  {
    $playerId = $action['playerId'];
    $coalition = $action['data']['coalition'];

    Players::get($playerId)->setLoyalty($coalition);
    Notifications::changeLoyalty($coalition);

    $this->nextState('dispatchAction');
  }

  // // /**
  // //  * checks if coalition is different from current loyalty.
  // //  * Handles any changes it it is.
  // //  */
  // function handleLoyaltyChange($coalition)
  // {
  //   $player = Players::get();
  //   $playerId = $player->getId();

  //   Players::get()->setLoyalty($coalition);

  //   Notifications::changeLoyalty($coalition);
  //   $this->returnGifts($playerId);
  //   $this->discardPrizes($playerId, $coalition);
  //   $this->discardPatriots($playerId, $coalition);
  // }

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

  function discardPrizes($playerId)
  {
    $from = Locations::prizes($playerId);
    $prizes = Cards::getInLocation($from)->toArray();

    foreach ($prizes as $index => $card) {
      $to = Locations::discardPile();

      Cards::insertOnTop($card['id'], $to);
    };
    if (count($prizes) > 0) {
      Notifications::discardPrizes($prizes, $playerId);
    }
  }

  function discardPatriots($actionStack)
  {
    /**
     * Three cases:
     * 1. Player has not patriots
     * 2. Player has patriots with of which at least one with leverage
     * 3. Player has patriots without leverage only.
     */
    $action = $actionStack[count($actionStack) - 1];

    $playerId = $action['playerId'];
    $player = Players::get($playerId);

    $courtCards = $player->getCourtCards();
    $loyalty =  $player->getLoyalty();

    $patriotsToDiscard = Utils::filter($courtCards, function ($card) use ($loyalty) {
      return $card['loyalty'] !== null && $card['loyalty'] === $loyalty;
    });

    // 1. Player has no patriots, so next action can be resolved
    if (count($patriotsToDiscard) === 0) {
      array_pop($actionStack);
      Globals::setActionStack($actionStack);
      $this->nextState('dispatchAction');
      return;
    }
    $hasPatriotWithLeverage = Utils::array_some($patriotsToDiscard, function ($card) {
      return in_array(LEVERAGE, $card['impactIcons']);
    });
    // Transition to discard step where player needs to select patriots
    if ($hasPatriotWithLeverage) {
      $actionStack[] = [
        'action' => 'discard',
        'playerId' => $playerId,
        'data' => [
          'from' => [COURT],
          'loyalty' => $loyalty,
        ]
      ];
      Globals::setActionStack($actionStack);
      $this->nextState('dispatchAction');
      return;
    }
    // 3. Discard all patriots
    array_pop($actionStack);
    foreach ($patriotsToDiscard as $index => $patriot) {
      $actionStack[] = [
        'action' => 'discardSingleCard',
        'playerId' => $playerId,
        'data' => [
          'cardId' => $patriot['id'],
          'from' => COURT,
          'to' => DISCARD
        ],
      ];
    }
    Globals::setActionStack($actionStack);
    $this->nextState('dispatchAction');
  }

  // function discardPatriots($playerId, $coalition)
  // {
  //   $playerId = intval($playerId);
  //   $courtCards = Players::get($playerId)->getCourtCards();
  //   Notifications::log('courtCards', $courtCards);
  //   $patriots = Utils::filter($courtCards, function ($card) use ($coalition) {
  //     return $card['loyalty'] !== null && $card['loyalty'] !== $coalition;
  //   });
  //   Notifications::log('patriots', $patriots);
  //   if (count($patriots) > 0) {
  //     $player = Players::get($playerId);
  //     Notifications::discardPatriots($player);
  //     $this->executeDiscards($patriots, $player, [
  //       'activePlayerId' => $playerId,
  //       'transition' => 'playerActions'
  //     ]);
  //   } else {
  //     $this->nextState('playerActions', $playerId);
  //   }
  // }
}
