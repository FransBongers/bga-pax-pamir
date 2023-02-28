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

const getImpactIconText = ({ impactIcon }: { impactIcon: string }) => {
  switch (impactIcon) {
    case IMPACT_ICON_ARMY:
      return _('Place one coalition block of your loyalty on any border of this region. This piece is now an army.');
    case IMPACT_ICON_ROAD:
      return _('Place one coalition block of your loyalty on any border of this region. This piece is now a road.');
    case IMPACT_ICON_LEVERAGE:
      return _('Take two rupees from the bank. This card is leveraged.');
    case IMPACT_ICON_SPY:
      return _(
        "Place one of your cylinders on a card in any player's court that matches the played card's region. This piece is now a spy."
      );
    case IMPACT_ICON_TRIBE:
      return _('Place one of your cylinders in this region. This piece is now a tribe.');
    case IMPACT_ICON_ECONOMIC_SUIT:
      return _('Move the favored suit marker to the suit indicated.');
    case IMPACT_ICON_MILITARY_SUIT:
      return _('Move the favored suit marker to the suit indicated.');
    case IMPACT_ICON_POLITICAL_SUIT:
      return _('Move the favored suit marker to the suit indicated.');
    case IMPACT_ICON_INTELLIGENCE_SUIT:
      return _('Move the favored suit marker to the suit indicated.');
    default:
      return '';
  }
};

const tplTooltipImpactIcon = ({ impactIcon, loyalty }: { impactIcon: string; loyalty: string | null }): string => {
  console.log('tplTooltipImpactIcon', impactIcon);
  let icon = '';
  switch (impactIcon) {
    case IMPACT_ICON_ARMY:
      icon = `<div class="pp_army pp_${loyalty || 'neutral'}"></div>`;
      break;
    case IMPACT_ICON_ROAD:
      icon = `<div class="pp_road pp_${loyalty || 'neutral'}"></div>`;
      break;
    case IMPACT_ICON_TRIBE:
      icon = `<div class="pp_tooltip_impact_icon_tribe pp_impact_icon_${impactIcon}"></div>`;
      break;
    case IMPACT_ICON_LEVERAGE:
    case IMPACT_ICON_SPY:
    case IMPACT_ICON_ECONOMIC_SUIT:
    case IMPACT_ICON_MILITARY_SUIT:
    case IMPACT_ICON_POLITICAL_SUIT:
    case IMPACT_ICON_INTELLIGENCE_SUIT:
      icon = `<div class="pp_tooltip_impact_icon pp_impact_icon_${impactIcon}"></div>`;
      break;
    default:
      break;
  }
  return `<div class="pp_card_tooltip_section_container">
            <div class="pp_card_tooltip_section_inner_container">
              ${icon}
            </div>
            <span class="pp_impact_icon_text">${getImpactIconText({ impactIcon })}</span>
          </div>`;
};

const getCardActionText = ({ type }: { type: string }) => {
  switch (type) {
    case TYPE_BATTLE:
      return _(
        'At a single site (region or court card), remove any combination of enemy tribes, roads, spies or armies equal to rank. You cannot remove more units than you yourself have armies/spies in that battle.'
      );
    case TYPE_BETRAY:
      return _('Pay 2. Discard a card where you have a spy. You may take its prize.');
    case TYPE_BUILD:
      return _('Pay 2/4/6 to place 1, 2 or 3 blocks in any region you rule (as an army) or on adjacent borders (as a road).');
    case TYPE_GIFT:
      return _('Pay 2/4/6 to purchase 1st, 2nd or 3rd gift.');
    case TYPE_MOVE:
      return _('For each rank, move one spy or army.');
    case TYPE_TAX:
      return _(
        'Take rupees from market cards. If you rule a region, may take from players with at least one card associated with that region.'
      );
    default:
      return '';
  }
};

const tplTooltipCardAction = ({ type, rank }: { type: string; rank: number }) => {
  return `<div class="pp_card_tooltip_section_container">
    <div class="pp_card_tooltip_section_inner_container">
      <div class="pp_tooltip_card_action pp_card_action_${type} pp_rank_${rank}"></div>
    </div>
    <span class="pp_impact_icon_text">${getCardActionText({ type })}</span>
  </div>`;
};

const tplCourtCardTooltip = ({
  cardId,
  cardInfo,
  specialAbilities,
}: {
  cardId: string;
  cardInfo: CourtCard;
  specialAbilities: Record<string, { title: string; description: string }>;
}): string => {
  if (cardId === 'card_50') {
    console.log(cardId, cardInfo);
  }
  let impactIcons = '';
  if (cardInfo.impact_icons.length > 0) {
    impactIcons += `<span class="section_title">${_('Impact icons')}</span>`;
    new Set(cardInfo.impact_icons).forEach((icon) => {
      impactIcons += tplTooltipImpactIcon({ impactIcon: icon, loyalty: cardInfo.loyalty });
    });
  }

  let cardActions = '';
  if (Object.values(cardInfo.actions).length > 0) {
    cardActions += `<span class="section_title">${_('Card actions')}</span>`;
    Object.values(cardInfo.actions).forEach(({ type }: { type: string; left: number; top: number }) => {
      cardActions += tplTooltipCardAction({ type, rank: cardInfo.rank });
    });
  }

  let specialAbility = '';
  if (cardInfo.special_ability) {
    specialAbility = `<span class="section_title">${_(specialAbilities[cardInfo.special_ability].title)}</span>
    <span class="special_ability_text">${_(specialAbilities[cardInfo.special_ability].description)}</span>
    `;
  }

  return `<div class="pp_card_tooltip">
    <div class="pp_card_tooltip_inner_container">
      <span class="title">${cardInfo.name}</span>
      <span class="flavor_text">${(cardInfo as CourtCard).flavor_text}</span>
      ${impactIcons}
      ${cardActions}
      ${specialAbility}
      
    </div>
    <div class="pp_card pp_card_in_tooltip pp_${cardId}"></div>
  </div>`;
};
