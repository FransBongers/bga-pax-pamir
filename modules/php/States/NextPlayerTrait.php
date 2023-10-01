<?php
namespace PaxPamir\States;

use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Core\Stats;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;

trait NextPlayerTrait
{
  function stNextPlayer()
  {
      $nextPlayerId = PaxPamirPlayers::getNextId(PaxPamirPlayers::get());

      if ($nextPlayerId === WAKHAN_PLAYER_ID) {
        $this->nextState('wakhanTurn');
      } else {
        Globals::setWakhanActive(false);
        $this->giveExtraTime($nextPlayerId);
        Stats::incPlayerTurnCount($nextPlayerId,1);
        Stats::incTurnCount(1);
        $this->nextState('prepareNextTurn',$nextPlayerId);
      }
  }
}
