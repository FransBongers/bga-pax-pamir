<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Wakhan;
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
      Wakhan::actionValid();
      Notifications::wakhansAmbition();
      // Purchase card
      $extraActions = $this->resolvePurchaseCard($wakhanAmbition['card'], WAKHAN_PLAYER_ID, $wakhanAmbition['cost']);
      $actionStack = array_merge($actionStack, $extraActions);
      ActionStack::next($actionStack);
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

  function dispatchWakhanBonusAction($actionStack)
  {
    $action = array_pop($actionStack);
    $cardId = $action['data']['cardId'];
    $card = Cards::get($cardId);
    ActionStack::set($actionStack);

    foreach ($card['actions'] as $action => $actionInfo) {
      Notifications::log('action', $action);
      if (!$this->wakhanCanPayForCardAction($card, $action)) {
        continue;
      }
      $result = false;
      switch ($action) {
        case BATTLE:
          $this->wakhanBattle($card);
          break;
        case BETRAY:
          $this->wakhanBetray($card);
          break;
        case BUILD:
          $this->wakhanBuild($card);
          break;
        case GIFT:
          $this->wakhanGift($card);
          break;
        case MOVE:
          $this->wakhanMove($card);
          break;
        case TAX:
          $this->wakhanTax($card);
          break;
      }
      if ($result) {
        $this->nextState('dispatchAction');
        return;
      }
    };


    $this->nextState('dispatchAction');
  }

  function dispatchWakhanSetupBonusActions($actionStack)
  {
    array_pop($actionStack);

    $courtCards = PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getCourtCards();
    $availableForBonusActions = Utils::filter($courtCards, function ($card) {
      return $card['used'] === 0 && $this->isCardFavoredSuit($card);
    });
    Notifications::log('available', $availableForBonusActions);

    foreach (array_reverse($availableForBonusActions) as $index => $card) {
      $actionStack[] = ActionStack::createAction(DISPATCH_WAKHAN_BONUS_ACTION, WAKHAN_PLAYER_ID, [
        'cardId' => $card['id'],
      ]);
    }
    ActionStack::next($actionStack);
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

    $cost = Utils::getCardCost(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $dominanceCheck);

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
      return null;
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
      case BATTLE:
        $this->wakhanBattle();
        break;
      case BETRAY:
        $this->wakhanBetray();
        break;
      case BUILD:
        $this->wakhanBuild();
        break;
      case GIFT:
        $this->wakhanGift();
        break;
      case MOVE:
        $this->wakhanMove();
        break;
      case RADICALIZE:
        $this->wakhanRadicalize($topOfWakhanDeck, $topOfWakhanDiscard);
        break;
      case TAX:
        $this->wakhanTax();
        break;
      case RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY:
        $this->wakhanIfMilitaryFavoredRadicalizeHighestRankedMilitary();
        break;
      case RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC:
        $this->wakhanIfPoliticalFavoredRadicalizeHighestRankedEconomic();
        break;
      case RADICALIZE_HIGHEST_RANKED_POLITICAL:
        $this->wakhanRadicalizeHighestRankedOfSuit(POLITICAL);
        break;
      case RADICALIZE_HIGHEST_RANKED_INTELLIGENCE:
        $this->wakhanRadicalizeHighestRankedOfSuit(INTELLIGENCE);
        break;
      case RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES:
        $this->wakhanIfFewerThan2RupeesRadicalizeMostNetRupees();
        break;
      case RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION:
        $this->wakhanRadicalizeCardThatGivesControlOfARegion();
        break;
      case RADICALIZE_INTELLIGENCE:
        $this->wakhanRadicalizeCardOfSuit(INTELLIGENCE);
        break;
      case RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS:
        $this->wakhanRadicalizeCardThatWouldPlaceMostBlocks();
        break;
      case RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS:
        $this->wakhanRadicalizeIfNoDominantCoalitionCardThatWouldPlaceMostCylinders();
        break;
      case RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION:  
        $this->wakhanRadicalizeIfNoCardWithMoveCardWithMove();
        break;
      case RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT:
        $this->wakhanRadicalizeIfDominantCoalitionMatchingPatriot();
        break;
      case RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL:
        $this->wakhanRadicalizeIfCourtSizeAtLimitHighestRankedPolitical();
        break;
      case RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE:
        $this->wakhanRadicalizeIfFewerSpiesThanAnotherPlayerHighestRankedIntelligence();
        break;
      case BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY:
        $this->battleHighestPriorityCourtCardWithMostSpiesWhereWakhanHasSpy();
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

  function wakhanPayHostageBribeIfNeeded($card, $action)
  {
    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $bribe = $this->determineBribe($card, $wakhanPlayer, null, $action);
    $bribeAmount = $bribe === null ? 0 : $bribe['amount'];
    if ($bribeAmount > 0) {
      $this->payBribe(WAKHAN_PLAYER_ID, $bribe['bribeeId'], $bribe['amount']);
    }
  }

  function wakhanCanPayForCardAction($card, $action)
  {
    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    $wakhanRupees = $wakhanPlayer->getRupees();

    // Can pay for the card action and possible bribe
    $bribe = $this->determineBribe($card, $wakhanPlayer, null, $action);
    $bribeAmount = $bribe === null ? 0 : $bribe['amount'];

    $minimumActionCost = $this->getMinimumActionCost($action, $wakhanPlayer);
    if ($minimumActionCost === null) {
      return false;
    }
    $wakhanCanPayForAction = $bribeAmount + $minimumActionCost <= $wakhanRupees;
    return $wakhanCanPayForAction;
  }

  function wakhanGetCourtCardToPerformAction($action)
  {
    $courtCards = PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getCourtCards();

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
      // Not used
      $cardHasNotBeenUsed = $card['used'] === 0;
      $wakhanCanPayForAction = $this->wakhanCanPayForCardAction($card, $action);

      return $cardHasNotBeenUsed && $wakhanCanPayForAction;
    });

    return Wakhan::selectCard($validCards);
  }

  function wakhanGetRedArrowValue()
  {
    $index = WakhanCards::getTopOf(DISCARD)['front']['rowSideArrow'];
    return WakhanCards::getTopOf(DECK)['back']['rowSide'][$index];
  }
}
