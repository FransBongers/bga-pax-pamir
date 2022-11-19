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
 * modules/php/Objects/PXPImpactActionFactory.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Factories;

use PhobyJuan\PaxPamirEditionTwo\Objects\PXPImpactAction;

class PXPImpactActionFactory
{
    static public function create(
        ?int $id, int $player_id, string $name, bool $is_done, string $card_id
    ): PXPImpactAction
    {
        $impactAction = new PXPImpactAction();
        $impactAction->setId($id)
            ->setPlayer_id($player_id)
            ->setName($name)
            ->setDone($is_done)
            ->setCard_id($card_id);

        return $impactAction;
    }
}