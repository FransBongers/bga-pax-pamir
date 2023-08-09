interface PaxPamirZoneConfig {
  animationManager: AnimationManager;
  itemHeight: number;
  itemWidth: number;
  itemGap?: number;
  containerId: string;
  pattern?: 'custom' | 'ellipticalFit' |  'grid' | 'horizontalFit' | 'verticalFit';
  customPattern?: (props: PPZoneItemToCoordsProps) => OriginalZoneItemToCoordsResult;
}

interface PaxPamirZoneItem {
  id: string;
  weight?: number;
}

interface PaxPamirZonePlaceItem {
  id: string;
  weight?: number;
  element: string;
  from?: string;
  zIndex?: number;
  duration?: number;
}

interface PaxPamirZoneSetupItem {
  id: string;
  weight?: number;
  element: string;
  zIndex?: number;
}

interface PaxPamirZoneRemoveTo {
  id: string;
  to: string;
  destroy?: boolean;
}

interface PPZoneItemToCoordsProps {
  index: number;
  containerWidth: number;
  containerHeight: number;
  itemCount: number;
}

interface PPZoneItemToCoordsResult {
  top: string; // px
  left: string; // px
  containerHeight?: number;

}

interface OriginalZoneItemToCoordsResult {
  x: number; // left ?
  y: number; // top ?
  w: number; // width?
  h: number; // height?
}
