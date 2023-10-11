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
use PaxPamir\Managers\Tokens;

trait SASafeHouseTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argSpecialAbilitySafeHouse()
  {
    $actionStack = ActionStack::get();
    $data = $actionStack[count($actionStack) - 1]['data'];
    return $data;
  }

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

  function dispatchSASafeHouse($actionStack)
  {
    $action = $actionStack[count($actionStack) - 1];
    $playerId = $action['playerId'];
    if ($action['playerId'] === WAKHAN_PLAYER_ID) {
      $this->wakhanSASafeHouse($actionStack);
      // use safe house ability and pop action
    } else {
      $this->nextState('specialAbilitySafeHouse', $playerId);
    }
  }

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

  function specialAbilitySafeHouse($cardId = null)
  {
    self::checkAction('specialAbilitySafeHouse');

    $actionStack = ActionStack::get();
    // $action = $actionStack[count($actionStack) - 1];
    // Notifications::log('action', $action);
    $action = array_pop($actionStack);
    $data = $action['data'];
    // Get data
    // $data = Globals::getSpecialAbilityData();
    $cylinderId = $data['cylinderId'];
    $fromCardId = $data['fromCardId'];
    // $tokenId = $cylinder['tokenId'];
    $playerId = $action['playerId'];

    // If cardId is null player chose not to use Safe House ability
    if ($cardId === null) {
         $to = implode('_', ['cylinders', $playerId]);
      $state = Tokens::insertOnTop($cylinderId, $to);
      $message = clienttranslate('${tkn_playerName} does not use Safe House');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get($playerId),
        'move' => [
          'from' => 'spies_'.$fromCardId,
          'to' => $to,
          'tokenId' => $cylinderId,
          'weight' => $state,
        ]
      ]);
      ActionStack::next($actionStack);
      return;
    }

    // Player selected card with Safe House ability
    $card = Cards::get($cardId);

    if ($card['location'] !== 'court_' . $playerId) {
      throw new \feException("Card is not in player's court");
    };
    if ($card['specialAbility'] !== SA_SAFE_HOUSE) {
      throw new \feException("Card does not have Safe House special ability");
    };

    $to = Locations::spies($cardId);
    $state = Tokens::insertOnTop($cylinderId, $to);
    $message = clienttranslate('${tkn_playerName} places ${tkn_cylinder} on ${tkn_cardName}${tkn_newLine}${tkn_largeCard}');
    Notifications::moveToken($message, [
      'player' => PaxPamirPlayers::get($playerId),
      'tkn_largeCard' => $cardId,
      'tkn_cylinder' => $playerId.'_cylinder',
      'tkn_cardName' => $card['name'],
      'tkn_newLine' => '<br>',
      'move' => [
        'from' => 'spies_'.$fromCardId,
        'to' => $to,
        'tokenId' => $cylinderId,
        'weight' => $state,
      ]
    ]);
    ActionStack::next($actionStack);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  // Check if there are more cylinders protected by Safe House.
  // Otherwise continue player actions
  // function safeHouseNextStep($data)
  // {
  //   $cylinders = $data['args']['cylinders'];
  //   array_shift($cylinders);
  //   if (count($cylinders) > 0) {
  //     $data['args']['cylinders'] = $cylinders;
  //     Globals::setSpecialAbilityData($data);
  //     $this->nextState('specialAbilitySafeHouse', $cylinders[0]['playerId']);
  //   } else {
  //     $this->nextState('playerActions', $data['args']['activePlayerId']);
  //   }
  // }
}
