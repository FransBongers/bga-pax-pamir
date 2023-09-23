<?php

namespace PaxPamir\Helpers;

use PaxPamir\Core\Game;
use PaxPamir\Core\Globals;
use PaxPamir\Helpers\DominanceCheck;
use PaxPamir\Helpers\Locations;
use PaxPamir\Helpers\Utils;
use PaxPamir\Core\Notifications;
use PaxPamir\Managers\ActionStack;
use PaxPamir\Managers\PaxPamirPlayers;
use PaxPamir\Managers\Tokens;
use PaxPamir\Managers\WakhanCards;

class Wakhan
{
  public static function addPause()
  {
    ActionStack::push(ActionStack::createAction(DISPATCH_TRANSITION, PaxPamirPlayers::getPrevId(WAKHAN_PLAYER_ID), [
      'transition' => 'wakhanPause',
    ]));
  }

  public static function actionNotValid()
  {
    Globals::incWakhanActionsSkipped(1);
  }

  public static function actionValid()
  {
    Wakhan::addPause();
    Globals::setWakhanActionsSkipped(0);
  }

  /**
   * Returns order for borders for given region, based on regionOrder
   * of the revealed AI card.
   */
  public static function getBorderOrder($region)
  {
    $regionOrder = Wakhan::getRegionOrder();

    $borders = Game::get()->regions[$region]['borders'];
    $borderOrder = Utils::filter(array_map(function ($region2) use ($region) {
      return Utils::getBorderName($region2, $region);
    }, $regionOrder), function ($border) use ($borders) {
      return in_array($border, $borders);
    });
    return $borderOrder;
  }

  public static function getCoalitionBlockToPlace($loyalty)
  {
    $pool = Locations::pool($loyalty);

    $block = Tokens::getTopOf($pool);
    if ($block === null) {
      // Pool is empty. Select piece according to card order
      $block = Wakhan::selectBlockToPlace($loyalty);
    }
    return $block;
  }

  public static function getCylinderToPlace()
  {
    $pool = "cylinders_" . WAKHAN_PLAYER_ID;
    $cylinder = Tokens::getTopOf($pool);

    $front = WakhanCards::getTopOf(DISCARD);
    if ($cylinder === null) {
      $cylinder = Wakhan::selectCylinderToPlace();
    }
    return $cylinder;
  }


  public static function getOtherPlayerLoyalties()
  {
    $otherPlayers = Utils::filter(PaxPamirPlayers::getAll()->toArray(), function ($player) {
      return $player->getId() !== WAKHAN_PLAYER_ID;
    });
    $otherPlayerLoyalties = array_map(function ($player) {
      return $player->getLoyalty();
    }, $otherPlayers);
    return $otherPlayerLoyalties;
  }

  public static function getPragmaticLoyalty()
  {
    $pragmaticLoyalty = WakhanCards::getTopOf(DISCARD)['front']['pragmaticLoyalty'];
    $otherPlayerLoyalties = Wakhan::getOtherPlayerLoyalties();
    return Utils::filter($pragmaticLoyalty, function ($coalition) use ($otherPlayerLoyalties) {
      return !in_array($coalition, $otherPlayerLoyalties);
    })[0];
  }

  public static function getRegionOrder()
  {
    return WakhanCards::getTopOf(DISCARD)['front']['regionOrder'];
  }

  // Remove tribes first, then armies, then roads and then spies, in that order. Use the current AI card to decide between locations of Tribes,
  // Armies and Roads removed. For Spies, use card priority order.
  public static function selectBlockToPlace($loyalty)
  {
    $regionOrder = Wakhan::getRegionOrder();
    // Select army of possible
    foreach ($regionOrder as $index => $region) {
      $armies = Utils::filter(Tokens::getInLocation(Locations::armies($region))->toArray(), function ($block) use ($loyalty) {
        return explode('_', $block['id'])[1] === $loyalty && intval($block['used']) === 0;
      });
      if (count($armies) > 0) {
        return $armies[count($armies) - 1];
      }
    }
    // otherwise select road
    foreach ($regionOrder as $index => $region) {
      $borderOrder = Wakhan::getBorderOrder($region);

      foreach ($borderOrder as $index => $border) {
        $roads = Utils::filter(Tokens::getInLocation(Locations::roads($border))->toArray(), function ($block) use ($loyalty) {
          return explode('_', $block['id'])[1] === $loyalty && intval($block['used']) === 0;
        });
        if (count($roads) > 0) {
          return $roads[count($roads) - 1];
        }
      }
    }
  }

