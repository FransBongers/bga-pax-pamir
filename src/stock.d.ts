interface StockItems {
    id: string;
    type: number;
    loc?: string;
}

interface StockItemType {
    weight: number;
    image: string;
    image_position: number;
}

// interface Stock {
//     items: StockItems[];
//     item_type: { [cardUniqueId: number]: StockItemType };
//     selectionClass: string;
//     container_div: HTMLDivElement;

//     create: (game: Game, $div: any, cardwidth: number, cardheight: number) => void;
//     setSelectionMode: (selectionMode: number) => void;            
//     centerItems: boolean;
//     image_items_per_row: number;
//     updateDisplay: (from?: string) => void;
//     setSelectionAppearance: (appearance: string) => void;            
//     onItemCreate: ($itemDiv: any, itemType, itemDivId: string) => void; 
//     addToStock: (cardUniqueId: number) => void;
//     addToStockWithId: (cardUniqueId: number, cardId: string, from?: string) => void;
//     addItemType: (cardUniqueId: number, cardWeight: number, cardsurl: string, imagePosition: number) => void;	
//     getSelectedItems: () => StockItems[];
//     unselectAll: () => void;
//     removeAll: () => void;
//     removeFromStockById: (id: string, to?: string) => void;
//     removeAllTo: (to: string) => void;
//     unselectItem: (id: string) => void;
//     setOverlap: (horizontal_percent: number, vertical_percent: number) => void;
//     getAllItems: () => StockItems[];
//     changeItemsWeight(newWeights: {[cardType: number]: number}): void;
// }

// TODO (Frans): check if above is interface of custom Stock component of incomplete default Stock component
interface Stock {
    // items: StockItems[];
    // item_type: { [cardUniqueId: number]: StockItemType };
    // selectionClass: string;
    // container_div: HTMLDivElement;

    create: (game: Game, $div: any, cardwidth: number, cardheight: number) => void;
    extraClasses: string;
    setSelectionMode: (selectionMode: number) => void;            
    // centerItems: boolean;
    image_items_per_row: number;
    item_margin: number;
    jstpl_stock_item: string;
    updateDisplay: (from?: string) => void;
    // setSelectionAppearance: (appearance: string) => void;            
    onItemCreate: ($itemDiv: any, itemType, itemDivId: string) => void; 
    // addToStock: (cardUniqueId: number) => void;
    addToStockWithId: (cardUniqueId: number | string, cardId: string, from?: string) => void;
    addItemType: (cardUniqueId: number | string, cardWeight: number, cardsurl: string, imagePosition: number) => void;	
    // getSelectedItems: () => StockItems[];
    // unselectAll: () => void;
    // removeAll: () => void;
    removeFromStockById: (id: string, to?: string) => void;
    // removeAllTo: (to: string) => void;
    // unselectItem: (id: string) => void;
    // setOverlap: (horizontal_percent: number, vertical_percent: number) => void;
    // getAllItems: () => StockItems[];
    changeItemsWeight(newWeights: {[cardType: number | string]: number}): void;
    getItemDivId(id: string): string;
}