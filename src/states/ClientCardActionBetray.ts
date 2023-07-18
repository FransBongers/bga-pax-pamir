class ClientCardActionBetrayState implements State {
  private game: PaxPamirGame;
  private bribe: BribeArgs;
  private cardId: string;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ cardId, bribe }: ClientCardActionStateArgs) {
    this.bribe = bribe;
    this.cardId = cardId;
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
    if (this.bribe?.negotiated) {
      this.game.addDangerActionButton({
        id: 'cancel_bribe_btn',
        text: _('Cancel bribe'),
        callback: () =>
          this.game.takeAction({
            action: 'cancelBribe',
          }),
      });
    } else {
      this.game.addCancelButton();
    }
  }

  private updateInterfaceConfirm({ betrayedCardId }: { betrayedCardId: string; }) {
    this.game.clearPossible();
    const card = this.game.getCardInfo({ cardId: betrayedCardId }) as CourtCard;
    const node = dojo.byId(betrayedCardId);
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
      callback: () => this.handleConfirm({ betrayedCardId }),
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

  private handleConfirm({ betrayedCardId }: { betrayedCardId: string;}) {
    debug('handleConfirm', betrayedCardId);
    this.game.takeAction({
      action: 'betray',
      data: {
        cardId: this.cardId,
        betrayedCardId,
        bribeAmount: this.bribe?.amount ?? null,
      },
    });
  }

  private setCourtCardsSelectable() {
    this.game.playerManager.getPlayers().forEach((player: PPPlayer) => {
      player.getCourtCards().forEach((card: CourtCard) => {
        debug('card', card);
        const { enemy, own } = this.getSpies({ cardId: card.id });
        if (own.length === 0) {
          return;
        }
        if (card.suit === POLITICAL && player.hasSpecialAbility({ specialAbility: SA_BODYGUARDS })) {
          return;
        }
        const node = dojo.byId(card.id);
        dojo.addClass(node, 'pp_selectable');
        this.game._connections.push(
          dojo.connect(node, 'onclick', this, () => {
            this.updateInterfaceConfirm({ betrayedCardId: card.id });
          })
        );
      });
    });
  }
}
