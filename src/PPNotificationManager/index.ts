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

class PPNotificationManager {
  private game: PaxPamirGame;
  private subscriptions: unknown[];

  constructor(game) {
    this.game = game;
    this.subscriptions = [];
  }

  destroy() {
    dojo.forEach(this.subscriptions, dojo.unsubscribe);
  }

  getPlayer({ args }: Notif<{ player_id: string }>): PPPlayer {
    return this.game.playerManager.getPlayer({ playerId: args.player_id });
  }

  setupNotifications() {
    console.log('notifications subscriptions setup');
    const notifs: [id: string, wait: number][] = [
      ['cardAction', 1],
      ['chooseLoyalty', 1],
      ['dominanceCheck', 1],
      ['purchaseCard', 2000],
      ['playCard', 2000],
      ['discardCard', 500],
      ['refreshMarket', 250],
      ['selectGift', 1],
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

  notif_chooseLoyalty(notif: Notif<NotifChooseLoyaltyArgs>) {
    const { args } = notif;
    console.log('notif_chooseLoyalty', args);
    this.getPlayer(notif).updatePlayerLoyalty({ coalition: args.coalition });
  }

  notif_discardCard(notif: Notif<NotifDiscardCardArgs>) {
    console.log('notif_discardCard', notif);

    this.game.interactionManager.resetActionArgs();
    const playerId = notif.args.playerId;
    const from = notif.args.from;

    if (from == 'hand') {
      // TODO (Frans): check how this works for other players than the one whos card gets discarded
      this.game.discardCard({ id: notif.args.cardId, from: this.game.playerHand });
    } else if (from == 'market_0_0' || from == 'market_1_0') {
      const splitFrom = from.split('_');
      this.game.discardCard({
        id: notif.args.cardId,
        from: this.game.market.getMarketCardsStock({ row: Number(splitFrom[1]), column: Number(splitFrom[2]) }),
      });
    } else {
      this.game.discardCard({ id: notif.args.cardId, from: this.game.playerManager.getPlayer({ playerId }).getCourtZone() });

      notif.args.courtCards.forEach(function (card, index) {
        this.game.updateCard({
          location: this.game.playerManager.players[playerId].court,
          id: card.id,
          order: card.state,
        });
      }, this);
    }
  }

  notif_dominanceCheck(notif) {
    console.log('notif_dominanceCheck', notif);
    const { scores, moves } = notif.args;
    Object.keys(scores).forEach((playerId) => {
      this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].new_score);
      this.game.moveToken({
        id: `vp_cylinder_${playerId}`,
        from: this.game.objectManager.vpTrack.getZone(scores[playerId].current_score),
        to: this.game.objectManager.vpTrack.getZone(scores[playerId].new_score),
      });
    });

    (moves || []).forEach((move) => {
      const { token_id, from, to } = move;
      const coalition = to.split('_')[1];
      const splitFrom = from.split('_');
      const isArmy = splitFrom[0] == 'armies';
      this.game.moveToken({
        id: token_id,
        to: this.game.objectManager.supply.getCoalitionBlocksZone({ coalition }),
        from: isArmy
          ? this.game.map.getRegion({ region: splitFrom[1] }).getArmyZone()
          : this.game.map.getBorder({ border: `${splitFrom[1]}_${splitFrom[2]}` }).getRoadZone(),
        addClass: 'pp_coalition_block',
        removeClass: isArmy ? 'pp_army' : 'pp_road',
      });
    });
  }

  notif_playCard(notif: Notif<NotifPlayCardArgs>) {
    console.log('notif_playCard', notif);

    this.game.interactionManager.resetActionArgs();
    var playerId = notif.args.playerId;

    notif.args.courtCards.forEach(function (card, index) {
      this.game.updateCard({
        location: this.game.playerManager.players[playerId].court,
        id: card.id,
        order: card.state,
      });
    }, this);

    if (playerId == this.game.getPlayerId()) {
      this.game.moveCard({
        id: notif.args.card.id,
        from: this.game.playerHand,
        to: this.game.playerManager.getPlayer({ playerId }).getCourtZone(),
      });
    } else {
      // TODO (Frans): check why moveCard results in a UI error => probably because other players don't have a playerHand?
      // this.game.moveCard({id: notif.args.card.key, from: null, to: this.game.playerManager.players[playerId].court});
      placeCard({
        location: this.game.playerManager.getPlayer({ playerId }).getCourtZone(),
        id: notif.args.card.id,
      });
    }

    this.game.playerManager.getPlayer({ playerId }).getCourtZone().updateDisplay();
  }

