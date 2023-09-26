<?php

namespace PaxPamir;


use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Preferences;
use PaxPamir\Helpers\Locations;
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
  function debugSetupCourt()
  {
    $this->debugAddCardToCourt('card_32');
    $this->debugAddCardToCourt('card_19');
    $this->debugAddCardToCourt('card_27', '2371052');
    $this->debugAddCardToCourt('card_52', '2371052');
  }

  function debugSetupTokens()
  {
    // $this->debugCreateArmy(KABUL);

    // $this->debugCreateRoad('kabul_punjab');
    // $this->debugCreateSpy('card_32');
    // $this->debugCreateSpy('card_27');
    $this->debugCreateTribe(PUNJAB);
    $this->debugCreateTribe(PUNJAB);
    $this->debugCreateTribe(PUNJAB);
    $this->debugCreateTribe(PUNJAB);
    $this->debugCreateTribe(KABUL);
    $this->debugCreateTribe(KABUL);
    $this->debugCreateTribe(TRANSCASPIA);
    $this->debugCreateTribe(TRANSCASPIA);
    $this->debugCreateTribe(TRANSCASPIA);
    $this->debugCreateTribe(TRANSCASPIA);
  }

  function test()
  {
    Cards::setUsed('card_81',0);
    // Cards::move('card_31',Locations::market(1,2));
    // Cards::move('card_45',DISCARD);
    // Cards::move('card_23',DISCARD);
    // Cards::move('card_25',DISCARD);
    // Cards::move('card_99',DISCARD);
    // Cards::move('card_83',DISCARD);
    $result = $this->wakhanRadicalizeGetCardWithMostCylinders(Wakhan::getCourtCardsWakhanCanPurchase());
    Notifications::log('result',$result);
    // Cards::move('card_68', ['court', WAKHAN_PLAYER_ID],-10);
    // WakhanCards::insertOnTop("wakhan_card_17",DISCARD);
    // Cards::move('card_26', DISCARD);
    // Cards::move('card_116', Locations::market(0,5));
    // Cards::move('card_78', Locations::market(1,5));
    // Cards::move('card_114', DISCARD);
    // Cards::move('card_28', Locations::market(1,2));
    // Cards::move('card_100', DISCARD);
    // Cards::move('card_9', Locations::market(0,1));

    // Globals::setFavoredSuit(MILITARY);
    // PaxPamirPlayers::incScore(PaxPamirPlayers::get()->getId(), 6);
    // PaxPamirPlayers::incScore(WAKHAN_PLAYER_ID, 5);
    // $this->gamestate->jumpToState(ST_CALCULATE_TIE_BREAKER);
    // Globals::setFavoredSuit(MILITARY);
    // $this->determineRuler(KABUL, $piecesToIgnore = [], $armiesToAdd = [], $tribesToAdd = []);
    // $ruler = Map::determineRuler(KABUL,['block_russian_12'],[],['cylinder_1_8']);
    // Notifications::log('ruler',$ruler);

    // $wakhanPlayer = PaxPamirPlayers::get(WAKHAN_PLAYER_ID);
    // // Add start of turn abilities to action stack

    // $addPause = false;
    // Notifications::log('blachMailHerat',$wakhanPlayer->hasSpecialAbility(SA_BLACKMAIL_HERAT) && $this->existsCourtCardWithoutSpy(HERAT));
    // if ($wakhanPlayer->hasSpecialAbility(SA_BLACKMAIL_HERAT) && $this->existsCourtCardWithoutSpy(HERAT)) {
    //   // $addPause = $addPause || $this->wakhanBlackmail(HERAT);
    // }
    // Notifications::log('blachMailKandahar',$wakhanPlayer->hasSpecialAbility(SA_BLACKMAIL_KANDAHAR) && $this->existsCourtCardWithoutSpy(KANDAHAR));
    // if ($wakhanPlayer->hasSpecialAbility(SA_BLACKMAIL_KANDAHAR) && $this->existsCourtCardWithoutSpy(KANDAHAR)) {
    //   // $addPause = $addPause || $this->wakhanBlackmail(KANDAHAR);
    // }
    // Globals::setFavoredSuit(INTELLIGENCE);
    // Cards::setUsed('card_45',0);
    // $actionStack = [
    //   ActionStack::createAction(DISPATCH_TRANSITION, PaxPamirPlayers::get()->getId(), [
    //     'transition' => 'playerActions'
    //   ])
    // ];
    // ActionStack::set($actionStack);
    // Notifications::log('stack',ActionStack::get());
    // Notifications::log('stack',Globals::getWakhanActive());
    // Cards::move('card_110', 'events_'.WAKHAN_PLAYER_ID);

    // Notifications::log('adjacent',$this->wakhanGetNextMove());
    // Notifications::log('piece',Map::determineRuler(KABUL,['cylinder_1_5','block_british_6']));
    // Notifications::log('piece',$this->wakhanGetPieceToMove(PUNJAB));

    // Globals::setRemainingActions(2);
    // Cards::setUsed('card_69', 0);
    // $this->dispatchWakhanSetupBonusActions();
  }

  function debugAddCardToCourt($cardId, $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
    Cards::move($cardId, ['court', $playerId]);
    // $this->reassignCourtState($playerId);
  }

  function debugAddCardToHand($cardId, $playerId = null)
  {
    $card = Cards::get($cardId);
    $playerId = $playerId === null ? PaxPamirPlayers::get()->getId() : intval($playerId);
    Cards::move($cardId, ['hand', $playerId]);
  }

  function debugCreateArmy($region, $coalition = null)
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
      $message = clienttranslate('${player_name} places ${logTokenArmy} in ${logTokenRegionName}');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get(),
        'logTokenArmy' => Utils::logTokenArmy($coalition),
        'logTokenRegionName' => Utils::logTokenRegionName($region),
        'move' => [
          'from' => $location,
          'to' => $to,
          'tokenId' => $army['id'],
        ]
      ]);
      Map::checkRulerChange($region);
    }
  }

  function debugCreateRoad($border, $coalition = null)
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
      $message = clienttranslate('${player_name} places ${logTokenRoad} on the border between ${logTokenRegionName0} and ${logTokenRegionName1}');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get(),
        'logTokenRoad' => Utils::logTokenRoad($coalition),
        'logTokenRegionName0' => Utils::logTokenRegionName($region0),
        'logTokenRegionName1' => Utils::logTokenRegionName($region1),
        'move' => [
          'from' => $location,
          'to' => $to,
          'tokenId' => $road['id'],
        ]
      ]);
    }
  }

  function debugCreateTribe($region, $playerId = null)
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
      $message = clienttranslate('${player_name} places ${logTokenCylinder} in ${logTokenRegionName}');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get($playerId),
        'logTokenCylinder' => Utils::logTokenCylinder($playerId),
        'logTokenRegionName' => Utils::logTokenRegionName($region),
        'move' => [
          'from' => $from,
          'to' => $to,
          'tokenId' => $cylinder['id'],
        ]
      ]);
      Map::checkRulerChange($region);
    }
  }

  function debugCreateSpy($cardId, $playerId = null)
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
      $message = clienttranslate('${player_name} places ${logTokenCylinder} on ${logTokenCardName}${logTokenLargeCard}');
      Notifications::moveToken($message, [
        'player' => PaxPamirPlayers::get($playerId),
        'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
        'logTokenCylinder' => Utils::logTokenCylinder($playerId),
        'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
        'move' => [
          'from' => $from,
          'to' => $to,
          'tokenId' => $cylinder['id'],
        ]
      ]);
    }
  }

  function debugIncPlayerRupees($rupees, $playerId = null)
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

  function debugSetFavoredSuit($suitId)
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

  function debugCreateGift($value, $playerId = null)
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

  function debugCreatePrize($cardId, $playerId = null)
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
}