  // Remove tribes first, then armies, then roads and then spies, in that order. Use the current AI card to decide between locations of
  //  Tribes, Armies and Roads removed. For Spies, use card priority order.
  public static function selectCylinderToPlace()
  {

    $regionOrder = Wakhan::getRegionOrder();
    foreach ($regionOrder as $index => $region) {
      $tribes = Utils::filter(Tokens::getInLocation(Locations::tribes($region))->toArray(), function ($block) {
        return intval(explode('_', $block['id'])[1]) === WAKHAN_PLAYER_ID && intval($block['used']) === 0;
      });
      if (count($tribes) > 0) {
        return $tribes[count($tribes) - 1];
      }
    }

    $courtCards = PaxPamirPlayers::getAllCourtCardsOrdered();
    $cardsWithWakhanSpies = Utils::filter($courtCards, function ($card) {
      $spyOwnerIds = array_map(function ($spy) {
        return intval(explode('_', $spy['id'])[1]);
      }, Tokens::getInLocation(['spies', $card['id']])->toArray());
      return in_array(WAKHAN_PLAYER_ID, $spyOwnerIds);
    });
    $cardToRemoveSpyFrom = Wakhan::selectCard($cardsWithWakhanSpies);
    $spies = Tokens::getInLocation(['spies', $cardToRemoveSpyFrom['id']])->toArray();
    $wakhanSpies = Utils::filter($spies, function ($spy) {
      return intval(explode('_', $spy['id'])[1]) === WAKHAN_PLAYER_ID;
    });
    return $wakhanSpies[count($wakhanSpies) - 1];
  }

  // ..######..########.##.......########..######..########
  // .##....##.##.......##.......##.......##....##....##...
  // .##.......##.......##.......##.......##..........##...
  // ..######..######...##.......######...##..........##...
  // .......##.##.......##.......##.......##..........##...
  // .##....##.##.......##.......##.......##....##....##...
  // ..######..########.########.########..######.....##...

  // ..######.....###....########..########.
  // .##....##...##.##...##.....##.##.....##
  // .##........##...##..##.....##.##.....##
  // .##.......##.....##.########..##.....##
  // .##.......#########.##...##...##.....##
  // .##....##.##.....##.##....##..##.....##
  // ..######..##.....##.##.....##.########.


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
  public static function selectCard($cards)
  {
    if (count($cards) === 0) {
      return null;
    }
    if (count($cards) === 1) {
      return $cards[0];
    }

    $current = $cards;
    $dominantCoalition = DominanceCheck::getDominantCoalition();
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
          $filtered = Wakhan::filterHighestRank($current);
          break;
        case 8:
          $filtered = Wakhan::filterHighestCardNumber($current);
      }

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
  public static function selectCardToPlaceSpy($region)
  {
    $courtCards = PaxPamirPlayers::getAllCourtCardsOrdered();
    $cardsAssociatedWithRegion = Utils::filter($courtCards, function ($card) use ($region) {
      return $card['region'] === $region;
    });
    // Should always return at least 1 card, the card that was played to resolve the impact icon.
    if (count($cardsAssociatedWithRegion) === 1) {
      return $cardsAssociatedWithRegion[0];
    }

    // Filter cards where Wakhan does not have the most spies
    $otherPlayerIds = Wakhan::getOtherPlayerIds();

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
      return Wakhan::selectCard($cardsWhereWakhanDoesNotHaveMostSpies);
    } else {
      // no cards where wakhan does not have the most spies, so select from 
      // cards associated with region.
      return Wakhan::selectCard($cardsAssociatedWithRegion);
    }
  }

  public static function filterHighestRank($current)
  {
    $highestRank = max(array_map(function ($card) {
      return $card['rank'];
    }, $current));

    return Utils::filter($current, function ($card) use ($highestRank) {
      return $card['rank'] === $highestRank;
    });
  }

  public static function filterHighestCardNumber($current)
  {
    usort($current, function ($a, $b) {
      return intval(explode('_', $b['id'])[1]) - intval(explode('_', $a['id'])[1]);
    });
    return [$current[0]];
  }

  public static function getOtherPlayerIds()
  {
    return Utils::filter(PaxPamirPlayers::getAll()->getIds(), function ($id) {
      return $id !== WAKHAN_PLAYER_ID;
    });
  }
}
