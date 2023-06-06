<?php

namespace PaxPamir\Managers;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

class Events
{

  // .########.##.....##.########.##....##.########..######.
  // .##.......##.....##.##.......###...##....##....##....##
  // .##.......##.....##.##.......####..##....##....##......
  // .######...##.....##.######...##.##.##....##.....######.
  // .##........##...##..##.......##..####....##..........##
  // .##.........##.##...##.......##...###....##....##....##
  // .########....###....########.##....##....##.....######.

  // card_113 - purchase
  public static function backingOfPersianAristocracy ()
  {
    $player = Players::get();
    Players::incRupees($player->getId(), 3);
    Notifications::takeRupeesFromSupply($player, 3);
  }

  // card_114
  public static function confidenceFailure()
  {
    Notifications::message(clienttranslate('All players must discard a card from their hand'));
    // call utility function to determine
    // get current PlayerId. Call function to execute check for current player
    $playerId = Players::get()->getId();
    $currentEvent = [
      'event' => ECE_CONFIDENCE_FAILURE,
      'activePlayerId' => $playerId,
      'transition' => 'discardEvents',
      'resolvedForPlayers' => []
    ];
    Globals::setCurrentEvent($currentEvent);
    Events::confidenceFailureNextStep($currentEvent, $playerId);
    /**
     * For given player
     *  => check if already processed, otherwise done
     *    if not check number of cards:
     *      0: check next player
     *      1: discard and check next player
     *      >1: player must choose
     * When done
     *  => transition to cleanup 
     */
  }

  // card_106
  public static function embarrassementOfRiches()
  {
    // recalculate influence ignoring gifts
    $players = Players::getAll();
    $updates = [];
    foreach ($players as $playerId => $player) {
      $updates[] = [
        'playerId' => $playerId,
        'value' => $player->getInfluence(),
      ];
    }
    Notifications::updateInfluence($updates);
  }

  // card_108
  public static function failureToImpress()
  {
    $players = Players::getAll();
    foreach ($players as $playerId => $player) {
      Game::get()->discardPrizes($playerId, $player->getLoyalty());
    }
  }

  public static function publicWithdrawal ($location) {
    Tokens::moveAllInLocation([$location,'rupees'],RUPEE_SUPPLY);
    Notifications::publicWithdrawalEvent($location);
  }

  public static function riot($regionId)
  {
    $tribeMoves = Map::removeTribesFromRegion($regionId);
    $armyMoves = Map::removeArmiesFromRegion($regionId);
    $message = clienttranslate('All tribes and armies are removed from ${logTokenRegionName}');
    $moves = array_merge($tribeMoves, $armyMoves);
    Notifications::moveToken($message, [
      'logTokenRegionName' => Utils::logTokenRegionName($regionId),
      'moves' => $moves
    ]);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  public static function confidenceFailureNextStep($currentEvent, $playerId)
  {
    $player = Players::get($playerId);
    if (in_array($playerId, $currentEvent['resolvedForPlayers'])) {
      // Made full round, can get back to discardEvents
      Game::get()->nextState($currentEvent['transition'], $currentEvent['activePlayerId']);
      return;
    }
    $handCards = $player->getHandCards();
    $number = count($handCards);
    if ($number === 0) {
      $nextPlayerId = Players::getNextId($player);
      $currentEvent['resolvedForPlayers'][] = $playerId;
      Events::confidenceFailureNextStep($currentEvent, $nextPlayerId);
    } else if ($number === 1) {
      Cards::insertOnTop($handCards[0]['id'], DISCARD);
      Notifications::discardFromHand($handCards[0], $player);
      $nextPlayerId = Players::getNextId($player);
      $currentEvent['resolvedForPlayers'][] = $playerId;
      Events::confidenceFailureNextStep($currentEvent, $nextPlayerId);
    } else if ($number > 1) {
      Game::get()->nextState("resolveEvent", $playerId);
    }
  }

  public static function getPurchasedEventLocation($event, $playerId)
  {
    switch ($event) {
      case ECE_DOMINANCE_CHECK:
        return Locations::discardPile();
        break;
      case ECE_NEW_TACTICS:
        return Locations::playerEvent($playerId);
        break;
      case ECE_KOH_I_NOOR_RECOVERED:
        return Locations::playerEvent($playerId);
        break;
      case ECE_COURTLY_MANNERS:
        return Locations::playerEvent($playerId);
        break;
      case ECE_RUMOR:
        return Locations::playerEvent($playerId);
        break;
      case ECE_CONFLICT_FATIGUE:
        return Locations::playerEvent($playerId);
        break;
      case ECE_NATIONALISM:
        return Locations::playerEvent($playerId);
        break;
      case ECE_PUBLIC_WITHDRAWAL:
        return Locations::discardPile();
        break;
      case ECE_NATION_BUILDING:
        return Locations::playerEvent($playerId);
        break;
      case ECE_BACKING_OF_PERSIAN_ARISTOCRACY:
        return Locations::discardPile();
        break;
      case ECE_OTHER_PERSUASIVE_METHODS:
        return Locations::discardPile();
        break;
      case ECE_PASHTUNWALI_VALUES:
        return Locations::playerEvent($playerId);
        break;
      case ECE_REBUKE:
        return Locations::discardPile();
        break;
      default:
        return null;
    }
  }

  public static function isEmbarrassementOfRichesActive()
  {
    return Events::isGlobalEventActive(ECE_EMBARRASSEMENT_OF_RICHES);
  }

  public static function isDisregardForCustomsActive()
  {
    return Events::isGlobalEventActive(ECE_DISREGARD_FOR_CUSTOMS);
  }

  public static function isRumorActive($player)
  {
    $isActive = Utils::array_some($player->getEventCards(), function ($card) {
      return $card['purchased']['effect'] === ECE_RUMOR;
    });
    return $isActive;
  }
  

  /**
   * Global events are events that have an effect on all players in the game.
   */
  public static function isGlobalEventActive($eventId)
  {
    $globalEvents = Cards::getInLocation(ACTIVE_EVENTS)->toArray();
    $isActive = Utils::array_some($globalEvents, function ($event) use ($eventId) {
      return $event['discarded']['effect'] === $eventId;
    });
    return $isActive;
  }

  public static function setCurrentEventGlobalState($eventId,$args = null) 
  {
    $currentEvent = [
      'event' => $eventId,
      'args' => $args,
    ];
    Globals::setCurrentEvent($currentEvent);
  }
}
