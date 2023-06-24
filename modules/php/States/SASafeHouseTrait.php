<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
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
    $data = Globals::getSpecialAbilityData();
    return $data;
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

    // Get data
    $data = Globals::getSpecialAbilityData();
    $cylinder = $data['args']['cylinders'][0];
    $from = $cylinder['from'];
    $tokenId = $cylinder['tokenId'];
    $playerId = $cylinder['playerId'];

    // If cardId is null player chose not to use Safe House ability
    if ($cardId === null) {
      $to = implode('_', ['cylinders', $playerId]);
      $state = Tokens::insertOnTop($tokenId, $to);
      $message = clienttranslate('${player_name} does not use Safe House');
      Notifications::moveToken($message, [
        'player' => Players::get(),
        'moves' => [
          [
            'from' => $from,
            'to' => $to,
            'tokenId' => $tokenId,
            'weight' => $state,
          ]
        ]
      ]);
      $this->safeHouseNextStep($data);
      return;
    }

    // Player selected card with Safe House ability
    $card = Cards::get($cardId);

    if ($card['location'] !== 'court_'.$playerId) {
      throw new \feException("Card is not in player's court");
    };
    if ($card['specialAbility'] !== SA_SAFE_HOUSE) {
      throw new \feException("Card does not have Safe House special ability");
    };

    $to = Locations::spies($cardId);
    $state = Tokens::insertOnTop($tokenId, $to);
    $message = clienttranslate('${player_name} places ${logTokenCylinder} on ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
    Notifications::moveToken($message, [
      'player' => Players::get(),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenCylinder' => Utils::logTokenCylinder($playerId),
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'moves' => [
        [
          'from' => $from,
          'to' => $to,
          'tokenId' => $tokenId,
          'weight' => $state,
        ]
      ]
    ]);
    $this->safeHouseNextStep($data);
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
  function safeHouseNextStep($data)
  {
    $cylinders = $data['args']['cylinders'];
    array_shift($cylinders);
    if (count($cylinders) > 0) {
      $data['args']['cylinders'] = $cylinders;
      Globals::setSpecialAbilityData($data);
      $this->nextState('specialAbilitySafeHouse', $cylinders[0]['playerId']);
    } else {
      $this->nextState('playerActions', $data['args']['activePlayerId']);
    }
  }
}
