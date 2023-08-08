<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
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
    $actionStack = ActionStack::get();
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
  function placeSpy($cardId)
  {
    self::checkAction('placeSpy');
    $actionStack = ActionStack::get();
    $action = array_pop($actionStack);

    // TODO: check if it matches region of played card?
    Notifications::log('action', $action);

    $card = Cards::get($cardId);
    if (!Utils::startsWith($card['location'], "court")) {
      throw new \feException("Selected card is not in a court");
    };

    if ($card['region'] !== $action['data']['region']) {
      throw new \feException("Selected card is not in the same region as played card");
    };

    if ($action['type'] !== DISPATCH_IMPACT_ICON_SPY) {
      throw new \feException("Not a valid action");
    };

    $actionStack[] = ActionStack::createAction(DISPATCH_PLACE_CYLINDER, $action['playerId'], [
      'cardId' => $cardId,
      'type' => SPY,
    ]);


    ActionStack::next($actionStack);
    return;
  }


  function specialAbilityPlaceSpyStartOfTurn($skip, $cardId)
  {
    self::checkAction('specialAbilityPlaceSpyStartOfTurn');
    $actionStack = ActionStack::get();
    $action = array_pop($actionStack);
    if ($skip) {
      ActionStack::next($actionStack);
      return;
    }

    $specialAbility = $action['data']['specialAbility'];
    if (!Players::get()->hasSpecialAbility($specialAbility)) {
      throw new \feException("Player does not have special ability");
    }
    $card = Cards::get($cardId);
    if (($specialAbility === SA_BLACKMAIL_HERAT && $card['region'] !== HERAT) || ($specialAbility === SA_BLACKMAIL_KANDAHAR && $card['region'] !== KANDAHAR)) {
      throw new \feException("Selected card's region does not match special ability");
    }

    $playerId = $action['playerId'];
    $spies = Tokens::getInLocation(Locations::spies($cardId))->toArray();
    if (Utils::array_some($spies, function ($spy) use ($playerId) {
      return intval(explode('_', $spy['id'])[1]) === $playerId;
    })) {
      throw new \feException("Card already has a spy from player");
    }

    $actionStack[] = ActionStack::createAction(DISPATCH_PLACE_CYLINDER, $playerId, [
      'cardId' => $cardId,
      'type' => SPY,
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

}
