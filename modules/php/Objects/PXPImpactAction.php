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
 * modules/php/Objects/PXPImpactAction.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Objects;

class PXPImpactAction implements \JsonSerializable
{
    private ?int $id;
    private int $player_id;
    private string $name;
    private bool $done;
    private string $card_id;

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
     * Get the value of player_id
     */ 
    public function getPlayer_id()
    {
        return $this->player_id;
    }
    /**
     * Set the value of player_id
     *
     * @return  self
     */ 
    public function setPlayer_id($player_id)
    {
        $this->player_id = $player_id;
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
     * Get the value of done
     */ 
    public function isDone()
    {
        return $this->done;
    }
    /**
     * Set the value of done
     *
     * @return  self
     */ 
    public function setDone($done)
    {
        $this->done = $done;
        return $this;
    }

    /**
     * Get the value of card_id
     */ 
    public function getCard_id()
    {
        return $this->card_id;
    }
    /**
     * Set the value of card_id
     *
     * @return  self
     */ 
    public function setCard_id($card_id)
    {
        $this->card_id = $card_id;
        return $this;
    }

    public function jsonSerialize(): array
    {
        return [
            "id" => $this->getId(),
            "player_id" => $this->getPlayer_id(),
            "name" => $this->getName(),
            "done" => $this->isDone(),
        ];
    }

}