# TODO

## Implementation

### General
- Overthrow rule: link between political cards and ruled regions
- Check states file

### Bugs
- Check embarassment of riches discard event (or discard event in general)

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
- Multiple rupees on card when moving cards in the market


## To check
- Check maximum number of rupees: 5 player start + all leveraged cards + any events / abilities?
- Check totals in player panels. Seem to be off for cylinders
- do not use getCurrentPlayerId (/ active player?) in args functions https://en.doc.boardgamearena.com/Your_game_state_machine:_states.inc.php#args
- no animation when there is a bribe of 0 rupees. Change text from 0 rupee(s) to no bribe?
- When betraying a card it's moved to discard pile first before asking for prize. Keep it in separate zone next to discard before player makes choice? (since other cards can be discarded)

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

### Montage commands
tokens
montage -colorspace sRGB *.webp -tile 10 -background transparent -geometry 160x+2+2 ../tokens.webp
cards
montage -colorspace sRGB *.webp -tile 10 -background transparent -geometry 400x+0+0 ../cards.webp