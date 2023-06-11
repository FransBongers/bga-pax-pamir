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
- Battle
- Betray
- Build
- Gift
- Tax
- Move
- Pay for hostage cards

### Event cards purchase
- card 112
- card 114

### Dominance Checks
- Perform check when 2nd dominance check enters te market
- Remove active events after check is resolved

### Improvements
- Only highlight card actions that are possible based on rupees, ruled regions etc?
- For bribes: should ruler be able to demand higher amount than briber has available even though briber can never accept?
- For discard: instead of moving card div change discard background to show certain card and remove the card div?

## Bugs
- Return all coalition blocks from map after succesfull dominance check


## To check
- Check maximum number of rupees: 5 player start + all leveraged cards + any events / abilities?
- Check totals in player panels. Seem to be off for cylinders

### UI
- Matching colors for selectable / selected

### Rules
- What is the order for declaring card actions / holding cards hostage. Does a player declare he wants to use a card action from a card or needs to mention the specific card action?
- What is the formal order for betray action, leverage and loyalty change
  - Discard betrayed card, handle leverage (ie return rupees / discard additional cards)
  - Handle loyalty change for taking prize, discard patriots, handle leverage (return rupees / more cards)


### Ideas
- Slot events cards under 'player tableau' of player who purchased
- Add counters to roads / armies to show the number in a region (in case total numner exceeds a certain amount)