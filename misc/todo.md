# TODO

## Implementation

### General

### Bugs

### Card abilities


### Dominance Checks

### Improvements
- Only highlight card actions that are possible based on rupees, ruled regions etc?
- For bribes: should ruler be able to demand higher amount than briber has available even though briber can never accept?
- For discard: instead of moving card div change discard background to show certain card and remove the card div?
- Reduce size of notifications as much as possible (ie remove all unnecessary data like card info)

## Bugs
- Check why undo after last loyalty pick during setup results in crossed log
- Check events that are discarded during dominance check and revert effect in stats


## To check
- Check maximum number of rupees: 5 player start + all leveraged cards + any events / abilities?
- Check totals in player panels. Seem to be off for cylinders
- do not use getCurrentPlayerId (/ active player?) in args functions https://en.doc.boardgamearena.com/Your_game_state_machine:_states.inc.php#args
- no animation when there is a bribe of 0 rupees. Change text from 0 rupee(s) to no bribe?
- When betraying a card it's moved to discard pile first before asking for prize. Keep it in separate zone next to discard before player makes choice? (since other cards can be discarded)


### UI
- Matching colors for selectable / selected

### Rules



### Ideas
- Slot events cards under 'player tableau' of player who purchased
- Add counters to roads / armies to show the number in a region (in case total numner exceeds a certain amount)

### Montage commands
tokens
montage -colorspace sRGB *.webp -tile 10 -background transparent -geometry 160x+2+2 ../tokens.webp
cards
montage -colorspace sRGB *.webp -tile 10 -background transparent -geometry 400x+0+0 ../cards.webp



/**
 * Event card effects & cardIds
 */
ECE_BACKING_OF_PERSIAN_ARISTOCRACY // card_113
ECE_CONFIDENCE_FAILURE // card_114
ECE_CONFLICT_FATIGUE // card_109
ECE_COURTLY_MANNERS // card_107
ECE_DISREGARD_FOR_CUSTOMS // card_107
ECE_DOMINANCE_CHECK
ECE_EMBARRASSEMENT_OF_RICHES // card_106
ECE_FAILURE_TO_IMPRESS // card_108
ECE_INTELLIGENCE_SUIT // card_115
ECE_KOH_I_NOOR_RECOVERED // card_106
ECE_MILITARY_SUIT // card_105
ECE_NATION_BUILDING // card_112
ECE_NATIONALISM // card_110
ECE_NEW_TACTICS // card_105
ECE_NO_EFFECT // card_111
ECE_OTHER_PERSUASIVE_METHODS // card_114
ECE_PASHTUNWALI_VALUES // card_115
ECE_POLITICAL_SUIT // card_116
ECE_PUBLIC_WITHDRAWAL // card_111
ECE_REBUKE // card_116
ECE_RIOTS_IN_HERAT // card_110
ECE_RIOTS_IN_KABUL // card_112
ECE_RIOTS_IN_PERSIA // card_113
ECE_RIOTS_IN_PUNJAB // card_109
ECE_RUMOR // card_108

/**
 * Special abilities
 */
SA_INDISPENSABLE_ADVISORS // card_1
SA_INSURRESCTION // card_3
SA_CLAIM_OF_ANCIENT_LINEAGE // card_5
SA_BODYGUARDS // card_15 card_83
SA_CITADEL_KABUL // card_17
SA_CITADEL_TRANSCASPIA // card_97
SA_STRANGE_BEDFELLOWS // card_21
SA_CIVIL_SERVICE_REFORMS // card_24
SA_SAFE_HOUSE // card_41 card_72
SA_CHARISMATIC_COURTIERS // card_42
SA_BLACKMAIL_HERAT // card_54
SA_BLACKMAIL_KANDAHAR // card_43
SA_INDIAN_SUPPLIES // card_51
SA_WELL_CONNECTED // card_56
SA_HERAT_INFLUENCE // card_66
SA_PERSIAN_INFLUENCE // card_68
SA_RUSSIAN_INFLUENCE // card_70
SA_INFRASTRUCTURE // card_78
SA_SAVVY_OPERATOR // card_91
SA_IRREGULARS // card_99