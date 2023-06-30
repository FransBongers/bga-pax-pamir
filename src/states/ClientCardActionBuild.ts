class ClientCardActionBuildState implements State {
  private game: PaxPamirGame;
  private cardId: string | null;
  private tempTokens: { location: string; type: 'army' | 'road' }[];
  private maxNumberToPlace: number;
  private playerHasNationBuilding: boolean;
  private isSpecialAbilityInfrastructure: boolean;

  constructor(game: PaxPamirGame, specialAbilityInfrastructure: boolean) {
    this.game = game;
    this.isSpecialAbilityInfrastructure = specialAbilityInfrastructure;
  }

  onEnteringState(props: ClientCardActionStateArgs) {
    this.cardId = props?.cardId ? props.cardId : null;
    this.tempTokens = [];
    const player = this.game.getCurrentPlayer();
    const playerRupees = player.getRupees();
    this.playerHasNationBuilding = player.ownsEventCard({ cardId: ECE_NATION_BUILDING_CARD_ID });
    const multiplier = this.playerHasNationBuilding ? 2 : 1;
    this.maxNumberToPlace = this.isSpecialAbilityInfrastructure ? 1 : Math.min(Math.floor(playerRupees / 2), 3) * multiplier;
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
    // Determine max numner of items player can build based on number of rupees
    // Set regions selectable where player is ruler
    // Let player select roads / armies
    this.updatePageTitle();
    this.setLocationsSelectable();
    this.game.addPrimaryActionButton({
      id: 'done_button',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
    });
    dojo.addClass('done_button', 'disabled');
    if (this.isSpecialAbilityInfrastructure) {
      this.game.addDangerActionButton({
        id: 'skip_btn',
        text: _('Skip'),
        callback: () => this.game.takeAction({ action: 'skipSpecialAbility' }),
      });
    } else {
      this.game.addDangerActionButton({
        id: 'cancel_btn',
        text: _('Cancel'),
        callback: () => this.onCancel(),
      });
    }
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();
    const amount = this.isSpecialAbilityInfrastructure ? 0 :  Math.ceil(this.tempTokens.length / (this.playerHasNationBuilding ? 2 : 1)) * 2;
    this.game.clientUpdatePageTitle({
      text: _('Place x for a cost of ${amount} rupees?'),
      args: {
        amount,
      },
    });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.onConfirm(),
    });
    this.game.addDangerActionButton({
      id: 'cancel_btn',
      text: _('Cancel'),
      callback: () => this.onCancel(),
    });
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

  private onLocationClick({ location }: { location: string }) {
    if (this.maxNumberToPlace - this.tempTokens.length <= 0) {
      return;
    }
    debug('onLocationClick', location);
    const player = this.game.getCurrentPlayer();
    const coalition = player.getLoyalty();

    if (location.endsWith('armies')) {
      const regionId = location.split('_')[1];
      const region = this.game.map.getRegion({ region: regionId });
      region.addTempArmy({ coalition, index: this.tempTokens.length });
      this.tempTokens.push({
        location: regionId,
        type: 'army',
      });
    } else if (location.endsWith('border')) {
      const split = location.split('_');
      const borderId = `${split[1]}_${split[2]}`;
      const border = this.game.map.getBorder({ border: borderId });
      border.addTempRoad({ coalition, index: this.tempTokens.length });
      this.tempTokens.push({
        location: borderId,
        type: 'road',
      });
    }
    dojo.removeClass('done_button', 'disabled');
    this.updatePageTitle();
  }

  private onCancel() {
    this.clearTemporaryTokens();
    this.game.onCancel();
  }

  private onConfirm() {
    debug('handleConfirm');
    if (this.tempTokens.length > 0) {
      this.game.takeAction({
        action: 'build',
        data: { cardId: this.cardId || undefined, locations: JSON.stringify(this.tempTokens) },
      });
      this.clearTemporaryTokens();
    }
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  public clearTemporaryTokens() {
    debug('inside clearTemporaryTokens');
    this.tempTokens.forEach((token, index) => {
      const { location, type } = token;
      if (type === 'army') {
        this.game.map.getRegion({ region: location }).removeTempArmy({ index });
      } else if (type === 'road') {
        this.game.map.getBorder({ border: location }).removeTempRoad({ index });
      }
    });
    this.tempTokens = [];
  }

  private setLocationsSelectable() {
    debug('setRegionsSelectable');

    // Regions
    // const container = document.getElementById(`pp_map_areas`);
    // container.classList.add('pp_selectable');

    REGIONS.forEach((regionId) => {
      const region = this.game.map.getRegion({ region: regionId });
      const ruler = region.getRuler();
      // console.log('region', region, ruler);
      if (ruler !== this.game.getPlayerId()) {
        return;
      }

      const armyLocation = `pp_${regionId}_armies`;
      const element = document.getElementById(armyLocation);
      console.log('element', element);
      if (element) {
        element.classList.add('pp_selectable');
        this.game._connections.push(dojo.connect(element, 'onclick', this, () => this.onLocationClick({ location: armyLocation })));
      }
      region.borders.forEach((borderId: string) => {
        const borderLocation = `pp_${borderId}_border`;
        const element = document.getElementById(borderLocation);
        if (element && !element.classList.contains('pp_selectable')) {
          element.classList.add('pp_selectable');
          this.game._connections.push(dojo.connect(element, 'onclick', this, () => this.onLocationClick({ location: borderLocation })));
        }
      });
    });
  }

  private updatePageTitle() {
    if (this.isSpecialAbilityInfrastructure) {
      this.game.clientUpdatePageTitle({
        text: _('${you} may place one additional block'),
        args: {
          you: '${you}',
        },
      });
    } else {
      this.game.clientUpdatePageTitle({
        text: _('${you} must select regions to place armies and/or roads (up to ${number} remaining)'),
        args: {
          you: '${you}',
          number: this.maxNumberToPlace - this.tempTokens.length,
        },
      });
    }


  }
}
