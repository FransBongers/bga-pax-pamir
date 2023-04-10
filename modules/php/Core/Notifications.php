<?php

namespace PaxPamir\Core;

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

  public static function battleRegion($regionId)
  {
    $message = clienttranslate('${player_name} battles in ${logTokenLocation}');
    self::notifyAll('battle', $message, [
      'player' => Players::get(),
      'logTokenLocation' => implode(':', ['regionName', $regionId]),
    ]);
  }

  public static function changeFavoredSuit($previousSuit, $newSuit)
  {
    $message = clienttranslate('${player_name} changes favored suit to ${logTokenFavoredSuit}');
    self::notifyAll('changeFavoredSuit', $message, [
      'player' => Players::get(),
      'logTokenFavoredSuit' => implode(':', ['favoredSuit', $newSuit]),
      'from' => $previousSuit,
      'to' => $newSuit,
    ]);
  }

  public static function changeRuler($oldRuler, $newRuler, $region)
  {
    $msg = clienttranslate('${player_name} becomes ruler of ${region}');
    if ($newRuler === null) {
      $msg = clienttranslate('${player_name} is no longer ruler of ${region}');
    }
    self::notifyAll('changeRuler', $msg, [
      'player_name' => Players::get($newRuler === null ? $oldRuler : $newRuler)->getName(),
      'oldRuler' => $oldRuler,
      'newRuler' => $newRuler,
      'region' => ucfirst($region),
    ]);
  }

  public static function moveToken($message, $args)
  {
    self::notifyAll('moveToken', $message, $args);
  }

  public static function discardEventCardFromMarket($card, $location)
  {

    self::notifyAll("discardCard", clienttranslate('${player_name} discards event card from the market: ${logTokenLargeCard}'), array(
      'player' => Players::get(),
      'cardId' => $card['id'],
      'from' => $location,
      'logTokenLargeCard' => implode(':', ['largeCard', $card['id']]),
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
      'logTokenPlayerName' => implode(':', ['playerName', $rulerId,]),
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
      'logTokenCardName' => implode(':', ['cardName', $card['name']]),
      'courtCards' => $courtCards,
      'bribe' => false,
      'logTokenCard' => implode(':', ['card', $card['id']]),
      'side' => $side === 'left' ? clienttranslate('left') : clienttranslate('right')
    ));
  }

  public static function purchaseCard($card, $marketLocation, $newLocation, $receivedRupees, $rupeesOnCards)
  {
    $cardName = $card['type'] === COURT_CARD ? $card['name'] : $card['purchased']['title'];
    self::notifyAll("purchaseCard",  clienttranslate('${player_name} purchases ${logTokenCardName} ${logTokenLargeCard}'), array(
      'player' => Players::get(),
      'receivedRupees' => $receivedRupees,
      'card' => $card,
      'logTokenCardName' => implode(':', ['cardName', $cardName,]),
      'logTokenLargeCard' => implode(':', ['largeCard', $card['id']]),
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
