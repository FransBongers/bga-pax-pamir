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
 * modules/php/Objects/PXPTokenFactory.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Factories;

use PhobyJuan\PaxPamirEditionTwo\Objects\PXPToken;

class PXPTokenFactory
{
    static public function createToken(
        string $key, string $location, ?int $state
    ): PXPToken
    {
        $token = new PXPToken();
        $token->setKey($key)
            ->setLocation($location)
            ->setState($state);

        return $token;
    }
}