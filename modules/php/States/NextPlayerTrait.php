<?php
namespace PaxPamir\States;

use PaxPamir\Core\Globals;

trait NextPlayerTrait
{
  function stNextPlayer()
  {
    $setup = Globals::getSetup();
    self::dump("setup in stNextPlayer", $setup);
    // Active next player
    if ($setup == 1) {
      // setup
      $player_id = self::activeNextPlayer();
      $loyalty = $this->getPlayerLoyalty($player_id);
      self::dump("loyalty in stNextPlayer", $loyalty == "null");
      if ($this->getPlayerLoyalty($player_id) == null) {
        // choose next loyalty
        $this->giveExtraTime($player_id);

        $this->gamestate->nextState('setup');
      } else {
        // setup complete, go to player actions
        $player_id = self::activePrevPlayer();
        $this->giveExtraTime($player_id);

        Globals::setSetup(0);
        Globals::setRemainingActions(2);

        $this->gamestate->nextState('next_turn');
      }
    } else {
      // player turn
      $player_id = self::activeNextPlayer();

      Globals::setRemainingActions(2);
      $this->giveExtraTime($player_id);

      $this->gamestate->nextState('next_turn');
    }
  }
}
