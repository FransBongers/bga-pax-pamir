class ClientCardActionBattleState implements State {
  private game: PaxPamirGame;
  private bribe: BribeArgs;
  private cardId: string;
  private numberSelected: number;
  private maxNumberToSelect: number;
  private location: string;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ cardId, bribe }: ClientCardActionStateArgs) {
    this.bribe = bribe;
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
    if (this.bribe?.negotiated) {
      this.game.addDangerActionButton({
        id: 'cancel_bribe_btn',
        text: _('Cancel bribe'),
        callback: () =>
          this.game.takeAction({
            action: 'cancelBribe',
          }),
      });
    } else {
      this.game.addCancelButton();
    }
    this.setLocationsSelectable();
  }

  private updateInterfaceSelectPiecesInRegion({ regionId }: { regionId: string }) {
    this.game.clearPossible();
    this.location = regionId;

    const region = this.game.map.getRegion({ region: regionId });
    const coalitionId = this.game.getCurrentPlayer().getLoyalty();

    const enemyPieces = region.getEnemyPieces({ coalitionId }).filter((pieceId) => this.checkForCitadel({ pieceId, region: regionId }));
    debug('enemyPieces', enemyPieces);
    const cardInfo = this.game.getCardInfo({ cardId: this.cardId }) as CourtCard;
    const cardRank = cardInfo.rank;

    this.maxNumberToSelect = Math.min(cardRank, this.getNumberOfFriendlyArmiesInRegion({ region, coalitionId }));
    this.numberSelected = 0;

    this.updatePageTitle('region');
    this.setPiecesSelectable({ pieces: enemyPieces });
    this.game.addPrimaryActionButton({
      id: 'confirm_btn',
      text: _('Confirm'),
      callback: () => this.confirmBattle(),
    });
    dojo.addClass('confirm_btn', 'disabled');
    this.game.addCancelButton();
  }

  private updateInterfaceSelectPiecesOnCard({ cardId }: { cardId: string }) {
    this.game.clearPossible();
    this.location = cardId;
    const cardInfo = this.game.getCardInfo({ cardId: this.cardId }) as CourtCard;
    const cardRank = cardInfo.rank;
    const { enemy, own } = this.getSpies({ cardId });
    this.maxNumberToSelect = Math.min(cardRank, own.length);
    this.numberSelected = 0;

    this.updatePageTitle('card');
    this.setPiecesSelectable({ pieces: enemy.filter((cylinderId: string) => this.checkForIndispensableAdvisors({ cylinderId })) });
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

  checkForCitadel({ pieceId, region }: { pieceId: string; region: string }): boolean {
    if (!pieceId.startsWith('cylinder')) {
      return true;
    }
    if (
      region === KABUL &&
      this.game.playerManager.getPlayer({ playerId: Number(pieceId.split('_')[1]) }).hasSpecialAbility({ specialAbility: SA_CITADEL_KABUL })
    ) {
      return false;
    }
    if (
      region === TRANSCASPIA &&
      this.game.playerManager
        .getPlayer({ playerId: Number(pieceId.split('_')[1]) })
        .hasSpecialAbility({ specialAbility: SA_CITADEL_TRANSCASPIA })
    ) {
      return false;
    }
    return true;
  }

  checkForIndispensableAdvisors({ cylinderId }: { cylinderId: string }): boolean {
    return !this.game.playerManager
      .getPlayer({ playerId: Number(cylinderId.split('_')[1]) })
      .hasSpecialAbility({ specialAbility: SA_INDISPENSABLE_ADVISORS });
  }

  getNumberOfFriendlyArmiesInRegion({ coalitionId, region }: { coalitionId: string; region: Region }) {
    const coalitionArmies = region.getCoalitionArmies({ coalitionId });
    const player = this.game.getCurrentPlayer();
    const tribesNationalism = player.ownsEventCard({ cardId: ECE_NATIONALISM_CARD_ID })
      ? region.getPlayerTribes({ playerId: player.getPlayerId() }).length
      : 0;

    return coalitionArmies.length + tribesNationalism;
  }

  confirmBattle() {
    debug('confirmBattle');
    const pieces: string[] = [];
    dojo.query('.pp_selected').forEach((node: HTMLElement) => pieces.push(node.id));
    debug('pieces', pieces);
    const numberOfPieces = pieces.length;
    if (numberOfPieces <= this.maxNumberToSelect && numberOfPieces > 0) {
      this.game.takeAction({
        action: 'battle',
        data: {
          removedPieces: pieces.join(' '),
          location: this.location,
          cardId: this.cardId,
          bribeAmount: this.bribe?.amount ?? null,
        },
      });
    }
  }

  /**
   * For all court cards check if there are own and enemy spies
   */
  getCourtCardBattleSites() {
    const battleSites: string[] = [];
    this.game.playerManager.getPlayers().forEach((player: PPPlayer) => {
      const courtCards = player.getCourtCards();

      courtCards.forEach((card: CourtCard) => {
        const { enemy, own } = this.getSpies({ cardId: card.id });

        if (enemy.filter((cylinderId: string) => this.checkForIndispensableAdvisors({ cylinderId })).length > 0 && own.length > 0) {
          battleSites.push(card.id);
        }
      });
    });
    return battleSites;
  }

  getRegionBattleSites() {
    return REGIONS.filter((regionId) => {
      const region = this.game.map.getRegion({ region: regionId });
      const coalitionId = this.game.getCurrentPlayer().getLoyalty();
      const enemyPieces = region.getEnemyPieces({ coalitionId }).filter((pieceId) => this.checkForCitadel({ pieceId, region: regionId }))
      
      if (enemyPieces.length === 0 || this.getNumberOfFriendlyArmiesInRegion({ region, coalitionId }) === 0) {
        return false;
      }
      return true;
    });
  }

  getSpies({ cardId }: { cardId: string }): { enemy: string[]; own: string[] } {
    const spyZone = this.game.spies[cardId];
    if (!spyZone) {
      return {
        enemy: [],
        own: [],
      };
    }
    const cylinderIds = spyZone.getItems();
    return {
      enemy: cylinderIds.filter((cylinderId: string) => Number(cylinderId.split('_')[1]) !== this.game.getPlayerId()),
      own: cylinderIds.filter((cylinderId: string) => Number(cylinderId.split('_')[1]) === this.game.getPlayerId()),
    };
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
    this.updatePageTitle(this.location.startsWith('card') ? 'card' : 'region');
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

    this.getRegionBattleSites().forEach((regionId) => {
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
        this.game._connections.push(
          dojo.connect(node, 'onclick', this, () => {
            console.log('select court card click');
            this.updateInterfaceSelectPiecesOnCard({ cardId });
          })
        );
      });
    });
  }

  updatePageTitle(location: 'region' | 'card') {
    const mainText = {
      card: _('${you} may select spies to remove'),
      region: _('${you} may select tribes, roads or armies to remove'),
    };

    this.game.clientUpdatePageTitle({
      text: mainText[location] + _(' (${remaining} remaining)'),
      args: {
        you: '${you}',
        number: this.maxNumberToSelect,
        remaining: this.maxNumberToSelect - this.numberSelected,
      },
    });
  }
}
