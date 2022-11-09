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
 * modules/php/Objects/PXPCard.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Objects;

class PXPCard implements \JsonSerializable
{
    private int $id;
    private string $type;

    // Suit cards
    private ?string $suit;
    private ?int $rank;
    private ?string $name;
    private ?string $region;
    
    private ?string $specialAbility;

    private bool $taxAction;
    private bool $giftAction;
    private bool $buildAction;
    private bool $moveAction;
    private bool $betrayAction;
    private bool $battleAction;

    private ?string $loyalty;
    private ?string $prize;
    
    private ?array $impactIcons;
    
    private ?string $purchasedEffect;
    private ?string $discardedEffect;

    /**
     * Get the value of id
     */ 
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set the value of id
     *
     * @return  self
     */ 
    public function setId($id)
    {
        $this->id = $id;
        return $this;
    }

    /**
     * Get the value of type
     */ 
    public function getType()
    {
        return $this->type;
    }

    /**
     * Set the value of type
     *
     * @return  self
     */ 
    public function setType($type)
    {
        $this->type = $type;
        return $this;
    }

    /**
     * Get the value of suit
     */ 
    public function getSuit()
    {
        return $this->suit;
    }

    /**
     * Set the value of suit
     *
     * @return  self
     */ 
    public function setSuit($suit)
    {
        $this->suit = $suit;
        return $this;
    }

    /**
     * Get the value of rank
     */ 
    public function getRank()
    {
        return $this->rank;
    }

    /**
     * Set the value of rank
     *
     * @return  self
     */ 
    public function setRank($rank)
    {
        $this->rank = $rank;
        return $this;
    }

    /**
     * Get the value of name
     */ 
    public function getName()
    {
        return $this->name;
    }

    /**
     * Set the value of name
     *
     * @return  self
     */ 
    public function setName($name)
    {
        $this->name = $name;
        return $this;
    }

    /**
     * Get the value of region
     */ 
    public function getRegion()
    {
        return $this->region;
    }

    /**
     * Set the value of region
     *
     * @return  self
     */ 
    public function setRegion($region)
    {
        $this->region = $region;
        return $this;
    }

    /**
     * Get the value of specialAbility
     */ 
    public function getSpecialAbility()
    {
        return $this->specialAbility;
    }

    /**
     * Set the value of specialAbility
     *
     * @return  self
     */ 
    public function setSpecialAbility($specialAbility)
    {
        $this->specialAbility = $specialAbility;
        return $this;
    }

    /**
     * Get the value of taxAction
     */ 
    public function hasTaxAction()
    {
        return $this->taxAction;
    }

    /**
     * Set the value of taxAction
     *
     * @return  self
     */ 
    public function setTaxAction($taxAction)
    {
        $this->taxAction = $taxAction;
        return $this;
    }

    /**
     * Get the value of giftAction
     */ 
    public function hasGiftAction()
    {
        return $this->giftAction;
    }

    /**
     * Set the value of giftAction
     *
     * @return  self
     */ 
    public function setGiftAction($giftAction)
    {
        $this->giftAction = $giftAction;
        return $this;
    }

    /**
     * Get the value of buildAction
     */ 
    public function hasBuildAction()
    {
        return $this->buildAction;
    }

    /**
     * Set the value of buildAction
     *
     * @return  self
     */ 
    public function setbuildAction($buildAction)
    {
        $this->buildAction = $buildAction;
        return $this;
    }

    /**
     * Get the value of moveAction
     */ 
    public function hasMoveAction()
    {
        return $this->moveAction;
    }

    /**
     * Set the value of moveAction
     *
     * @return  self
     */ 
    public function setMoveAction($moveAction)
    {
        $this->moveAction = $moveAction;
        return $this;
    }

    /**
     * Get the value of betrayAction
     */ 
    public function hasBetrayAction()
    {
        return $this->betrayAction;
    }

    /**
     * Set the value of betrayAction
     *
     * @return  self
     */ 
    public function setBetrayAction($betrayAction)
    {
        $this->betrayAction = $betrayAction;
        return $this;
    }

    /**
     * Get the value of battleAction
     */ 
    public function hasBattleAction()
    {
        return $this->battleAction;
    }

    /**
     * Set the value of battleAction
     *
     * @return  self
     */ 
    public function setBattleAction($battleAction)
    {
        $this->battleAction = $battleAction;
        return $this;
    }

    /**
     * Get the value of loyalty
     */ 
    public function getLoyalty()
    {
        return $this->loyalty;
    }

    /**
     * Set the value of loyalty
     *
     * @return  self
     */ 
    public function setLoyalty($loyalty)
    {
        $this->loyalty = $loyalty;
        return $this;
    }

    /**
     * Get the value of prize
     */ 
    public function getPrize()
    {
        return $this->prize;
    }

    /**
     * Set the value of prize
     *
     * @return  self
     */ 
    public function setPrize($prize)
    {
        $this->prize = $prize;
        return $this;
    }

    /**
     * Get the value of impactIcon
     */ 
    public function getImpactIcons()
    {
        return $this->impactIcons;
    }

    /**
     * Set the value of impactIcon
     *
     * @return  self
     */ 
    public function setImpactIcons($impactIcons)
    {
        $this->impactIcons = $impactIcons;
        return $this;
    }

    /**
     * Get the value of purchasedEffect
     */ 
    public function getPurchasedEffect()
    {
        return $this->purchasedEffect;
    }

    /**
     * Set the value of purchasedEffect
     *
     * @return  self
     */ 
    public function setPurchasedEffect($purchasedEffect)
    {
        $this->purchasedEffect = $purchasedEffect;
        return $this;
    }

    /**
     * Get the value of discardedEffect
     */ 
    public function getDiscardedEffect()
    {
        return $this->discardedEffect;
    }

    /**
     * Set the value of discardedEffect
     *
     * @return  self
     */ 
    public function setDiscardedEffect($discardedEffect)
    {
        $this->discardedEffect = $discardedEffect;
        return $this;
    }

    public function jsonSerialize(): array
    {
        return [
            "id" => $this->getId(),
            "type" => $this->getType(),
            "suit" => $this->getSuit(),
            "rank" => $this->getRank(),
            "name" => $this->getName(),
            "region" => $this->getRegion(),
            "hasTaxAction" => $this->hastaxAction(),
            "hasGiftAction" => $this->hasGiftAction(),
            "hasBuildAction" => $this->hasBuildAction(),
            "hasMoveAction" => $this->hasMoveAction(),
            "hasBetrayAction" => $this->hasBetrayAction(),
            "hasBattleAction" => $this->hasBattleAction(),
            "loyalty" => $this->getLoyalty(),
            "prize" => $this->getPrize(),
            "impactIcons" => $this->getImpactIcons()
        ];
    }
}