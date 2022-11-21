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
 * modules/php/Objects/PPEnumCardAction.php
 *
 */

namespace PPModules\PaxPamirEditionTwo\Enums;

abstract class PPEnumCardAction
{
    const Battle = "battle";
    const Betray = "betray";
    const Build = "build";
    const Gift = "gift";
    const Move = "move";
    const Tax = "tax";
}