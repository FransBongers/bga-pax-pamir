<?php
namespace PaxPamir;

use PaxPamir\Managers\Cards;

class Market
{

  public static function setupNewGame($players, $options)
  {
    self::drawInitialMarketCards();
  }

  private function drawInitialMarketCards()
  {
    // Assign initial cards to market
    for ($i = 0; $i < 6; $i++) {
      Cards::pickForLocation(1, 'deck', 'market_0_' . $i);
      Cards::pickForLocation(1, 'deck', 'market_1_' . $i);
    }
  }
}
