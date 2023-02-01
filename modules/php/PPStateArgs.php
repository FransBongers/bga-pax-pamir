<?php
namespace PaxPamir;

use PaxPamir\Core\Globals;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Players;

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
    $player = Players::get();
    $countPoliticalSuit = $player->getSuitTotals()[POLITICAL];
    $countCourtCards = count($player->getCourtCards());

    return array(
      'numberOfDiscards' => $countCourtCards - $countPoliticalSuit - 3
    );
  }

  function argDiscardHand()
  {
    $player = Players::get();
    $countIntelligenceSuit = $player->getSuitTotals()[INTELLIGENCE];
    $countHandCards = count($player->getHandCards());

    return array(
      'numberOfDiscards' => $countHandCards - $countIntelligenceSuit - 2
    );
  }

  function argPlaceRoad()
  {
    $player_id = self::getActivePlayerId();
    $card_id = 'card_' . Globals::getResolveImpactIconsCardId();
    $card_info = $this->cards[$card_id];
    $card_region = $card_info['region'];
    return array(
      'region' => $this->regions[$card_region],
    );
  }

  function argPlaceSpy()
  {
    $player_id = self::getActivePlayerId();
    $card_id = 'card_' . Globals::getResolveImpactIconsCardId();
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
    $player = Players::get($player_id);
    return array(
      'remainingActions' => Globals::getRemainingActions(),
      'unavailableCards' => $this->getUnavailableCards(),
      'hand' => Cards::getInLocation(['hand',$current_player_id]),
      'court' => Cards::getInLocationOrdered(['court',$player_id])->toArray(),
      'suits' => $player->getSuitTotals(),
      'rulers' => $this->getAllRegionRulers(),
      'favoredSuit' => Globals::getFavoredSuit(),
      'rupees' => $player->getRupees(),
    );
  }
}
