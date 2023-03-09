<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayerActionTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argPlayerActions()
  {
    $playerId = self::getActivePlayerId();
    $currentPlayerId = self::getCurrentPlayerId();
    $player = Players::get($playerId);
    return array(
      'remainingActions' => Globals::getRemainingActions(),
      'unavailableCards' => Cards::getUnavailableCards(),
      'hand' => Cards::getInLocation(['hand', $currentPlayerId]),
      'court' => Cards::getInLocationOrdered(['court', $playerId])->toArray(),
      'suits' => $player->getSuitTotals(),
      'rulers' => Map::getRulers(),
      'favoredSuit' => Globals::getFavoredSuit(),
      'rupees' => $player->getRupees(),
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
   * Part of set up when players need to select loyalty.
   */
  function chooseLoyalty($coalition)
  {
    self::checkAction('chooseLoyalty');

    $playerId = Players::getActiveId();
    $coalitionName = $this->loyalty[$coalition]['name'];

    Players::get()->setLoyalty($coalition);

    // Notify
    // TODO (Frans): check i18n for coalition name
    self::notifyAllPlayers("chooseLoyalty", clienttranslate('${player_name} sets loyalty to ${coalitionName} ${logTokenCoalition}'), array(
      'playerId' => $playerId,
      'player_name' => Game::get()->getActivePlayerName(),
      'coalition' => $coalition,
      'coalitionName' => $coalitionName,
      'logTokenCoalition' => $coalition,
    ));

    $this->gamestate->nextState('next');
  }

  function pass()
  {
    //
    // pass remaining player actions
    //

    self::checkAction('pass');

    $playerId = self::getActivePlayerId();

    $remainingActions = Globals::getRemainingActions();
    $state = $this->gamestate->state();

    if (($remainingActions > 0) and ($state['name'] == 'playerActions')) {
      Globals::setRemainingActions(0);

      // Notify
      self::notifyAllPlayers("pass", clienttranslate('${player_name} ended their turn.'), array(
        'playerId' => $playerId,
        'player_name' => self::getActivePlayerName(),
      ));
    }

    $this->gamestate->nextState('cleanup');
  }

  /**
   * Revert gamestate to last save point (usually start of turn)
   */
  function restart()
  {
    self::checkAction('restart');
    if (Log::getAll()->empty()) {
      throw new \BgaVisibleSystemException('Nothing to undo');
    }
    Log::revertAll();
    // TODO: check what the us of Globals::fetch is
    Globals::fetch();

    // Refresh interface
    $datas = $this->getAllDatas(-1);
    // Unset all private and static information
    unset($datas['staticData']);
    unset($datas['canceledNotifIds']);

    Notifications::smallRefreshInterface($datas);
    $player = Players::getCurrent();
    Notifications::smallRefreshHand($player);

    $this->gamestate->jumpToState(Globals::getLogState());
  }

  /**
   * Play card from hand to court
   */
  function playCard($cardId, $leftSide = true, $bribe = null)
  {
    //
    // play a card from hand into the court on either the left or right side
    //

    self::checkAction('playCard');

    $playerId = self::getActivePlayerId();
    $card = Cards::get($cardId);
    $card_name = $this->cards[$cardId]['name'];

    // $bribe_card_id = $this->getGameStateValue("bribe_card_id");
    // $bribe_ruler = Cards::getRegionRulerForCard($bribe_card_id);
    // $bribe_amount = $this->getGameStateValue("bribe_amount");

    $courtCards = Cards::getInLocationOrdered(['court', $playerId])->toArray();

    // TODO (Frans): decide how we want to implement bribes
    // if (($bribe_ruler != 0) and ($bribe_ruler != $player_id)) {
    //     if ($bribe_amount == -1) {
    //         $this->setGameStateValue("bribe_card_id", $cardId);
    //         $this->gamestate->setPlayersMultiactive( [$bribe_ruler], 'negotiateBribe', $bExclusive = true );
    //         self::notifyAllPlayers( "playCard", $message, array(
    //             'player_id' => $player_id,
    //             'player_name' => self::getActivePlayerName(),
    //             'card' => $card,
    //             'card_name' => $card_name,
    //             'court_cards' => $court_cards,
    //             'bribe' => true,
    //         ) );
    //         return;
    //     } elseif ($bribe != $bribe_amount) {
    //         throw new feException( "Bribe is incorrect value" );
    //         return;
    //     } else {
    //         $this->incPlayerCoins($player_id, -$bribe);
    //     }
    // }

    if (Globals::getRemainingActions() > 0) {
      // check if loyaly change
      $cardLoyalty = $this->cards[$cardId]['loyalty'];
      if ($cardLoyalty != null) {
        $this->checkAndHandleLoyaltyChange($cardLoyalty);
      }

      if ($leftSide) {
        for ($i = 0; $i < count($courtCards); $i++) {
          Cards::setState($courtCards[$i]['id'], $i + 2);
        }
        Cards::move($cardId, ['court', $playerId], 1);
        $message = clienttranslate('${player_name} plays ${cardName} to the left side of their court');
      } else {
        Cards::move($cardId, ['court', $playerId], count($courtCards) + 1);
        $message = clienttranslate('${player_name} plays ${cardName} to the right side of their court');
      }
      Globals::incRemainingActions(-1);
      $court_cards = Cards::getInLocationOrdered(['court', $playerId])->toArray();
      $card = Cards::get($cardId);
      self::notifyAllPlayers("playCard", $message, array(
        'playerId' => $playerId,
        'player_name' => self::getActivePlayerName(),
        'card' => $card,
        'cardName' => $card_name,
        'courtCards' => $court_cards,
        'bribe' => false,
      ));

      $this->updatePlayerCounts();

      // $this->setGameStateValue("bribe_card_id", 0);
      // $this->setGameStateValue("bribe_amount", -1);

      Globals::setResolveImpactIconsCardId($cardId);
      Globals::setResolveImpactIconsCurrentIcon(0);
      $this->gamestate->nextState('resolveImpactIcons');
    }
  }

  /**
   * purchase card from market
   */
  function purchaseCard($cardId)
  {
    self::dump("purchaseCard", $cardId);
    self::checkAction('purchaseCard');

    $playerId = self::getActivePlayerId();
    $card = Cards::get($cardId);
    $cardInfo = $this->cards[$cardId];

    $baseCost = Globals::getFavoredSuit() === MILITARY ? 2 : 1;

    // Throw error if card is unavailble for purchase
    if ($card['used'] == 1) {
      throw new \feException("Card is unavailble");
    }

    $cardName = $this->cards[$cardId]['name'];
    $marketLocation = $card['location'];
    self::dump("purchaseCard", $cardId, $playerId, $card);
    $row = explode("_", $marketLocation)[1];
    $rowAlt = ($row == 0) ? 1 : 0;
    $col = intval(explode("_", $marketLocation)[2]);
    $cost = $col * $baseCost;
    self::dump("row", $row);

    $nextState = 'action';
    if (Globals::getRemainingActions() > 0) {

      // check cost
      if ($cost > Players::get($playerId)->getRupees()) {
        throw new \feException("Not enough rupees");
      } else {
        // if enough rupees reduce player rupees
        Players::incRupees($playerId, -$cost);
      };

      // TODO (Frans): check if this is an event card or court card
      // move card to player hand location and reduce number of remaining actions
      $newLocation = 'hand_' . $playerId;
      if ($cardInfo['type'] == EVENT_CARD && $cardInfo['purchased']['title'] === ECE_DOMINANCE_CHECK) {
        $newLocation = 'discard';
        $nextState = 'dominanceCheck';
      } else if ($cardInfo['type'] == EVENT_CARD) {
        $newLocation = 'active_events';
      }
      Cards::move($cardId, $newLocation);
      Globals::incRemainingActions(-1);

      $updatedCards = array();

      for ($i = $col - 1; $i >= 0; $i--) {
        $location = 'market_' . $row . '_' . $i;
        $useRowAlt = false;
        $marketCard = Cards::getInLocation($location)->first();
        if ($marketCard == NULL) {
          $useRowAlt = true;
          $location = 'market_' . $rowAlt . '_' . $i;
          $marketCard = Cards::getInLocation($location)->first();
        }
        if ($marketCard !== NULL) {
          Cards::setUsed($marketCard["id"], 1); // set unavailable
          for ($j = 1; $j <= $baseCost; $j++) {
            $rupee = Tokens::getInLocation(RUPEE_SUPPLY)->first();
            Tokens::move($rupee['id'], [$location, 'rupees']);
            $updatedCards[] = array(
              'row' => intval($useRowAlt ? $rowAlt : $row),
              'column' => $i,
              'cardId' => $marketCard["id"],
              'rupeeId' => $rupee['id']
            );
          }
        }
      }

      // add rupees on card to player totals. Then put them in rupee_pool location
      $rupees = Tokens::getInLocation([$marketLocation, 'rupees']);
      Players::incRupees($playerId, count($rupees));
      Tokens::moveAllInLocation([$marketLocation, 'rupees'], RUPEE_SUPPLY);

      self::notifyAllPlayers("purchaseCard", clienttranslate('${player_name} purchases ${cardName} ${logTokenCard}'), array(
        'playerId' => $playerId,
        'player_name' => self::getActivePlayerName(),
        'card' => $card,
        'cardName' => $cardName,
        'logTokenCard' => $card['id'],
        'marketLocation' => $marketLocation,
        'newLocation' => $newLocation,
        'updatedCards' => $updatedCards,
      ));

      $this->updatePlayerCounts();
    }

    $this->gamestate->nextState($nextState);
  }

  function placeRupeesInMarketRow($row, $remainingRupees)
  {
    $updatedCards = [];
    // $remaining_rupees = $number_rupees;
    for ($i = 5; $i >= 0; $i--) {
      if ($remainingRupees <= 0) {
        break;
      }
      $location = 'market_' . $row . '_' . $i;
      $marketCard = Cards::getInLocation($location)->first();
      if ($marketCard !== NULL) {
        $rupee = Tokens::getInLocation(RUPEE_SUPPLY)->first();
        Tokens::move($rupee['id'], [$location, 'rupees']);
        Cards::setUsed($marketCard["id"], 1); // set unavailable
        $updatedCards[] = array(
          'location' => $location,
          'cardId' => $marketCard["id"],
          'rupeeId' => $rupee['id']
        );
        $remainingRupees--;
      }
    }
    return $updatedCards;
  }

  function isCardFavoredSuit($cardId)
  {
    $cardInfo = $this->cards[$cardId];
    return Globals::getFavoredSuit() == $cardInfo['suit'];
  }

  /**
   * Play card from hand to court
   */
  function selectGift($selectedGift, $cardId)
  {
    self::checkAction('selectGift');
    self::dump("selectedGift", $selectedGift);
    if (!$this->isValidCardAction($cardId, 'gift')) {
      return;
    }

    $playerId = self::getActivePlayerId();
    $rupees = Players::get()->getRupees();
    // Player should have enough rupees
    if ($rupees < $selectedGift) {
      throw new \feException("Not enough rupees to pay for the gift.");
    }
    $location = 'gift_' . $selectedGift . '_' . $playerId;
    $tokenInLocation = Tokens::getInLocation($location)->first();
    if ($tokenInLocation != null) {
      throw new \feException("Already a cylinder in selected location.");
    }

    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getInLocation($from)->first();

    // If null player needs to select cylinder from somewhere else
    if ($cylinder != null) {
      Tokens::move($cylinder['id'], $location);
      Cards::setUsed($cardId, 1); // unavailable false
      self::notifyAllPlayers("moveToken", "", array(
        'moves' => array(
          0 => array(
            'from' => $from,
            'to' => $location,
            'tokenId' => $cylinder['id'],
          )
        )
      ));
    }

    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardId)) {
      Globals::incRemainingActions(-1);
    }

    $numberRupeesPerRow = $selectedGift / 2;
    $updatedCards = [];
    $updatedCards = array_merge($updatedCards, $this->placeRupeesInMarketRow(0, $numberRupeesPerRow));
    $updatedCards = array_merge($updatedCards, $this->placeRupeesInMarketRow(1, $numberRupeesPerRow));
    Players::incRupees($playerId, -intval($selectedGift));

    $updatedCounts = array(
      'rupees' => $rupees - $selectedGift,
      'influence' => Players::get($playerId)->getInfluence(),
    );

    self::notifyAllPlayers("selectGift", clienttranslate('${player_name} purchases a gift for ${value} rupees'), array(
      'playerId' => $playerId,
      'player_name' => self::getActivePlayerName(),
      'value' => $selectedGift,
      'updatedCards' => $updatedCards,
      'rupeeCount' => $rupees - $selectedGift,
      'updatedCounts' => $updatedCounts,
    ));

    $this->gamestate->nextState('action');
  }


  /**
   * Validate card action
   */
  function isValidCardAction($cardId, $cardAction)
  {
    self::dump("cardAction: cardId", $cardId);
    self::dump("cardAction: cardAction", $cardAction);

    $tokenInfo = Cards::get($cardId);
    $cardInfo = $this->cards[$cardId];
    $playerId = self::getActivePlayerId();
    $location_info = explode("_", $tokenInfo['location']);

    // Checks to determine if it is a valid action
    // Card should be in players court
    if ($location_info[0] != 'court' || $location_info[1] != $playerId) {
      throw new \feException("Not a valid card action for player.");
    }
    // Card should not have been used yet
    if ($tokenInfo['used'] != 0) {
      throw new \feException("Card has already been used this turn.");
    }
    // Card should have the card action
    if (!isset($cardInfo['actions'][$cardAction])) {
      throw new \feException("Action does not exist on selected card.");
    }

    // $next_state = 'action';
    if (!(Globals::getRemainingActions() > 0 || Globals::getFavoredSuit() == $cardInfo['suit'])) {
      throw new \feException("No remaining actions and not a free action.");
      // $this->setGameStateValue("cardActionCardId", explode("_", $cardId)[1]);

      // switch ($cardAction) {
      //   case BATTLE:
      //     break;
      //   case BETRAY:
      //     break;
      //   case BUILD:
      //     break;
      //   case GIFT:
      //     $next_state = 'cardActionGift';
      //     break;
      //   case MOVE:
      //     break;
      //   case TAX:
      //     break;
      //   default:
      //     break;
      // };

      // self::notifyAllPlayers("cardAction", clienttranslate('${player_name} uses ${card_name} to ${cardAction}.'), array(
      //   'playerId' => $playerId,
      //   'player_name' => self::getActivePlayerName(),
      //   'cardAction' => $cardAction,
      //   'card_name' => $this->cards[$cardId]['name'],
      // ));
    };
    return true;
    // $this->gamestate->nextState($next_state);
  }

  /**
   * checks if coalition is different from current loyalty.
   * Handles any changes it it is.
   */
  function checkAndHandleLoyaltyChange($coalition)
  {

    $playerId = self::getActivePlayerId();
    $current_loyaly = Players::get()->getLoyalty();
    // check of loyalty needs to change. If it does not return
    if ($current_loyaly == $coalition) {
      return;
    }


    // TODO:
    // 1. Return gifts
    // 2. Discard prizes and patriots
    // 3. Update loyalty
    Players::get()->setLoyalty($coalition);

    // Notify
    $coalition_name = $this->loyalty[$coalition]['name'];
    self::notifyAllPlayers("chooseLoyalty", clienttranslate('${player_name} changes loyalty to ${coalition_name}'), array(
      'playerId' => $playerId,
      'player_name' => self::getActivePlayerName(),
      'coalition' => $coalition,
      'coalition_name' => $coalition_name
    ));
  }
}
