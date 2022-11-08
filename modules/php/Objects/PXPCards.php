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

use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumCardType;
use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumRegion;
use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumLoyalty;

class PXPCard implements \JsonSerializable
{
    private int $id;
    private PXPEnumCardType $type;

    // Suit cards
    private ?string $suit;
    private ?int $rank;
    private ?PXPEnumRegion $region;
    
    private bool $hasTaxAction;
    private bool $hasGiftAction;
    private bool $hasBuildAction;
    private bool $hasMoveAction;
    private bool $hasBetrayAction;
    private bool $hasBattleAction;

    private ?PXPEnumLoyalty $loyalty;

    

    

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
     * Get the value of hasTaxAction
     */ 
    public function getHasTaxAction()
    {
        return $this->hasTaxAction;
    }

    /**
     * Set the value of hasTaxAction
     *
     * @return  self
     */ 
    public function setHasTaxAction($hasTaxAction)
    {
        $this->hasTaxAction = $hasTaxAction;
        return $this;
    }

    /**
     * Get the value of hasGiftAction
     */ 
    public function getHasGiftAction()
    {
        return $this->hasGiftAction;
    }

    /**
     * Set the value of hasGiftAction
     *
     * @return  self
     */ 
    public function setHasGiftAction($hasGiftAction)
    {
        $this->hasGiftAction = $hasGiftAction;
        return $this;
    }

    /**
     * Get the value of hasBuildAction
     */ 
    public function getHasBuildAction()
    {
        return $this->hasBuildAction;
    }

    /**
     * Set the value of hasBuildAction
     *
     * @return  self
     */ 
    public function setHasBuildAction($hasBuildAction)
    {
        $this->hasBuildAction = $hasBuildAction;
        return $this;
    }

    /**
     * Get the value of hasMoveAction
     */ 
    public function getHasMoveAction()
    {
        return $this->hasMoveAction;
    }

    /**
     * Set the value of hasMoveAction
     *
     * @return  self
     */ 
    public function setHasMoveAction($hasMoveAction)
    {
        $this->hasMoveAction = $hasMoveAction;
        return $this;
    }

    /**
     * Get the value of hasBetrayAction
     */ 
    public function getHasBetrayAction()
    {
        return $this->hasBetrayAction;
    }

    /**
     * Set the value of hasBetrayAction
     *
     * @return  self
     */ 
    public function setHasBetrayAction($hasBetrayAction)
    {
        $this->hasBetrayAction = $hasBetrayAction;
        return $this;
    }

    /**
     * Get the value of hasBattleAction
     */ 
    public function getHasBattleAction()
    {
        return $this->hasBattleAction;
    }

    /**
     * Set the value of hasBattleAction
     *
     * @return  self
     */ 
    public function setHasBattleAction($hasBattleAction)
    {
        $this->hasBattleAction = $hasBattleAction;
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


    public function jsonSerialize(): array
    {

        return [
            "id" => $this->getId(),
            "type" => $this->getType(),
            "suit" => $this->getSuit(),
            "rank" => $this->getRank(),
            "region" => $this->getRegion(),
            "hasTaxAction" => $this->getHasTaxAction(),
            "hasGiftAction" => $this->getHasGiftAction(),
            "hasBuildAction" => $this->getHasBuildAction(),
            "hasMoveAction" => $this->getHasMoveAction(),
            "hasBetrayAction" => $this->getHasBetrayAction(),
            "hasBattleAction" => $this->getHasBattleAction(),
            "loyalty" => $this->getLoyalty()
        ];
    }
}