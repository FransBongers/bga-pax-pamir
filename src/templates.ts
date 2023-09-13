const tplArmy = ({ coalition, id, classesToAdd }: { id: string; coalition: string; classesToAdd?: string[] }): string => {
  return `<div class="pp_army pp_${coalition}${(classesToAdd || []).map((classToAdd) => ` ${classToAdd}`)}" id="${id}"></div>`;
};

const tplCard = ({
  cardId,
  cardIdSuffix = '',
  extraClasses,
  style,
}: {
  cardId: string;
  cardIdSuffix?: string;
  extraClasses?: string;
  style?: string;
}): string => {
  return `<div id="${cardId}${cardIdSuffix}" class="pp_card pp_card_in_zone pp_${cardId}${
    extraClasses ? ' ' + extraClasses : ''
  }"${style ? ` style="${style}"` : ''}></div>`;
};

const tplCardSelect = ({ side }: { side: string }): string => {
  return `<div id="pp_card_select_${side}" class="pp_card_select_side"></div>`;
};

const tplCoalitionBlock = ({ coalition, id }: { id: string; coalition: string }): string => {
  return `<div class="pp_coalition_block pp_${coalition}" id="${id}"></div>`;
};

const tplCylinder = ({ color, id }: { id: string; color: string }) => {
  return `<div class="pp_cylinder pp_player_color_${color}" id="${id}"></div>`;
};

const tplFavoredSuit = ({ id }: { id: string }) => {
  return `<div class="pp_favored_suit_marker" id="${id}"></div>`;
};

const tplRoad = ({ coalition, id, classesToAdd }: { id: string; coalition: string; classesToAdd?: string[] }): string => {
  return `<div class="pp_road pp_${coalition}${(classesToAdd || []).map((classToAdd) => ` ${classToAdd}`)}" id="${id}"></div>`;
};

const tplRupee = ({ rupeeId }: { rupeeId: string }) => {
  return `<div class="pp_rupee" id="${rupeeId}">
            <div class="pp_rupee_inner"></div>
          </div>`;
};

const tplRulerToken = ({ id, region }: { id: string; region: string }) => {
  return `<div class="pp_ruler_token pp_${region}" id="${id}"></div>`;
};

// Rupee with counter in right bottom.
const tplRupeeCount = ({ id }: { id: string }) => {
  return `<div id="rupees_${id}" class="pp_icon pp_player_board_rupee"><div id="rupee_count_${id}" class="pp_icon_count"><span id="rupee_count_${id}_counter"></span></div></div>`;
};

// Card background with counter in right bottom
const tplHandCount = ({ id }: { id: string }) => {
  return `<div id="cards_${id}" class="pp_icon pp_card_icon"><div id="card_count_${id}" class="pp_icon_count"><span id="card_count_${id}_counter"></span></div></div>`;
};

const createCards = ({ cards }: { cards: string[] }) => {
  let result: string = '';
  cards.forEach((cardId) => {
    result += tplCard({ cardId, cardIdSuffix: '_modal' });
  });
  return result;
};

const tplPlayerHandModal = ({ cards }: { cards: string[] }) => {
  return `<div class="pp_player_hand_modal_content">
            ${createCards({ cards })}
          </div>`;
};

const tplActiveEvents = () => {
  return `<div id="pp_active_events_container">
            <div id="pp_active_events_title" class="pp_tableau_title"><span>Active events</span></div>
            <div id="pp_active_events" class="pp_active_events"></div>
          </div>`
}

const tplPlayerHand = ({playerId, playerName}: {playerId: number; playerName: string;}) => {
  return `<div id="pp_player_hand_${playerId}" class="pp_player_hand">
            <div id="pp_player_hand_title" class="pp_tableau_title"><span>${playerName}'s hand</span></div>
            <div id="pp_player_hand_cards" class="pp_player_hand_cards"></div>
          </div>`
}

