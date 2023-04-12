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

trait PlayerActionBattleTrait
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
  function battle($cardId, $location, $removedPieces)
  {
    self::checkAction('battle');
    self::dump("battle", $location);
    $cardInfo = Cards::get($cardId);
    $isBattleInRegion = !Utils::startsWith($location, "card");

    $this->isValidCardAction($cardInfo, BATTLE);

    // Should not remove more pieces than allowed by rank
    if (count($removedPieces) > $cardInfo['rank']) {
      throw new \feException("More pieces to remove than allowed by rank of card");
    }

    $player = Players::get();
    $loyalty = $player->getLoyalty();
    $loyalPieces = $this->getLoyalPiecesInLocation($player, $location);
    // Needs loyal pieces to remove enemy pieces
    Notifications::log('battle debug', [$loyalPieces,$removedPieces]);
    if (count($loyalPieces) < count($removedPieces)) {
      throw new \feException("Not enough loyal pieces");
    }

    foreach ($removedPieces as $index => $tokenId) {
      $splitTokenId = explode("_", $tokenId);
      // enemy pieces may not have the same loyalty
      if (Utils::startsWith($tokenId, "block") && $splitTokenId[1] === $loyalty) {
        throw new \feException("Piece to remove has same loyalty as active player");
      };
      if ($isBattleInRegion && Utils::startsWith($tokenId, "cylinder") && Players::get($splitTokenId[1])->getLoyalty() === $loyalty) {
        throw new \feException("Piece to remove has same loyalty as active player");
      }
      $tokenInfo = Tokens::get($tokenId);
      $tokenLocation = $tokenInfo['location'];
      $explodedTokenLocation = explode("_", $tokenLocation);

      // enemy pieces should be in location of battle
      if ((Utils::startsWith($tokenLocation, "armies") || Utils::startsWith($tokenLocation, "tribes")) && $explodedTokenLocation[1] !== $location) {
        throw new \feException("Piece is not in the same region as the battle");
      }
      if (Utils::startsWith($tokenLocation, "roads") && !in_array($location, $this->borders[$explodedTokenLocation[1] . '_' . $explodedTokenLocation[2]]['regions'])) {
        throw new \feException("Piece is not on a border connected to the region of the battle");
      }
      if (Utils::startsWith($tokenLocation, "spies") && $tokenInfo['location'] !== 'spies_'.$location ) {
        throw new \feException("Piece is not on the same card as the battle");
      }
    };


    // All checks have been done. Execute battle

    Cards::setUsed($cardId, 1);
    // if not bonus action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardId)) {
      Globals::incRemainingActions(-1);
    }
    if ($isBattleInRegion) {
      Notifications::battleRegion($location);
    } else {
      Notifications::battleCard($location);
    }

    
    foreach ($removedPieces as $index => $tokenId) {
      $splitTokenId = explode("_", $tokenId);
      $tokenInfo = Tokens::get($tokenId);
      $from = $tokenInfo['location'];
      $to = '';
      $logTokenType = '';
      $logTokenData = '';
      if (Utils::startsWith($tokenId, "block")) {
        $to = implode('_', ['blocks', $splitTokenId[1]]);
        $logTokenData = $splitTokenId[1];
        if (Utils::startsWith($from, "armies")) {
          $logTokenType = 'army';
        }
        if (Utils::startsWith($from, "roads")) {
          $logTokenType = 'road';
        }
      };
      if (Utils::startsWith($tokenId, "cylinder")) {
        $to = implode('_', ['cylinders', $splitTokenId[1]]);
        $logTokenType = 'cylinder';
        $logTokenData = $splitTokenId[1];
      }
      $state = Tokens::insertOnTop($tokenId, $to);
      $message = clienttranslate('${player_name} removes ${logTokenRemoved}');


      Notifications::moveToken($message, [
        'player' => Players::get(),
        'logTokenRemoved' => implode(':', [$logTokenType, $logTokenData]),
        'moves' => [
          [
            'from' => $from,
            'to' => $to,
            'tokenId' => $tokenId,
            'weight' => $state,
          ]
        ]
      ]);
    };
    if ($isBattleInRegion) {
      Map::checkRulerChange($location);
    }
    $this->gamestate->nextState('playerActions');
  }



  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function getLoyalPiecesInLocation($player, $location)
  {
    // $locationInfo = explode("_", $location);
    if (Utils::startsWith($location, "card")) {
      $playerId = $player->getId();
      // Battle on card, get player tribes
      $spiesOnCard = Tokens::getInLocation(['spies', $location])->toArray();
      $loyalSpies = array_values(array_filter($spiesOnCard, function ($cylinder) use ($playerId) {
        return intval(explode("_", $cylinder['id'])[1]) === $playerId;
      }));
      return $loyalSpies;
    } else {
      $loyalty = $player->getLoyalty();
      // Battle in region, get coalition armies
      $armiesInLocation = Tokens::getInLocation(['armies', $location])->toArray();
      $loyalArmies = array_values(array_filter($armiesInLocation, function ($army) use ($loyalty) {
        return explode("_", $army['id'])[1] === $loyalty;
      }));
      return $loyalArmies;
    }
  }
}
