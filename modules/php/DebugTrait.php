<?php

namespace PaxPamir;


use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Preferences;
use PaxPamir\Core\Stats;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Wakhan;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\WakhanCards;
use PaxPamir\Models\PaxPamirPlayer;
use PaxPamir\Models\Player;

trait DebugTrait
{
  function debugCardId(int $cardId)
  {
    return implode('_', ['card', $cardId]);
  }

  function debug_wakhanDeck()
  {
    $deckOrder = [11, 7];
    // $deckOrder = [9, 7];
    $deckOrder = array_reverse($deckOrder);
    foreach ($deckOrder as $cardId) {
      WakhanCards::insertOnTop('wakhan_card_' . $cardId, DECK);
    }
  }



  function debugWakhanGameState()
  {
    $gamestate1 = [
      'armies' => [
        AFGHAN => [],
        BRITISH => [],
        RUSSIAN => [PUNJAB, PUNJAB, PUNJAB, KABUL, KABUL, KABUL, HERAT, HERAT],
      ],
      'roads' => [
        AFGHAN => [],
        BRITISH => [PERSIA_TRANSCASPIA, HERAT_PERSIA, HERAT_KABUL],
        RUSSIAN => [KABUL_PUNJAB, KABUL_PUNJAB, KABUL_TRANSCASPIA],
      ],
      'tribes' => [
        2371052 => [HERAT, HERAT],
        1 => [],
      ],
      'court' => [
        2371052 => [80, 61, 56],
        1 => [71, 32, 11]
      ],
      'spies' => [
        2371052 => [],
        1 => [71, 32]
      ],
      'hand' => [
        2371052 => [24, 40],
        1 => []
      ],
      'rupees' => [
        2371052 => 5,
        1 => 5
      ],
      'market' => [
        [69, 109, 16, 46, 57, 104],
        [115, 41, 64, 5, 59, 98]
      ],
      'marketRupees' => [
        [],
        []
      ],
      'favoredSuit' => MILITARY
    ];
    // $gamestate1 = [
    //   'armies' => [
    //     AFGHAN => [],
    //     BRITISH => [PUNJAB],
    //     RUSSIAN => [],
    //   ],
    //   'roads' => [
    //     AFGHAN => [],
    //     BRITISH => [],
    //     RUSSIAN => [],
    //   ],
    //   'tribes' => [
    //     2371052 => [],
    //     1 => [HERAT, HERAT],
    //   ],
    //   'court' => [
    //     2371052 => [],
    //     1 => [56, 34]
    //   ],
    //   'spies' => [
    //     2371052 => [],
    //     1 => []
    //   ],
    //   'hand' => [
    //     2371052 => [77, 39],
    //     1 => []
    //   ],
    //   'rupees' => [
    //     2371052 => 3,
    //     1 => 0
    //   ],
    //   'market' => [
    //     [15, 62, 81, 18, 110, 83],
    //     [53, 73, 107, 41, 29, 30]
    //   ],
    //   'marketRupees' => [
    //     [1],
    //     [2, 2]
    //   ],
    //   'favoredSuit' => ECONOMIC
    // ];

    $this->debug_setFavoredSuit($gamestate1['favoredSuit']);

    foreach ([AFGHAN, BRITISH, RUSSIAN] as $coalition) {
      foreach ($gamestate1['armies'][$coalition] as $region) {
        $this->debug_createArmy($region, $coalition);
      }
      foreach ($gamestate1['roads'][$coalition] as $border) {
        $this->debug_createRoad($border, $coalition);
      }
    }

    foreach ([2371052, 1] as $playerId) {
      foreach ($gamestate1['tribes'][$playerId] as $region) {
        $this->debug_createTribe($region, $playerId);
      }
      foreach ($gamestate1['court'][$playerId] as $cardId) {
        $this->debug_addCardToCourt($this->debugCardId($cardId), $playerId);
      }
      foreach ($gamestate1['hand'][$playerId] as $cardId) {
        $this->debug_addCardToHand($this->debugCardId($cardId), $playerId);
      }
      PaxPamirPlayers::setRupees($playerId, $gamestate1['rupees'][$playerId]);
      foreach ($gamestate1['spies'][$playerId] as $cardId) {
        $this->debug_createSpy($this->debugCardId($cardId), $playerId);
      }
    }

    foreach ($gamestate1['market'] as $row => $cards) {
      foreach ($cards as $column => $cardId) {
        Cards::moveAllInLocation(Locations::market($row, $column), DECK);
        Cards::insertOnTop($this->debugCardId($cardId), Locations::market($row, $column));
      }
    }
    foreach ($gamestate1['marketRupees'] as $row => $rupeesPerColumn) {
      foreach ($rupeesPerColumn as $column => $rupees) {
        for ($i = 0; $i < $rupees; $i++) {
          $rupee = Tokens::getInLocation(RUPEE_SUPPLY)->first();
          Tokens::move($rupee['id'], Locations::marketRupees($row, $column));
        }
      }
    }
  }


