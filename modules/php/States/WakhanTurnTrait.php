<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Wakhan;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;

trait WakhanTurnTrait
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

  /**
   * Function is used when player has enabled wakhan pause option. So player
   * has to click next for Wakhan to continue allowing them to better process what
   * Wakhan is doing.
   * Pops the pause action from the stack
   */
  function wakhanNext()
  {
    // $actionStack = ActionStack::get();

    // array_pop($actionStack);
    // Notifications::log('actionStack',$actionStack);
    // ActionStack::next($actionStack);
    Globals::setWakhanActive(true);
    $this->nextState('dispatchAction');
  }

  // ..######..########....###....########.########
  // .##....##....##......##.##......##....##......
  // .##..........##.....##...##.....##....##......
  // ..######.....##....##.....##....##....######..
  // .......##....##....#########....##....##......
  // .##....##....##....##.....##....##....##......
  // ..######.....##....##.....##....##....########

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function stWakhanTurn()
  {
    Globals::setWakhanActive(true);
    // Used to determine which of the three actions on the card needs to be performed
    Globals::setWakhanCurrentAction(0);
    // Used to determine if there are no valid actions left
    Globals::setWakhanActionsSkipped(0);
    Globals::setRemainingActions(2);
    Notifications::message('${logTokenPlayerName} starts her turn', [
      'logTokenPlayerName' => Utils::logTokenPlayerName(WAKHAN_PLAYER_ID),
    ]);

    $actionStack = [
      ActionStack::createAction(DISPATCH_TRANSITION, WAKHAN_PLAYER_ID, [
        'transition' => 'cleanup',
      ]),
      ActionStack::createAction(DISPATCH_WAKHAN_SETUP_BONUS_ACTIONS, WAKHAN_PLAYER_ID, []),
      ActionStack::createAction(DISPATCH_WAKHAN_ACTIONS, WAKHAN_PLAYER_ID, []),
      ActionStack::createAction(DISPATCH_WAKHAN_START_OF_TURN_ABILITIES, WAKHAN_PLAYER_ID, []),
      ActionStack::createAction(DISPATCH_TRANSITION, PaxPamirPlayers::getPrevId(WAKHAN_PLAYER_ID), [
        'transition' => 'wakhanPause',
      ]),
      ActionStack::createAction(DISPATCH_WAKHAN_DRAW_AI_CARD, WAKHAN_PLAYER_ID, []),
    ];

    ActionStack::next($actionStack);
  }

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

  function dispatchWakhanDrawAICard($actionStack)
  {
    // 1. Draw Wakhan card
    $wakhanCards = $this->drawWakhanCard();
    if ($wakhanCards[DECK] === null) {
      $this->reshuffleWakhanDeck();
      $wakhanCards = $this->drawWakhanCard();
    }

    array_pop($actionStack);
    ActionStack::next($actionStack);
  }

  function dispatchWakhanStartOfTurnAbilities($actionStack)
  {
    array_pop($actionStack);
    ActionStack::set($actionStack);
    $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    // Add start of turn abilities to action stack

    $addPause = false;

    $blackMailHerat = $wakhanPlayer->hasSpecialAbility(SA_BLACKMAIL_HERAT) && $this->existsCourtCardWithoutSpy(HERAT);
    Notifications::log('blackMailHerat',$blackMailHerat);
    if ($wakhanPlayer->hasSpecialAbility(SA_BLACKMAIL_HERAT) && $this->existsCourtCardWithoutSpy(HERAT)) {
      $this->wakhanBlackmail(HERAT);
      $addPause = true;
    }

    $blackMailKandahar = $wakhanPlayer->hasSpecialAbility(SA_BLACKMAIL_KANDAHAR) && $this->existsCourtCardWithoutSpy(KANDAHAR);
    Notifications::log('blackMailKandahar',$blackMailKandahar);
    if ($wakhanPlayer->hasSpecialAbility(SA_BLACKMAIL_KANDAHAR) && $this->existsCourtCardWithoutSpy(KANDAHAR)) {
      $this->wakhanBlackmail(KANDAHAR);
      $addPause = true;
    }
    
    if ($addPause) {
      Wakhan::addPause();
    }
    $this->nextState('dispatchAction');
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...


  function drawWakhanCard()
  {
    $currentTopOfDeck = WakhanCards::getTopOf(DECK);
    $currentTopDiscardPile = WakhanCards::getTopOf(DISCARD);

    WakhanCards::insertOnTop($currentTopOfDeck['id'], DISCARD);
    $discardPile = [
      'from' => $currentTopDiscardPile === null ? null : $currentTopDiscardPile['id'],
      'to' => $currentTopOfDeck['id'],
    ];
    $newTopOfDeck = WakhanCards::getTopOf(DECK);
    $deck = [
      'from' => $currentTopOfDeck['id'],
      'to' => $newTopOfDeck === null ? null : $newTopOfDeck['id'],
    ];
    Notifications::wakhanDrawCard($deck, $discardPile);
    return [
      DECK => $newTopOfDeck,
      DISCARD => $currentTopOfDeck,
    ];
  }

  function marketHasDominanceCheck()
  {
    $cards = Cards::getOfTypeInLocation('card', 'market');

    return Utils::array_some($cards, function ($card) {
      return $this->isDominanceCheck($card);
    });
  }

  function reshuffleWakhanDeck()
  {
    $currentTopDiscardPile = WakhanCards::getTopOf(DISCARD)['id'];
    WakhanCards::moveAllInLocation(DISCARD, DECK);
    WakhanCards::shuffle(DECK);
    $topOfDeck = WakhanCards::getTopOf(DECK)['id'];
    Notifications::wakhanReshuffleDeck($topOfDeck, $currentTopDiscardPile);
  }

  function wakhanBlackmail($region)
  {
    $courtCards = PaxPamirPlayers::getAllCourtCardsOrdered();
    $validCards = Utils::filter($courtCards, function ($card) use ($region) {
      if ($card['region'] !== $region) {
        return false;
      }
      $spies = Tokens::getInLocation(['spies', $card['id']])->toArray();
      return count($spies) === 0;
    });
    $card = Wakhan::selectCard($validCards);
    if ($card === null) {
      return null;
    }
    $cylinder = Wakhan::getCylinderToPlace();
    $this->resolvePlaceCylinder(PaxPamirPlayers::get(WAKHAN_PLAYER_ID), $cylinder, SPY, ['cardId' => $card['id']]);
    return true;
  }
}
