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
  private idRegex = /(?<=id=")[a-z]*_[0-9]*_[0-9]*(?=")/;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  public addSuitTooltip({ suit, nodeId }: { suit: 'economic' | 'intelligence' | 'military' | 'political'; nodeId: string }) {
    const html = tplSuitToolTip({ suit });
    this.game.framework().addTooltipHtml(nodeId, html, 500);
  }

  public addTextToolTip({nodeId, text}: {nodeId: string; text: string;}) {
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
      if (!key.startsWith('logTokenLargeCard')) {
        return;
      }
      const id = this.idRegex.exec(lastNotif.msg.args[key])?.[0];
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
}
