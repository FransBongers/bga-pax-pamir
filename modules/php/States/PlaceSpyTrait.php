<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
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
    $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;

    return array(
      'regionId' => $card['region'],
      'selectedPiece' => $selectedPiece,
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
      $playerId = self::getActivePlayerId();
      $this->resolvePlaceSpy($cardId, $playerId);
    } else {
      $actionStack = Globals::getActionStack();
      $action = array_pop($actionStack);
      Globals::setActionStack($actionStack);

      if ($action['action'] !== DISPATCH_IMPACT_ICON_SPY) {
        throw new \feException("Not a valid action");
      };
      $playerId = $action['playerId'];
      $selectedPiece = isset($action['data']['selectedPiece']) ? $action['data']['selectedPiece'] : null;
      $this->resolvePlaceSpy($cardId, $playerId, $selectedPiece);
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

  function resolvePlaceSpy($cardId, $playerId, $selectedPiece = null)
  {

    $from = "cylinders_" . $playerId;
    $cylinder = $selectedPiece !== null ? Tokens::get($selectedPiece) : Tokens::getTopOf($from);
    if ($cylinder === null) {
      return;
    }
    $from = $cylinder['location'];
    $to = 'spies_' . $cardId;
    Tokens::move($cylinder['id'], $to);
    Tokens::setUsed($cylinder['id'], USED);
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

    if ($selectedPiece !== null) {
      $fromRegionId = explode('_', $from)[1];
      $isTribe = Utils::startsWith($from, 'tribes');
      if ($isTribe) {
        Map::checkRulerChange($fromRegionId);
      }
    }
  }

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
