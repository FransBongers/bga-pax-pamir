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
 * modules/php/Objects/PXPToken.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Objects;

class PXPToken implements \JsonSerializable
{
    private string $key;
    private string $location;
    private ?int $state;

    /**
     * Get the value of key
     */ 
    public function getKey()
    {
        return $this->key;
    }
    /**
     * Set the value of key
     *
     * @return  self
     */ 
    public function setKey($key)
    {
        $this->key = $key;
        return $this;
    }

    /**
     * Get the value of location
     */ 
    public function getLocation()
    {
        return $this->location;
    }
    /**
     * Set the value of location
     *
     * @return  self
     */ 
    public function setLocation($location)
    {
        $this->location = $location;
        return $this;
    }

    /**
     * Get the value of state
     */ 
    public function getState()
    {
        return $this->state;
    }
    /**
     * Set the value of state
     *
     * @return  self
     */ 
    public function setState($state)
    {
        $this->state = $state;
        return $this;
    }

    public function jsonSerialize(): array
    {
        return [
            "key" => $this->getKey(),
            "location" => $this->getLocation(),
            "state" => $this->getState(),
        ];
    }
}