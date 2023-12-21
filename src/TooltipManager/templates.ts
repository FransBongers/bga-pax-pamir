// ..######...#######..##.....##.########..########.....######.....###....########..########.
// .##....##.##.....##.##.....##.##.....##....##.......##....##...##.##...##.....##.##.....##
// .##.......##.....##.##.....##.##.....##....##.......##........##...##..##.....##.##.....##
// .##.......##.....##.##.....##.########.....##.......##.......##.....##.########..##.....##
// .##.......##.....##.##.....##.##...##......##.......##.......#########.##...##...##.....##
// .##....##.##.....##.##.....##.##....##.....##.......##....##.##.....##.##....##..##.....##
// ..######...#######...#######..##.....##....##........######..##.....##.##.....##.########.

const tplCardTooltipContainer = ({ card, content }: { card: string; content: string }): string => {
  return `<div class="pp_card_tooltip">
  <div class="pp_card_tooltip_inner_container">
    ${content}
  </div>
  ${card}
</div>`;
};

const getImpactIconText = ({ impactIcon }: { impactIcon: string }) => {
  switch (impactIcon) {
    case IMPACT_ICON_ARMY:
      return _('Place one coalition block of your loyalty in this region. This piece is now an army.');
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
  let icon = '';
  switch (impactIcon) {
    case IMPACT_ICON_ARMY:
      icon = `<div class="pp_tooltip_impact_icon pp_impact_icon_army_${loyalty || 'neutral'}"></div>`;
      break;
    case IMPACT_ICON_ROAD:
      icon = `<div class="pp_tooltip_impact_icon pp_impact_icon_road_${loyalty || 'neutral'}"></div>`;
      break;
    case IMPACT_ICON_TRIBE:
      icon = `<div class="pp_tooltip_impact_icon pp_impact_icon_${impactIcon}"></div>`;
      break;
    case IMPACT_ICON_LEVERAGE:
    case IMPACT_ICON_SPY:
      icon = `<div class="pp_tooltip_impact_icon pp_impact_icon_${impactIcon}"></div>`;
      break;
    case IMPACT_ICON_ECONOMIC_SUIT:
    case IMPACT_ICON_MILITARY_SUIT:
    case IMPACT_ICON_POLITICAL_SUIT:
    case IMPACT_ICON_INTELLIGENCE_SUIT:
      icon = `<div class="pp_tooltip_impact_icon pp_impact_icon_suit ${impactIcon}"></div>`;
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
    case BATTLE:
      return _(
        'At a single site (region or court card), remove any combination of enemy tribes, roads, spies or armies equal to rank. You cannot remove more units than you yourself have armies/spies in that battle.'
      );
    case BETRAY:
      return _('Pay 2. Discard a card where you have a spy. You may take its prize.');
    case BUILD:
      return _('Pay 2/4/6 to place 1, 2 or 3 blocks in any region you rule (as an army) or on adjacent borders (as a road).');
    case GIFT:
      return _('Pay 2/4/6 to purchase 1st, 2nd or 3rd gift.');
    case MOVE:
      return _('For each rank, move one spy or army.');
    case TAX:
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
  let impactIcons = '';
  if (cardInfo.impactIcons.length > 0) {
    impactIcons += `<span class="pp_section_title">${_('Impact icons')}</span>`;
    new Set(cardInfo.impactIcons).forEach((icon) => {
      impactIcons += tplTooltipImpactIcon({ impactIcon: icon, loyalty: cardInfo.loyalty });
    });
  }

  let cardActions = '';
  if (Object.values(cardInfo.actions).length > 0) {
    cardActions += `<span class="pp_section_title">${_('Card actions')}</span>`;
    Object.values(cardInfo.actions).forEach(({ type }: { type: string; left: number; top: number }) => {
      cardActions += tplTooltipCardAction({ type, rank: cardInfo.rank });
    });
  }

  let specialAbility = '';
  if (cardInfo.specialAbility) {
    specialAbility = `<span class="pp_section_title">${_(specialAbilities[cardInfo.specialAbility].title)}</span>
    <span class="pp_special_ability_text">${_(specialAbilities[cardInfo.specialAbility].description)}</span>
    `;
  }

  return tplCardTooltipContainer({
    card: `<div class="pp_card pp_card_in_tooltip pp_${cardId}"></div>`,
    content: `
  <span class="pp_title">${_(cardInfo.name)}</span>
  <span class="pp_flavor_text">${_((cardInfo as CourtCard).flavorText)}</span>
  ${impactIcons}
  ${cardActions}
  ${specialAbility}
  `,
  });
};

// .########.##.....##.########.##....##.########.....######.....###....########..########.
// .##.......##.....##.##.......###...##....##.......##....##...##.##...##.....##.##.....##
// .##.......##.....##.##.......####..##....##.......##........##...##..##.....##.##.....##
// .######...##.....##.######...##.##.##....##.......##.......##.....##.########..##.....##
// .##........##...##..##.......##..####....##.......##.......#########.##...##...##.....##
// .##.........##.##...##.......##...###....##.......##....##.##.....##.##....##..##.....##
// .########....###....########.##....##....##........######..##.....##.##.....##.########.

const tplEventCardTooltipDiscarded = ({ title, description, effect }: EventCard['discarded']) => {
  if ([ECE_INTELLIGENCE_SUIT, ECE_MILITARY_SUIT, ECE_POLITICAL_SUIT].includes(effect)) {
    const eventEffectImpactIconMap = {
      [ECE_INTELLIGENCE_SUIT]: IMPACT_ICON_INTELLIGENCE_SUIT,
      [ECE_MILITARY_SUIT]: IMPACT_ICON_MILITARY_SUIT,
      [ECE_POLITICAL_SUIT]: IMPACT_ICON_POLITICAL_SUIT,
    };
    const impactIcon = eventEffectImpactIconMap[effect];
    return tplTooltipImpactIcon({ impactIcon, loyalty: null });
  } else {
    return `<span class="pp_event_effect_text" style="margin-bottom: 16px;">${_(description) || ''}</span>`;
  }
};

const tplEventCardTooltip = ({ cardId, cardInfo }: { cardId: string; cardInfo: EventCard }): string => {
  return tplCardTooltipContainer({
    card: `<div class="pp_card pp_card_in_tooltip pp_${cardId}"></div>`,
    content: `
    <span class="pp_title">${_('Event card')}</span>
    <span class="pp_flavor_text">${_(
      "Each event card has two effects. The bottom effect is triggered if it is purchased by a player. The top effect is triggered if the card is automatically discarded during the cleanup phase at the end of a player's turn."
    )}</span>
    <span class="pp_section_title">${_('If discarded: ')}${_(cardInfo.discarded.title) || ''}</span>
     ${tplEventCardTooltipDiscarded(cardInfo.discarded)} 
    <span class="pp_section_title">${cardId !== 'card_111' ? _('If purchased: ') : _('Until discarded: ')}${
      _(cardInfo.purchased.title) || ''
    }</span>
    <span class="pp_event_effect_text">${_(cardInfo.purchased.description) || ''}</span>
  `,
  });
};
// .####..######...#######..##....##
// ..##..##....##.##.....##.###...##
// ..##..##.......##.....##.####..##
// ..##..##.......##.....##.##.##.##
// ..##..##.......##.....##.##..####
// ..##..##....##.##.....##.##...###
// .####..######...#######..##....##

const tplIconToolTip = ({
  title,
  text,
  iconHtml,
  iconWidth,
}: {
  title?: string;
  text: string;
  iconHtml: string;
  iconWidth?: number;
}): string => {
  return `<div class="pp_icon_tooltip">
            <div class="pp_icon_tooltip_icon"${iconWidth ? `style="min-width: ${iconWidth}px;"` : ''}>
              ${iconHtml}
            </div>
            <div class="pp_icon_tooltip_content">
              ${title ? `<span class="pp_tooltip_title" >${title}</span>` : ''}
              <span class="pp_tooltip_text">${text}</span>
            </div>
          </div>`;
};

const tplCylinderCountToolTip = ({ playerColor }: { playerColor: string }) =>
  tplIconToolTip({
    iconHtml: `<div class="pp_icon pp_cylinder_icon pp_player_color_${playerColor}"></div>`,
    title: _('CYLINDERS IN PLAY'),
    text: _(
      'When a Dominance Check is unsuccessful, players will score points based on the number of cylinders they have in play (even zero).'
    ),
  });

const tplRupeeCountToolTip = () =>
  tplIconToolTip({
    iconHtml: `<div class="pp_icon pp_player_board_rupee"></div>`,
    title: _('RUPEES'),
    text: _('The number of rupees owned by this player.'),
  });

const tplHandCountCountToolTip = () =>
  tplIconToolTip({
    iconHtml: `<div class="pp_icon pp_card_icon"></div>`,
    title: _('CARDS IN HAND'),
    text: _('The number of cards this player has in hand.'),
    iconWidth: 32,
  });

const tplInfluenceCountToolTip = ({ coalition, black = false }: { coalition: string; black?: boolean }) =>
  tplIconToolTip({
    iconHtml: `<div class="pp_icon pp_loyalty_icon${black ? '_black' : ''} pp_${coalition}"></div>`,
    title: _('LOYALTY AND INFLUENCE'),
    text: _(
      'When a Dominance Check is successful, players loyal to the Dominant Coalition will score points based on their influence points. Each loyal player has one influence point plus the sum of their gifts, prizes, and the number of patriots in their court.'
    ),
  });

// ..######..##.....##.####.########..######.
// .##....##.##.....##..##.....##....##....##
// .##.......##.....##..##.....##....##......
// ..######..##.....##..##.....##.....######.
// .......##.##.....##..##.....##..........##
// .##....##.##.....##..##.....##....##....##
// ..######...#######..####....##.....######.

const tplSuitToolTip = ({ suit }: { suit: 'economic' | 'intelligence' | 'military' | 'political' }): string => {
  const SUIT_TITLE = {
    economic: _('TAX SHELTER'),
    intelligence: _('HAND SIZE'),
    military: _('FINAL TIES'),
    political: _('COURT SIZE'),
  };
  const SUIT_DESCRIPTION = {
    economic: _(
      'The economic suit determines your tax shelter. Your tax shelter is equal to the number of Economic Stars in your court. Opponents may only tax rupees in excess of this.'
    ),
    intelligence: _(
      'The intelligence suit determines your hand size. Your hand size is equal to 2 plus the number of Intelligence Stars in your court. During cleanup, you must discard your hand down to this.'
    ),
    military: _(
      'The military suit is the final score tie-breaker. If final score is tied, the number of Military Stars in your court determines victory.'
    ),
    political: _(
      'The political suit determines your court size. Your court size is equal to 3 plus the number of Political Stars in your court. During cleanup, you must discard your court down to this.'
    ),
  };

  return `<div class="pp_suit_tooltip">
            <div class="pp_icon pp_suit_icon ${suit}" style="min-width: 44px; margin-left: -2px;"></div>
            <div class="pp_suit_tooltip_content">  
              <span class="pp_tooltip_title" >${SUIT_TITLE[suit]}</span>
              <span class="pp_tooltip_text">${SUIT_DESCRIPTION[suit]}</span>
            </div>
          </div>`;
};

const tplFavoredSuitMarkerToolTip = (): string => {
  const title = _('FAVORED SUIT MARKER');
  const text = _(
    'This marker is on the currently favored suit. This suit determines which cards take bonus actions and makes cards more expensive when the favored suit is military.'
  );

  return `<div class="pp_suit_tooltip">
            <div class="pp_favored_suit_marker" style="min-width: 30px; background-position: center; margin-left: -4px;"></div>
            <div class="pp_suit_tooltip_content">  
              <span class="pp_tooltip_title" >${title}</span>
              <span class="pp_tooltip_text">${text}</span>
            </div>
          </div>`;
};

const tplMarketMilitaryCostToolTip = (): string => {
  const title = _('CARD COST DOUBLED');
  const text = _('Because military cards are favored the cost to purchase cards is currently doubled. Two rupees are placed on each card instead of one.');

  return `<div class="pp_suit_tooltip">
            <div class="pp_military_cost_icon" style="min-width: 53px; margin-right: 4px;"></div>
            <div class="pp_suit_tooltip_content">  
            <span class="pp_tooltip_title" >${title}</span>
              <span class="pp_tooltip_text">${text}</span>
            </div>
          </div>`;
};

// ..######...######...#######..########..########..######.
// .##....##.##....##.##.....##.##.....##.##.......##....##
// .##.......##.......##.....##.##.....##.##.......##......
// ..######..##.......##.....##.########..######....######.
// .......##.##.......##.....##.##...##...##.............##
// .##....##.##....##.##.....##.##....##..##.......##....##
// ..######...######...#######..##.....##.########..######.

const tplVirtualScoresTooltip = () => {
  return `
    <div class="pp_virtual_score_tooltip">
      <span class="pp_tooltip_title" >${_('Victory')}</span>
      <span class="pp_tooltip_text">${_('description')}</span>
    </div>
  `;
};

// .##......##....###....##....##.##.....##....###....##....##
// .##..##..##...##.##...##...##..##.....##...##.##...###...##
// .##..##..##..##...##..##..##...##.....##..##...##..####..##
// .##..##..##.##.....##.#####....#########.##.....##.##.##.##
// .##..##..##.#########.##..##...##.....##.#########.##..####
// .##..##..##.##.....##.##...##..##.....##.##.....##.##...###
// ..###..###..##.....##.##....##.##.....##.##.....##.##....##

const tplWakhanCardTooltip = ({
  wakhanDeckCardId,
  wakhanDiscardCardId,
  game,
}: {
  wakhanDeckCardId: string;
  wakhanDiscardCardId: string;
  game: PaxPamirGame;
}) => {
  const WAKHAN_ARROW_DESCRIPTION = {
    [BOTTOM_RIGHT]: _('Bottom (right)'),
    [TOP_LEFT]: _('Top (left)'),
  };
  const WAKHAN_ACTION_DESCRIPTION = {
    [BATTLE]: _('Battle'),
    [BETRAY]: _('Betray'),
    [BUILD]: _('Build'),
    [GIFT]: _('Gift'),
    [MOVE]: _('Move'),
    [TAX]: _('Tax'),
    [RADICALIZE]: _('Radicalize'),
    [RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY]: _(
      'If military cards are favored, radicalize the highest ranked military card'
    ),
    [RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC]: _(
      'If political cards are favored, radicalize the highest ranked economic card'
    ),
    [RADICALIZE_HIGHEST_RANKED_POLITICAL]: _('Radicalize the highest ranked political card'),
    [RADICALIZE_HIGHEST_RANKED_INTELLIGENCE]: _('Radicalize the highest ranked intelligence card'),
    [RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES]: _(
      'If Wakhan has fewer than 2 Rupees, radicalize the card that will net the most rupees'
    ),
    [RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION]: _('Radicalize a card that will gain Wakhan control of a region'),
    [RADICALIZE_INTELLIGENCE]: _('Radicalize an intelligence card'),
    [RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS]: _('Radicalize the card that would place most armies and/or roads'),
    [RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS]: _(
      'If no coalition has dominance, radicalize the card that would place the most spies and/or tribes'
    ),
    [RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION]: _(
      'If Wakhan has no card with the move action, radicalize a card with the move action'
    ),
    [RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT]: _('If a coalition has dominance radicalize a matching patriot'),
    [RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL]: _(
      "If Wakhan's court size is at its limit, radicalize the highest ranked political card"
    ),
    [RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE]: _(
      'If Wakhan has fewer spies than another player then radicalize the highest ranked intelligence card'
    ),
    [BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY]: _(
      'Battle on the highest priority court card with the most spies where Wakhan also has at least one spy'
    ),
  };

  const topOfDeck = game.getWakhanCardInfo({ wakhanCardId: wakhanDeckCardId }).back;
  const topOfDiscard = game.getWakhanCardInfo({ wakhanCardId: wakhanDiscardCardId }).front;

  return tplCardTooltipContainer({
    card: `<div class="pp_wakhan_card_in_tooltip pp_${wakhanDiscardCardId}_front"></div>`,
    content: `
    <span class="pp_title">${_('AI card')}</span>
    <span class="pp_flavor_text">${_(
      'Each turn Wakhan draws an AI card. The face-up card and the back of the card on top of the draw deck are used to make decisions for Wakhan.'
    )}</span>
    <span class="pp_section_title">${_('Pragmatic Loyalty')}</span>
    <div style="display: flex; flex-direction: row;">
      ${topOfDiscard.pragmaticLoyalty.map((coalition) => `<div class="pp_wakhan_icon pp_${coalition}"></div>`).join('')}
    </div>
    <span class="pp_section_title">${_("Wakhan's Actions")}</span>
    ${topOfDiscard.actions
      .map((action) => `<span class="pp_tooltip_text pp_wakhan_action">${WAKHAN_ACTION_DESCRIPTION[action]}</span>`)
      .join('')}
    <span class="pp_section_title">${_('Arrows')}</span>
    <div style="display: flex; flex-direction: row; justify-content: space-evenly;">
      <div style="display: flex; flex-direction: row; align-items: center;">
        <span class="pp_section_title" style="margin: 0px;">${WAKHAN_ARROW_DESCRIPTION[topOfDeck.rowSide[topOfDiscard.rowSideArrow]]}</span>
        <div class="pp_wakhan_icon pp_red_arrow" style="margin-left: -6px;"></div>
      </div>
      <div style="display: flex; flex-direction: row; align-items: center;">
        <span class="pp_title" style="margin: 0px; font-size: xx-large;">${topOfDeck.columnNumbers[topOfDiscard.columnArrow]}</span>
        <div class="pp_wakhan_icon pp_black_arrow" style="margin-left: 6px;"></div>
      </div>
    </div>
    <span class="pp_section_title">${_('Region Priority')}</span>
    <div style="display: flex; flex-direction: row;">
      ${topOfDiscard.regionOrder.map((region) => `<div class="pp_wakhan_icon pp_region_icon pp_${region}"></div>`).join('')}
    </div>
    `,
  });
};
