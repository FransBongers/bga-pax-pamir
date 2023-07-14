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
      ['betray', 250],
      ['build', 250],
      ['cardAction', 1],
      ['changeRuler', 1],
      ['changeFavoredSuit', 250],
      ['changeLoyalty', 1],
      ['clearTurn', 1],
      ['discardAndTakePrize', 1000],
      ['discardFromCourt', 1000],
      ['discardFromHand', 250],
      ['discardFromMarket', 250],
      ['discardPrizes', 1000],
      ['exchangeHand', 100],
      ['dominanceCheckScores', 1],
      ['dominanceCheckReturnCoalitionBlocks', 250],
      ['moveCard', 1000],
      ['moveToken', 1000],
      ['payBribe', 1],
      ['publicWithdrawal', 1000],
      ['purchaseCard', 2000],
      ['purchaseGift', 1],
      ['playCard', 2000],
      ['refreshMarket', 250],
      ['replaceHand',250],
      ['returnRupeesToSupply', 250],
      ['smallRefreshHand', 1],
      ['smallRefreshInterface', 1],
      ['takeRupeesFromSupply', 250],
      ['taxMarket', 250],
      ['taxPlayer', 250],
      ['updateCourtCardStates', 1],
      ['updateInfluence', 1],
      ['updatePlayerCounts', 1],
      ['log', 1],
      
      
    ];

    notifs.forEach((notif) => {
      this.subscriptions.push(dojo.subscribe(notif[0], this, `notif_${notif[0]}`));
      this.game.framework().notifqueue.setSynchronous(notif[0], notif[1]);
    });

    // this.subscriptions.push(dojo.subscribe('updatePlayerCounts', this, 'notif_updatePlayerCounts'));
    // this.subscriptions.push(dojo.subscribe('log', this, 'notif_log'));

    // Use below to add tooltips to add tooltips to the log
    // dojo.connect(this.game.framework().notifqueue, 'addToLog', () => {
    //   // do stuff here
    // });
  }

  // Example of making notif work with promises - https://github.com/thoun/knarr/blob/main/src/knarr.ts
  //   setupNotifications() {
  //     const notifs = [
  //         // ...
  //         ['recruit', 500], // fixed duration
  //         ['cardDeckReset', undefined], // unknown duration
  //         ['lastTurn', 1], // (almost) no duration
  //     ];

  //     notifs.forEach((notif) => {
  //         dojo.subscribe(notif[0], this, notifDetails => {
  //             log(`notif_${notif[0]}`, notifDetails.args); // log notif params (with Tisaac log method, so only studio side)

  //             const promise = this[`notif_${notif[0]}`](notifDetails.args);

  //             // tell the UI notification ends
  //             promise?.then(() => this.notifqueue.onSynchronousNotificationEnd());
  //         });
  //         // make all notif as synchronous
  //         this.notifqueue.setSynchronous(notif[0], notif[1]);
  //     });
  // }

  // // ...

  // notif_cardDeckReset(args) {
  //     this.tableCenter.cardDeck.setCardNumber(args.cardDeckCount, args.cardDeckTop);
  //     this.tableCenter.setDiscardCount(args.cardDiscardCount);

  //     // make sure the function returns a promise ! (here, the end of the shuffle animation of the deck)
  //     return this.tableCenter.cardDeck.shuffle();
  // }

  notif_battle(notif) {
    debug('notif_battle', notif);
  }

  notif_betray(notif: Notif<NotifBetrayArgs>) {
    debug('notif_betray', notif);
    const { playerId, rupeesOnCards } = notif.args;
    // Place paid rupees on market cards
    rupeesOnCards.forEach((item, index) => {
      const { row, column, rupeeId } = item;
      this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -1 });
      this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}` });
    });
  }

  notif_build(notif: Notif<NotifBuildArgs>) {
    debug('notif_build', notif);
    const { playerId, rupeesOnCards } = notif.args;

    // Place paid rupees on market cards
    rupeesOnCards.forEach((item, index) => {
      const { row, column, rupeeId } = item;
      this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -1 });
      this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}` });
    });
  }

  notif_cardAction(notif) {
    console.log('notif_cardAction', notif);
  }

  notif_changeFavoredSuit(notif: Notif<NotifChangeFavoredSuitArgs>) {
    console.log('notif_changeFavoredSuit', notif);
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

  notif_changeLoyalty(notif: Notif<NotifChangeLoyaltyArgs>) {
    debug('notif_changeLoyalty', notif.args);
    const { args } = notif;
    const playerId = Number(args.playerId);
    this.getPlayer({ playerId }).updatePlayerLoyalty({ coalition: args.coalition });
    const player = this.getPlayer({ playerId });
    // Influence value will be 0 when player chooses loyalty for the first time
    if (player.getInfluence() === 0) {
      player.setCounter({ counter: 'influence', value: 1 });
    }
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

  notif_clearTurn(notif) {
    const { args } = notif;
    const notifIds = args.notifIds;
    console.log('notif_clearTurn', args);
    console.log('notif_clearTurn notifIds', notifIds);
    this.game.cancelLogs(notifIds);
  }

  notif_discardAndTakePrize(notif: Notif<NotifDiscardAndTakePrizeArgs>) {
    console.log('notif_discardAndTakePrize', notif);

    // TODO: check to execute animations one after another
    // Decrease counters based on card rank
    this.game.clearPossible();
    const courtOwnerPlayerId = Number(notif.args.courtOwnerPlayerId);
    const { cardId, moves, playerId } = notif.args;
    moves.forEach((move: TokenMove) => {
      const { tokenId, from, to, weight } = move;
      const fromZone = this.game.getZoneForLocation({ location: from });
      const toZone = this.game.getZoneForLocation({ location: to });

      this.game.move({
        id: tokenId,
        from: fromZone,
        to: toZone,
        weight,
      });
      const spyOwnerId = Number(tokenId.split('_')[1]);
      this.getPlayer({ playerId: spyOwnerId }).incCounter({ counter: 'cylinders', value: -1 });
    });
    const player = this.getPlayer({ playerId: courtOwnerPlayerId });
    const cardInfo = this.game.getCardInfo({ cardId }) as CourtCard;
    // player.discardCourtCard({ cardId });
    this.game.playerManager.getPlayer({ playerId }).takePrize({ cardOwnerId: courtOwnerPlayerId, cardId });
    player.incCounter({ counter: cardInfo.suit, value: cardInfo.rank * -1 });
  }

  notif_discardFromCourt(notif: Notif<NotifDiscardFromCourtArgs>) {
    console.log('notif_discardCard', notif);

    // TODO: check to execute animations one after another
    // Decrease counters based on card rank
    this.game.clearPossible();
    const playerId = Number(notif.args.courtOwnerPlayerId);
    const { cardId, moves } = notif.args;
    moves.forEach((move: TokenMove) => {
      const { tokenId, from, to, weight } = move;
      const fromZone = this.game.getZoneForLocation({ location: from });
      const toZone = this.game.getZoneForLocation({ location: to });

      this.game.move({
        id: tokenId,
        from: fromZone,
        to: toZone,
        weight,
      });
      const spyOwnerId = Number(tokenId.split('_')[1]);
      this.getPlayer({ playerId: spyOwnerId }).incCounter({ counter: 'cylinders', value: -1 });
    });
    const player = this.getPlayer({ playerId });
    const cardInfo = this.game.getCardInfo({ cardId }) as CourtCard;
    player.discardCourtCard({ cardId });
    player.incCounter({ counter: cardInfo.suit, value: cardInfo.rank * -1 });
  }

  notif_discardFromHand(notif: Notif<NotifDiscardFromHandArgs>) {
    debug('notif_discardFromHand', notif);
    this.game.clearPossible();
    const node = dojo.byId(notif.args.cardId);
    console.log('discarded card', node);
    if (node) {
      node.classList.remove(PP_CARD_IN_HAND);
    }
    const playerId = Number(notif.args.playerId);
    const player = this.getPlayer({ playerId });
    player.discardHandCard({ cardId: notif.args.cardId });
    player.incCounter({ counter: 'cards', value: -1 });
  }

  notif_discardFromMarket(notif: Notif<NotifDiscardFromMarketArgs>) {
    debug('notif_discardFromMarket', notif);

    this.game.clearPossible();
    const { from, cardId, to } = notif.args;
    const splitFrom = from.split('_');
    const row = Number(splitFrom[1]);
    const column = Number(splitFrom[2]);
    if (to === 'discard') {
      this.game.market.discardCard({ cardId, row, column });
    } else if (to === 'active_events') {
      this.game.move({
        id: cardId,
        from: this.game.market.getMarketCardZone({ row, column }),
        to: this.game.activeEvents,
      });
    }
  }

  notif_discardPrizes(notif: Notif<NotifDiscardPrizesArgs>) {
    debug('notif_discardPrizes', notif);
    this.game.clearPossible();
    const playerId = Number(notif.args.playerId);
    const player = this.getPlayer({ playerId });
    notif.args.prizes.forEach((prize) => {
      player.discardPrize({ cardId: prize.id });
      player.incCounter({ counter: 'influence', value: -1 });
    });
  }

  notif_dominanceCheckScores(notif: Notif<NotifDominanceCheckScoresArgs>) {
    console.log('notif_dominanceCheck', notif);
    const { scores } = notif.args;
    Object.keys(scores).forEach((playerId) => {
      console.log('typeof', typeof playerId);
      this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].newScore);
      this.game.move({
        id: `vp_cylinder_${playerId}`,
        from: this.game.objectManager.vpTrack.getZone(`${scores[playerId].currentScore}`),
        to: this.game.objectManager.vpTrack.getZone(`${scores[playerId].newScore}`),
      });
    });


  }

  notif_dominanceCheckReturnCoalitionBlocks(notif: Notif<NotifDominanceCheckReturnBlocksArgs>) {
    const { moves } = notif.args;
    console.log('moves',moves);
    (moves || []).forEach((move) => {
      const { tokenId, from, to, weight } = move;
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
        weight
      });
    });
  }

  notif_exchangeHand(notif: Notif<NotifExchangeHandArgs>) {
    debug('notif_exchangeHand', notif.args);
    Object.entries(notif.args.newHandCounts).forEach(([key,value]) => {
      console.log(typeof key);
      const playerId = Number(key);
      // Updates for current player have been sent in separate notification.
      if (playerId === this.game.getPlayerId()) {
        return;
      }
      const player = this.getPlayer({playerId: Number(key)});
      player.toValueCounter({counter: 'cards', value})
    });
  }

  notif_moveCard(notif: Notif<NotifMoveCardArgs>) {
    debug('notif_moveCard', notif.args);
    const { moves, action } = notif.args;
    moves.forEach((move) => {
      const { tokenId: cardId, from, to } = move;
      const fromZone = this.game.getZoneForLocation({ location: from });
      // const toZone = this.game.getZoneForLocation({ location: to });
      switch (action) {
        case 'MOVE_EVENT':
          this.game.playerManager.getPlayer({ playerId: Number(to.split('_')[1]) }).addEvent({ cardId, from: fromZone });
          this.game.playerManager.getPlayer({ playerId: Number(from.split('_')[1]) }).checkEventContainerHeight();
          break;
        default:
          debug('unknown action for moveCard');
      }
    });
  }

  notif_moveToken(notif: Notif<NotifMoveTokenArgs>) {
    debug('notif_moveToken', notif);
    notif.args.moves.forEach((move) => {
      const { tokenId, from, to, weight } = move;
      const fromZone = this.game.getZoneForLocation({ location: from });
      const toZone = this.game.getZoneForLocation({ location: to });

      // Player is active player and moves have already been executed in client state.
      // Still send notification so it is handled during replays
      if (
        this.game.framework().isCurrentPlayerActive() &&
        !fromZone.getAllItems().includes(tokenId) &&
        ((from.startsWith('armies') && to.startsWith('armies')) ||
          (from.startsWith('spies') && to.startsWith('spies')) ||
          (from.startsWith('tribes') && to.startsWith('tribes')))
      ) {
        debug('no need to execute move');
        return;
      }

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
      } else if (from.startsWith('armies') && !to.startsWith('armies')) {
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

  notif_publicWithdrawal(notif: Notif<NotifPublicWithdrawalArgs>) {
    debug('notif_publicWithdrawal', notif);
    const { marketLocation } = notif.args;
    const row = Number(marketLocation.split('_')[1]);
    const column = Number(marketLocation.split('_')[2]);
    this.game.market.getMarketRupeesZone({ row, column }).removeAll();
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
    if (newLocation.startsWith('events_')) {
      // this.game.move({
      //   id: cardId,
      //   from: this.game.market.getMarketCardZone({ row, column: col }),
      //   to: this.game.activeEvents,
      // });
      this.getPlayer({ playerId }).addEvent({ cardId, from: this.game.market.getMarketCardZone({ row, column: col }) });
    } else if (newLocation == 'discard') {
      this.game.market.getMarketCardZone({ row, column: col }).removeFromZone(cardId, false);
      discardCardAnimation({ cardId, game: this.game });
    } else {
      this.getPlayer({ playerId }).addCardToHand({ cardId, from: this.game.market.getMarketCardZone({ row, column: col }) });
    }
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

  notif_replaceHand(notif: Notif<NotifReplaceHandArgs>) {
    debug('notif_replaceHand', notif.args);
    const {hand} = notif.args;
    const player = this.game.getCurrentPlayer();
    const handZone = player.getHandZone();
    handZone.removeAll();
    hand.forEach((card: Token) => {
      player.addCardToHand({cardId: card.id});
    });
    player.toValueCounter({counter: 'cards', value: hand.length});
  }

  notif_returnRupeesToSupply(notif: Notif<NotifReturnRupeesToSupplyArgs>) {
    debug('notif_returnRupeesToSupply', notif.args);
    const { playerId, amount } = notif.args;
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -amount });
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

  notif_takeRupeesFromSupply(notif: Notif<NotifTakeRupeesFromSupplyArgs>) {
    debug('notif_takeRupeesFromSupply', notif.args);
    const { playerId, amount } = notif.args;
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: amount });
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

  notif_updateCourtCardStates(notif: Notif<NotifUpdateCourtCardStatesArgs>) {
    debug('notif_updateCourtCardStates', notif.args);
    const { playerId, cardStates } = notif.args;
    const player = this.getPlayer({ playerId });
    cardStates.forEach(({ cardId, state }, index) => {
      const item = player.getCourtZone().items.find((item) => item.id === cardId);
      if (item) {
        item.weight = state;
      }
    });
    this.getPlayer({ playerId }).getCourtZone().updateDisplay();
  }

  notif_updateInfluence({ args }: Notif<NotifUpdateInterfaceArgs>) {
    debug('notif_updateInfluence', args);
    args.updates.forEach(({ playerId, value }) => {
      this.getPlayer({ playerId: Number(playerId) }).toValueCounter({ counter: 'influence', value });
    });
  }

  notif_log(notif) {
    // this is for debugging php side
    console.log('notif_log', notif.args);
  }
}
