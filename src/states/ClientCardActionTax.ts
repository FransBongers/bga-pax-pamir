class ClientCardActionTaxState implements State {
  private game: PaxPamirGame;
  private maxNumberToSelect: number;
  private numberSelected: number;
  private cardId: string;
  private maxPerPlayer: {
    [playerId: number]: number;
  };

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  /**
   * Steps
   * 1. Determine which rupees can be taxed
   *  => everything in market, players with card for which taxer is ruler minus tax protection
   * 2. Let player select rupees
   * 3. Send to backens
   */
  onEnteringState(args: { cardId: string }) {
    this.cardId = args.cardId;
    const cardInfo = this.game.getCardInfo(args) as CourtCard;
    this.maxNumberToSelect = cardInfo.rank;
    this.numberSelected = 0;
    this.maxPerPlayer = {};
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
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.confirmTax(),
    });
    dojo.addClass('confirm_btn', 'disabled');
    this.game.addCancelButton();
    this.setRupeesSelectable();
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  private confirmTax() {
    const marketRupees: string[] = [];
    const playerRupees: string[] = [];
    dojo.query('.pp_selected').forEach((node: HTMLElement) => {
      if (!node.id.startsWith('rupees_tableau')) {
        marketRupees.push(node.id);
      }
    });
    Object.keys(this.maxPerPlayer).forEach((playerId: string) => {
      const taxCounter = dojo.byId(`rupees_tableau_${playerId}_tax_counter`);
      if(taxCounter) {
        playerRupees.push(`${playerId}_${Number(taxCounter.innerText)}`);
      }
    });

    this.game.takeAction({action: 'tax', data: {
      cardId: this.cardId,
      market: marketRupees.join(' '),
      players: playerRupees.join(' '),
    }})
  }

  private handleMarketRupeeClicked({ rupeeId }: { rupeeId: string }) {
    const node = dojo.byId(`${rupeeId}`);
    const hasSelectableClass = node.classList.contains('pp_selectable');
    if (hasSelectableClass && this.numberSelected >= this.maxNumberToSelect) {
      debug('max selected reached');
      return;
    }

    this.toggleSelected(node);

    this.updateNumberSelected();
    this.updateConfirmButton();
    this.updatePageTitle();
    this.updateSelectableStatePlayers();
  }

  private handlePlayerRupeeClicked({ rupeeId }: { rupeeId: string }) {
    const node = dojo.byId(`${rupeeId}`);
    const taxCounter = dojo.byId(`${node.id}_tax_counter`);

    const hasSelectableClass = node.classList.contains('pp_selectable');

    if (hasSelectableClass && this.numberSelected >= this.maxNumberToSelect && !taxCounter) {
      debug('max selected reached');
      return;
    }
    

    if(!taxCounter) {
      dojo.place(`<span id="${node.id}_tax_counter" class="pp_tax_counter">1</span>`, node);
    } else {
      const playerId = Number(node.id.split('_')[2]);
      const currentValue = Number(taxCounter.innerText);
      if (
        this.numberSelected >= this.maxNumberToSelect ||
        currentValue >= this.maxNumberToSelect ||
        currentValue >= this.maxPerPlayer[playerId]
      ) {
        dojo.destroy(`${node.id}_tax_counter`);
      } else {
        taxCounter.innerText = `${currentValue + 1}`;
      }
    }

    this.updateNumberSelected();
    this.updateConfirmButton();
    this.updatePageTitle();
    this.updateSelectableStatePlayers();
  }

  private toggleSelected(node: HTMLElement) {
    node.classList.toggle('pp_selected');
    node.classList.toggle('pp_selectable');
  }

  private setRupeesSelectable() {
    // Market
    dojo.query('.pp_rupee').forEach((node: HTMLElement) => {
      const parentId = node.parentElement.id;
      if (parentId.startsWith('pp_market')) {
        dojo.addClass(node, 'pp_selectable');
        this.game._connections.push(
          dojo.connect(node, 'onclick', this, (event: PointerEvent) => {
            event.stopPropagation();
            this.handleMarketRupeeClicked({ rupeeId: node.id });
          })
        );
      }
    });

    // Players
    this.game.playerManager.getPlayerIds().forEach((playerId: number) => {
      if (playerId === this.game.getPlayerId()) {
        return;
      }
      const player = this.game.playerManager.getPlayer({ playerId });
      const hasCardRuledByPlayer = player
        .getCourtZone()
        .getAllItems()
        .some((cardId: string) => {
          const cardRegion = (this.game.getCardInfo({ cardId }) as CourtCard).region;
          if (this.game.map.getRegion({ region: cardRegion }).getRuler() === this.game.getPlayerId()) {
            return true;
          }
        });
      if (!hasCardRuledByPlayer) {
        return;
      }
      const taxShelter = player.getTaxShelter();
      const playerRupees = player.getRupees();
      if (playerRupees <= taxShelter) {
        return;
      }
      this.maxPerPlayer[playerId] = playerRupees - taxShelter;

      const node = dojo.byId(`rupees_tableau_${playerId}`);
      dojo.addClass(node, 'pp_selectable');
      this.game._connections.push(
        dojo.connect(node, 'onclick', this, (event: PointerEvent) => {
          event.stopPropagation();
          this.handlePlayerRupeeClicked({ rupeeId: node.id });
        })
      );
    });
  }

  private updateConfirmButton() {
    if (this.numberSelected > 0 && this.numberSelected <= this.maxNumberToSelect) {
      dojo.removeClass('confirm_btn', 'disabled');
    } else {
      dojo.addClass('confirm_btn', 'disabled');
    }
  }

  private updateNumberSelected() {
    let numberSelected = 0;
    dojo.query('.pp_selected').forEach((node: HTMLElement) => {
      if (!node.id.startsWith('rupees_tableau')) {
        numberSelected += 1;
      }
    });
    Object.keys(this.maxPerPlayer).forEach((playerId: string) => {
      const taxCounter = dojo.byId(`rupees_tableau_${playerId}_tax_counter`);
      if(taxCounter) {
        numberSelected += Number(taxCounter.innerText);
      }
    });

    this.numberSelected = numberSelected;
  }

  private updatePageTitle() {
    this.game.clientUpdatePageTitle({
      text: _('${you} may take ${number} rupee(s) (${remaining} remaining)'),
      args: {
        you: '${you}',
        number: this.maxNumberToSelect,
        remaining: this.maxNumberToSelect - this.numberSelected,
      },
    });
  }

  private updateSelectableStatePlayers() {
    Object.keys(this.maxPerPlayer).forEach((playerId: string) => {
      const taxCounter = dojo.byId(`rupees_tableau_${playerId}_tax_counter`);
      const rupeeNode = dojo.byId(`rupees_tableau_${playerId}`);
      const hasSelectableClass = rupeeNode.classList.contains('pp_selectable');
      if (!taxCounter && !hasSelectableClass) {
        this.toggleSelected(rupeeNode);
      };
      if(!taxCounter) {
        return;
      }
      
      const currentValue = taxCounter ? Number(taxCounter.innerText) : 0;
      const playerMax = this.maxPerPlayer[playerId];
      if (hasSelectableClass && (this.maxNumberToSelect <= this.numberSelected || currentValue >= playerMax)) {
        this.toggleSelected(rupeeNode);
      } else if (!hasSelectableClass && this.maxNumberToSelect > this.numberSelected && currentValue < playerMax) {
        this.toggleSelected(rupeeNode);
      }
    });
  }
}
