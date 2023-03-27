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
        <svg id="pp_map_areas">
            <path id="pp_region_herat" class="pp_region" d="M 438,400 c 10,-30 12,-50 14,-70 c 0,-20 2,-40 4,-60 c 3,-24 0,-50 -30, -62 c -20,-10 -20,-11 -40,-25 c -60,-50 -72,-40 -97,-20 c -14,14 -32,22 -43,30 c -30,24 -50,47 -46,70 c 0,40, -1,60 3,80 C 210,380 209,390 209,400 Z" />
            <path id="pp_region_kabul" class="pp_region" d="M 353,2 c -1,60 -9,120 -23,136 c 10,3 20,8 30,16 c 10,7 20,15 30,21 c 20,17 30,22 40,26 c 15,8 21,13 25,18 c 15,-7 35,-4 50,-2 c 10,2 25,3 35,8 c 15,7 30,7 40,3 c 15,-3 20,-2 40,-6 c 18,-2 36,-9 54,-32 c 15,-40 25,-80 46,-109 C 740,60 748,38 756,2 Z" />
            <path id="pp_region_kandahar" class="pp_region" d="M 448,400 c 10,-30 12,-50 14,-70 c 0,-20 2,-40 4,-60 c 0,-20 0,-30 -6,-45 c 15,-4 30,-3 50,0 c 10,2 20,4 30,8 c 15,7 30,7 45,2 c 15,-4 40,-4 55,-9 c 5,10 10,12 18,40 C 671,300 696,385 700,400 Z" />
            <path id="pp_region_persia" class="pp_region" d="M 2,218 c 30,-5 70,-5 130,7 c 30,10, 45,17 61,17 c -2,15 -1,30 0,45 c -1,10 -1,20 0,40 C 198,370 202,380 200,400 L 2,400 Z" />
            <path id="pp_region_punjab" class="pp_region" d="M 817,2 v 398 h -107 c -22,-65 -42,-145 -62,-178 c 15,-10 31,-20 37,-40 c 10,-31 26,-80 46,-100 C 746,65 760,30 765,2 Z" />
            <path id="pp_region_transcaspia" class="pp_region" d="M 2,2 L 345,2 c -1,60 -9,120 -25,136 c -5,0 -16,3 -25,10 c -19,17 -31,25 -42,30 c -31,20 -42,40 -55,55 c -4,3 -8,1 -12,1 c -8,-1 -20,-4 -28,-8 C 115,208 40,202 2,210 Z" />
        </svg>
        <!-- ruler token positions -->
        <div id="pp_position_ruler_token_herat" class="pp_position_ruler_token"></div>
        <div id="pp_position_ruler_token_kabul" class="pp_position_ruler_token"></div>
        <div id="pp_position_ruler_token_kandahar" class="pp_position_ruler_token"></div>
        <div id="pp_position_ruler_token_persia" class="pp_position_ruler_token"></div>
        <div id="pp_position_ruler_token_punjab" class="pp_position_ruler_token"></div>
        <div id="pp_position_ruler_token_transcaspia" class="pp_position_ruler_token"></div>
        <!-- favored suit positions -->
        <div id="pp_favored_suit_political" class="pp_favored_suit"></div>
        <div id="pp_favored_suit_intelligence" class="pp_favored_suit"></div>
        <div id="pp_favored_suit_economic" class="pp_favored_suit"></div>
        <div id="pp_favored_suit_military" class="pp_favored_suit"></div>
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
        <!-- BEGIN vp_track_top -->
        <div id="pp_vp_track_{VP}" class="pp_vp_track" style="left: {LEFT}px; top: {TOP}px;">
        </div>
        <!-- END vp_track_top -->
        <!-- BEGIN vp_track_right -->
        <div id="pp_vp_track_{VP}" class="pp_vp_track" style="left: {LEFT}px; top: {TOP}px;">
        </div>
        <!-- END vp_track_right -->
        <!-- BEGIN vp_track_bottom -->
        <div id="pp_vp_track_{VP}" class="pp_vp_track" style="left: {LEFT}px; top: {TOP}px;">
        </div>
        <!-- END vp_track_bottom -->
    </div>
    
    <div id="pp_supply">
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
        </div>
        <!-- END market -->
        <div id="cards">
        </div>        
    </div>



    <div id="pp_player_tableaus">
        <div id="pp_active_events_container">
              <div id="pp_active_events_title" class="pp_tableau_title"><span>Active events</span></div>
            <div id="pp_active_events" class="pp_active_events"></div>
        </div>
        <!-- BEGIN player_hand -->
        <div id="pp_player_hand_{player_id}" class="pp_player_hand">
            <div id="pp_player_hand_title" class="pp_tableau_title"><span>{player_name}'s hand</span></div>
            <div id="pp_player_hand_cards" class="pp_player_hand_cards"></div>
        </div>
        <!-- END player_hand -->
        <!-- BEGIN player_tableau -->
        <div id="player_tableau_{player_id}" class="pp_player_tableau pp_player_color_{player_color}">
            <div class="pp_tableau_left">
                <div id="pp_ruler_tokens_player_{player_id}" class="pp_ruler_tokens_player"></div>
                <div class="pp_loyalty_dial_container">
                    <div id="pp_loyalty_dial_{player_id}" class="pp_loyalty_dial"></div>
                    <div class="pp_loyalty_dial_cover pp_player_color_{player_color}"></div>
                    <div id="pp_gift_2_{player_id}" class="pp_gift pp_gift_2">
                        <div id="pp_gift_2_zone_{player_id}" class="pp_gift_zone"></div>
                    </div>
                    <div id="pp_gift_4_{player_id}" class="pp_gift pp_gift_4">
                        <div id="pp_gift_4_zone_{player_id}" class="pp_gift_zone"></div>
                    </div>
                    <div id="pp_gift_6_{player_id}" class="pp_gift pp_gift_6">
                        <div id="pp_gift_6_zone_{player_id}" class="pp_gift_zone"></div>
                    </div>
                </div>
            </div>
            <div class="pp_player_tableau_right">
                <div class="pp_player_tableau_title_container">
                    <div id="pp_tableau_title_player_{player_id}" class="pp_player_tableau_title"><span>{player_name}'s court</span></div>
                    <div id="pp_tableau_title_icons_player_{player_id}" class="pp_player_tableau_icons">
                        <div id="rupees_tableau_{player_id}" class="pp_icon pp_player_board_rupee"><div id="rupee_count_tableau_{player_id}" class="pp_icon_count"><span id="rupee_count_tableau_{player_id}_counter"></span></div></div>
                        <div id="cards_tableau_{player_id}" class="pp_icon pp_card_icon_tableau"><div id="card_count_tableau_{player_id}" class="pp_icon_count"><span id="card_count_tableau_{player_id}_counter"></span></div></div>
                    </div>
                </div>
                <div class="pp_tableau_inner_container">
                    <div class="pp_tableau_inner_left">
                        <div id="pp_cylinders_player_{player_id}" class="pp_cylinders pp_cylinders_player_{player_id}"></div>
                    </div>
                    <div class="pp_tableau_inner_right">
                        <div id="pp_court_player_{player_id}" class="pp_court pp_court_player_{player_id}"></div>
                    </div>
                </div>
            </div>
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
var jstpl_cylinder='<div class="pp_cylinder pp_player_color_${color}" id="${id}"></div>';
var jstpl_coalition_block='<div class="pp_coalition_block pp_${coalition}" id="${id}"></div>';
var jstpl_favored_suit_marker='<div class="pp_favored_suit_marker" id="${id}"></div>';
var jstpl_ruler_token='<div class="pp_ruler_token pp_${region}" id="${id}"></div>';

