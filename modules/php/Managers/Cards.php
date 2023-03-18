<?php

namespace PaxPamir\Managers;

use PaxPamir\Core\Globals;
use PaxPamir\Core\Game;
use PaxPamir\Core\Notifications;
use PaxPamir\Managers\Players;
use PaxPamir\Helpers\Utils;

/**
 * Cards
 */
class Cards extends \PaxPamir\Helpers\Pieces
{
  protected static $table = 'cards';
  protected static $prefix = 'card_';
  protected static $customFields = ['used'];
  protected static $autoreshuffle = false;
  protected static $autoIncrement = false;
  protected static function cast($card)
  {
    // $locations = explode('_', $card['location']);
    $card_info = Game::get()->getCard($card['id']);
    $card_info['location'] = $card['location'];
    $card_info['state'] = intval($card['state']);
    $card_info['used'] = intval($card['used']);
    return $card_info;
    // return [
    //   'id' => $card['id'],
    //   'location' => $card['location'],
    //   'state' => intval($card['state']),
    //   'used' => intval($card['used']),
    // ];
  }

  //////////////////////////////////
  //////////////////////////////////
  //////////// GETTERS //////////////
  //////////////////////////////////
  //////////////////////////////////

  /**
   * getOfPlayer: return the cards in the hand of given player
   */
  public static function getOfPlayer($pId)
  {
    return self::getInLocation(['hand', $pId]);
  }

  //////////////////////////////////
  //////////////////////////////////
  ///////////// SETTERS //////////////
  //////////////////////////////////
  //////////////////////////////////

  /**
   * setupNewGame: create the deck of cards
   */
  public static function setupNewGame($players, $options)
  {
    self::createDeck(count($players));
  }

  private function createDeck($player_count)
  {
    $cards = [];
    array_push($cards, [
      "id" => "card_{INDEX}",
      "nbr" => 100,
      "nbrStart" => 1,
      "location" => COURT_CARD,
      "used" => 0,
    ]);
    array_push($cards, [
      "id" => "card_{INDEX}",
      "nbr" => 4,
      "nbrStart" => 101,
      "location" => 'dominanceCheckCard',
      "used" => 0,
    ]);
    array_push($cards, [
      "id" => "card_{INDEX}",
      "nbr" => 12,
      "nbrStart" => 105,
      "location" => EVENT_CARD,
      "used" => 0,
    ]);
    self::create($cards);
    self::shuffle(COURT_CARD);
    self::shuffle(EVENT_CARD);

    for ($i = 6; $i >= 1; $i--) {
      self::pickForLocation($player_count + 5, COURT_CARD, 'pile');
      if ($i == 2) {
        self::pickForLocation(2, EVENT_CARD, 'pile');
      } elseif ($i > 2) {
        self::pickForLocation(1, EVENT_CARD, 'pile');
        self::pickForLocation(1, 'dominanceCheckCard', 'pile');
      }
      self::shuffle('pile');
      $pile = self::getInLocation('pile');
      $n_cards = self::countInLocation('deck');
      foreach ($pile as $id => $info) {
        self::move($id, 'deck', $info['state'] + $n_cards);
      }
    }
  }

  public static function setUsed($id, $value)
  {
    self::DB()->update([
      'used' => $value,
    ], $id);
  }

  /**
   * Should returns the cards that are not available for sale (because player already put rupee on it)
   */
  public static function getUnavailableCards()
  {
    return array_map(function ($card) {
      return $card['id'];
    }, self::getSelectQuery()->where('used', 1)->get()->toArray());
  }

  public static function resetUsed()
  {
    self::DB()->update(['used' => 0])->run();
  }

  /**
   * Returns ruler of the region a card belongs to. 0 if no ruler, otherwise playerId.
   */
  public static function getRegionRulerForCard($card_id)
  {
    if ($card_id == 0) return 0;

    $rulers = Map::getRulers();
    $region = Game::get()->getCard($card_id)['region'];

    return $rulers[$region];
  }
}
