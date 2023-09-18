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

trait WakhanCardPriorityTrait
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

  /**
   * Used to select a court card in a players court
   * Card priority
   * 1. Opponent’s card
   * 2. Matches favored suit
   * 3. Patriot of the dominant coalition
   * 4. Has a prize that matches the dominant coalition.
   * 5. Other Patriot
   * 6. Leveraged
   * 7. Highest Ranking
   * 8. Highest numbered card
   */
  function wakhanSelectCard($cards)
  {
    $current = $cards;
    $dominantCoalition = $this->getDominantCoalition();
    for ($i = 1; $i <= 8; $i++) {
      $filtered = [];
      switch ($i) {
        case 1:
          $filtered = Utils::filter($current, function ($card) {
            return $card['location'] !== Locations::court(WAKHAN_PLAYER_ID);
          });
          break;
        case 2:
          $filtered = Utils::filter($current, function ($card) {
            return $card['suit'] === Globals::getFavoredSuit();
          });
          break;
        case 3:
          if ($dominantCoalition !== null) {
            $filtered = Utils::filter($current, function ($card) use ($dominantCoalition) {
              return $card['loyalty'] === $dominantCoalition;
            });
          }
          break;
        case 4:
          if ($dominantCoalition !== null) {
            $filtered = Utils::filter($current, function ($card) use ($dominantCoalition) {
              return $card['prize'] === $dominantCoalition;
            });
          }
          break;
        case 5:
          $filtered = Utils::filter($current, function ($card) {
            return $card['loyalty'] !== null;
          });
          break;
        case 6:
          $filtered = Utils::filter($current, function ($card) {
            return in_array(LEVERAGE, $card['impactIcons']);
          });
          break;
        case 7:
          $filtered = $this->wakhanFilterHighestRank($current);
          break;
        case 8:
          $filtered = $this->wakhanFilterHighestCardNumber($current);
      }
      Notifications::log('filtered ' . $i, $filtered);
      // if count is 0 we do not change current and continue to the next priority
      if (count($filtered) === 1) {
        return $filtered[0];
      } else if (count($filtered) > 1) {
        $current = $filtered;
      }
    }

    return null;
  }

  // Select the card to place a spy on when resolving impact icons.
  function wakhanSelectCardToPlaceSpy($region)
  {
    $courtCards = $this->getAllCourtCardsOrdered();
    $cardsAssociatedWithRegion = Utils::filter($courtCards, function ($card) use ($region) {
      return $card['region'] === $region;
    });
    // Should always return at least 1 card, the card that was played to resolve the impact icon.
    if (count($cardsAssociatedWithRegion) === 1) {
      return $cardsAssociatedWithRegion[0];
    }

    // Filter cards where Wakhan does not have the most spies
    $otherPlayerIds = $this->wakhanGetOtherPlayerIds();

    $cardsWhereWakhanDoesNotHaveMostSpies = Utils::filter($cardsAssociatedWithRegion, function ($card) use ($otherPlayerIds) {
      $spies = Tokens::getInLocation(['spies', $card['id']])->toArray();

      // calculate number of Wakhan Spies
      $numberOfWakhanSpies = count(Utils::filter($spies, function ($spy) {
        return intval(explode('_', $spy['id'])[1]) === WAKHAN_PLAYER_ID;
      }));

      // Check if there is a player with the same number or more spies
      return Utils::array_some($otherPlayerIds, function ($playerId) use ($spies, $numberOfWakhanSpies) {
        $numberOfPlayerSpies = count(Utils::filter($spies, function ($spy) use ($playerId) {
          return intval(explode('_', $spy['id'])[1]) === $playerId;
        }));
        return $numberOfPlayerSpies >= $numberOfWakhanSpies;
      });
    });

    if (count($cardsWhereWakhanDoesNotHaveMostSpies) === 1) {
      return $cardsAssociatedWithRegion[0];
    } else if (count($cardsWhereWakhanDoesNotHaveMostSpies) > 1) {
      // need to select a card from those that are left based on card priority
      return $this->wakhanSelectCard($cardsWhereWakhanDoesNotHaveMostSpies);
    } else {
      // no cards where wakhan does not have the most spies, so select from 
      // cards associated with region.
      return $this->wakhanSelectCard($cardsAssociatedWithRegion);
      
    }
  }

  // function wakhanDiscardFilterMostSpiesMoreThanWakhanSpies($current)
  // {
  //   $spyDifferencePerCard = [];
  //   $spyDifference = [];

  //   foreach($current as $index => $card) {
  //     $spies = Tokens::getInLocation(Locations::spies($card['id']))->toArray();
  //     $numberOfWakhanSpies = count(Utils::filter($spies, function ($spy) {
  //       return explode('_',$spy['id'])[1] === '1';
  //     }));
  //     $numberOfOtherPlayerSpies = count($spies) - $numberOfWakhanSpies;
  //     $spiesMoreThanWakhanSpies = $numberOfOtherPlayerSpies - $numberOfWakhanSpies;
  //     $spyDifferencePerCard[$card['id']] = $spiesMoreThanWakhanSpies;
  //     $spyDifference[] = $spiesMoreThanWakhanSpies;
  //   }

  //   $mostMore = max($spyDifference);

  //   return Utils::filter($current, function ($card) use ($mostMore, $spyDifferencePerCard) {
  //     return $spyDifferencePerCard[$card['id']] === $mostMore;
  //   });
  // }

  // .##.....##.########.####.##.......####.########.##....##
  // .##.....##....##.....##..##........##.....##.....##..##.
  // .##.....##....##.....##..##........##.....##......####..
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // .##.....##....##.....##..##........##.....##.......##...
  // ..#######.....##....####.########.####....##.......##...

  function wakhanFilterHighestRank($current)
  {
    $highestRank = max(array_map(function ($card) {
      return $card['rank'];
    }, $current));

    return Utils::filter($current, function ($card) use ($highestRank) {
      return $card['rank'] === $highestRank;
    });
  }

  function wakhanFilterHighestCardNumber($current)
  {
    usort($current, function ($a, $b) {
      return intval(explode('_', $b['id'])[1]) - intval(explode('_', $a['id'])[1]);
    });
    return [$current[0]];
  }

  function wakhanGetOtherPlayerIds() 
  {
    return Utils::filter(PaxPamirPlayers::getAll()->getIds(), function ($id) {
      return $id !== WAKHAN_PLAYER_ID;
    });
  }
}
