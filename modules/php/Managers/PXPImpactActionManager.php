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
 * modules/php/Managers/PXPImpactActionManager.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Managers;

use PhobyJuan\PaxPamirEditionTwo\Objects\PXPImpactAction;
use PhobyJuan\PaxPamirEditionTwo\Factories\PXPImpactActionFactory;

class PXPImpactActionManager extends \APP_DbObject
{
    public function getById(int $id): ?PXPImpactAction
    {
        $sql = "SELECT 
            impact_action_id, player_id, name, is_done, card_id
        FROM impact_action
        WHERE player_id = '$id'";

        $res = self::getObjectFromDB( $sql );

        $impactAction = null;

        if ($res) {
            $impactAction = (new PXPImpactAction())->setId($res['impact_action_id'])
                ->setPlayer_id($res['player_id'])
                ->setName($res['name'])
                ->setDone($res['is_done'])
                ->setCard_id($res['card_id']);
        }

        return $impactAction;
    }

    public function persist(PXPImpactAction $impactAction): void {

        $id = $impactAction->getId();
        $player_id = $impactAction->getPlayer_id();
        $name = $impactAction->getname();
        $done = (int)$impactAction->isDone();
        $card_id = $impactAction->getCard_id();

        if ($id == null) {
            $sql = "INSERT INTO impact_action
                        (player_id, name, is_done, card_id)
                    VALUES
                        ('$player_id', '$name', '$done', '$card_id')";
        } else {
            $sql = "UPDATE 
                        impact_action
                    SET 
                        player_id = '$player_id', name = '$name', is_done = '$done', card_id = '$card_id'
                    WHERE
                        impact_action_id = $id";
        }

        self::DbQuery( $sql );
    }

    public function getToBeDoneByPlayerId(int $player_id): array {
        $result = array();

        $sql = "SELECT 
                    impact_action_id, player_id, name, is_done, card_id
                FROM impact_action
                WHERE player_id = '$player_id' AND is_done = false
                ORDER BY impact_action_id ASC";

        $sqlResult = self::getObjectListFromDB( $sql );

        foreach ($sqlResult as $sqlRes) {
            $impactAction = PXPImpactActionFactory::create($sqlRes['impact_action_id'], $sqlRes['player_id'], $sqlRes['name'], $sqlRes['is_done'], $sqlRes['card_id']);
            $result[] = $impactAction;
        }

        return $result;
    }

    public function deleteAll(): void {
        $sql = "DELETE FROM impact_action
                WHERE 1=1";

        self::DbQuery( $sql );
    } 
}