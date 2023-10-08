class ClientCardActionBuildState implements State {
  private game: PaxPamirGame;
  private bribe: BribeArgs;
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
    this.bribe = props?.bribe;
    this.tempTokens = [];
    this.setMaxNumberToPlace();
    console.log('maxNumberToPlace', this.maxNumberToPlace);
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
    this.updateActionButtons();
  }

  private createTokenLog() {
    let log = '';
    const args = {};
    const coalition = this.game.getCurrentPlayer().getLoyalty();
    this.tempTokens.forEach((tempToken, index) => {
      const key = `tkn_${tempToken.type}_${index}`;
      args[key] = `${coalition}_${tempToken.type}`;
      log += '${' + key + '}';
    });
    return {
      log,
      args,
    };
  }

  private updateInterfaceConfirm() {
    this.game.clearPossible();
    const amount = this.isSpecialAbilityInfrastructure ? 0 : Math.ceil(this.tempTokens.length / (this.playerHasNationBuilding ? 2 : 1)) * 2;
    this.game.clientUpdatePageTitle({
      text: _('Place ${tokens} for a cost of ${amount} ${tkn_rupee} ?'),
      args: {
        amount,
        tokens: this.createTokenLog(),
        tkn_rupee: _('rupee(s)'),
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

  private onLocationClick({ id, type }: { id: string; type: 'army' | 'road' }) {
    if (this.maxNumberToPlace - this.tempTokens.length <= 0) {
      return;
    }
    debug('onLocationClick', location);
    const player = this.game.getCurrentPlayer();
    const coalition = player.getLoyalty();

    if (type === 'army') {
      // const regionId = location.split('_')[1];
      const region = this.game.map.getRegion({ region: id });
      region.addTempArmy({ coalition, index: this.tempTokens.length });
      this.tempTokens.push({
        location: id,
        type: 'army',
      });
    } else if (type === 'road') {
      // const split = location.split('_');
      // const borderId = `${split[1]}_${split[2]}`;
      const border = this.game.map.getBorder({ border: id });
      border.addTempRoad({ coalition, index: this.tempTokens.length });
      this.tempTokens.push({
        location: id,
        type: 'road',
      });
    }
    console.log('tempTokens', this.tempTokens);
    this.updatePageTitle();
    this.updateActionButtons();
  }

  private onCancel() {
    this.clearTemporaryTokens();
    this.game.onCancel();
  }

  private onConfirm() {
    debug('handleConfirm');
    if (this.tempTokens.length > 0) {
      this.game.takeAction({
        action: this.isSpecialAbilityInfrastructure ? 'specialAbilityInfrastructure' : 'build',
        data: { cardId: this.cardId || undefined, locations: JSON.stringify(this.tempTokens), bribeAmount: this.bribe?.amount ?? null },
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

  private setMaxNumberToPlace() {
    const player = this.game.getCurrentPlayer();
    if (this.isSpecialAbilityInfrastructure) {
      this.maxNumberToPlace = 1;
      return;
    }

    const playerRupees = player.getRupees();
    this.playerHasNationBuilding = player.ownsEventCard({ cardId: ECE_NATION_BUILDING_CARD_ID });
    const multiplier = this.playerHasNationBuilding ? 2 : 1;
    console.log('multiplier', multiplier);
    const bribe = this.bribe?.amount || 0;
    const maxAffordable = Math.floor((playerRupees - bribe) / 2);
    this.maxNumberToPlace = Math.min(maxAffordable, 3) * multiplier;
  }

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

  public getRegionsToBuild(): string[] {
    return REGIONS.filter((regionId) => {
      const region = this.game.map.getRegion({ region: regionId });
      const ruler = region.getRuler();
      return ruler === this.game.getPlayerId();
    });
  }

  private setLocationsSelectable() {
    debug('setRegionsSelectable');
    const container = document.getElementById(`pp_map_areas_borders_regions`);
    container.classList.add('pp_selectable');
    this.getRegionsToBuild().forEach((regionId) => {
      const region = this.game.map.getRegion({ region: regionId });

      const armyLocation = `pp_${regionId}_armies_select`;
      const element = document.getElementById(armyLocation);

      if (element) {
        element.classList.add('pp_selectable');
        this.game._connections.push(dojo.connect(element, 'onclick', this, () => this.onLocationClick({ id: regionId, type: 'army' })));
      }
      region.borders.forEach((borderId: string) => {
        const borderLocation = `pp_${borderId}_border_select`;
        const element = document.getElementById(borderLocation);
        if (element && !element.classList.contains('pp_selectable')) {
          element.classList.add('pp_selectable');
          this.game._connections.push(dojo.connect(element, 'onclick', this, () => this.onLocationClick({ id: borderId, type: 'road' })));
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
        text: _('${you} must select regions to place ${tkn_army} and/or ${tkn_road} (up to ${number} remaining)'),
        args: {
          you: '${you}',
          number: this.maxNumberToPlace - this.tempTokens.length,
          tkn_army: `${this.game.getCurrentPlayer().getLoyalty()}_army`,
          tkn_road: `${this.game.getCurrentPlayer().getLoyalty()}_road`,
        },
      });
    }
  }

  private updateActionButtons() {
    this.game.framework().removeActionButtons();
    dojo.empty('customActions');
    this.game.addPrimaryActionButton({
      id: 'done_button',
      text: _('Done'),
      callback: () => this.updateInterfaceConfirm(),
    });
    if (this.tempTokens.length === 0) {
      dojo.addClass('done_button', 'disabled');
    }
    if (this.isSpecialAbilityInfrastructure) {
      this.game.addDangerActionButton({
        id: 'skip_btn',
        text: _('Skip'),
        callback: () => this.game.takeAction({ action: 'specialAbilityInfrastructure', data: { skip: true } }),
      });
    } else if (this.bribe?.negotiated && this.tempTokens.length === 0) {
      this.game.addDangerActionButton({
        id: 'cancel_bribe_btn',
        text: _('Cancel bribe'),
        callback: () => {
          this.clearTemporaryTokens();
          this.game.takeAction({
            action: 'cancelBribe',
          });
        },
      });
    } else {
      this.game.addDangerActionButton({
        id: 'cancel_btn',
        text: _('Cancel'),
        callback: () => this.onCancel(),
      });
    }
  }
}
