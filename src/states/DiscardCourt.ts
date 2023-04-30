class DiscardCourtState implements State {
  private game: PaxPamirGame;
  private numberOfDiscards: number;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ numberOfDiscards }: EnteringDiscardCourtArgs) {
    this.numberOfDiscards = numberOfDiscards;
    this.updateInterfaceInitialStep();

    // this.updateInterface({ nextStep: DISCARD_COURT, args: { discardCourt: args.args as EnteringDiscardCourtArgs } });
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
      text:
        this.numberOfDiscards !== 1
          ? _('${you} must discard ${numberOfDiscards} cards')
          : _('${you} must discard ${numberOfDiscards} card'),
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
    // this.setCourtCardsSelectableForDiscard();
    this.game.setCourtCardsSelectable({ callback: ({ cardId }: { cardId: string }) => this.handleDiscardSelect({ cardId }) });
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private handleDiscardConfirm() {
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

  // // TODO: remove and use generic function
  // private setCourtCardsSelectableForDiscard() {
  //   const playerId = this.game.getPlayerId();
  //   dojo.query(`.pp_card_in_court.pp_player_${playerId}`).forEach((node: HTMLElement, index: number) => {
  //     const cardId = 'card_' + node.id.split('_')[1];
  //     console.log('cardId in courtcardselect', cardId);
  //     dojo.addClass(node, 'pp_selectable');
  //     this.game._connections.push(dojo.connect(node, 'onclick', this, () => this.handleDiscardSelect({ cardId })));
  //   });
  // }

  handleDiscardSelect({ cardId }: { cardId: string }) {
    dojo.query(`.pp_card_in_zone.pp_${cardId}`).toggleClass('pp_selected').toggleClass('pp_selectable');//.toggleClass('pp_discard');
    const numberSelected = dojo.query('.pp_selected').length;
    console.log('button_check', cardId, numberSelected, this.numberOfDiscards);
    if (numberSelected === this.numberOfDiscards) {
      dojo.removeClass('confirm_btn', 'disabled');
    } else {
      dojo.addClass('confirm_btn', 'disabled');
    }
  }
}
