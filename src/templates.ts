const tplCard = ({ cardId, extraClasses }: { cardId: string; extraClasses?: string }): string => {
  return `<div id="${cardId}" class="pp_card pp_card_in_zone pp_${cardId}${extraClasses ? ' ' + extraClasses : ''}"></div>`;
};

const tplCardSelect = ({ side }: { side: string }): string => {
  return `<div id="pp_card_select_${side}" class="pp_card_select_side"></div>`;
};

const tplRupee = ({ rupeeId }: { rupeeId: string }) => {
  return `<div class="pp_rupee" id="${rupeeId}">
            <div class="pp_rupee_inner"></div>
          </div>`;
};

// Rupee with counter in right bottom.
const tplRupeeCount = ({id}:{id: string;}) => {
  return `<div id="rupees_${id}" class="pp_icon pp_player_board_rupee"><div id="rupee_count_${id}" class="pp_icon_count"><span id="rupee_count_${id}_counter"></span></div></div>`
};

// Card background with counter in right bottom
const tplHandCount = ({id}:{id: string;}) => {
  return `<div id="cards_${id}" class="pp_icon pp_card_icon"><div id="card_count_${id}" class="pp_icon_count"><span id="card_count_${id}_counter"></span></div></div>`
};