const tplPlayerBoard = ({playerId}: {playerId: number}) => {
  return `<div id="pp_player_board_${playerId}" class="pp_player_board">
    <div class="pp_icon_container">
        <div id="loyalty_icon_${playerId}" class="pp_icon pp_loyalty_icon"><div id="influence_${playerId}" class="pp_icon_count"><span id="influence_${playerId}_counter"></span></div></div>
        <div id="cylinders_${playerId}" class="pp_icon pp_cylinder_icon"><div id="cylinder_count_${playerId}" class="pp_icon_count"><span id="cylinder_count_${playerId}_counter"></span></div></div>
        <div id="rupees_${playerId}" class="pp_icon pp_player_board_rupee"><div id="rupee_count_${playerId}" class="pp_icon_count"><span id="rupee_count_${playerId}_counter"></span></div></div>
        <div id="cards_${playerId}" class="pp_icon pp_card_icon"><div id="card_count_${playerId}" class="pp_icon_count"><span id="card_count_${playerId}_counter"></span></div></div>
    </div>
    <div id="suits_${playerId}" class="pp_icon_container">
        <div class="pp_icon pp_suit_icon political"><div id="political_${playerId}" class="pp_icon_count"><span id="political_${playerId}_counter"></span></div></div>
        <div class="pp_icon pp_suit_icon intelligence"><div id="intelligence_${playerId}" class="pp_icon_count"><span id="intelligence_${playerId}_counter"></span></div></div>
        <div class="pp_icon pp_suit_icon economic"><div id="economic_${playerId}" class="pp_icon_count"><span id="economic_${playerId}_counter"></span></div></div>
        <div class="pp_icon pp_suit_icon military"><div id="military_${playerId}" class="pp_icon_count"><span id="military_${playerId}_counter"></span></div></div>
    </div>
</div>`
}

const tplPlayerBoardWakhan = ({playerId}: {playerId: number}) => {
  return `<div id="pp_player_board_${playerId}" class="pp_player_board">
    <div class="pp_icon_container">
        <div id="loyalty_icon_${playerId}_afghan" class="pp_icon pp_loyalty_icon pp_afghan"><div id="influence_${playerId}_afghan" class="pp_icon_count"><span id="influence_${playerId}_afghan_counter"></span></div></div>
        <div id="loyalty_icon_${playerId}_british" class="pp_icon pp_loyalty_icon pp_british"><div id="influence_${playerId}_british" class="pp_icon_count"><span id="influence_${playerId}_british_counter"></span></div></div>
        <div id="loyalty_icon_${playerId}_russian" class="pp_icon pp_loyalty_icon pp_russian"><div id="influence_${playerId}_russian" class="pp_icon_count"><span id="influence_${playerId}_russian_counter"></span></div></div>
        <div id="cylinders_${playerId}" class="pp_icon pp_cylinder_icon"><div id="cylinder_count_${playerId}" class="pp_icon_count"><span id="cylinder_count_${playerId}_counter"></span></div></div>        
    </div>
    <div id="suits_${playerId}" class="pp_icon_container">
        <div class="pp_icon pp_suit_icon political"><div id="political_${playerId}" class="pp_icon_count"><span id="political_${playerId}_counter"></span></div></div>
        <div class="pp_icon pp_suit_icon intelligence"><div id="intelligence_${playerId}" class="pp_icon_count"><span id="intelligence_${playerId}_counter"></span></div></div>
        <div class="pp_icon pp_suit_icon economic"><div id="economic_${playerId}" class="pp_icon_count"><span id="economic_${playerId}_counter"></span></div></div>
        <div class="pp_icon pp_suit_icon military"><div id="military_${playerId}" class="pp_icon_count"><span id="military_${playerId}_counter"></span></div></div>
        <div id="rupees_${playerId}" class="pp_icon pp_player_board_rupee"><div id="rupee_count_${playerId}" class="pp_icon_count"><span id="rupee_count_${playerId}_counter"></span></div></div>
    </div>
</div>`
}

