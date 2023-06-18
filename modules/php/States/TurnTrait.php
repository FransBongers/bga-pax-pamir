<?php

namespace PaxPamir\States;

use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Helpers\Log;
use PaxPamir\Helpers\Utils;

trait TurnTrait
{
  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argStartOfTurnAbilities()
  {
    $player = Players::get();
    $specialAbilities = [];
    $usedSpecialAbilities = Globals::getUsedSpecialAbilities();
    if ($player->hasSpecialAbility(SA_BLACKMAIL_HERAT) && !in_array(SA_BLACKMAIL_HERAT, $usedSpecialAbilities)) {
      $specialAbilities[] = SA_BLACKMAIL_HERAT;
    }
    if ($player->hasSpecialAbility(SA_BLACKMAIL_KANDAHAR) && !in_array(SA_BLACKMAIL_KANDAHAR, $usedSpecialAbilities)) {
      $specialAbilities[] = SA_BLACKMAIL_KANDAHAR;
    }
    return [
      'specialAbilities' => $specialAbilities,
    ];
  }

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function stPrepareTurn()
  {
    Globals::setRemainingActions(2);
    Globals::setUsedSpecialAbilities([]);
    Log::enable();
    // Log::checkpoint();
    Log::clearAll();

    if ($this->playerHasStartOfTurnSpecialAbilities([])) {
      $this->nextState('startOfTurnAbilities');
    } else {
      $this->gamestate->nextState('playerActions');
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function playerHasStartOfTurnSpecialAbilities($usedSpecialAbilities)
  {
    $player = Players::get();
    if (!in_array(SA_BLACKMAIL_HERAT, $usedSpecialAbilities) && $player->hasSpecialAbility(SA_BLACKMAIL_HERAT) && $this->existsCourtCardWithoutSpy(HERAT)) {
      return true;
    }
    if (!in_array(SA_BLACKMAIL_KANDAHAR, $usedSpecialAbilities) && $player->hasSpecialAbility(SA_BLACKMAIL_KANDAHAR) && $this->existsCourtCardWithoutSpy(KANDAHAR)) {
      return true;
    }
    return false;
  }

  function existsCourtCardWithoutSpy($region)
  {
    $players = Players::getAll()->toArray();
    $allCourtCards = array_merge(...array_map(function ($player) {
      return $player->getCourtCards();
    }, $players));
    return Utils::array_some($allCourtCards, function ($card) use ($region) {
      if ($card['region'] !== $region) {
        return false;
      }
      $spies = Tokens::getInLocation(['spies', $card['id']])->toArray();
      return count($spies) === 0;
    });
  }
}