  function debugSetupCourt()
  {
    $this->debug_addCardToCourt('card_32');
    $this->debug_addCardToCourt('card_19');
    $this->debug_addCardToCourt('card_27', '2371052');
    $this->debug_addCardToCourt('card_52', '2371052');
  }

  function debugSetupTokens()
  {
    // $this->debugCreateArmy(KABUL);

    // $this->debugCreateRoad('kabul_punjab');
    // $this->debugCreateSpy('card_32');
    // $this->debugCreateSpy('card_27');
    $this->debug_createTribe(HERAT, 2371052);
    $this->debug_createTribe(HERAT, 2371052);
    $this->debug_createArmy(PUNJAB, RUSSIAN);
    $this->debug_createArmy(PUNJAB, RUSSIAN);
    $this->debug_createArmy(PUNJAB, RUSSIAN);
    $this->debug_createRoad(KABUL_PUNJAB, RUSSIAN);
    $this->debug_createRoad(KABUL_PUNJAB, RUSSIAN);
    $this->debug_createArmy(KABUL, RUSSIAN);
    $this->debug_createArmy(KABUL, RUSSIAN);
    $this->debug_createArmy(KABUL, RUSSIAN);
    $this->debug_createArmy(HERAT, RUSSIAN);
    $this->debug_createArmy(HERAT, RUSSIAN);
    $this->debug_createRoad(PERSIA_TRANSCASPIA, BRITISH);
    $this->debug_createRoad(HERAT_PERSIA, BRITISH);
    $this->debug_createRoad(HERAT_KABUL, BRITISH);
    // $this->debugCreateTribe(KABUL);
    // $this->debugCreateTribe(KABUL);
    // $this->debugCreateTribe(TRANSCASPIA);
    // $this->debugCreateTribe(TRANSCASPIA);
    // $this->debugCreateTribe(TRANSCASPIA);
    // $this->debugCreateTribe(TRANSCASPIA);
  }

  function debug_test()
  {
    Cards::insertOnTop('card_8', DECK);
    // $this->debug_createRoad(KABUL_TRANSCASPIA, RUSSIAN);
    // $this->debug_addCardToHand($this->debugCardId(80), 2371052);
    // $this->debug_addCardToCourt($this->debugCardId(80), 2371052);
    // $this->debugWakhanGameState();
    // Globals::setWakhanCurrentAction(0);
    // Cards::insertOnTop('card_24',Locations::market(1,0));
    // Tokens::move('block_russian_8',Locations::pool(RUSSIAN));
    // WakhanCards::insertOnTop('wakhan_card_12',DECK);
    // WakhanCards::insertOnTop('wakhan_card_15',DISCARD);

    // Cards::insertOnTop('card_101',DECK);
    // Cards::insertOnTop('card_31',DISCARD);
    // Cards::insertOnTop('card_64',Locations::market(0,1));
    // Cards::insertOnTop('card_107',DISCARD);
    // Cards::insertOnTop('card_104',DISCARD);
    // Globals::setDominanceChecksResolved(3);
    // PaxPamirPlayers::incScore(2371052,3);
    // Players::incScore(2371052,3);
    // $this->debugIncPlayerRupees(10,WAKHAN_PLAYER_ID);
    // Notifications::log('log',Log::getAll());
    // Notifications::log('canUndo',!Log::getAll()->empty());
    // Notifications::log('ruler',Map::determineRuler(TRANSCASPIA));
    // Globals::setFavoredSuit(MILITARY);


    // Cards::move('card_106',ACTIVE_EVENTS);

    // Cards::move('card_99',DISCARD);
    // Cards::move('card_112',DECK);
    // Cards::move('card_99',DISCARD);
    // Cards::move('card_83',DISCARD);
    // $result = $this->wakhanRadicalizeGetCardWithMostCylinders(Wakhan::getCardsWakhanCanPurchase());
    // Notifications::log('result',$result);
    // Cards::move('card_68', ['court', WAKHAN_PLAYER_ID],-10);
    // WakhanCards::insertOnTop("wakhan_card_17",DISCARD);
    // Cards::move('card_26', DISCARD);
    // Cards::move('card_116', Locations::market(0,5));

  }

