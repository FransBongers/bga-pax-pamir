{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- PaxPamirEditionTwo implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    paxpamireditiontwo_paxpamireditiontwo.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->

<div id="pp_play_area">
    <div id="pp_map">
        <!-- tribe locations -->
        <div id="pp_herat_tribes" class="pp_location"></div>
        <div id="pp_kabul_tribes" class="pp_location"></div>
        <div id="pp_kandahar_tribes" class="pp_location"></div>
        <div id="pp_persia_tribes" class="pp_location"></div>
        <div id="pp_punjab_tribes" class="pp_location"></div>
        <div id="pp_transcaspia_tribes" class="pp_location"></div>
        <!-- army locations -->
        <div id="pp_herat_armies" class="pp_location"></div>
        <div id="pp_kabul_armies" class="pp_location"></div>
        <div id="pp_kandahar_armies" class="pp_location"></div>
        <div id="pp_persia_armies" class="pp_location"></div>
        <div id="pp_punjab_armies" class="pp_location"></div>
        <div id="pp_transcaspia_armies" class="pp_location"></div>
        <!-- borders -->
        <div id="pp_herat_kabul_border" class="pp_location"></div>
        <div id="pp_herat_transcaspia_border" class="pp_location"></div>
        <div id="pp_herat_persia_border" class="pp_location"></div>
        <div id="pp_herat_kandahar_border" class="pp_location"></div>
        <div id="pp_kabul_transcaspia_border" class="pp_location"></div>
        <div id="pp_kabul_kandahar_border" class="pp_location"></div>
        <div id="pp_kabul_punjab_border" class="pp_location"></div>
        <div id="pp_kandahar_punjab_border" class="pp_location"></div>
        <div id="pp_persia_transcaspia_border" class="pp_location"></div>
    </div>
    
    <div id="pp_tokens">
        <div id="pp_coalition_blocks_container">
            <div id="pp_afghan_coalition_blocks" class="pp_coalition_blocks">
            </div>
            <div id="pp_british_coalition_blocks" class="pp_coalition_blocks">
            </div>
            <div id="pp_russian_coalition_blocks" class="pp_coalition_blocks">
            </div>
        </div>
        <div id="pp_market_deck_container">
            <div id="pp_discard_pile">
                <span>Discard</span>
            </div>
            <div id="pp_market_deck"></div>
        </div>
    </div>

    <div id="pp_market_board">
        <!-- BEGIN market -->
        <div id="pp_market_{ROW}_{COLUMN}" class="pp_market" style="left: {LEFT}px; top: {TOP}px;">
            <div id="pp_market_{ROW}_{COLUMN}_rupees" class="pp_market_rupees"></div>
        </div>
        <!-- END market -->
        <div id="cards">
        </div>        
    </div>



    <div id="pp_player_tableaus">
        <!-- BEGIN player_hand -->
        <div id="pp_player_hand_{player_id}" class="pp_player_hand">
            <div id="pp_player_hand_title" class="pp_tableau_title"><span>{player_name}'s hand</span></div>
            <div id="pp_player_hand_cards" class="pp_player_hand_cards"></div>
        </div>
        <!-- END player_hand -->
        <!-- BEGIN player_tableau -->
        <div id="player_tableau_{player_id}" class="pp_player_tableau pp_player_color_{player_color}">
            <div id="pp_tableau_title_player_{player_id}" class="pp_tableau_title"><span>{player_name}'s court</span></div>
            <div id="pp_court_player_{player_id}" class="pp_court pp_court_player_{player_id}"></div>
        </div>
    <!-- END player_tableau -->
    </div>
 </div>

<script type="text/javascript">

// Javascript HTML templates

var jstpl_card='<div class="pp_card pp_${card}" id="pp_${card}"></div>';
var jstpl_rupee='<div class="pp_rupee" id="${id}"></div>';
var jstpl_army='<div class="pp_army pp_${coalition}" id="${id}"></div>';
var jstpl_road='<div class="pp_road pp_${coalition}" id="${id}"></div>';
var jstpl_tribe='<div class="pp_tribe pp_player_color_${color}" id="${id}"></div>';
var jstpl_coalition_block='<div class="pp_coalition_block pp_${coalition}" id="${id}"></div>';

var jstpl_player_board = '\<div id="pp_player_board_${id}" class="pp_player_board">\
    <div class="pp_icon_container">\
        <div id="loyalty_icon_${id}" class="pp_icon pp_loyalty_icon"><span id="influence_${id}" class="pp_icon_count">0</span></div>\
        <div id="cylinders_${id}" class="pp_icon pp_cylinder_icon"><span id="cylinder_count_${id}"  class="pp_icon_count">0</span></div>\
        <div id="rupees_${id}" class="pp_icon pp_player_board_rupee"><span id="rupee_count_${id}"  class="pp_icon_count">0</span></div>\
        <div id="cards_${id}" class="pp_icon pp_card_icon"><span id="card_count_${id}"  class="pp_icon_count">0</span></div>\
    </div>\
    <div id="suits_${id}" class="pp_icon_container">\
        <div class="pp_icon pp_suit_icon political"><span id="political_${id}" class="pp_icon_count">0</span></div>\
        <div class="pp_icon pp_suit_icon intelligence"><span id="intelligence_${id}" class="pp_icon_count">0</span></div>\
        <div class="pp_icon pp_suit_icon economic"><span id="economic_${id}" class="pp_icon_count">0</span></div>\
        <div class="pp_icon pp_suit_icon military"><span id="military_${id}" class="pp_icon_count">0</span></div>\
    </div>\
</div>';


/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}" ></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}
