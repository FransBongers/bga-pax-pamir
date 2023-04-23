class ClientCardActionBetrayState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState() {
    this.updateInterfaceInitialStep();
  }

  onLeavingState() {}

  //  .####.##....##.########.########.########..########....###.....######..########
  //  ..##..###...##....##....##.......##.....##.##.........##.##...##....##.##......
  //  ..##..####..##....##....##.......##.....##.##........##...##..##.......##......
  //  ..##..##.##.##....##....######...########..######...##.....##.##.......######..
  //  ..##..##..####....##....##.......##...##...##.......#########.##.......##......
  //  ..##..##...###....##....##.......##....##..##.......##.....##.##....##.##......
  //  .####.##....##....##....########.##.....##.##.......##.....##..######..########

  // ..######..########.########.########...######.
  // .##....##....##....##.......##.....##.##....##
  // .##..........##....##.......##.....##.##......
  // ..######.....##....######...########...######.
  // .......##....##....##.......##..............##
  // .##....##....##....##.......##........##....##
  // ..######.....##....########.##.........######.

  private updateInterfaceInitialStep() {
    this.game.clearPossible();
    /**
     * 1. Get all courtcards with spy of active player
     * 2. Set selecteable
     * 3. Ask for confirmatiom
     */
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a court card to betray'),
      args: {
        you: '${you}',
      },
    });
    this.setCourtCardsSelectable();
    this.game.addCancelButton();
  }

  private updateInterfaceConfirm({ cardId }: { cardId: string }) {
    debug('updateInterfaceConfirm',cardId);
    this.game.clearPossible();
    const card = this.game.getCardInfo({cardId}) as CourtCard;
    const node = dojo.byId(cardId);
    dojo.addClass(node, 'pp_selected');
    this.game.clientUpdatePageTitle({
      text: _('Betray ${cardName}?'),
      args: {
        cardName: _(card.name),
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.handleConfirm({cardId}),
    });
    this.game.addCancelButton();
    
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  // TODO (centralize spy functionality)
  getSpies({ cardId }: { cardId: string }): { enemy: string[]; own: string[] } {
    const spyZone = this.game.spies[cardId];
    if (!spyZone) {
      return {
        enemy: [],
        own: [],
      };
    }
    const cylinderIds = spyZone.getAllItems();
    return {
      enemy: cylinderIds.filter((cylinderId: string) => Number(cylinderId.split('_')[1]) !== this.game.getPlayerId()),
      own: cylinderIds.filter((cylinderId: string) => Number(cylinderId.split('_')[1]) === this.game.getPlayerId()),
    };
  }

  private handleConfirm({cardId}:{cardId: string;}) {
    debug('handleConfirm',cardId);
  }

  private setCourtCardsSelectable() {
    this.game.playerManager.getPlayers().forEach((player: PPPlayer) => {
      player.getCourtCards().forEach((card: CourtCard) => {
        const { enemy, own } = this.getSpies({ cardId: card.id });
        if (!(own.length > 0)) {
          return;
        }
        const node = dojo.byId(card.id);
        dojo.addClass(node, 'pp_selectable');
        dojo.connect(node, 'onclick', this, () => {
          this.updateInterfaceConfirm({ cardId: card.id });
        });
      });
    });
  }
}
