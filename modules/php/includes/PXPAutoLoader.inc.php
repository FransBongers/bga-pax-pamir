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
 * modules/php/includes/PXPAutoLoader.inc.php
 *
 */


if (!defined('PXP_MODULES_DIR'))
{
    define('PXP_MODULES_DIR', __DIR__ . "/..");
    define('PXP_FACTORY_DIR', PXP_MODULES_DIR . "/Factories");
    define('PXP_OBJECT_DIR', PXP_MODULES_DIR . "/Objects");
    define('PXP_ENUM_DIR', PXP_MODULES_DIR . "/Enums");

    function PXPClassMapAutoloader(string $className)
    {
        $baseNameSpacePhobyJuan = "PhobyJuan\\PaxPamirEditionTwo";
        $classMap = [
            "$baseNameSpacePhobyJuan\\Factories\\PXPCardFactory" => PXP_FACTORY_DIR . "/PXPCardFactory.php",
            "$baseNameSpacePhobyJuan\\Objects\\PXPCard" => PXP_OBJECT_DIR . "/PXPCard.php",
            "$baseNameSpacePhobyJuan\\Enums\\PXPEnumCardType" => PXP_ENUM_DIR . "/PXPEnumCardType.php",
            "$baseNameSpacePhobyJuan\\Enums\\PXPEnumCoalition" => PXP_ENUM_DIR . "/PXPEnumCoalition.php",
            "$baseNameSpacePhobyJuan\\Enums\\PXPEnumEventCardEffect" => PXP_ENUM_DIR . "/PXPEnumEventCardEffect.php",
            "$baseNameSpacePhobyJuan\\Enums\\PXPEnumImpactIcon" => PXP_ENUM_DIR . "/PXPEnumImpactIcon.php",
            "$baseNameSpacePhobyJuan\\Enums\\PXPEnumRegion" => PXP_ENUM_DIR . "/PXPEnumRegion.php",
            "$baseNameSpacePhobyJuan\\Enums\\PXPEnumSpecialAbility" => PXP_ENUM_DIR . "/PXPEnumSpecialAbility.php",
            "$baseNameSpacePhobyJuan\\Enums\\PXPEnumSuit" => PXP_ENUM_DIR . "/PXPEnumSuit.php",
        ];
        if (array_key_exists($className, $classMap))
        {
            require_once $classMap[$className];
        }
    }

    spl_autoload_register('PXPClassMapAutoloader', true, true);
}