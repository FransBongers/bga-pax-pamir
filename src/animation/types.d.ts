interface SlideConfig {
  duration?: number;
  delay?: number;
  destroy?: boolean;
  attach?: boolean;
  changeParent?: boolean; // Change parent during sliding to avoid zIndex issue
  pos?: null | {x: number; y: number;},
  className?: string,
  from?: string | null,
  clearPos?: boolean;
  beforeBrother?: null;
  to?: null;
  phantom?: boolean;
  phantomStart?: boolean;
  phantomEnd?: boolean;
}