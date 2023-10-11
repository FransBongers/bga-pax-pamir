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
    $actionStack = ActionStack::get();
    $selectedPlayerId = intval($selectedPlayerId);


    $selectedPlayer = PaxPamirPlayers::get($selectedPlayerId);
    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();

    if ($playerId === $selectedPlayerId) {
      throw new \feException("Player must select another player");
    };

    $this->resolveEventCardOtherPersuasiveMethods($player, $selectedPlayer);

    ActionStack::next($actionStack);
  }


  function eventCardRebuke($regionId)
  {
    self::checkAction('eventCardRebuke');
    $actionStack = ActionStack::get();

    $tribeResult = $this->resolveEventCardRebuke($regionId);

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

    $selectedPlayerId = intval($selectedPlayerId);
    $selectedPlayer = PaxPamirPlayers::get($selectedPlayerId);

    $this->resolveEventCardRumor($player, $selectedPlayer);

    ActionStack::next($actionStack);
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function resolveEventCardRebuke($regionId)
  {
    $tribeResult = Map::removeTribesFromRegion($regionId);
    $armies = Map::removeArmiesFromRegion($regionId);
    $message = clienttranslate('${tkn_playerName} removes all tribes and armies from ${tkn_regionName}');
    Notifications::returnAllToSupply(PaxPamirPlayers::get(), $message, ['tkn_regionName' => $regionId,], $regionId, $armies, $tribeResult['tribes']);
    Map::checkRulerChange($regionId);
    return $tribeResult;
  }


  function resolveEventCardRumor($player, $selectedPlayer)
  {
    $playerId = $player->getId();
    $selectedPlayerId = $selectedPlayer->getId();

    $message = clienttranslate('${tkn_playerName} chooses ${tkn_playerName_2}');

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
      'tkn_playerName_2' => $selectedPlayer->getName(),
    ], 'MOVE_EVENT', $move);

    $updates = [];

    if ($selectedPlayerId !== WAKHAN_PLAYER_ID) {
      $updates[] = [
        'type' => PLAYER_INFLUENCE,
        'playerId' => $selectedPlayerId,
        'value' => $selectedPlayer->getInfluence(),
      ];
    } else {
      $updates[] = [
        'type' => WAKHAN_INFLUENCE,
        'influence' => $selectedPlayer->getWakhanInfluence(),
      ];
    }

    Notifications::updateInfluence($updates);
  }

  function resolveEventCardOtherPersuasiveMethods($player, $selectedPlayer)
  {
    $playerId = $player->getId();
    $selectedPlayerId = $selectedPlayer->getId();
    $selectedPlayerHand = $selectedPlayer->getHandCards();
    $playerHand = $player->getHandCards();


    Cards::move(array_map(function ($card) {
      return $card['id'];
    }, $selectedPlayerHand), Locations::hand($playerId));
    Cards::move(array_map(function ($card) {
      return $card['id'];
    }, $playerHand), Locations::hand($selectedPlayerId));

    Notifications::exchangeHandAllPlayers($player, $selectedPlayer, [
      $player->getId() => count($selectedPlayerHand),
      $selectedPlayer->getId() => count($playerHand),
    ]);
    if (!$player->isWakhan()) {
      Notifications::replaceHand($player, $selectedPlayerHand);
    }
    if (!$selectedPlayer->isWakhan()) {
      Notifications::replaceHand($selectedPlayer, $playerHand);
    }
    // This is the only event with which Wakhan can get cards in hand
    // Wakhan will immediately play them to court
    if ($player->isWakhan() || $selectedPlayer->isWakhan()) {
      $this->wakhanPlayCardsFromHand();
    }
  }
}
