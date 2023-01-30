<?php

namespace PaxPamir;
// use APP_DbObject;

class Market  extends Helpers\Pieces
{
  protected static $table = 'token';
  protected static $prefix = 'token_';
  // protected static $customFields = ['used'];

  protected static function cast($token)
  {
    return [
      'id' => $token['id'],
      'location' => $token['location'],
      'state' => $token['state'],
    ];
  }

  public static function setupNewGame($players)
  {
    $number_of_players = count($players);
    $tokens = [];
    $info = [
      "id" => "card_{INDEX}",
      "nbr" => 100,
      "nbrStart" => 1,
      "location" => COURT_CARD
    ];
    array_push($tokens, $info);
    self::create($tokens);
    // self::singleCreate('card', 'court', 0);
  }
}
