class AcceptPrizeState implements State {
  private game: PaxPamirGame;
  private cardId: string;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ cardId }: OnEnteringAcceptPrizeArgs) {
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
    this.updatePageTitle();
    // const node = dojo.byId(cardId);
    // dojo.addClass(node, 'pp_selected');

    this.game.addPrimaryActionButton({
      id: 'accept_prize_btn',
      text: _('Accept prize'),
      callback: () =>
        this.game.takeAction({
          action: 'acceptPrize',
          data: {
            accept: true,
          },
        }),
    });
    this.game.addSecondaryActionButton({
      id: 'no_prize_btn',
      text: _('Decline prize'),
      callback: () =>
        this.game.takeAction({
          action: 'acceptPrize',
          data: {
            accept: false,
          },
        }),
    });
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private updatePageTitle() {
    const card = this.game.getCardInfo(this.cardId) as CourtCard;

    const playerLoyalty = this.game.getCurrentPlayer().getLoyalty();
    if (card.prize !== playerLoyalty) {
      this.game.clientUpdatePageTitle({
        text: _('Accept ${cardName} as a prize and change loyalty to ${tkn_coalition} ?'),
        args: {
          cardName: _(card.name),
          tkn_coalition: card.prize,
        },
      });
    } else {
      this.game.clientUpdatePageTitle({
        text: _('Accept ${cardName} as a prize?'),
        args: {
          cardName: _(card.name),
        },
      });
    }
  }
}
