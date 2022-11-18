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
 * modules/php/Managers/PXPPlayerManager.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Managers;

use PhobyJuan\PaxPamirEditionTwo\Objects\PXPPlayer;

class PXPPlayerManager extends \APP_DbObject
{
    public function getPlayerById(
        int $id
    ): ?PXPPlayer
    {
        $sql = "SELECT 
                    player_no, player_id, player_canal, player_name, player_avatar, player_color, 
                    player_score, player_score_aux, player_zombie, player_ai, player_eliminated, 
                    player_next_notif_no, player_enter_game, player_over_time, player_is_multiactive, 
                    player_start_reflexion_time, player_remaining_reflexion_time, player_beginner, 
                    player_state, rupees, loyalty
                FROM player
                WHERE player_id = '$id'";

        $res = self::getObjectFromDB( $sql );

        $player = null;

        if ($res) {
            $player = (new PXPPlayer())->setNo($res['player_no'])
                ->setId($res['player_id'])
                ->setCanal($res['player_canal'])
                ->setName($res['player_name'])
                ->setAvatar($res['player_avatar'])
                ->setColor($res['player_color'])
                ->setScore($res['player_score'])
                ->setScore_aux($res['player_score_aux'])
                ->setZombie($res['player_zombie'])
                ->setAi($res['player_ai'])
                ->setEliminated($res['player_eliminated'])
                ->setNext_notif_no($res['player_next_notif_no'])
                ->setEnter_game($res['player_enter_game'])
                ->setOver_time($res['player_over_time'])
                ->setIs_multiactive($res['player_is_multiactive'])
                ->setStart_reflexion_time($res['player_start_reflexion_time'])
                ->setRemaining_reflexion_time($res['player_remaining_reflexion_time'])
                ->setBeginner($res['player_beginner'])
                ->setState($res['player_state'])
                ->setRupees($res['rupees'])
                ->setLoyalty($res['loyalty']);
        }

        return $player;
    }

    public function persist(PXPPlayer $player): void
    {
        $player_id = $player->getId();
        $rupees = $player->getRupees();
        $loyalty = $player->getLoyalty();

        $sql = "UPDATE 
                    player 
                SET 
                    rupees = '$rupees', 
                    loyalty = '$loyalty'
                WHERE 
                    player_id = '$player_id'";

        self::DbQuery( $sql );
    }
}