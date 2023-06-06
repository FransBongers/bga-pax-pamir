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

trait ResolveEventTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argResolveEvent()
  {
    $currentEvent = Globals::getCurrentEvent();
    return [
      'event' => $currentEvent['event'],
    ];
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

  function eventChoice($data)
  {
    self::checkAction('eventChoice');
    Notifications::log('eventChoice', $data);
    $currentEvent = Globals::getCurrentEvent();
    switch ($currentEvent['event']) {
      case ECE_CONFIDENCE_FAILURE:
        $this->resolveConfidenceFailure($currentEvent, $data);
        break;
      case ECE_REBUKE:
        $this->resolveRebuke($currentEvent, $data);
        break;
      case ECE_RUMOR:
        $this->resolveRumor($currentEvent, $data);
        break;
      default:
        throw new \feException("Unable to resolve event");
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  private function resolveConfidenceFailure($currentEvent, $data)
  {
    $cardId = $data['cardId'];
    Notifications::log('resolveConfidenceFailure', $cardId);

    $player = Players::get();
    $playerId = $player->getId();
    $card = Cards::get($cardId);

    if ($card['location'] !== Locations::hand($playerId)) {
      throw new \feException("Card is not in players hand");
    }

    Cards::insertOnTop($cardId, DISCARD);
    Notifications::discardFromHand($card, $player);
    $nextPlayerId = Players::getNextId($player);
    $currentEvent['resolvedForPlayers'][] = $playerId;
    Events::confidenceFailureNextStep($currentEvent, $nextPlayerId);
  }

  private function resolveRebuke($currentEvent, $data)
  {
    $regionId = $data['regionId'];
    $tribeMoves = Map::removeTribesFromRegion($regionId);
    $armyMoves = Map::removeArmiesFromRegion($regionId);
    $message = clienttranslate('${player_name} removes all tribes and armies from ${logTokenRegionName}');
    $moves = array_merge($tribeMoves, $armyMoves);
    Notifications::moveToken($message, [
      'player' => Players::get(),
      'logTokenRegionName' => Utils::logTokenRegionName($regionId),
      'moves' => $moves
    ]);
    $this->nextState("playerActions");
  }

  private function resolveRumor($currentEvent, $data)
  {
    $player = Players::get();
    $playerId = $player->getId();
    $selectedPlayerId = $data['playerId'];
    $selectedPlayer = Players::get($selectedPlayerId);
    $message = clienttranslate('${player_name} chooses ${player_name2}');
    $from = 'events_' . $playerId;
    $to = 'events_' . $selectedPlayerId;
    $moves = $playerId === $selectedPlayerId ? [] : [[
      'from' => $from,
      'to' => $to,
      'tokenId' => 'card_108'
    ]];
    Cards::move('card_108',$to);
    Notifications::moveCard($message, [
      'player' => $player,
      'player_name2' => $selectedPlayer->getName(),
    ], 'MOVE_EVENT', $moves);
    $updates = [[
      'playerId' => $selectedPlayerId,
      'value' => $selectedPlayer->getInfluence(),
    ]];
    Notifications::updateInfluence($updates);
    $this->nextState("playerActions");
  }
}
