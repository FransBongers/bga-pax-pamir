<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Helpers\Wakhan;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;
use PaxPamir\Models\PaxPamirPlayer;

trait WakhanSpecialAbilitiesTrait
{

  // .########..####..######..########.....###....########..######..##.....##
  // .##.....##..##..##....##.##.....##...##.##......##....##....##.##.....##
  // .##.....##..##..##.......##.....##..##...##.....##....##.......##.....##
  // .##.....##..##...######..########..##.....##....##....##.......#########
  // .##.....##..##........##.##........#########....##....##.......##.....##
  // .##.....##..##..##....##.##........##.....##....##....##....##.##.....##
  // .########..####..######..##........##.....##....##.....######..##.....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.



  // .##......##....###....##....##.##.....##....###....##....##
  // .##..##..##...##.##...##...##..##.....##...##.##...###...##
  // .##..##..##..##...##..##..##...##.....##..##...##..####..##
  // .##..##..##.##.....##.#####....#########.##.....##.##.##.##
  // .##..##..##.#########.##..##...##.....##.#########.##..####
  // .##..##..##.##.....##.##...##..##.....##.##.....##.##...###
  // ..###..###..##.....##.##....##.##.....##.##.....##.##....##

  // ....###.....######..########.####..#######..##....##..######.
  // ...##.##...##....##....##.....##..##.....##.###...##.##....##
  // ..##...##..##..........##.....##..##.....##.####..##.##......
  // .##.....##.##..........##.....##..##.....##.##.##.##..######.
  // .#########.##..........##.....##..##.....##.##..####.......##
  // .##.....##.##....##....##.....##..##.....##.##...###.##....##
  // .##.....##..######.....##....####..#######..##....##..######.

  function wakhanSASafeHouse($actionStack) {
    $action = array_pop($actionStack);
    $data = $action['data'];

    $cylinderId = $data['cylinderId'];
    $fromCardId = $data['fromCardId'];

    $safeHouseCard = $this->wakhanGetSASafeHouseCourtCard();
    $cardId = $safeHouseCard['id'];

    $to = Locations::spies($cardId);
    $state = Tokens::insertOnTop($cylinderId, $to);
    $message = clienttranslate('${tkn_playerName} places ${logTokenCylinder} on ${logTokenCardName}${logTokenNewLine}${logTokenLargeCard}');
    Notifications::moveToken($message, [
      'player' => PaxPamirPlayers::get(WAKHAN_PLAYER_ID),
      'logTokenLargeCard' => Utils::logTokenLargeCard($cardId),
      'logTokenCylinder' => Utils::logTokenCylinder(WAKHAN_PLAYER_ID),
      'logTokenCardName' => Utils::logTokenCardName($safeHouseCard['name']),
      'logTokenNewLine' => Utils::logTokenNewLine(),
      'move' => [
        'from' => 'spies_'.$fromCardId,
        'to' => $to,
        'tokenId' => $cylinderId,
        'weight' => $state,
      ]
    ]);
    ActionStack::next($actionStack);
  }


  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanGetSASafeHouseCourtCard()
  {
    $courtCards = PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getCourtCards();
    $cardsWithSafeHouse = Utils::filter($courtCards, function ($card) {
      return $card['specialAbility'] === SA_SAFE_HOUSE;
    });
    return Wakhan::selectHighestPriorityCard($cardsWithSafeHouse);
  }

}
