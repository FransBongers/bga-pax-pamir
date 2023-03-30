class NegotiateBribeState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ currentAmount, ruler, possible }: OnEnteringNegotiateBribeArgs) {
    this.updateInterfaceInitialStep({ amount: currentAmount, ruler, possible });
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

  private updateInterfaceInitialStep({ amount, possible, ruler }: { amount: number; possible: number[]; ruler: number }) {
    this.game.clearPossible();

    this.game.clientUpdatePageTitle({
      text: '${you} must accept or decline bribe of ${amount} rupee(s)',
      args: {
        amount,
        you: '${you}',
      },
    });
    const isRuler = ruler === this.game.getPlayerId();
    if (isRuler || (!isRuler && amount <= this.game.localState.activePlayer.rupees)) {
      this.game.addPrimaryActionButton({
        id: 'accept_btn',
        text: _('Accept'),
        callback: () => this.game.takeAction({ action: 'acceptBribe' }),
      });
    }
    possible.reverse().forEach((value: number) => {
      if (value == amount || (isRuler && value < amount) || (!isRuler && value > this.game.localState.activePlayer.rupees)) {
        return;
      }
      this.game.addPrimaryActionButton({
        id: `ask_partial_waive_${value}_btn`,
        text: isRuler
          ? dojo.string.substitute(_(`Demand ${value} rupee(s)`), { value })
          : dojo.string.substitute(_(`Offer ${value} rupee(s)`), { value }),
        callback: () =>
          this.game.takeAction({
            action: 'proposeBribeAmount',
            data: {
              amount: value,
            },
          }),
      });
    });
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
}
