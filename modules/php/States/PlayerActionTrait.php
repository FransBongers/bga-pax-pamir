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
    // $playerId = self::getActivePlayerId();
    // $currentPlayerId = self::getCurrentPlayerId();
    // $player = Players::get($playerId);
    // $uiDate = Players::getUiData();
    return array(
      // 'remainingActions' => Globals::getRemainingActions(),
      // 'unavailableCards' => Cards::getUnavailableCards(),
      // 'hand' => Cards::getInLocation(['hand', $currentPlayerId]),
      // 'court' => Cards::getInLocationOrdered(['court', $playerId])->toArray(),
      // 'suits' => $player->getSuitTotals(),
      // 'rulers' => Map::getRulers(),
      // 'favoredSuit' => Globals::getFavoredSuit(),
      // 'rupees' => $player->getRupees(),
      'activePlayer' => Players::get()->jsonSerialize(null),
      // 'favoredSuit' => Globals::getFavoredSuit(),
      'remainingActions' => Globals::getRemainingActions(),
      'usedCards' => Cards::getUnavailableCards(),
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
      self::notifyAllPlayers("pass", clienttranslate('${player_name} ends his turn.'), array(
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

  // Determines on which cards to place rupees and returns array
  function payActionCosts($cost)
  {
    // Always place rupees on rightmost market cards of both rows. If vacant skip the slot.
    // If market does not contain enough cards excess rupees are taken out of the game.

    // Cost is always an even amount so we can divide by 2.
    $numberOfRupeesPerRow = $cost / 2;
    $rupeesOnCards = [];
    for ($row = 0; $row <= 1; $row++) {
      $remainingRupees = $numberOfRupeesPerRow;
      for ($column = 5; $column >= 0; $column--) {
        if ($remainingRupees <= 0) {
          break;
        }
        $location = 'market_' . $row . '_' . $column;
        $marketCard = Cards::getInLocation($location)->first();
        if ($marketCard !== NULL) {
          $rupee = Tokens::getInLocation(RUPEE_SUPPLY)->first();
          Tokens::move($rupee['id'], [$location, 'rupees']);
          Cards::setUsed($marketCard["id"], 1); // set unavailable
          $rupeesOnCards[] = array(
            'row' => $row,
            'column' => $column,
            'cardId' => $marketCard["id"],
            'rupeeId' => $rupee['id']
          );
          $remainingRupees--;
        }
      }
    }
    return $rupeesOnCards;
  }


  function isCardFavoredSuit($cardId)
  {
    $cardInfo = $this->cards[$cardId];
    return Globals::getFavoredSuit() == $cardInfo['suit'];
  }

  /**
   * Play card from hand to court
   */
  function purchaseGift($value, $cardId)
  {
    self::checkAction('purchaseGift');
    self::dump("gift value", $value);
    if (!$this->isValidCardAction($cardId, 'gift')) {
      return;
    }

    $player = Players::get();
    $playerId = $player->getId();
    $rupees = $player->getRupees();
    // Player should have enough rupees
    if ($rupees < $value) {
      throw new \feException("Not enough rupees to pay for the gift.");
    }
    $location = 'gift_' . $value . '_' . $playerId;
    $tokenInLocation = Tokens::getInLocation($location)->first();
    if ($tokenInLocation != null) {
      throw new \feException("Already a cylinder in selected location.");
    }

    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);

    // If null player needs to select cylinder from somewhere else
    if ($cylinder != null) {
      Tokens::move($cylinder['id'], $location);
      Cards::setUsed($cardId, 1); // unavailable false
    }

    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardId)) {
      Globals::incRemainingActions(-1);
    }


    $rupeesOnCards = $this->payActionCosts($value);
    Players::incRupees($playerId, -intval($value));

    Notifications::purchaseGift(
      $player,
      $value,
      [
        'from' => $from,
        'to' => $location,
        'tokenId' => $cylinder['id'],
      ],
      $rupeesOnCards
    );

    // self::notifyAllPlayers("purchaseGift", clienttranslate('${player_name} purchases a gift for ${value} rupees'), array(
    //   'playerId' => $playerId,
    //   'player_name' => self::getActivePlayerName(),
    //   'value' => $value,
    //   'rupeesOnCards' => $rupeesOnCards,
    //   'rupeeChange' => -$value,
    //   'influenceChange' => 1,
    //   'move' =>[
    //     'from' => $from,
    //     'to' => $location,
    //     'tokenId' => $cylinder['id'],
    //   ]
    // ));

    $this->gamestate->nextState('playerActions');
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
}
