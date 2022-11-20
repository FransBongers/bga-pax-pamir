<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaxPamirEditionTwo implementation : © Julien Coignet <breddabasse@hotmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * modules/php/Objects/PPCardFactory.php
 *
 */

namespace PPModules\PaxPamirEditionTwo\Factories;

use PPModules\PaxPamirEditionTwo\Objects\PPCard;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumCardType;

class PPCardFactory
{
    static public function createDominanceCheckCard(
        string $id
    ): PPCard
    {
        $card = new PPCard();
        $card->setId($id)
            ->setType(PPEnumCardType::DominanceCheck)
            ->setSuit(null)
            ->setRank(null)
            ->setName(null)
            ->setRegion(null)
            ->setSpecialAbility(null)
            ->setTaxAction(false)
            ->setGiftAction(false)
            ->setBuildAction(false)
            ->setMoveAction(false)
            ->setBetrayAction(false)
            ->setBattleAction(false)
            ->setLoyalty(null)
            ->setPrize(null)
            ->setImpactIcons(null)
            ->setDescription(null)
            ->setDiscardedEffect(null)
            ->setDiscardedDescription(null)
            ->setPurchasedEffect(null)
            ->setPurchasedDescription(null);

        return $card;
    }

    static public function createEventCard(
        string $id, string $discardedEffect, ?string $discardedDescription, string $purchasedEffect, string $purchasedDescription
    ): PPCard
    {
        $card = new PPCard();
        $card->setId($id)
            ->setType(PPEnumCardType::Event)
            ->setSuit(null)
            ->setRank(null)
            ->setName(null)
            ->setRegion(null)
            ->setSpecialAbility(null)
            ->setTaxAction(false)
            ->setGiftAction(false)
            ->setBuildAction(false)
            ->setMoveAction(false)
            ->setBetrayAction(false)
            ->setBattleAction(false)
            ->setLoyalty(null)
            ->setPrize(null)
            ->setImpactIcons(null)
            ->setDescription(null)
            ->setDiscardedEffect($discardedEffect)
            ->setDiscardedDescription($discardedDescription)
            ->setPurchasedEffect($purchasedEffect)
            ->setPurchasedDescription($purchasedDescription);

        return $card;
    }

    static public function createCourtCard(
        string $id, ?string $suit, ?int $rank, ?string $name, ?string $region, ?string $specialAbility, bool $taxAction, bool $giftAction,
        bool $buildAction, bool $moveAction, bool $betrayAction, bool $battleAction, ?string $loyalty, ?string $prize,
        ?array $impactIcons, ?String $description
    ): PPCard
    {
        $card = new PPCard();
        $card->setId($id)
            ->setType(PPEnumCardType::Court)
            ->setSuit($suit)
            ->setRank($rank)
            ->setName($name)
            ->setRegion($region)
            ->setSpecialAbility($specialAbility)
            ->setTaxAction($taxAction)
            ->setGiftAction($giftAction)
            ->setBuildAction($buildAction)
            ->setMoveAction($moveAction)
            ->setBetrayAction($betrayAction)
            ->setBattleAction($battleAction)
            ->setLoyalty($loyalty)
            ->setPrize($prize)
            ->setImpactIcons($impactIcons)
            ->setDescription($description)
            ->setDiscardedEffect(null)
            ->setDiscardedDescription(null)
            ->setPurchasedEffect(null)
            ->setPurchasedDescription(null);

        return $card;
    }
}