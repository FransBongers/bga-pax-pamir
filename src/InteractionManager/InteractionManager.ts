//  .####.##....##.########.########.########.....###.....######..########.####..#######..##....##
//  ..##..###...##....##....##.......##.....##...##.##...##....##....##.....##..##.....##.###...##
//  ..##..####..##....##....##.......##.....##..##...##..##..........##.....##..##.....##.####..##
//  ..##..##.##.##....##....######...########..##.....##.##..........##.....##..##.....##.##.##.##
//  ..##..##..####....##....##.......##...##...#########.##..........##.....##..##.....##.##..####
//  ..##..##...###....##....##.......##....##..##.....##.##....##....##.....##..##.....##.##...###
//  .####.##....##....##....########.##.....##.##.....##..######.....##....####..#######..##....##

//  .##.....##....###....##....##....###.....######...########.########.
//  .###...###...##.##...###...##...##.##...##....##..##.......##.....##
//  .####.####..##...##..####..##..##...##..##........##.......##.....##
//  .##.###.##.##.....##.##.##.##.##.....##.##...####.######...########.
//  .##.....##.#########.##..####.#########.##....##..##.......##...##..
//  .##.....##.##.....##.##...###.##.....##.##....##..##.......##....##.
//  .##.....##.##.....##.##....##.##.....##..######...########.##.....##

class InteractionManager {
  private game: PaxPamirGame;
  private handles: unknown[];
  private selectedAction?: string;
  // TODO (Frans): check what needs to be converted to number
  private activePlayer: {
    court?: Token[];
    favoredSuit?: string;
    remainingActions?: number;
    rupees?: string;
    unavailableCards?: string[];
  };
  // TODO(Frans): we should probably remove below props here since it's used in specific funtion
  private numberOfDiscards: number;
  private selectedGift: string;
  private selectedCard: string;

  constructor(game: PaxPamirGame) {
    console.log("Interaction Manager");
    this.game = game;
    this.handles = [];
    this.selectedAction = undefined;
    // Will store all data for active player and gets refreshed with entering player actions state
    this.activePlayer = {};
  }

