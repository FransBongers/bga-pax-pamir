const tplCard = ({ cardId, extraClasses }: { cardId: string; extraClasses?: string; }): string => {
  return `<div id="${cardId}" class="pp_card pp_card_in_zone pp_${cardId}${extraClasses ? ' ' + extraClasses : ''}"></div>`;
};

const tplCardSelect = ({ side }: { side: string; }): string => {
  return `<div id="pp_card_select_${side}" class="pp_card_select_side"></div>`;
};

const tplRupee = ({rupeeId}:{rupeeId: string;}) => {
  return `<div class="pp_rupee" id="${rupeeId}">
            <div class="pp_rupee_inner"></div>
          </div>`
}