// ....###.....######..########.####.##.....##.########
// ...##.##...##....##....##.....##..##.....##.##......
// ..##...##..##..........##.....##..##.....##.##......
// .##.....##.##..........##.....##..##.....##.######..
// .#########.##..........##.....##...##...##..##......
// .##.....##.##....##....##.....##....##.##...##......
// .##.....##..######.....##....####....###....########

// .########.##.....##.########.##....##.########..######.
// .##.......##.....##.##.......###...##....##....##....##
// .##.......##.....##.##.......####..##....##....##......
// .######...##.....##.######...##.##.##....##.....######.
// .##........##...##..##.......##..####....##..........##
// .##.........##.##...##.......##...###....##....##....##
// .########....###....########.##....##....##.....######.

class PPActiveEvents {
  private game: PaxPamirGame;
  private zone: PaxPamirZone;
  private zoneId: string = 'pp_active_events';
  private containerId: string = 'pp_active_events_container';

  constructor(game: PaxPamirGame) {
    this.game = game;
    dojo.place(tplActiveEvents(), 'pp_player_tableaus', 1);
    this.setupActiveEvents({ gamedatas: game.gamedatas });
  }

  setupActiveEvents({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    // Events
    this.zone = new PaxPamirZone({
      animationManager: this.game.animationManager,
      containerId: this.zoneId,
      itemHeight: CARD_HEIGHT,
      itemWidth: CARD_WIDTH,
      itemGap: 16,
    });
    // Add current event cards
    const events = gamedatas.activeEvents || [];
    this.zone.setupItems(
      events.map((card) => ({
        id: card.id,
        element: tplCard({ cardId: card.id }),
      }))
    );
    this.updateVisiblity();
    events.forEach((card) => {
      this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
    });
  }

  clearInterface() {
    dojo.empty(this.zone.getContainerId());
    this.zone = undefined;
  }

  private makeVisible() {
    const node = dojo.byId(this.containerId);
    node.style.setProperty('margin-bottom', '-65px');
  }

  private hide() {
    const node = dojo.byId(this.containerId);
    node.style.setProperty('margin-bottom', '-209px');
  }

  private updateVisiblity() {
    if (this.zone.getItemCount() > 0) {
      this.makeVisible();
    } else {
      this.hide();
    }
  }

  public async addCardFromMarket({ cardId, row, column }: { cardId: string; row: number; column: number }) {
    this.makeVisible();
    return await Promise.all([
      this.game.activeEvents.getZone().moveToZone({
        elements: {
          id: cardId,
        },
      }),
      this.game.market.getMarketCardZone({ row, column }).remove({ input: cardId }),
    ]);
  }

  public async discardCard({ cardId }: { cardId: string }) {
    await this.game.objectManager.discardPile.discardCardFromZone({
      cardId,
      zone: this.game.activeEvents.getZone(),
    });
    this.updateVisiblity();
  }

  public getZone(): PaxPamirZone {
    return this.zone;
  }

  public hasCard({ cardId }: { cardId: string }) {
    return this.zone.getItems().includes(cardId);
  }
}
