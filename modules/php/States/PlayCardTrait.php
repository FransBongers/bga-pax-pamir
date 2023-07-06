<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayCardTrait
{
  //  .########..##..........###....##....##.########.########.
  //  .##.....##.##.........##.##....##..##..##.......##.....##
  //  .##.....##.##........##...##....####...##.......##.....##
  //  .########..##.......##.....##....##....######...########.
  //  .##........##.......#########....##....##.......##...##..
  //  .##........##.......##.....##....##....##.......##....##.
  //  .##........########.##.....##....##....########.##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.


  /**
   * Play card from hand to court
   */
  function playCard($cardId, $side = 'left', $bribe = 0)
  {
    //
    // play a card from hand into the court on either the left or right side
    //

    self::checkAction('playCard');

    $playerId = Players::getActiveId();
    $card = Cards::get($cardId);
    $bribe = intval($bribe);
    // Check if player owns card and card is in players hand
    // Check if player needs to pay bribe
    $checkBribeResult = $this->checkBribe($card, $playerId,$bribe);

    // active player has suggested partial bribe. Ruler of region needs to confirm or deny
    if ($checkBribeResult !== null && $checkBribeResult['amount'] > $bribe) {
      $ruler = $checkBribeResult['ruler'];
      $maxAmount = $checkBribeResult['amount'];
      Globals::setBribe([
        'briber' => [
          'playerId' => intval($playerId),
          'currentAmount' => $bribe,
        ],
        'bribee' => [
          'playerId' => $ruler,
        ],
        'ifAccepted' => [
          'action' => 'playCard',
          'cardId' => $cardId,
          'side' => $side,
        ],
        'maxAmount' => $maxAmount,
        
        // 'declined' => [],
        // 'possible' => array_values(array_diff(range(0, $maxAmount), [$bribe])),
        // 'next' => $ruler,
        // 'status' => BRIBE_UNRESOLVED,
      ]);
      $message = clienttranslate('${player_name} wants to play ${cardName} and offers bribe of ${bribeAmount} rupee(s)${logTokenNewLine}${logTokenLargeCard}');

      self::notifyAllPlayers("initiateNegotiation", $message, array(
        'player_name' => self::getActivePlayerName(),
        'bribeAmount' => $bribe,
        'cardName' => $card['name'],
        'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
        'logTokenNewLine' => Utils::logTokenNewLine(),
      ));

      $this->nextState('negotiateBribe',$ruler);
      return;
    } else if ($checkBribeResult !== null && $bribe > 0) {
      $this->payBribe($playerId, $checkBribeResult['ruler'], $bribe);
    }

    // TODO create separate state to resolve play card. First handle potential loyalty change.
    $this->resolvePlayCard($playerId, $cardId, $side);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  function checkBribe($card, $playerId,$bribe)
  {
    if (Events::isDisregardForCustomsActive()) {
      return null;
    };
    if (Events::isCourtlyMannersActive(Players::get()) && $bribe === 0) {
      return null;
    };
    if (Players::get()->hasSpecialAbility(SA_CHARISMATIC_COURTIERS)) {
      return null;
    }
    $rulers = Globals::getRulers();
    $region = $card['region'];
    self::dump("ruler", $rulers[$region]);
    if ($rulers[$region] !== null && $rulers[$region] !== $playerId) {
      $rulerTribes = array_filter(Tokens::getInLocation(['tribes', $region])->toArray(), function ($cylinder) use ($rulers, $region) {
        return explode('_', $cylinder['id'])[1] == $rulers[$region];
      });
      return [
        'ruler' => $rulers[$region],
        'amount' => count($rulerTribes)
      ];
    } else {
      return null;
    }
  }

  // TODO(Frans): move all playCard related code to separate Trait
  function resolvePlayCard($playerId, $cardId, $side)
  {
    $card = Cards::get($cardId);
    $courtCards = Cards::getInLocationOrdered(['court', $playerId])->toArray();

    if (Globals::getRemainingActions() > 0) {
      // check if loyaly change
      $cardLoyalty = $this->cards[$cardId]['loyalty'];
      if ($cardLoyalty != null ) {
        // TODO: fix loyalty change
        // $this->checkAndHandleLoyaltyChange($cardLoyalty);
      }

      // To check: we could probably just do 100 / +100 and then call reallign?
      if ($side === 'left') {
        for ($i = 0; $i < count($courtCards); $i++) {
          Cards::setState($courtCards[$i]['id'], $i + 2);
        }
        Cards::move($cardId, ['court', $playerId], 1);
      } else {
        Cards::move($cardId, ['court', $playerId], count($courtCards) + 1);
      }
      Globals::incRemainingActions(-1);
      // We need to fetch data again to get updated state
      $courtCards = Cards::getInLocationOrdered(['court', $playerId])->toArray();
      $card = Cards::get($cardId);
      Notifications::playCard($card, $courtCards, $side, $playerId);

      $this->updatePlayerCounts();

      Globals::setResolveImpactIconsCardId($cardId);
      Globals::setResolveImpactIconsCurrentIcon(0);
      $this->gamestate->nextState('resolveImpactIcons');
    }
  }

}