  function debug_stack()
  {
    Notifications::log('stack', ActionStack::get());
  }

  function debug_addCardToCourt(string $cardId, int|null $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
    Cards::insertOnTop($cardId, ['court', $playerId]);
    // $this->reassignCourtState($playerId);
  }

  function debug_addCardToHand(string $cardId, int|null $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
    Cards::move($cardId, ['hand', $playerId]);
  }

  function debug_createArmy(string $region, string|null $coalition = null)
  {
    $coalition = $coalition === null ? PaxPamirPlayers::get()->getLoyalty() : $coalition;
    if (!($this->regions[$region] && $this->loyalty[$coalition])) {
      return;
    }

    $location = $this->locations['pools'][$coalition];
    $army = Tokens::getTopOf($location);
    if ($army != null) {
      $to = $this->locations['armies'][$region];
      Tokens::move($army['id'], $this->locations['armies'][$region]);
      $message = clienttranslate('${tkn_playerName} places ${tkn_army} in ${tkn_regionName}');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get(),
        'tkn_army' => $coalition . '_army',
        'tkn_regionName' => $region,
        'move' => [
          'from' => $location,
          'to' => $to,
          'tokenId' => $army['id'],
        ]
      ]);
      Map::checkRulerChange($region);
    }
  }

  function debug_createRoad(string $border, string|null $coalition = null)
  {
    $coalition = $coalition === null ? PaxPamirPlayers::get()->getLoyalty() : $coalition;
    if (!($this->borders[$border] && $this->loyalty[$coalition])) {
      return;
    }
    $location = $this->locations['pools'][$coalition];
    $road = Tokens::getTopOf($location);
    if ($road != null) {
      $to = $this->locations['roads'][$border];
      $region0 = explode("_", $border)[0];
      $region1 = explode("_", $border)[1];
      Tokens::move($road['id'], $to);
      $message = clienttranslate('${tkn_playerName} places ${tkn_road} on the border between ${tkn_regionName_0} and ${tkn_regionName_1}');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get(),
        'tkn_road' => $coalition . '_road',
        'tkn_regionName_0' => $region0,
        'tkn_regionName_1' => $region1,
        'move' => [
          'from' => $location,
          'to' => $to,
          'tokenId' => $road['id'],
        ]
      ]);
    }
  }

  function debug_createTribe(string $region, string|null $playerId = null)
  {
    if (!($this->regions[$region])) {
      return;
    }
    $playerId = $playerId === null ? Players::get()->getId() : intval($playerId);
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);
    $to = $this->locations["tribes"][$region];
    if ($cylinder != null) {
      Tokens::move($cylinder['id'], $to);
      $message = clienttranslate('${tkn_playerName} places ${tkn_cylinder} in ${tkn_regionName}');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get($playerId),
        'tkn_cylinder' => $playerId . '_cylinder',
        'tkn_regionName' => $region,
        'move' => [
          'from' => $from,
          'to' => $to,
          'tokenId' => $cylinder['id'],
        ]
      ]);
      Map::checkRulerChange($region);
    }
  }

  function debug_createSpy(string $cardId, int|null $playerId = null)
  {
    $card = Cards::get($cardId);
    if (!Utils::startsWith($card['location'], "court")) {
      return;
    };

    $playerId = $playerId === null ? Players::get()->getId() : intval($playerId);
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);

    if ($cylinder != null) {
      $to = 'spies_' . $cardId;
      Tokens::move($cylinder['id'], $to);
      $message = clienttranslate('${tkn_playerName} places ${tkn_cylinder} on ${tkn_cardName}${tkn_newLine}${tkn_largeCard}');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get($playerId),
        'tkn_largeCard' => $cardId,
        'tkn_newLine' => '<br>',
        'tkn_cylinder' => $playerId . '_cylinder',
        'tkn_cardName' => Cards::get($cardId)['name'],
        'move' => [
          'from' => $from,
          'to' => $to,
          'tokenId' => $cylinder['id'],
        ]
      ]);
    }
  }

  function debug_incPlayerRupees(int $rupees, string|null $playerId = null)
  {
    $rupees = intval($rupees);
    $playerId = $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
    PaxPamirPlayers::incRupees($playerId, $rupees);
  }

  function debugIncScore($score, $playerId = null)
  {
    $score = intval($score);
    $player = $playerId === null ? PaxPamirPlayers::get() : PaxPamirPlayers::get(intval($playerId));
    $player->incScore($score);
  }

  function debug_setFavoredSuit($suitId)
  {
    $previous_suit_id = Globals::getFavoredSuit();
    Globals::setFavoredSuit($suitId);
    Notifications::changeFavoredSuit($previous_suit_id, $suitId, false);
  }

  function debugGetState()
  {
    $state = $this->gamestate->state(true, false, true);
    Notifications::log('state', $state);
  }

  function debug_createGift(int $value, string|null $playerId = null)
  {
    $playerId = $this->debugGetPlayerId($playerId);
    $value = intval($value);
    $to = 'gift_' . $value . '_' . $playerId;
    $current = Tokens::getTopOf($to);
    if ($current !== null) {
      return;
    }
    $from = "cylinders_" . $playerId;
    $cylinder = Tokens::getTopOf($from);
    if ($cylinder === null) {
      return;
    }
    Tokens::move($cylinder['id'], $to);
  }

  function debug_createPrize(string $cardId, string|null $playerId = null)
  {
    $playerId = $this->debugGetPlayerId($playerId);
    Cards::move($cardId, Locations::prizes($playerId));
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function debugGetPlayerId($playerId = null)
  {
    return $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
  }



  public function LoadDebug()
  {
    // These are the id's from the BGAtable I need to debug.
    // you can get them by running this query : SELECT JSON_ARRAYAGG(`player_id`) FROM `player`
    $ids = [
      94652353,
    ];
    // You can also get the ids automatically with $ids = array_map(fn($dbPlayer) => intval($dbPlayer['player_id']), array_values($this->getCollectionFromDb('select player_id from player order by player_no')));

    // Id of the first player in BGA Studio
    $sid = 2371052;

    foreach ($ids as $id) {
      // basic tables
      self::DbQuery("UPDATE player SET player_id=$sid WHERE player_id = $id");
      self::DbQuery("UPDATE global SET global_value=$sid WHERE global_value = $id");
      self::DbQuery("UPDATE stats SET stats_player_id=$sid WHERE stats_player_id = $id");

      // 'other' game specific tables. example:
      // tables specific to your schema that use player_ids

      // Ruler tokens
      self::DbQuery("UPDATE player_extra SET player_id=$sid WHERE player_id = $id");

      // Cards
      self::DbQuery("UPDATE `cards` SET `card_location` = 'court_$sid' WHERE `cards`.`card_location` = 'court_$id';");
      self::DbQuery("UPDATE `cards` SET `card_location` = 'events_$sid' WHERE `cards`.`card_location` = 'events_$id';");
      self::DbQuery("UPDATE `cards` SET `card_location` = 'hand_$sid' WHERE `cards`.`card_location` = 'hand_$id';");

      // Cylinders
      for ($i = 1; $i <= 10; $i++) {
        $oldCylinderId = 'cylinder_' . $id . '_' . $i;
        $newCylinderId = 'cylinder_' . $sid . '_' . $i;
        self::DbQuery("UPDATE `tokens` SET `token_id` = '$newCylinderId' WHERE `tokens`.`token_id` = '$oldCylinderId';");
        self::DbQuery("UPDATE `tokens` SET `token_location` = 'cylinders_$sid' WHERE `tokens`.`token_location` = 'cylinders_$id';");
      }

      // Rulers
      $rulers = Globals::getRulers();
      foreach ($rulers as $region => $playerId) {
        if ($playerId === $id) {
          $rulers[$region] = $sid;
        }
      }
      Globals::setRulers($rulers);

      ++$sid;
    }
  }
}
