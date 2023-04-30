<?php

namespace PaxPamir\Core;

use PaxPamir\Managers\Cards;
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
    $message = clienttranslate('${player_name} battles on ${logTokenCardName}${logTokenLargeCard}');
    self::notifyAll('battle', $message, [
      'player' => Players::get(),
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
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
    $message = clienttranslate('${player_name} betrays ${logTokenCardName}${logTokenLargeCard}');
    self::notifyAll('betray', $message, [
      'player' => $player,
      'rupeesOnCards' => $rupeesOnCards,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
    ]);
  }

  public static function changeFavoredSuit($previousSuit, $newSuit)
  {
    $message = clienttranslate('${player_name} changes favored suit to ${logTokenFavoredSuit}');
    self::notifyAll('changeFavoredSuit', $message, [
      'player' => Players::get(),
      'logTokenFavoredSuit' => Utils::logFavoredSuit($newSuit),
      'from' => $previousSuit,
      'to' => $newSuit,
    ]);
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

  public static function moveToken($message, $args)
  {
    self::notifyAll('moveToken', $message, $args);
  }

  public static function discardFromCourt($card,$player,$moves = [],$courtOwnerPlayerId = null)
  {
    $messageOwnCourt =  clienttranslate('${player_name} discards ${logTokenCardName} from court ${returnedSpiesLog}${logTokenLargeCard}');
    $messageOtherCourt =  clienttranslate('${player_name} discards ${logTokenCardName} from ${logTokenOtherPlayerName}\'s court ${returnedSpiesLog}${logTokenLargeCard}');
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

  public static function discardAndTakePrize($card,$player,$moves = [],$courtOwnerPlayerId = null)
  {
    $message =  clienttranslate('${player_name} takes ${logTokenCardName} as a prize ${returnedSpiesLog}${logTokenLargeCard}');
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

  public static function removeSpies($cardId, $spies, $moves)
  {
    $message = clienttranslate('${player_name} returns ${spiesLog} from ${logTokenCardName}${logTokenLargeCard}');
    $logs = [];
    $args = [];
    foreach ($spies as $index => $spy) {
      $playerId = explode("_", $spy['id'])[1];
      $logs[] = '${logTokenCylinder' . $index . '}';
      $args['logTokenCylinder' . $index] = Utils::logTokenCylinder($playerId);
    }

    self::notifyAll('removeSpies', $message, array(
      'player' => Players::get(),
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'spiesLog' => [
        'log' => implode('', $logs),
        'args' => $args
      ],
    ));

    self::moveToken('', [
      'moves' => $moves
    ]);
  }

  public static function discardFromHand($card, $player)
  {
    $message = clienttranslate('${player_name} discards ${logTokenCardName} from hand ${logTokenLargeCard}');

    self::notifyAll("discardFromHand", $message, array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      'cardId' => $card['id'],
    ));
  }

  public static function discardEventCardFromMarket($card, $location)
  {

    self::notifyAll("discardFromMarket", clienttranslate('${player_name} discards event card from the market: ${logTokenLargeCard}'), array(
      'player' => Players::get(),
      'cardId' => $card['id'],
      'from' => $location,
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
    ));
  }

  public static function acceptBribe($briberId, $rulerId, $rupees)
  {
    self::notifyAll("acceptBribe", clienttranslate('${player_name} accepts bribe of ${rupees} rupee(s)'), array(
      'player' => Players::get(),
      'rupees' => $rupees,
    ));
  }

  public static function declineBribe($rupees)
  {
    self::notifyAll("declineBribe", clienttranslate('${player_name} declines bribe of ${rupees} rupee(s)'), array(
      'player' => Players::get(),
      'rupees' => $rupees,
    ));
  }

  public static function leveragedCardPlay($player,$amount)
  {
    self::notifyAll("takeRupeesFromSupply", clienttranslate('${player_name} gets ${amount} ${logTokenRupee} for ${logTokenLeverage}'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function leveragedCardDiscard($card, $player,$amount)
  {
    self::notifyAll("returnRupeesToSupply", clienttranslate('${player_name} returns ${amount} ${logTokenRupee} to the supply because ${logTokenCardName} was leveraged ${logTokenCardLarge}'), array(
      'player' => $player,
      'amount' => $amount,
      'logTokenRupee' => Utils::logTokenRupee(),
      'logTokenCardName' => Utils::logTokenCardName($card['name']),
      'logTokenCardLarge' => Utils::logTokenLargeCard($card['id'])
    ));
  }

  public static function leveragedDiscardRemaining($player)
  {
    self::notifyAll("leveragedDiscardRemaining", clienttranslate('${player_name} discards remaining cards due to ${logTokenLeverage}'), array(
      'player' => $player,
      'logTokenLeverage' => Utils::logTokenLeverage(),
    ));
  }

  public static function proposeBribeAmount($rupees, $isRuler)
  {
    $msg = $isRuler ? clienttranslate('${player_name} demands bribe of ${rupees} rupee(s)') : clienttranslate('${player_name} offers bribe of ${rupees} rupee(s)');
    self::notifyAll("proposeBribeAmount", $msg, array(
      'player' => Players::get(),
      'rupees' => $rupees,
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
    self::notifyAll("payBribe", clienttranslate('${player_name} pays bribe of ${rupees} rupee(s) to ${logTokenPlayerName}'), array(
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
      clienttranslate('${player_name} plays ${logTokenCardName} ${logTokenCard} to the ${side} side of his court');
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

  public static function purchaseCard($card, $marketLocation, $newLocation, $receivedRupees, $rupeesOnCards)
  {
    $cardName = $card['type'] === COURT_CARD ? $card['name'] : $card['purchased']['title'];
    self::notifyAll("purchaseCard",  clienttranslate('${player_name} purchases ${logTokenCardName} from the market ${logTokenLargeCard}'), array(
      'player' => Players::get(),
      'receivedRupees' => $receivedRupees,
      'card' => $card,
      'logTokenCardName' => Utils::logTokenCardName($cardName,),
      'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
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
      'influenceChange' => 1,
      'tokenMove' => $move
    ));
  }

  public static function tax($cardId, $player)
  {
    self::notifyAll("tax", clienttranslate('${player_name} taxes with ${logTokenCardName}${logTokenLargeCard}'), array(
      'player' => $player,
      'logTokenCardName' => Utils::logTokenCardName(Cards::get($cardId)['name']),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
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
