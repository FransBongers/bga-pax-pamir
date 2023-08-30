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
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait ResolveEventTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  // function argResolveEvent()
  // {
  //   $currentEvent = Globals::getCurrentEvent();
  //   return [
  //     'event' => $currentEvent['event'],
  //   ];
  // }

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

  function eventCardPashtunwaliValues($suit)
  {
    self::checkAction('eventCardPashtunwaliValues');
    $this->resolveFavoredSuitChange($suit, ECE_PASHTUNWALI_VALUES);
    $actionStack = ActionStack::get();
    ActionStack::next($actionStack);
  }

  function eventCardOtherPersuasiveMethods($selectedPlayerId)
  {
    self::checkAction('eventCardOtherPersuasiveMethods');
    Notifications::log('selected', $selectedPlayerId);
    $actionStack = ActionStack::get();
    $selectedPlayerId = intval($selectedPlayerId);


    $selectedPlayer = PaxPamirPlayers::get($selectedPlayerId);
    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();

    if ($playerId === $selectedPlayerId) {
      throw new \feException("Player must select another player");
    };
    $selectedPlayerHand = $selectedPlayer->getHandCards();
    $playerHand = $player->getHandCards();


    Cards::move(array_map(function ($card) {
      return $card['id'];
    }, $selectedPlayerHand), Locations::hand($playerId));
    Cards::move(array_map(function ($card) {
      return $card['id'];
    }, $playerHand), Locations::hand($selectedPlayerId));

    Notifications::log('resolveOtherPersuasiveMethods', [
      'selectedPlayerHand'  => $selectedPlayerHand,
      'playerHand' => $playerHand,
    ]);
    Notifications::exchangeHandAllPlayers($player, $selectedPlayer, [
      $player->getId() => count($selectedPlayerHand),
      $selectedPlayer->getId() => count($playerHand),
    ]);

    Notifications::replaceHand($player, $selectedPlayerHand);
    Notifications::replaceHand($selectedPlayer, $playerHand);

    ActionStack::next($actionStack);
  }


  function eventCardRebuke($regionId)
  {
    self::checkAction('eventCardRebuke');
    $actionStack = ActionStack::get();

    $tribeResult = Map::removeTribesFromRegion($regionId);
    $armies = Map::removeArmiesFromRegion($regionId);
    $message = clienttranslate('${player_name} removes all tribes and armies from ${logTokenRegionName}');
    Notifications::returnAllToSupply(PaxPamirPlayers::get(), $message, ['logTokenRegionName' => Utils::logTokenRegionName($regionId),], $regionId, $armies, $tribeResult['tribes']);
    Map::checkRulerChange($regionId);
    if (count($tribeResult['actions']) > 0) {
      $actionStack = array_merge($actionStack, $tribeResult['actions']);
    }
    ActionStack::next($actionStack);
  }



  function eventCardRumor($selectedPlayerId)
  {
    self::checkAction('eventCardRumor');
    $actionStack = ActionStack::get();

    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();

    $selectedPlayerId = intval($selectedPlayerId);
    $selectedPlayer = PaxPamirPlayers::get($selectedPlayerId);

    $message = clienttranslate('${player_name} chooses ${player_name2}');

    $from = 'events_' . $playerId;
    $to = 'events_' . $selectedPlayerId;

    $move = $playerId === $selectedPlayerId ? null : [
      'from' => $from,
      'to' => $to,
      'id' => 'card_108'
    ];
    Cards::move('card_108', $to);
    Notifications::moveCard($message, [
      'player' => $player,
      'player_name2' => $selectedPlayer->getName(),
    ], 'MOVE_EVENT', $move);
    $updates = [[
      'playerId' => $selectedPlayerId,
      'value' => $selectedPlayer->getInfluence(),
    ]];
    Notifications::updateInfluence($updates);

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
