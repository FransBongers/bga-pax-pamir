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
      case ECE_OTHER_PERSUASIVE_METHODS:
        this.game.framework().setClientState<ClientResolveEventStateArgs>(CLIENT_RESOLVE_EVENT_OTHER_PERSUASIVE_METHODS, { args: { event } });
        break;
      case ECE_PASHTUNWALI_VALUES:
        this.game.framework().setClientState<ClientResolveEventStateArgs>(CLIENT_RESOLVE_EVENT_PASHTUNWALI_VALUES, { args: { event } });
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
}
