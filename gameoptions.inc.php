<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Paxpamir implementation : © Frans Bongers <fjmbongers@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * Paxpamir game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in paxpamir.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

namespace PaxPamir;

require_once 'modules/php/gameoptions.inc.php';

$game_options = [
    OPTION_OPEN_HANDS => [
        'name' => totranslate('Open hands'),
        'values' => [
            OPTION_OPEN_HANDS_DISABLED => [
                'name' => totranslate('Disabled'),
            ],
            OPTION_OPEN_HANDS_ENABLED => [
                'name' => totranslate('Enabled'),
                'tmdisplay' => totranslate('Open hands'),
            ]
        ]
    ],
    OPTION_WAKHAN => [
        'name' => totranslate('Wakhan opponent'),
        'values' => [
            OPTION_WAKHAN_DISABLED => [
                'name' => totranslate('Disabled'),
            ],
            OPTION_WAKHAN_BASIC => [
                'name' => totranslate('Rulebook'),
                'description' => totranslate('Wakhan opponent following the rules in the rulebook'),
                'tmdisplay' => totranslate('Rulebook Wakhan'),
            ],
            OPTION_WAKHAN_IMPROVED => [
                'name' => totranslate('Improved'),
                'description' => totranslate('Wakhan opponent with all variants enabled'),
                'tmdisplay' => totranslate('Improved Wakhan'),
            ],
            OPTION_WAKHAN_CUSTOM => [
                'name' => totranslate('Custom'),
                'description' => totranslate('Wakhan opponent where each variant can be enabled separately'),
                'tmdisplay' => totranslate('Custom Wakhan'),
            ]
        ],
        'displaycondition' => [
            [
                'type' => 'maxplayers',
                'value' => [1, 2]
            ],
        ]

    ],
    OPTION_WAKHAN_VARIANT_SAVVY_PURCHASING => [
        'name' => totranslate('Wakhan variant: Savvy Purchasing'),
        'values' => [
            OPTION_WAKHAN_VARIANT_SAVVY_PURCHASING_DISABLED => [
                'name' => totranslate('Disabled'),
            ],
            OPTION_WAKHAN_VARIANT_SAVVY_PURCHASING_ENABLED => [
                'name' => totranslate('Enabled'),
                'tmdisplay' => totranslate('Wakhan variant: Savvy Purchasing'),
            ]
        ],
        'displaycondition' => [
            [
                'type' => 'otheroption',
                'id' => OPTION_WAKHAN, // Game specific option defined in the same array above
                'value' => [OPTION_WAKHAN_CUSTOM]
            ],
        ]

    ],
    OPTION_WAKHAN_VARIANT_SPY_MOVEMENT => [
        'name' => totranslate('Wakhan variant: Spy Movement'),
        'values' => [
            OPTION_WAKHAN_VARIANT_SPY_MOVEMENT_DISABLED => [
                'name' => totranslate('Disabled'),
            ],
            OPTION_WAKHAN_VARIANT_SPY_MOVEMENT_ENABLED => [
                'name' => totranslate('Enabled'),
                'tmdisplay' => totranslate('Wakhan variant: Spy Movement'),
            ]
        ],
        'displaycondition' => [
            [
                'type' => 'otheroption',
                'id' => OPTION_WAKHAN, // Game specific option defined in the same array above
                'value' => [OPTION_WAKHAN_CUSTOM]
            ],
        ]

    ],
    OPTION_WAKHAN_VARIANT_STEADFAST_PRAGMATIC_LOYALTY => [
        'name' => totranslate('Wakhan variant: Steadfast Pragmatic Loyalty'),
        'values' => [
            OPTION_WAKHAN_VARIANT_STEADFAST_PRAGMATIC_LOYALTY_DISABLED => [
                'name' => totranslate('Disabled'),
            ],
            OPTION_WAKHAN_VARIANT_STEADFAST_PRAGMATIC_LOYALTY_ENABLED => [
                'name' => totranslate('Enabled'),
                'tmdisplay' => totranslate('Wakhan variant: Steadfast Pragmatic Loyalty'),
            ]
        ],
        'displaycondition' => [
            [
                'type' => 'otheroption',
                'id' => OPTION_WAKHAN, // Game specific option defined in the same array above
                'value' => [OPTION_WAKHAN_CUSTOM]
            ],
        ]

    ],
    OPTION_WAKHAN_AUTO_RESOLVE => [
        'name' => totranslate('Fully automated Wakhan actions'),
        'values' => [
            OPTION_WAKHAN_AUTO_RESOLVE_DISABLED => [
                'name' => totranslate('Disabled'),
            ],
            OPTION_WAKHAN_AUTO_RESOLVE_ENABLED => [
                'name' => totranslate('Enabled'),
                'description' => totranslate('Wakhan opponent will perform all her actions without manual intervention'),
                'tmdisplay' => totranslate('Fully automated Wakhan actions'),
            ]
        ],
        'displaycondition' => [
            [
                'type' => 'otheroption',
                'id' => OPTION_WAKHAN, // Game specific option defined in the same array above
                'value' => [OPTION_WAKHAN_BASIC, OPTION_WAKHAN_CUSTOM, OPTION_WAKHAN_IMPROVED]
            ],
        ]

    ]
];

$game_preferences = [];

// $game_options = array(

    /*
    
    // note: game variant ID should start at 100 (ie: 100, 101, 102, ...). The maximum is 199.
    100 => array(
                'name' => totranslate('my game option'),    
                'values' => array(

                            // A simple value for this option:
                            1 => array( 'name' => totranslate('option 1') )

                            // A simple value for this option.
                            // If this value is chosen, the value of "tmdisplay" is displayed in the game lobby
                            2 => array( 'name' => totranslate('option 2'), 'tmdisplay' => totranslate('option 2') ),

                            // Another value, with other options:
                            //  description => this text will be displayed underneath the option when this value is selected to explain what it does
                            //  beta=true => this option is in beta version right now (there will be a warning)
                            //  alpha=true => this option is in alpha version right now (there will be a warning, and starting the game will be allowed only in training mode except for the developer)
                            //  nobeginner=true  =>  this option is not recommended for beginners
                            //  firstgameonly=true  =>  this option is recommended only for the first game (discovery option)
                            3 => array( 'name' => totranslate('option 3'), 'description' => totranslate('this option does X'), 'beta' => true, 'nobeginner' => true )
                        ),
                'default' => 1
            ),

    */

// );
