class ClientInitialBribeCheckState implements State {
  private game: PaxPamirGame;
  private cardId: string;
  private action: string;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState(args: ClientInitialBribeCheckArgs) {
    this.action = args.action;
    this.cardId = args.cardId;
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

  private updateInterfaceInitialStep({
    bribeeId,
    amount,
    next,
  }: {
    bribeeId: number;
    amount: number;
    next: ClientInitialBribeCheckArgs['next'];
  }) {
    this.game.clearPossible();
    this.game.activeStates.playerActions.setCardActionSelected({ cardId: this.cardId, action: this.action });
    // Todo check if we can remove localState and just use current UI data
    const localState = this.game.localState;

    const bribee = this.game.playerManager.getPlayer({ playerId: bribeeId });
    this.game.clientUpdatePageTitle({
      text: _('${you} must pay a bribe of ${amount} ${tkn_rupee} to ${tkn_playerName} or ask to waive'),
      args: {
        amount,
        tkn_playerName: bribee.getName(),
        tkn_rupee: _('rupee(s)'),
        you: '${you}',
      },
    });

    const minActionCost = this.game.getMinimumActionCost({ action: this.action }) || 0;
    const maxAvailableRupees = this.game.getCurrentPlayer().getRupees() - minActionCost;
    if (amount <= maxAvailableRupees) {
      this.game.addPrimaryActionButton({
        id: `pay_bribe_btn`,
        text: _('Pay bribe'),
        callback: () => next({ bribe: { amount } }),
      });
    }

    for (let i = amount - 1; i >= 1; i--) {
      if (i > maxAvailableRupees || bribee.isWakhan()) {
        continue;
      }
      this.game.addPrimaryActionButton({
        id: `ask_partial_waive_${i}_btn`,
        text: dojo.string.substitute(_(`Offer ${i} rupee(s)`), { i }),
        callback: () =>
          this.game.takeAction({
            action: 'startBribeNegotiation',
            data: {
              cardId: this.cardId,
              useFor: this.action,
              amount: i,
            },
          }),
      });
    }
    if (this.game.getCurrentPlayer().ownsEventCard({ cardId: 'card_107' })) {
      this.game.addPrimaryActionButton({
        id: `do_not_pay_btn`,
        text: _('Do not pay'),
        callback: () => next({ bribe: null }),
      });
    } else if (!bribee.isWakhan()) {
      this.game.addPrimaryActionButton({
        id: `ask_waive_btn`,
        text: _('Ask to waive'),
        // callback: () => next({ bribe: 0 }),
        callback: () =>
          this.game.takeAction({
            action: 'startBribeNegotiation',
            data: {
              cardId: this.cardId,
              useFor: this.action,
              amount: 0,
            },
          }),
      });
    }
    this.game.addCancelButton();
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public calulateBribe({ cardId, action }): { bribeeId: number; amount: number } | null {
    const disregardForCustomsActive = this.game.activeEvents.hasCard({ cardId: 'card_107' });
    const charismaticCourtiersAcitve =
      action === 'playCard' && this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_CHARISMATIC_COURTIERS });
    // actions is either playCard or one of the card actions
    const civilServiceReformsActive =
      action !== 'playCard' && this.game.getCurrentPlayer().hasSpecialAbility({ specialAbility: SA_CIVIL_SERVICE_REFORMS });

    if (disregardForCustomsActive || charismaticCourtiersAcitve || civilServiceReformsActive) {
      return null;
    }

    const bribe: { bribeeId: number; amount: number } | null =
      action === 'playCard' ? this.checkBribePlayCard({ cardId }) : this.checkBribeCardAction({ cardId });

    return bribe;
  }

  private checkBribe({ cardId, action, next }: ClientInitialBribeCheckArgs) {
    const bribe = this.calulateBribe({ cardId, action });

    if (bribe === null) {
      next({ bribe: null });
    } else {
      this.updateInterfaceInitialStep({ ...bribe, next });
    }
  }

  private checkBribeCardAction({ cardId }: { cardId: string }): { bribeeId: number; amount: number } | null {
    // Get spies on card
    const spyZone = this.game.spies[cardId];
    if (!spyZone) {
      return null;
    }
    const cylinderIds = spyZone.getItems();
    const totals: {
      [playerId: string]: number;
    } = {};

    // Calculate number of spies per player
    cylinderIds.forEach((cylinderId: string) => {
      const playerId = cylinderId.split('_')[1];
      if (totals[playerId]) {
        totals[playerId] += 1;
      } else {
        totals[playerId] = 1;
      }
    });

    // Sort array so player with most cylinders is at index 0
    const sortedTotals = Object.entries(totals)
      .map(([key, value]) => ({
        playerId: Number(key),
        numberOfSpies: value,
      }))
      .sort((a, b) => b.numberOfSpies - a.numberOfSpies);
    console.log('sortedTotals', sortedTotals);

    const currentPlayerId = this.game.getPlayerId();
    const numberOfPlayersWithSpies = sortedTotals.length;

    // Check if there is a player holding the card hostage
    if (numberOfPlayersWithSpies === 1 && sortedTotals[0].playerId !== currentPlayerId) {
      const { playerId, numberOfSpies } = sortedTotals[0];
      return {
        bribeeId: playerId,
        amount: numberOfSpies,
      };
    } else if (
      numberOfPlayersWithSpies > 1 &&
      sortedTotals[0].numberOfSpies > sortedTotals[1].numberOfSpies &&
      sortedTotals[0].playerId !== currentPlayerId
    ) {
      const { playerId, numberOfSpies } = sortedTotals[0];
      return {
        bribeeId: playerId,
        amount: numberOfSpies,
      };
    } else {
      return null;
    }
  }

  private checkBribePlayCard({ cardId }: { cardId: string }): { bribeeId: number; amount: number } | null {
    // Check if other player rules the region
    const cardInfo = this.game.getCardInfo({ cardId }) as CourtCard;
    const { region } = cardInfo;
    const rulerId = this.game.map.getRegion({ region }).getRuler();
    const playerId = this.game.getPlayerId();
    if (rulerId !== null && rulerId !== playerId) {
      const amount = this.game.map.getRegion({ region }).getRulerTribes().length;
      return { bribeeId: rulerId, amount };
    } else {
      return null;
    }
  }
}
