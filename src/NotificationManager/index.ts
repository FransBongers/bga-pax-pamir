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
      ['battle', 250],
      ['cardAction', 1],
      ['changeRuler', 1],
      // ['initiateNegotiation', 1],
      ['changeFavoredSuit', 250],
      ['chooseLoyalty', 1],
      ['clearTurn', 1],
      ['dominanceCheck', 1],
      ['purchaseCard', 2000],
      ['playCard', 2000],
      ['discardCard', 1000],
      ['refreshMarket', 250],
      ['payBribe', 1],
      ['purchaseGift', 1],
      ['smallRefreshHand', 1],
      ['smallRefreshInterface', 1],
      ['moveToken', 250],
      ['updatePlayerCounts', 1],
      ['log', 1],
      ['taxMarket', 250],
      ['taxPlayer', 250],
    ];

    notifs.forEach((notif) => {
      this.subscriptions.push(dojo.subscribe(notif[0], this, `notif_${notif[0]}`));
      this.game.framework().notifqueue.setSynchronous(notif[0], notif[1]);
    });

    // this.subscriptions.push(dojo.subscribe('updatePlayerCounts', this, 'notif_updatePlayerCounts'));
    // this.subscriptions.push(dojo.subscribe('log', this, 'notif_log'));
  }

  notif_battle(notif) {
    debug('notif_battle', notif);
  }

  notif_cardAction(notif) {
    console.log('notif_cardAction', notif);
  }

  notif_changeFavoredSuit(notif: Notif<NotifChangeFavoredSuitArgs>) {
    console.log('notif_moveToken', notif);
    const { from, to } = notif.args;
    const tokenId = 'favored_suit_marker';
    const fromZone = this.game.getZoneForLocation({ location: `favored_suit_${from}` });
    const toZone = this.game.getZoneForLocation({ location: `favored_suit_${to}` });

    this.game.objectManager.favoredSuit.change({ suit: to });
    this.game.move({
      id: tokenId,
      from: fromZone,
      to: toZone,
    });
  }

  notif_changeRuler(notif: Notif<NotifChangeRulerArgs>) {
    const { args } = notif;
    console.log('notif_changeRuler', args);
    const { oldRuler, newRuler, region } = args;
    const from =
      oldRuler === null
        ? this.game.map.getRegion({ region }).getRulerZone()
        : this.game.playerManager.getPlayer({ playerId: oldRuler }).getRulerTokensZone();
    const to: Zone =
      newRuler === null
        ? this.game.map.getRegion({ region }).getRulerZone()
        : this.game.playerManager.getPlayer({ playerId: newRuler }).getRulerTokensZone();
    this.game.map.getRegion({ region }).setRuler({ playerId: newRuler });
    this.game.move({
      id: `pp_ruler_token_${region}`,
      from,
      to,
    });
  }

  // notif_initiateNegotiation(notif: Notif<unknown>) {
  //   const { args } = notif;
  //   console.log('notif_initiateNegotiation', args);
  // }

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

    this.game.clearPossible();
    const playerId = Number(notif.args.playerId);
    const from = notif.args.from;

    if (from == 'hand') {
      this.getPlayer({ playerId }).discardHandCard({ cardId: notif.args.cardId });
    } else if (from == 'market_0_0' || from == 'market_1_0') {
      const splitFrom = from.split('_');
      this.game.market.discardCard({ cardId: notif.args.cardId, row: Number(splitFrom[1]), column: Number(splitFrom[2]) });
    } else {
      this.getPlayer({ playerId }).discardCourtCard({ cardId: notif.args.cardId });
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

  notif_payBribe(notif: Notif<NotifPayBribeArgs>) {
    const { args } = notif;
    console.log('notif_payBribe', args);
    const { briberId, rulerId, rupees } = args;
    this.getPlayer({ playerId: briberId }).payToPlayer({ playerId: rulerId, rupees });
  }

  notif_playCard(notif: Notif<NotifPlayCardArgs>) {
    console.log('notif_playCard', notif);

    this.game.clearPossible();
    var playerId = Number(notif.args.playerId);

    const player = this.getPlayer({ playerId });
    notif.args.courtCards.forEach((card, index) => {
      const item = player.getCourtZone().items.find((item) => item.id === card.id);
      if (item) {
        item.weight = card.state;
      }
    });

    player.playCard({
      card: notif.args.card,
    });

    this.getPlayer({ playerId }).getCourtZone().updateDisplay();
  }

  notif_purchaseCard(notif: Notif<NotifPurchaseCardArgs>) {
    console.log('notif_purchaseCard', notif);
    const { marketLocation, newLocation, rupeesOnCards, playerId, receivedRupees } = notif.args;
    // const playerId = Number(notif.args.playerId);
    this.game.clearPossible();
    const row = Number(marketLocation.split('_')[1]);
    const col = Number(marketLocation.split('_')[2]);

    // Place paid rupees on market cards
    rupeesOnCards.forEach((item, index) => {
      const { row, column, rupeeId } = item;
      this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -1 });
      this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}` });
    });

    // Remove all rupees that were on the purchased card
    this.game.market.removeRupeesFromCard({ row, column: col, to: `rupees_${playerId}` });
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: receivedRupees });

    // Move card from markt
    const cardId = notif.args.card.id;
    if (newLocation == 'active_events') {
      this.game.move({
        id: cardId,
        from: this.game.market.getMarketCardZone({ row, column: col }),
        to: this.game.activeEvents,
      });
    } else if (newLocation == 'discard') {
      this.game.market.getMarketCardZone({ row, column: col }).removeFromZone(cardId, false);
      discardCardAnimation({ cardId, game: this.game });
    } else {
      this.getPlayer({ playerId }).purchaseCard({ cardId, from: this.game.market.getMarketCardZone({ row, column: col }) });
    }
  }

  notif_refreshMarket(notif: Notif<NotifRefreshMarketArgs>) {
    console.log('notif_refreshMarket', notif);

    this.game.clearPossible();

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

  notif_purchaseGift(notif: Notif<NotifPurchaseGiftArgs>) {
    console.log('notif_purchaseGift', notif);
    this.game.clearPossible();
    const { rupeesOnCards, playerId, tokenMove, influenceChange } = notif.args;

    // Place paid rupees on market cards
    rupeesOnCards.forEach((item, index) => {
      const { row, column, rupeeId } = item;
      this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -1 });
      this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}` });
    });

    // Move cylinder
    const { tokenId, from, to } = tokenMove;
    const fromZone = this.game.getZoneForLocation({ location: from });
    const toZone = this.game.getZoneForLocation({ location: to });
    this.game.move({
      id: tokenId,
      from: fromZone,
      to: toZone,
    });

    // Update influence
    this.getPlayer({ playerId: notif.args.playerId }).incCounter({ counter: 'influence', value: influenceChange });
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

  notif_moveToken(notif: Notif<NotifMoveTokenArgs>) {
    console.log('notif_moveToken', notif);
    notif.args.moves.forEach((move) => {
      const { tokenId, from, to, weight } = move;
      const fromZone = this.game.getZoneForLocation({ location: from });
      const toZone = this.game.getZoneForLocation({ location: to });

      // TODO: perhaps create separate function for this
      const addClass = [];
      const removeClass = [];
      if (to.startsWith('armies')) {
        addClass.push('pp_army');
      } else if (to.startsWith('roads')) {
        addClass.push('pp_road');
      } else if (to.startsWith('blocks')) {
        addClass.push('pp_coalition_block');
      }
      if (from.startsWith('blocks')) {
        removeClass.push('pp_coalition_block');
      } else if (from.startsWith('armies')) {
        removeClass.push('pp_army');
      } else if (from.startsWith('roads')) {
        removeClass.push('pp_road');
      }

      this.game.move({
        id: tokenId,
        from: fromZone,
        to: toZone,
        addClass,
        removeClass,
        weight,
      });
    });
  }

  notif_taxMarket(notif: Notif<NotifTaxMarketArgs>) {
    debug('notif_taxMarket', notif.args);
    const { selectedRupees, playerId, amount } = notif.args;
    selectedRupees.forEach((rupee) => {
      const { row, column, rupeeId } = rupee;
      this.game.market.removeSingleRupeeFromCard({ row, column, rupeeId, to: `rupees_${playerId}` });
    });
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: amount });
  }

  notif_taxPlayer(notif: Notif<NotifTaxPlayerArgs>) {
    debug('notif_taxPlayer', notif.args);
    const { playerId, taxedPlayerId, amount } = notif.args;
    const player = this.getPlayer({ playerId: taxedPlayerId });
    player.removeTaxCounter();
    player.payToPlayer({ playerId, rupees: amount });
  }

  notif_log(notif) {
    // this is for debugging php side
    console.log('notif_log', notif.args);
  }
}
