<?php

namespace PaxPamir\States;

use Locale;
use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
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
    $bribe = Globals::getNegotiatedBribe();
    return [
      // TODO: remove activePlayer here
      'activePlayer' => Players::getActive()->jsonSerialize(null),
      'remainingActions' => Globals::getRemainingActions(),
      'usedCards' => Cards::getUnavailableCards(),
      'bribe' => isset($bribe['action']) ? $bribe : null,
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
    self::notifyAllPlayers("changeLoyalty", clienttranslate('${player_name} sets loyalty to ${coalitionName} ${logTokenCoalition}'), array(
      'playerId' => $playerId,
      'player_name' => Game::get()->getActivePlayerName(),
      'coalition' => $coalition,
      'coalitionName' => $coalitionName,
      'logTokenCoalition' => Utils::logTokenCoalition($coalition),
    ));

    $this->gamestate->nextState('next');
  }

  /**
   * Used to either:
   * 1. End player's turn
   * 2. Skip start of turn abilities
   */
  function pass()
  {
    self::checkAction('pass');
    $playerId = self::getActivePlayerId();

    $remainingActions = Globals::getRemainingActions();
    $state = $this->gamestate->state();

    // TODO: (check if it is necessary to set remaining actions to 0 here, also done in turn trait?)
    if (($remainingActions > 0) and ($state['name'] == 'playerActions')) {
      Globals::setRemainingActions(0);
    }
    // Notify
    Notifications::pass();

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

  function skipSpecialAbility()
  {
    self::checkAction('skipSpecialAbility');

    // Right now only used for infrastructure. Might need to check for state 
    // when used for multiple abilities
    // TODO: check use for start of turn abilities instead of pass function
    $this->nextState('playerActions');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function getMinimumActionCost($action, $player)
  {
    if (in_array($action, [BATTLE, MOVE, TAX, PLAY_CARD])) {
      return 0;
    } else if (in_array($action, [BETRAY, BUILD])) {
      return 2;
    } else {
      // only option remaining is purchase gift, determines on lowest empty spot
      return $player->getLowestAvailableGift();
    };
  }

  function isCardFavoredSuit($cardInfo)
  {
    $isFavoredSuit = Globals::getFavoredSuit() == $cardInfo['suit'];
    if ($isFavoredSuit) {
      return true;
    };
    if ($cardInfo['specialAbility'] === SA_SAVVY_OPERATOR || $cardInfo['specialAbility'] === SA_IRREGULARS) {
      return true;
    };
    $player = Players::get();
    $isNewTacticsActive = Events::isNewTacticsActive($player);
    if ($cardInfo['suit'] === MILITARY && $isNewTacticsActive) {
      return true;
    };
    return false;
  }

  /**
   * Performs default validation needed for every card action:
   * - is the card used for the card action in the players court
   * - the card has not been used this turn yet
   * - the card should have the card action
   * - player should haver acionts remaining or actions is a bonus action
   */
  function isValidCardAction($cardInfo, $cardAction)
  {
    $playerId = self::getActivePlayerId();
    $location_info = explode("_", $cardInfo['location']);

    // Checks to determine if it is a valid action
    // Card should be in players court
    if ($location_info[0] != 'court' || $location_info[1] != $playerId) {
      throw new \feException("Not a valid card action for player");
    }
    // Card should not have been used yet
    if ($cardInfo['used'] != 0) {
      throw new \feException("Card has already been used this turn");
    }
    // Card should have the card action
    if (!isset($cardInfo['actions'][$cardAction])) {
      throw new \feException("Action does not exist on selected card");
    }

    // Player should have remaining actions or actions needs to be a bonus action
    if (!(Globals::getRemainingActions() > 0 || $this->isCardFavoredSuit($cardInfo))) {
      throw new \feException("No remaining actions and not a free action");
    };
    return true;
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
}
