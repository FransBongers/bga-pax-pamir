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

    <div id="pp_player_hand">
        Player hand
    </div>

    <!-- BEGIN player_tableau -->
    <div id="player_tableau_{PLAYER_NUMBER}" class="pp_player_tableau" style="grid-column-start: {GRID_COLUMN_START}; grid-column-end: {GRID_COLUMN_END}; grid-row-start: {GRID_ROW_START}; grid-row-end: {GRID_ROW_END};">
        <div id="pp_tableau_title_player_{PLAYER_NUMBER}" class="pp_tableau_title"></div>
        <div id="pp_court_player_{PLAYER_NUMBER}" class="pp_court pp_court_player_{PLAYER_NUMBER}"></div>
    </div>
    <!-- END player_tableau -->

    <div id="pp_map">

    </div>
    

    <div id="pp_market_board">
        <!-- BEGIN market -->
        <div id="market_{ROW}_{COLUMN}" class="pp_market" style="left: {LEFT}px; top: {TOP}px;">
            <div id="market_{ROW}_{COLUMN}_coin_zone" class="pp_market_coin_zone"></div>
        </div>
        <!-- END market -->
        <div id="cards">
        </div>        
    </div>


    <!-- 
    <div id="coins">
    </div>
    -->
 </div>

<script type="text/javascript">

// Javascript HTML templates

var jstpl_card='<div class="pp_card pp_${card}" id="pp_${card}"></div>';
var jstpl_coin='<div class="pp_coin" id="pp_coin_${number}"></div>';

var jstpl_player_board = '\<div id="pp_player_board_{id}" class="pp_player_board">\
    <div class="pp_icon_container">\
        <div id="loyalty_icon_${id}" class="pp_icon pp_loyalty_icon"><span id="influence_${id}" class="pp_icon_count">0</span></div>\
        <div id="tokens_${id}" class="pp_icon pp_token_icon"><span id="token_count_${id}"  class="pp_icon_count">0</span></div>\
        <div id="coins_${id}" class="pp_icon pp_player_board_coin"><span id="coin_count_${id}"  class="pp_icon_count">0</span></div>\
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
