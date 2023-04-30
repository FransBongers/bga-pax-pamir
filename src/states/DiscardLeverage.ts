class DiscardLeverageState implements State {
  private game: PaxPamirGame;
  private numberOfDiscards: number;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ numberOfDiscards }: EnteringDiscardLeverageArgs) {
    this.numberOfDiscards = numberOfDiscards;
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
    this.game.clientUpdatePageTitle({
      text: _('${you} must discard ${numberOfDiscards} card(s)'),
      args: {
        numberOfDiscards: this.numberOfDiscards,
        you: '${you}',
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.handleDiscardConfirm(),
    });
    dojo.addClass('confirm_btn', 'disabled');
    this.game.setCourtCardsSelectable({ callback: ({ cardId }: { cardId: string }) => this.handleDiscardSelect({ cardId }) });
    this.game.setHandCardsSelectable({ callback: ({ cardId }: { cardId: string }) => this.handleDiscardSelect({ cardId }) });
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private handleDiscardConfirm() {
    debug('handleDiscardConfirm');
    const nodes = dojo.query('.pp_selected');
    if (nodes.length === this.numberOfDiscards) {
      let cards = '';
      nodes.forEach((node: HTMLElement, index) => {
        cards += ' ' + node.id;
      }, this);
      this.game.takeAction({
        action: 'discardCards',
        data: {
          cards,
        },
      });
    }
  }

  handleDiscardSelect({ cardId }: { cardId: string }) {
    debug('card clicked', cardId);
    dojo.query(`.pp_card_in_zone.pp_${cardId}`).toggleClass('pp_selected').toggleClass('pp_selectable'); //.toggleClass('pp_discard');
    const numberSelected = dojo.query('.pp_selected').length;
    if (numberSelected === this.numberOfDiscards) {
      dojo.removeClass('confirm_btn', 'disabled');
    } else {
      dojo.addClass('confirm_btn', 'disabled');
    }
  }
}
