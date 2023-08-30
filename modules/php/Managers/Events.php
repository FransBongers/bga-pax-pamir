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

  public static function dispatchResolvePurchasedEffect($actionStack)
  {
    $action = array_pop($actionStack);
    $event = $action['data']['event'];
    $playerId = $action['playerId'];
    switch ($event) {
      case ECE_DOMINANCE_CHECK:
        $actionStack[] = ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_SETUP, $playerId, [
          'cards' => [$action['data']['cardId']],
        ]);
        break;
      case ECE_KOH_I_NOOR_RECOVERED: // card_106
        Events::updateInfluence();
        break;
      case ECE_RUMOR: // card_108
        $actionStack[] = ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
          'transition' => 'eventCardRumor',
        ]);
        break;
      case ECE_BACKING_OF_PERSIAN_ARISTOCRACY: // card_113
        Events::backingOfPersianAristocracy($playerId);
        break;
      case ECE_OTHER_PERSUASIVE_METHODS: // card_114
        $actionStack[] = ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
          'transition' => 'eventCardOtherPersuasiveMethods',
        ]);
        break;
      case ECE_PASHTUNWALI_VALUES: // card_115
        $actionStack[] = ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
          'transition' => 'eventCardPashtunwaliValues',
        ]);
        break;
      case ECE_REBUKE: // card_116
        $actionStack[] = ActionStack::createAction(DISPATCH_TRANSITION, $playerId, [
          'transition' => 'eventCardRebuke',
        ]);
        break;
      case ECE_NEW_TACTICS: // card_105
      case ECE_COURTLY_MANNERS: // card_107
      case ECE_CONFLICT_FATIGUE: // card_109
      case ECE_NATIONALISM: // card_110
      case ECE_PUBLIC_WITHDRAWAL: // card_111

      default:
        break;
    }

    ActionStack::next($actionStack);
  }

  // .########.##.....##.########.##....##.########..######.
  // .##.......##.....##.##.......###...##....##....##....##
  // .##.......##.....##.##.......####..##....##....##......
  // .######...##.....##.######...##.##.##....##.....######.
  // .##........##...##..##.......##..####....##..........##
  // .##.........##.##...##.......##...###....##....##....##
  // .########....###....########.##....##....##.....######.

  public static function resolveDiscardEffect($actionStack, $card, $location, $playerId)
  {
    $event = $card['discarded']['effect'];
    Notifications::log('event', $event);
    switch ($event) {
        // cards 101-104
      case ECE_DOMINANCE_CHECK:
        $actionStack[] = ActionStack::createAction(DISPATCH_DOMINANCE_CHECK_SETUP, $playerId, [
          'cards' => [$card['id']],
        ]);
        return $actionStack;
        break;
        // card 105
      case ECE_MILITARY_SUIT:
        Game::get()->resolveFavoredSuitChange(MILITARY, ECE_MILITARY_SUIT);
        break;
        // card 106
      case ECE_EMBARRASSEMENT_OF_RICHES:
        Events::updateInfluence();
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
        return array_merge($actionStack, Events::riot(PUNJAB));
        break;
        // card 110
      case ECE_RIOTS_IN_HERAT:
        return array_merge($actionStack, Events::riot(HERAT));
        break;
        // card 111
      case ECE_NO_EFFECT:
        // Event has a discard effect instead of purchase effect
        Events::publicWithdrawal($location);
        break;
        // card 112
      case ECE_RIOTS_IN_KABUL:
        return array_merge($actionStack, Events::riot(KABUL));
        break;
        // card 113
      case ECE_RIOTS_IN_PERSIA:
        return array_merge($actionStack, Events::riot(PERSIA));
        break;
        // card 114
      case ECE_CONFIDENCE_FAILURE:
        return array_merge($actionStack, Events::confidenceFailure($playerId));
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
    return $actionStack;;
  }



  // card_113 - purchase
  public static function backingOfPersianAristocracy($playerId)
  {
    $player = PaxPamirPlayers::get($playerId);
    PaxPamirPlayers::incRupees($playerId, 3);
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
      $nextPlayerId = PaxPamirPlayers::getNextId($nextPlayerId);
    }
    $extraActions = array_map(function ($id) {
      return ActionStack::createAction(DISPATCH_DISCARD, $id, [
        'from' => [HAND]
      ]);
    }, array_reverse($playerOrder));

    return $extraActions;
  }

  // card_106
  public static function updateInfluence()
  {
    // recalculate influence ignoring gifts
    $players = PaxPamirPlayers::getAll();
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
    $players = PaxPamirPlayers::getAll();
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
    $tribeResult = Map::removeTribesFromRegion($regionId);
    $armies = Map::removeArmiesFromRegion($regionId);
    $message = clienttranslate('All tribes and armies are removed from ${logTokenRegionName}');
    Notifications::returnAllToSupply(PaxPamirPlayers::get(), $message, ['logTokenRegionName' => Utils::logTokenRegionName($regionId)],$regionId, $armies, $tribeResult['tribes']);
    Map::checkRulerChange($regionId);
    return $tribeResult['actions'];
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

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
