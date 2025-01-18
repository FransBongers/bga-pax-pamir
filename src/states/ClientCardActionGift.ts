class ClientCardActionGiftState implements State {
  private game: PaxPamirGame;
  private bribe: BribeArgs;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState(args: ClientCardActionStateArgs) {
    this.bribe = args.bribe;
    this.updateInterfaceInitialStep(args);
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

  private updateInterfaceInitialStep({ cardId }: ClientCardActionStateArgs) {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a gift to purchase'),
      args: {
        you: '${you}',
      },
    });
    this.setGiftsSelectable({ cardId });
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

  private updateInterfaceConfirmSelectGift({ value, cardId }: { value: number; cardId: string }) {
    this.game.clearPossible();
    dojo.query(`#pp_gift_${value}_${this.game.getPlayerId()}`).addClass('pp_selected');
    this.game.clientUpdatePageTitle({ text: _('Purchase gift for ${value} rupees?'), args: { value: '' + value } });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'purchaseGift',
          data: { value, cardId, bribeAmount: this.bribe?.amount ?? null, },
        }),
    });
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => {
        this.game.onCancel();
      },
    });
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  setGiftsSelectable({ cardId }: { cardId: string }) {
    const playerId = this.game.getPlayerId();
    [2, 4, 6].forEach((giftValue) => {
      const hasGift =
        this.game.playerManager
          .getPlayer({ playerId })
          .getGiftZone({
            value: giftValue,
          })
          .getCards().length > 0;
      if (!hasGift && giftValue <= this.game.getCurrentPlayer().getRupees() - (this.bribe?.amount || 0)) {
        dojo.query(`#pp_gift_${giftValue}_${playerId}`).forEach((node: HTMLElement) => {
          dojo.addClass(node, 'pp_selectable');
          this.game._connections.push(
            dojo.connect(node, 'onclick', this, () => this.updateInterfaceConfirmSelectGift({ value: giftValue, cardId }))
          );
        });
      }
    });
  }
}
