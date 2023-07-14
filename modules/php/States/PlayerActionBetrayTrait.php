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

trait PlayerActionBetrayTrait
{
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

  function betray($cardId, $betrayedCardId, $acceptPrize = false, $offeredBribeAmount = null)
  {
    self::checkAction('betray');

    $cardInfo = Cards::get($cardId);
    $this->isValidCardAction($cardInfo, BETRAY);

    $betrayedCardInfo = Cards::get($betrayedCardId);
    $betrayedPlayerId = intval(explode('_', $betrayedCardInfo['location'])[1]);

    Notifications::log('acceptPrize', [
      'acceptPrize' => $acceptPrize
    ]);

    $player = Players::get();
    $resolved = $this->resolveBribe($cardInfo, $player,BETRAY, $offeredBribeAmount);
    if (!$resolved) {
      $this->nextState('playerActions');
      return;
    }
    // Get player again, because bribe has been paid
    if ($offeredBribeAmount !== null && intval($offeredBribeAmount) > 0) {
      $player = Players::get();
    };

    // Card should be in a player's court
    if (!Utils::startsWith($betrayedCardInfo['location'], 'court')) {
      throw new \feException("Card is not in a players court");
    }

    if (Players::get($betrayedPlayerId)->hasSpecialAbility(SA_BODYGUARDS) && $betrayedCardInfo['suit'] === POLITICAL) {
      throw new \feException("Player has Bodyguard special ability");
    }

    if ($acceptPrize && $betrayedCardInfo['prize'] === null) {
      throw new \feException("Card does not have a prize");
    }
    $spiesOnCard = Tokens::getInLocation(['spies', $betrayedCardId])->toArray();
    // Notifications::log('spies',[$spiesOnCard[0]]);
    
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
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }
    $rupeesOnCards = $this->payActionCosts(2);
    Players::incRupees($playerId, -2);
    Notifications::betray($betrayedCardInfo, $player, $rupeesOnCards);

    $prizeTaker = $betrayedCardInfo['prize'] !== null && $acceptPrize ? $player : null;
    $this->executeDiscards([$betrayedCardInfo], Players::get($betrayedPlayerId), [
      'activePlayerId' => $playerId,
      'transition' => 'playerActions'
    ], $prizeTaker);
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...



}
