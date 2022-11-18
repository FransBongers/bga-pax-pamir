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

use PhobyJuan\PaxPamirEditionTwo\Objects\PXPToken;
use PhobyJuan\PaxPamirEditionTwo\Factories\PXPTokenFactory;

class PXPTokenManager extends \APP_DbObject
{
    public function getTokenByKey(
        string $key
    ): ?PXPToken
    {
        $sql = "SELECT 
                    token_key, token_location, token_state
                FROM token
                WHERE token_key = '$key'";

        $res = self::getObjectFromDB( $sql );

        $token = null;

        if ($res) {
            $token = (new PXPToken())->setKey($res['token_key'])
                ->setLocation($res['token_location'])
                ->setState($res['token_state']);
        }

        return $token;
    }

    public function persist(PXPToken $token): void
    {
        $key = $token->getKey();
        $location = $token->getLocation();
        $state = $token->getState();

        $sql = "UPDATE 
                    token 
                SET 
                    token_location = '$location', 
                    token_state = '$state'
                WHERE 
                    token_key = '$key'";

        self::DbQuery( $sql );
    }

    public function getByLocation(string $location, ?string $order = null): array
    {
        $result = array();

        $sql = "SELECT 
                    token_key, token_location, token_state
                FROM token
                WHERE token_location = '$location'";
        
        if ($order != null) {
            $sql .= " ORDER BY $order";
        }

        $sqlResult = self::getObjectListFromDB( $sql );

        foreach ($sqlResult as $sqlRes) {
            $token = PXPTokenFactory::createToken($sqlRes['token_key'], $sqlRes['token_location'], $sqlRes['token_state']);
            $result[] = $token;
        }

        return $result;
    }

    public function getCylindersAvailableByPlayerId(int $playerId, ?string $order = null): array
    {
        $result = array();

        $sql = "SELECT 
                    token_key, token_location, token_state
                FROM token
                WHERE token_location = 'cylinders_$playerId'";
        
        if ($order != null) {
            $sql .= " ORDER BY $order";
        }

        $sqlResult = self::getObjectListFromDB( $sql );

        foreach ($sqlResult as $sqlRes) {
            $token = PXPTokenFactory::createToken($sqlRes['token_key'], $sqlRes['token_location'], $sqlRes['token_state']);
            $result[] = $token;
        }

        return $result;
    }
}