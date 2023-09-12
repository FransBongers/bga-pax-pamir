<?php

namespace PaxPamir\States;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Core\Notifications;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\Cards;
use PaxPamir\Managers\Events;
use PaxPamir\Managers\Map;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Players;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;

trait WakhanDiscardTrait
{

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


  function wakhanDiscardCourtCards($numberToDiscard)
  {
    for ($i = 0; $i < $numberToDiscard; $i++) {
      $cardToDiscard = $this->wakhanDiscardSelect(PaxPamirPlayers::get(WAKHAN_PLAYER_ID)->getCourtCards());
      if ($cardToDiscard !== null) {
        $this->resolveDiscardCard($cardToDiscard, PaxPamirPlayers::get(WAKHAN_PLAYER_ID), COURT, DISCARD);
      }
    }
  }

  /**
   * Discard priority:
   * 1. Non-political cards
   * 2. Non-patriots
   * 3. Non-leveraged cards
   * 4. Most player spies more than Wakhan spies
   * 5. Fewest spies
   * 6. Lowest rank
   * 7. Not matching favored suit
   * 8. Lowest card number.
   */
  function wakhanDiscardSelect($cards)
  {
    $current = $cards;

    if (count($current) === 1) {
      return $current[0];
    }

    for ($i = 1; $i <= 8; $i++) {
      $filtered = [];
      switch ($i) {
        case 1:
          $filtered = Utils::filter($current, function ($card) {
            return $card['suit'] !== POLITICAL;
          });
          break;
        case 2:
          $filtered = Utils::filter($current, function ($card) {
            return $card['loyalty'] === null;
          });
          break;
        case 3:
          $filtered = Utils::filter($current, function ($card) {
            return !in_array(LEVERAGE, $card['impactIcons']);
          });
          break;
        case 4:
          $filtered = $this->wakhanDiscardFilterMostSpiesMoreThanWakhanSpies($current);
          break;
        case 5:
          $filtered = $this->wakhanDiscardFilterFewestSpies($current);
          break;
        case 6:
          $filtered = $this->wakhanDiscardFilterLowestRank($current);
          break;
        case 7: 
          $favoredSuit = Globals::getFavoredSuit();
          $filtered = Utils::filter($current, function ($card) use ($favoredSuit) {
            return $card['suit'] !== $favoredSuit;
          });
          break;
        case 8:
          $filtered = $this->wakhanDiscardLowestCardNumber($current);
      }

      if (count($filtered) === 1) {
        return $filtered[0];
      } else if (count($filtered) > 1) {
        $current = $filtered;
      }
    }

    return null;
  }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanDiscardFilterFewestSpies($current)
  {
    $numberOfSpiesPerCard = [];
    $numberOfSpies = [];

    foreach($current as $index => $card) {
      $spyCount = count(Tokens::getInLocation(Locations::spies($card['id']))->toArray());
      $numberOfSpiesPerCard[$card['id']] = $spyCount;
      $numberOfSpies[] = $spyCount;
    }

    $fewest = min($numberOfSpies);

    return Utils::filter($current, function ($card) use ($fewest, $numberOfSpiesPerCard) {
      return $numberOfSpiesPerCard[$card['id']] === $fewest;
    });
  }

  function wakhanDiscardFilterLowestRank($current)
  {
    $lowestRank = min(array_map(function ($card) {
      return $card['rank'];
    }, $current));

    return Utils::filter($current, function ($card) use ($lowestRank) {
      return $card['rank'] === $lowestRank;
    });
  }


  function wakhanDiscardFilterMostSpiesMoreThanWakhanSpies($current)
  {
    $spyDifferencePerCard = [];
    $spyDifference = [];

    foreach($current as $index => $card) {
      $spies = Tokens::getInLocation(Locations::spies($card['id']))->toArray();
      $numberOfWakhanSpies = count(Utils::filter($spies, function ($spy) {
        return explode('_',$spy['id'])[1] === '1';
      }));
      $numberOfOtherPlayerSpies = count($spies) - $numberOfWakhanSpies;
      $spiesMoreThanWakhanSpies = $numberOfOtherPlayerSpies - $numberOfWakhanSpies;
      $spyDifferencePerCard[$card['id']] = $spiesMoreThanWakhanSpies;
      $spyDifference[] = $spiesMoreThanWakhanSpies;
    }

    $mostMore = max($spyDifference);

    return Utils::filter($current, function ($card) use ($mostMore, $spyDifferencePerCard) {
      return $spyDifferencePerCard[$card['id']] === $mostMore;
    });
  }

  function wakhanDiscardLowestCardNumber($current)
  {
    usort($current, function ($a, $b) {
      return intval(explode('_',$a['id'])[1]) - intval(explode('_',$b['id'])[1]);
    });
    return [$current[0]];
  }
}
