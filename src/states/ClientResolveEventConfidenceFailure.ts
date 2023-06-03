class ClientResolveEventConfidenceFailureState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ event }: ClientResolveEventStateArgs) {
    if (this.game.framework().isCurrentPlayerActive()) {
      this.updateInterfaceInitialStep();
    } else {
      this.updateInterfaceOtherPlayers();
    }
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

  private updateInterfaceOtherPlayers() {
    this.game.clearPossible();

    this.game.clientUpdatePageTitleOtherPlayers({
      text: _('${actplayer} must discard a card from hand'),
      args: {
        actplayer: '${actplayer}',
      },
    });
  }

  private updateInterfaceInitialStep() {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: '${you} must discard a card from hand',
      args: {
        you: '${you}',
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.handleDiscardConfirm(),
    });
    dojo.addClass('confirm_btn', 'disabled');
    this.game.setHandCardsSelectable({
      callback: ({ cardId }: { cardId: string }) => this.handleDiscardSelect({ cardId }),
    });
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
    if (nodes.length === 1) {
      const cardId = nodes[0].id;
      // let cards = '';
      // nodes.forEach((node: HTMLElement, index) => {
      //   cards += ' ' + node.id;
      // }, this);
      this.game.takeAction({
        action: 'eventChoice',
        data: {
          data: JSON.stringify({
            cardId,
          }),
        },
      });
    }
  }

  handleDiscardSelect({ cardId }: { cardId: string }) {
    dojo.query(`.pp_card_in_zone.pp_${cardId}`).toggleClass('pp_selected').toggleClass('pp_selectable'); //.toggleClass('pp_discard');
    const numberSelected = dojo.query('.pp_selected').length;
    if (numberSelected === 1) {
      dojo.removeClass('confirm_btn', 'disabled');
    } else {
      dojo.addClass('confirm_btn', 'disabled');
    }
  }
}
