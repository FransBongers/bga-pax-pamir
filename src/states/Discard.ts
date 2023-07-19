class DiscardState implements State {
  private game: PaxPamirGame;
  private from: OnEnteringDiscardArgs['from'];
  private loyalty: OnEnteringDiscardArgs['loyalty'];
  private region: OnEnteringDiscardArgs['region'];
  private suit: OnEnteringDiscardArgs['suit'];
  

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ from, loyalty, region, suit }: OnEnteringDiscardArgs) {
    console.log('from state file', from);
    this.from = from;
    this.loyalty = loyalty;
    this.region = region;
    this.suit = suit;
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
    this.updatePageTitle();

    if (this.from.includes(COURT)) {
      this.game.setCourtCardsSelectable({
        callback: ({ cardId }: { cardId: string }) => this.updateInterfaceConfirm({ cardId, from: 'court' }),
        loyalty: this.loyalty,
        region: this.region,
        suit: this.suit,
      });
    }
    if (this.from.includes(HAND)) {
      this.game.setHandCardsSelectable({
        callback: ({ cardId }: { cardId: string }) => this.updateInterfaceConfirm({ cardId, from: 'hand' }),
      });
    }
  }

  private updateInterfaceConfirm({ cardId, from }: { cardId: string; from: 'court' | 'hand' }) {
    this.game.clearPossible();
    dojo.query(`#${cardId}`).addClass('pp_selected');

    this.game.clientUpdatePageTitle({
      text: _('Discard ${name}?'),
      args: {
        name: (this.game.getCardInfo({ cardId }) as CourtCard).name,
      },
    });

    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'discard',
          data: {
            cardId,
            from,
          },
        }),
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

  private updatePageTitle() {
    let text = _('${you} must discard a card');
    const fromCourt = this.from.length === 1 && this.from[0] === COURT;
    const fromHand = this.from.length === 1 && this.from[0] === HAND;
    if (fromCourt && this.loyalty) {
      text = _('${you} must discard a patriot from court');
    } else if (fromCourt) {
      text = _('${you} must discard a card from court');
    } else if (fromHand) {
      text = _('${you} must discard a card from hand');
    }

    this.game.clientUpdatePageTitle({
      text,
      args: {
        you: '${you}',
      },
    });
  }
}
