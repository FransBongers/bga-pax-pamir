<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
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
  function discardCards($cards, $fromHand)
  {
    self::checkAction('discardCards');

    $player = Players::get();
    $playerId = $player->getId();
    $discards = $player->checkDiscards();
    $state = Cards::getExtremePosition(true, DISCARD);
    if ($fromHand) {
      if (count($cards) !== $discards['hand'])
        throw new \feException("Incorrect number of discards");

      foreach ($cards as $cardId) {
        $state += 1;
        Cards::move($cardId, DISCARD, $state);
        $cardName = $this->cards[$cardId]['name'];
        $removed_card = Cards::get($cardId);
        $courtCards = $player->getCourtCards();

        self::notifyAllPlayers("discardCard", '${player_name} discarded ${cardName} from his hand.', array(
          'playerId' => $player->getId(),
          'player_name' => self::getActivePlayerName(),
          'cardName' => $cardName,
          'courtCards' => $courtCards,
          'cardId' => $cardId,
          'state' => $state,
          'from' => 'hand'
        ));
      }
    } else {
      if (count($cards) != $discards['court'])
        throw new \feException("Incorrect number of discards");

      foreach ($cards as $cardId) {
        // Move all spies back to players cylinder pool
        $spiesOnCard = Tokens::getInLocation(['spies', $cardId]);
        self::dump("spiesOnCard", $spiesOnCard);
        foreach ($spiesOnCard as $spy) {
          $spyOwner = explode("_", $spy['id'])[1];
          Tokens::move($spy['id'], ['cylinders', $spyOwner]);
        }
        $state += 1;
        // move card to discard location
        Cards::move($cardId, DISCARD, $state);
        $cardName = $this->cards[$cardId]['name'];
        $removedCard = Cards::get($cardId);
        $courtCards = Cards::getInLocation(['court', $playerId]);

        // slide card positions down to fill in gap
        foreach ($courtCards as $c) {
          if ($c['state'] > $removedCard['state'])
            Cards::setState($c['id'], $c['state'] - 1);
        }

        $courtCards = Cards::getInLocation(['court', $playerId])->toArray();

        self::notifyAllPlayers("discardCard", '${player_name} discarded ${cardName} from his court.', array(
          'playerId' => $playerId,
          'player_name' => self::getActivePlayerName(),
          'cardName' => $cardName,
          'courtCards' => $courtCards,
          'cardId' => $cardId,
          'state' => $state,
          'from' => 'court'
        ));
      }
    }

    $this->updatePlayerCounts();

    $this->gamestate->nextState('cleanup');
  }
}
