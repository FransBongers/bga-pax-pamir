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
 * modules/php/Objects/PXPCardFactory.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Factories;

use PhobyJuan\PaxPamirEditionTwo\Objects\PXPCard;
use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumCardType;

class PXPCardFactory
{
    static public function createDominanceCheckCard(
        int $id
    ): PXPCard
    {
        $card = new PXPCard();
        $card->setId($id)
            ->setType(PXPEnumCardType::DominanceCheck)
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
            ->setPurchasedEffect(null)
            ->setDiscardedEffect(null);

        return $card;
    }

    static public function createEventCard(
        int $id, string $purchasedEffect, string $discardedEffect
    ): PXPCard
    {
        $card = new PXPCard();
        $card->setId($id)
            ->setType(PXPEnumCardType::Event)
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
            ->setPurchasedEffect($purchasedEffect)
            ->setDiscardedEffect($discardedEffect);

        return $card;
    }

    static public function createSuitCard(
        int $id, ?string $suit, ?int $rank, ?string $name, ?string $region, ?string $specialAbility, bool $taxAction, bool $giftAction,
        bool $buildAction, bool $moveAction, bool $betrayAction, bool $battleAction, ?string $loyalty, ?string $prize,
        ?array $impactIcons
    ): PXPCard
    {
        $card = new PXPCard();
        $card->setId($id)
            ->setType(PXPEnumCardType::Suit)
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
            ->setPurchasedEffect(null)
            ->setDiscardedEffect(null);

        return $card;
    }
}