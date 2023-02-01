<?php
namespace PaxPamir\Models;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Preferences;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;

/*
 * Player: all utility functions concerning a player
 */

class Player extends \PaxPamir\Helpers\DB_Model
{
  protected $table = 'player';
  protected $primary = 'player_id';
  protected $attributes = [
    'id' => ['player_id', 'int'],
    'no' => ['player_no', 'int'],
    'name' => 'player_name',
    'color' => 'player_color',
    'eliminated' => 'player_eliminated',
    'score' => ['player_score', 'int'],
    'zombie' => 'player_zombie',
    'loyalty' => 'loyalty',
    'rupees' => ['rupees', 'int'],
  ];

  /*
   * Getters
   */
  public function getPref($prefId)
  {
    return Preferences::get($this->id, $prefId);
  }

  public function jsonSerialize($currentPlayerId = null)
  {
    $data = parent::jsonSerialize();
    $data['id'] = intval($data['id']);
    $data['rupees'] = intval($data['rupees']);
    $data['score'] = intval($data['score']);
    // $current = $this->id == $currentPlayerId;
    // $data = array_merge($data, [
    //   'cards' => $current ? $this->getCards()->toArray() : [],
    // ]);

    return $data;
  }

  public function getId()
  {
    return (int) parent::getId();
  }

  // public function getCards()
  // {
  //   return Cards::getOfPlayer($this->id);
  // }

  public static function getCounts()
  {
    $counts = array();

  }

  function getCourtCards()
  {
    return Cards::getInLocationOrdered(['court', $this->id])->toArray();
  }

  function getHandCards()
  {
    return Cards::getInLocation(['hand', $this->id])->toArray();
  }
}
