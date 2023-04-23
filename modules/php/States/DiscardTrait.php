<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait DiscardTrait
{

  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argDiscardCourt()
  {
    $player = Players::get();
    $countPoliticalSuit = $player->getSuitTotals()[POLITICAL];
    $countCourtCards = count($player->getCourtCards());

    return array(
      'numberOfDiscards' => $countCourtCards - $countPoliticalSuit - 3
    );
  }

  function argDiscardHand()
  {
    $player = Players::get();
    $countIntelligenceSuit = $player->getSuitTotals()[INTELLIGENCE];
    $countHandCards = count($player->getHandCards());

    return array(
      'numberOfDiscards' => $countHandCards - $countIntelligenceSuit - 2
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
   * Discard cards action when needed at end of a players turn
   */
  function discardCards($cardIds, $fromHand)
  {
    self::checkAction('discardCards');

    $player = Players::get();
    $playerId = $player->getId();
    $discards = $player->checkDiscards();

    if (($fromHand && count($cardIds) !== $discards['hand']) || (!$fromHand && count($cardIds) != $discards['court'])) {
      throw new \feException("Incorrect number of discards");
    };
    $cards = [];
    foreach ($cardIds as $cardId) {
      $card = Cards::get($cardId);
      if (($fromHand && $card['location'] !== 'hand_' . $playerId) || (!$fromHand && $card['location'] !== 'court_' . $playerId)) {
        throw new \feException("Card is not in the discard location");
      }
      $cards[] = $card;
    }


    $state = Cards::getExtremePosition(true, DISCARD);
    foreach ($cards as $card) {
      $cardId = $card['id'];
      $spyMoves = [];
      if (Utils::startsWith($card['location'], 'court')) {
        $spyMoves = $this->removeSpiesFromCard($cardId);
      }
      $state += 1;
      Cards::move($cardId, DISCARD, $state);

      if ($fromHand) {
        Notifications::discardFromHand($card, $player);
      } else {
        Notifications::discardFromCourt($card, $player, $spyMoves);
      };
    }

    $this->reassignCourtState();

    $this->gamestate->nextState('cleanup');
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function removeSpiesFromCard($cardId)
  {
    $from = 'spies_' . $cardId;
    $spiesOnCard = Tokens::getInLocation($from)->toArray();
    $moves = [];
    if (count($spiesOnCard) === 0) {
      return $moves;
    }

    foreach ($spiesOnCard as $index => $spy) {
      $spyOwner = explode("_", $spy['id'])[1];
      $to = 'cylinders_' . $spyOwner;
      $state = Tokens::insertOnTop($spy['id'], $to);
      $moves[] =  [
        'from' => $from,
        'to' => $to,
        'tokenId' => $spy['id'],
        'weight' => $state,
      ];
    };

    return $moves;
  }

  function reassignCourtState($playerId = null)
  {
    $player = Players::get($playerId);
    $courtCards = $player->getCourtCards();
    $courtCardStates = [];
    foreach ($courtCards as $index => $card) {
      $cardId = $card['id'];
      $state = $index + 1;
      Cards::setState($cardId, $state);
      $courtCardStates[] = [
        'cardId' => $cardId,
        'state' => $state,
      ];
    };
    Notifications::updateCourtCardStates($courtCardStates, $player->getId());
  }
}
