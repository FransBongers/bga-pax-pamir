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
    return array(
      'activePlayer' => Players::get()->jsonSerialize(null),
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

  function betray($cardId, $betrayedCardId, $acceptPrize = false)
  {
    self::checkAction('betray');

    $cardInfo = Cards::get($cardId);
    $this->isValidCardAction($cardInfo, BETRAY);

    $betrayedCardInfo = Cards::get($betrayedCardId);
    $betrayedPlayerId = intval(explode('_', $betrayedCardInfo['location'])[1]);

    Notifications::log('acceptPrize', [
      'acceptPrize' => $acceptPrize
    ]);

    // Card should be in a player's court
    if (!Utils::startsWith($betrayedCardInfo['location'], 'court')) {
      throw new \feException("Card is not in a players court");
    }
    $spiesOnCard = Tokens::getInLocation(['spies', $betrayedCardId])->toArray();
    // Notifications::log('spies',[$spiesOnCard[0]]);
    $player = Players::get();
    $playerId = $player->getId();
    // Card should have spy of active player
    if (!Utils::array_some($spiesOnCard, function ($cylinder) use ($playerId) {
      return intval(explode('_', $cylinder['id'])[1]) === $playerId;
    })) {
      throw new \feException("No spy on selected card");
    }

    if ($player->getRupees() < 2) {
      throw new \feException("Player does not have enough rupees to pay for action");
    }

    Cards::setUsed($cardId, 1);
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardId)) {
      Globals::incRemainingActions(-1);
    }
    $rupeesOnCards = $this->payActionCosts(2);
    Players::incRupees($playerId, -2);
    Notifications::betray($betrayedCardInfo, $player,$rupeesOnCards);

    $prizeTaker = $betrayedCardInfo['prize'] !== null && $acceptPrize ? $player : null;
    $this->executeDiscards([$betrayedCardInfo], Players::get($betrayedPlayerId), [
      'activePlayerId' => $playerId,
      'transition' => 'playerActions'
    ], $prizeTaker);
  }

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

  function pass()
  {
    //
    // pass remaining player actions
    //

    self::checkAction('pass');

    $playerId = self::getActivePlayerId();

    $remainingActions = Globals::getRemainingActions();
    $state = $this->gamestate->state();

    // TODO: (check if it is necessary to set remaining actions to 0)
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

  /**
   * Play card from hand to court
   */
  function purchaseGift($value, $cardId)
  {
    self::checkAction('purchaseGift');
    self::dump("gift value", $value);
    $cardInfo = Cards::get($cardId);
    if (!$this->isValidCardAction($cardInfo, GIFT)) {
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
      Cards::setUsed($cardId, 1); // unavailable
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

    $this->gamestate->nextState('playerActions');
  }

  function tax($cardId, $market, $players)
  {
    self::checkAction('tax');

    $cardInfo = Cards::get($cardId);
    $this->isValidCardAction($cardInfo, TAX);
    $selectedFromMarket = explode(' ', $market);
    $selectedPlayers = explode(' ', $players);



    $numberOfRupeesSelectedFromMarket = 0;
    $numberOfRupeesSelectedFromPlayers = 0;
    // Check if rupee is in market
    foreach ($selectedFromMarket as $index => $rupeeId) {
      if (strlen($rupeeId) == 0) {
        continue;
      };
      $rupee = Tokens::get($rupeeId);
      $location = $rupee['location'];

      if (!Utils::startsWith($location, 'market')) {
        throw new \feException("Selected rupee is not in the market");
      };
      $numberOfRupeesSelectedFromMarket += 1;
    }
    $activePlayer = Players::get();
    $activePlayerId = $activePlayer->getId();
    $rulers = Globals::getRulers();

    // Checks for selected players
    foreach ($selectedPlayers as $index => $selectedPlayer) {
      if (strlen($selectedPlayer) == 0) {
        continue;
      };
      $playerInput = explode('_', $selectedPlayer);
      $playerId = $playerInput[0];
      $selectedRupees = intval($playerInput[1]);
      $player = Players::get($playerId);

      // Player owns card of region ruled by active player
      $courtCards = $player->getCourtCards();

      $hasCardRuledByActivePlayer = Utils::array_some($courtCards, function ($courtCard) use ($activePlayerId, $rulers) {
        return $rulers[$courtCard['region']] === $activePlayerId;
      });
      if (!$hasCardRuledByActivePlayer) {
        throw new \feException("Seelcted player does not have a court card ruled by active player");
      }

      // Amount taxed from player is allowed
      $playerRupees = $player->getRupees();
      $taxShelter = $player->getSuitTotals()[ECONOMIC];
      $maxTaxable = $playerRupees - $taxShelter;
      if ($selectedRupees > $maxTaxable) {
        throw new \feException("More rupees selected for player than allowed");
      };
      $numberOfRupeesSelectedFromPlayers += $selectedRupees;
    }
    $totalSelected = $numberOfRupeesSelectedFromMarket + $numberOfRupeesSelectedFromPlayers;
    // Total number of rupees selected does not exceed card rank
    if ($totalSelected > $cardInfo['rank']) {
      throw new \feException("More rupees selected for player than allowed by card rank");
    }

    Cards::setUsed($cardId, 1);
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardId)) {
      Globals::incRemainingActions(-1);
    }
    Notifications::tax($cardId, $activePlayer);
    Players::incRupees($activePlayerId, $totalSelected);

    $rupeesInMarket = [];
    // Check if rupee is in market
    foreach ($selectedFromMarket as $index => $rupeeId) {
      if (strlen($rupeeId) == 0) {
        continue;
      };
      $rupee = Tokens::get($rupeeId);
      $location = explode('_', $rupee['location']);
      $rupeesInMarket[] = [
        'rupeeId' => $rupeeId,
        'row' => intval($location[1]),
        'column' => intval($location[2])
      ];
      Tokens::move($rupeeId, RUPEE_SUPPLY);
    };
    if ($numberOfRupeesSelectedFromMarket > 0) {
      Notifications::taxMarket($numberOfRupeesSelectedFromMarket, $activePlayer, $rupeesInMarket);
    }

    foreach ($selectedPlayers as $index => $selectedPlayer) {
      if (strlen($selectedPlayer) == 0) {
        continue;
      };
      $playerInput = explode('_', $selectedPlayer);
      $playerId = $playerInput[0];
      $numberOfRupees = intval($playerInput[1]);

      Players::incRupees($playerId, -$numberOfRupees);
      Notifications::taxPlayer($numberOfRupees, $activePlayer, $playerId);
    };

    $this->gamestate->nextState('playerActions');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function isCardFavoredSuit($cardId)
  {
    $cardInfo = $this->cards[$cardId];
    return Globals::getFavoredSuit() == $cardInfo['suit'];
  }

  /**
   * Performs default validation needed for every card action
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
    if (!(Globals::getRemainingActions() > 0 || Globals::getFavoredSuit() == $cardInfo['suit'])) {
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
