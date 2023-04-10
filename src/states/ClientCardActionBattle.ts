class ClientCardActionBattleState implements State {
  private game: PaxPamirGame;
  private cardId: string;
  private numberSelected: number;
  private maxNumberToSelect: number;
  private location: string;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ cardId }: ClientCardActionStateArgs) {
    this.cardId = cardId;
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
    this.game.clientUpdatePageTitle({
      text: _('${you} must select a region or court card to start a battle in'),
      args: {
        you: '${you}',
      },
    });
    this.game.addCancelButton();
    this.setLocationsSelectable();
  }

  private updateInterfaceSelectPiecesInRegion({ regionId }: { regionId: string }) {
    this.game.clearPossible();
    this.location = regionId;
    const region = this.game.map.getRegion({ region: regionId });
    const coalitionId = this.game.localState.activePlayer.loyalty;
    const enemyPieces = region.getEnemyPieces({ coalitionId });
    const coalitionArmies = region.getCoalitionArmies({ coalitionId });
    const cardInfo = this.game.getCardInfo({ cardId: this.cardId }) as CourtCard;
    const cardRank = cardInfo.rank;
    this.maxNumberToSelect = Math.min(cardRank, coalitionArmies.length);
    this.numberSelected = 0;
    debug('enemyPieces', enemyPieces);

    this.updatePageTitle();
    this.setPiecesSelectable({ pieces: enemyPieces });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.confirmBattle(),
    });
    dojo.addClass('confirm_btn', 'disabled');
    this.game.addCancelButton();
  }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  confirmBattle() {
    debug('confirmBattle');
    const pieces: string[] = [];
    dojo.query('.pp_selected').forEach((node: HTMLElement) => pieces.push(node.id));
    debug('pieces', pieces);
    const numberOfPieces = pieces.length;
    if (numberOfPieces <= this.maxNumberToSelect && numberOfPieces > 0) {
      this.game.takeAction({action: 'battle', data: {
        removedPieces: pieces.join(' '),
        location: this.location,
        cardId: this.cardId,
      }})
    }
  }

  /**
   * For all court cards check if there are own and enemy spies
   */
  getCourtCardBattleSites() {
    const battleSites: string[] = [];
    this.game.playerManager.getPlayerIds().forEach((playerId) => {
      const courtCards = this.game.playerManager.getPlayer({ playerId }).getCourtZone().getAllItems();

      courtCards.forEach((cardId: string) => {
        const spyZone = this.game.spies[cardId];
        if (!spyZone) {
          return false;
        }

        const cylinderIds = spyZone.getAllItems();
        const hasEnemySpies = cylinderIds.some((cylinderId: string) => Number(cylinderId.split('_')[1]) !== this.game.getPlayerId());
        const hasOwnSpies = cylinderIds.some((cylinderId: string) => Number(cylinderId.split('_')[1]) === this.game.getPlayerId());

        if (hasEnemySpies && hasOwnSpies) {
          battleSites.push(cardId);
        }
      });
    });
    return battleSites;
  }

  handlePieceClicked({ pieceId }: { pieceId: string }) {
    debug('Piece clicked', pieceId);
    dojo.query(`#${pieceId}`).toggleClass('pp_selected').toggleClass('pp_selectable');
    this.numberSelected = dojo.query('.pp_selected').length;
    if (this.numberSelected > 0 && this.numberSelected <= this.maxNumberToSelect) {
      dojo.removeClass('confirm_btn', 'disabled');
    } else {
      dojo.addClass('confirm_btn', 'disabled');
    }
    this.updatePageTitle();
  }

  setPiecesSelectable({ pieces }: { pieces: string[] }) {
    pieces.forEach((pieceId: string) => {
      dojo.query(`#${pieceId}`).forEach((node: HTMLElement, index: number) => {
        // const cardId = 'card_' + node.id.split('_')[1];
        // console.log('cardId in courtcardselect', cardId);
        dojo.addClass(node, 'pp_selectable');
        this.game._connections.push(dojo.connect(node, 'onclick', this, () => this.handlePieceClicked({ pieceId })));
      });
    });
  }

  setLocationsSelectable() {
    debug('setLocationsSelectable');

    // Regions
    const container = document.getElementById(`pp_map_areas`);
    container.classList.add('pp_selectable');

    REGIONS.forEach((regionId) => {
      const region = this.game.map.getRegion({ region: regionId });
      const coalitionId = this.game.localState.activePlayer.loyalty;
      const enemyPieces = region.getEnemyPieces({ coalitionId });
      const coalitionArmies = region.getCoalitionArmies({ coalitionId });

      if (enemyPieces.length === 0 || coalitionArmies.length === 0) {
        return;
      }

      const element = document.getElementById(`pp_region_${regionId}`);
      if (element) {
        element.classList.add('pp_selectable');
        this.game._connections.push(dojo.connect(element, 'onclick', this, () => this.updateInterfaceSelectPiecesInRegion({ regionId })));
      }
    });

    // Court cards
    const courtBattleSites = this.getCourtCardBattleSites();
    courtBattleSites.forEach((cardId: string) => {
      dojo.query(`#${cardId}`).forEach((node: HTMLElement, index: number) => {
        dojo.addClass(node, 'pp_selectable');
        this.game._connections.push(dojo.connect(node, 'onclick', this, () => console.log('cardId', cardId)));
      });
    });
  }

  updatePageTitle() {
    this.game.clientUpdatePageTitle({
      text: _('${you} may select tribes, roads or armies to remove') + _(' (${remaining} remaining)'),
      args: {
        you: '${you}',
        number: this.maxNumberToSelect,
        remaining: this.maxNumberToSelect - this.numberSelected,
      },
    });
  }
}