const tplPlayerTableau = ({playerId, playerColor, playerName}: {playerId: number; playerColor: string; playerName: string;}) => {
  return `<div id="player_tableau_${playerId}" >
  <div class="pp_player_tableau pp_player_color_${playerColor}">
      <div class="pp_tableau_left">
          <div id="pp_ruler_tokens_player_${playerId}" class="pp_ruler_tokens_player"></div>
          <div class="pp_loyalty_dial_section">
              <div id="pp_prizes_${playerId}" class="pp_prizes"></div>
              <div class="pp_loyalty_dial_container">
                  <div id="pp_loyalty_dial_${playerId}" class="pp_loyalty_dial"></div>
                  <div class="pp_loyalty_dial_cover pp_player_color_${playerColor}"></div>
                  <div id="pp_gift_2_${playerId}" class="pp_gift pp_gift_2">
                      <div id="pp_gift_2_zone_${playerId}" class="pp_gift_zone"></div>
                  </div>
                  <div id="pp_gift_4_${playerId}" class="pp_gift pp_gift_4">
                      <div id="pp_gift_4_zone_${playerId}" class="pp_gift_zone"></div>
                  </div>
                  <div id="pp_gift_6_${playerId}" class="pp_gift pp_gift_6">
                      <div id="pp_gift_6_zone_${playerId}" class="pp_gift_zone"></div>
                  </div>
              </div>
          </div>
      </div>
      <div class="pp_player_tableau_right">
          <div class="pp_player_tableau_title_container">
              <div id="pp_tableau_title_player_${playerId}" class="pp_player_tableau_title"><span>${playerName}'s court</span></div>
              <div id="pp_tableau_title_icons_player_${playerId}" class="pp_player_tableau_icons">
                  <div id="rupees_tableau_${playerId}" class="pp_icon pp_player_board_rupee"><div id="rupee_count_tableau_${playerId}" class="pp_icon_count"><span id="rupee_count_tableau_${playerId}_counter"></span></div></div>
                  <div id="cards_tableau_${playerId}" class="pp_icon pp_card_icon_tableau"><div id="card_count_tableau_${playerId}" class="pp_icon_count"><span id="card_count_tableau_${playerId}_counter"></span></div></div>
              </div>
          </div>
          <div class="pp_tableau_inner_container">
              <div class="pp_tableau_inner_left">
                  <div id="pp_cylinders_player_${playerId}" class="pp_cylinders pp_cylinders_player_${playerId}"></div>
              </div>
              <div class="pp_tableau_inner_right">
                  <div id="pp_court_player_${playerId}" class="pp_court pp_court_player_${playerId}"></div>
              </div>
          </div>
      </div>
  </div>
  <div id="pp_player_events_container_${playerId}" class="pp_player_events_container">
      <div id="player_tableau_events_${playerId}">
      </div>
  </div>
</div>`
}
// <span class="player_elo_wrap">• <div class="gamerank gamerank_average "><span class="icon20 icon20_rankw"></span> <span class="gamerank_value" id="player_elo_1" "="">9001</span></div></span>
const tplWakhanPlayerPanel = ({name}: {name: string;}) => {
  return `<div id="overall_player_board_1" class="player-board">
            <div class="player_board_inner" id="player_board_inner_8A70B2">
              <div class="emblemwrap" id="avatarwrap_1">
                  <div class="pp_wakhan_avatar avatar emblem" id="avatar_1"></div>
              </div>
              <div class="player-name" id="player_name_1">
                <a style="color: #8A70B2">${name}</a>
              </div>
              <div id="player_board_1" class="player_board_content">
                <div class="player_score" style="margin-top: 5px;">
                  <span id="player_score_1" class="player_score_value"></span> <i class="fa fa-star" id="icon_point_1"></i>
                </div>
              </div>
            </div>
          </div>`
}

const tplWakhanTableau = ({playerId, playerColor, playerName}: {playerId: number; playerColor: string; playerName: string;}) => {
  return `<div id="player_tableau_${playerId}" >
            <div class="pp_player_tableau pp_player_color_${playerColor}">
                <div class="pp_wakhan_tableau_left">
                    <div id="pp_ruler_tokens_player_${playerId}" class="pp_ruler_tokens_player"></div>
                    <div class="pp_wakhan_deck_container">
                      <div id="pp_wakhan_deck" class="pp_wakhan_card"></div>
                      <div id="pp_wakhan_discard" class="pp_wakhan_card"></div>
                    </div>
                </div>
                <div class="pp_player_tableau_right">
                    <div class="pp_player_tableau_title_container">
                        <div id="pp_tableau_title_player_${playerId}" class="pp_player_tableau_title"><span>${playerName}'s court</span></div>
                        <div id="pp_tableau_title_icons_player_${playerId}" class="pp_player_tableau_icons">
                            <div id="rupees_tableau_${playerId}" class="pp_icon pp_player_board_rupee"><div id="rupee_count_tableau_${playerId}" class="pp_icon_count"><span id="rupee_count_tableau_${playerId}_counter"></span></div></div>
                        </div>
                    </div>
                    <div class="pp_tableau_inner_container">
                        <div class="pp_tableau_inner_left">
                            <div id="pp_cylinders_player_${playerId}" class="pp_cylinders pp_cylinders_player_${playerId}"></div>
                        </div>
                        <div class="pp_tableau_inner_right">
                            <div id="pp_court_player_${playerId}" class="pp_court pp_court_player_${playerId}"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="pp_player_events_container_${playerId}" class="pp_player_events_container">
                <div id="player_tableau_events_${playerId}">
                </div>
            </div>
          </div>`
}