<?php

trait PPStateArgsTrait
{

  //////////////////////////////////////////////////////////////////////////////
  //////////// Game state arguments
  ////////////

  /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */


  function argDiscardCourt()
  {
    $player_id = self::getActivePlayerId();
    $countPoliticalSuit = $this->getPlayerSuitsTotals($player_id)[POLITICAL];
    $countCourtCards = count($this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state'));

    return array(
      'numberOfDiscards' => $countCourtCards - $countPoliticalSuit - 3
    );
  }

  function argDiscardHand()
  {
    $player_id = self::getActivePlayerId();
    $countIntelligenceSuit = $this->getPlayerSuitsTotals($player_id)[INTELLIGENCE];
    $countHandCards = count($this->tokens->getTokensOfTypeInLocation('card', 'hand_' . $player_id, null, 'state'));

    return array(
      'numberOfDiscards' => $countHandCards - $countIntelligenceSuit - 2
    );
  }

  function argPlaceRoad()
  {
    $player_id = self::getActivePlayerId();
    $card_id = 'card_' . $this->getGameStateValue("resolve_impact_icons_card_id");
    $card_info = $this->cards[$card_id];
    $card_region = $card_info['region'];
    return array(
      'region' => $this->regions[$card_region],
    );
  }

  function argPlaceSpy()
  {
    $player_id = self::getActivePlayerId();
    $card_id = 'card_' . $this->getGameStateValue("resolve_impact_icons_card_id");
    $card_info = $this->cards[$card_id];
    $card_region = $card_info['region'];
    return array(
      'region' => $card_region,
    );
  }

  function argPlayerActions()
  {
    $player_id = self::getActivePlayerId();
    $current_player_id = self::getCurrentPlayerId();

    return array(
      'remaining_actions' => $this->getGameStateValue("remaining_actions"),
      'unavailable_cards' => $this->getUnavailableCards(),
      'hand' => $this->tokens->getTokensInLocation('hand_' . $current_player_id),
      'court' => $this->tokens->getTokensOfTypeInLocation('card', 'court_' . $player_id, null, 'state'),
      'suits' => $this->getPlayerSuitsTotals($player_id),
      'rulers' => $this->getAllRegionRulers(),
      'favored_suit' => $this->suits[$this->getGameStateValue('favored_suit')]['suit'],
      'rupees' => $this->getPlayerRupees($player_id),
    );
  }
}