  resetActionArgs() {
    console.log("resetActionArgs");

    // Remove all selectable / selected classes
    dojo.query(".pp_selectable_card").removeClass("pp_selectable_card");
    dojo.query(".pp_selected").removeClass("pp_selected");
    dojo.query(".pp_selectable").removeClass("pp_selectable");
    // getElementById used because dojo does not seem to handle svgs well.
    REGIONS.forEach((region) => {
      const element = document.getElementById(`pp_region_${region}`);
      element.classList.remove("pp_selectable");
    });
    document.getElementById("pp_map_areas").classList.remove("pp_selectable");

    // reset handles
    dojo.forEach(this.handles, dojo.disconnect);
    this.handles = [];
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  updateSelectableActions() {
    console.log("updateSelectableActions", this.selectedAction);
    this.resetActionArgs();
    const playerId = this.game.getPlayerId();
    switch (this.selectedAction) {
      case "cardActionBattle":
        console.log("battle");
        console.log("dojo", dojo);
        const container = document.getElementById(`pp_map_areas`);
        container.classList.add("pp_selectable");
        REGIONS.forEach((region) => {
          console.log("region", region);
          const element = document.getElementById(`pp_region_${region}`);
          // console.log(node);
          element.classList.add("pp_selectable");
          this.handles.push(
            dojo.connect(element, "onclick", this, "onSelectRegion")
          );
          // dojo.query(`#pp_region_${region}`).forEach((node) => {
          // dojo.query(`.pp_region`).forEach((node) => {
          // dojo.query('#pp_map_areas').forEach((node) => {
          //     dojo.addClass(node, 'pp_selectable');
          //     this.handles.push(dojo.connect(node,'onclick', this, 'onSelectRegion'));
          // })
        });
        break;
      case "cardAction":
        // Note Frans: perhaps there is a better way to get the court cards for the player
        // based on backend data
        dojo.query(`.pp_card_in_court_${playerId}`).forEach((node) => {
          const splitNodeId = node.id.split("_");
          const cardId = `${splitNodeId[5]}_${splitNodeId[6]}`;
          const used =
            this.activePlayer.court?.find((card) => card.key === cardId)
              ?.used === "1";
          if (
            !used &&
            (this.activePlayer.remainingActions > 0 ||
              (this.game.gamedatas.cards[cardId] as CourtCard).suit ===
                this.activePlayer.favoredSuit)
          )
            dojo.map(node.children, (child) => {
              if (dojo.hasClass(child, "pp_card_action")) {
                dojo.addClass(child, "pp_selectable");
                this.handles.push(
                  dojo.connect(child, "onclick", this, "onCardActionClick")
                );
              }
            });
        });
        break;
      case "cardActionGift":
        ["2", "4", "6"].forEach((giftValue) => {
          const hasGift =
            this.game.playerManager.getPlayer[playerId].gifts[
              giftValue
            ].getAllItems().length > 0;
          if (!hasGift && giftValue <= this.activePlayer.rupees) {
            dojo.query(`#pp_gift_${giftValue}_${playerId}`).forEach((node) => {
              dojo.addClass(node, "pp_selectable");
              this.handles.push(
                dojo.connect(node, "onclick", this, "onSelectGift")
              );
            });
          }
        });
        break;
      default:
        break;
    }
  }

  updateSelectableCards(args = null) {
    console.log("updateSelectableCards", this.selectedAction);
    this.resetActionArgs();

    switch (this.selectedAction) {
      case "purchase":
        dojo.query(".pp_market_card").forEach((node) => {
          const cost = node.id.split("_")[3]; // cost is equal to the column number
          const cardId = node.id.split("_")[6];
          if (
            cost <= this.activePlayer.rupees &&
            !this.activePlayer.unavailableCards.includes("card_" + cardId)
          ) {
            dojo.addClass(node, "pp_selectable_card");
            this.handles.push(dojo.connect(node, "onclick", this, "onCard"));
          }
        }, this);
        break;
      case "play":
      case "discard_hand":
        dojo.query(".pp_card_in_hand").forEach(function (node, index) {
          dojo.addClass(node, "pp_selectable_card");
          this.handles.push(dojo.connect(node, "onclick", this, "onCard"));
        }, this);
        break;
      case "discard_court":
        dojo
          .query(`.pp_card_in_court_${this.game.getPlayerId}`)
          .forEach(function (node, index) {
            dojo.addClass(node, "pp_selectable_card");
            this.handles.push(dojo.connect(node, "onclick", this, "onCard"));
          }, this);
        break;
      case "placeSpy":
        dojo
          .query(`.pp_card_in_court_${args?.region ? args.region : ""}`)
          .forEach(function (node, index) {
            dojo.addClass(node, "pp_selectable_card");
            this.handles.push(dojo.connect(node, "onclick", this, "onCard"));
          }, this);
        break;
      // case 'card_action':
      //     break;
      default:
        break;
    }
  }

  //  .########.##....##.########.########.########..####.##....##..######..
  //  .##.......###...##....##....##.......##.....##..##..###...##.##....##.
  //  .##.......####..##....##....##.......##.....##..##..####..##.##.......
  //  .######...##.##.##....##....######...########...##..##.##.##.##...####
  //  .##.......##..####....##....##.......##...##....##..##..####.##....##.
  //  .##.......##...###....##....##.......##....##...##..##...###.##....##.
  //  .########.##....##....##....########.##.....##.####.##....##..######..

  //  ..######..########....###....########.########
  //  .##....##....##......##.##......##....##......
  //  .##..........##.....##...##.....##....##......
  //  ..######.....##....##.....##....##....######..
  //  .......##....##....#########....##....##......
  //  .##....##....##....##.....##....##....##......
  //  ..######.....##....##.....##....##....########

  onEnteringState(stateName, args) {
    // UI changes for active player
    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      switch (stateName) {
        case "client_cardActionBattle":
          this.updateSelectableActions();
          break;
        case "cardActionGift":
          this.activePlayer.rupees = args.args.rupees;
          console.log("activePlayer", this.activePlayer);
          this.selectedAction = "cardActionGift";
          this.updateSelectableActions();
          break;
        case "playerActions":
          const {
            court,
            favored_suit,
            remaining_actions,
            rupees,
            unavailable_cards,
          } = args.args;
          this.activePlayer = {
            court,
            favoredSuit: favored_suit,
            remainingActions: Number(remaining_actions),
            rupees: rupees,
            unavailableCards: unavailable_cards,
          };
          // this.unavailableCards = args.args.unavailable_cards;
          // this.remainingActions = args.args.remaining_actions;
          break;
        case "placeSpy":
          this.selectedAction = "placeSpy";
          this.updateSelectableCards(args.args);
          break;
        default:
          break;
      }
    }

    // UI changes for all players
    switch (stateName) {
      case "dummmy":
        break;
      default:
        console.log("onEnteringState default");
        break;
    }
  }

