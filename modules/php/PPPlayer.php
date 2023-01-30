<?php
namespace PaxPamir;

use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PPPlayerTrait
{
  function getPlayerCourtCards($player_id)
  {
    return Players::get($player_id)->getCourtCards();
  }

  function getPlayerHand($player_id)
  {
    return Cards::getInLocation(['hand', $player_id]);
  }

  /**
   * Get loyalty for player
   */
  function getPlayerLoyalty($player_id)
  {
    $sql = "SELECT loyalty FROM player WHERE  player_id='$player_id' ";
    return $this->getUniqueValueFromDB($sql);
  }

  /**
   * Get total number of rupees owned by player
   */
  function getPlayerRupees($player_id)
  {
    $sql = "SELECT rupees FROM player WHERE  player_id='$player_id' ";
    return intval($this->getUniqueValueFromDB($sql));
  }

  /**
   *   Returns total influence for player
   */
  function getPlayerInfluence($player_id)
  {
    $influence = 1;
    $player_loyalty = $this->getPlayerLoyalty($player_id);

    // Patriots
    $court_cards = $this->getPlayerCourtCards($player_id);
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
    $court_cards = Players::get($player_id)->getCourtCards();// $this->getPlayerCourtCards($player_id);
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
    $result = array();
    $suits = $this->getPlayerSuitsTotals($player_id);
    $court_cards = $this->getPlayerCourtCards($player_id);
    $hand = $this->getPlayerHand($player_id);

    $result['court'] = count($court_cards) - $suits['political'] - 3;
    $result['court'] = max($result['court'], 0);

    $result['hand'] = count($hand) - $suits['intelligence'] - 2;
    $result['hand'] = max($result['hand'], 0);

    return $result;
  }
}
