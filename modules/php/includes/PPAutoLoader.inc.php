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
 * modules/php/includes/PPAutoLoader.inc.php
 *
 */


if (!defined('PP_MODULES_DIR'))
{
    define('PP_MODULES_DIR', __DIR__ . "/..");
    define('PP_FACTORY_DIR', PP_MODULES_DIR . "/Factories");
    define('PP_OBJECT_DIR', PP_MODULES_DIR . "/Objects");
    define('PP_ENUM_DIR', PP_MODULES_DIR . "/Enums");

    function PPClassMapAutoloader(string $className)
    {
        $baseNameSpacePPModules = "PPModules\\PaxPamirEditionTwo";
        $classMap = [
            "$baseNameSpacePPModules\\Factories\\PPCardFactory" => PP_FACTORY_DIR . "/PPCardFactory.php",
            "$baseNameSpacePPModules\\Objects\\PPCard" => PP_OBJECT_DIR . "/PPCard.php",
            "$baseNameSpacePPModules\\Enums\\PPEnumCardType" => PP_ENUM_DIR . "/PPEnumCardType.php",
            "$baseNameSpacePPModules\\Enums\\PPEnumCoalition" => PP_ENUM_DIR . "/PPEnumCoalition.php",
            "$baseNameSpacePPModules\\Enums\\PPEnumEventCardEffect" => PP_ENUM_DIR . "/PPEnumEventCardEffect.php",
            "$baseNameSpacePPModules\\Enums\\PPEnumImpactIcon" => PP_ENUM_DIR . "/PPEnumImpactIcon.php",
            "$baseNameSpacePPModules\\Enums\\PPEnumPool" => PP_ENUM_DIR . "/PPEnumPool.php",
            "$baseNameSpacePPModules\\Enums\\PPEnumRegion" => PP_ENUM_DIR . "/PPEnumRegion.php",
            "$baseNameSpacePPModules\\Enums\\PPEnumSpecialAbility" => PP_ENUM_DIR . "/PPEnumSpecialAbility.php",
            "$baseNameSpacePPModules\\Enums\\PPEnumSuit" => PP_ENUM_DIR . "/PPEnumSuit.php",
        ];
        if (array_key_exists($className, $classMap))
        {
            require_once $classMap[$className];
        }
    }

    spl_autoload_register('PPClassMapAutoloader', true, true);
}