  //  .##.......########....###....##.....##.####.##....##..######..
  //  .##.......##.........##.##...##.....##..##..###...##.##....##.
  //  .##.......##........##...##..##.....##..##..####..##.##.......
  //  .##.......######...##.....##.##.....##..##..##.##.##.##...####
  //  .##.......##.......#########..##...##...##..##..####.##....##.
  //  .##.......##.......##.....##...##.##....##..##...###.##....##.
  //  .########.########.##.....##....###....####.##....##..######..

  //  ..######..########....###....########.########
  //  .##....##....##......##.##......##....##......
  //  .##..........##.....##...##.....##....##......
  //  ..######.....##....##.....##....##....######..
  //  .......##....##....#########....##....##......
  //  .##....##....##....##.....##....##....##......
  //  ..######.....##....##.....##....##....########

  onLeavingState(stateName) {
    switch (stateName) {
      /* Example:
      
      case 'myGameState':
      
          // Hide the HTML block we are displaying only during this game state
          dojo.style( 'my_html_block_id', 'display', 'none' );
          
          break;
     */

      case "dummmy":
        break;
    }
  }

  // .##.....##.########..########.....###....########.########
  // .##.....##.##.....##.##.....##...##.##......##....##......
  // .##.....##.##.....##.##.....##..##...##.....##....##......
  // .##.....##.########..##.....##.##.....##....##....######..
  // .##.....##.##........##.....##.#########....##....##......
  // .##.....##.##........##.....##.##.....##....##....##......
  // ..#######..##........########..##.....##....##....########

  //  .########..##.....##.########.########..#######..##....##..######.
  //  .##.....##.##.....##....##.......##....##.....##.###...##.##....##
  //  .##.....##.##.....##....##.......##....##.....##.####..##.##......
  //  .########..##.....##....##.......##....##.....##.##.##.##..######.
  //  .##.....##.##.....##....##.......##....##.....##.##..####.......##
  //  .##.....##.##.....##....##.......##....##.....##.##...###.##....##
  //  .########...#######.....##.......##.....#######..##....##..######.

