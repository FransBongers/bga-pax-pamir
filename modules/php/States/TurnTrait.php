<?php

namespace PaxPamir\States;

use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use Paxpamir\Managers\PaxPamirPlayers;
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
    $action = ActionStack::getNext();

    return [
      'specialAbility' => $action['data']['specialAbility'],
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
    Globals::setDeclinedBribes(0);

    Log::enable();
    Log::checkpoint();
    Log::clearAll();

    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();

    $playerCanUseBlackmailKandahar = $player->hasSpecialAbility(SA_BLACKMAIL_KANDAHAR) && $this->existsCourtCardWithoutSpy(KANDAHAR);
    $playerCanUseBlackmailHerat = $player->hasSpecialAbility(SA_BLACKMAIL_HERAT) && $this->existsCourtCardWithoutSpy(HERAT);

    $actionStack = [
      ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
        'transition' => 'playerActions',
        'checkpoint' => $playerCanUseBlackmailKandahar || $playerCanUseBlackmailHerat ? false : true,
      ])
    ];

    // Add start of turn abilities to action stack
    if ($playerCanUseBlackmailKandahar) {
      $actionStack[] =    ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
        'transition' => 'startOfTurnAbilities',
        'pop' => false,
        'specialAbility' => SA_BLACKMAIL_KANDAHAR
      ]);
    }

    if ($playerCanUseBlackmailHerat) {
      $actionStack[] =    ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
        'transition' => 'startOfTurnAbilities',
        'pop' => false,
        'specialAbility' => SA_BLACKMAIL_HERAT
      ]);
    }

    ActionStack::next($actionStack);
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
  

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...


  function existsCourtCardWithoutSpy($region)
  {
    $players = PaxPamirPlayers::getAll()->toArray();
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
