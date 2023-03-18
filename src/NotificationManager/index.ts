//  .##....##..#######..########.####.########
//  .###...##.##.....##....##.....##..##......
//  .####..##.##.....##....##.....##..##......
//  .##.##.##.##.....##....##.....##..######..
//  .##..####.##.....##....##.....##..##......
//  .##...###.##.....##....##.....##..##......
//  .##....##..#######.....##....####.##......

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class NotificationManager {
  private game: PaxPamirGame;
  private subscriptions: unknown[];

  constructor(game) {
    this.game = game;
    this.subscriptions = [];
  }

  destroy() {
    dojo.forEach(this.subscriptions, dojo.unsubscribe);
  }

  getPlayer({ playerId }: { playerId: number }): PPPlayer {
    return this.game.playerManager.getPlayer({ playerId });
  }

  setupNotifications() {
    console.log('notifications subscriptions setup');
    const notifs: [id: string, wait: number][] = [
      ['cardAction', 1],
      ['changeRuler', 1],
      ['chooseLoyalty', 1],
      ['clearTurn', 1],
      ['dominanceCheck', 1],
      ['purchaseCard', 2000],
      ['playCard', 2000],
      ['discardCard', 500],
      ['refreshMarket', 250],
      ['selectGift', 1],
      ['smallRefreshHand', 1],
      ['smallRefreshInterface', 1],
      ['moveToken', 250],
      ['updatePlayerCounts', 1],
      ['log', 1],
    ];

    notifs.forEach((notif) => {
      this.subscriptions.push(dojo.subscribe(notif[0], this, `notif_${notif[0]}`));
      this.game.framework().notifqueue.setSynchronous(notif[0], notif[1]);
    });

    // this.subscriptions.push(dojo.subscribe('updatePlayerCounts', this, 'notif_updatePlayerCounts'));
    // this.subscriptions.push(dojo.subscribe('log', this, 'notif_log'));
  }

  notif_cardAction(notif) {
    console.log('notif_cardAction', notif);
  }

  notif_changeRuler(notif: Notif<NotifChangeRulerArgs>) {
    const { args } = notif;
    console.log('notif_changeRuler', args);
    const { oldRuler, newRuler, region } = args;
    const lowerCaseRegion = region.toLowerCase();
    const from =
      oldRuler === null
        ? this.game.map.getRegion({ region: lowerCaseRegion }).getRulerZone()
        : this.game.playerManager.getPlayer({ playerId: oldRuler }).getRulerTokensZone();
    const to: Zone =
      newRuler === null
        ? this.game.map.getRegion({ region: lowerCaseRegion }).getRulerZone()
        : this.game.playerManager.getPlayer({ playerId: newRuler }).getRulerTokensZone();
    this.game.map.getRegion({ region: lowerCaseRegion }).setRuler({ playerId: newRuler });
    this.game.move({
      id: `pp_ruler_token_${lowerCaseRegion}`,
      from,
      to,
    });
  }

  notif_chooseLoyalty(notif: Notif<NotifChooseLoyaltyArgs>) {
    const { args } = notif;
    console.log('notif_chooseLoyalty', args);
    const playerId = Number(args.playerId);
    this.getPlayer({ playerId }).updatePlayerLoyalty({ coalition: args.coalition });
    // TODO (make this notif more generic for loyalty changes?)
    this.getPlayer({ playerId }).setCounter({ counter: 'influence', value: 1 });
  }

  notif_clearTurn(notif) {
    const { args } = notif;
    const notifIds = args.notifIds;
    console.log('notif_clearTurn', args);
    console.log('notif_clearTurn notifIds', notifIds);
    this.game.cancelLogs(notifIds);
  }

  notif_discardCard(notif: Notif<NotifDiscardCardArgs>) {
    console.log('notif_discardCard', notif);

    this.game.interactionManager.resetActionArgs();
    const playerId = Number(notif.args.playerId);
    const from = notif.args.from;

    if (from == 'hand') {
      // TODO (Frans): check how this works for other players than the one whos card gets discarded
      this.game.discardCard({
        id: notif.args.cardId,
        order: notif.args.state || undefined,
        from: this.getPlayer({ playerId }).getHandZone(),
      });
    } else if (from == 'market_0_0' || from == 'market_1_0') {
      const splitFrom = from.split('_');
      this.game.discardCard({
        id: notif.args.cardId,
        from: this.game.market.getMarketCardZone({ row: Number(splitFrom[1]), column: Number(splitFrom[2]) }),
        order: notif.args.state || undefined,
      });
    } else {
      this.game.discardCard({
        id: notif.args.cardId,
        order: notif.args.state || undefined,
        from: this.getPlayer({ playerId }).getCourtZone(),
      });

      // TODO: check if it is needed to update weight of cards in zone?
    }
  }

  notif_dominanceCheck(notif) {
    console.log('notif_dominanceCheck', notif);
    const { scores, moves } = notif.args;
    Object.keys(scores).forEach((playerId) => {
      this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].newScore);
      this.game.move({
        id: `vp_cylinder_${playerId}`,
        from: this.game.objectManager.vpTrack.getZone(scores[playerId].currentScore),
        to: this.game.objectManager.vpTrack.getZone(scores[playerId].newScore),
      });
    });

    (moves || []).forEach((move) => {
      const { tokenId, from, to } = move;
      const coalition = to.split('_')[1];
      const splitFrom = from.split('_');
      const isArmy = splitFrom[0] == 'armies';
      this.game.move({
        id: tokenId,
        to: this.game.objectManager.supply.getCoalitionBlocksZone({ coalition }),
        from: isArmy
          ? this.game.map.getRegion({ region: splitFrom[1] }).getArmyZone()
          : this.game.map.getBorder({ border: `${splitFrom[1]}_${splitFrom[2]}` }).getRoadZone(),
        addClass: ['pp_coalition_block'],
        removeClass: isArmy ? ['pp_army'] : ['pp_road'],
      });
    });
  }

  notif_playCard(notif: Notif<NotifPlayCardArgs>) {
    console.log('notif_playCard', notif);

    this.game.interactionManager.resetActionArgs();
    var playerId = Number(notif.args.playerId);

    const player = this.getPlayer({ playerId });
    notif.args.courtCards.forEach((card, index) => {
      const item = player.getCourtZone().items.find((item) => item.id === card.id);
      if (item) {
        item.weight = card.state;
      }
    });

    player.moveToCourt({
      card: notif.args.card,
      from: Number(playerId) === this.game.getPlayerId() ? player.getHandZone() : null,
    });

    this.getPlayer({ playerId }).getCourtZone().updateDisplay();
  }

  notif_purchaseCard(notif: Notif<NotifPurchaseCardArgs>) {
    console.log('notif_purchaseCard', notif);
    const { marketLocation, newLocation, updatedCards } = notif.args;
    const playerId = Number(notif.args.playerId);
    this.game.interactionManager.resetActionArgs();
    const row = Number(marketLocation.split('_')[1]);
    const col = Number(marketLocation.split('_')[2]);

    // Remove all rupees that were on the purchased card
    this.game.market.removeRupeesFromCard({ row, column: col, to: `rupees_${playerId}` });

    // Move card from markt
    const cardId = notif.args.card.id;
    if (newLocation == 'active_events') {
      this.game.move({
        id: cardId,
        from: this.game.market.getMarketCardZone({ row, column: col }),
        to: this.game.activeEvents,
      });
    } else if (newLocation == 'discard') {
      this.game.market.getMarketCardZone({ row, column: col }).removeFromZone(cardId, true, 'pp_discard_pile');
    } else if (playerId === this.game.getPlayerId()) {
      this.getPlayer({ playerId }).moveToHand({ cardId, from: this.game.market.getMarketCardZone({ row, column: col }) });
    } else {
      this.game.market.getMarketCardZone({ row, column: col }).removeFromZone(cardId, true, `cards_${playerId}`);
    }

    // Place paid rupees on market cards
    updatedCards.forEach((item, index) => {
      const { row, column, rupeeId } = item;
      // this.getPlayer({playerId}).incCounter({counter: 'rupees', value: -1});
      this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}` });
    });
  }

  notif_refreshMarket(notif: Notif<NotifRefreshMarketArgs>) {
    console.log('notif_refreshMarket', notif);

    this.game.interactionManager.resetActionArgs();

    notif.args.cardMoves.forEach((move, index) => {
      const fromRow = Number(move.from.split('_')[1]);
      const fromCol = Number(move.from.split('_')[2]);
      const toRow = Number(move.to.split('_')[1]);
      const toCol = Number(move.to.split('_')[2]);
      this.game.market.moveCard({
        cardId: move.cardId,
        from: {
          row: fromRow,
          column: fromCol,
        },
        to: {
          row: toRow,
          column: toCol,
        },
      });
    });

    notif.args.newCards.forEach((move, index) => {
      const row = Number(move.to.split('_')[1]);
      const column = Number(move.to.split('_')[2]);
      this.game.market.addCardFromDeck({
        to: {
          row,
          column,
        },
        cardId: move.cardId,
      });
    });
  }

  notif_selectGift(notif) {
    console.log('notif_selectGift', notif);
    this.game.interactionManager.resetActionArgs();
    const { updatedCards, playerId, rupee_count, updatedCounts } = notif.args;
    // Place paid rupees on market cards
    updatedCards.forEach((item, index) => {
      const marketRow = item.location.split('_')[1];
      const marketColumn = item.location.split('_')[2];
      placeToken({
        game: this.game,
        location: this.game.market.getMarketRupeesZone({ row: marketRow, column: marketColumn }),
        id: item.rupeeId,
        jstpl: 'jstpl_rupee',
        jstplProps: {
          id: item.rupee_id,
        },
        from: `rupees_${playerId}`,
      });
    }, this);
    this.getPlayer({ playerId: notif.args.playerId }).setCounter({ counter: 'rupees', value: updatedCounts.rupees });
    this.getPlayer({ playerId: notif.args.playerId }).setCounter({ counter: 'influence', value: updatedCounts.influence });
  }

  notif_smallRefreshHand(notif) {
    console.log('notif_smallRefreshHand', notif);
  }

  notif_smallRefreshInterface(notif: Notif<NotifSmallRefreshInterfaceArgs>) {
    console.log('notif_smallRefreshInterface', notif);
    const updatedGamedatas = {
      ...this.game.gamedatas,
      ...notif.args,
    };
    this.game.clearInterface();
    console.log('updatedGamedatas', updatedGamedatas);
    this.game.gamedatas = updatedGamedatas;
    this.game.market.setupMarket({ gamedatas: updatedGamedatas });
    this.game.playerManager.updatePlayers({ gamedatas: updatedGamedatas });
    this.game.map.updateMap({ gamedatas: updatedGamedatas });
    this.game.objectManager.updateInterface({ gamedatas: updatedGamedatas });
    // this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].newScore);
  }

  notif_updatePlayerCounts(notif) {
    ``;
    console.log('notif_updatePlayerCounts', notif);
    this.game.playerCounts = notif.args.counts;
    const counts = notif.args.counts;

    Object.keys(counts).forEach((playerId) => {
      const player = this.getPlayer({ playerId: Number(playerId) });
      player.setCounter({ counter: 'influence', value: counts[playerId].influence });
      player.setCounter({ counter: 'cylinders', value: counts[playerId].cylinders });
      player.setCounter({ counter: 'rupees', value: counts[playerId].rupees });
      player.setCounter({ counter: 'cards', value: counts[playerId].cards });

      player.setCounter({ counter: 'economic', value: counts[playerId].suits.economic });
      player.setCounter({ counter: 'military', value: counts[playerId].suits.military });
      player.setCounter({ counter: 'political', value: counts[playerId].suits.political });
      player.setCounter({ counter: 'intelligence', value: counts[playerId].suits.intelligence });
    });
  }

  notif_moveToken(notif) {
    console.log('notif_moveToken', notif);
    notif.args.moves.forEach((move) => {
      const { tokenId, from, to, updates } = move;
      const fromZone = this.game.getZoneForLocation({ location: from });
      const toZone = this.game.getZoneForLocation({ location: to });

      // TODO: perhaps create separate function for this
      const addClass = to.startsWith('armies') ? ['pp_army'] : to.startsWith('roads') ? ['pp_road'] : undefined;
      const removeClass = from.startsWith('blocks') ? ['pp_coalition_block'] : undefined;
      this.game.move({
        id: tokenId,
        from: fromZone,
        to: toZone,
        addClass,
        removeClass,
      });
    });
  }

  notif_log(notif) {
    // this is for debugging php side
    console.log('notif_log', notif);
    console.log(notif.log);
    console.log(notif.args);
  }
}