  onUpdateActionButtons(stateName, args) {
    if (!(this.game as unknown as Framework).isCurrentPlayerActive()) {
      return;
    }

    switch (stateName) {
      case "setup":
        (this.game as unknown as Framework).addActionButton(
          "afghan_button",
          _("Afghan"),
          "onActionButtonClick",
          null,
          false,
          "blue"
        );
        (this.game as unknown as Framework).addActionButton(
          "british_button",
          _("British"),
          "onActionButtonClick",
          null,
          false,
          "blue"
        );
        (this.game as unknown as Framework).addActionButton(
          "russian_button",
          _("Russian"),
          "onActionButtonClick",
          null,
          false,
          "blue"
        );
        break;

      case "playerActions":
        var main = $("pagemaintitletext");
        if (args.remaining_actions > 0) {
          main.innerHTML +=
            _(" may take ") +
            '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' +
            args.remaining_actions +
            "</span>" +
            _(" action(s): ");
            (this.game as unknown as Framework).addActionButton(
            "purchase_btn",
            _("Purchase"),
            "onPurchase"
          );
          (this.game as unknown as Framework).addActionButton("play_btn", _("Play"), "onPlay");
          (this.game as unknown as Framework).addActionButton(
            "card_action_btn",
            _("Card Action"),
            "onCardAction"
          );
          (this.game as unknown as Framework).addActionButton(
            "pass_btn",
            _("End Turn"),
            "onPass",
            null,
            false,
            "gray"
          );
        } else {
          main.innerHTML +=
            _(" have ") +
            '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' +
            args.remaining_actions +
            "</span>" +
            _(" remaining actions: ");
          // If player has court cards with free actions
          if (
            args.court.some(
              ({ key, used }) =>
                used == "0" &&
                (this.game.gamedatas.cards[key] as CourtCard).suit == args.favored_suit
            )
          ) {
            (this.game as unknown as Framework).addActionButton(
              "card_action_btn",
              _("Card Action"),
              "onCardAction"
            );
          }
          (this.game as unknown as Framework).addActionButton(
            "pass_btn",
            _("End Turn"),
            "onPass",
            null,
            false,
            "blue"
          );
        }
        break;

      // case 'negotiateBribe':
      //     for ( var i = 0; i <= args.briber_max; i++ ) {
      //         this.game.addActionButton( i+'_btn', $i, 'onBribe', null, false, 'blue' );
      //     }
      //     break;

      case "discardCourt":
        this.numberOfDiscards =
          Object.keys(args.court).length - args.suits.political - 3;
        if (this.numberOfDiscards > 1) var cardmsg = _(" court cards ");
        else cardmsg = _(" court card");
        $("pagemaintitletext").innerHTML +=
          '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' +
          this.numberOfDiscards +
          "</span>" +
          cardmsg;
        this.selectedAction = "discard_court";
        this.updateSelectableCards();
        (this.game as unknown as Framework).addActionButton(
          "confirm_btn",
          _("Confirm"),
          "onConfirm",
          null,
          false,
          "blue"
        );
        dojo.addClass("confirm_btn", "pp_disabled");
        break;

      case "discardHand":
        this.numberOfDiscards =
          Object.keys(args.hand).length - args.suits.intelligence - 2;
        if (this.numberOfDiscards > 1) var cardmsg = _(" hand cards ");
        else cardmsg = _(" hand card");
        $("pagemaintitletext").innerHTML +=
          '<span id="remaining_actions_value" style="font-weight:bold;color:#ED0023;">' +
          this.numberOfDiscards +
          "</span>" +
          cardmsg;
        this.selectedAction = "discard_hand";
        this.updateSelectableCards();
        (this.game as unknown as Framework).addActionButton(
          "confirm_btn",
          _("Confirm"),
          "onConfirm",
          null,
          false,
          "blue"
        );
        dojo.addClass("confirm_btn", "pp_disabled");
        break;

      case "client_confirmPurchase":
        (this.game as unknown as Framework).addActionButton(
          "confirm_btn",
          _("Confirm"),
          "onConfirm",
          null,
          false,
          "blue"
        );
        (this.game as unknown as Framework).addActionButton(
          "cancel_btn",
          _("Cancel"),
          "onCancel",
          null,
          false,
          "red"
        );
        break;

      case "client_confirmPlay":
        (this.game as unknown as Framework).addActionButton(
          "left_side_btn",
          _("<< LEFT"),
          "onLeft",
          null,
          false,
          "blue"
        );
        (this.game as unknown as Framework).addActionButton(
          "right_side_btn",
          _("RIGHT >>"),
          "onRight",
          null,
          false,
          "blue"
        );
        (this.game as unknown as Framework).addActionButton(
          "cancel_btn",
          _("Cancel"),
          "onCancel",
          null,
          false,
          "red"
        );
        break;
      case "client_confirmPlaceSpy":
        (this.game as unknown as Framework).addActionButton(
          "confirm_btn",
          _("Confirm"),
          "onConfirm",
          null,
          false,
          "blue"
        );
        (this.game as unknown as Framework).addActionButton(
          "cancel_btn",
          _("Cancel"),
          "onCancel",
          null,
          false,
          "red"
        );
        break;
      case "client_confirmSelectGift":
        (this.game as unknown as Framework).addActionButton(
          "confirm_btn",
          _("Confirm"),
          "onConfirm",
          null,
          false,
          "red"
        );
        (this.game as unknown as Framework).addActionButton(
          "cancel_btn",
          _("Cancel"),
          "onCancel",
          null,
          false,
          "gray"
        );
        break;
      case "placeRoad":
        args.region.borders.forEach((border) => {
          (this.game as unknown as Framework).addActionButton(
            `${border}_btn`,
            _(this.game.gamedatas.borders[border].name),
            "onBorder",
            null,
            false,
            "blue"
          );
        });
        break;
      case "client_endTurn":
        (this.game as unknown as Framework).addActionButton(
          "confirm_btn",
          _("Confirm"),
          "onConfirm",
          null,
          false,
          "red"
        );
        (this.game as unknown as Framework).addActionButton(
          "cancel_btn",
          _("Cancel"),
          "onCancel",
          null,
          false,
          "gray"
        );
        break;
      case "cardActionGift":
        (this.game as unknown as Framework).addActionButton(
          "cancel_btn",
          _("Cancel"),
          "onCancel",
          null,
          false,
          "gray"
        );
        break;
      // case 'client_selectPurchase':
      // case 'client_selectPlay':
      //     this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
      //     break;

      // case 'client_confirmDiscard':
      //     this.addActionButton( 'confirm_btn', _('Confirm'), 'onConfirm', null, false, 'blue' );
      //     this.addActionButton( 'cancel_btn', _('Cancel'), 'onCancel', null, false, 'red' );
      //     break;

      default:
        console.log("default");
        break;
    }
  }

