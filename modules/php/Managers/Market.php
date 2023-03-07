<?php

namespace PaxPamir\Managers;

use PaxPamir\Managers\Cards;

class Market
{

  public static function setupNewGame($players, $options)
  {
    self::drawInitialMarketCards();
  }

  /*
    Returns all data to setup map in frontend
  */
  public static function getUiData()
  {
    $data = [];
    // // Add information about all cards in the market.
    for ($i = 0; $i < 6; $i++) {
      $data['cards'][0][$i] = Cards::getInLocation('market_0_' . $i)->first();
      $data['cards'][1][$i] = Cards::getInLocation('market_1_' . $i)->first();
    }
    $data['rupees'] = array_values(array_filter(Tokens::getOfType('rupee'), function ($rupee) {
      return str_starts_with($rupee['location'], 'market');
    }));

    return $data;
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
