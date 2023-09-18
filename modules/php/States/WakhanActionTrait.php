<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;
use PaxPamir\Models\PaxPamirPlayer;

trait WakhanActionTrait
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

  // 3. Actions:
  // Check Wakhan ambition
  // Execute actions in order until both actions used or no valid choices available
  function dispatchWakhanActions($actionStack)
  {
    Globals::setWakhanActive(true);
    // if both actions taken or no valid choices left array_pop
    // execute at start so we can always put other actions other players needs to do in between
    // on the stack
    if (Globals::getRemainingActions() === 0 || Globals::getWakhanActionsSkipped() >= 3) {
      array_pop($actionStack);
      ActionStack::next($actionStack);
      return;
    }

    $wakhanAmbition = $this->wakhanCheckAmbition();

    // check Wakhan's Ambition
    if ($wakhanAmbition !== null) {
      Notifications::wakhansAmbition();
      // Purchase card
      $extraActions = $this->resolvePurchaseCard($wakhanAmbition['card'], WAKHAN_PLAYER_ID, $wakhanAmbition['cost']);
      $actionStack = array_merge($actionStack, $extraActions);
      $this->wakhanActionValid();
      $this->nextState('dispatchAction');
      return;
    }

    // Perform action
    $topOfWakhanDeck = WakhanCards::getTopOf(DECK);
    $topOfWakhanDiscard = WakhanCards::getTopOf(DISCARD);

    $currentAction = Globals::getWakhanCurrentAction();
    $action = $topOfWakhanDiscard['front']['actions'][$currentAction];

    $this->wakhanPerformAction($action, $topOfWakhanDeck, $topOfWakhanDiscard);

    Globals::setWakhanCurrentAction(($currentAction + 1) % 3);

    $this->nextState('dispatchAction');
  }

  // .##......##....###....##....##.##.....##....###....##....##
  // .##..##..##...##.##...##...##..##.....##...##.##...###...##
  // .##..##..##..##...##..##..##...##.....##..##...##..####..##
  // .##..##..##.##.....##.#####....#########.##.....##.##.##.##
  // .##..##..##.#########.##..##...##.....##.#########.##..####
  // .##..##..##.##.....##.##...##..##.....##.##.....##.##...###
  // ..###..###..##.....##.##....##.##.....##.##.....##.##....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  /**
   * Wakhan will purchase a dominance check if:
   * - she scores more pts than any other player for that single dominance check.
   * - purchasing the dominance check causes her to win the game.
   */
  function wakhanCheckAmbition()
  {
    // Get dominance check cards in market
    $marketCards = Cards::getOfTypeInLocation('card', 'market');
    $dominanceCheckCards = Utils::filter($marketCards, function ($card) {
      return $this->isDominanceCheck($card);
    });

    if (count($dominanceCheckCards) === 0) {
      return null;
    }
    $dominanceCheck = $dominanceCheckCards[0];

    $cost = $this->getCardCost(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $dominanceCheck);

    if ($cost > PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getRupees()) {
      return null;
    }
    $dominantCoalition = $this->getDominantCoalition();
    $checkSuccessful = $dominantCoalition !== null;

    // Determine scores
    $numberOfResolvedChecks = Globals::getDominanceChecksResolved() + 1;
    $scores = $checkSuccessful ? $this->getScoresSuccessFulCheck($dominantCoalition, $numberOfResolvedChecks, false) : $this->getScoresUnsuccessFulCheck($numberOfResolvedChecks, false);
    $scores = array_values($scores);
    $scores = array_map(function ($score) {
      return [
        'playerId' => $score['playerId'],
        'newScore' => $score['newScore'],
        'checkScore' => $score['newScore'] - $score['currentScore'],
      ];
    }, $scores);
    usort($scores, function ($a, $b) {
      return $b['checkScore'] - $a['checkScore'];
    });

    // Check if Wakhan purchases check because she scores most points
    $wakhanScoresMostPoints = (count($scores) === 1 && $scores[0]['playerId'] === WAKHAN_PLAYER_ID) ||
      (count($scores) > 1 && $scores[0]['playerId'] === WAKHAN_PLAYER_ID && $scores[0]['checkScore'] > $scores[1]['checkScore']);
    if ($wakhanScoresMostPoints) {
      return [
        'card' => $dominanceCheck,
        'cost' => $cost
      ];
    }

    // If she does not score most points check of she can win the game.
    if ($numberOfResolvedChecks < 4) {
      // does not end the game and she does not score most points so Wakhan does not win
      return false;
    }
    $playerIds = PaxPamirPlayers::getAll()->getIds();

    $totalScores = array_map(function ($playerId) use ($scores) {
      $score = Utils::array_find($scores, function ($dominanceCheckScore) use ($playerId) {
        return $dominanceCheckScore['playerId'] === $playerId;
      });
      $player = PaxPamirPlayers::get($playerId);
      return [
        'playerId' => $playerId,
        'score' => $score !== null ? $score['newScore'] : $player->getScore(),
        'tieBreaker' => $this->getPlayerTieBreaker($player)
      ];
    }, $playerIds);
    usort($totalScores, function ($a, $b) {
      $scoreDifference = $b['score'] - $a['score'];
      if ($scoreDifference === 0) {
        return $b['tieBreaker'] - $a['tieBreaker'];
      } else {
        return $scoreDifference;
      }
    });

    // Wakhan wins if she is in first place. No need to check difference of 4 points
    // as she will only get here if she did not score most points for the dominance check
    // and then she cannot lead by 4 pts.
    $wakhanWinsTheGame = $totalScores[0]['playerId'] === WAKHAN_PLAYER_ID;
    if ($wakhanWinsTheGame) {
      return [
        'card' => $dominanceCheck,
        'cost' => $cost
      ];
    }

    return null;
  }

  function wakhanPerformAction($action, $topOfWakhanDeck, $topOfWakhanDiscard)
  {
    switch ($action) {
      case RADICALIZE:
        $this->wakhanRadicalize($topOfWakhanDeck, $topOfWakhanDiscard);
        break;
      case TAX:
        $this->wakhanTax();
        break;
      default:
        Globals::incWakhanActionsSkipped(1);
    }
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanActionNotValid()
  {
    Globals::incWakhanActionsSkipped(1);
  }

  function wakhanActionValid()
  {
    Globals::setWakhanActionsSkipped(0);
  }

  function wakhanGetCourtCardToPerformAction($action)
  {
    $courtCards = PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getCourtCards();
    Notifications::log('courtCards', $courtCards);
    $cardsWithAction = Utils::filter($courtCards, function ($card) use ($action) {
      return isset($card['actions'][$action]);
    });

    if (count($cardsWithAction) === 0) {
      return null;
    }

    /**
     * Valid if:
     * - card has not been used yet
     * - wakhan can pay for the card action and possible bribe
     */
    $validCards = Utils::filter($cardsWithAction, function ($card) use ($action) {
      $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
      $wakhanRupees = $wakhanPlayer->getRupees();

      // Not used
      $cardHasNotBeenUsed = $card['used'] === 0;
      // Can pay for the card action and possible bribe
      $bribe = $this->determineBribe($card, $wakhanPlayer, null, $action);
      $bribeAmount = $bribe === null ? 0 : $bribe['amount'];

      $minimumActionCost = $this->getMinimumActionCost($action, $wakhanPlayer);
      $wakhanCanPayForAction = $bribeAmount + $minimumActionCost <= $wakhanRupees;

      return $cardHasNotBeenUsed && $wakhanCanPayForAction;
    });

    if (count($validCards) === 0) {
      return null;
    } else if (count($validCards) === 1) {
      return $validCards[0];
    } else {
      return $this->wakhanSelectCard($validCards);
    }
  }

  function wakhanGetRedArrowValue()
  {
    $index = WakhanCards::getTopOf(DISCARD)['front']['rowSideArrow'];
    return WakhanCards::getTopOf(DECK)['back']['rowSide'][$index];
  }
}
