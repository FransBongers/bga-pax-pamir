<?php

trait PPMarketTrait
{

  /**
   * Sets up market deck based on number of players
   */
  public function createMarketDeck(int $number_of_players)
  {
    // Add all cards to token module
    $this->tokens->createTokensPack("card_{INDEX}", COURT_CARD, 100);
    $this->tokens->createTokensPack("card_{INDEX}", DOMINANCE_CHECK_CARD, 4, 101);
    $this->tokens->createTokensPack("card_{INDEX}", EVENT_CARD, 12, 105);
    $this->tokens->shuffle(COURT_CARD);
    $this->tokens->shuffle(EVENT_CARD);

    // build market deck based on number of players
    for ($i = 6; $i >= 1; $i--) {
      $this->tokens->pickTokensForLocation($number_of_players + 5, COURT_CARD, 'pile');
      if ($i == 2) {
        $this->tokens->pickTokensForLocation(2, EVENT_CARD, 'pile');
      } elseif ($i > 2) {
        $this->tokens->pickTokensForLocation(1, EVENT_CARD, 'pile');
        $this->tokens->pickTokensForLocation(1, DOMINANCE_CHECK_CARD, 'pile');
      }
      $this->tokens->shuffle('pile');
      $pile = $this->tokens->getTokensInLocation('pile');
      $n_cards = $this->tokens->countTokensInLocation('deck');
      foreach ($pile as $id => $info) {
        $this->tokens->moveToken($id, 'deck', $info['state'] + $n_cards);
      }
    }
  }

  public function drawInitialMarketCards() {
            // Assign initial cards to market
            for ($i = 0; $i < 6; $i++) {
              $this->tokens->pickTokensForLocation(1, 'deck', 'market_0_'.$i);
              $this->tokens->pickTokensForLocation(1, 'deck', 'market_1_'.$i);
          }
  }
}
