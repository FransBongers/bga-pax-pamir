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
  private zone: LineStock<Card>;
  private zoneId: string = 'pp_active_events';
  private containerId: string = 'pp_active_events_container';

  constructor(game: PaxPamirGame) {
    this.game = game;
    dojo.place(tplActiveEvents(), 'pp_player_tableaus', 1);
    this.setupActiveEvents({ gamedatas: game.gamedatas });
  }

  setupActiveEvents({ gamedatas }: { gamedatas: PaxPamirGamedatas }) {
    // Events
    this.zone = new LineStock<Card>(this.game.cardManager, document.getElementById(this.zoneId), {
      center: false,
    });

    // Add current event cards
    const events = gamedatas.activeEvents || [];
    this.zone.addCards(events.map((token) => this.game.getCard(token)));

    this.updateVisiblity();
    events.forEach((card) => {
      this.game.tooltipManager.addTooltipToCard({ cardId: card.id });
    });
  }

  clearInterface() {
    this.zone.removeAll();
    this.zone = undefined;
  }

  private makeVisible() {
    const node = dojo.byId(this.containerId);
    node.style.setProperty('margin-bottom', 'calc(var(--cardScale) * -75px)');
  }

  private hide() {
    const node = dojo.byId(this.containerId);
    node.style.setProperty('margin-bottom', 'calc(var(--cardScale) * -209px)');
  }

  private updateVisiblity() {
    if (this.zone.getCards().length > 0) {
      this.makeVisible();
    } else {
      this.hide();
    }
  }

  public async addCardFromMarket({ cardId, row, column }: { cardId: string; row: number; column: number }) {
    this.makeVisible();

    const isSpectator = this.game.framework().isSpectator;
    const playerIdTopTableau = !isSpectator ? this.game.getPlayerId() : this.game.gamedatas.paxPamirPlayerOrder[0];
    const player = this.game.playerManager.getPlayer({ playerId: playerIdTopTableau });
    const originalZIndex = player.elevateTableau();

    await Promise.all([
      this.getZone().addCard(
        this.game.getCard({
          id: cardId,
          state: 0,
          used: 0,
          location: 'activeEvents',
        })
      ),
    ]);
    player.removeTableauElevation(originalZIndex);
  }

  public async discardCard({ cardId }: { cardId: string }) {
    const isSpectator = this.game.framework().isSpectator;
    const playerIdTopTableau = !isSpectator ? this.game.getPlayerId() : this.game.gamedatas.paxPamirPlayerOrder[0];
    const player = this.game.playerManager.getPlayer({ playerId: playerIdTopTableau });
    const originalZIndex = player.elevateTableau();

    await this.game.objectManager.discardPile.discardCardFromZone(cardId);

    player.removeTableauElevation(originalZIndex);
    this.updateVisiblity();
  }

  public getZone(): LineStock<Card> {
    return this.zone;
  }

  public hasCard({ cardId }: { cardId: string }) {
    return this.zone.getCards().some((card) => card.id === cardId);
  }
}
