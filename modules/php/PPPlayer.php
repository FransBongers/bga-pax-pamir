<?php
namespace PaxPamir;

use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PPPlayerTrait
{

  /**
   *   Returns total influence for player
   */
  function getPlayerInfluence($player_id)
  {
    $player = Players::get($player_id);
    $influence = 1;
    $player_loyalty = $player->getLoyalty();

    // Patriots
    $court_cards = $player->getCourtCards();
    foreach($court_cards as $card) {
      $card_loyalty = $this->getCardInfo($card)['loyalty'];
      if ($card_loyalty === $player_loyalty) {
        $influence += 1;
      }
    }
    for ($i = 1; $i <= 3; $i++) {
      $value = $i * 2;
      $tokens_in_location = Tokens::getInLocation(['gift' , $value , $player_id]);
      if (count($tokens_in_location) > 0) {
        $influence += 1;
      }
    }


    // Tokens::getInLocation('cylinder', 'court_'.$player_id, null, 'state');
    // TODO (Frans): get information about courd cards and add influence if patriot
    // Add number of prizes

    return $influence;
  }

  /**
   * Calculates total number of ranks for each suit for cards in a players court
   */
  function getPlayerSuitsTotals($player_id)
  {
    $suits = array(
      POLITICAL => 0,
      MILITARY => 0,
      ECONOMIC => 0,
      INTELLIGENCE => 0
    );
    $court_cards = Players::get($player_id)->getCourtCards();
    for ($i = 0; $i < count($court_cards); $i++) {
      $card_info = $this->cards[$court_cards[$i]['id']];
      $suits[$card_info['suit']] += $card_info['rank'];
    }
    return $suits;
  }

  /*
      Returns the number of hand and court cards that need to be discarded by the player.
  */
  function checkDiscardsForPlayer($player_id)
  {
    //
    // check for extra cards in hand and court
    //
    $player = Players::get($player_id);
    $result = array();
    $suits = $this->getPlayerSuitsTotals($player_id);
    $court_cards = $player->getCourtCards();
    $hand = $player->getHandCards();

    $result['court'] = count($court_cards) - $suits['political'] - 3;
    $result['court'] = max($result['court'], 0);

    $result['hand'] = count($hand) - $suits['intelligence'] - 2;
    $result['hand'] = max($result['hand'], 0);

    return $result;
  }
}
