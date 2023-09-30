class ClientPlayCardState implements State {
  private game: PaxPamirGame;
  private bribe: BribeArgs;
  private cardId: string;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ bribe, cardId }: ClientPlayCardStateArgs) {
    this.cardId = cardId;
    this.bribe = bribe;
    this.playCardNextStep();
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

  private updateInterfacePlayCardConfirm({ side, firstCard }: { side: 'left' | 'right'; firstCard: boolean }) {
    this.game.clearPossible();
    dojo.query(`#pp_card_select_${side}`).addClass('pp_selected');
    dojo.query(`.pp_card_in_hand.pp_${this.cardId}`).addClass('pp_selected');
    this.updatePageTitleConfirmPurchase({ side, firstCard });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'playCard',
          data: {
            cardId: this.cardId,
            side,
            bribeAmount: this.bribe ? this.bribe.amount : null,
          },
        }),
    });
    if (this.bribe?.negotiated && firstCard) {
      this.game.addDangerActionButton({
        id: 'cancel_bribe_btn',
        text: _('Cancel bribe'),
        callback: () => {
          this.removeSideSelectable();
          this.game.takeAction({
            action: 'cancelBribe',
          });
        },
      });
    } else {
      this.game.addDangerActionButton({
        id: 'cancel_btn',
        text: _('Cancel'),
        callback: () => {
          this.removeSideSelectable();
          /**
           * TODO: remove timeout
           * Reproduce:
           * 1. Negotiate bribe when playing card with other card already in court
           * 2. Select side, then click cancel
           * 3. Check why side selects dont have a click handler
           */
          setTimeout(() => {
            this.game.onCancel();
          },this.bribe?.negotiated ? 20 : 0)
        },
      });
    }
  }

  private updateInterfacePlayCardSelectSide() {
    this.game.clearPossible();
    dojo.query(`.pp_card_in_hand.pp_${this.cardId}`).addClass('pp_selected');
    this.game.clientUpdatePageTitle({
      text: _("Select which end of court to play ${name}"),
      args: {
        name: (this.game.getCardInfo({ cardId: this.cardId }) as CourtCard).name,
      },
    });
    this.setSideSelectable();
    if (this.bribe?.negotiated) {
      this.game.addDangerActionButton({
        id: 'cancel_bribe_btn',
        text: _('Cancel bribe'),
        callback: () => {
          this.removeSideSelectable();
          this.game.takeAction({
            action: 'cancelBribe',
          });
        },
      });
    } else {
      this.game.addDangerActionButton({
        id: 'cancel_btn',
        text: _('Cancel'),
        callback: () => {
          this.removeSideSelectable();
          this.game.onCancel();
        },
      });
    }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private updatePageTitleConfirmPurchase({ side, firstCard }: { side: 'left' | 'right'; firstCard: boolean }) {
    const playedCardLoyalty = (this.game.getCardInfo({cardId: this.cardId}) as CourtCard).loyalty;
    const willChangeLoyalty = playedCardLoyalty !== null && playedCardLoyalty !== this.game.getCurrentPlayer().getLoyalty();
    debug('willChangeLoyalty',willChangeLoyalty);
    let text: string;
    let args: Record<string, string | number>;
    if (firstCard && willChangeLoyalty) {
      text = _("Play ${name} to court and change loyalty to ${tkn_coalition} ?");
      args = {
        name: (this.game.getCardInfo({ cardId: this.cardId }) as CourtCard).name,
        tkn_coalition: playedCardLoyalty,
      };
    } else if (firstCard) {
      text = _("Play ${name} to court?");
      args = {
        name: (this.game.getCardInfo({ cardId: this.cardId }) as CourtCard).name,
      };
    } else if (!firstCard && willChangeLoyalty) {
      text = _("Play ${name} to ${side} end of court and change loyalty to ${tkn_coalition} ?");
      args = {
        name: (this.game.getCardInfo({ cardId: this.cardId }) as CourtCard).name,
        side,
        tkn_coalition: playedCardLoyalty,
      };
    } else {
      text = _("Play ${name} to ${side} end of court?");
      args = {
        name: (this.game.getCardInfo({ cardId: this.cardId }) as CourtCard).name,
        side,
      };
    }
    this.game.clientUpdatePageTitle({
      text,
      args,
    });
  }

  private playCardNextStep() {
    const numberOfCardsInCourt = this.game.playerManager
      .getPlayer({ playerId: this.game.getPlayerId() })
      .getCourtZone()
      .getItems().length;
    if (numberOfCardsInCourt === 0) {
      this.updateInterfacePlayCardConfirm({ firstCard: true, side: 'left' });
    } else {
      this.updateInterfacePlayCardSelectSide();
    }
  }

  private removeSideSelectable() {
    this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).removeSideSelectFromCourt();
  }

  private setSideSelectable() {
    this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).addSideSelectToCourt();
    dojo.query('#pp_card_select_left').forEach((node: HTMLElement) => {
      dojo.connect(node, 'onclick', this, () => {
        this.updateInterfacePlayCardConfirm({ firstCard: false, side: 'left' });
      });
    });
    dojo.query('#pp_card_select_right').forEach((node: HTMLElement) => {
      dojo.connect(node, 'onclick', this, () => {
        this.updateInterfacePlayCardConfirm({ firstCard: false, side: 'right' });
      });
    });
  }
}
