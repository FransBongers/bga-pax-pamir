<?php

namespace PaxPamir\Core;

use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Helpers\Utils;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Wakhan;
use PaxPamir\Models\PaxPamirPlayer;

class Notifications
{
  /*************************
   **** GENERIC METHODS ****
   *************************/
  protected static function notifyAll($name, $msg, $data)
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($player, $name, $msg, $data)
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($pId, $name, $msg, $data);
  }

  public static function message($txt, $args = [])
  {
    self::notifyAll('message', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = [])
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::notify($pId, 'message', $txt, $args);
  }

  public static function refreshInterface($data)
  {
    self::notifyAll('refreshInterface', '', $data);
  }

  public static function smallRefreshInterface($data)
  {
    self::notifyAll('smallRefreshInterface', '', $data);
  }

  public static function smallRefreshHand($player)
  {
    $playerDatas = $player->jsonSerialize($player->getId());
    if (Globals::getOpenHands()) {
      self::notifyAll('smallRefreshHand', '', [
        'playerId' => $player->getId(),
        'hand' => $playerDatas['hand'],
      ]);
    } else {
      self::notify($player, 'smallRefreshHand', '', [
        'playerId' => $player->getId(),
        'hand' => $playerDatas['hand'],
      ]);
    }
  }

  public static function clearTurn($player, $notifIds)
  {
    self::notifyAll('clearTurn', clienttranslate('${tkn_playerName} restarts his turn'), [
      'player' => $player,
      'notifIds' => $notifIds,
    ]);
  }

  public static function refreshUI($datas)
  {
    // Keep only the thing that matters
    $fDatas = [
      // Add data here that needs to be refreshed
    ];

    self::notifyAll('refreshUI', '', [
      'datas' => $fDatas,
    ]);
  }

  public static function log($message, $data)
  {
    // Keep only the thing that matters
    $fDatas = [
      // Add data here that needs to be refreshed
    ];

    self::notifyAll('log', '', [
      'message' => $message,
      'data' => $data,
    ]);
  }

  /*************************
   **** GAME METHODS ****
   *************************/

  public static function battleCard($cardId)
  {
    $message = clienttranslate('${tkn_playerName} battles on ${tkn_cardName}${tkn_newLine}${tkn_largeCard}');
    self::notifyAll('battle', $message, [
      'player' => PaxPamirPlayers::get(),
      'tkn_cardName' => Cards::get($cardId)['name'],
      'tkn_largeCard' => $cardId,
      'tkn_newLine' => '<br>',
    ]);
  }

  public static function battleRegion($player,$regionId)
  {
    $message = clienttranslate('${tkn_playerName} battles in ${tkn_regionName}');
    self::notifyAll('battle', $message, [
      'player' => $player,
      'tkn_regionName' => $regionId,
    ]);
  }

  public static function betray($card, $player, $rupeesOnCards)
  {
    $message = clienttranslate('${tkn_playerName} betrays ${tkn_cardName}${tkn_newLine}${tkn_largeCard}');
    self::notifyAll('payRupeesToMarket', $message, [
      'player' => $player,
      'rupeesOnCards' => $rupeesOnCards,
      'tkn_cardName' => $card['name'],
      'tkn_largeCard' => $card['id'],
      'tkn_newLine' => '<br>',
    ]);
  }

  public static function build($cardId, $player, $rupeesOnCards)
  {
    self::notifyAll("payRupeesToMarket", clienttranslate('${tkn_playerName} uses ${tkn_cardName} to build and pays ${numberOfRupees} ${tkn_rupee}${tkn_newLine}${tkn_largeCard}'), array(
      'player' => $player,
      'numberOfRupees' => count($rupeesOnCards),
      'rupeesOnCards' => $rupeesOnCards,
      'tkn_cardName' => Cards::get($cardId)['name'],
      'tkn_largeCard' => $cardId,
      'tkn_rupee' => 'rupee(s)',
      'tkn_newLine' => '<br>',
    ));
  }

  public static function buildInfrastructure($player)
  {
    self::notifyAll("build", clienttranslate('${tkn_playerName} uses Infrastructure special ability'), [
      'player' => $player,
      'rupeesOnCards' => [],
    ]);
  }

  public static function changeFavoredSuit($previousSuit, $newSuit, $customMessage = null)
  {
    $message = clienttranslate('${tkn_playerName} changes favored suit to ${tkn_favoredSuit}');
    $message = $customMessage ? $customMessage : $message;
    self::notifyAll('changeFavoredSuit', $message, [
      'player' => PaxPamirPlayers::get(),
      'tkn_favoredSuit' => $newSuit,
      'from' => $previousSuit,
      'to' => $newSuit,
    ]);
  }

  public static function changeLoyalty($coalition)
  {
    self::notifyAll("changeLoyalty", '', array(
      'player' => PaxPamirPlayers::get(),
      'coalition' => $coalition,
    ));
    if (Globals::getWakhanEnabled()) {
      self::wakhanUpdatePragmaticLoyalty();
    }
  }

  public static function changeLoyaltyMessage($coalition)
  {
    self::notifyAll("changeLoyaltyMessage", clienttranslate('${tkn_playerName} changes loyalty to ${tkn_coalitionName} ${tkn_coalition}'), array(
      'player' => PaxPamirPlayers::get(),
      'tkn_coalitionName' => $coalition,
      'tkn_coalition' => $coalition,
    ));
  }

  public static function changeRuler($oldRuler, $newRuler, $region)
  {
    $msg = clienttranslate('${tkn_playerName} becomes ruler of ${tkn_regionName}');
    if ($newRuler === null) {
      $msg = clienttranslate('${tkn_playerName} no longer rules ${tkn_regionName}');
    }
    self::notifyAll('changeRuler', $msg, [
      'tkn_playerName' => PaxPamirPlayers::get($newRuler === null ? $oldRuler : $newRuler)->getName(),
      'oldRuler' => $oldRuler,
      'newRuler' => $newRuler,
      'tkn_regionName' => $region,
      'region' => $region,
    ]);
  }

  public static function drawMarketCard($player, $cardId, $from, $to)
  {

    self::notifyAll("drawMarketCard", clienttranslate('${tkn_playerName} draws a new card for the market${tkn_newLine}${tkn_largeCard}'), array(
      'player' => $player,
      'cardId' => $cardId,
      'from' => $from,
      'to' => $to,
      'tkn_newLine' => '<br>',
      'tkn_largeCard' => $cardId,
    ));
  }

  public static function shiftMarket($move)
  {
    self::notifyAll("shiftMarket", '', array(
      'move' => $move,
    ));
  }

  public static function shiftMarketMessage($playerId)
  {
    self::notifyAll("shiftMarketMessage", clienttranslate('${tkn_playerName} moves cards in the market left'), array(
      'player' => PaxPamirPlayers::get($playerId),
    ));
  }

  public static function dominanceCheckResult($scores, $checkSuccessful, $coalition = null)
  {
    $logs = [];
    $args = [];
    foreach ($scores as $playerId => $playerScore) {
      // $playerId = explode("_", $move['tokenId'])[1];
      $logs[] = '${playerScore_' . $playerId . '}';
      $args['playerScore_' . $playerId] = [
        'log' => clienttranslate('${tkn_playerName} scores ${points} victory point(s)${tkn_newLine}'),
        'args' => [
          'tkn_playerName' => PaxPamirPlayers::get($playerId)->getName(),
          'tkn_newLine' => '<br>',
          'points' => $playerScore['newScore'] - $playerScore['currentScore']
        ]
      ];
    }

    self::notifyAll("dominanceCheckScores", clienttranslate('${resultLog}${tkn_newLine}${tkn_newLine}${pointsPerPlayer}'), array(
      'resultLog' => $checkSuccessful ? [
        'log' => clienttranslate('The ${tkn_coalitionName} ${tkn_coalition} coalition is dominant. The Dominance Check is successful.'),
        'args' => [
          'tkn_coalition' => $coalition,
          'tkn_coalitionName' => $coalition,
        ]
      ] : [
        'log' => clienttranslate('There is no dominant coalition. The Dominance Check is unsuccessful.'),
        'args' => []
      ],
      'scores' => $scores,
      // 'successful' => $checkSuccessful,
      // 'moves' => $moves,
      'tkn_newLine' => '<br>',
      'pointsPerPlayer' => [
        'log' => implode('', $logs),
        'args' => $args
      ]
    ));
  }

  public static function dominanceCheckReturnCoalitionBlocks($blocks, $fromLocations)
  {
    self::notifyAll("dominanceCheckReturnCoalitionBlocks", clienttranslate('All coalition blocks are removed from the board'), [
      'blocks' => $blocks,
      'fromLocations' => $fromLocations,
    ]);
  }

  public static function insurrection($player)
  {
    self::notifyAll("insurrectionSpecialAbility", clienttranslate('${tkn_playerName} uses Insurrection special ability'), [
      'player' => $player,
    ]);
  }

  public static function placeArmy($player, $tokenId, $coalition, $regionId, $from, $to)
  {
    $message = clienttranslate('${tkn_playerName} places ${tkn_army} in ${tkn_regionName}');
    self::notifyAll('placeArmy', $message, [
      'player' => $player,
      'tkn_army' => $coalition.'_army',
      'tkn_regionName' => $regionId,
      'move' => [
        'from' => $from,
        'to' => $to,
        'tokenId' => $tokenId,
      ]
    ]);
  }

  public static function placeRoad($player, $tokenId, $coalition, $regionId0, $regionId1, $from, $to)
  {
    $message = clienttranslate('${tkn_playerName} places ${tkn_road} on the border between ${tkn_regionName_0} and ${tkn_regionName_1}');
    self::notifyAll('placeRoad', $message, [
      'player' => $player,
      'tkn_road' => $coalition.'_road',
      'tkn_regionName_0' => $regionId0,
      'tkn_regionName_1' => $regionId1,
      'move' => [
        'from' => $from,
        'to' => $to,
        'tokenId' => $tokenId,
      ]

    ]);
  }

  public static function setupLoyalty($player, $coalition)
  {
    self::notifyAll("changeLoyalty", clienttranslate('${tkn_playerName} sets loyalty to ${tkn_coalitionName} ${tkn_coalition}'), array(
      'player' => $player,
      'coalition' => $coalition,
      'tkn_coalitionName' => $coalition,
      'tkn_coalition' => $coalition,
      'i18n' => ['coalitionName'],
    ));
  }

  public static function moveCard($message, $messageArgs, $action, $move)
  {
    self::notifyAll(
      'moveCard',
      $message,
      array_merge($messageArgs, [
        'move' => $move,
        'action' => $action,
      ])
    );
  }

  public static function moveToken($message, $args)
  {
    self::notifyAll('moveToken', $message, $args);
  }

  public static function returnCoalitionBlock($player, $type, $coalition, $from, $blockId, $weight)
  {
    $message = $type === 'army' ? clienttranslate('${tkn_playerName} removes ${tkn_army}') : clienttranslate('${tkn_playerName} removes ${tkn_road}');
    self::notifyAll("returnCoalitionBlock", $message, [
      'player' => $player,
      'tkn_'.$type => $coalition.'_'.$type,
      'type' => $type,
      'coalition' => $coalition,
      'from' => $from,
      'blockId' => $blockId,
      'weight' => $weight
    ]);
  }

  public static function returnCylinder($player, $cylinderOwnerId, $from, $cylinderId, $weight, $messageType = 'remove')
  {
    $message = $messageType === 'remove' ?
      clienttranslate('${tkn_playerName} removes ${tkn_cylinder}') :
      clienttranslate('${tkn_playerName} returns gift ${tkn_cylinder}');

    self::notifyAll("returnCylinder", $message, [
      'player' => $player,
      'tkn_cylinder' => $cylinderOwnerId.'_cylinder',
      'from' => $from,
      'cylinderId' => $cylinderId,
      'weight' => $weight
    ]);
  }

  public static function returnAllSpies($player, $cardId, $spies)
  {
    $message =  clienttranslate('${tkn_playerName} returns ${returnedSpiesLog} to their owner\'s supply');
    $logs = [];
    $args = [];
    foreach ($spies as $playerId => $playerSpies) {
      // $playerId = explode("_", $move['tokenId'])[1];
      foreach ($playerSpies as $index => $spy) {
        $logs[] = '${tkn_cylinder_' . $playerId . $index . '}';
        $args['tkn_cylinder_' . $playerId . $index] = $playerId.'_cylinder';
      }
    }

    self::notifyAll("returnAllSpies", $message, array(
      'player' => $player,
      'cardId' => $cardId,
      'spies' => $spies,
      'returnedSpiesLog' => [
        'log' => implode('', $logs),
        'args' => $args
      ],
    ));
  }

  public static function declinePrize($cardId, $player)
  {
    $card = Cards::get($cardId);
    $message =  clienttranslate('${tkn_playerName} declines ${tkn_cardName} as a prize${tkn_newLine}${tkn_largeCard}');
    self::notifyAll("declinePrize", $message, array(
      'player' => $player,
      'tkn_cardName' => $card['name'],
      'tkn_largeCard' => $cardId,
      'tkn_newLine' => '<br>',
      'cardId' => $cardId,
    ));
  }

  public static function acceptPrize($cardId, $player)
  {
    $card = Cards::get($cardId);
    $message =  clienttranslate('${tkn_playerName} accepts ${tkn_cardName} as a prize${tkn_newLine}${tkn_largeCard}');
    self::notifyAll("acceptPrize", $message, array(
      'player' => $player,
      'tkn_cardName' => $card['name'],
      'tkn_largeCard' => $cardId,
      'tkn_newLine' => '<br>',
    ));
  }

  public static function takePrize($cardId, $player)
  {
    $card = Cards::get($cardId);
    self::notifyAll("takePrize", '', array(
      'player' => $player,
      'cardId' => $cardId,
    ));
  }

  public static function discardPatriots($player)
  {
    $message = clienttranslate('${tkn_playerName} discards patriots');

    self::notifyAll('discardPatriots', $message, [
      'player' => $player,
    ]);
  }

  public static function discardPrizes($prizes, $playerId)
  {
    $message = clienttranslate('${tkn_playerName} discards ${numberOfPrizes} prize(s)${tkn_newLine}${cardLog}');
    Notifications::log('prizes', $prizes);
    $logs = [];
    $args = [];
    foreach ($prizes as $index => $cardInfo) {
      $logs[] = '${tkn_largeCard_' . $index . '}';
      $args['tkn_largeCard_' . $index] = $cardInfo['id'];
    }
    self::notifyAll('discardPrizes', $message, [
      'prizes' => $prizes,
      'player' => PaxPamirPlayers::get($playerId),
      'tkn_newLine' => '<br>',
      'numberOfPrizes' => count($prizes),
      'cardLog' => [
        'log' => implode('', $logs),
        'args' => $args
      ]
    ]);
  }

  public static function discardMessage($card, $player, $from, $cardOwner = null)
  {
    $message = clienttranslate('${tkn_playerName} discards ${tkn_cardName} from hand${tkn_newLine}${tkn_largeCard}');
    if ($card['type'] === EVENT_CARD) {
      $message = clienttranslate('${tkn_playerName} discards event card${tkn_newLine}${tkn_largeCard}');
    }
    if ($from === COURT && $cardOwner !== null && $cardOwner->getId() !== $player->getId()) {
      $message = clienttranslate('${tkn_playerName} discards ${tkn_cardName} from ${tkn_playerName_2}\'s court${tkn_newLine}${tkn_largeCard}');
    } else if ($from === COURT) {
      $message = clienttranslate('${tkn_playerName} discards ${tkn_cardName} from court${tkn_newLine}${tkn_largeCard}');
    }

    self::notifyAll("discardMessage", $message, array(
      'player' => $player,
      'tkn_cardName' => $card['type'] === EVENT_CARD ? '' : $card['name'],
      'tkn_largeCard' => $card['id'],
      'tkn_playerName_2' => $cardOwner === null ? '' : $cardOwner->getName(),
      'cardId' => $card['id'],
      'tkn_newLine' => '<br>',
    ));
  }
  

  public static function discard($card, $player, $from, $to)
  {
    self::notifyAll("discard", '', array(
      'player' => $player,
      'cardId' => $card['id'],
      'from' => $from,
      'to' => $to,
    ));
  }

  public static function discardEventCard($card, $player, $from, $to)
  {
    self::notifyAll("discard", '', array(
      'player' => $player,
      'cardId' => $card['id'],
      'from' => $from,
      'to' => $to,
    ));
  }

  public static function discardEventCardFromMarket($card, $location, $to)
  {

    self::notifyAll("discardFromMarket", clienttranslate('${tkn_playerName} discards event card from the market:${tkn_newLine}${tkn_largeCard}'), array(
      'player' => PaxPamirPlayers::get(),
      'cardId' => $card['id'],
      'from' => $location,
      'to' => $to,
      'tkn_largeCard' => $card['id'],
      'tkn_newLine' => '<br>',
    ));
  }

  public static function acceptBribe($player, $amount)
  {
    self::notifyAll("acceptBribe", clienttranslate('${tkn_playerName} accepts bribe of ${rupees} rupee(s)'), array(
      'player' => $player,
      'rupees' => $amount,
    ));
  }

  public static function takeRupeesFromSupply($player, $amount)
  {
    self::notifyAll("takeRupeesFromSupply", clienttranslate('${tkn_playerName} takes ${amount} ${tkn_rupee} from the bank'), array(
      'player' => $player,
      'amount' => $amount,
      'tkn_rupee' => 'rupee(s)',
    ));
  }

  public static function cancelBribe()
  {
    self::notifyAll("declineBribe", clienttranslate('${tkn_playerName} chooses not to pay bribe and perform a different action'), array(
      'player' => PaxPamirPlayers::get(),
    ));
  }

  public static function declineBribe($rupees)
  {
    self::notifyAll("declineBribe", clienttranslate('${tkn_playerName} declines bribe of ${rupees} rupee(s)'), array(
      'player' => PaxPamirPlayers::get(),
      'rupees' => $rupees,
    ));
  }

  public static function leveragedCardPlay($player, $amount)
  {
    self::notifyAll("takeRupeesFromSupply", clienttranslate('${tkn_playerName} gets ${amount} ${tkn_rupee} for ${tkn_leverage}'), array(
      'player' => $player,
      'amount' => $amount,
      'tkn_rupee' => 'rupee(s)',
      'tkn_leverage' => 'leverage',
    ));
  }

  public static function returnRupeesForDiscardingLeveragedCard($player, $amount)
  {
    self::notifyAll("returnRupeesToSupply", clienttranslate('${tkn_playerName} returns ${amount} ${tkn_rupee} to the supply for ${tkn_leverage}'), array(
      'player' => $player,
      'amount' => $amount,
      'tkn_rupee' => 'rupee(s)',
      'tkn_leverage' => 'leverage',
    ));
  }

  public static function additionalDiscardsForDiscardingLeveragedCard($player, $number)
  {
    self::notifyAll("additionalDiscardsLeverage", clienttranslate('${tkn_playerName} must discard ${number} ${tkn_cardIcon} for ${tkn_leverage}'), array(
      'player' => $player,
      'number' => $number,
      'tkn_cardIcon' => 'card(s)',
      'tkn_leverage' => 'leverage',
    ));
  }

  public static function leveragedDiscardRemaining($player)
  {
    self::notifyAll("leveragedDiscardRemaining", clienttranslate('${tkn_playerName} discards remaining cards due to ${tkn_leverage}'), array(
      'player' => $player,
      'tkn_leverage' => 'leverage',
    ));
  }

  public static function move($cardId, $player)
  {
    self::notifyAll("move", clienttranslate('${tkn_playerName} uses ${tkn_cardName} to move${tkn_newLine}${tkn_largeCard}'), array(
      'player' => $player,
      'tkn_cardName' => Cards::get($cardId)['name'],
      'tkn_largeCard' => $cardId,
      'tkn_newLine' => '<br>',
    ));
  }

  public static function startBribeNegotiation($player, $card,  $amount, $action)
  {
    $message =  $action === 'playCard' ?
      clienttranslate('${tkn_playerName} wants to play ${tkn_cardName} and offers bribe of ${amount} rupee(s)${tkn_newLine}${tkn_largeCard}') :
      clienttranslate('${tkn_playerName} wants to use ${tkn_cardName} to ${action} and offers bribe of ${amount} rupee(s)${tkn_newLine}${tkn_largeCard}');

    self::notifyAll("startBribeNegotiation", $message, [
      'player' => $player,
      'amount' => $amount,
      'tkn_cardName' => $card['name'],
      'action' => $action,
      'tkn_largeCard' => $card['id'],
      'tkn_newLine' => '<br>',
    ]);
  }

  public static function negotiateBribe($player, $amount, $isBribee)
  {
    $msg = $isBribee ? clienttranslate('${tkn_playerName} demands bribe of ${rupees} rupee(s)') : clienttranslate('${tkn_playerName} offers bribe of ${rupees} rupee(s)');
    self::notifyAll("proposeBribeAmount", $msg, array(
      'player' => $player,
      'rupees' => $amount,
    ));
  }

  public static function pass()
  {
    self::notifyAll("pass", clienttranslate('${tkn_playerName} passes'), array(
      'player' => PaxPamirPlayers::get(),
    ));
  }

  public static function payBribe($briberId, $rulerId, $rupees)
  {
    self::notifyAll("payBribe", clienttranslate('${tkn_playerName} pays ${rupees} ${tkn_rupee} to ${tkn_playerName_2}'), array(
      'player' => PaxPamirPlayers::get($briberId),
      'rulerId' => $rulerId,
      'briberId' => $briberId,
      'rupees' => $rupees,
      'tkn_playerName_2' => PaxPamirPlayers::get($rulerId)->getName(),
      'tkn_rupee' => 'rupee(s)',
    ));
  }

  public static function payRupeesToMarket($player, $rupeesOnCards)
  {
    self::notifyAll("payRupeesToMarket", '', [
      'player' => $player,
      'rupeesOnCards' => $rupeesOnCards,
    ]);
  }

  public static function placeGift($cylinderId, $player, $from, $to)
  {
    self::notifyAll('placeCylinder', '', [
      'player' => $player,
      'move' => [
        'from' => $from,
        'to' => $to,
        'tokenId' => $cylinderId,
      ]
    ]);
  }

  public static function placeSpy($cylinderId, $player, $cardId, $from, $to)
  {
    $message = clienttranslate('${tkn_playerName} places ${tkn_cylinder} on ${tkn_cardName}${tkn_newLine}${tkn_largeCard}');
    self::notifyAll('placeCylinder', $message, [
      'player' => $player,
      'tkn_largeCard' => $cardId,
      'tkn_cylinder' => PaxPamirPlayers::get()->getId().'_cylinder',
      'tkn_cardName' => Cards::get($cardId)['name'],
      'tkn_newLine' => '<br>',
      'move' => [
        'from' => $from,
        'to' => $to,
        'tokenId' => $cylinderId,
      ]
    ]);
  }

  public static function placeTribe($cylinderId, $player, $regionId, $from, $to)
  {
    $message = clienttranslate('${tkn_playerName} places ${tkn_cylinder} in ${tkn_regionName}');
    self::notifyAll('placeCylinder', $message, [
      'player' => $player,
      'tkn_cylinder' => $player->getId().'_cylinder',
      'tkn_regionName' => $regionId,
      'move' =>
      [
        'from' => $from,
        'to' => $to,
        'tokenId' => $cylinderId,
      ]

    ]);
  }


  public static function playCard($card, $firstCard, $side, $playerId)
  {
    // Minus 1 because $courtCards includes the card currently being played
    $message = $firstCard ? clienttranslate('${tkn_playerName} plays ${tkn_cardName} ${tkn_card} to his court') :
      clienttranslate('${tkn_playerName} plays ${tkn_cardName} ${tkn_card} to the ${side} end of his court');
    self::notifyAll("playCard", $message, array(
      'player' => PaxPamirPlayers::get($playerId),
      'card' => $card,
      'tkn_cardName' => $card['name'],
      'bribe' => false,
      'tkn_card' => $card['id'],
      'side' => $side === 'left' ? clienttranslate('left') : clienttranslate('right'),
      'i18n' => ['side'],
    ));
  }

  public static function publicWithdrawalEvent($location)
  {
    $message = clienttranslate('All ${tkn_rupee} on it are removed from the game');
    self::notifyAll("publicWithdrawal", $message, [
      'marketLocation' => $location,
      'tkn_rupee' => 'rupee(s)',
    ]);
  }

  public static function purchaseCard($card, $marketLocation, $newLocation, $receivedRupees, $rupeesOnCards)
  {
    $cardName = $card['type'] === COURT_CARD ? $card['name'] : $card['purchased']['title'];
    self::notifyAll("purchaseCard",  clienttranslate('${tkn_playerName} purchases ${tkn_cardName} from the market${tkn_newLine}${tkn_largeCard}'), array(
      'player' => PaxPamirPlayers::get(),
      'receivedRupees' => $receivedRupees,
      'card' => $card,
      'tkn_cardName' => $cardName,
      'tkn_largeCard' => $card['id'],
      'tkn_newLine' => '<br>',
      'marketLocation' => $marketLocation,
      'newLocation' => $newLocation,
      'rupeesOnCards' => $rupeesOnCards,
    ));
  }

  public static function purchaseGift($player, $value, $card)
  {
    self::notifyAll("purchaseGift", clienttranslate('${tkn_playerName} purchases a gift for ${value} ${tkn_rupee} with ${tkn_cardName}${tkn_newLine}${tkn_largeCard}'), array(
      'player' => $player,
      'value' => $value,
      'tkn_rupee' => 'rupee(s)',
      'tkn_largeCard' => $card['id'],
      'tkn_newLine' => '<br>',
      'tkn_cardName' => $card['name'],
    ));
  }

  public static function exchangeHandAllPlayers($player, $selectedPlayer, $newHandCounts)
  {
    self::notifyAll("exchangeHand", clienttranslate('${tkn_playerName} exchanges hand with ${tkn_playerName_2}'), [
      'tkn_playerName' => $player->getName(),
      'tkn_playerName_2' => $selectedPlayer->getName(),
      'newHandCounts' => $newHandCounts
    ]);
  }

  public static function replaceHand($player, $hand)
  {
    self::notify($player, 'replaceHand', '', [
      'player' => $player,
      'hand' => $hand,
    ]);
  }

  public static function returnAllToSupply($player, $message, $messageArgs, $regionId, $armies, $tribes)
  {
    self::notifyAll('returnAllToSupply', $message, array_merge(
      $messageArgs,
      [
        'player' => $player,
        'regionId' => $regionId,
        'armies' => $armies,
        'tribes' => $tribes
      ]
    ));
  }

  public static function tax($cardId, $player)
  {
    self::notifyAll("tax", clienttranslate('${tkn_playerName} taxes with ${tkn_cardName}${tkn_newLine}${tkn_largeCard}'), array(
      'player' => $player,
      'tkn_cardName' => Cards::get($cardId)['name'],
      'tkn_largeCard' => $cardId,
      'tkn_newLine' => '<br>',
    ));
  }

  public static function taxMarket($amount, $player, $selectedRupees)
  {
    self::notifyAll("taxMarket", clienttranslate('${tkn_playerName} takes ${amount} ${tkn_rupee} from the market'), array(
      'player' => $player,
      'amount' => $amount,
      'tkn_rupee' => 'rupee(s)',
      'selectedRupees' => $selectedRupees
    ));
  }

  public static function taxPlayer($amount, $player, $taxedPlayerId)
  {
    self::notifyAll("taxPlayer", clienttranslate('${tkn_playerName} takes ${amount} ${tkn_rupee} from ${tkn_playerName_2}'), array(
      'player' => $player,
      'amount' => $amount,
      'taxedPlayerId' => $taxedPlayerId,
      'tkn_rupee' => 'rupee(s)',
      'tkn_playerName_2' => PaxPamirPlayers::get($taxedPlayerId)->getName(),
    ));
  }

  public static function updateInfluence($updates)
  {
    self::notifyAll("updateInfluence", '', array(
      'updates' => $updates,
    ));
  }

  public static function wakhanDrawCard($deck, $discardPile)
  {
    self::notifyAll("wakhanDrawCard", clienttranslate('${tkn_playerName} draws a new AI card'), array(
      'tkn_playerName' => PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getName(),
      'deck' => $deck,
      'discardPile' => $discardPile,
    ));
  }

  public static function wakhanRadicalize($card, $type, $side, $rupeesOnCards, $receivedRupees, $marketLocation,$newLocation)
  {
    $messages = [
      'firstCourtCard' => clienttranslate('${tkn_playerName} radicalizes ${tkn_cardName} and plays it to her court ${tkn_newLine}${tkn_largeCard}'),
      'courtCard' => clienttranslate('${tkn_playerName} radicalizes ${tkn_cardName} and plays it to the ${side} end of her court ${tkn_newLine}${tkn_largeCard}'),
      'eventCard' => clienttranslate('${tkn_playerName} radicalizes ${tkn_cardName} ${tkn_newLine}${tkn_largeCard}'),
    ];
    $message = $messages[$type];
    $cardId = $card['id'];

    self::notifyAll("wakhanRadicalize", $message, array(
      'tkn_cardName' => $card['type'] === COURT_CARD ? $card['name'] : $card['purchased']['title'],
      'tkn_playerName' => PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getName(),
      'tkn_largeCard' => $cardId,
      'tkn_newLine' => '<br>',
      'marketLocation' => $marketLocation,
      'newLocation' => $newLocation,
      'card' => $card,
      'receivedRupees' => $receivedRupees,
      'rupeesOnCards' => $rupeesOnCards,
      'side' => $side === 'left' ? clienttranslate('left') : clienttranslate('right'),
      'i18n' => ['side'],
    ));
  }

  public static function wakhanRadicalizeDiscard($card, $rupeesOnCards, $receivedRupees, $marketLocation,$newLocation)
  {
    $message = clienttranslate('${tkn_playerName} radicalizes ${tkn_cardName} and discards it ${tkn_newLine}${tkn_largeCard}');
    $cardId = $card['id'];

    self::notifyAll("wakhanRadicalize", $message, array(
      'tkn_cardName' => $card['name'],
      'tkn_playerName' => PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getName(),
      'tkn_largeCard' => $cardId,
      'tkn_newLine' => '<br>',
      'marketLocation' => $marketLocation,
      'newLocation' => $newLocation,
      'card' => $card,
      'receivedRupees' => $receivedRupees,
      'rupeesOnCards' => $rupeesOnCards,
    ));
  }

  public static function wakhanReshuffleDeck($deck, $discardPile)
  {
    self::notifyAll("wakhanReshuffleDeck", clienttranslate('${tkn_playerName} reshuffles the AI cards, because the draw deck is empty'), array(
      'tkn_playerName' => PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getName(),
      'topOfDeck' => $deck,
      'topOfDiscardPile' => $discardPile,
    ));
  }

  public static function wakhanUpdatePragmaticLoyalty()
  {
    self::notifyAll("wakhanUpdatePragmaticLoyalty", '', array(
      'pragmaticLoyalty' => Wakhan::getPragmaticLoyalty(),
    ));
  }

  public static function wakhansAmbition()
  {
    Notifications::message(clienttranslate('${tkn_playerName}\'s Ambition triggers'),[
      'tkn_playerName' => PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getName(),
    ]);
  }

  /*********************
   **** UPDATE ARGS ****
   *********************/
  /*
   * Automatically adds some standard field about player and/or card
   */
  protected static function updateArgs(&$args)
  {
    if (isset($args['player'])) {
      $args['player_name'] = $args['player']->getName();
      $args['tkn_playerName'] = $args['player']->getName();
      $args['playerId'] = $args['player']->getId();
      unset($args['player']);
    }
    // if (isset($args['card'])) {
    //   $c = isset($args['card']) ? $args['card'] : $args['task'];
    //
    //   $args['value'] = $c['value'];
    //   $args['value_symbol'] = $c['value']; // The substitution will be done in JS format_string_recursive function
    //   $args['color'] = $c['color'];
    //   $args['color_symbol'] = $c['color']; // The substitution will be done in JS format_string_recursive function
    // }

    // if (isset($args['task'])) {
    //   $c = $args['task'];
    //   $args['task_desc'] = $c->getText();
    //   $args['i18n'][] = 'task_desc';
    //
    //   if (isset($args['player_id'])) {
    //     $args['task'] = $args['task']->jsonSerialize($args['task']->getPId() == $args['player_id']);
    //   }
    // }
  }
}
