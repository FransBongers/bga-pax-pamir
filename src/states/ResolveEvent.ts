class ResolveEventState implements State {
  private game: PaxPamirGame;

  constructor(game: PaxPamirGame) {
    this.game = game;
  }

  onEnteringState({ event }: OnEnteringResolveEventArgs) {
    switch (event) {
      case ECE_CONFIDENCE_FAILURE:
        this.game.framework().setClientState<ClientResolveEventStateArgs>(CLIENT_RESOLVE_EVENT_CONFIDENCE_FAILURE, { args: { event } });
        break;
      case ECE_REBUKE:
        this.game.framework().setClientState<ClientResolveEventStateArgs>(CLIENT_RESOLVE_EVENT_REBUKE, { args: { event } });
        break;
      case ECE_RUMOR:
        this.game.framework().setClientState<ClientResolveEventStateArgs>(CLIENT_RESOLVE_EVENT_RUMOR, { args: { event } });
        break;
      default:
        debug('unrecognized event', event);
    }
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

  // private updateInterfaceOtherPlayers({ event }: { event: string }) {
  //   this.game.clearPossible();
  //   let text = '';
  //   let args = {};
  //   switch (event) {
  //     case ECE_CONFIDENCE_FAILURE:
  //       text = _('${actplayer} must discard a card from hand');
  //       args = {
  //         actplayer: '${actplayer}',
  //       };
  //       break;
  //     case ECE_REBUKE:
  //       text = _('${actplayer} must select a region');
  //       args = {
  //         actplayer: '${actplayer}',
  //       };
  //     default:
  //       debug('unrecognized event', event);
  //   }
  //   this.game.clientUpdatePageTitleOtherPlayers({
  //     text,
  //     args,
  //   });
  // }

  // private updateInterfaceInitialStep({ event }: { event: string }) {
  //   this.game.clearPossible();
  //   switch (event) {
  //     case ECE_CONFIDENCE_FAILURE:
  //       this.updateInterfaceConfidenceFailure();
  //       break;
  //     case ECE_REBUKE:
  //       this.updateInterfaceRebuke();
  //     default:
  //       debug('unrecognized event', event);
  //   }
  // }

  // private updateInterfaceConfidenceFailure() {
  //   // this.game.clearPossible();
  //   this.game.clientUpdatePageTitle({
  //     text: '${you} must discard a card from hand',
  //     args: {
  //       you: '${you}',
  //     },
  //   });
  //   this.game.addPrimaryActionButton({
  //     id: 'confirm_btn',
  //     text: _('Confirm'),
  //     callback: () => this.handleDiscardConfirm(),
  //   });
  //   dojo.addClass('confirm_btn', 'disabled');
  //   this.game.setHandCardsSelectable({
  //     callback: ({ cardId }: { cardId: string }) => this.handleDiscardSelect({ cardId }),
  //   });
  // }

  // private updateInterfaceRebuke() {
  //   // this.game.clearPossible();
  //   this.game.clientUpdatePageTitle({
  //     text: '${you} must select a region',
  //     args: {
  //       you: '${you}',
  //     },
  //   });

  //   this.game.map.setSelectable();

  //   REGIONS.forEach((regionId) => {
  //     const element = document.getElementById(`pp_region_${regionId}`);
  //     if (element) {
  //       element.classList.add('pp_selectable');
  //       this.game._connections.push(
  //         dojo.connect(element, 'onclick', this, () => this.updateInterfaceRebukeRegionSelected({regionId}))
  //       );
  //     }
  //   });
  // }

  // private updateInterfaceRebukeRegionSelected({regionId}: {regionId: string}) {
  //   this.game.clearPossible();
  //   this.choices = { regionId };
  //   // dojo.removeClass('confirm_btn', 'disabled');
  //   this.game.map.setSelectable();
  //   const element = document.getElementById(`pp_region_${regionId}`);
  //   if (element) {
  //     element.classList.add(PP_SELECTED);
  //   }
  //   this.game.clientUpdatePageTitle({
  //     text: 'Remove all tribes and armies from ${regionName}?',
  //     args: {
  //       regionName: this.game.gamedatas.staticData.regions[regionId].name,
  //     },
  //   });
  //   this.game.addPrimaryActionButton({
  //     id: 'confirm_btn',
  //     text: _('Confirm'),
  //     callback: () =>
  //       this.game.takeAction({
  //         action: 'eventChoice',
  //         data: {
  //           data: JSON.stringify(this.choices),
  //         },
  //       }),
  //   });
  //   this.game.addCancelButton();
  // }

  //  .##.....##.########.####.##.......####.########.##....##
  //  .##.....##....##.....##..##........##.....##.....##..##.
  //  .##.....##....##.....##..##........##.....##......####..
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  .##.....##....##.....##..##........##.....##.......##...
  //  ..#######.....##....####.########.####....##.......##...

  // private handleDiscardConfirm() {
  //   const nodes = dojo.query('.pp_selected');
  //   if (nodes.length === 1) {
  //     const cardId = nodes[0].id;
  //     // let cards = '';
  //     // nodes.forEach((node: HTMLElement, index) => {
  //     //   cards += ' ' + node.id;
  //     // }, this);
  //     this.game.takeAction({
  //       action: 'eventChoice',
  //       data: {
  //         data: JSON.stringify({
  //           cardId,
  //         }),
  //       },
  //     });
  //   }
  // }

  // handleDiscardSelect({ cardId }: { cardId: string }) {
  //   dojo.query(`.pp_card_in_zone.pp_${cardId}`).toggleClass('pp_selected').toggleClass('pp_selectable'); //.toggleClass('pp_discard');
  //   const numberSelected = dojo.query('.pp_selected').length;
  //   if (numberSelected === 1) {
  //     dojo.removeClass('confirm_btn', 'disabled');
  //   } else {
  //     dojo.addClass('confirm_btn', 'disabled');
  //   }
  // }
}
