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
 * modules/php/Objects/PXPPlayer.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Objects;

class PXPPlayer implements \JsonSerializable
{
    private int $no;
    private int $id;
    private String $canal;
    private String $name;
    private String $avatar;
    private String $color;
    private int $score;
    private int $score_aux;
    private int $zombie;
    private int $ai;
    private int $eliminated;
    private int $next_notif_no;
    private int $enter_game;
    private int $over_time;
    private int $is_multiactive;
    private ?String $start_reflexion_time;
    private ?int $remaining_reflexion_time;
    private ?String $beginner;
    private ?int $state;
    private int $rupees;
    private String $loyalty;

    /**
     * Get the value of no
     */ 
    public function getNo()
    {
        return $this->no;
    }
    /**
     * Set the value of no
     *
     * @return  self
     */ 
    public function setNo($no)
    {
        $this->no = $no;
        return $this;
    }

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
     * Get the value of canal
     */ 
    public function getCanal()
    {
        return $this->canal;
    }
    /**
     * Set the value of canal
     *
     * @return  self
     */ 
    public function setCanal($canal)
    {
        $this->canal = $canal;
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
     * Get the value of avatar
     */ 
    public function getAvatar()
    {
        return $this->avatar;
    }
    /**
     * Set the value of avatar
     *
     * @return  self
     */ 
    public function setAvatar($avatar)
    {
        $this->avatar = $avatar;
        return $this;
    }

    /**
     * Get the value of color
     */ 
    public function getColor()
    {
        return $this->color;
    }
    /**
     * Set the value of color
     *
     * @return  self
     */ 
    public function setColor($color)
    {
        $this->color = $color;
        return $this;
    }

    /**
     * Get the value of score
     */ 
    public function getScore()
    {
        return $this->score;
    }
    /**
     * Set the value of score
     *
     * @return  self
     */ 
    public function setScore($score)
    {
        $this->score = $score;
        return $this;
    }

    /**
     * Get the value of score_aux
     */ 
    public function getScore_aux()
    {
        return $this->score_aux;
    }
    /**
     * Set the value of score_aux
     *
     * @return  self
     */ 
    public function setScore_aux($score_aux)
    {
        $this->score_aux = $score_aux;
        return $this;
    }

    /**
     * Get the value of zombie
     */ 
    public function getZombie()
    {
        return $this->zombie;
    }
    /**
     * Set the value of zombie
     *
     * @return  self
     */ 
    public function setZombie($zombie)
    {
        $this->zombie = $zombie;
        return $this;
    }

    /**
     * Get the value of ai
     */ 
    public function getAi()
    {
        return $this->ai;
    }
    /**
     * Set the value of ai
     *
     * @return  self
     */ 
    public function setAi($ai)
    {
        $this->ai = $ai;
        return $this;
    }

    /**
     * Get the value of eliminated
     */ 
    public function getEliminated()
    {
        return $this->eliminated;
    }
    /**
     * Set the value of eliminated
     *
     * @return  self
     */ 
    public function setEliminated($eliminated)
    {
        $this->eliminated = $eliminated;
        return $this;
    }

    /**
     * Get the value of next_notif_no
     */ 
    public function getNext_notif_no()
    {
        return $this->next_notif_no;
    }
    /**
     * Set the value of next_notif_no
     *
     * @return  self
     */ 
    public function setNext_notif_no($next_notif_no)
    {
        $this->next_notif_no = $next_notif_no;
        return $this;
    }

    /**
     * Get the value of enter_game
     */ 
    public function getEnter_game()
    {
        return $this->enter_game;
    }
    /**
     * Set the value of enter_game
     *
     * @return  self
     */ 
    public function setEnter_game($enter_game)
    {
        $this->enter_game = $enter_game;
        return $this;
    }

    /**
     * Get the value of over_time
     */ 
    public function getOver_time()
    {
        return $this->over_time;
    }
    /**
     * Set the value of over_time
     *
     * @return  self
     */ 
    public function setOver_time($over_time)
    {
        $this->over_time = $over_time;
        return $this;
    }

    /**
     * Get the value of is_multiactive
     */ 
    public function getIs_multiactive()
    {
        return $this->is_multiactive;
    }
    /**
     * Set the value of is_multiactive
     *
     * @return  self
     */ 
    public function setIs_multiactive($is_multiactive)
    {
        $this->is_multiactive = $is_multiactive;
        return $this;
    }

    /**
     * Get the value of start_reflexion_time
     */ 
    public function getStart_reflexion_time()
    {
        return $this->start_reflexion_time;
    }
    /**
     * Set the value of start_reflexion_time
     *
     * @return  self
     */ 
    public function setStart_reflexion_time($start_reflexion_time)
    {
        $this->start_reflexion_time = $start_reflexion_time;
        return $this;
    }

    /**
     * Get the value of remaining_reflexion_time
     */ 
    public function getRemaining_reflexion_time()
    {
        return $this->remaining_reflexion_time;
    }
    /**
     * Set the value of remaining_reflexion_time
     *
     * @return  self
     */ 
    public function setRemaining_reflexion_time($remaining_reflexion_time)
    {
        $this->remaining_reflexion_time = $remaining_reflexion_time;
        return $this;
    }

    /**
     * Get the value of beginner
     */ 
    public function getBeginner()
    {
        return $this->beginner;
    }
    /**
     * Set the value of beginner
     *
     * @return  self
     */ 
    public function setBeginner($beginner)
    {
        $this->beginner = $beginner;
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

    /**
     * Get the value of rupees
     */ 
    public function getRupees()
    {
        return $this->rupees;
    }
    /**
     * Set the value of rupees
     *
     * @return  self
     */ 
    public function setRupees($rupees)
    {
        $this->rupees = $rupees;
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
            "no" => $this->getNo(),
            "id" => $this->getId(),
            "canal" => $this->getCanal(),
            "name" => $this->getName(),
            "avatar" => $this->getAvatar(),
            "color" => $this->getColor(),
            "score" => $this->getScore(),
            "score_aux" => $this->getScore_aux(),
            "zombie" => $this->getZombie(),
            "ai" => $this->getAi(),
            "eliminated" => $this->getEliminated(),
            "next_notif_no" => $this->getNext_notif_no(),
            "enter_game" => $this->getEnter_game(),
            "over_time" => $this->getOver_time(),
            "is_multiactive" => $this->getIs_multiactive(),
            "start_reflexion_time" => $this->getStart_reflexion_time(),
            "remaining_reflexion_time" => $this->getRemaining_reflexion_time(),
            "beginner" => $this->getBeginner(),
            "state" => $this->getState(),
            "rupees" => $this->getRupees(),
            "loyalty" => $this->getLoyalty(),
        ];
    }
}