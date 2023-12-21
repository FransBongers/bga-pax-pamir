//  .########..#######...#######..##.......########.####.########.
//  ....##....##.....##.##.....##.##..........##.....##..##.....##
//  ....##....##.....##.##.....##.##..........##.....##..##.....##
//  ....##....##.....##.##.....##.##..........##.....##..########.
//  ....##....##.....##.##.....##.##..........##.....##..##.......
//  ....##....##.....##.##.....##.##..........##.....##..##.......
//  ....##.....#######...#######..########....##....####.##.......

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class PPTooltipManager {
  private game: PaxPamirGame;
  // This can't be used since some versions of safari don't support it
  // private idRegex = /(?<=id=")[a-z]*_[0-9]*_[0-9]*(?=")/;
  private idRegex = /id="[a-z]*_[0-9]*_[0-9]*"/;
  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  // Player panels
  public addPlayerIconToolTips({ playerColor, playerId }: { playerColor: string; playerId: number }) {
    this.game.framework().addTooltipHtml(`cylinders_${playerId}`, tplCylinderCountToolTip({ playerColor }), 500);
    this.game.framework().addTooltipHtml(`rupees_${playerId}`, tplRupeeCountToolTip(), 500);
    if (playerId !== WAKHAN_PLAYER_ID) {
      this.game.framework().addTooltipHtml(`cards_${playerId}`, tplHandCountCountToolTip(), 500);
    }
  }


  public setupFavoredSuitMarkerTooltip() {
    const html = tplFavoredSuitMarkerToolTip();
    this.game.framework().addTooltipHtml('favored_suit_marker', html, 500);
  }

  public addSuitTooltip({ suit, nodeId }: { suit: 'economic' | 'intelligence' | 'military' | 'political'; nodeId: string }) {
    const html = tplSuitToolTip({ suit });
    this.game.framework().addTooltipHtml(nodeId, html, 500);
  }

  public addInfluenceCountTooltip({playerId, coalition}: {playerId: number; coalition: string;}) {
    this.game.framework().addTooltipHtml(`loyalty_icon_${playerId}`, tplInfluenceCountToolTip({ coalition }), 500);
  }

  public removeInfluenceCountTooltip({playerId}: {playerId: number}) {
    this.removeTooltip(`loyalty_icon_${playerId}`)
  }

  public addWakhanInfluenceCountTooltips({pragmaticLoyalty}: {pragmaticLoyalty: string;}) {
    COALITIONS.forEach((coalition) => {
      this.game.framework().addTooltipHtml(`loyalty_icon_1_${coalition}`, tplInfluenceCountToolTip({ coalition, black: coalition !== pragmaticLoyalty }), 500);
    })
  }

  public removeWakhanInfluenceCountTooltips() {
    COALITIONS.forEach((coalition) => {
      this.removeTooltip(`loyalty_icon_1_${coalition}`);
    })
  }
  
  // Generic text
  public addTextToolTip({ nodeId, text }: { nodeId: string; text: string }) {
    this.game.framework().addTooltip(nodeId, _(text), '', 500);
  }

  public addTooltipToCard({ cardId, cardIdSuffix = '' }: { cardId: string; cardIdSuffix?: string }): void {
    const cardInfo = this.game.getCardInfo({ cardId });

    if (cardInfo.type === COURT_CARD) {
      const html = tplCourtCardTooltip({ cardId, cardInfo, specialAbilities: this.game.gamedatas.staticData.specialAbilities });
      this.game.framework().addTooltipHtml(`${cardId}${cardIdSuffix}`, html, 500);
    } else {
      const html = tplEventCardTooltip({ cardId, cardInfo });
      this.game.framework().addTooltipHtml(`${cardId}${cardIdSuffix}`, html, 500);
    }
  }

  public addWakhanCardTooltip({ wakhanDeckCardId, wakhanDiscardCardId }: { wakhanDeckCardId: string; wakhanDiscardCardId: string }): void {
    const html = tplWakhanCardTooltip({ wakhanDeckCardId, wakhanDiscardCardId, game: this.game });
    this.game.framework().addTooltipHtml(`pp_wakhan_deck`, html, 500);
    this.game.framework().addTooltipHtml(`pp_wakhan_discard`, html, 500);

    // dojo.place(tplWakhanCardTooltip({ wakhanDeckCardId, wakhanDiscardCardId }), 'game_play_area');
  }

  public removeTooltip(nodeId: string) {
    this.game.framework().removeTooltip(nodeId);
  }

  public checkLogTooltip(lastNotif: { logId: number; msg: Notif<unknown> }) {
    if (!lastNotif?.msg?.args) {
      return;
    }
    Object.keys(lastNotif.msg.args).forEach((key) => {
      if (!(key.startsWith('logTokenLargeCard') || key.startsWith('tkn_largeCard'))) {
        return;
      }
      const id = this.idRegex.exec(lastNotif.msg.args[key])?.[0]?.slice(0, -1).slice(4);

      if (!id || !id.startsWith('card_')) {
        return;
      }
      const splitId = id.split('_');
      const cardId = `${splitId[0]}_${splitId[1]}`;
      // No idea why we need to do + 1 here. Looks like the notif that puts a msg in the log
      // is not the same that gets handles to addToLog (/ or the format_string_recursize gets triggered twice)?
      const cardIdSuffix = `_${Number(splitId[2]) + 1}`;
      this.addTooltipToCard({ cardId, cardIdSuffix });
    });
  }

  // Function for setup of generic tooltips as last step of setup
  public setupTooltips() {
    this.setupCardCounterTooltips();
    // this.setupDominanceCheckScoresTooltip();
    this.setupFavoredSuitMarkerTooltip();
  }

  private setupCardCounterTooltips() {
    this.game.framework().addTooltip('pp_deck_counter_container', _('Total number of cards in the deck'), '', 500);
    this.game
      .framework()
      .addTooltip('pp_deck_counter_dominance_check_container', _('Number of Dominance Check cards in the deck'), '', 500);
    this.game.framework().addTooltip('pp_discard_pile_counter_container', _('Total number of cards in the discard pile'), '', 500);
    this.game
      .framework()
      .addTooltip('pp_discard_pile_counter_dominance_check_container', _('Number of Dominance Check cards in the discard pile'), '', 500);
  }

  // private setupDominanceCheckScoresTooltip() {
  //   // @ts-ignore
  //   new dijit.Tooltip({
  //     connectId: ['pp_dominance_check_info'],
  //     getContent: function (matchedNode) {
  //       return tplVirtualScoresTooltip();
  //     },
  //   });
  // }
}
