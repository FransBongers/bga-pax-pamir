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
- Points disk not on center of pts

## Bugs
- Check why undo after last loyalty pick during setup results in crossed log
- Check zIndex of tokens on the board
- purchasing cards when suit is military => first rupee appears instantly, only 2nd is animated
- public withdrawal => rupees should be removed immediately

- when events that reduce influence are already active, new influence should also be ignored 
- Undo should not be possible when nothing to undo


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


From error logs:
http://boardgamearena.com/2/paxpamir/paxpamir/specialAbilityPlaceSpyStartOfTurn.html?cardId=card_64&lock=dae483c0-0aa6-47f5-8d88-43bb8801011e&table=404548677&noerrortracking=true&dojo.preventCache=1691564403457
09/08 16:48:36 [error] [T405531929] [207.201.216.62] [91571818/joeklein9] Unexpected exception: Class Pieces: getMany, some pieces have not been found ![null]
#0 /var/tournoi/release/games/paxpamir/230728-2300/modules/php/Helpers/Pieces.php(238): PaxPamir\Helpers\Pieces::getMany()


/**
 * Event card effects & cardIds
 */
x ECE_BACKING_OF_PERSIAN_ARISTOCRACY // card_113
x ECE_CONFIDENCE_FAILURE // card_114
x ECE_CONFLICT_FATIGUE // card_109
x ECE_COURTLY_MANNERS // card_107
x ECE_DISREGARD_FOR_CUSTOMS // card_107
x ECE_DOMINANCE_CHECK
x ECE_EMBARRASSEMENT_OF_RICHES // card_106 / test for influence after dominance check
x ECE_FAILURE_TO_IMPRESS // card_108
x ECE_INTELLIGENCE_SUIT // card_115
x ECE_KOH_I_NOOR_RECOVERED // card_106  / test for influence after dominance check
x ECE_MILITARY_SUIT // card_105
x ECE_NATION_BUILDING // card_112
x ECE_NATIONALISM // card_110
x ECE_NEW_TACTICS // card_105
x ECE_NO_EFFECT // card_111
x ECE_OTHER_PERSUASIVE_METHODS // card_114
x ECE_PASHTUNWALI_VALUES // card_115
x ECE_POLITICAL_SUIT // card_116
x ECE_PUBLIC_WITHDRAWAL // card_111
x ECE_REBUKE // card_116
x ECE_RIOTS_IN_HERAT // card_110
x ECE_RIOTS_IN_KABUL // card_112
x ECE_RIOTS_IN_PERSIA // card_113
x ECE_RIOTS_IN_PUNJAB // card_109
x ECE_RUMOR // card_108

/**
 * Special abilities
 */
x SA_INDISPENSABLE_ADVISORS // card_1
x SA_INSURRESCTION // card_3
x SA_CLAIM_OF_ANCIENT_LINEAGE // card_5
x SA_BODYGUARDS // card_15 card_83
x SA_CITADEL_KABUL // card_17
x SA_CITADEL_TRANSCASPIA // card_97
x SA_STRANGE_BEDFELLOWS // card_21
x SA_CIVIL_SERVICE_REFORMS // card_24
x SA_SAFE_HOUSE // card_41 card_72
x SA_CHARISMATIC_COURTIERS // card_42
x SA_BLACKMAIL_HERAT // card_54
x SA_BLACKMAIL_KANDAHAR // card_43
x SA_INDIAN_SUPPLIES // card_51
x SA_WELL_CONNECTED // card_56
x SA_HERAT_INFLUENCE // card_66
x SA_PERSIAN_INFLUENCE // card_68
x SA_RUSSIAN_INFLUENCE // card_70
x SA_INFRASTRUCTURE // card_78
x SA_SAVVY_OPERATOR // card_91
x SA_IRREGULARS // card_99