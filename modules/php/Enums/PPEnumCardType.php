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
 * modules/php/Objects/PPEnumCardType.php
 *
 */

namespace PPModules\PaxPamirEditionTwo\Enums;

abstract class PPEnumCardType
{
    const Event = "event_card";
    const DominanceCheck = "dominance_check_card";
    const Court = "court_card";
}