var jstpl_player_board = '\<div id="pp_player_board_${id}" class="pp_player_board">\
    <div class="pp_icon_container">\
        <div id="loyalty_icon_${id}" class="pp_icon pp_loyalty_icon"><div id="influence_${id}" class="pp_icon_count"><span id="influence_${id}_counter"></span></div></div>\
        <div id="cylinders_${id}" class="pp_icon pp_cylinder_icon"><div id="cylinder_count_${id}" class="pp_icon_count"><span id="cylinder_count_${id}_counter"></span></div></div>\
        <div id="rupees_${id}" class="pp_icon pp_player_board_rupee"><div id="rupee_count_${id}" class="pp_icon_count"><span id="rupee_count_${id}_counter"></span></div></div>\
        <div id="cards_${id}" class="pp_icon pp_card_icon"><div id="card_count_${id}" class="pp_icon_count"><span id="card_count_${id}_counter"></span></div></div>\
    </div>\
    <div id="suits_${id}" class="pp_icon_container">\
        <div class="pp_icon pp_suit_icon political"><div id="political_${id}" class="pp_icon_count"><span id="political_${id}_counter"></span></div></div>\
        <div class="pp_icon pp_suit_icon intelligence"><div id="intelligence_${id}" class="pp_icon_count"><span id="intelligence_${id}_counter"></span></div></div>\
        <div class="pp_icon pp_suit_icon economic"><div id="economic_${id}" class="pp_icon_count"><span id="economic_${id}_counter"></span></div></div>\
        <div class="pp_icon pp_suit_icon military"><div id="military_${id}" class="pp_icon_count"><span id="military_${id}_counter"></span></div></div>\
    </div>\
</div>';


/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}" ></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}
