<?php

namespace PaxPamir\Core;

use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Helpers\LogTokens;
use PaxPamir\Helpers\Utils;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\Wakhan;

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
    $message = clienttranslate('${tkn_playerName} battles on ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
    self::notifyAll('battle', $message, [
      'player' => PaxPamirPlayers::get(),
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ]);
  }

  public static function battleRegion($player,$regionId)
  {
    $message = clienttranslate('${tkn_playerName} battles in ${logTokenLocation}');
    self::notifyAll('battle', $message, [
      'player' => $player,
      'logTokenLocation' => Utils::logTokenRegionName($regionId),
    ]);
  }

  public static function betray($card, $player, $rupeesOnCards)
  {
    $message = clienttranslate('${tkn_playerName} betrays ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
    self::notifyAll('payRupeesToMarket', $message, [
      'player' => $player,
      'rupeesOnCards' => $rupeesOnCards,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ]);
  }

  public static function build($cardId, $player, $rupeesOnCards)
  {
    self::notifyAll("payRupeesToMarket", clienttranslate('${tkn_playerName} uses ${logTokenCardName} to build and pays ${numberOfRupees} ${logTokenRupee}${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => $player,
      'numberOfRupees' => count($rupeesOnCards),
      'rupeesOnCards' => $rupeesOnCards,
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenNewLine' => Utils::logTokenNewLine(),
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
    $message = clienttranslate('${tkn_playerName} changes favored suit to ${logTokenFavoredSuit}');
    $message = $customMessage ? $customMessage : $message;
    self::notifyAll('changeFavoredSuit', $message, [
      'player' => PaxPamirPlayers::get(),
      'logTokenFavoredSuit' => Utils::logFavoredSuit($newSuit),
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
    $coalition_name = Game::get()->loyalty[$coalition]['name'];
    self::notifyAll("changeLoyaltyMessage", clienttranslate('${tkn_playerName} changes loyalty to ${coalition_name} ${logTokenCoalition}'), array(
      'player' => PaxPamirPlayers::get(),
      'coalition_name' => $coalition_name,
      'logTokenCoalition' => Utils::logTokenCoalition($coalition),
    ));
  }

  public static function changeRuler($oldRuler, $newRuler, $region)
  {
    $msg = clienttranslate('${tkn_playerName} becomes ruler of ${logTokenRegionName}');
    if ($newRuler === null) {
      $msg = clienttranslate('${tkn_playerName} no longer rules ${logTokenRegionName}');
    }
    self::notifyAll('changeRuler', $msg, [
      'tkn_playerName' => PaxPamirPlayers::get($newRuler === null ? $oldRuler : $newRuler)->getName(),
      'oldRuler' => $oldRuler,
      'newRuler' => $newRuler,
      'logTokenRegionName' => Utils::logTokenRegionName($region),
      'region' => $region,
    ]);
  }

  public static function drawMarketCard($player, $cardId, $from, $to)
  {

    self::notifyAll("drawMarketCard", clienttranslate('${tkn_playerName} draws a new card for the market${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => $player,
      'cardId' => $cardId,
      'from' => $from,
      'to' => $to,
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
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
        'log' => clienttranslate('${tkn_playerName} scores ${points} victory point(s)${logTokenNewLine}'),
        'args' => [
          'tkn_playerName' => PaxPamirPlayers::get($playerId)->getName(),
          'logTokenNewLine' => Utils::logTokenNewLine(),
          'points' => $playerScore['newScore'] - $playerScore['currentScore']
        ]
      ];
    }

    self::notifyAll("dominanceCheckScores", clienttranslate('${resultLog}${logTokenNewLine}${logTokenNewLine}${pointsPerPlayer}'), array(
      'resultLog' => $checkSuccessful ? [
        'log' => clienttranslate('The ${logTokenCoalitionName} ${logTokenCoalition} coalition is dominant. The Dominance Check is successful.'),
        'args' => [
          'logTokenCoalition' => Utils::logTokenCoalition($coalition),
          'logTokenCoalitionName' => Utils::logTokenCoalitionName($coalition),
        ]
      ] : [
        'log' => clienttranslate('There is no dominant coalition. The Dominance Check is unsuccessful.'),
        'args' => []
      ],
      'scores' => $scores,
      // 'successful' => $checkSuccessful,
      // 'moves' => $moves,
      'logTokenNewLine' => Utils::logTokenNewLine(),
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
    $message = clienttranslate('${tkn_playerName} places ${logTokenArmy} in ${logTokenRegionName}');
    self::notifyAll('placeArmy', $message, [
      'player' => $player,
      'logTokenArmy' => Utils::logTokenArmy($coalition),
      'logTokenRegionName' => Utils::logTokenRegionName($regionId),
      'move' => [
        'from' => $from,
        'to' => $to,
        'tokenId' => $tokenId,
      ]
    ]);
  }

  public static function placeRoad($player, $tokenId, $coalition, $regionId0, $regionId1, $from, $to)
  {
    $message = clienttranslate('${tkn_playerName} places ${logTokenRoad} on the border between ${logTokenRegionName0} and ${logTokenRegionName1}');
    self::notifyAll('placeRoad', $message, [
      'player' => $player,
      'logTokenRoad' => Utils::logTokenRoad($coalition),
      'logTokenRegionName0' => Utils::logTokenRegionName($regionId0),
      'logTokenRegionName1' => Utils::logTokenRegionName($regionId1),
      'move' => [
        'from' => $from,
        'to' => $to,
        'tokenId' => $tokenId,
      ]

    ]);
  }

  public static function setupLoyalty($player, $coalition)
  {

    $coalitionName = Game::Get()->loyalty[$coalition]['name'];
    self::notifyAll("changeLoyalty", clienttranslate('${tkn_playerName} sets loyalty to ${coalitionName} ${logTokenCoalition}'), array(
      'player' => $player,
      'coalition' => $coalition,
      'coalitionName' => $coalitionName,
      'logTokenCoalition' => Utils::logTokenCoalition($coalition),
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

  public static function discardFromCourt($card, $player, $moves = [], $courtOwnerPlayerId = null)
  {
    $messageOwnCourt =  clienttranslate('${tkn_playerName} discards ${logTokenCardName} from court ${returnedSpiesLog}${logTokenNewLine}${logTokenLargeCard}');
    $messageOtherCourt =  clienttranslate('${tkn_playerName} discards ${logTokenCardName} from ${logTokenOtherPlayerName}\'s court ${returnedSpiesLog}${logTokenNewLine}${logTokenLargeCard}');
    $hasSpies = count($moves) > 0;
    $logs = [];
    $args = [];
    foreach ($moves as $index => $move) {
      $playerId = explode("_", $move['tokenId'])[1];
      $logs[] = '${logTokenCylinder' . $index . '}';
      $args['logTokenCylinder' . $index] = Utils::logTokenCylinder($playerId);
    }

    self::notifyAll("discardFromCourt", $courtOwnerPlayerId === null ? $messageOwnCourt : $messageOtherCourt, array(
      'player' => $player,
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'courtOwnerPlayerId' => $courtOwnerPlayerId === null ? $player->getId() : $courtOwnerPlayerId,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenOtherPlayerName' => $courtOwnerPlayerId === null ? '' : Utils::logTokenPlayerName($courtOwnerPlayerId),
      'cardId' => $card['id'],
      'moves' => $moves,
      'returnedSpiesLog' => $hasSpies ? [
        'log' => clienttranslate('and returns ${spies}'),
        'args' => [
          'spies' => [
            'log' => implode('', $logs),
            'args' => $args
          ]
        ],
      ] : '',
    ));
  }

  public static function returnCoalitionBlock($player, $type, $coalition, $from, $blockId, $weight)
  {
    $message = clienttranslate('${tkn_playerName} removes ${logTokenRemoved}');
    self::notifyAll("returnCoalitionBlock", $message, [
      'player' => $player,
      'logTokenRemoved' => implode(':', [$type, $coalition]),
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
      clienttranslate('${tkn_playerName} removes ${logTokenRemoved}') :
      clienttranslate('${tkn_playerName} returns gift ${logTokenRemoved}');

    self::notifyAll("returnCylinder", $message, [
      'player' => $player,
      'logTokenRemoved' => Utils::logTokenCylinder($cylinderOwnerId),
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
        $logs[] = '${logTokenCylinder' . $playerId . $index . '}';
        $args['logTokenCylinder' . $playerId . $index] = Utils::logTokenCylinder($playerId);
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
    $message =  clienttranslate('${tkn_playerName} declines ${logTokenCardName} as a prize${logTokenNewLine}${logTokenLargeCard}');
    self::notifyAll("declinePrize", $message, array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'cardId' => $cardId,
    ));
  }

  public static function acceptPrize($cardId, $player)
  {
    $card = Cards::get($cardId);
    $message =  clienttranslate('${tkn_playerName} accepts ${logTokenCardName} as a prize${logTokenNewLine}${logTokenLargeCard}');
    self::notifyAll("acceptPrize", $message, array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
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
    $message = clienttranslate('${tkn_playerName} discards ${numberOfPrizes} prize(s)${logTokenNewLine}${cardLog}');
    Notifications::log('prizes', $prizes);
    $logs = [];
    $args = [];
    foreach ($prizes as $index => $cardInfo) {
      $logs[] = '${logTokenLargeCard' . $index . '}';
      $args['logTokenLargeCard' . $index] = implode(':', ['largeCard', $cardInfo['id']]);
    }
    self::notifyAll('discardPrizes', $message, [
      'prizes' => $prizes,
      'player' => PaxPamirPlayers::get($playerId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'numberOfPrizes' => count($prizes),
      'cardLog' => [
        'log' => implode('', $logs),
        'args' => $args
      ]
    ]);
  }

  public static function discardMessage($card, $player, $from, $cardOwner = null)
  {
    $message = clienttranslate('${tkn_playerName} discards ${logTokenCardName} from hand${logTokenNewLine}${logTokenLargeCard}');
    if ($card['type'] === EVENT_CARD) {
      $message = clienttranslate('${tkn_playerName} discards event card${logTokenNewLine}${logTokenLargeCard}');
    }
    if ($from === COURT && $cardOwner !== null && $cardOwner->getId() !== $player->getId()) {
      $message = clienttranslate('${tkn_playerName} discards ${logTokenCardName} from ${logTokenOtherPlayerName}\'s court${logTokenNewLine}${logTokenLargeCard}');
    } else if ($from === COURT) {
      $message = clienttranslate('${tkn_playerName} discards ${logTokenCardName} from court${logTokenNewLine}${logTokenLargeCard}');
    }

    self::notifyAll("discardMessage", $message, array(
      'player' => $player,
      'logTokenCardName' => $card['type'] === EVENT_CARD ? '' : Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenOtherPlayerName' => $cardOwner === null ? '' : Utils::logTokenPlayerName($cardOwner->getId()),
      'cardId' => $card['id'],
      'logTokenNewLine' => Utils::logTokenNewLine(),
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

    self::notifyAll("discardFromMarket", clienttranslate('${tkn_playerName} discards event card from the market:${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => PaxPamirPlayers::get(),
      'cardId' => $card['id'],
      'from' => $location,
      'to' => $to,
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
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
    self::notifyAll("takeRupeesFromSupply", clienttranslate('${tkn_playerName} takes ${amount} ${logTokenRupee} from the bank'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenLeverage' => Utils::logTokenLeverage(),
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
    self::notifyAll("takeRupeesFromSupply", clienttranslate('${tkn_playerName} gets ${amount} ${logTokenRupee} for ${logTokenLeverage}'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function returnRupeesForDiscardingLeveragedCard($player, $amount)
  {
    self::notifyAll("returnRupeesToSupply", clienttranslate('${tkn_playerName} returns ${amount} ${logTokenRupee} to the supply for ${logTokenLeverage}'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function additionalDiscardsForDiscardingLeveragedCard($player, $number)
  {
    self::notifyAll("additionalDiscardsLeverage", clienttranslate('${tkn_playerName} must discard ${number} ${logTokenCardIcon} for ${logTokenLeverage}'), array(
      'player' => $player,
      'number' => $number,
      'logTokenCardIcon' => Utils::logTokenCardIcon(),
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function leveragedDiscardRemaining($player)
  {
    self::notifyAll("leveragedDiscardRemaining", clienttranslate('${tkn_playerName} discards remaining cards due to ${logTokenLeverage}'), array(
      'player' => $player,
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function move($cardId, $player)
  {
    self::notifyAll("move", clienttranslate('${tkn_playerName} uses ${logTokenCardName} to move${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine()
    ));
  }

  public static function startBribeNegotiation($player, $card,  $amount, $action)
  {
    $message =  $action === 'playCard' ?
      clienttranslate('${tkn_playerName} wants to play ${logTokenCardName} and offers bribe of ${amount} rupee(s)${logTokenNewLine}${logTokenLargeCard}') :
      clienttranslate('${tkn_playerName} wants to use ${logTokenCardName} to ${action} and offers bribe of ${amount} rupee(s)${logTokenNewLine}${logTokenLargeCard}');

    self::notifyAll("startBribeNegotiation", $message, [
      'player' => $player,
      'amount' => $amount,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'action' => $action,
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
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
    self::notifyAll("payBribe", clienttranslate('${tkn_playerName} pays ${rupees} rupee(s) to ${logTokenPlayerName}'), array(
      'player' => PaxPamirPlayers::get($briberId),
      'rulerId' => $rulerId,
      'briberId' => $briberId,
      'rupees' => $rupees,
      'logTokenPlayerName' => Utils::logTokenPlayerName($rulerId),
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
    $message = clienttranslate('${tkn_playerName} places ${logTokenCylinder} on ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
    self::notifyAll('placeCylinder', $message, [
      'player' => $player,
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenCylinder' => Utils::logTokenCylinder(PaxPamirPlayers::get()->getId()),
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'move' => [
        'from' => $from,
        'to' => $to,
        'tokenId' => $cylinderId,
      ]
    ]);
  }

  public static function placeTribe($cylinderId, $player, $regionId, $from, $to)
  {
    $message = clienttranslate('${tkn_playerName} places ${logTokenCylinder} in ${logTokenRegionName}');
    self::notifyAll('placeCylinder', $message, [
      'player' => $player,
      'logTokenCylinder' => Utils::logTokenCylinder($player->getId()),
      'logTokenRegionName' => Utils::logTokenRegionName($regionId),
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
    $message = $firstCard ? clienttranslate('${tkn_playerName} plays ${logTokenCardName} ${logTokenCard} to his court') :
      clienttranslate('${tkn_playerName} plays ${logTokenCardName} ${logTokenCard} to the ${side} end of his court');
    self::notifyAll("playCard", $message, array(
      'player' => PaxPamirPlayers::get($playerId),
      'card' => $card,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'bribe' => false,
      'logTokenCard' => Utils::logTokenCard($card['id']),
      'side' => $side === 'left' ? clienttranslate('left') : clienttranslate('right'),
      'i18n' => ['side'],
    ));
  }

  public static function publicWithdrawalEvent($location)
  {
    $message = clienttranslate('All ${logTokenRupee} on it are removed from the game');
    self::notifyAll("publicWithdrawal", $message, [
      'marketLocation' => $location,
      'logTokenRupee' => Utils::logTokenRupee(),
    ]);
  }

  public static function purchaseCard($card, $marketLocation, $newLocation, $receivedRupees, $rupeesOnCards)
  {
    $cardName = $card['type'] === COURT_CARD ? $card['name'] : $card['purchased']['title'];
    self::notifyAll("purchaseCard",  clienttranslate('${tkn_playerName} purchases ${logTokenCardName} from the market${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => PaxPamirPlayers::get(),
      'receivedRupees' => $receivedRupees,
      'card' => $card,
      'logTokenCardName' => Utils::logTokenCardName($cardName,),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'marketLocation' => $marketLocation,
      'newLocation' => $newLocation,
      'rupeesOnCards' => $rupeesOnCards,
    ));
  }

  public static function purchaseGift($player, $value)
  {
    self::notifyAll("purchaseGift", clienttranslate('${tkn_playerName} purchases a gift for ${value} rupees'), array(
      'player' => $player,
      'value' => $value,
      // 'rupeesOnCards' => $rupeesOnCards,
      // 'rupeeChange' => -$value,
      // 'influenceChange' => Events::isKohINoorRecoveredActive($player) ? 2 : 1,
      // 'tokenMove' => $move
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
    self::notifyAll("tax", clienttranslate('${tkn_playerName} taxes with ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ));
  }

  public static function taxMarket($amount, $player, $selectedRupees)
  {
    self::notifyAll("taxMarket", clienttranslate('${tkn_playerName} takes ${amount} ${logTokenRupee} from the market'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'selectedRupees' => $selectedRupees
    ));
  }

  public static function taxPlayer($amount, $player, $taxedPlayerId)
  {
    self::notifyAll("taxPlayer", clienttranslate('${tkn_playerName} takes ${amount} ${logTokenRupee} from ${logTokenPlayerName}'), array(
      'player' => $player,
      'amount' => $amount,
      'taxedPlayerId' => $taxedPlayerId,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenPlayerName' => Utils::logTokenPlayerName($taxedPlayerId)
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
    self::notifyAll("wakhanDrawCard", clienttranslate('${logTokenPlayerName} draws a new AI card'), array(
      'logTokenPlayerName' => Utils::logTokenPlayerName(1),
      'deck' => $deck,
      'discardPile' => $discardPile,
    ));
  }

  public static function wakhanRadicalize($card, $type, $side, $rupeesOnCards, $receivedRupees, $marketLocation,$newLocation)
  {
    $messages = [
      'firstCourtCard' => clienttranslate('${logTokenPlayerName} radicalizes ${logTokenCardName} and plays it to her court ${logTokenNewLine}${logTokenLargeCard}'),
      'courtCard' => clienttranslate('${logTokenPlayerName} radicalizes ${logTokenCardName} and plays it to the ${side} end of her court ${logTokenNewLine}${logTokenLargeCard}'),
      'eventCard' => clienttranslate('${logTokenPlayerName} radicalizes ${logTokenCardName} ${logTokenNewLine}${logTokenLargeCard}'),
    ];
    $message = $messages[$type];
    $cardId = $card['id'];

    self::notifyAll("wakhanRadicalize", $message, array(
      'logTokenCardName' => Utils::logTokenCardName($card['type'] === COURT_CARD ? $card['name'] : $card['purchased']['title']),
      'logTokenPlayerName' => Utils::logTokenPlayerName(WAKHAN_PLAYER_ID),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
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
    $message = clienttranslate('${logTokenPlayerName} radicalizes ${logTokenCardName} and discards it ${logTokenNewLine}${logTokenLargeCard}');
    $cardId = $card['id'];

    self::notifyAll("wakhanRadicalize", $message, array(
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenPlayerName' => Utils::logTokenPlayerName(WAKHAN_PLAYER_ID),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'marketLocation' => $marketLocation,
      'newLocation' => $newLocation,
      'card' => $card,
      'receivedRupees' => $receivedRupees,
      'rupeesOnCards' => $rupeesOnCards,
    ));
  }

  public static function wakhanReshuffleDeck($deck, $discardPile)
  {
    self::notifyAll("wakhanReshuffleDeck", clienttranslate('${logTokenPlayerName} reshuffles the AI cards, because the draw deck is empty'), array(
      'logTokenPlayerName' => Utils::logTokenPlayerName(1),
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
    Notifications::message(clienttranslate('${logTokenPlayerName}\'s Ambition triggers'),[
      'logTokenPlayerName' => Utils::logTokenPlayerName(WAKHAN_PLAYER_ID),
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
