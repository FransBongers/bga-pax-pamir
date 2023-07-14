<?php

namespace PaxPamir\Core;

use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Players;
use PaxPamir\Helpers\Utils;
use PaxPamir\Core\Globals;

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
    self::notify($player, 'smallRefreshHand', '', [
      'playerDatas' => $player->jsonSerialize($player->getId()),
    ]);
  }

  public static function clearTurn($player, $notifIds)
  {
    self::notifyAll('clearTurn', clienttranslate('${player_name} restarts his turn'), [
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
    $message = clienttranslate('${player_name} battles on ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
    self::notifyAll('battle', $message, [
      'player' => Players::get(),
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ]);
  }

  public static function battleRegion($regionId)
  {
    $message = clienttranslate('${player_name} battles in ${logTokenLocation}');
    self::notifyAll('battle', $message, [
      'player' => Players::get(),
      'logTokenLocation' => Utils::logTokenRegionName($regionId),
    ]);
  }

  public static function betray($card, $player, $rupeesOnCards)
  {
    $message = clienttranslate('${player_name} betrays ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
    self::notifyAll('betray', $message, [
      'player' => $player,
      'rupeesOnCards' => $rupeesOnCards,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ]);
  }

  public static function build($cardId, $player, $rupeesOnCards)
  {
    self::notifyAll("build", clienttranslate('${player_name} uses ${logTokenCardName} to build and pays ${numberOfRupees} ${logTokenRupee}${logTokenNewLine}${logTokenLargeCard}'), array(
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
    self::notifyAll("build", clienttranslate('${player_name} uses Infrastructure special ability'), [
      'player' => $player,
      'rupeesOnCards' => [],
    ]);
  }

  public static function changeFavoredSuit($previousSuit, $newSuit, $customMessage = null)
  {
    $message = clienttranslate('${player_name} changes favored suit to ${logTokenFavoredSuit}');
    $message = $customMessage ? $customMessage : $message;
    self::notifyAll('changeFavoredSuit', $message, [
      'player' => Players::get(),
      'logTokenFavoredSuit' => Utils::logFavoredSuit($newSuit),
      'from' => $previousSuit,
      'to' => $newSuit,
    ]);
  }

  public static function changeLoyalty($coalition)
  {
    $coalition_name = Game::get()->loyalty[$coalition]['name'];
    self::notifyAll("changeLoyalty", clienttranslate('${player_name} changes loyalty to ${coalition_name} ${logTokenCoalition}'), array(
      'player' => Players::get(),
      'coalition' => $coalition,
      'coalition_name' => $coalition_name,
      'logTokenCoalition' => Utils::logTokenCoalition($coalition),
    ));
  }

  public static function changeRuler($oldRuler, $newRuler, $region)
  {
    $msg = clienttranslate('${player_name} becomes ruler of ${logTokenRegionName}');
    if ($newRuler === null) {
      $msg = clienttranslate('${player_name} no longer rules ${logTokenRegionName}');
    }
    self::notifyAll('changeRuler', $msg, [
      'player_name' => Players::get($newRuler === null ? $oldRuler : $newRuler)->getName(),
      'oldRuler' => $oldRuler,
      'newRuler' => $newRuler,
      'logTokenRegionName' => Utils::logTokenRegionName($region),
      'region' => $region,
    ]);
  }

  public static function dominanceCheckResult($scores, $checkSuccessful, $coalition = null)
  {
    $logs = [];
    $args = [];
    foreach ($scores as $playerId => $playerScore) {
      // $playerId = explode("_", $move['tokenId'])[1];
      $logs[] = '${playerScore_' . $playerId . '}';
      $args['playerScore_' . $playerId] = [
        'log' => clienttranslate('${player_name} scores ${points} victory point(s)${logTokenNewLine}'),
        'args' => [
          'player_name' => Players::get($playerId)->getName(),
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

  public static function dominanceCheckReturnCoalitionBlocks($moves)
  {
    self::notifyAll("dominanceCheckReturnCoalitionBlocks", clienttranslate('All coalition blocks are removed from the board'), array(
      'moves' => $moves,
    ));
  }

  public static function moveCard($message, $messageArgs, $action, $moves)
  {
    self::notifyAll(
      'moveCard',
      $message,
      array_merge($messageArgs, [
        'moves' => $moves,
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
    $messageOwnCourt =  clienttranslate('${player_name} discards ${logTokenCardName} from court ${returnedSpiesLog}${logTokenNewLine}${logTokenLargeCard}');
    $messageOtherCourt =  clienttranslate('${player_name} discards ${logTokenCardName} from ${logTokenOtherPlayerName}\'s court ${returnedSpiesLog}${logTokenNewLine}${logTokenLargeCard}');
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

  public static function discardAndTakePrize($card, $player, $moves = [], $courtOwnerPlayerId = null)
  {
    $message =  clienttranslate('${player_name} takes ${logTokenCardName} as a prize ${returnedSpiesLog}${logTokenNewLine}${logTokenLargeCard}');
    $hasSpies = count($moves) > 0;
    $logs = [];
    $args = [];
    foreach ($moves as $index => $move) {
      $playerId = explode("_", $move['tokenId'])[1];
      $logs[] = '${logTokenCylinder' . $index . '}';
      $args['logTokenCylinder' . $index] = Utils::logTokenCylinder($playerId);
    }
    self::notifyAll("discardAndTakePrize", $message, array(
      'player' => $player,
      'courtOwnerPlayerId' => $courtOwnerPlayerId === null ? $player->getId() : $courtOwnerPlayerId,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
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

  public static function discardPatriots($player)
  {
    $message = clienttranslate('${player_name} discards patriots');

    self::notifyAll('discardPatriots', $message, [
      'player' => $player,
    ]);
  }

  public static function discardPrizes($prizes, $playerId)
  {
    $message = clienttranslate('${player_name} discards ${numberOfPrizes} prize(s)${logTokenNewLine}${cardLog}');
    Notifications::log('prizes', $prizes);
    $logs = [];
    $args = [];
    foreach ($prizes as $index => $cardInfo) {
      $logs[] = '${logTokenLargeCard' . $index . '}';
      $args['logTokenLargeCard' . $index] = implode(':', ['largeCard', $cardInfo['id']]);
    }
    self::notifyAll('discardPrizes', $message, [
      'prizes' => $prizes,
      'player' => Players::get($playerId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'numberOfPrizes' => count($prizes),
      'cardLog' => [
        'log' => implode('', $logs),
        'args' => $args
      ]
    ]);
  }

  public static function removeSpies($cardId, $spies, $moves)
  {
    $message = clienttranslate('${player_name} returns ${spiesLog} from ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
    $logs = [];
    $args = [];
    foreach ($spies as $index => $spy) {
      $playerId = explode("_", $spy['id'])[1];
      $logs[] = '${logTokenCylinder' . $index . '}';
      $args['logTokenCylinder' . $index] = Utils::logTokenCylinder($playerId);
    }

    // To check: we can probably combine both notifications in one?
    self::notifyAll('removeSpies', $message, array(
      'player' => Players::get(),
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'spiesLog' => [
        'log' => implode('', $logs),
        'args' => $args
      ],
    ));

    self::moveToken('', [
      'moves' => $moves
    ]);
  }

  public static function returnGifts($cylinders, $moves)
  {
    $message = clienttranslate('${player_name} returns gifts ${cylindersLog}');
    $logs = [];
    $args = [];
    foreach ($cylinders as $index => $cylinder) {
      $playerId = explode("_", $cylinder['id'])[1];
      $logs[] = '${logTokenCylinder' . $index . '}';
      $args['logTokenCylinder' . $index] = Utils::logTokenCylinder($playerId);
    }

    self::moveToken($message, [
      'moves' => $moves,
      'player' => Players::get(),
      'cylindersLog' => [
        'log' => implode('', $logs),
        'args' => $args
      ],
    ]);
  }

  public static function discardFromHand($card, $player)
  {
    $message = clienttranslate('${player_name} discards ${logTokenCardName} from hand${logTokenNewLine}${logTokenLargeCard}');

    self::notifyAll("discardFromHand", $message, array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'cardId' => $card['id'],
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ));
  }

  public static function discardEventCardFromMarket($card, $location, $to)
  {

    self::notifyAll("discardFromMarket", clienttranslate('${player_name} discards event card from the market:${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => Players::get(),
      'cardId' => $card['id'],
      'from' => $location,
      'to' => $to,
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ));
  }

  public static function acceptBribe($player, $amount)
  {
    self::notifyAll("acceptBribe", clienttranslate('${player_name} accepts bribe of ${rupees} rupee(s)'), array(
      'player' => $player,
      'rupees' => $amount,
    ));
  }

  public static function takeRupeesFromSupply($player, $amount)
  {
    self::notifyAll("takeRupeesFromSupply", clienttranslate('${player_name} takes ${amount} ${logTokenRupee} from the bank'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function cancelBribe()
  {
    self::notifyAll("declineBribe", clienttranslate('${player_name} chooses not to pay bribe and perform a different action'), array(
      'player' => Players::get(),
    ));
  }

  public static function declineBribe($rupees)
  {
    self::notifyAll("declineBribe", clienttranslate('${player_name} declines bribe of ${rupees} rupee(s)'), array(
      'player' => Players::get(),
      'rupees' => $rupees,
    ));
  }

  public static function leveragedCardPlay($player, $amount)
  {
    self::notifyAll("takeRupeesFromSupply", clienttranslate('${player_name} gets ${amount} ${logTokenRupee} for ${logTokenLeverage}'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function leveragedCardDiscard($card, $player, $amount)
  {
    self::notifyAll("returnRupeesToSupply", clienttranslate('${player_name} returns ${amount} ${logTokenRupee} to the supply because ${logTokenCardName} was leveraged${logTokenNewLine}${logTokenCardLarge}'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenCardLarge' => Utils::logTokenLargeCard($card['id']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ));
  }

  public static function leveragedDiscardRemaining($player)
  {
    self::notifyAll("leveragedDiscardRemaining", clienttranslate('${player_name} discards remaining cards due to ${logTokenLeverage}'), array(
      'player' => $player,
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function move($cardId, $player)
  {
    self::notifyAll("move", clienttranslate('${player_name} uses ${logTokenCardName} to move${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine()
    ));
  }

  public static function startBribeNegotiation($player, $card,  $amount, $action)
  {
    $message =  $action === 'playCard' ?
      clienttranslate('${player_name} wants to play ${logTokenCardName} and offers bribe of ${amount} rupee(s)${logTokenNewLine}${logTokenLargeCard}') :
      clienttranslate('${player_name} wants to use ${logTokenCardName} to ${action} and offers bribe of ${amount} rupee(s)${logTokenNewLine}${logTokenLargeCard}');

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
    $msg = $isBribee ? clienttranslate('${player_name} demands bribe of ${rupees} rupee(s)') : clienttranslate('${player_name} offers bribe of ${rupees} rupee(s)');
    self::notifyAll("proposeBribeAmount", $msg, array(
      'player' => $player,
      'rupees' => $amount,
    ));
  }

  public static function pass()
  {
    self::notifyAll("pass", clienttranslate('${player_name} passes'), array(
      'player' => Players::get(),
    ));
  }

  public static function payBribe($briberId, $rulerId, $rupees)
  {
    self::notifyAll("payBribe", clienttranslate('${player_name} pays ${rupees} rupee(s) to ${logTokenPlayerName}'), array(
      'player' => Players::get($briberId),
      'rulerId' => $rulerId,
      'briberId' => $briberId,
      'rupees' => $rupees,
      'logTokenPlayerName' => Utils::logTokenPlayerName($rulerId),
    ));
  }

  public static function playCard($card, $courtCards, $side, $playerId)
  {
    // Minus 1 because $courtCards includes the card currently being played
    $message = count($courtCards) - 1 === 0 ? clienttranslate('${player_name} plays ${logTokenCardName} ${logTokenCard} to his court') :
      clienttranslate('${player_name} plays ${logTokenCardName} ${logTokenCard} to the ${side} end of his court');
    self::notifyAll("playCard", $message, array(
      'player' => Players::get($playerId),
      'card' => $card,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'courtCards' => $courtCards,
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
    self::notifyAll("purchaseCard",  clienttranslate('${player_name} purchases ${logTokenCardName} from the market${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => Players::get(),
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

  public static function purchaseGift($player, $value, $move, $rupeesOnCards)
  {
    self::notifyAll("purchaseGift", clienttranslate('${player_name} purchases a gift for ${value} rupees'), array(
      'player' => $player,
      'value' => $value,
      'rupeesOnCards' => $rupeesOnCards,
      'rupeeChange' => -$value,
      'influenceChange' => Events::isKohINoorRecoveredActive($player) ? 2 : 1,
      'tokenMove' => $move
    ));
  }

  public static function exchangeHandAllPlayers($player, $selectedPlayer, $newHandCounts)
  {
    self::notifyAll("exchangeHand", clienttranslate('${player_name} exchanges hand with ${player_name2}'), [
      'player_name' => $player->getName(),
      'player_name2' => $selectedPlayer->getName(),
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

  public static function tax($cardId, $player)
  {
    self::notifyAll("tax", clienttranslate('${player_name} taxes with ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}'), array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenNewLine' => Utils::logTokenNewLine(),
    ));
  }

  public static function taxMarket($amount, $player, $selectedRupees)
  {
    self::notifyAll("taxMarket", clienttranslate('${player_name} takes ${amount} ${logTokenRupee} from the market'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'selectedRupees' => $selectedRupees
    ));
  }

  public static function taxPlayer($amount, $player, $taxedPlayerId)
  {
    self::notifyAll("taxPlayer", clienttranslate('${player_name} takes ${amount} ${logTokenRupee} from ${logTokenPlayerName}'), array(
      'player' => $player,
      'amount' => $amount,
      'taxedPlayerId' => $taxedPlayerId,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenPlayerName' => Utils::logTokenPlayerName($taxedPlayerId)
    ));
  }

  public static function updateCourtCardStates($cardStates, $playerId)
  {
    self::notifyAll("updateCourtCardStates", '', array(
      'playerId' => $playerId,
      'cardStates' => $cardStates,
    ));
  }

  public static function updateInfluence($updates)
  {
    self::notifyAll("updateInfluence", '', array(
      'updates' => $updates,
    ));
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
