{OVERALL_GAME_HEADER}

<div id="pp_play_area">
    <div id="pp_map">
        <!-- alternative solution with clip-path
        <div id="pp_map_areas">
            <div id="pp_region_herat" class="pp_region"></div>
        </div>
        -->
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
            <div id="pp_dominant_coalition_banner"></div>
            <div id="pp_afghan_coalition_blocks" class="pp_coalition_blocks">
            </div>
            <div id="pp_british_coalition_blocks" class="pp_coalition_blocks">
            </div>
            <div id="pp_russian_coalition_blocks" class="pp_coalition_blocks">
            </div>
        </div>
        <div id="pp_market_deck_container">
            <div id="pp_temp_discarded_card">
            </div>
            <div id="pp_discard_pile">
                <span>Discard</span>
                <div id="pp_pile_discarded_card" class="pp_discarded_card"></div>
                <div class="pp_deck_counters_container" style="position: absolute; right: -4px; bottom: -4px;">
                    <div id="pp_discard_pile_counter_container" class="pp_card_counter_container">
                        <div class="pp_court_card_icon pp_deck_counter_icon"></div style="margin-bottom: 2px;"><span>:</span>
                        <span id="pp_discard_pile_counter" class="pp_card_counter"></span>
                    </div>
                    <div id="pp_discard_pile_counter_dominance_check_container" class="pp_card_counter_container">
                        <div class="pp_dominance_check_icon pp_deck_counter_icon"></div style="margin-bottom: 2px;"><span>:</span>
                        <span id="pp_discard_pile_counter_dominance_check" class="pp_card_counter"></span>
                    </div>
                </div>
            </div>
            <div id="pp_market_deck">
                <div class="pp_deck_counters_container">
                    <div id="pp_deck_counter_container" class="pp_card_counter_container">
                        <div class="pp_court_card_icon pp_deck_counter_icon"></div style="margin-bottom: 2px;"><span>:</span>
                        <span id="pp_deck_counter" class="pp_card_counter"></span>
                    </div>
                    <div id="pp_deck_counter_dominance_check_container" class="pp_card_counter_container">
                        <div class="pp_dominance_check_icon pp_deck_counter_icon"></div style="margin-bottom: 2px;"><span>:</span>
                        <span id="pp_deck_counter_dominance_check" class="pp_card_counter"></span>
                    </div>
                </div>
            </div>
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
    </div>
 </div>

<script type="text/javascript">

// Javascript HTML templates


/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}" ></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}
