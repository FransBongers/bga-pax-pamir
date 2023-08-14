<?php

namespace PaxPamir\Models;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Preferences;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Tokens;
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
    $current = $this->id == $currentPlayerId;
    $cylinders = $this->getCylinders();
    $hand = $this->getHandCards();
    $data = array_merge($data, [
      'hand' => $current || Globals::getOpenHands() ? $hand : [],
      'court' => [
        'cards' => $this->getCourtCards()
      ],
      'events' => $this->getEventCards(),
      'cylinders' => $cylinders,
      'counts' => [
        'cards' => count($hand),
        'cylinders' => 10 - count($cylinders),
        'influence' => $this->getInfluence(),
        'suits' => $this->getSuitTotals()
      ],
      'prizes' => $this->getPrizes()
    ]);

    foreach ($data['court']['cards'] as $card) {
      $data['court']['spies'][$card['id']] = Tokens::getInLocation(['spies', $card['id']])->toArray();
    }

    foreach (['2', '4', '6'] as $gift_value) {
      $data['gifts'][$gift_value] = Tokens::getInLocation(['gift', $gift_value, $this->id]);
    }
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

  function getEventCards()
  {
    return Cards::getInLocationOrdered(['events', $this->id])->toArray();
  }

  function getPrizes()
  {
    return Cards::getInLocationOrdered(['prizes', $this->id])->toArray();
  }

  function getHandCards()
  {
    return Cards::getInLocation(['hand', $this->id])->toArray();
  }

  function getCylinders()
  {
    return Tokens::getInLocation(['cylinders', $this->id])->toArray();
  }

  /**
   *   Returns total influence for player
   */
  function getInfluence()
  {

    $influence = 1;
    $player_loyalty = $this->getLoyalty();

    // Patriots
    $isRumorActive = Events::isRumorActive($this);
    if (!$isRumorActive) {
      $court_cards = $this->getCourtCards();
      foreach ($court_cards as $card) {
        $card_loyalty = Game::get()->getCardInfo($card)['loyalty'];
        if ($card_loyalty === $player_loyalty) {
          $influence += 1;
        }
      }
    }

    $isEmbarrassementOfRichesActive = Events::isEmbarrassementOfRichesActive();
    // Gifts
    if (!$isEmbarrassementOfRichesActive) {
      $isKohINoorRecoveredActive = Events::isKohINoorRecoveredActive($this);
      $influencePerGift = $isKohINoorRecoveredActive ? 2 : 1;
      for ($i = 1; $i <= 3; $i++) {
        $value = $i * 2;
        $tokens_in_location = Tokens::getInLocation(['gift', $value, $this->id]);
        if (count($tokens_in_location) > 0) {
          $influence += $influencePerGift;
        }
      }
    }

    $prizes = $this->getPrizes();
    $influence += count($prizes);

    return $influence;
  }

  function getLowestAvailableGift()
  {
    foreach (['2', '4', '6'] as $giftValue) {
      $token = Tokens::getTopOf(['gift', $giftValue, $this->id]);
      if ($token === null) {
        return intval($giftValue);
      }
    }
    return null;
  }

  function getSuitTotals()
  {
    $suits = array(
      POLITICAL => 0,
      MILITARY => 0,
      ECONOMIC => 0,
      INTELLIGENCE => 0,
    );

    $courtCards = $this->getCourtCards();
    for ($i = 0; $i < count($courtCards); $i++) {
      $card = $courtCards[$i];
      $suits[$card['suit']] += $card['rank'];
    }
    $suits['courtCards'] = count($courtCards);
    return $suits;
  }

  function checkDiscards()
  {
    //
    // check for extra cards in hand and court
    //
    $result = array();
    $suits = $this->getSuitTotals();
    $court_cards = $this->getCourtCards();
    $hand = $this->getHandCards();

    $result['court'] = count($court_cards) - $suits['political'] - 3;
    $result['court'] = max($result['court'], 0);

    $result['hand'] = count($hand) - $suits['intelligence'] - 2;
    $result['hand'] = max($result['hand'], 0);

    return $result;
  }

  function hasSpecialAbility($specialAbility)
  {
    $courtCards = $this->getCourtCards();
    return Utils::array_some($courtCards, function ($card) use ($specialAbility) {
      return $card['specialAbility'] === $specialAbility;
    });
  }
}
