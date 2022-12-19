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
  constructor(game) {
    this.game = game;
    this.subscriptions = [];
  }

  destroy() {
    dojo.forEach(this.subscriptions, dojo.unsubscribe);
  }

  setupNotifications() {
    console.log("notifications subscriptions setup");

    this.subscriptions.push(
      dojo.subscribe("cardAction", this, "notif_cardAction")
    );

    this.subscriptions.push(
      dojo.subscribe("chooseLoyalty", this, "notif_chooseLoyalty")
    );

    this.subscriptions.push(
      dojo.subscribe("dominanceCheck", this, "notif_dominanceCheck")
    );

    this.subscriptions.push(
      dojo.subscribe("purchaseCard", this, "notif_purchaseCard")
    );
    this.game.notifqueue.setSynchronous("purchaseCard", 2000);

    this.subscriptions.push(dojo.subscribe("playCard", this, "notif_playCard"));
    this.game.notifqueue.setSynchronous("playCard", 2000);

    this.subscriptions.push(
      dojo.subscribe("discardCard", this, "notif_discardCard")
    );
    this.game.notifqueue.setSynchronous("discardCard", 500);

    this.subscriptions.push(
      dojo.subscribe("refreshMarket", this, "notif_refreshMarket")
    );
    this.game.notifqueue.setSynchronous("refreshMarket", 250);

    this.subscriptions.push(
      dojo.subscribe("selectGift", this, "notif_selectGift")
    );

    this.subscriptions.push(
      dojo.subscribe("moveToken", this, "notif_moveToken")
    );
    this.game.notifqueue.setSynchronous("moveToken", 250);

    this.subscriptions.push(
      dojo.subscribe("updatePlayerCounts", this, "notif_updatePlayerCounts")
    );
    this.subscriptions.push(dojo.subscribe("log", this, "notif_log"));

    // TODO: here, associate your game notifications with local methods

    // Example 1: standard notification handling
    // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );

    // Example 2: standard notification handling + tell the user interface to wait
    //            during 3 seconds after calling the method in order to let the players
    //            see what is happening in the game.
    // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
    // this.game.notifqueue.setSynchronous( 'cardPlayed', 3000 );
    //
  }

  notif_cardAction(notif) {
    console.log("notif_cardAction", notif);
  }

  notif_chooseLoyalty(notif) {
    console.log("notif_chooseLoyalty");
    console.log(notif);

    const coalition = notif.args.coalition;
    const playerId = notif.args.player_id;

    updatePlayerLoyalty({ playerId, coalition });
  }

  notif_discardCard(notif) {
    console.log("notif_discardCard", notif);

    this.game.clearLastAction();
    const playerId = notif.args.player_id;
    const from = notif.args.from;
    
    if (from == "hand") {
      // TODO (Frans): check how this works for other players than the one whos card gets discarded
      this.game.discardCard({ id: notif.args.card_id, from: this.game.playerHand });
    } else if (from == "market_0_0" || from == "market_1_0") {
      console.log(this.game.marketCards);
      const splitFrom = from.split("_");
      this.game.discardCard({
        id: notif.args.card_id,
        from: this.game.marketCards[splitFrom[1]][splitFrom[2]],
      });
    } else {
      this.game.discardCard({ id: notif.args.card_id, from: this.game.playerManager.players[playerId].court });

      notif.args.court_cards.forEach(function (card, index) {
        this.game.updateCard({
          location: this.game.playerManager.players[playerId].court,
          id: card.key,
          order: card.state,
        });
      }, this);
    }
  }

  notif_dominanceCheck(notif) {
    console.log("notif_dominanceCheck", notif);
    const { scores, moves } = notif.args;
    Object.keys(scores).forEach((playerId) => {
      this.game.scoreCtrl[playerId].toValue(scores[playerId].new_score);
      this.game.moveToken({
        id: `vp_cylinder_${playerId}`,
        from: this.game.objectManager.vpTrack.vpTrackZones[scores[playerId].current_score],
        to: this.game.objectManager.vpTrack.vpTrackZones[scores[playerId].new_score],
      });
    });

    (moves || []).forEach((move) => {
      const { token_id, from, to } = move;
      const coalition = to.split("_")[1];
      const splitFrom = from.split("_");
      const isArmy = splitFrom[0] == "armies";
      this.game.moveToken({
        id: token_id,
        to: this.game.coalitionBlocks[coalition],
        from: isArmy
          ? this.game.armies[splitFrom[1]]
          : this.game.roads[`${splitFrom[1]}_${splitFrom[2]}`],
        addClass: "pp_coalition_block",
        removeClass: isArmy ? "pp_army" : "pp_road",
      });
    });
  }

  notif_playCard(notif) {
    console.log("notif_playCard", notif);

    this.game.clearLastAction();
    var playerId = notif.args.player_id;

    notif.args.court_cards.forEach(function (card, index) {
      this.game.updateCard({
        location: this.game.playerManager.players[playerId].court,
        id: card.key,
        order: card.state,
      });
    }, this);

    if (playerId == this.game.player_id) {
      this.game.moveCard({
        id: notif.args.card.key,
        from: this.game.playerHand,
        to: this.game.playerManager.players[playerId].court,
      });
    } else {
      // TODO (Frans): check why moveCard results in a UI error => probably because other players don't have a playerHand?
      // this.game.moveCard({id: notif.args.card.key, from: null, to: this.game.playerManager.players[playerId].court});
      placeCard({
        location: this.game.playerManager.players[playerId].court,
        id: notif.args.card.key,
      });
    }

    this.game.playerManager.players[playerId].court.updateDisplay();
  }

  notif_purchaseCard(notif) {
    console.log("notif_purchaseCard", notif);

    this.game.clearLastAction();
    const row = notif.args.market_location.split("_")[1];
    const col = notif.args.market_location.split("_")[2];

    // Remove all rupees that were on the purchased card
    this.game.marketRupees[row][col].getAllItems().forEach((rupeeId) => {
      this.game.marketRupees[row][col].removeFromZone(
        rupeeId,
        true,
        `rupees_${notif.args.player_id}`
      );
    });

    // Move card from markt
    const cardId = notif.args.card.key;
    if (notif.args.new_location == "active_events") {
      this.game.moveCard({
        id: cardId,
        from: this.game.marketCards[row][col],
        to: this.game.activeEvents,
      });
    } else if (notif.args.new_location == "discard") {
      this.game.marketCards[row][col].removeFromStockById(cardId, "pp_discard_pile");
    } else if (notif.args.player_id == this.game.player_id) {
      this.game.moveCard({
        id: cardId,
        from: this.game.marketCards[row][col],
        to: this.game.playerHand,
      });
    } else {
      this.game.moveCard({ id: cardId, from: this.game.marketCards[row][col], to: null });
      this.game.spies[cardId] = undefined;
    }

    // Place paid rupees on market cards
    notif.args.updated_cards.forEach((item, index) => {
      const marketRow = item.location.split("_")[1];
      const marketColumn = item.location.split("_")[2];
      placeToken({
        game: this.game,
        location: this.game.marketRupees[marketRow][marketColumn],
        id: item.rupee_id,
        jstpl: "jstpl_rupee",
        jstplProps: {
          id: item.rupee_id,
        },
        weight: this.game.defaultWeightZone,
      });
    }, this);
  }

  notif_refreshMarket(notif) {
    console.log("notif_refreshMarket", notif);

    this.game.clearLastAction();

    notif.args.card_moves.forEach(function (move, index) {
      const fromRow = move.from.split("_")[1];
      const fromCol = move.from.split("_")[2];
      const toRow = move.to.split("_")[1];
      const toCol = move.to.split("_")[2];
      this.game.moveCard({
        id: move.card_id,
        from: this.game.marketCards[fromRow][fromCol],
        to: this.game.marketCards[toRow][toCol],
      });
      // TODO (Frans): check why in case of moving multiple rupees at the same time
      // they overlap
      this.game.marketRupees[fromRow][fromCol].getAllItems().forEach((rupeeId) => {
        this.game.moveToken({
          id: rupeeId,
          to: this.game.marketRupees[toRow][toCol],
          from: this.game.marketRupees[fromRow][toRow],
          weight: this.game.defaultWeightZone,
        });
      });
    }, this);

    notif.args.new_cards.forEach(function (move, index) {
      placeCard({
        location:
          this.game.marketCards[move.to.split("_")[1]][move.to.split("_")[2]],
        id: move.card_id,
      });
    }, this);
  }

  notif_selectGift(notif) {
    console.log("notif_selectGift", notif);
    this.game.clearLastAction();
    const { updated_cards, player_id, rupee_count, updated_counts } =
      notif.args;
    // Place paid rupees on market cards
    updated_cards.forEach((item, index) => {
      const marketRow = item.location.split("_")[1];
      const marketColumn = item.location.split("_")[2];
      placeToken({
        game: this.game,
        location: this.game.marketRupees[marketRow][marketColumn],
        id: item.rupee_id,
        jstpl: "jstpl_rupee",
        jstplProps: {
          id: item.rupee_id,
        },
        from: `rupees_${player_id}`,
      });
    }, this);
    $("rupee_count_" + player_id).innerHTML = updated_counts.rupees;
    $("influence_" + player_id).innerHTML = updated_counts.influence;
  }

  notif_updatePlayerCounts(notif) {
    console.log("notif_updatePlayerCounts", notif);
    this.game.playerCounts = notif.args.counts;
    const counts = notif.args.counts;

    Object.keys(counts).forEach((playerId) => {
      $("influence_" + playerId).innerHTML = counts[playerId].influence;
      $("cylinder_count_" + playerId).innerHTML = counts[playerId].cylinders;
      $("rupee_count_" + playerId).innerHTML = counts[playerId].rupees;
      $("card_count_" + playerId).innerHTML = counts[playerId].cards;

      $("economic_" + playerId).innerHTML = counts[playerId].suits.economic;
      $("military_" + playerId).innerHTML = counts[playerId].suits.military;
      $("political_" + playerId).innerHTML = counts[playerId].suits.political;
      $("intelligence_" + playerId).innerHTML =
        counts[playerId].suits.intelligence;
    });
  }

  notif_moveToken(notif) {
    console.log("notif_moveToken", notif);
    notif.args.moves.forEach((move) => {
      const { token_id, from, to, updates } = move;
      const fromZone = this.game.getZoneForLocation({ location: from });
      const toZone = this.game.getZoneForLocation({ location: to });

      // TODO: perhaps create separate function for this
      const addClass = to.startsWith("armies")
        ? "pp_army"
        : to.startsWith("roads")
        ? "pp_road"
        : undefined;
      const removeClass = from.startsWith("blocks")
        ? "pp_coalition_block"
        : undefined;
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
    console.log("notif_log", notif);
    console.log(notif.log);
    console.log(notif.args);
  }
}
