class NegotiateBribeState implements State {
  private game: PaxPamirGame;
  private action: string;
  private isBribee: boolean;
  private briber: OnEnteringNegotiateBribeArgs['briber'];
  private bribee: OnEnteringNegotiateBribeArgs['bribee'];
  private maxAmount: number;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ bribee, briber, maxAmount, action }: OnEnteringNegotiateBribeArgs) {
    this.action = action;
    this.isBribee = this.game.getPlayerId() === bribee.playerId;
    this.bribee = bribee;
    this.briber = briber;
    this.maxAmount = maxAmount;
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
      text: _('${you} must accept or decline bribe of ${amount} rupee(s)'),
      args: {
        amount: this.isBribee ? this.briber.currentAmount : this.bribee.currentAmount || this.maxAmount,
        you: '${you}',
      },
    });
    this.addBribeButtons();
    this.game.addSecondaryActionButton({
      id: 'decline_btn',
      text: _('Decline'),
      callback: () => this.game.takeAction({ action: 'declineBribe' }),
    });
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private addBribeButtons() {
    const currentOffer = this.isBribee ? this.briber.currentAmount : this.bribee.currentAmount || this.maxAmount;
    if (this.isBribee || (!this.isBribee && currentOffer <= (this.game.getCurrentPlayer().getRupees() - this.game.getMinimumActionCost({action: this.action})))) {
      this.game.addPrimaryActionButton({
        id: 'accept_btn',
        text: _('Accept'),
        callback: () => this.game.takeAction({ action: 'negotiateBribe', data: {
          amount: currentOffer,
        }, }),
      });
    }

    for (let i = this.maxAmount; i >= 0; i--) {
      const isLowerThanOfferedByBriber = i < this.briber.currentAmount;
      const isHigherThanDemandedByBribee = i > (this.bribee.currentAmount || this.maxAmount);
      
      const isCurrentOffer = i === currentOffer;
      const briberCannotAfford = !this.isBribee && i > (this.game.getCurrentPlayer().getRupees() - this.game.getMinimumActionCost({action: this.action}));
      
      if (isLowerThanOfferedByBriber || isHigherThanDemandedByBribee || isCurrentOffer || briberCannotAfford) {
        continue;
      }
      this.game.addPrimaryActionButton({
        id: `ask_partial_waive_${i}_btn`,
        text: this.isBribee
          ? dojo.string.substitute(_('Demand ${i} rupee(s)'), { i })
          : dojo.string.substitute(_('Offer ${i} rupee(s)'), { i }),
        callback: () =>
          this.game.takeAction({
            action: 'negotiateBribe',
            data: {
              amount: i,
            },
          }),
      });
    }
  }
}
