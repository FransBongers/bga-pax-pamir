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
  function discardCards($cards, $from_hand)
  {
    self::checkAction('discardCards');

    $player = Players::get();
    $player_id = $player->getId();
    $discards = $player->checkDiscards();

    if ($from_hand) {
      if (count($cards) !== $discards['hand'])
        throw new \feException("Incorrect number of discards");

      foreach ($cards as $card_id) {
        Cards::move($card_id, 'discard');
        $card_name = $this->cards[$card_id]['name'];
        $removed_card = Cards::get($card_id);
        $court_cards = $player->getCourtCards();

        self::notifyAllPlayers("discardCard", '${playerName} discarded ${cardName} from their hand.', array(
          'playerId' => $player->getId(),
          'playerName' => self::getActivePlayerName(),
          'cardName' => $card_name,
          'courtCards' => $court_cards,
          'cardId' => $card_id,
          'from' => 'hand'
        ));
      }
    } else {
      if (count($cards) != $discards['court'])
        throw new \feException("Incorrect number of discards");

      foreach ($cards as $card_id) {

        // Move all spies back to players cylinder pool
        $spiesOnCard = Tokens::getInLocation(['spies', $card_id]);
        self::dump("spiesOnCard", $spiesOnCard);
        foreach ($spiesOnCard as $spy) {
          $spyOwner = explode("_", $spy['id'])[1];
          Tokens::move($spy['id'], ['cylinders', $spyOwner]);
        }

        // move card to discard location
        Cards::move($card_id, 'discard');
        $card_name = $this->cards[$card_id]['name'];
        $removed_card = Cards::get($card_id);
        $court_cards = Cards::getInLocation(['court', $player_id]);

        // slide card positions down to fill in gap
        foreach ($court_cards as $c) {
          if ($c['state'] > $removed_card['state'])
            Cards::setState($c['id'], $c['state'] - 1);
        }

        $court_cards = Cards::getInLocation(['court', $player_id])->toArray();

        self::notifyAllPlayers("discardCard", '${playerName} discarded ${cardName} from their court.', array(
          'playerId' => $player_id,
          'playerName' => self::getActivePlayerName(),
          'cardName' => $card_name,
          'courtCards' => $court_cards,
          'cardId' => $card_id,
          'from' => 'court'
        ));
      }
    }

    $this->updatePlayerCounts();

    $this->gamestate->nextState('cleanup');
  }
}
