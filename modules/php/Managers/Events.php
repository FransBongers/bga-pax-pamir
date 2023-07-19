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

  public static function resolveDiscardEffect($event, $location, $playerId)
  {
    Notifications::log('event', $event);
    switch ($event) {
        // cards 101-104
      case ECE_DOMINANCE_CHECK:
        Game::get()->resolveDominanceCheck();
        break;
        // card 105
      case ECE_MILITARY_SUIT:
        Game::get()->resolveFavoredSuitChange(MILITARY, ECE_MILITARY_SUIT);
        break;
        // card 106
      case ECE_EMBARRASSEMENT_OF_RICHES:
        Events::embarrassementOfRiches();
        break;
        // card 107
      case ECE_DISREGARD_FOR_CUSTOMS:
        // No additional action needed at this point
        break;
        // card 108
      case ECE_FAILURE_TO_IMPRESS:
        Events::failureToImpress();
        break;
        // card 109
      case ECE_RIOTS_IN_PUNJAB:
        Events::riot(PUNJAB);
        break;
        // card 110
      case ECE_RIOTS_IN_HERAT:
        Events::riot(HERAT);
        break;
        // card 111
      case ECE_NO_EFFECT:
        // Event has a discard effect instead of purchasse effect
        Events::publicWithdrawal($location);
        break;
        // card 112
      case ECE_RIOTS_IN_KABUL:
        Events::riot(KABUL);
        break;
        // card 113
      case ECE_RIOTS_IN_PERSIA:
        Events::riot(PERSIA);
        break;
        // card 114
      case ECE_CONFIDENCE_FAILURE:
        return Events::confidenceFailure($playerId);
        break;
        // card 115
      case ECE_INTELLIGENCE_SUIT:
        Game::get()->resolveFavoredSuitChange(INTELLIGENCE, ECE_INTELLIGENCE_SUIT);
        break;
        // card 116
      case ECE_POLITICAL_SUIT:
        Game::get()->resolveFavoredSuitChange(POLITICAL, ECE_POLITICAL_SUIT);
        break;
      default:
        Notifications::log('no match for event', []);
    }
    return null;
  }

  // card_113 - purchase
  public static function backingOfPersianAristocracy()
  {
    $player = Players::get();
    Players::incRupees($player->getId(), 3);
    Notifications::takeRupeesFromSupply($player, 3);
  }

  // card_114
  public static function confidenceFailure($playerId)
  {
    Notifications::message(clienttranslate('All players must discard a card from their hand'));

    $playerOrder = [];
    $nextPlayerId = $playerId;

    while (!in_array($nextPlayerId, $playerOrder)) {
      $playerOrder[] = $nextPlayerId;
      $nextPlayerId = Players::getNextId($nextPlayerId);
    }
    $extraActions = array_map(function ($id) {
      return ActionStack::createAction(DISPATCH_DISCARD, $id, [
        'from' => [HAND]
      ]);
    }, array_reverse($playerOrder));

    return $extraActions;
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

  public static function publicWithdrawal($location)
  {
    Tokens::moveAllInLocation([$location, 'rupees'], RUPEE_SUPPLY);
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
    Map::checkRulerChange($regionId);
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  // public static function confidenceFailureNextStep($currentEvent, $playerId)
  // {
  //   $player = Players::get($playerId);
  //   if (in_array($playerId, $currentEvent['resolvedForPlayers'])) {
  //     // Made full round, can get back to discardEvents
  //     Game::get()->nextState($currentEvent['transition'], $currentEvent['activePlayerId']);
  //     return;
  //   }
  //   $handCards = $player->getHandCards();
  //   $number = count($handCards);
  //   if ($number === 0) {
  //     $nextPlayerId = Players::getNextId($player);
  //     $currentEvent['resolvedForPlayers'][] = $playerId;
  //     Events::confidenceFailureNextStep($currentEvent, $nextPlayerId);
  //   } else if ($number === 1) {
  //     Cards::insertOnTop($handCards[0]['id'], DISCARD);
  //     Notifications::discardFromHand($handCards[0], $player);
  //     $nextPlayerId = Players::getNextId($player);
  //     $currentEvent['resolvedForPlayers'][] = $playerId;
  //     Events::confidenceFailureNextStep($currentEvent, $nextPlayerId);
  //   } else if ($number > 1) {
  //     Game::get()->nextState("resolveEvent", $playerId);
  //   }
  // }

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

  public static function isConflictFatigueActive()
  {
    $card = Cards::get(ECE_CONFLICT_FATIGUE_CARD_ID);
    return Utils::startsWith($card['location'], 'events_');
  }

  public static function isCourtlyMannersActive($player)
  {
    return self::isPlayerEventActive(ECE_COURTLY_MANNERS, $player);
  }

  public static function isDisregardForCustomsActive()
  {
    return Events::isGlobalEventActive(ECE_DISREGARD_FOR_CUSTOMS);
  }

  public static function isKohINoorRecoveredActive($player)
  {
    return self::isPlayerEventActive(ECE_KOH_I_NOOR_RECOVERED, $player);
  }

  public static function isNationalismActive($player)
  {
    $card = Cards::get(ECE_NATIONALISM_CARD_ID);
    return $card['location'] === 'events_' . $player->getId();
  }

  public static function isNationBuildingActive($player)
  {
    $card = Cards::get(ECE_NATION_BUILDING_CARD_ID);
    return $card['location'] === 'events_' . $player->getId();
  }

  public static function isNewTacticsActive($player)
  {
    return self::isPlayerEventActive(ECE_NEW_TACTICS, $player);
  }

  public static function isPashtunwaliValuesActive()
  {
    $card = Cards::get(ECE_PASHTUNWALI_VALUES_CARD_ID);
    return Utils::startsWith($card['location'], 'events_');
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

  /**
   * Player events are purchased event card effects that have been purchased by the player.
   */
  public static function isPlayerEventActive($eventId, $player)
  {
    $isActive = Utils::array_some($player->getEventCards(), function ($card) use ($eventId) {
      return $card['purchased']['effect'] === $eventId;
    });
    return $isActive;
  }

  public static function setCurrentEventGlobalState($eventId, $args = null)
  {
    $currentEvent = [
      'event' => $eventId,
      'args' => $args,
    ];
    Globals::setCurrentEvent($currentEvent);
  }
}
