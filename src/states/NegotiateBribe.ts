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
      text: '${you} must accept or decline bribe of ${amount} rupee(s)',
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
    if (this.isBribee || (!this.isBribee && currentOffer <= (this.game.localState.activePlayer.rupees - this.game.getMinimumActionCost({action: this.action})))) {
      this.game.addPrimaryActionButton({
        id: 'accept_btn',
        text: _('Accept'),
        callback: () => this.game.takeAction({ action: 'negotiateBribe', data: {
          amount: currentOffer,
        }, }),
      });
    }
    const values = Array.from({ length: this.maxAmount });
    console.log('maxAmount', this.maxAmount);
    for (let i = this.maxAmount; i >= 0; i--) {
      console.log('for loop i:',i)
      const isLowerThanOfferedByBriber = i < this.briber.currentAmount;
      console.log('isLowerThanOfferedByBriber',isLowerThanOfferedByBriber);
      const isHigherThanDemandedByBribee = i > (this.bribee.currentAmount || this.maxAmount);
      console.log('isHigherThanDemandedByBribee',isHigherThanDemandedByBribee);
      
      const isCurrentOffer = i === currentOffer;
      console.log('isCurrentOffer',isCurrentOffer);
      const briberCannotAfford = !this.isBribee && i >(this.game.localState.activePlayer.rupees - this.game.getMinimumActionCost({action: this.action}));
      
      if (isLowerThanOfferedByBriber || isHigherThanDemandedByBribee || isCurrentOffer || briberCannotAfford) {
        continue;
      }
      this.game.addPrimaryActionButton({
        id: `ask_partial_waive_${i}_btn`,
        text: this.isBribee
          ? dojo.string.substitute(_(`Demand ${i} rupee(s)`), { i })
          : dojo.string.substitute(_(`Offer ${i} rupee(s)`), { i }),
        callback: () =>
          this.game.takeAction({
            action: 'negotiateBribe',
            data: {
              amount: i,
            },
          }),
      });
    }
    console.log('values', values);
    //     const isRuler = ruler === this.game.getPlayerId();

    // possible.reverse().forEach((value: number) => {
    //   if (value == amount || (isRuler && value < amount) || (!isRuler && value > this.game.localState.activePlayer.rupees)) {
    //     return;
    //   }
    //   this.game.addPrimaryActionButton({
    //     id: `ask_partial_waive_${value}_btn`,
    //     text: isRuler
    //       ? dojo.string.substitute(_(`Demand ${value} rupee(s)`), { value })
    //       : dojo.string.substitute(_(`Offer ${value} rupee(s)`), { value }),
    //     callback: () =>
    //       this.game.takeAction({
    //         action: 'proposeBribeAmount',
    //         data: {
    //           amount: value,
    //         },
    //       }),
    //   });
    // });
  }
}
