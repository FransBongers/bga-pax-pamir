# TODO

## Implementation

### General
- Event cards
- Special abilities
- Loyualty change (discard everything including prizes / gifts)
- Select tokens when supply is empty
- End of game
- Instability rule: resolve dominance check when two are in the market
- Overthrow rule: linnk between political cards and ruled regions
- Check states file

### Card Actions
- Pay for hostage cards

### Event cards purchase
- card_21 / SA_STRANGE_BEDFELLOWS
- card_24 / SA_CIVIL_SERVICE_REFORM
- card_41 card_72 / SA_SAFE_HOUSE
- card_42 / SA_CHARISMATIC_COURTIERS -> ignore bribes

- card_51 / SA_INDIAN_SUPPLIES

- card_56 / SA_WELL_CONNECTED

- card_78 / SA_INFRASTRUCTURE



### Card abilities

### Dominance Checks
- Perform check when 2nd dominance check enters te market
- Remove active events after check is resolved
- Check returning of coalition blocks to 'top' of supply

### Improvements
- Only highlight card actions that are possible based on rupees, ruled regions etc?
- For bribes: should ruler be able to demand higher amount than briber has available even though briber can never accept?
- For discard: instead of moving card div change discard background to show certain card and remove the card div?
- Reduce size of notifications as much as possible (ie remove all unnecessary data like card info)

## Bugs
- Return all coalition blocks from map after succesfull dominance check


## To check
- Check maximum number of rupees: 5 player start + all leveraged cards + any events / abilities?
- Check totals in player panels. Seem to be off for cylinders
- do not use getCurrentPlayerId (/ active player?) in args functions https://en.doc.boardgamearena.com/Your_game_state_machine:_states.inc.php#args

### UI
- Matching colors for selectable / selected

### Rules
- What is the order for declaring card actions / holding cards hostage. Does a player declare he wants to use a card action from a card or needs to mention the specific card action?
- What is the formal order for betray action, leverage and loyalty change
  - Discard betrayed card, handle leverage (ie return rupees / discard additional cards)
  - Handle loyalty change for taking prize, discard patriots, handle leverage (return rupees / more cards)
- Nation building, is player required to build a multiple of 2? Does player need to place per 2 blocks at same location?


### Ideas
- Slot events cards under 'player tableau' of player who purchased
- Add counters to roads / armies to show the number in a region (in case total numner exceeds a certain amount)