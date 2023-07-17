<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlaceSpyTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argPlaceSpy()
  {
    $actionStack = Globals::getActionStack();
    $action = $actionStack[count($actionStack) - 1];

    $card = Cards::get($action['data']['cardId']);

    return array(
      'regionId' => $card['region'],
    );
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

  /**
   * Places spy on card
   */
  function placeSpy($cardId, $specialAbility = null)
  {
    self::checkAction('placeSpy');

    $card = Cards::get($cardId);
    if (!Utils::startsWith($card['location'], "court")) {
      throw new \feException("Selected card is not in a court");
    };

    $isStartOfTurnAbility = $this->gamestate->state(true, false, true)['name'] === "startOfTurnAbilities";
    if ($isStartOfTurnAbility) {
      $this->isValidStartOfTurnSpecialAbility($specialAbility);
    } else {
      $actionStack = Globals::getActionStack();
      $action = array_pop($actionStack);
      Globals::setActionStack($actionStack);

      if ($action['action'] !== DISPATCH_IMPACT_ICON_SPY) {
        throw new \feException("Not a valid action");
      };
    }

    // TODO: check if $cardId is in court?
    $playerId = self::getActivePlayerId();
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);

    if ($cylinder != null) {
      $to = 'spies_' . $cardId;
      Tokens::move($cylinder['id'], $to);
      $message = clienttranslate('${player_name} places ${logTokenCylinder} on ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
      Notifications::moveToken($message, [
        'player' => Players::get(),
        'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
        'logTokenCylinder' => Utils::logTokenCylinder(Players::get()->getId()),
        'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
        'logTokenNewLine' => Utils::logTokenNewLine(),
        'moves' => [
          [
            'from' => $from,
            'to' => $to,
            'tokenId' => $cylinder['id'],
          ]
        ]
      ]);
    }
    if ($isStartOfTurnAbility) {
      $usedSpecialAbilities = Globals::getUsedSpecialAbilities();
      $usedSpecialAbilities[] = $specialAbility;
      Globals::setUsedSpecialAbilities($usedSpecialAbilities);
      $transition = $this->playerHasStartOfTurnSpecialAbilities($usedSpecialAbilities) ? 'startOfTurnAbilities' : 'playerActions';
      $this->nextState($transition);
    } else {
      $this->nextState('dispatchAction');
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function isValidStartOfTurnSpecialAbility($specialAbility)
  {
    if (!in_array($specialAbility, [SA_BLACKMAIL_HERAT, SA_BLACKMAIL_KANDAHAR])) {
      throw new \feException("Not a valid start of turn ability");
    };
    $usedSpecialAbilities = Globals::getUsedSpecialAbilities();
    if (in_array($specialAbility, $usedSpecialAbilities)) {
      throw new \feException("Special ability has already been used this turn");
    };
    if (!Players::get()->hasSpecialAbility($specialAbility)) {
      throw new \feException("Player does not have special ability");
    }
  }
}
