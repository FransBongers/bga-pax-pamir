class ClientCardActionMoveState implements State {
  private game: PaxPamirGame;
  private cardId: string;
  private moves: Record<
    string,
    {
      from: string;
      to: string;
    }[]
  >;
  private maxNumberOfMoves: number;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ cardId }: ClientCardActionStateArgs) {
    this.cardId = cardId;
    const cardInfo = this.game.getCardInfo({ cardId }) as CourtCard;
    this.maxNumberOfMoves = cardInfo.rank;
    this.moves = {};
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
    this.setArmiesSelectable();
    this.setSpiesSelectable();
    if (this.totalNumberOfMoves() > 0) {
      this.game.addPrimaryActionButton({
        id: 'confirm_btn',
        text: _('Confirm'),
        callback: () => this.onConfirm(),
      });
    }
    this.addCancelButton();
  }

  private updateInterfaceArmySelected({ pieceId, regionId }: { pieceId: string; regionId: string }) {
    this.game.clearPossible();
    dojo.query(`#${pieceId}`).addClass(PP_SELECTED).removeClass(PP_SELECTABLE);
    this.setDestinationRegionsSelectable({ pieceId, regionId });
    this.game.clientUpdatePageTitle({
      text: _('${you} must select the region to move the army to'),
      args: {
        you: '${you}',
      },
    });
    this.addCancelButton();
  }

  private updateIntefaceSpySelected({ pieceId, cardId }: { pieceId: string; cardId: string }) {
    debug('updateIntefaceSpySelected', pieceId, cardId);
    this.game.clearPossible();
    dojo.query(`#${pieceId}`).addClass(PP_SELECTED).removeClass(PP_SELECTABLE);
    this.setDestinationCardsSelectable({ pieceId, cardId });
    this.game.clientUpdatePageTitle({
      text: _('${you} must select the card to move the spy to'),
      args: {
        you: '${you}',
      },
    });
    this.addCancelButton();
  }

  private updateInterfaceConfirmMoves() {
    this.game.clearPossible();
    this.game.clientUpdatePageTitle({
      text: _('Confirm moves?'),
      args: {},
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.onConfirm(),
    });
    this.addCancelButton();
  }

  // ..######..##.......####..######..##....##
  // .##....##.##........##..##....##.##...##.
  // .##.......##........##..##.......##..##..
  // .##.......##........##..##.......#####...
  // .##.......##........##..##.......##..##..
  // .##....##.##........##..##....##.##...##.
  // ..######..########.####..######..##....##

  // .##.....##....###....##....##.########..##.......########.########...######.
  // .##.....##...##.##...###...##.##.....##.##.......##.......##.....##.##....##
  // .##.....##..##...##..####..##.##.....##.##.......##.......##.....##.##......
  // .#########.##.....##.##.##.##.##.....##.##.......######...########...######.
  // .##.....##.#########.##..####.##.....##.##.......##.......##...##.........##
  // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##..##....##
  // .##.....##.##.....##.##....##.########..########.########.##.....##..######.

  private onCardClick({ toCardId, fromCardId, pieceId }: { toCardId: string; fromCardId: string; pieceId: string }) {
    debug('onCardClick', pieceId, fromCardId, toCardId);
    this.game.clearPossible();

    this.addMove({ from: fromCardId, to: toCardId, pieceId });
    this.game.move({
      id: pieceId,
      from: this.game.spies[fromCardId],
      to: this.game.spies[toCardId],
      removeClass: [PP_SELECTED],
    });

    this.nextStepAfterMove();
  }

  private onConfirm() {
    debug('onConfirm', this.moves);
    // 'pieceId:from:to:from:to
    // let arg: string = '';
    // Object.entries(this.moves).forEach(([pieceId, moves]) => {
    //   arg += ` ${pieceId}`;
    //   moves.forEach(({from, to}) => {
    //     arg += `:${from}-${to}`;
    //   });
    // });
    // console.log(arg.trim());
    // if (arg.length > 0) {
    //   console.log('takeAction')
    //   this.game.takeAction({action: 'move', data: {
    //     cardId: this.cardId,
    //     moves: arg,
    //   }})
    // }
    if (this.totalNumberOfMoves() > 0) {
      this.game.takeAction({
        action: 'move',
        data: {
          cardId: this.cardId,
          moves: JSON.stringify(this.moves),
        },
      });
    }
  }

  private onRegionClick({ fromRegionId, toRegionId, pieceId }: { fromRegionId: string; toRegionId: string; pieceId: string }) {
    debug('onRegionClick', fromRegionId, toRegionId, pieceId);
    this.game.clearPossible();
    const fromRegion = this.game.map.getRegion({ region: fromRegionId });
    const toRegion = this.game.map.getRegion({ region: toRegionId });
    const isPieceArmy = pieceId.startsWith('block');

    this.addMove({ from: fromRegionId, to: toRegionId, pieceId });
    this.game.move({
      id: pieceId,
      from: isPieceArmy ? fromRegion.getArmyZone() : fromRegion.getTribeZone(),
      to: isPieceArmy ? toRegion.getArmyZone() : toRegion.getTribeZone(),
      removeClass: [PP_SELECTED],
    });

    this.nextStepAfterMove();
  }

  private nextStepAfterMove() {
    // TODO time for move animation or make animation Promise
    setTimeout(() => {
      if (this.maxNumberOfMoves > this.totalNumberOfMoves()) {
        this.updateInterfaceInitialStep();
      } else {
        this.updateInterfaceConfirmMoves();
      }
    }, 1000);
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private addMove({ pieceId, from, to }: { pieceId: string; from: string; to: string }) {
    if (this.moves[pieceId]) {
      this.moves[pieceId].push({
        from,
        to,
      });
    } else {
      this.moves[pieceId] = [
        {
          from,
          to,
        },
      ];
    }
  }

  private addCancelButton() {
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => {
        this.returnPiecesToOriginalPosition();
        this.game.onCancel();
      },
    });
  }

  /**
   *
   * @returns next card for given cardId in court of playerId
   */
  private getNextCardId({ cardId }: { cardId: string; }) {
    const node = dojo.byId(cardId);
    const playerId = Number(node.closest('.pp_court')?.id.split('_')[3]);
    const cardIds = this.game.playerManager.getPlayer({ playerId }).getCourtZone().getAllItems();

    // Assumption to check: cardIds are returned in court order (based on weight)
    const index = cardIds.indexOf(cardId);

    // If card is not at the end of a players court can return the next card in the current players court.
    if (index !== cardIds.length - 1) {
      return cardIds[index + 1];
    }

    // Otherwise return the first courtCard of the next players court that has court cards
    let currentPlayerId = playerId;
    while (true) {
      const nextPlayerId = this.getNextPlayer({ playerId: currentPlayerId });
      const nextPlayerCardsIds = this.game.playerManager.getPlayer({ playerId: nextPlayerId }).getCourtZone().getAllItems();
      if (nextPlayerCardsIds.length > 0) {
        return nextPlayerCardsIds[0];
      } else {
        currentPlayerId = nextPlayerId;
      }
    }
  }

  /**
   *
   * @returns previous card for given cardId in court of playerId
   */
  private getPreviousCardId({ cardId }: { cardId: string;}) {
    const node = dojo.byId(cardId);
    const playerId = Number(node.closest('.pp_court')?.id.split('_')[3]);
    const cardIds = this.game.playerManager.getPlayer({ playerId }).getCourtZone().getAllItems();

    // Assumption to check: cardIds are returned in court order (based on weight)
    const index = cardIds.indexOf(cardId);

    // If card is not at the beginning of a players court can return the previous card in the current players court.
    if (index !== 0) {
      return cardIds[index - 1];
    }

    // Otherwise return the first courtCard of the previous players court with court cards
    let currentPlayerId = playerId;
    while (true) {
      const previousPlayerId = this.getPreviousPlayer({ playerId: currentPlayerId });
      const previousPlayerCardIds = this.game.playerManager.getPlayer({ playerId: previousPlayerId }).getCourtZone().getAllItems();
      if (previousPlayerCardIds.length > 0) {
        return previousPlayerCardIds[previousPlayerCardIds.length - 1];
      } else {
        currentPlayerId = previousPlayerId;
      }
    }
  }

  /**
   * @returns next player for the player with given playerId
   */
  private getNextPlayer({ playerId }: { playerId: number }) {
    const playerOrder = this.getPlayerOrder();
    const playerIndex = playerOrder.indexOf(playerId);

    if (playerIndex === playerOrder.length - 1) {
      // Last element so return player on index 0
      return playerOrder[0];
    } else {
      // Return next item in array
      return playerOrder[playerIndex + 1];
    }
  }

  /**
   * @returns previous player for the player with given playerId
   */
  private getPreviousPlayer({ playerId }: { playerId: number }) {
    const playerOrder = this.getPlayerOrder();
    const playerIndex = playerOrder.indexOf(playerId);

    if (playerIndex === 0) {
      // First element so return player on last index
      return playerOrder[playerOrder.length - 1];
    } else {
      // Return previous item in array
      return playerOrder[playerIndex - 1];
    }
  }

  /**
   * @returns returns array of playerIds in player order
   */
  private getPlayerOrder = (): number[] => {
    return this.game.gamedatas.playerorder.map((id) => Number(id));
  };

  /**
   * Return pieces to location where they started their moves (in case of cancel)
   */
  private returnPiecesToOriginalPosition() {
    Object.entries(this.moves).forEach(([key, value]) => {
      if (value.length === 0) {
        return;
      }
      debug('return', key, value);
      // From region is the destination of the last move
      const from = value[value.length - 1].to;
      // To region is the source of the first move
      const to = value[0].from;
      if (from === to) {
        return;
      }
      if (key.includes('block')) {
        this.game.move({
          id: key,
          from: this.game.map.getRegion({ region: from }).getArmyZone(),
          to: this.game.map.getRegion({ region: to }).getArmyZone(),
        });
      } else if (key.includes('cylinder') && !from.startsWith('card')) {
        // Moved cylinders with nationalism
        this.game.move({
          id: key,
          from: this.game.map.getRegion({ region: from }).getTribeZone(),
          to: this.game.map.getRegion({ region: to }).getTribeZone(),
        });
      } else if (key.includes('cylinder')) {
        this.game.move({
          id: key,
          from: this.game.spies[from],
          to: this.game.spies[to],
        });
      }
    });
  }

  private setArmiesSelectable() {
    /**
     * For each region
     * check if there are loyal armies and roads on borders
     *  =>
     */
    REGIONS.forEach((regionId) => {
      const region = this.game.map.getRegion({ region: regionId });
      const coalitionId = this.game.localState.activePlayer.loyalty;
      // const enemyPieces = region.getEnemyPieces({ coalitionId });
      const coalitionArmies = region.getCoalitionArmies({ coalitionId });

      const player = this.game.getCurrentPlayer();
      const tribesNationalism = player.ownsEventCard({ cardId: ECE_NATIONALISM_CARD_ID })
        ? region.getPlayerTribes({ playerId: player.getPlayerId() })
        : [];

      debug('coalitionArmies', regionId, coalitionArmies);
      if (coalitionArmies.length + tribesNationalism.length === 0) {
        return;
      }

      const hasCoalitionRoads = region.borders.some((borderId: string) => {
        const border = this.game.map.getBorder({ border: borderId });
        return border.getCoalitionRoads({ coalitionId }).length > 0;
      });
      if (!hasCoalitionRoads) {
        return;
      }
      coalitionArmies.concat(tribesNationalism).forEach((pieceId: string) => {
        console.log('selectable army', pieceId);
        const element = dojo.byId(pieceId);
        element.classList.add('pp_selectable');
        this.game._connections.push(dojo.connect(element, 'onclick', this, () => this.updateInterfaceArmySelected({ pieceId, regionId })));
      });
    });
  }

  private getSingleMoveDestinationsForSpy({ cardId }: {cardId: string;}): string[] {
    const cardInfo = this.game.getCardInfo({cardId}) as CourtCard;
    const destinationCards: string[] = [];
    destinationCards.push(
      this.getNextCardId({ cardId })
    )
    const previousCardId = this.getPreviousCardId({ cardId });
    if (!destinationCards.includes(previousCardId)) {
      destinationCards.push(previousCardId);
    };
    const player = this.game.getCurrentPlayer();
    if (player.hasSpecialAbility({specialAbility: SA_STRANGE_BEDFELLOWS})) {
      dojo.query(`.pp_card_in_court.pp_${cardInfo.region}`).forEach((node) => {
        const nodeId = node.id;
        if (!destinationCards.includes(nodeId)) {
          destinationCards.push(nodeId);
        }
      })
    }
    return destinationCards;
  }

  private setDestinationCardsSelectable({ pieceId, cardId: inputCardId }: {pieceId: string; cardId: string;}) {
    debug('setDestinationCardsSelectable', pieceId, inputCardId);

    const destinationCards = this.getSingleMoveDestinationsForSpy({cardId: inputCardId});
    const player = this.game.getCurrentPlayer();
    if (player.hasSpecialAbility({specialAbility: SA_WELL_CONNECTED})) {
      [...destinationCards].forEach((cardId) => {
        destinationCards.push(...this.getSingleMoveDestinationsForSpy({cardId}));
      });
    }

    const uniqueDestinations: string[] = [];
    destinationCards.forEach((cardId) => {
      if (!uniqueDestinations.includes(cardId)) {
        uniqueDestinations.push(cardId);
      }
    })

    // Filter in case this is the only card in play so previous and next card are same as the selected card
    // destinationCards
    uniqueDestinations
      .filter((id) => id !== inputCardId)
      .forEach((toCardId) => {
        const destinationCardNode = dojo.byId(toCardId);
        destinationCardNode.classList.add(PP_SELECTABLE);
        this.game._connections.push(
          dojo.connect(destinationCardNode, 'onclick', this, () => this.onCardClick({ toCardId, fromCardId: inputCardId, pieceId }))
        );
      });
  }

  private setDestinationRegionsSelectable({ pieceId, regionId }: { pieceId: string; regionId: string }) {
    debug('setDestinationRegionsSelectable', pieceId, regionId);

    this.game.map.setSelectable();

    const region = this.game.map.getRegion({ region: regionId });
    const coalitionId = this.game.localState.activePlayer.loyalty;
    region.borders.forEach((borderId) => {
      const border = this.game.map.getBorder({ border: borderId });
      if (border.getCoalitionRoads({ coalitionId }).length > 0) {
        const toRegionId = borderId.split('_').filter((borderRegionId) => borderRegionId !== regionId)[0];
        this.game.map
          .getRegion({ region: toRegionId })
          .setSelectable({ callback: () => this.onRegionClick({ fromRegionId: regionId, toRegionId, pieceId }) });
      }
    });
  }

  private setSpiesSelectable() {
    /**
     * Check all spy zones for spies of current player
     * Set selectable
     */
    Object.entries(this.game.spies).forEach(([cardId, zone]) => {
      zone.getAllItems().forEach((cylinderId) => {
        if (Number(cylinderId.split('_')[1]) !== this.game.getPlayerId()) {
          return;
        }
        // debug('player spy on', cardId, cylinderId);
        // pieces.forEach((pieceId: string) => {
        //   dojo.query(`#${pieceId}`).forEach((node: HTMLElement, index: number) => {
        //     // const cardId = 'card_' + node.id.split('_')[1];
        //     // console.log('cardId in courtcardselect', cardId);
        //     dojo.addClass(node, 'pp_selectable');
        //     this.game._connections.push(dojo.connect(node, 'onclick', this, () => this.handlePieceClicked({ pieceId })));
        //   });
        // });
        const node = dojo.byId(cylinderId);
        node.classList.add(PP_SELECTABLE);
        this.game._connections.push(
          dojo.connect(node, 'onclick', this, () => this.updateIntefaceSpySelected({ pieceId: cylinderId, cardId }))
        );
      });
    });
  }

  private totalNumberOfMoves() {
    let total = 0;
    Object.values(this.moves).forEach((movesForSinglePiece) => {
      total += movesForSinglePiece.length;
    });
    return total;
  }

  private updatePageTitle() {
    this.game.clientUpdatePageTitle({
      text: _('${you} must select an army or spy to move (${number} remaining)'),
      args: {
        you: '${you}',
        number: this.maxNumberOfMoves - this.totalNumberOfMoves(),
      },
    });
  }
}
