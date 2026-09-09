class NegotiateBribeState implements State {
  private game: GameAlias;
  private action!: string;
  private isBribee!: boolean;
  private briber!: OnEnteringNegotiateBribeArgs['briber'];
  private bribee!: OnEnteringNegotiateBribeArgs['bribee'];
  private maxAmount!: number;
  private cardId!: string;

  constructor(game: GameAlias) {
    this.game = game;
  }

  onEnteringState({ bribee, briber, maxAmount, action, cardId }: OnEnteringNegotiateBribeArgs) {
    this.action = action;
    this.isBribee = this.game.getPlayerId() === bribee.playerId;
    this.bribee = bribee;
    this.briber = briber;
    this.maxAmount = maxAmount;
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

    if (this.isBribee) {
      const text =
        this.action === 'playCard'
          ? _('${tkn_playerName} wants to play ${tkn_cardName} and offers bribe of ${amount} rupee(s)${tkn_newLine}${tkn_largeCard}')
          : _(
              '${tkn_playerName} wants to use ${tkn_cardName} to ${action} and offers bribe of ${amount} rupee(s)${tkn_newLine}${tkn_largeCard}',
            );

      this.game.clientUpdatePageTitle({
        text,
        args: {
          amount: this.briber.currentAmount,
          tkn_playerName: this.game.playerManager.getPlayer({ playerId: this.briber.playerId }).getName(),
          tkn_cardName: _((this.game.getCardInfo(this.cardId) as CourtCard).name),
          action: _(this.action),
          tkn_largeCard: this.cardId,
          tkn_newLine: '',
        },
      });
    } else {
      this.game.clientUpdatePageTitle({
        text: _('${tkn_playerName} demands bribe of ${rupees} rupee(s)'),
        // _('${you} must accept or decline bribe of ${amount} rupee(s)'),
        args: {
          rupees: this.bribee.currentAmount || this.maxAmount,
          tkn_playerName: this.game.playerManager.getPlayer({ playerId: this.bribee.playerId }).getName(),
        },
      });
    }

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

    if (
      this.isBribee ||
      // @ts-ignore
      (!this.isBribee && currentOffer <= this.game.getCurrentPlayer().getRupees() - this.game.getMinimumActionCost({ action: this.action }))
    ) {
      this.game.addPrimaryActionButton({
        id: 'accept_btn',
        text: _('Accept'),
        callback: () =>
          this.game.takeAction({
            action: 'negotiateBribe',
            data: {
              amount: currentOffer,
            },
          }),
      });
    }

    for (let i = this.maxAmount; i >= 0; i--) {
      const isLowerThanOfferedByBriber = i < this.briber.currentAmount;
      const isHigherThanDemandedByBribee = i > (this.bribee.currentAmount || this.maxAmount);

      const isCurrentOffer = i === currentOffer;

      const briberCannotAfford =
        // @ts-ignore
        !this.isBribee && i > this.game.getCurrentPlayer().getRupees() - this.game.getMinimumActionCost({ action: this.action });

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