  notif_purchaseCard(notif: Notif<NotifPurchaseCardArgs>) {
    console.log('notif_purchaseCard', notif);
    const { marketLocation, newLocation, updatedCards, playerId } = notif.args;

    this.game.interactionManager.resetActionArgs();
    const row = Number(marketLocation.split('_')[1]);
    const col = Number(marketLocation.split('_')[2]);

    // Remove all rupees that were on the purchased card
    this.game.market.removeRupeesFromCard({ row, column: col, to: `rupees_${playerId}` });

    // Move card from markt
    const cardId = notif.args.card.id;
    if (newLocation == 'active_events') {
      this.game.moveCard({
        id: cardId,
        from: this.game.market.getMarketCardsStock({ row, column: col }),
        to: this.game.activeEvents,
      });
    } else if (newLocation == 'discard') {
      this.game.market.getMarketCardsStock({ row, column: col }).removeFromStockById(cardId, 'pp_discard_pile');
    } else if (playerId == this.game.getPlayerId()) {
      this.game.moveCard({
        id: cardId,
        from: this.game.market.getMarketCardsStock({ row, column: col }),
        to: this.game.playerHand,
      });
    } else {
      this.game.moveCard({ id: cardId, from: this.game.market.getMarketCardsStock({ row, column: col }), to: null });
      this.game.spies[cardId] = undefined;
    }

    // Place paid rupees on market cards
    updatedCards.forEach((item, index) => {
      const { row, column, rupeeId } = item;
      this.game.market.placeRupeeOnCard({ row, column, rupeeId });
    });
  }

  notif_refreshMarket(notif: Notif<NotifRefreshMarketArgs>) {
    console.log('notif_refreshMarket', notif);

    this.game.interactionManager.resetActionArgs();

    notif.args.cardMoves.forEach(function (move, index) {
      const fromRow = move.from.split('_')[1];
      const fromCol = move.from.split('_')[2];
      const toRow = move.to.split('_')[1];
      const toCol = move.to.split('_')[2];
      this.game.moveCard({
        id: move.cardId,
        from: this.game.market.marketCards[fromRow][fromCol],
        to: this.game.market.marketCards[toRow][toCol],
      });
      // TODO (Frans): check why in case of moving multiple rupees at the same time
      // they overlap
      this.game.market.marketRupees[fromRow][fromCol].getAllItems().forEach((rupeeId) => {
        this.game.moveToken({
          id: rupeeId,
          to: this.game.market.marketRupees[toRow][toCol],
          from: this.game.market.marketRupees[fromRow][toRow],
          weight: this.game.defaultWeightZone,
        });
      });
    }, this);

    notif.args.newCards.forEach(function (move, index) {
      placeCard({
        location: this.game.market.marketCards[move.to.split('_')[1]][move.to.split('_')[2]],
        id: move.cardId,
      });
    }, this);
  }

  notif_selectGift(notif) {
    console.log('notif_selectGift', notif);
    this.game.interactionManager.resetActionArgs();
    const { updated_cards, player_id, rupee_count, updated_counts } = notif.args;
    // Place paid rupees on market cards
    updated_cards.forEach((item, index) => {
      const marketRow = item.location.split('_')[1];
      const marketColumn = item.location.split('_')[2];
      placeToken({
        game: this.game,
        location: this.game.market.getMarketRupeesZone({ row: marketRow, column: marketColumn }),
        id: item.rupee_id,
        jstpl: 'jstpl_rupee',
        jstplProps: {
          id: item.rupee_id,
        },
        from: `rupees_${player_id}`,
      });
    }, this);
    $('rupee_count_' + player_id).innerHTML = updated_counts.rupees;
    $('influence_' + player_id).innerHTML = updated_counts.influence;
  }

  notif_updatePlayerCounts(notif) {
    console.log('notif_updatePlayerCounts', notif);
    this.game.playerCounts = notif.args.counts;
    const counts = notif.args.counts;

    Object.keys(counts).forEach((playerId) => {
      $('influence_' + playerId).innerHTML = counts[playerId].influence;
      $('cylinder_count_' + playerId).innerHTML = counts[playerId].cylinders;
      $('rupee_count_' + playerId).innerHTML = counts[playerId].rupees;
      $('card_count_' + playerId).innerHTML = counts[playerId].cards;

      $('economic_' + playerId).innerHTML = counts[playerId].suits.economic;
      $('military_' + playerId).innerHTML = counts[playerId].suits.military;
      $('political_' + playerId).innerHTML = counts[playerId].suits.political;
      $('intelligence_' + playerId).innerHTML = counts[playerId].suits.intelligence;
    });
  }

  notif_moveToken(notif) {
    console.log('notif_moveToken', notif);
    notif.args.moves.forEach((move) => {
      const { token_id, from, to, updates } = move;
      const fromZone = this.game.getZoneForLocation({ location: from });
      const toZone = this.game.getZoneForLocation({ location: to });

      // TODO: perhaps create separate function for this
      const addClass = to.startsWith('armies') ? 'pp_army' : to.startsWith('roads') ? 'pp_road' : undefined;
      const removeClass = from.startsWith('blocks') ? 'pp_coalition_block' : undefined;
      this.game.moveToken({
        id: token_id,
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
