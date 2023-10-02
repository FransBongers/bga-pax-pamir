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
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Tokens;

/**
 * General flow for bribes:
 * ask in frontend checks for bribe and asks player 
 */
trait BribeTrait
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
    $bribeState = Globals::getNegotiatedBribe();
    return $bribeState;
  }

  // ..######......###....##.....##.########.....######..########....###....########.########
  // .##....##....##.##...###...###.##..........##....##....##......##.##......##....##......
  // .##.........##...##..####.####.##..........##..........##.....##...##.....##....##......
  // .##...####.##.....##.##.###.##.######.......######.....##....##.....##....##....######..
  // .##....##..#########.##.....##.##................##....##....#########....##....##......
  // .##....##..##.....##.##.....##.##..........##....##....##....##.....##....##....##......
  // ..######...##.....##.##.....##.########.....######.....##....##.....##....##....########

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

  function startBribeNegotiation($cardId, $amount, $action)
  {
    self::checkAction('startBribeNegotiation');
    $amount = intval($amount);
    $allowedActions = ['playCard', BATTLE, BETRAY, BUILD, GIFT, MOVE, TAX];
    if (!in_array($action, $allowedActions)) {
      throw new \feException("Not a valid action to start bribe negotiation");
    }
    /**
     * Checks:
     * player has card
     * player has amount
     * card has action
     */
    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();
    $card = Cards::get($cardId);
    if ($action === 'playCard' && $card['location'] !== Locations::hand($playerId)) {
      throw new \feException("Card is not player's hand");
    }
    if ($action !== 'playCard' && $card['location'] !== Locations::court($playerId)) {
      throw new \feException("Card is not player's court");
    }
    if ($action !== 'playCard' && !array_key_exists($action, $card['actions'])) {
      throw new \feException("Action does not exist on card");
    }

    $bribe = $this->determineBribe($card, $player, $amount, $action);

    if ($bribe === null) {
      throw new \feException("No bribe required");
    }

    $minimumActionCost = $this->getMinimumActionCost($action,$player);
    if ($minimumActionCost === null) {
      throw new \feException("Not able to start negotiation for gift");
    }

    if ($amount > $player->getRupees() - $minimumActionCost) {
      throw new \feException("Not allowed to offer more rupees than available to player");
    }
    if ($amount > $bribe['amount']) {
      throw new \feException("Not allowed to offer more rupees than required for bribe");
    }

    Globals::setNegotiatedBribe([
      'briber' => [
        'playerId' => $playerId,
        'currentAmount' => $amount,
      ],
      'bribee' => [
        'playerId' => $bribe['bribeeId'],
      ],
      'action' => $action,
      'cardId' => $cardId,
      // 'ifAccepted' => [
      //   'action' => $action,
      //   'cardId' => $cardId,
      // ],
      'maxAmount' => $bribe['amount'],

      // 'declined' => [],
      // 'possible' => array_values(array_diff(range(0, $maxAmount), [$bribe])),
      // 'next' => $ruler,
      // 'status' => BRIBE_UNRESOLVED,
    ]);

    Notifications::startBribeNegotiation($player, $card, $amount, $action);
    Log::checkpoint();
    $this->nextState('negotiateBribe', $bribe['bribeeId']);
  }

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
    $bribeState = Globals::getNegotiatedBribe();
    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();
    $bribeeId = $bribeState['bribee']['playerId'];
    $briberId = $bribeState['briber']['playerId'];

    $isBribee = $bribeeId === $playerId;
    if ($isBribee) {
      $bribeState['bribee']['currentAmount'] = $amount;
    } else {
      $bribeState['briber']['currentAmount'] = $amount;
    }
    $briberCurrentAmount = $bribeState['briber']['currentAmount'];
    $bribeeCurrentAmount = $bribeState['bribee']['currentAmount'];

    if (!$isBribee) {
      $minimumActionCost = $this->getMinimumActionCost($bribeState['action'],$player);
      $minimumActionCost = $minimumActionCost === null ? 0 : $minimumActionCost;
      $maxPossibleOffer = $player->getRupees() - $minimumActionCost;
      if ($briberCurrentAmount > $maxPossibleOffer) {
        throw new \feException("Not allowed to offer more rupees than available");
      }
      
    }

    // Notifications::log('currentAmount',$bribeState['bribee']['currentAmount']);
    $isBribeAccepted = $bribeeCurrentAmount === $briberCurrentAmount;

    Globals::setNegotiatedBribe($bribeState);
    if ($isBribeAccepted) {
      Notifications::acceptBribe($player, $briberCurrentAmount);
      if (PaxPamirPlayers::get()->getId() !== $briberId) {
        Log::checkpoint();  
      }
      $this->nextState('playerActions', $briberId);
    } else {
      Notifications::negotiateBribe($player, $amount, $isBribee);
      $nextPlayerId = $isBribee ? $briberId : $bribeeId;
      $this->giveExtraTime($nextPlayerId);
      Log::checkpoint();
      $this->nextState('negotiateBribe', $nextPlayerId);
    }
  }

  function cancelBribe()
  {
    self::checkAction('cancelBribe');
    Globals::setNegotiatedBribe([]);
    Notifications::cancelBribe();
    $this->nextState('playerActions');
  }

  function declineBribe()
  {
    self::checkAction('declineBribe');

    $bribeState = Globals::getNegotiatedBribe();
    $player = PaxPamirPlayers::get();
    $playerId = $player->getId();
    $isBribee = $bribeState['bribee']['playerId'] === $playerId;
    $declinedAmount = $isBribee ? $bribeState['briber']['currentAmount'] : $bribeState['bribee']['currentAmount'];

    Notifications::declineBribe($declinedAmount);
    Globals::setNegotiatedBribe([]);
    Log::clearAll();
    $this->nextState('playerActions', $bribeState['briber']['playerId']);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  /**
   * Resolves bribe if there is any.
   */
  function resolveBribe($card, $player,$action, $offeredBribeAmount)
  {
    $offeredBribeAmount = $offeredBribeAmount !== null ? intval($offeredBribeAmount) : null;
    $playerId = $player->getId();
    $determineBribeResult = $this->determineBribe($card, $player, $offeredBribeAmount, $action);
    Notifications::log('determineBribe', $determineBribeResult);

    // Bribe is required and player decided to pay it 
    if ($determineBribeResult !== null && $offeredBribeAmount === $determineBribeResult['amount']) {
      $this->payBribe($playerId, $determineBribeResult['bribeeId'], $offeredBribeAmount);
    }

    $cardId = $card['id'];
    // Bribe is required and players negotiated
    if ($determineBribeResult !== null && $offeredBribeAmount < $determineBribeResult['amount']) {
      $verifyResult = $this->verifyBribe($cardId,  $action, $offeredBribeAmount);

      // Note: theoretically a false verifyResult should not be possible
      // but just in case act like it was declined bribe and turn player back to playerActions
      if (!$verifyResult) {
        Notifications::log('verifyResult false - Check why this is happening', $verifyResult);
        Globals::setNegotiatedBribe([]);
        return false;
      }

      $this->payBribe($playerId, $determineBribeResult['bribeeId'], $offeredBribeAmount);
    }
    Globals::setNegotiatedBribe([]);
    return true;
  }



  function payBribe($briberId, $bribeeId, $amount)
  {
    if ($amount > 0) {
      PaxPamirPlayers::incRupees($bribeeId, $amount);
      PaxPamirPlayers::incRupees($briberId, -$amount);
      Notifications::payBribe($briberId, $bribeeId, $amount);
    }
  }

  /**
   * Wrapper for checkHostageAction / checkBribePlayCard, which handles
   * special abilities and event effects
   */
  function determineBribe($card, $player, $offeredBribeAmount, $action)
  {
    if (Events::isDisregardForCustomsActive()) {
      return null;
    };
    if (Events::isCourtlyMannersActive($player) && ($offeredBribeAmount === 0 || $offeredBribeAmount === null)) {
      return null;
    };
    if ($action === 'playCard' && $player->hasSpecialAbility(SA_CHARISMATIC_COURTIERS)) {
      return null;
    };
    if ($action !== 'playCard' && $player->hasSpecialAbility(SA_CIVIL_SERVICE_REFORMS)) {
      return null;
    }

    $playerId = $player->getId();
    if ($action === 'playCard') {
      return $this->determineBribePlayCard($card, $playerId);
    } else {
      return $this->determineHostageAction($card, $playerId);
    }
  }

  /**
   * Determines if player needs to pay bribe while playing a card to court.
   */
  function determineBribePlayCard($card, $playerId)
  {
    $rulers = Globals::getRulers();
    $region = $card['region'];
    if ($rulers[$region] !== null && $rulers[$region] !== $playerId) {
      $tribesInRegion = Tokens::getInLocation(['tribes', $region])->toArray();
      $rulerTribes = array_filter($tribesInRegion, function ($cylinder) use ($rulers, $region) {
        return explode('_', $cylinder['id'])[1] == $rulers[$region];
      });
      return [
        'bribeeId' => $rulers[$region],
        'amount' => count($rulerTribes)
      ];
    } else {
      return null;
    }
  }

  /**
   * Determines if card is held hostage.
   * Returns object with bribeeId and amount if it is.
   * Otherwise returns null
   */
  function determineHostageAction($card, $currentPlayerId)
  {
    $cardId = $card['id'];
    $spies = Tokens::getInLocation(Locations::spies($cardId))->toArray();
    if (count($spies) === 0) {
      return null;
    }

    // Calculate number of spies per player
    $totals = array();
    foreach ($spies as $index => $cylinder) {
      $ownerId = explode('_', $cylinder['id'])[1];
      if (isset($totals[$ownerId])) {
        $totals[$ownerId] += 1;
      } else {
        $totals[$ownerId] = 1;
      }
    }

    // Map to array and sort
    $sortedTotals = [];
    foreach ($totals as $playerId => $numberOfSpies) {
      $sortedTotals[] = [
        'playerId' => intval($playerId),
        'numberOfSpies' => $numberOfSpies
      ];
    }
    usort($sortedTotals, function ($a, $b) {
      return $b['numberOfSpies'] - $a['numberOfSpies'];
    });


    $numberOfPlayersWithSpies = count($sortedTotals);
    // Check if there is a player holding the card hostage
    if ($numberOfPlayersWithSpies === 1 && $sortedTotals[0]['playerId'] !== $currentPlayerId) {
      return [
        'bribeeId' => $sortedTotals[0]['playerId'],
        'amount' => $sortedTotals[0]['numberOfSpies'],
      ];
    } else if (
      $numberOfPlayersWithSpies > 1 &&
      $sortedTotals[0]['numberOfSpies'] > $sortedTotals[1]['numberOfSpies'] &&
      $sortedTotals[0]['playerId'] !== $currentPlayerId
    ) {
      return [
        'bribeeId' => $sortedTotals[0]['playerId'],
        'amount' => $sortedTotals[0]['numberOfSpies'],
      ];
    } else {
      return null;
    }
  }

  // Verify bribe with current action
  function verifyBribe($cardId, $action, $bribeAmount)
  {
    $bribe = Globals::getNegotiatedBribe();
    $matchingAction = isset($bribe['action']) ? $bribe['action'] === $action : false;
    $matchingCardId = isset($bribe['cardId']) ? $bribe['cardId'] === $cardId : false;
    $matchingAmount = isset($bribe['briber']['currentAmount']) &&
      isset($bribe['bribee']['currentAmount']) &&
      $bribe['briber']['currentAmount'] === $bribe['bribee']['currentAmount'] &&
      $bribe['briber']['currentAmount'] === $bribeAmount;
    return $matchingAction && $matchingCardId && $matchingAmount;
  }
}
