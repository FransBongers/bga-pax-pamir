interface PaxPamirZoneItem {
  id: string;
  weight?: number;
}

interface PaxPamirZoneConfig {
  animationManager: AnimationManager;
  itemHeight: number;
  itemWidth: number;
  itemGap?: number;
  containerDiv: string;
}