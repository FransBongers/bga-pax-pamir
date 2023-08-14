interface ModalConfig {
  container?: string;
  class?: string;
  autoShow?: boolean;
  modalTpl?: string;
  closeIcon?: string | null; // Set to null if you don't want an icon
  closeIconTpl?: string;
  closeAction?: 'destroy' | 'hide'; // 'destroy' or 'hide', it's used both for close icon and click on underlay
  closeWhenClickOnUnderlay?: boolean;
  helpIcon?: string | null; // Default icon for BGA was 'fa-question-circle-o',
  helpLink?: string;
  helpIconTpl?: string;
  title?: string | null; // Set to null if you don't want a title
  titleTpl?: string;
  contentsTpl?: string;
  contents?: string;
  verticalAlign?: string;
  animationDuration?: number;
  fadeIn?: boolean;
  fadeOut?: boolean;
  openAnimation?: boolean;
  openAnimationTarget?: string | null;
  openAnimationDelta?: number;
  onShow?: () => void | null;
  onHide?: () => void | null;
  statusElt?: string | null; // If specified, will add/remove "opened" class on this element
  scale?: number;
  breakpoint?: number | null; // auto resize if < breakpoint using scale
}