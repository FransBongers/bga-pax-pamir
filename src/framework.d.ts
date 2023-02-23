/**
 * Framework interfaces
 */

interface Game {
  gamedatas: any;
  setup: (gamedatas: any) => void;
  onEnteringState: (stateName: string, args: any) => void;
  onLeavingState: (stateName: string) => void;
  onUpdateActionButtons: (stateName: string, args: any) => void;
  // setupNotifications: () => void;
  //format_string_recursive: (log: string, args: any) => void;
  framework: () => Framework; // Function just to have TS casting in one place, should return this
}

// TODO (Frans): check if thre is a better way to define these so we don't need to cast.
interface Framework {
  addActionButton: (
    id: string,
    label: string,
    method: string | Function,
    destination?: string,
    blinking?: boolean,
    color?: string
  ) => void;
  ajaxcall: (
    url: string,
    parameters: Record<string, unknown>,
    obj_callback: Game,
    callback: (result: unknown) => void,
    callback_anycase?: (result: unknown) => void,
    ajax_method?: string
  ) => void;
  attachToNewParent: (mobile_obj: string | Element, target_obj: string | Element) => void
  checkAction: (action: string) => boolean;
  format_block: (jstpl: string, args: Record<string, unknown>) => string;
  game_name: string;
  isCurrentPlayerActive: () => boolean;
  notifqueue: {
    setSynchronous: (notifId: string, waitMilliSeconds: number) => void;
  };
  placeOnObject: (mobileObject: string | Element, targetObj: string | Element) => void;
  player_id: string;
  removeActionButtons: () => void;
  restoreServerGameState: () => void;
  scoreCtrl: {
    [playerId: number | string]: {
      toValue: (newScore: number) => void;
    }
  };
  setClientState: (newState: string, args: Record<string, unknown>) => void;
  showMessage: (msg: string, type: string) => void;
  slideToObject: any;
  updatePageTitle: () => void;
}

interface Notif<T> {
  args: T;
  log: string;
  move_id: number;
  table_id: string;
  time: number;
  type: string;
  uid: string;
}

/* TODO repace Function by (..params) => void */
interface Dojo {
  addClass: (node: string | HTMLElement, className: string) => void;
  animateProperty: (params: { node: string; properties: any }) => any;
  connect: Function;
  destroy: (node: string | HTMLElement) => void;
  disconnect: Function;
  empty: (node: string | HTMLElement) => void;
  fadeIn: Function;
  forEach: Function;
  fx: {
    slideTo: (params: {
      node: HTMLElement;
      top: number;
      left: number;
      delay: number;
      duration: number;
      unit: string;
    }) => any;
  };
  hasClass: (node: string | HTMLElement, className: string) => boolean;
  hitch: Function;
  map: Function;
  marginBox: Function;
  place: (html: string, node: string | HTMLElement, action?: string) => void;
  position: (
    obj: HTMLElement,
    includeScroll?: boolean
  ) => { w: number; h: number; x: number; y: number };
  query: (query: string) => any; //HTMLElement[]; with some more functions
  removeClass: (node: string | HTMLElement, className?: string) => void;
  stopEvent: (evt) => void;
  string: any;
  style: Function;
  subscribe: Function;
  toggleClass: (
    node: string | HTMLElement,
    className: string,
    forceValue?: boolean
  ) => void;
  trim: Function;
  unsubscribe: Function;
}

// TODO (Frans) check typing for different types.
// Below is for type activeplayer
// as in gamedates.gamestate
type ActiveGamestate<T> = {
  active_player: string;
  args: T;
  description: string;
  descriptionmyturn: string;
  id: string;
  name: string;
  possibleactions: string[];
  reflexion: unknown;
  transitions: Record<string, number>;
  type: string;
  updateGameProgression: number;
}

// as in gamedates.gamestates
interface Gamestate {
  action?: string;
  description?: string;
  descriptionmyturn?: string;
  name: string;
  possibleactions?: string[];
  transitions: Record<string, number>;
  type: 'activeplayer'
  updateGameProgression?: boolean;
}

interface Gamedatas {
  gamestate: ActiveGamestate<unknown>;
  gamestates: Record<number, Gamestate>; // Or Record<string, Gamestate>?

}

interface BgaPlayer {
  beginner: boolean;
  color: string;
  color_back: any | null;
  eliminated: number;
  id: string;
  is_ai: string;
  name: string;
  score: string;
  zombie: number;
}
