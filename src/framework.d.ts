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
  addTooltipHtml: ( nodeId: string, html: string, delay?:number ) => void;
  addTooltipHtmlToClass: (cssClass: string, html: string, delay?:number ) => void;
  ajaxcall: (
    url: string,
    parameters: Record<string, unknown>,
    obj_callback: Game,
    callback: (result: unknown) => void,
    callback_anycase?: (result: unknown) => void,
    ajax_method?: string
  ) => void;
  attachToNewParent: (mobile_obj: string | Element, target_obj: string | Element) => void;
  checkAction: (action: string) => boolean;
  format_block: (jstpl: string, args: Record<string, unknown>) => string;
  game_name: string;
  isCurrentPlayerActive: () => boolean;
  isLoadingComplete: boolean;
  inherited(args: any); // TODO: check what this does?
  notifqueue: {
    next_log_id: string;
    setSynchronous: (notifId: string, waitMilliSeconds: number) => void;
  };
  placeOnObject: (mobileObject: string | Element, targetObj: string | Element) => void;
  player_id: string;
  removeActionButtons: () => void;
  restoreServerGameState: () => void;
  scoreCtrl: {
    [playerId: number | string]: Counter;
  };
  setClientState: (newState: string, args: Record<string, unknown>) => void;
  showMessage: (msg: string, type: string) => void;
  slideToObject: (mobile_obj: HTMLElement | string, target_obj: HTMLElement | string, duration?: number, delay?: number) => Animation;
  slideToObjectPos: (mobile_obj: HTMLElement | string, target_obj: HTMLElement | string, target_x: number, target_y: number, duration?: number, delay?: number ) => Animation;
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

type DojoBox = { l: number; t: number; w: number; h: number; };
type DojoPosition = 'replace' | 'first' | 'last' | 'before' | 'after' | 'only' | number;
type CssPosition = 'static'|'absolute'|'fixed'|'relative'|'sticky'|'initial'|'inherit';

/* TODO repace Function by (..params) => void */
interface Dojo {
  addClass: (node: string | HTMLElement, className: string) => void;
  animateProperty: (params: { node: string; properties: any }) => any;
  byId: (nodeId: string) => HTMLElement;
  // https://dojotoolkit.org/reference-guide/1.7/dojo/clone.html
  clone: (something: any) => any;
  connect: Function;
  // https://dojotoolkit.org/reference-guide/1.7/dojo/contentBox.html
  contentBox: (node: HTMLElement) => DojoBox;
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
  // https://dojotoolkit.org/reference-guide/1.7/dojo/marginBox.html
  marginBox: (node: HTMLElement) => DojoBox;
  // https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js#Moving_elements 
  // https://dojotoolkit.org/reference-guide/1.7/dojo/place.html
  place: (html: string, node: string | HTMLElement, pos?: DojoPosition) => void;
  position: (
    obj: HTMLElement,
    includeScroll?: boolean
  ) => { w: number; h: number; x: number; y: number };
  query: (query: string) => any; //HTMLElement[]; with some more functions
  removeClass: (node: string | HTMLElement, className?: string) => void;
  stopEvent: (evt) => void;
  string: {
    pad: (input: string, size: number) => string,
    rep: (input:string, numberOfRepeats: number) => string;
    substitute: (input: string, args: Record<string,any>) => string;
    trim: (input: string) => string;
  };
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
