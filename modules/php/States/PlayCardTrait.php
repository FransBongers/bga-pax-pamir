<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayCardTrait
{
  // ....###....########...######....######.
  // ...##.##...##.....##.##....##..##....##
  // ..##...##..##.....##.##........##......
  // .##.....##.########..##...####..######.
  // .#########.##...##...##....##........##
  // .##.....##.##....##..##....##..##....##
  // .##.....##.##.....##..######....######.

  function argNegotiateBribe()
  {
    $bribeState = Globals::getBribe();
    unset($bribeState['next']);
    unset($bribeState['side']);
    $bribeState['active'] = self::getActivePlayerId();
    return $bribeState;
  }

  // ..######......###....##.....##.########.....######..########....###....########.########
  // .##....##....##.##...###...###.##..........##....##....##......##.##......##....##......
  // .##.........##...##..####.####.##..........##..........##.....##...##.....##....##......
  // .##...####.##.....##.##.###.##.######.......######.....##....##.....##....##....######..
  // .##....##..#########.##.....##.##................##....##....#########....##....##......
  // .##....##..##.....##.##.....##.##..........##....##....##....##.....##....##....##......
  // ..######...##.....##.##.....##.########.....######.....##....##.....##....##....########

  function stNextPlayerNegotiateBribe()
  {
    $bribeState = Globals::getBribe();
    if ($bribeState['status'] == BRIBE_ACCEPTED) {
      $this->gamestate->changeActivePlayer($bribeState['next']);
      $playerId = $bribeState['briber'];
      $cardId = $bribeState['cardId'];
      $side = $bribeState['side'];
      Globals::setBribeClearLogs(true);
      $this->resolvePlayCard($playerId, $cardId, $side);
    } else if ($bribeState['status'] == BRIBE_DECLINED) {
      $this->gamestate->changeActivePlayer($bribeState['next']);
      Log::clearAll();
      $this->gamestate->nextState('playerActions');
      return;
    } else {
      $this->giveExtraTime($bribeState['next']);
      $this->gamestate->changeActivePlayer($bribeState['next']);
      Log::clearAll();
      $this->gamestate->nextState('negotiateBribe');
    }
  }

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
    $checkBribeResult = $this->checkBribe($card, $playerId);

    // active player has suggested partial bribe. Ruler of region needs to confirm or deny
    if ($checkBribeResult !== null && $checkBribeResult['amount'] > $bribe) {
      $ruler = $checkBribeResult['ruler'];
      $maxAmount = $checkBribeResult['amount'];
      Globals::setBribe([
        'briber' => intval($playerId),
        'cardId' => $cardId,
        'side' => $side,
        'maxAmount' => $maxAmount,
        'currentAmount' => $bribe,
        'declined' => [],
        'possible' => array_values(array_diff(range(0, $maxAmount), [$bribe])),
        'ruler' => $ruler,
        'next' => $ruler,
        'status' => BRIBE_UNRESOLVED,
      ]);
      $message = clienttranslate('${player_name} wants to play ${cardName} and offers bribe of ${bribeAmount} rupee(s) ${logTokenLargeCard}');

      self::notifyAllPlayers("initiateNegotiation", $message, array(
        'player_name' => self::getActivePlayerName(),
        'bribeAmount' => $bribe,
        'cardName' => $card['name'],
        'logTokenLargeCard' => Utils::logTokenLargeCard($card['id']),
      ));

      $this->gamestate->nextState('nextPlayerNegotiateBribe');
      return;
    } else if ($bribe > 0) {
      $this->payBribe($playerId, $checkBribeResult['ruler'], $bribe);
    }

    $this->resolvePlayCard($playerId, $cardId, $side);
  }

  function payBribe($briberId, $rulerId, $rupees)
  {
    Players::incRupees($rulerId, $rupees);
    Players::incRupees($briberId, -$rupees);
    Notifications::payBribe($briberId, $rulerId, $rupees);
  }


  function acceptBribe()
  {
    self::checkAction('acceptBribe');
    $bribeState = Globals::getBribe();
    $rulerId = $bribeState['ruler'];
    $briberId = $bribeState['briber'];
    $rupees = $bribeState['currentAmount'];
    if(Players::get($briberId)->getRupees() < $rupees) {
      throw new \feException("Not enough rupees available");
    }
    $bribeState['status'] = BRIBE_ACCEPTED;
    $bribeState['next'] = $bribeState['briber'];
    Globals::setBribe($bribeState);

    Notifications::acceptBribe($briberId, $rulerId, $rupees);
    Notifications::payBribe($briberId, $rulerId, $rupees);

    $this->gamestate->nextState('nextPlayerNegotiateBribe');
  }

  function declineBribe()
  {
    self::checkAction('declineBribe');

    $bribeState = Globals::getBribe();
    $bribeState['status'] = BRIBE_DECLINED;
    $bribeState['next'] = $bribeState['briber'];
    Globals::setBribe($bribeState);
    Notifications::declineBribe($bribeState['currentAmount']);

    $this->gamestate->nextState('nextPlayerNegotiateBribe');
  }

  function proposeBribeAmount($amount)
  {
    self::checkAction('proposeBribeAmount');

    $bribeState = Globals::getBribe();
    $isRuler = $bribeState['ruler'] == $bribeState['next'];
    $declinedAmount = $bribeState['currentAmount'];
    $bribeState['possible'] = array_values(array_diff($bribeState['possible'], [$declinedAmount]));
    $bribeState['declined'][] = $declinedAmount;
    $bribeState['currentAmount'] = intval($amount);
    $bribeState['next'] = $isRuler ? $bribeState['briber'] : $bribeState['ruler'];
    Globals::setBribe($bribeState);
    Notifications::proposeBribeAmount($bribeState['currentAmount'], $isRuler);
    $this->gamestate->nextState('nextPlayerNegotiateBribe');
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  function checkBribe($card, $playerId)
  {
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
      if ($cardLoyalty != null) {
        $this->checkAndHandleLoyaltyChange($cardLoyalty);
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
      Notifications::playCard($card,$courtCards,$side,$playerId);

      $this->updatePlayerCounts();

      Globals::setResolveImpactIconsCardId($cardId);
      Globals::setResolveImpactIconsCurrentIcon(0);
      $this->gamestate->nextState('resolveImpactIcons');
    }
  }

  /**
   * checks if coalition is different from current loyalty.
   * Handles any changes it it is.
   */
  function checkAndHandleLoyaltyChange($coalition)
  {

    $playerId = self::getActivePlayerId();
    $current_loyaly = Players::get()->getLoyalty();
    // check of loyalty needs to change. If it does not return
    if ($current_loyaly == $coalition) {
      return;
    }


    // TODO:
    // 1. Return gifts
    // 2. Discard prizes and patriots
    // 3. Update loyalty
    Players::get()->setLoyalty($coalition);

    // Notify
    $coalition_name = $this->loyalty[$coalition]['name'];
    self::notifyAllPlayers("chooseLoyalty", clienttranslate('${player_name} changes loyalty to ${coalition_name}'), array(
      'playerId' => $playerId,
      'player_name' => self::getActivePlayerName(),
      'coalition' => $coalition,
      'coalition_name' => $coalition_name
    ));
  }
}
