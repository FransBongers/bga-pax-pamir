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

const MIN_NOTIFICATION_MS = 1000;

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
    const notifs: string[] = [
      'log',
      'battle',
      'changeLoyalty',
      'changeFavoredSuit',
      'changeRuler',
      'clearTurn',
      'declinePrize',
      'discard',
      'discardFromMarket',
      'discardPrizes',
      'dominanceCheckScores',
      'dominanceCheckReturnCoalitionBlocks',
      'drawMarketCard',
      'exchangeHand',
      'moveCard',
      'moveToken',
      'payBribe',
      'payRupeesToMarket',
      'placeArmy',
      'placeCylinder',
      'placeRoad',
      'playCard',
      'publicWithdrawal',
      'purchaseCard',
      'purchaseGift',
      'replaceHand',
      'returnAllSpies', // TODO: check if returnSpies can be added to returnToSupply?
      'returnAllToSupply',
      'returnCoalitionBlock',
      'returnCylinder',
      'returnRupeesToSupply',
      'shiftMarket',
      'smallRefreshHand',
      'smallRefreshInterface',
      'takePrize',
      'takeRupeesFromSupply',
      'taxMarket',
      'taxPlayer',
      'updateInfluence',
      'wakhanDrawCard',
      'wakhanRadicalize',
      'wakhanReshuffleDeck',
      'wakhanUpdatePragmaticLoyalty',
    ];

    notifs.forEach((notifName) => {
      this.subscriptions.push(
        dojo.subscribe(notifName, this, (notifDetails: Notif<unknown>) => {
          debug(`notif_${notifName}`, notifDetails); // log notif params (with Tisaac log method, so only studio side)

          const promise = this[`notif_${notifName}`](notifDetails);
          const promises = promise ? [promise] : [];
          let minDuration = 1;

          // Show log messags in page title
          let msg = this.game.format_string_recursive(notifDetails.log, notifDetails.args as Record<string, unknown>);
          // TODO: check if this clearPossible causes any issues?
          this.game.clearPossible();
          if (msg != '' && notifName !== 'dominanceCheckScores') {
            $('gameaction_status').innerHTML = msg;
            $('pagemaintitletext').innerHTML = msg;
            $('generalactions').innerHTML = '';

            // If there is some text, we let the message some time, to be read
            minDuration = MIN_NOTIFICATION_MS;
          }

          // tell the UI notification ends, if the function returned a promise.
          if (this.game.animationManager.animationsActive()) {
            Promise.all([...promises, this.game.framework().wait(minDuration)]).then(() =>
              this.game.framework().notifqueue.onSynchronousNotificationEnd()
            );
          } else {
            // TODO: check what this does
            this.game.framework().notifqueue.setSynchronousDuration(0);
          }
        })
      );
      this.game.framework().notifqueue.setSynchronous(notifName, undefined);
    });
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

  // Notifs added to show message in title bar
  async notif_battle(notif: Notif<unknown>) {}
  async notif_purchaseGift(notif: Notif<unknown>) {}

  async notif_log(notif: Notif<unknown>) {
    // this is for debugging php side
    debug('notif_log', notif.args);
    return Promise.resolve();
  }

  async notif_payRupeesToMarket(notif: Notif<NotifPayRupeesToMarketArgs>) {
    const { playerId, rupeesOnCards, removedRupees } = notif.args;

    await Promise.all(
      (rupeesOnCards || []).map(async (item, index) => {
        const { row, column, rupeeId, cardId } = item;
        this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -1 });
        this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}`, cardId, index });
      })
    );
    if (removedRupees > 0) {
      this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -removedRupees });
    }
  }

  async notif_changeLoyalty(notif: Notif<NotifChangeLoyaltyArgs>) {
    const { playerId: argsPlayerId, coalition } = notif.args;
    const playerId = Number(argsPlayerId);

    const player = this.getPlayer({ playerId });
    player.updatePlayerLoyalty({ coalition });

    // Influence value will be 0 when player chooses loyalty for the first time
    if (player.getInfluence() === 0) {
      player.setCounter({ counter: 'influence', value: 1 });
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  async notif_changeFavoredSuit(notif: Notif<NotifChangeFavoredSuitArgs>) {
    const { to } = notif.args;
    await this.game.objectManager.favoredSuit.changeTo({ suit: to });
  }

  async notif_changeRuler(notif: Notif<NotifChangeRulerArgs>) {
    const { newRuler, region } = notif.args;
    const to =
      newRuler === null
        ? this.game.map.getRegion({ region }).getRulerZone()
        : this.game.playerManager.getPlayer({ playerId: newRuler }).getRulerTokensZone();
    this.game.map.getRegion({ region }).setRuler({ playerId: newRuler });
    await to.addCard({
      id: `pp_ruler_token_${region}`,
      state: 0,
      used: 0,
      location: newRuler ? `rulerTokens_${newRuler}` : `rulerTokens_${region}`,
      region,
    });
  }

  async notif_clearTurn(notif) {
    const { args } = notif;
    const notifIds = args.notifIds;
    this.game.cancelLogs(notifIds);
  }

  async notif_declinePrize(notif: Notif<NotifDeclinePrizeArgs>) {
    this.game.clearPossible();
    const { cardId } = notif.args;
    await this.game.objectManager.discardPile.discardCardFromZone(cardId);
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

  async notif_discardFromMarket(notif: Notif<NotifDiscardFromMarketArgs>): Promise<void> {
    this.game.clearPossible();
    const { from, cardId, to } = notif.args;
    const splitFrom = from.split('_');
    const row = Number(splitFrom[1]);
    const column = Number(splitFrom[2]);

    if (to === DISCARD || to === TEMP_DISCARD) {
      await this.game.market.discardCard({ cardId, row, column, to });
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

  async notif_exchangeHand(notif: Notif<NotifExchangeHandArgs>) {
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
      await this.game.objectManager.vpTrack.getZone(`${scores[playerId].newScore}`).addCard({
        id: `vp_cylinder_${playerId}`,
        color: this.game.gamedatas.paxPamirPlayers[playerId].color,
        state: 0,
        used: 0,
        location: `vp_track_${scores[playerId].newScore}`,
      });
      // await Promise.all([
      //   this.game.objectManager.vpTrack.getZone(`${scores[playerId].newScore}`).moveToZone({ elements: { id: `vp_cylinder_${playerId}` } }),
      //   this.game.objectManager.vpTrack.getZone(`${scores[playerId].currentScore}`).remove({ input: `vp_cylinder_${playerId}` }),
      // ]);
    }
  }

  async notif_dominanceCheckReturnCoalitionBlocks(notif: Notif<NotifDominanceCheckReturnBlocksArgs>) {
    const { blocks, fromLocations } = notif.args;

    await Promise.all(
      COALITIONS.map((coalition: string) =>
        this.game.objectManager.supply.getCoalitionBlocksZone({ coalition }).addCards(
          blocks[coalition].map(({ id, weight }: TokenZoneInfo) => ({
            id,
            state: weight,
            used: 0,
            location: `supply_${coalition}`,
            coalition,
            type: 'supply',
          }))
        )
      )
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
      card: this.game.getCardInfo(cardId),
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
          this.game.playerManager.getPlayer({ playerId: Number(to.split('_')[1]) }).addCardToEvents({ cardId }),
          this.game.playerManager.getPlayer({ playerId: Number(from.split('_')[1]) }).checkEventContainerHeight(),
        ]);
        break;
      default:
        debug('unknown action for moveCard');
    }
  }

  async notif_moveToken(notif: Notif<NotifMoveTokenArgs>) {
    const { move } = notif.args;
    await this.performTokenMove({ move });
  }

  async notif_payBribe(notif: Notif<NotifPayBribeArgs>) {
    const { briberId, rulerId, rupees } = notif.args;
    await this.getPlayer({ playerId: briberId }).payToPlayer({ playerId: rulerId, rupees });
  }

  async notif_playCard(notif: Notif<NotifPlayCardArgs>): Promise<void> {
    this.game.clearPossible();

    const { playerId, card } = notif.args;
    const player = this.getPlayer({ playerId });
    await player.playCard(card);
  }

  async notif_placeArmy(notif: Notif<NotifPlaceArmyArgs>) {
    const { tokenId, to, weight } = notif.args.move;
    const region = to.split('_')[1];
    const coalition = getCoalitionForBlock(tokenId);

    await this.game.map
      .getRegion({ region })
      .getArmyZone()
      .addCard({
        id: tokenId,
        state: weight,
        used: 0,
        coalition,
        type: 'army',
        location: `armies_${region}`,
      });
    this.game.objectManager.supply.checkDominantCoalition();
  }

  getCylinderZone(location: string): CardStock<Cylinder> {
    const splitLocation = location.split('_');
    switch (splitLocation[0]) {
      case 'cylinders':
        // cylinders_playerId
        return this.game.playerManager.getPlayer({ playerId: Number(splitLocation[1]) }).getCylinderZone();
      case 'gift':
        // gift_2_playerId
        return this.game.playerManager.getPlayer({ playerId: Number(splitLocation[2]) }).getGiftZone({ value: Number(splitLocation[1]) });
      case 'spies':
        // spies_card_38
        const cardId = `${splitLocation[1]}_${splitLocation[2]}`;
        return this.game.spies[cardId];
      case 'tribes':
        // tribes_kabul
        return this.game.map.getRegion({ region: splitLocation[1] }).getTribeZone();
      default:
        debug('cannot find zone for cylinder');
        break;
    }
  }

  async notif_placeCylinder(notif: Notif<NotifPlaceCylinderArgs>) {
    const move = notif.args.move;
    const { to, from, tokenId, weight } = move;
    const toZone = this.getCylinderZone(to);
    if (from !== to) {
      await toZone.addCard(
        this.game.getCylinder({
          id: tokenId,
          state: weight,
          used: 0,
          location: to,
        })
      );
    }
    const playerId = Number(move.tokenId.split('_')[1]);
    const player = this.getPlayer({ playerId });
    // cylinders is placed from supply somewhere else, increase count
    if (move.from.startsWith('cylinders_') && !move.to.startsWith('cylinders_')) {
      player.incCounter({ counter: 'cylinders', value: 1 });
    }
    if (move.to.startsWith('gift_') && !move.from.startsWith('gift_')) {
      let value = 1;
      if (this.game.activeEvents.hasCard({ cardId: 'card_106' })) {
        value = 0;
      } else if (player.ownsEventCard({ cardId: ECE_KOH_I_NOOR_RECOVERED_CARD_ID })) {
        value = 2;
      }
      if (playerId === WAKHAN_PLAYER_ID) {
        (player as PPWakhanPlayer).incWakhanInfluence({
          wakhanInfluence: {
            type: 'wakhanInfluence',
            influence: {
              afghan: value,
              british: value,
              russian: value,
            },
          },
        });
      } else {
        player.incCounter({ counter: 'influence', value });
      }
    }
  }

  async notif_placeRoad(notif: Notif<NotifPlaceRoadArgs>) {
    const { from, to, tokenId, weight } = notif.args.move;
    const [type, region1, region2] = notif.args.move.to.split('_');
    const border = `${region1}_${region2}`;

    if (from !== to) {
      await this.game.map
        .getBorder({ border })
        .getRoadZone()
        .addCard({
          id: tokenId,
          state: weight,
          used: 0,
          location: to,
          type: 'road',
          coalition: getCoalitionForBlock(tokenId),
        });
    }

    this.game.objectManager.supply.checkDominantCoalition();
  }

  async notif_publicWithdrawal(notif: Notif<NotifPublicWithdrawalArgs>) {
    const { marketLocation } = notif.args;
    const row = Number(marketLocation.split('_')[1]);
    const column = Number(marketLocation.split('_')[2]);
    this.game.market.getMarketRupeesZone({ row, column }).removeAll({ destroy: true });
  }

  async notif_purchaseCard(notif: Notif<NotifPurchaseCardArgs>): Promise<void> {
    const { marketLocation, newLocation, rupeesOnCards, playerId, receivedRupees } = notif.args;

    this.game.clearPossible();
    const row = Number(marketLocation.split('_')[1]);
    const col = Number(marketLocation.split('_')[2]);

    // Place paid rupees on market cards
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -rupeesOnCards.length });
    await Promise.all(
      rupeesOnCards
        .reverse()
        .map(({ row, column, rupeeId, cardId }, index) =>
          this.game.market.placeRupeeOnCard({ row, column, rupeeId, fromDiv: `rupees_${playerId}`, cardId, index })
        )
    );

    // Remove all rupees that were on the purchased card
    await this.game.market.removeRupeesFromCard({ row, column: col, to: `rupees_${playerId}` });
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: receivedRupees });

    // Move card from markt
    const cardId = notif.args.card.id;
    if (newLocation.startsWith('events_')) {
      await this.getPlayer({ playerId }).addCardToEvents({ cardId });
      if (cardId === 'card_109') {
        this.game.objectManager.supply.checkDominantCoalition();
      }
    } else if (newLocation === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromZone(cardId);
    } else if (newLocation === TEMP_DISCARD) {
      await this.game.objectManager.tempDiscardPile.getZone().addCard(this.game.getCard(notif.args.card));
    } else {
      await this.getPlayer({ playerId }).addCardToHand(notif.args.card);
    }
  }

  async notif_replaceHand(notif: Notif<NotifReplaceHandArgs>) {
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
        await player.getCylinderZone().addCards(
          value.map(({ tokenId, weight }) =>
            this.game.getCylinder({
              id: tokenId,
              state: weight,
              used: 0,
              location: `cylinders_${player.getPlayerId()}`,
            })
          )
        );

        player.incCounter({ counter: 'cylinders', value: -value.length });
      }),
      // this.game.spies?.[cardId].removeAll(),
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
    const { blockId, weight, coalition } = notif.args;
    const toZone = this.game.objectManager.supply.getCoalitionBlocksZone({ coalition });

    await toZone.addCard({
      id: blockId,
      state: weight,
      used: 0,
      location: `blocks_${coalition}`,
      type: 'supply',
      coalition: coalition as Coalition,
    });

    this.game.objectManager.supply.checkDominantCoalition();
  }

  async notif_returnCylinder(notif: Notif<NotifReturnCylinderArgs>): Promise<void> {
    this.game.clearPossible();
    const { from, cylinderId, weight } = notif.args;
    const playerId = Number(cylinderId.split('_')[1]);
    const player = this.getPlayer({ playerId });

    await player.getCylinderZone().addCard(
      this.game.getCylinder({
        id: cylinderId,
        state: weight,
        used: 0,
        location: `cylinders_${player.getPlayerId()}`,
      })
    );
    player.incCounter({ counter: 'cylinders', value: -1 });

    if (from.startsWith('gift_')) {
      // card_106 is Embarrassment of Riches so cylinder influence counts as 0 and we should not reduce
      const value = this.game.activeEvents.hasCard({ cardId: 'card_106' }) ? 0 : -1;
      player.incCounter({ counter: 'influence', value });
    }
  }

  async notif_returnRupeesToSupply(notif: Notif<NotifReturnRupeesToSupplyArgs>) {
    const { playerId, amount } = notif.args;
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: -amount });
  }

  async notif_shiftMarket(notif: Notif<NotifShiftMarketArgs>): Promise<void> {
    this.game.clearPossible();
    const { move } = notif.args;
    const animationDurationBefore = this.game.animationManager.getSettings().duration;

    const fromRow = Number(move.from.split('_')[1]);
    const fromCol = Number(move.from.split('_')[2]);
    const toRow = Number(move.to.split('_')[1]);
    const toCol = Number(move.to.split('_')[2]);

    this.game.animationManager.getSettings().duration = animationDurationBefore / 2;

    await this.game.market.moveCard({
      card: this.game.getCardInfo(move.cardId),
      from: {
        row: fromRow,
        column: fromCol,
      },
      to: {
        row: toRow,
        column: toCol,
      },
    });

    if (move.cardId === ECE_PUBLIC_WITHDRAWAL_CARD_ID && toCol === 0) {
      await this.game.market.getMarketRupeesZone({ row: toRow, column: toCol }).removeAll({ destroy: true });
    }

    this.game.animationManager.getSettings().duration = animationDurationBefore;
  }

  async notif_smallRefreshHand(notif: Notif<NotifSmallRefreshHandArgs>) {
    const { hand, playerId } = notif.args;
    const player = this.getPlayer({ playerId });
    player.clearHand();
    player.setupHand({ hand });
  }

  async notif_smallRefreshInterface(notif: Notif<NotifSmallRefreshInterfaceArgs>) {
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

    const loyaltyDial = document.getElementById(`pp_loyalty_dial_container_${playerId}`);
    const zIndexBefore = loyaltyDial?.style.zIndex || null;
    if (loyaltyDial) {
      loyaltyDial.style.zIndex = `${11}`;
    }
    await this.game.playerManager.getPlayer({ playerId }).takePrize({ cardId });
    if (loyaltyDial) {
      loyaltyDial.style.zIndex = zIndexBefore;
    }
  }

  async notif_takeRupeesFromSupply(notif: Notif<NotifTakeRupeesFromSupplyArgs>) {
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
      selectedRupees.map(async (rupee, index) => {
        const { row, column, rupeeId } = rupee;
        await this.game.market.removeSingleRupeeFromCard({ row, column, rupeeId, to: `rupees_${playerId}`, index });
      })
    );
    this.getPlayer({ playerId }).incCounter({ counter: 'rupees', value: amount });
  }

  async notif_updateInfluence({ args }: Notif<NotifUpdateInfluenceArgs>) {
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
      await this.getPlayer({ playerId }).addCardToEvents({ cardId });
      if (cardId === 'card_109') {
        this.game.objectManager.supply.checkDominantCoalition();
      }
    } else if (newLocation === DISCARD) {
      await this.game.objectManager.discardPile.discardCardFromZone(cardId);
    } else if (newLocation === TEMP_DISCARD) {
      await this.game.objectManager.tempDiscardPile.getZone().addCard(this.game.getCard(card));
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

  async notif_wakhanUpdatePragmaticLoyalty({ args }: Notif<NotifWakhanUpdatePragmaticLoyalty>) {
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

  async performTokenMove({ move }: { move: TokenMove }): Promise<void> {
    const { tokenId, from, to, weight } = move;
    // Can be the case when a player needs to select a piece
    // because pool is empty
    if (from === to) {
      return;
    }

    const toZone = this.game.getZoneForLocation({ location: to });

    // Player is active player and moves have already been executed in client state.
    // Still send notification so it is handled during replays => check if this is actually the case
    // check if to already has the token
    if (
      this.game.framework().isCurrentPlayerActive() &&
      toZone.getCards().some((item) => item.id === tokenId) // Perhaps we just make this a generic check?
    ) {
      debug('no need to execute move');
      return;
    }

    let token: Token | Cylinder | CoalitionBlock = {
      id: tokenId,
      state: weight,
      used: 0,
      location: to,
    };
    const [zoneType] = to.split('_');

    switch (zoneType) {
      case 'armies':
        token['type'] = 'army';
        token['coalition'] = getCoalitionForBlock(tokenId);
        break;
      case 'roads':
        token['type'] = 'road';
        token['coalition'] = getCoalitionForBlock(tokenId);
        break;
      case 'blocks':
        token['type'] = 'supply';
        token['coalition'] = getCoalitionForBlock(tokenId);
        break;
      case 'gift':
      case 'tribes':
      case 'spies':
        token = this.game.getCylinder(token);
        break;
    }

    await toZone.addCard(token);
  }
}
