<?php
namespace PaxPamir\States;

use PaxPamir\Core\Globals;
use PaxPamir\Managers\Players;

trait NextPlayerTrait
{
  function stNextPlayer()
  {
    $setup = Globals::getSetup();
    self::dump("setup in stNextPlayer", $setup);
    // Active next player
    if ($setup == 1) {
      // setup
      $playerId = self::activeNextPlayer();
      if (Players::get($playerId)->getLoyalty() == null) {
        // choose next loyalty
        $this->giveExtraTime($playerId);

        $this->gamestate->nextState('setup');
      } else {
        // setup complete, go to player actions
        $playerId = self::activePrevPlayer();
        $this->giveExtraTime($playerId);

        Globals::setSetup(0);

        $this->gamestate->nextState('prepareNextTurn');
      }
    } else {
      // player turn
      $playerId = self::activeNextPlayer();
      
      $this->giveExtraTime($playerId);

      $this->gamestate->nextState('prepareNextTurn');
    }
  }
}
