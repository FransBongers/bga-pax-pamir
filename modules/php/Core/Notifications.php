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
    self::notifyAll('clearTurn', clienttranslate('${player_name} restart their turn'), [
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

  public static function changeRuler($oldRuler, $newRuler, $region)
  {
    $msg = clienttranslate('${player_name} is the new ruler of ${region}');
    if ($newRuler === null) {
      $msg = clienttranslate('${player_name} is no longer ruler of ${region}');
    }
    self::notifyAll('changeRuler', $msg,[
      'player_name' => Players::get($newRuler === null ? $oldRuler : $newRuler)->getName(),
      'oldRuler' => $oldRuler,
      'newRuler' => $newRuler,
      'region' => ucfirst($region),
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

?>