  //  ..######..##.......####..######..##....##
  //  .##....##.##........##..##....##.##...##.
  //  .##.......##........##..##.......##..##..
  //  .##.......##........##..##.......#####...
  //  .##.......##........##..##.......##..##..
  //  .##....##.##........##..##....##.##...##.
  //  ..######..########.####..######..##....##

  // .##.....##....###....##....##.########..##.......########..######.
  // .##.....##...##.##...###...##.##.....##.##.......##.......##....##
  // .##.....##..##...##..####..##.##.....##.##.......##.......##......
  // .#########.##.....##.##.##.##.##.....##.##.......######....######.
  // .##.....##.#########.##..####.##.....##.##.......##.............##
  // .##.....##.##.....##.##...###.##.....##.##.......##.......##....##
  // .##.....##.##.....##.##....##.########..########.########..######.

  onActionButtonClick(evt) {
    dojo.stopEvent(evt);
    const buttonId = evt.target.id;
    console.log("onActionButtonClick", buttonId);
    const gamestateName = this.game.gamedatas.gamestate.name;
    console.log("gamestateName", gamestateName);
    switch (gamestateName) {
      case "setup":
        switch (buttonId) {
          case "afghan_button":
            this.game.chooseLoyalty({ coalition: COALITION.AFGHAN });
            break;
          case "british_button":
            this.game.chooseLoyalty({ coalition: COALITION.BRITISH });
            break;
          case "russian_button":
            this.game.chooseLoyalty({ coalition: COALITION.RUSSIAN });
            break;
        }
        break;
      default:
        console.log("no handler for button click");
        break;
    }
  }

