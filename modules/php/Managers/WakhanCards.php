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
class WakhanCards extends \PaxPamir\Helpers\Pieces
{
  protected static $table = 'wakhan_cards';
  protected static $prefix = 'wakhan_card_';
  protected static $customFields = [];
  protected static $autoreshuffle = false;
  protected static $autoIncrement = false;
  protected static function cast($card)
  {
    // $locations = explode('_', $card['location']);
    $card_info = Game::get()->getWakhanCard($card['id']);
    $card_info['location'] = $card['location'];
    $card_info['state'] = intval($card['state']);
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


  public static function getOfTypeInLocation($type, $location)
  {
    return self::getSelectQuery()
      ->where(static::$prefix . 'id', 'LIKE', $type . '%')
      ->where(static::$prefix . 'location', 'LIKE', $location . '%')
      ->get()
      ->toArray();
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
    if(Globals::getWakhanEnabled()) {
      self::createWakhanDeck();  
    };
    
  }

  private function createWakhanDeck()
  {
    $cards = [];
    array_push($cards, [
      "id" => "wakhan_card_{INDEX}",
      "nbr" => 4,
      "nbrStart" => 1,
      "location" => DECK,
    ]);
    self::create($cards);
    self::shuffle(DECK);
  }
}
