<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Log;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;

trait PlayerActionMoveTrait
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

  function move($cardId, $moves)
  {
    self::checkAction('move');

    $cardInfo = Cards::get($cardId);
    $this->isValidCardAction($cardInfo, MOVE);
    Notifications::log('moves', $moves);

    $player = Players::get();

    /**
     * Validate moves
     */
    $totalMoves = 0;
    foreach ($moves as $pieceId => $pieceMoves) {
      $totalMoves += count($pieceMoves);

      // Validate all moves per piece
      if (Utils::isBlock($pieceId)) {
        $this->validateArmyMoves($pieceId, $pieceMoves, $player);
      } else if (Utils::isCylinder($pieceId) && !Utils::startsWith($pieceMoves[0]['from'], 'card')) {
        // Allowed tribe moved
        $this->validateTribeMoves($pieceId, $pieceMoves, $player);
      } else if (Utils::isCylinder($pieceId)) {
        $this->validateSpyMoves($pieceId, $pieceMoves, $player);
      }
    }
    // number of moves should not exceed rank
    if ($totalMoves > $cardInfo['rank']) {
      throw new \feException("More pieces to move than allowed by rank of card");
    }

    /**
     * Execute action
     */

    Cards::setUsed($cardId, 1);
    // if not free action reduce remaining actions.
    if (!$this->isCardFavoredSuit($cardInfo)) {
      Globals::incRemainingActions(-1);
    }
    Notifications::move($cardId, $player);

    foreach ($moves as $pieceId => $pieceMoves) {
      $numberOfMoves = count($pieceMoves);

      // Execute moves from start to destination
      // TODO: check if this might be too confusing
      $source = $pieceMoves[0]['from'];
      $destination = $pieceMoves[$numberOfMoves - 1]['to'];
      if (Utils::isBlock($pieceId)) {
        $from = 'armies_' . $source;
        $to = 'armies_' . $destination;
        $message = clienttranslate('${player_name} moves ${logTokenArmy} from ${logTokenRegionFrom} to ${logTokenRegionTo}');
        Notifications::moveToken($message, [
          'player' => $player,
          'moves' => [
            [
              'from' => $from,
              'to' => $to,
              'tokenId' => $pieceId,
            ]
          ],
          'logTokenArmy' => Utils::logTokenArmy(explode('_', $pieceId)[1]),
          'logTokenRegionFrom' => Utils::logTokenRegionName($source),
          'logTokenRegionTo' => Utils::logTokenRegionName($destination),
        ]);
      } else if (Utils::isCylinder($pieceId) && !Utils::startsWith($pieceMoves[0]['from'], 'card')) {

        $from = 'tribes_' . $source;
        $to = 'tribes_' . $destination;
        Notifications::log('locations', [
          'from' => $from,
          'to' => $to
        ]);
        $message = clienttranslate('${player_name} moves ${logTokenCylinder} from ${logTokenRegionFrom} to ${logTokenRegionTo}');
        Notifications::moveToken($message, [
          'player' => $player,
          'moves' => [
            [
              'from' => $from,
              'to' => $to,
              'tokenId' => $pieceId,
            ]
          ],
          'logTokenCylinder' => Utils::logTokenCylinder(explode('_', $pieceId)[1]),
          'logTokenRegionFrom' => Utils::logTokenRegionName($source),
          'logTokenRegionTo' => Utils::logTokenRegionName($destination),
        ]);
      } else if (Utils::isCylinder($pieceId)) {
        $from = 'spies_' . $source;
        $to = 'spies_' . $destination;
        $message = clienttranslate('${player_name} moves ${logTokenCylinder} from ${logTokenCardNameFrom} to ${logTokenCardNameTo}${logTokenNewLine}${logTokenLargeCardFrom}${logTokenLargeCardTo}');
        $cardFrom = Cards::get($source);
        $cardTo = Cards::get($destination);
        Notifications::moveToken($message, [
          'player' => $player,
          'moves' => [
            [
              'from' => $from,
              'to' => $to,
              'tokenId' => $pieceId,
            ]
          ],
          'logTokenCylinder' => Utils::logTokenCylinder(explode('_', $pieceId)[1]),
          'logTokenCardNameFrom' => Utils::logTokenCardName($cardFrom['name']),
          'logTokenCardNameTo' => Utils::logTokenCardName($cardTo['name']),
          'logTokenLargeCardFrom' => Utils::logTokenLargeCard($source),
          'logTokenLargeCardTo' => Utils::logTokenLargeCard($destination),
          'logTokenNewLine' => Utils::logTokenNewLine()
        ]);
      };
      Tokens::move($pieceId, $to);
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


  function validateArmyMoves($pieceId, $moves, $player)
  {
    $tokenInfo = Tokens::get($pieceId);
    $playerLoyalty = $player->getLoyalty();
    // Piece should be loyal to players coalition
    if ($playerLoyalty !== explode('_', $pieceId)[1]) {
      throw new \feException("Not allowed to move blocks from another coalition");
    }
    foreach ($moves as $index => $move) {
      // block should be in db location for first move or in destination of previous move
      if (($index === 0 && $tokenInfo['location'] !== 'armies_' . $move['from']) || ($index > 0 && $move['from'] !== $moves[$index - 1]['to'])) {
        throw new \feException("Army is not in the specified location");
      }
      // loyal road needed between regions
      $border = [$move['from'], $move['to']];
      sort($border);
      $border = implode('_', $border);
      if (!Map::borderHasRoadForCoalition($border, $playerLoyalty)) {
        throw new \feException("No road of same coalition on border");
      }
    }
  }

  function validateTribeMoves($pieceId, $moves, $player)
  {
    if (!Events::isNationalismActive($player)) {
      throw new \feException("Not allowed to move tribes");
    }

    $tokenInfo = Tokens::get($pieceId);
    $playerLoyalty = $player->getLoyalty();
    // Piece should be loyal to players coalition
    if (Utils::getPlayerIdForCylinderId($pieceId) !== $player->getId()) {
      throw new \feException("Not allowed to move tribe from another player");
    }
    foreach ($moves as $index => $move) {
      // block should be in db location for first move or in destination of previous move
      if (($index === 0 && $tokenInfo['location'] !== 'tribes_' . $move['from']) || ($index > 0 && $move['from'] !== $moves[$index - 1]['to'])) {
        throw new \feException("Tribe is not in the specified location");
      }
      // loyal road needed between regions
      $border = [$move['from'], $move['to']];
      sort($border);
      $border = implode('_', $border);
      if (!Map::borderHasRoadForCoalition($border, $playerLoyalty)) {
        throw new \feException("No road of same coalition on border");
      }
    }
  }

  function validateSpyMoves($pieceId, $moves, $player)
  {
    $tokenInfo = Tokens::get($pieceId);
    $playerId = $player->getId();
    // Spy should be owned by player
    if ($playerId !== intval(explode('_', $pieceId)[1])) {
      throw new \feException("Cylinder is not owned by player");
    };
    $player = Players::get();
    $hasStrangeBedfellowsAbility = $player->hasSpecialAbility(SA_STRANGE_BEDFELLOWS);
    $hasWellConnectedAbility = $player->hasSpecialAbility(SA_WELL_CONNECTED);
    $courtCards = $this->getAllCourtCardsOrdered();
    // Each move should be valid (spy should be at specified location and cards need to be adjacent)
    foreach ($moves as $index => $move) {
      // block should be in db location for first move or in destination of previous move
      if (($index === 0 && $tokenInfo['location'] !== 'spies_' . $move['from']) || ($index > 0 && $move['from'] !== $moves[$index - 1]['to'])) {
        throw new \feException("Spy is not in the specified location");
      };

      $adjacentCards = $this->getAdjacentCards($move['from'], $courtCards, $hasStrangeBedfellowsAbility);

      if ($hasWellConnectedAbility ) {
        $arrayCopy = $adjacentCards;
        foreach($arrayCopy as $index => $cardId) {
          $adjacentCards = array_merge($adjacentCards,$this->getAdjacentCards($cardId, $courtCards, $hasStrangeBedfellowsAbility));
        }
      };

      if (!in_array($move['to'], $adjacentCards)) {
        throw new \feException("Destination is not adjacent to current location");
      }
    }
  }

  function getAllCourtCardsOrdered()
  {
    $players = Players::getAll()->toArray();
    usort($players, function ($a, $b) {
      return $a->getNo() - $b->getNo();
    });
    $courtCards = [];
    foreach ($players as $index => $player) {
      $playerCourtCards = $player->getCourtCards();
      array_push($courtCards, ...$playerCourtCards);
    }
    return $courtCards;
  }

  function getAdjacentCards($cardId, $courtCards, $hasStrangeBedfellowsAbility)
  {
    $adjacentCards = [];

    $courtCardIds = array_map(function ($item) {
      return $item['id'];
    }, $courtCards);

    $index = array_search($cardId, $courtCardIds);

    // Previous card
    if ($index === 0) {
      $adjacentCards[] = $courtCardIds[count($courtCards) - 1];
    } else {
      $adjacentCards[] = $courtCardIds[$index - 1];
    }

    // Next card
    if ($index === count($courtCardIds) - 1) {
      $adjacentCards[] = $courtCardIds[0];
    } else {
      $adjacentCards[] = $courtCardIds[$index + 1];
    }

    // Strange Bedfellows cards
    if ($hasStrangeBedfellowsAbility) {
      $region = $courtCards[$index]['region'];
      foreach ($courtCards as $index => $courtCard) {
        if ($courtCard['region'] === $region) {
          $adjacentCards[] = $courtCard['id'];
        };
      }
    }

    return array_unique(Utils::filter($adjacentCards, function ($adjacentCardId) use ($cardId) {
      return $adjacentCardId !== $cardId;
    }));
  }
}
