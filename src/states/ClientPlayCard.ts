class ClientPlayCardState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState(args: ClientPlayCardStateArgs) {
    this.checkBribe(args);
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

  private updateInterfacePlayCardBribe({
    cardId,
    ruler,
    rupees,
  }: {
    cardId: string;
    // region: string;
    ruler: PPPlayer;
    rupees: number;
  }) {
    this.game.clearPossible();
    const localState = this.game.localState;

    dojo.query(`.pp_card_in_hand.pp_${cardId}`).addClass('pp_selected');
    this.game.clientUpdatePageTitle({
      text: substituteKeywords({
        string: ` \${you} must pay a bribe of \${rupees} rupee(s) to \${playerName} or ask to waive`,
        args: {
          rupees,
        },
        playerColor: ruler.getColor(),
      }),
      args: {
        playerName: ruler.getName(),
        you: '${you}',
      },
    });
    if (rupees <= localState.activePlayer.rupees) {
      this.game.addPrimaryActionButton({
        id: `pay_bribe_btn`,
        text: _('Pay bribe'),
        callback: () => this.playCardNextStep({ cardId, bribe: rupees }),
      });
    }

    for (let i = rupees - 1; i >= 1; i--) {
      if (i > localState.activePlayer.rupees) {
        return;
      }
      this.game.addPrimaryActionButton({
        id: `ask_partial_waive_${i}_btn`,
        text: dojo.string.substitute(_(`Offer ${i} rupee(s)`), { i }),
        callback: () => this.playCardNextStep({ cardId, bribe: i }),
      });
    }
    this.game.addPrimaryActionButton({
      id: `ask_waive_btn`,
      text: _('Ask to waive'),
      callback: () => this.playCardNextStep({ cardId, bribe: 0 }),
    });
    this.game.addCancelButton();
  }

  private updateInterfacePlayCardConfirm({
    cardId,
    side,
    firstCard,
    bribe,
  }: {
    cardId: string;
    side: 'left' | 'right';
    firstCard: boolean;
    bribe: number;
  }) {
    this.game.clearPossible();
    dojo.query(`#pp_card_select_${side}`).addClass('pp_selected');
    dojo.query(`.pp_card_in_hand.pp_${cardId}`).addClass('pp_selected');
    if (firstCard) {
      this.game.clientUpdatePageTitle({
        text: _("Play '${name}' to court?"),
        args: {
          name: (this.game.getCardInfo({ cardId }) as CourtCard).name,
        },
      });
    } else {
      this.game.clientUpdatePageTitle({
        text: _("Play '${name}' to ${side} side of court?"),
        args: {
          name: (this.game.getCardInfo({ cardId }) as CourtCard).name,
          side,
        },
      });
    }
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () =>
        this.game.takeAction({
          action: 'playCard',
          data: {
            cardId,
            leftSide: side === 'left',
            bribe,
          },
        }),
    });
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => {
        this.removeSideSelectable();
        this.game.onCancel();
      },
    });
  }

  private updateInterfacePlayCardSelectSide({ cardId, bribe }: { cardId: string; bribe: number }) {
    this.game.clearPossible();
    dojo.query(`.pp_card_in_hand.pp_${cardId}`).addClass('pp_selected');
    this.game.clientUpdatePageTitle({
      text: _("Select which side of court to play '${name}'"),
      args: {
        name: (this.game.getCardInfo({ cardId }) as CourtCard).name,
      },
    });
    this.setSideSelectable({ cardId, bribe });
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => {
        this.game.onCancel();
        this.removeSideSelectable();
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

  private checkBribe({ cardId }: { cardId: string }) {
    // Check if other player rules the region
    const cardInfo = this.game.getCardInfo({ cardId }) as CourtCard;
    const { region } = cardInfo;
    const rulerId = this.game.map.getRegion({ region }).getRuler();
    const playerId = this.game.getPlayerId();
    if (rulerId !== null && rulerId !== playerId) {
      const rupees = this.game.map.getRegion({ region }).getRulerTribes().length;
      this.updateInterfacePlayCardBribe({ cardId, ruler: this.game.playerManager.getPlayer({ playerId: rulerId }), rupees });
    } else {
      this.playCardNextStep({ cardId, bribe: 0 });
    }
  }

  private playCardNextStep({ cardId, bribe }: { cardId: string; bribe: number }) {
    const numberOfCardsInCourt = this.game.playerManager
      .getPlayer({ playerId: this.game.getPlayerId() })
      .getCourtZone()
      .getAllItems().length;
    if (numberOfCardsInCourt === 0) {
      this.updateInterfacePlayCardConfirm({ cardId, firstCard: true, side: 'left', bribe });
    } else {
      this.updateInterfacePlayCardSelectSide({ cardId, bribe });
    }
  }

  private removeSideSelectable() {
    this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).removeSideSelectFromCourt();
  }

  private setSideSelectable({ cardId, bribe }: { cardId: string; bribe: number }) {
    this.game.playerManager.getPlayer({ playerId: this.game.getPlayerId() }).addSideSelectToCourt();
    dojo.query('#pp_card_select_left').forEach((node: HTMLElement) => {
      dojo.connect(node, 'onclick', this, () => {
        this.updateInterfacePlayCardConfirm({ cardId, firstCard: false, side: 'left', bribe });
      });
    });
    dojo.query('#pp_card_select_right').forEach((node: HTMLElement) => {
      dojo.connect(node, 'onclick', this, () => {
        this.updateInterfacePlayCardConfirm({ cardId, firstCard: false, side: 'right', bribe });
      });
    });
  }
}
