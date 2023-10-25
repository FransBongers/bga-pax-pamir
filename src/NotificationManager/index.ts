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

  // ..######..########.########.##.....##.########.
  // .##....##.##..........##....##.....##.##.....##
  // .##.......##..........##....##.....##.##.....##
  // ..######..######......##....##.....##.########.
  // .......##.##..........##....##.....##.##.......
  // .##....##.##..........##....##.....##.##.......
  // ..######..########....##.....#######..##.......

  setupNotifications() {
    console.log('notifications subscriptions setup');
    const notifs: [id: string, wait: number][] = [
      // checked
      ['log', undefined],
      ['changeLoyalty', undefined],
      ['changeFavoredSuit', undefined],
      ['changeRuler', undefined],
      ['clearTurn', 1],
      ['declinePrize', undefined],
      ['discard', undefined],
      ['discardFromMarket', undefined],
      ['discardPrizes', undefined],
      ['dominanceCheckScores', undefined],
      ['dominanceCheckReturnCoalitionBlocks', undefined],
      ['drawMarketCard', undefined],
      ['exchangeHand', 1],
      ['moveCard', undefined],
      ['moveToken', undefined],
      ['payBribe', undefined],
      ['payRupeesToMarket', undefined],
      ['placeArmy', undefined],
      ['placeCylinder', undefined],
      ['placeRoad', undefined],
      ['playCard', undefined],
      ['publicWithdrawal', undefined],
      ['purchaseCard', undefined],
      ['replaceHand', 1],
      ['returnAllSpies', undefined], // TODO: check if returnSpies can be added to returnToSupply?
      ['returnAllToSupply', undefined],
      ['returnCoalitionBlock', undefined],
      ['returnCylinder', undefined],
      ['returnRupeesToSupply', 1],
      ['shiftMarket', undefined],
      ['smallRefreshHand', 1],
      ['smallRefreshInterface', 1],
      ['takePrize', undefined],
      ['takeRupeesFromSupply', 1],
      ['taxMarket', undefined],
      ['taxPlayer', undefined],
      ['updateInfluence', 1],
      ['wakhanDrawCard', undefined],
      ['wakhanRadicalize', undefined],
      ['wakhanReshuffleDeck', undefined],
      ['wakhanUpdatePragmaticLoyalty', 1],
    ];

    // example: https://github.com/thoun/knarr/blob/main/src/knarr.ts
    notifs.forEach((notif) => {
      this.subscriptions.push(
        dojo.subscribe(notif[0], this, (notifDetails: Notif<unknown>) => {
          debug(`notif_${notif[0]}`, notifDetails); // log notif params (with Tisaac log method, so only studio side)

          const promise = this[`notif_${notif[0]}`](notifDetails);

          // tell the UI notification ends
          promise?.then(() => this.game.framework().notifqueue.onSynchronousNotificationEnd());
        })
      );
      // make all notif as synchronous
      this.game.framework().notifqueue.setSynchronous(notif[0], notif[1]);
    });

    // Use below to add tooltips to the log
    // dojo.connect(this.game.framework().notifqueue, 'addToLog', () => {
    //   // do stuff here
    // });
  }

  // Example code to show log messags in page title
  // I wont directly answer your issue, but propose something that will fix it and improve your game
  // put that inside any notification handler :
  // let msg = this.format_string_recursive(args.log, args.args);
  // if (msg != '') {
  //   $('gameaction_status').innerHTML = msg;
  //   $('pagemaintitletext').innerHTML = msg;
  // }

  // .##....##..#######..########.####.########..######.
  // .###...##.##.....##....##.....##..##.......##....##
  // .####..##.##.....##....##.....##..##.......##......
  // .##.##.##.##.....##....##.....##..######....######.
  // .##..####.##.....##....##.....##..##.............##
  // .##...###.##.....##....##.....##..##.......##....##
  // .##....##..#######.....##....####.##........######.

  async notif_log(notif: Notif<unknown>) {
    // this is for debugging php side
    debug('notif_log', notif.args);
    return Promise.resolve();
  }

  async notif_payRupeesToMarket(notif: Notif<NotifPayRupeesToMarketArgs>) {
    const { playerId, rupeesOnCards } = notif.args;

    await Promise.all(
      (rupeesOnCards || []).map(async (item) => {
        const { row, column, rupeeId, cardId } = item;
        this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -1 });
        this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}`, cardId });
      })
    );
  }

  async notif_changeLoyalty(notif: Notif<NotifChangeLoyaltyArgs>) {
    const { playerId: argsPlayerId, coalition } = notif.args;
    const playerId = Number(argsPlayerId);

    const player = this.getPlayer({ playerId });
    player.updatePlayerLoyalty({ coalition });
    console.log('playerInfluence', player.getInfluence());
    // Influence value will be 0 when player chooses loyalty for the first time
    if (player.getInfluence() === 0) {
      player.setCounter({ counter: 'influence', value: 1 });
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async notif_changeFavoredSuit(notif: Notif<NotifChangeFavoredSuitArgs>) {
    const { to } = notif.args;
    this.game.objectManager.favoredSuit.changeTo({ suit: to });
  }

  async notif_changeRuler(notif: Notif<NotifChangeRulerArgs>) {
    const { oldRuler, newRuler, region } = notif.args;
    const from =
      oldRuler === null
        ? this.game.map.getRegion({ region }).getRulerZone()
        : this.game.playerManager.getPlayer({ playerId: oldRuler }).getRulerTokensZone();
    const to =
      newRuler === null
        ? this.game.map.getRegion({ region }).getRulerZone()
        : this.game.playerManager.getPlayer({ playerId: newRuler }).getRulerTokensZone();
    this.game.map.getRegion({ region }).setRuler({ playerId: newRuler });
    await Promise.all([
      to.moveToZone({ elements: { id: `pp_ruler_token_${region}` } }),
      from.remove({ input: `pp_ruler_token_${region}` }),
    ]);
  }

  notif_clearTurn(notif) {
    const { args } = notif;
    const notifIds = args.notifIds;
    this.game.cancelLogs(notifIds);
  }

  async notif_declinePrize(notif: Notif<NotifDeclinePrizeArgs>) {
    this.game.clearPossible();
    const { cardId } = notif.args;
    await this.game.objectManager.discardPile.discardCardFromZone({ cardId, zone: this.game.objectManager.tempDiscardPile.getZone() });
  }

  async notif_discard(notif: Notif<NotifDiscardArgs>): Promise<void> {
    this.game.clearPossible();
    const { cardId, from, playerId, to } = notif.args;
    const player = this.getPlayer({ playerId });

    if (from === COURT) {
      await player.discardCourtCard({ cardId, to });
    } else if (from === HAND) {
      await player.discardHandCard({ cardId, to });
    } else if (from === ACTIVE_EVENTS) {
      await this.game.activeEvents.discardCard({ cardId });
    } else if (from.startsWith('events_')) {
      await player.discardEventCard({ cardId });
    }
    return await Promise.resolve(); // check if necessary
  }

  async notif_discardFromMarket(notif: Notif<NotifDiscardFromMarketArgs>): Promise<unknown> {
    this.game.clearPossible();
    const { from, cardId, to } = notif.args;
    const splitFrom = from.split('_');
    const row = Number(splitFrom[1]);
    const column = Number(splitFrom[2]);

    if (to === DISCARD || to === TEMP_DISCARD) {
      return await this.game.market.discardCard({ cardId, row, column, to });
    } else if (to === ACTIVE_EVENTS) {
      await this.game.activeEvents.addCardFromMarket({ cardId, row, column });
    }
  }

  async notif_discardPrizes(notif: Notif<NotifDiscardPrizesArgs>) {
    this.game.clearPossible();
    const { playerId, prizes } = notif.args;

    const player = this.getPlayer({ playerId });
    for (let prize of prizes) {
      // notif.args.prizes.forEach((prize) => {
      await player.discardPrize({ cardId: prize.id });
      player.incCounter({ counter: 'influence', value: -1 });
      // });
    }
  }

  notif_exchangeHand(notif: Notif<NotifExchangeHandArgs>) {
    const { newHandCounts, newHandCards } = notif.args;
    Object.entries(newHandCounts).forEach(([key, value]) => {
      const playerId = Number(key);
      // Updates for current player have been sent in separate notification.
      // Wakhan does not have a hand count to update and will play all card to court
      if (playerId === this.game.getPlayerId() || playerId === WAKHAN_PLAYER_ID) {
        return;
      }
      const player = this.getPlayer({ playerId: Number(key) });
      player.toValueCounter({ counter: 'cards', value });
    });
    if (newHandCards === null) {
      return;
    }

    // When playing with open hands we also need to update the hand cards for the modal.
    Object.entries(newHandCards).forEach(([key, value]) => {
      const playerId = Number(key);
      if (playerId === WAKHAN_PLAYER_ID) {
        return;
      }
      const player = this.getPlayer({ playerId });
      player.resetHandCards();
      value.forEach((card) => player.updateHandCards({ cardId: card.id, action: 'ADD' }));
    });
  }

  async notif_dominanceCheckScores(notif: Notif<NotifDominanceCheckScoresArgs>) {
    const { scores } = notif.args;
    for (let playerId of Object.keys(scores)) {
      if (Number(playerId) === WAKHAN_PLAYER_ID) {
        (this.game.playerManager.getPlayer({ playerId: Number(playerId) }) as PPWakhanPlayer).wakhanScore.toValue(
          scores[playerId].newScore
        );
      } else {
        this.game.framework().scoreCtrl[playerId].toValue(scores[playerId].newScore);
      }
      await Promise.all([
        this.game.objectManager.vpTrack.getZone(`${scores[playerId].newScore}`).moveToZone({ elements: { id: `vp_cylinder_${playerId}` } }),
        this.game.objectManager.vpTrack.getZone(`${scores[playerId].currentScore}`).remove({ input: `vp_cylinder_${playerId}` }),
      ]);
    }
  }

  async notif_dominanceCheckReturnCoalitionBlocks(notif: Notif<NotifDominanceCheckReturnBlocksArgs>) {
    const { blocks, fromLocations } = notif.args;
    await Promise.all(
      COALITIONS.map((coalition: string) =>
        this.game.objectManager.supply
          .getCoalitionBlocksZone({ coalition })
          .moveToZone({ elements: blocks[coalition], classesToAdd: [PP_COALITION_BLOCK], classesToRemove: [PP_ARMY, PP_ROAD] })
      )
    );
    await Promise.all(
      fromLocations.map(async (location: string) => {
        const splitLocation = location.split('_');
        if (location.startsWith('armies_')) {
          await this.game.map.getRegion({ region: splitLocation[1] }).getArmyZone().removeAll();
        } else {
          await this.game.map
            .getBorder({ border: `${splitLocation[1]}_${splitLocation[2]}` })
            .getRoadZone()
            .removeAll();
        }
      })
    );
    this.game.objectManager.supply.checkDominantCoalition();
  }

  async notif_drawMarketCard(notif: Notif<NotifDrawMarketCardArgs>) {
    const { cardId, to } = notif.args;
    const row = Number(to.split('_')[1]);
    const column = Number(to.split('_')[2]);

    this.game.objectManager.incCardCounter({ cardId, location: 'deck' });
    await this.game.market.addCardFromDeck({
      to: {
        row,
        column,
      },
      cardId,
    });
  }

  async notif_moveCard(notif: Notif<NotifMoveCardArgs>) {
    const { move, action } = notif.args;
    if (move === null) {
      return;
    }
    const { id: cardId, from, to } = move;
    const fromZone = this.game.getZoneForLocation({ location: from });

    switch (action) {
      case 'MOVE_EVENT':
        await Promise.all([
          this.game.playerManager.getPlayer({ playerId: Number(to.split('_')[1]) }).addCardToEvents({ cardId, from: fromZone }),
          this.game.playerManager.getPlayer({ playerId: Number(from.split('_')[1]) }).checkEventContainerHeight(),
        ]);
        break;
      default:
        debug('unknown action for moveCard');
    }
  }

  async notif_moveToken(notif: Notif<NotifMoveTokenArgs>) {
    const { move } = notif.args;
    return await this.performTokenMove({ move });
  }

  async notif_payBribe(notif: Notif<NotifPayBribeArgs>) {
    const { briberId, rulerId, rupees } = notif.args;
    await this.getPlayer({ playerId: briberId }).payToPlayer({ playerId: rulerId, rupees });
  }

  async notif_playCard(notif: Notif<NotifPlayCardArgs>): Promise<void> {
    this.game.clearPossible();

    const { playerId, card } = notif.args;
    const player = this.getPlayer({ playerId });
    return await player.playCard({
      card,
    });
  }

  async notif_placeArmy(notif: Notif<NotifPlaceArmyArgs>) {
    // TODO: check moving multipe armies at the same time if necessary
    await this.performTokenMove({ move: notif.args.move });
    this.game.objectManager.supply.checkDominantCoalition();
  }

  async notif_placeCylinder(notif: Notif<NotifPlaceCylinderArgs>) {
    const move = notif.args.move;
    await this.performTokenMove({ move });
    const playerId = Number(move.tokenId.split('_')[1]);
    // cylinders is placed from supply somewhere else, increase count
    if (move.from.startsWith('cylinders_') && !move.to.startsWith('cylinders_')) {
      this.getPlayer({ playerId }).incCounter({ counter: 'cylinders', value: 1 });
    }
    if (move.to.startsWith('gift_') && !move.from.startsWith('gift_') && !this.game.activeEvents.hasCard({ cardId: 'card_106' })) {
      if (playerId === WAKHAN_PLAYER_ID) {
        (this.getPlayer({ playerId }) as PPWakhanPlayer).incWakhanInfluence({
          wakhanInfluence: {
            type: 'wakhanInfluence',
            influence: {
              afghan: 1,
              british: 1,
              russian: 1,
            },
          },
        });
      } else {
        this.getPlayer({ playerId }).incCounter({ counter: 'influence', value: 1 });
      }
    }
  }

  async notif_placeRoad(notif: Notif<NotifPlaceRoadArgs>) {
    // TODO: check moving multipe armies at the same time if necessary
    await this.performTokenMove({ move: notif.args.move });
    this.game.objectManager.supply.checkDominantCoalition();
  }

  async notif_publicWithdrawal(notif: Notif<NotifPublicWithdrawalArgs>) {
    const { marketLocation } = notif.args;
    const row = Number(marketLocation.split('_')[1]);
    const column = Number(marketLocation.split('_')[2]);
    await this.game.market.getMarketRupeesZone({ row, column }).removeAll({ destroy: true });
  }

  async notif_purchaseCard(notif: Notif<NotifPurchaseCardArgs>): Promise<void> {
    const { marketLocation, newLocation, rupeesOnCards, playerId, receivedRupees } = notif.args;

    this.game.clearPossible();
    const row = Number(marketLocation.split('_')[1]);
    const col = Number(marketLocation.split('_')[2]);

    // Place paid rupees on market cards
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -rupeesOnCards.length });
    await Promise.all(
      rupeesOnCards.map(({ row, column, rupeeId, cardId }) =>
        this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}`, cardId })
      )
    );

    // Remove all rupees that were on the purchased card
    await this.game.market.removeRupeesFromCard({ row, column: col, to: `rupees_${playerId}` });
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: receivedRupees });

    // Move card from markt
    const cardId = notif.args.card.id;
    if (newLocation.startsWith('events_')) {
      await this.getPlayer({ playerId }).addCardToEvents({ cardId, from: this.game.market.getMarketCardZone({ row, column: col }) });
      if (cardId === 'card_109') {
        this.game.objectManager.supply.checkDominantCoalition();
      }
    } else if (newLocation === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromZone({
        cardId,
        zone: this.game.market.getMarketCardZone({ row, column: col }),
      });
    } else if (newLocation === TEMP_DISCARD) {
      await Promise.all([
        this.game.objectManager.tempDiscardPile.getZone().moveToZone({
          elements: { id: cardId },
          classesToRemove: [PP_MARKET_CARD],
        }),
        this.game.market.getMarketCardZone({ row, column: col }).remove({ input: cardId }),
      ]);
    } else {
      await this.getPlayer({ playerId }).addCardToHand({ cardId, from: this.game.market.getMarketCardZone({ row, column: col }) });
    }
  }

  notif_replaceHand(notif: Notif<NotifReplaceHandArgs>) {
    const { hand } = notif.args;
    const player = this.game.getCurrentPlayer();
    player.clearHand();
    player.setupHand({ hand });
    player.toValueCounter({ counter: 'cards', value: hand.length });
  }

  async notif_returnAllSpies(notif: Notif<NotifReturnAllSpiesArgs>) {
    this.game.clearPossible();
    const { spies, cardId } = notif.args;

    await Promise.all([
      ...Object.entries(spies).map(async ([key, value]) => {
        const player = this.getPlayer({ playerId: Number(key) });
        await player.getCylinderZone().moveToZone({
          elements: value.map(({ tokenId, weight }) => ({ id: tokenId, weight })),
        });
        player.incCounter({ counter: 'cylinders', value: -value.length });
      }),
      this.game.spies?.[cardId].removeAll(),
    ]);
  }

  async notif_returnAllToSupply(notif: Notif<NotifReturnAllToSupplyArgs>): Promise<void> {
    this.game.clearPossible();
    const { armies, tribes, regionId } = notif.args;
    const region = this.game.map.getRegion({ region: regionId });

    await Promise.all([region.removeAllArmies(armies), region.removeAllTribes(tribes)]);
    this.game.objectManager.supply.checkDominantCoalition();
  }

  async notif_returnCoalitionBlock(notif: Notif<NotifReturnCoalitionBlockArgs>): Promise<void> {
    this.game.clearPossible();
    const { from, blockId, weight, coalition, type } = notif.args;
    const toZone = this.game.objectManager.supply.getCoalitionBlocksZone({ coalition });
    const splitFrom = from.split('_');
    const fromZone = from.startsWith('roads_')
      ? this.game.map.getBorder({ border: `${splitFrom[1]}_${splitFrom[2]}` }).getRoadZone()
      : this.game.map.getRegion({ region: splitFrom[1] }).getArmyZone();
    await Promise.all([
      toZone.moveToZone({
        elements: {
          id: blockId,
          weight,
        },
        classesToRemove: [PP_ARMY, PP_ROAD],
        classesToAdd: [PP_COALITION_BLOCK],
      }),
      fromZone.remove({ input: blockId }),
    ]);
    this.game.objectManager.supply.checkDominantCoalition();
  }

  async notif_returnCylinder(notif: Notif<NotifReturnCylinderArgs>): Promise<void> {
    const getCylinderFromZone = (from: string): PaxPamirZone => {
      if (from.startsWith('card_')) {
        return this.game.spies[from];
      } else if (from.startsWith('gift_')) {
        const splitFrom = from.split('_');
        return this.getPlayer({ playerId: Number(splitFrom[2]) }).getGiftZone({ value: Number(splitFrom[1]) });
      } else {
        return this.game.map.getRegion({ region: from }).getTribeZone();
      }
    };

    this.game.clearPossible();
    const { from, cylinderId, weight } = notif.args;
    const playerId = Number(cylinderId.split('_')[1]);
    const player = this.getPlayer({ playerId });
    const fromZone = getCylinderFromZone(from);
    await Promise.all([
      player.getCylinderZone().moveToZone({
        elements: {
          id: cylinderId,
          weight,
        },
      }),
      fromZone.remove({ input: cylinderId }),
    ]);
    player.incCounter({ counter: 'cylinders', value: -1 });

    if (from.startsWith('gift_')) {
      // card_106 is Embarrassment of Riches so cylinder influence counts as 0 and we should not reduce
      const value = this.game.activeEvents.hasCard({ cardId: 'card_106' }) ? 0 : -1;
      player.incCounter({ counter: 'influence', value });
    }
  }

  notif_returnRupeesToSupply(notif: Notif<NotifReturnRupeesToSupplyArgs>) {
    const { playerId, amount } = notif.args;
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -amount });
  }

  async notif_shiftMarket(notif: Notif<NotifShiftMarketArgs>): Promise<void> {
    this.game.clearPossible();
    const { move } = notif.args;

    const fromRow = Number(move.from.split('_')[1]);
    const fromCol = Number(move.from.split('_')[2]);
    const toRow = Number(move.to.split('_')[1]);
    const toCol = Number(move.to.split('_')[2]);

    await this.game.market.moveCard({
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
  }

  notif_smallRefreshHand(notif: Notif<NotifSmallRefreshHandArgs>) {
    const { hand, playerId } = notif.args;
    const player = this.getPlayer({ playerId });
    player.clearHand();
    player.setupHand({ hand });
  }

  notif_smallRefreshInterface(notif: Notif<NotifSmallRefreshInterfaceArgs>) {
    const updatedGamedatas = {
      ...this.game.gamedatas,
      ...notif.args,
    };
    this.game.clearInterface();
    this.game.gamedatas = updatedGamedatas;
    this.game.activeEvents.setupActiveEvents({ gamedatas: updatedGamedatas });
    this.game.market.setupMarket({ gamedatas: updatedGamedatas });
    this.game.playerManager.updatePlayers({ gamedatas: updatedGamedatas });
    this.game.map.updateMap({ gamedatas: updatedGamedatas });
    this.game.objectManager.updateInterface({ gamedatas: updatedGamedatas });
  }

  async notif_takePrize(notif: Notif<NotifTakePrizeArgs>) {
    this.game.clearPossible();
    const { cardId, playerId } = notif.args;
    return await this.game.playerManager.getPlayer({ playerId }).takePrize({ cardId });
  }

  notif_takeRupeesFromSupply(notif: Notif<NotifTakeRupeesFromSupplyArgs>) {
    const { playerId, amount } = notif.args;
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: amount });
  }

  async notif_taxPlayer(notif: Notif<NotifTaxPlayerArgs>) {
    const { playerId, taxedPlayerId, amount } = notif.args;
    const player = this.getPlayer({ playerId: taxedPlayerId });
    player.removeTaxCounter();
    await player.payToPlayer({ playerId, rupees: amount });
  }

  async notif_taxMarket(notif: Notif<NotifTaxMarketArgs>): Promise<void> {
    const { selectedRupees, playerId, amount } = notif.args;
    await Promise.all(
      selectedRupees.map(async (rupee) => {
        const { row, column, rupeeId } = rupee;
        await this.game.market.removeSingleRupeeFromCard({ row, column, rupeeId, to: `rupees_${playerId}` });
      })
    );
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: amount });
  }

  notif_updateInfluence({ args }: Notif<NotifUpdateInfluenceArgs>) {
    args.updates.forEach((update) => {
      if (update.type === 'playerInfluence') {
        const { playerId, value } = update;
        this.getPlayer({ playerId: Number(playerId) }).toValueCounter({ counter: 'influence', value });
      } else if (update.type === 'wakhanInfluence') {
        (this.getPlayer({ playerId: WAKHAN_PLAYER_ID }) as PPWakhanPlayer).toValueWakhanInfluence({ wakhanInfluence: update });
      }
    });
  }

  async notif_wakhanDrawCard({ args }: Notif<NotifWakhanDrawCardArgs>) {
    const { deck, discardPile } = args;
    this.game.framework().removeTooltip('pp_wakhan_deck');
    this.game.framework().removeTooltip('pp_wakhan_discard');
    const deckNode = dojo.byId('pp_wakhan_deck');
    const discardNode = dojo.byId('pp_wakhan_discard');

    // Place element on discard

    const element = !discardPile.from
      ? discardNode
      : dojo.place(`<div id="temp_wakhan_card" class="pp_wakhan_card pp_${discardPile.to}_front"></div>`, `pp_wakhan_discard`);
    // Execute move animation from deck
    const fromRect = $(`pp_wakhan_deck`)?.getBoundingClientRect();

    deckNode.classList.remove(`pp_${deck.from}_back`);
    if (deck.to !== null) {
      deckNode.classList.add(`pp_${deck.to}_back`);
    } else {
      deckNode.style.opacity = '0';
    }

    if (!discardPile.from) {
      discardNode.classList.add(`pp_${discardPile.to}_front`);
      discardNode.style.opacity = '1';
    }

    await this.game.animationManager.play(
      new BgaSlideAnimation<BgaAnimationWithOriginSettings>({
        element,
        transitionTimingFunction: 'linear',
        fromRect,
      })
    );

    // discardNode.classList.add(`pp_${discardPile.to}_front`);
    // if (discardPile.from) {

    if (discardPile.from) {
      discardNode.classList.replace(`pp_${discardPile.from}_front`, `pp_${discardPile.to}_front`);
      element.remove();
    }
    if (deck.to && discardPile.to) {
      this.game.tooltipManager.addWakhanCardTooltip({ wakhanDeckCardId: deck.to, wakhanDiscardCardId: discardPile.to });
    }
  }

  async notif_wakhanRadicalize({ args }: Notif<NotifWakhanRadicalizeArgs>) {
    const { marketLocation, newLocation, rupeesOnCards, receivedRupees, card } = args;
    const playerId = WAKHAN_PLAYER_ID;

    this.game.clearPossible();
    const row = Number(marketLocation.split('_')[1]);
    const col = Number(marketLocation.split('_')[2]);

    // Place paid rupees on market cards
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -rupeesOnCards.length });
    await Promise.all(
      rupeesOnCards.map(({ row, column, rupeeId, cardId }) =>
        this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}`, cardId })
      )
    );

    // Remove all rupees that were on the purchased card
    await this.game.market.removeRupeesFromCard({ row, column: col, to: `rupees_${playerId}` });
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: receivedRupees });

    // Move card from markt
    const cardId = card.id;
    if (newLocation.startsWith('events_')) {
      await this.getPlayer({ playerId }).addCardToEvents({ cardId, from: this.game.market.getMarketCardZone({ row, column: col }) });
      if (cardId === 'card_109') {
        this.game.objectManager.supply.checkDominantCoalition();
      }
    } else if (newLocation === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromZone({
        cardId,
        zone: this.game.market.getMarketCardZone({ row, column: col }),
      });
    } else if (newLocation === TEMP_DISCARD) {
      // await Promise.all([
      //   this.game.objectManager.tempDiscardPile.getZone().moveToZone({
      //     elements: { id: cardId },
      //     classesToRemove: [PP_MARKET_CARD],
      //   }),
      //   this.game.market.getMarketCardZone({ row, column: col }).remove({ input: cardId }),
      // ]);
    } else {
      const player = this.getPlayer({ playerId });
      if (player instanceof PPWakhanPlayer) {
        await player.radicalizeCardWakhan({
          card,
          from: this.game.market.getMarketCardZone({ row, column: col }),
        });
      }
    }
  }

  async notif_wakhanReshuffleDeck({ args }: Notif<NotifWakhanReshuffleDeckArgs>) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const { topOfDiscardPile, topOfDeck } = args;
    const deckNode = dojo.byId(`pp_wakhan_deck`);
    const discardNode = dojo.byId('pp_wakhan_discard');
    deckNode.classList.add(`pp_${topOfDeck}_back`);
    const fromRect = $(`pp_wakhan_discard`)?.getBoundingClientRect();

    discardNode.style.opacity = '0';
    deckNode.style.opacity = '1';
    await this.game.animationManager.play(
      new BgaSlideAnimation<BgaAnimationWithOriginSettings>({
        element: deckNode,
        transitionTimingFunction: 'linear',
        fromRect,
      })
    );
    discardNode.classList.remove(`pp_${topOfDiscardPile}_front`);
    // const deckNode = dojo.byId('pp_wakhan_deck');

    // element.remove();
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  notif_wakhanUpdatePragmaticLoyalty({ args }: Notif<NotifWakhanUpdatePragmaticLoyalty>) {
    const { pragmaticLoyalty } = args;
    if (pragmaticLoyalty !== null) {
      (this.getPlayer({ playerId: WAKHAN_PLAYER_ID }) as PPWakhanPlayer).updateLoyaltyIcon({ pragmaticLoyalty });
    }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  destroy() {
    dojo.forEach(this.subscriptions, dojo.unsubscribe);
  }

  async discardTempCard({ cardId }: { cardId: string }) {}

  getPlayer({ playerId }: { playerId: number }): PPPlayer {
    return this.game.playerManager.getPlayer({ playerId });
  }

  getClassChanges({ from, to }: { from: string; to: string }): { classesToAdd: string[]; classesToRemove: string[] } {
    // TODO: perhaps create separate function for this
    const classesToAdd = [];
    const classesToRemove = [];
    if (to.startsWith('armies')) {
      classesToAdd.push(PP_ARMY);
    } else if (to.startsWith('roads')) {
      classesToAdd.push(PP_ROAD);
    } else if (to.startsWith('blocks')) {
      classesToAdd.push(PP_COALITION_BLOCK);
    }
    if (from.startsWith('blocks')) {
      classesToRemove.push(PP_COALITION_BLOCK);
    } else if (from.startsWith('armies') && !to.startsWith('armies')) {
      classesToRemove.push(PP_ARMY);
    } else if (from.startsWith('roads')) {
      classesToRemove.push(PP_ROAD);
    }
    return { classesToAdd, classesToRemove };
  }

  async performTokenMove({ move }: { move: TokenMove }): Promise<void> {
    const { tokenId, from, to, weight } = move;
    // Can be the case when a player needs to select a piece
    // because pool is empty
    if (from === to) {
      return;
    }

    // TODO: replace getZoneForLocation
    const fromZone = this.game.getZoneForLocation({ location: from });
    const toZone = this.game.getZoneForLocation({ location: to });

    // Player is active player and moves have already been executed in client state.
    // Still send notification so it is handled during replays => check if this is actually the case
    // check if to already has the token
    if (
      this.game.framework().isCurrentPlayerActive() &&
      toZone.getItems().includes(tokenId) // Perhaps we just make this a generic check?
    ) {
      debug('no need to execute move');
      return;
    }

    // This could also be part of the input?
    const { classesToRemove, classesToAdd } = this.getClassChanges({ from, to });

    await Promise.all([
      toZone.moveToZone({
        elements: {
          id: tokenId,
          weight,
        },
        classesToAdd,
        classesToRemove,
        zIndex: 10,
      }),
      fromZone.remove({ input: tokenId }),
    ]);
  }
}