  onPurchase(evt) {
    dojo.stopEvent(evt);
    if (!(this.game as unknown as Framework).checkAction("purchase")) return;

    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      this.selectedAction = "purchase";
      this.updateSelectableCards();
      (this.game as unknown as Framework).setClientState("client_selectPurchase", {
        descriptionmyturn: _("${you} must select a card to purchase"),
      });
    }
  }

  onPlay(evt) {
    dojo.stopEvent(evt);
    if (!(this.game as unknown as Framework).checkAction("play")) return;

    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      this.selectedAction = "play";
      this.updateSelectableCards();
      (this.game as unknown as Framework).setClientState("client_selectPlay", {
        descriptionmyturn: _("${you} must select a card to play"),
      });
    }
  }

  onSelectGift(evt) {
    const divId = evt.currentTarget.id;
    dojo.stopEvent(evt);
    if (!(this.game as unknown as Framework).checkAction("selectGift")) return;

    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      const value: string = divId.split("_")[2];
      this.selectedAction = "confirmSelectGift";
      this.resetActionArgs();
      this.selectedGift = value;
      dojo
        .query(`#pp_gift_${value}_${this.game.getPlayerId()}`)
        .addClass("pp_selected");
      (this.game as unknown as Framework).setClientState("client_confirmSelectGift", {
        descriptionmyturn: _(`Purchase gift for ${value} rupees?`),
      });
    }
  }

  onSelectRegion(evt) {
    const divId = evt.currentTarget.id;
    dojo.stopEvent(evt);
    console.log("onSelectRegion", divId, evt);
  }

  onCardAction(evt) {
    if (!(this.game as unknown as Framework).checkAction("card_action")) return;

    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      this.selectedAction = "cardAction";
      this.updateSelectableActions();
      (this.game as unknown as Framework).setClientState("client_selectCardAction", {
        descriptionmyturn: _("${you} must select a card action"),
      });
    }
  }

  onPass(evt) {
    dojo.stopEvent(evt);
    if (!(this.game as unknown as Framework).checkAction("pass")) return;
    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      this.selectedAction = "pass";
      if (this.activePlayer.remainingActions == 0) {
        this.game.pass();
      } else {
        (this.game as unknown as Framework).setClientState("client_endTurn", {
          descriptionmyturn: _("Confirm to your end turn "),
        });
      }
    }
  }

  onBorder(evt) {
    dojo.stopEvent(evt);
    if (!(this.game as unknown as Framework).checkAction("placeRoad")) return;
    const splitId = evt.target.id.split("_");
    const border = `${splitId[0]}_${splitId[1]}`;
    this.game.placeRoad({ border });
  }

  onCard(evt) {
    const cardDivId = evt.currentTarget.id;

    dojo.stopEvent(evt);

    const cardId = "card_" + cardDivId.split("_")[6];
    this.selectedCard = cardId;
    let node;
    if ((this.game as unknown as Framework).isCurrentPlayerActive()) {
      switch (this.selectedAction) {
        case "purchase":
          this.resetActionArgs();
          node = $(cardDivId);
          dojo.addClass(node, "pp_selected");
          const cost = cardDivId.split("_")[3];
          (this.game as unknown as Framework).setClientState("client_confirmPurchase", {
            descriptionmyturn: "Purchase this card for " + cost + " rupees?",
          });
          break;

        case "play":
          this.resetActionArgs();
          node = $(cardDivId);
          dojo.addClass(node, "pp_selected");
          (this.game as unknown as Framework).setClientState("client_confirmPlay", {
            descriptionmyturn: "Select which side of court to play card:",
          });
          break;

        case "discard_hand":
        case "discard_court":
          node = $(cardDivId);
          dojo.toggleClass(node, "pp_selected");
          dojo.toggleClass(node, "pp_discard");
          if (dojo.query(".pp_selected").length == this.numberOfDiscards) {
            dojo.removeClass("confirm_btn", "pp_disabled");
          } else {
            dojo.addClass("confirm_btn", "pp_disabled");
          }
          break;
        case "placeSpy":
          this.resetActionArgs();
          node = $(cardDivId);
          dojo.addClass(node, "pp_selected");
          const cardName = this.game.gamedatas.cards[cardId].name;
          (this.game as unknown as Framework).setClientState("client_confirmPlaceSpy", {
            descriptionmyturn: `Place a spy on ${cardName}`,
          });
          break;
        default:
          break;
      }
    }
  }

  onCardActionClick(evt) {
    const divId = evt.currentTarget.id;
    dojo.stopEvent(evt);
    this.resetActionArgs();
    const splitId = divId.split("_");
    const cardAction: string = splitId[0];
    const cardId: string = `${splitId[1]}_${splitId[2]}`;
    switch (cardAction) {
      case "gift":
        this.game.cardAction({ cardAction, cardId });
        break;
      case "battle":
        this.selectedAction = "cardActionBattle";
        // this.updateSelectableActions();
        (this.game as unknown as Framework).setClientState("client_cardActionBattle", {
          descriptionmyturn: _("${you} must select a card or region"),
        });
        break;
      case "default":
        console.log("default gift");
        break;
    }
  }

  onCancel(evt) {
    dojo.stopEvent(evt);
    this.resetActionArgs();
    this.selectedAction = "";
    (this.game as unknown as Framework).restoreServerGameState();
  }

  onConfirm(evt) {
    dojo.stopEvent(evt);
    switch (this.selectedAction) {
      case "purchase":
        var cardId = this.selectedCard;
        this.game.purchaseCard({ cardId });
        break;

      case "pass":
        this.game.pass();
        break;
      case "confirmSelectGift":
        this.game.selectGift({ selectedGift: this.selectedGift });
        break;
      case "discard_hand":
      case "discard_court":
        let cards = "";
        dojo.query(".pp_selected").forEach(function (item, index) {
          cards += " card_" + item.id.split("_")[6];
        }, this);
        this.game.discardCards({
          cards,
          fromHand: this.selectedAction == "discard_hand",
        });
        break;
      case "placeSpy":
        this.resetActionArgs();
        this.game.placeSpy({ cardId: this.selectedCard });
        break;
      default:
        break;
    }
  }

  onLeft(evt) {
    dojo.stopEvent(evt);
    switch (this.selectedAction) {
      case "play":
        this.resetActionArgs();
        // var node = $( card_id );
        // dojo.addClass(node, 'selected');
        this.game.playCard({ cardId: this.selectedCard, leftSide: true });
        break;

      default:
        break;
    }
  }

  onRight(evt) {
    dojo.stopEvent(evt);
    switch (this.selectedAction) {
      case "play":
        this.resetActionArgs();
        // var node = $( card_id );
        // dojo.addClass(node, 'selected');
        this.game.playCard({ cardId: this.selectedCard, leftSide: false });
        break;

      default:
        break;
    }
  }
}
