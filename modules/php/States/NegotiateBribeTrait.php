<?php

namespace PaxPamir\States;

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

trait NegotiateBribeTrait
{
  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argNegotiateBribe()
  {
    $bribeState = Globals::getBribe();
    return $bribeState;
  }

  // ..######......###....##.....##.########.....######..########....###....########.########
  // .##....##....##.##...###...###.##..........##....##....##......##.##......##....##......
  // .##.........##...##..####.####.##..........##..........##.....##...##.....##....##......
  // .##...####.##.....##.##.###.##.######.......######.....##....##.....##....##....######..
  // .##....##..#########.##.....##.##................##....##....#########....##....##......
  // .##....##..##.....##.##.....##.##..........##....##....##....##.....##....##....##......
  // ..######...##.....##.##.....##.########.....######.....##....##.....##....##....########

  function stResolveAcceptedBribe()
  {
    /**
     * 1. Pay Bribe
     * 2. Check action before bribe
     * 3. Execute actions
     * 4. Transition to player actions
     */
    $bribeState = Globals::getBribe();
    $amount = $bribeState['briber']['currentAmount'];
    $briberId = $bribeState['briber']['playerId'];
    $bribeeId = $bribeState['bribee']['playerId'];

    // Pay for bribe
    Players::incRupees($bribeeId, $amount);
    Players::incRupees($briberId, -$amount);
    Notifications::payBribe($briberId, $bribeeId, $amount);

    // Execute original action
    $nextStep = $bribeState['ifAccepted'];
    $nextAction = $nextStep['action'];
    $playerId = $bribeState['briber']['playerId'];
    if($nextAction === 'playCard') {
      $cardId = $nextStep['cardId'];
      $side = $nextStep['side'];
      Globals::setBribeClearLogs(true);
      $this->resolvePlayCard($playerId, $cardId, $side);
    } else {
      $this->nextState('playerActions',$playerId);
    }

    
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

  function negotiateBribe($amount)
  {
    /**
     * 1. Get bribe state
     * 2. Check if current player is briber or bribee
     * 3. Update respective current amount
     * 4. Check if current amounts are equal => transition to resolve Bribe
     * 5. Check if there are valid options left => transition to next player, or done
     */
    self::checkAction('negotiateBribe');
    $amount = intval($amount);
    $bribeState = Globals::getBribe();
    Notifications::log('amount',$amount);
    Notifications::log('bribeState',$bribeState);
    $player = Players::get();
    $playerId = $player->getId();
    $bribeeId = $bribeState['bribee']['playerId'];
    $briberId = $bribeState['briber']['playerId'];

    $isBribee = $bribeeId === $playerId;
    if($isBribee) {
      $bribeState['bribee']['currentAmount'] = $amount;
    } else {
      $bribeState['briber']['currentAmount'] = $amount;
    }
    $briberCurrentAmount = $bribeState['briber']['currentAmount'];
    $bribeeCurrentAmount = $bribeState['bribee']['currentAmount'];

    if (!$isBribee && $briberCurrentAmount > $player->getRupees()) {
      throw new \feException("Not allowed to offer more rupees than available to player");
    }

    Notifications::log('isBribee',$isBribee);
    // Notifications::log('currentAmount',$bribeState['bribee']['currentAmount']);
    $isBribeAccepted = $bribeeCurrentAmount === $briberCurrentAmount;
    Notifications::log('isBribeAccepted',$isBribeAccepted);

    Globals::setBribe($bribeState);
    if($isBribeAccepted) {
      Notifications::acceptBribe($player, $briberCurrentAmount);
      $this->nextState('resolveAcceptedBribe',$briberId);
    } else {
      Notifications::negotiateBribe($player, $amount, $isBribee);
      $nextPlayerId = $isBribee ? $briberId : $bribeeId;
      $this->giveExtraTime($nextPlayerId);
      Log::clearAll();
      $this->nextState('negotiateBribe',$nextPlayerId);
    }
  }

  function declineBribe()
  {
    self::checkAction('declineBribe');

    $bribeState = Globals::getBribe();
    $player = Players::get();
    $playerId = $player->getId();
    $isBribee = $bribeState['bribee']['playerId'] === $playerId;
    $bribeState['status'] = BRIBE_DECLINED;
    $bribeState['next'] = $bribeState['briber'];
    $declinedAmount = $isBribee ? $bribeState['briber']['currentAmount'] : $bribeState['bribee']['currentAmount'];

    Notifications::declineBribe($declinedAmount);
    Log::clearAll();
    $this->nextState('playerActions',$bribeState['briber']['playerId']);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

}
