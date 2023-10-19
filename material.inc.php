<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Paxpamir implementation : © Frans Bongers <fjmbongers@gmail.com>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * Paxpamir game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

require_once 'modules/php/constants.inc.php';
/*

Example:

$this->card_types = array(
    1 => array( "card_name" => ...,
                ...
              )
);

*/

$this->locations = array(
  'pools' => array(
    AFGHAN => BLOCKS_AFGHAN_SUPPLY,
    BRITISH => BLOCKS_BRITISH_SUPPLY,
    RUSSIAN => BLOCKS_RUSSIAN_SUPPLY
  ),

  'armies' => array(
    TRANSCASPIA => "armies_" . TRANSCASPIA,
    KABUL => "armies_" . KABUL,
    PERSIA => "armies_" . PERSIA,
    HERAT => "armies_" . HERAT,
    KANDAHAR => "armies_" . KANDAHAR,
    PUNJAB => "armies_" . PUNJAB,
  ),

  'tribes' => array(
    TRANSCASPIA => "tribes_" . TRANSCASPIA,
    KABUL => "tribes_" . KABUL,
    PERSIA => "tribes_" . PERSIA,
    HERAT => "tribes_" . HERAT,
    KANDAHAR => "tribes_" . KANDAHAR,
    PUNJAB => "tribes_" . PUNJAB,
  ),

  'roads' => array(
    'herat_kabul' => "roads_herat_kabul",
    'herat_kandahar' => "roads_herat_kandahar",
    'herat_persia' => "roads_herat_persia",
    'herat_transcaspia' => "roads_herat_transcaspia",
    'kabul_kandahar' => "roads_kabul_kandahar",
    'kabul_punjab' => "roads_kabul_punjab",
    'kabul_transcaspia' => "roads_kabul_transcaspia",
    'kandahar_punjab' => "roads_kandahar_punjab",
    'persia_transcaspia' => "roads_persia_transcaspia",
  )
);

// TODO: delete tooltip / icon here
$this->loyalty = array(
  'afghan' => array(
    'id' => 'afghan',
    'name' => clienttranslate("Afghan"),
    'icon' => 0,
    'tooltip' => clienttranslate("Afghan")
  ),
  'russian' => array(
    'id' => 'russian',
    'name' => clienttranslate("Russian"),
    'icon' => 1,
    'tooltip' => clienttranslate("Russian")
  ),
  'british' => array(
    'id' => 'british',
    'name' => clienttranslate("British"),
    'icon' => 2,
    'tooltip' => clienttranslate("British")
  ),
);

// TODO: delete tooltip / change messages here
$this->suits = array(
  'political' => array(
    'id' => 'political',
    'name' => clienttranslate("Political"),
    'tooltip' => clienttranslate("The favored suit is Political"),
    'change' => clienttranslate("The favored suit changed to Political")
  ),
  'intelligence' => array(
    'id' => 'intelligence',
    'name' => clienttranslate("Intelligence"),
    'tooltip' => clienttranslate("The favored suit is Intelligence"),
    'change' => clienttranslate("The favored suit changed to Intelligence")
  ),
  'economic' => array(
    'id' => 'economic',
    'name' => clienttranslate("Economic"),
    'tooltip' => clienttranslate("The favored suit is Economic"),
    'change' => clienttranslate("The favored suit changed to Economic")
  ),
  'military' => array(
    'id' => 'military',
    'name' => clienttranslate("Military"),
    'tooltip' => clienttranslate("The favored suit is Military.  The cost to purchase in the market is doubled."),
    'change' => clienttranslate("The favored suit changed to Military")
  ),
);

$this->regions = array(
  'herat' => array(
    'id' => 'herat',
    'name' => clienttranslate("Herat"),
    'borders' => ['herat_persia', 'herat_transcaspia', 'herat_kabul', 'herat_kandahar'],
  ),
  'kabul' => array(
    'id' => 'kabul',
    'name' => clienttranslate("Kabul"),
    'borders' => ['kabul_transcaspia', 'herat_kabul', 'kabul_kandahar', 'kabul_punjab'],
  ),
  'kandahar' => array(
    'id' => 'kandahar',
    'name' => clienttranslate("Kandahar"),
    'borders' => ['herat_kandahar', 'kabul_kandahar', 'kandahar_punjab'],
  ),
  'persia' => array(
    'id' => 'persia',
    'name' => clienttranslate("Persia"),
    'borders' => ['persia_transcaspia', 'herat_persia'],
  ),
  'punjab' => array(
    'id' => 'punjab',
    'name' => clienttranslate("Punjab"),
    'borders' => ['kabul_punjab', 'kandahar_punjab'],
  ),
  'transcaspia' => array(
    'id' => 'transcaspia',
    'name' => clienttranslate("Transcaspia"),
    'borders' => ['persia_transcaspia', 'herat_transcaspia', 'kabul_transcaspia'],
  ),
);


$this->borders = array(
  'herat_kabul' => array(
    'name' => clienttranslate("Herat-Kabul border"),
    'regions' => ['kabul', 'herat']
  ),
  'herat_kandahar' => array(
    'name' => clienttranslate("Herat-Kandahar border"),
    'regions' => ['herat', 'kandahar']
  ),
  'herat_persia' => array(
    'name' => clienttranslate("Persia-Herat border"),
    'regions' => ['herat', 'persia']
  ),
  'herat_transcaspia' => array(
    'name' => clienttranslate("Herat-Transcaspia border"),
    'regions' => ['transcaspia', 'herat']
  ),
  'kabul_kandahar' => array(
    'name' => clienttranslate("Kabul-Kandahar border"),
    'regions' => ['kabul', 'kandahar']
  ),
  'kabul_punjab' => array(
    'name' => clienttranslate("Kabul-Punjab border"),
    'regions' => ['kabul', 'punjab']
  ),
  'kabul_transcaspia' => array(
    'name' => clienttranslate("Kabul-Transcaspia border"),
    'regions' => ['transcaspia', 'kabul']
  ),
  'kandahar_punjab' => array(
    'name' => clienttranslate("Kandahar-Punjab border"),
    'regions' => ['kandahar', 'punjab'],
  ),
  'persia_transcaspia' => array(
    'name' => clienttranslate("Persia-Transcaspia border"),
    'regions' => ['transcaspia', 'persia'],
  ),
);

$this->specialAbilities = array(
  SA_INDISPENSABLE_ADVISORS => array(
    'title' => clienttranslate('Indispensable Advisors'),
    'description' => clienttranslate('Your spies cannot be removed in battles with other spies.')
  ),
  SA_INSURRESCTION => array(
    'title' => clienttranslate('Insurrection'),
    'description' => clienttranslate('After resolving a Dominance Check, place two Afghan armies in Kabul.')
  ),
  SA_CLAIM_OF_ANCIENT_LINEAGE => array(
    'title' => clienttranslate('Claim of Ancient Lineage'),
    'description' => clienttranslate('When you take the tax action, act as if you rule every region.')
  ),
  SA_BODYGUARDS => array(
    'title' => clienttranslate('Bodyguards'),
    'description' => clienttranslate('Your political cards cannot be targets of the betray action.')
  ),
  SA_CITADEL_KABUL => array(
    'title' => clienttranslate('Citadel'),
    'description' => clienttranslate('Your tribes in Kabul cannot be attacked.')
  ),
  SA_CITADEL_TRANSCASPIA => array(
    'title' => clienttranslate('Citadel'),
    'description' => clienttranslate('Your tribes in Transcaspia cannot be attacked.')
  ),
  SA_STRANGE_BEDFELLOWS => array(
    'title' => clienttranslate('Strange Bedfellows'),
    'description' => clienttranslate('For spy travel, you treat cards that share a region as adjacent.')
  ),
  SA_CIVIL_SERVICE_REFORMS => array(
    'title' => clienttranslate('Civil Service Reforms'),
    'description' => clienttranslate('You do not pay bribes when taking hostage actions.')
  ),
  SA_SAFE_HOUSE => array(
    'title' => clienttranslate('Safe House'),
    'description' => clienttranslate('When another player removes your spy in battle, you may place it on this card instead.')
  ),
  SA_CHARISMATIC_COURTIERS => array(
    'title' => clienttranslate('Charismatic Courtiers'),
    'description' => clienttranslate('You do not pay bribes when playing cards.')
  ),
  SA_BLACKMAIL_HERAT => array(
    'title' => clienttranslate('Blackmail'),
    'description' => clienttranslate('At start of turn, you may place a spy on any Herat court card without a spy.')
  ),
  SA_BLACKMAIL_KANDAHAR => array(
    'title' => clienttranslate('Blackmail'),
    'description' => clienttranslate('At start of turn, you may place a spy on any Kandahar court card without a spy.')
  ),
  SA_INDIAN_SUPPLIES => array(
    'title' => clienttranslate('Indian Supplies'),
    'description' => clienttranslate('Your armies may move without a road.')
  ),
  SA_WELL_CONNECTED => array(
    'title' => clienttranslate('Well-Connected'),
    'description' => clienttranslate('Your spies may double their distance moved when using a move action.')
  ),
  SA_HERAT_INFLUENCE => array(
    'title' => clienttranslate('Herat Influence'),
    'description' => clienttranslate('You do not pay for Herat cards in the market.')
  ),
  SA_PERSIAN_INFLUENCE => array(
    'title' => clienttranslate('Persian Influence'),
    'description' => clienttranslate('You do not pay for Persia cards in the market.')
  ),
  SA_RUSSIAN_INFLUENCE => array(
    'title' => clienttranslate('Russian Influence'),
    'description' => clienttranslate('You do not pay for Russian Patriots in the market.')
  ),
  SA_INFRASTRUCTURE => array(
    'title' => clienttranslate('Infrastructure'),
    'description' => clienttranslate('After you take the build action, place one additional block in a legal space.')
  ),
  SA_SAVVY_OPERATOR => array(
    'title' => clienttranslate('Savvy Operator'),
    'description' => clienttranslate('This card is always treated as if it were in the favored suit.')
  ),
  SA_IRREGULARS => array(
    'title' => clienttranslate('Irregulars'),
    'description' => clienttranslate('This card is always treated as if it were in the favored suit.')
  ),
);

$this->cards = array(
  'card_1' => array(
    'id' => 'card_1',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 104, 'top' => 154)
    ),
    'flavorText' => clienttranslate("\"You all tell yourselves all sorts of fairy stories: you are here to sell us your wonderful British goods, you want to set us free, you want us to grow up… but [you came here] for one reason. To surrender [our kingdom], to give it up. That is the only reason.\""),
    'impactIcons' => [SPY, SPY, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Mohan Lal"),
    'prize' => RUSSIAN,
    'rank' => 3,
    'region' => KABUL,
    'specialAbility' => SA_INDISPENSABLE_ADVISORS,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_2' => array(
    'id' => 'card_2',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' =>  clienttranslate("Served Shah Shuja and the British during the first Anglo-Afghan War. For his service he was given his name which means “scatterer of souls” from a Sufi couplet: \"If I had a thousand lives I would scatter them all at your blessed feet.\""),
    'impactIcons' => [SPY, SPY, ARMY, MILITARY_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Jan-Fishan Khan"),
    'prize' => RUSSIAN,
    'rank' => 2,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_3' => array(
    'id' => 'card_3',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Son of Dost Mohammad and Afghan hero, Akbar Khan led a revolt in Kabul against the British garrison. Later he helped defeat General Elphinstone’s force. He famously captured and killed William Macnaghten"),
    'impactIcons' => [SPY, SPY, ARMY, MILITARY_SUIT],
    'loyalty' => AFGHAN,
    'name' => clienttranslate("Prince Akbar Khan"),
    'prize' => null,
    'rank' => 2,
    'region' => KABUL,
    'specialAbility' => SA_INSURRESCTION,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_4' => array(
    'id' => 'card_4',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Stoddart was dispatched to Bukhara in an attempt to convince Nasrullah Khan to free Russian slaves and form a treaty with Britain. Upon arriving, he was arrested and eventually beheaded. His death caused a sensation in Britain."),
    'impactIcons' => [SPY],
    'loyalty' => null,
    'name' => clienttranslate("Charles Stoddart"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_5' => array(
    'id' => 'card_5',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 104, 'top' => 154),
    ),
    'flavorText' =>   clienttranslate("King of Afghanistan, deposed in 1809. He later traded the 793 carat Koh-i-Noor diamond to gain his freedom. The British returned him to the throne in 1839, which he held for just three years before his assassination."),
    'impactIcons' => [TRIBE],
    'loyalty' => null,
    'name' => clienttranslate("Shah Shujah Durrani"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => KABUL,
    'specialAbility' => SA_CLAIM_OF_ANCIENT_LINEAGE,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_6' => array(
    'id' => 'card_6',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 70, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("During the reign of Shah Zaman, he was a prominent governor, who maintained his power even as the Durrani emperors were ousted. Though initially open to Shah Sujah’s restoration, Logari became dissatisfied with British participation in Afghan politics."),
    'impactIcons' => [TRIBE, ARMY, SPY],
    'loyalty' => AFGHAN,
    'name' => clienttranslate("Aminullah Khan Logari"),
    'prize' => null,
    'rank' => 1,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_7' => array(
    'id' => 'card_7',
    'actions' => array(),
    'flavorText' => clienttranslate("Twice king of Afghanistan, Dost Mohammad was born to a prominent family in the service of the Durrani Empire. He was exiled to British India after being usurped by Shah Shujah and the British. He later returned to Kabul and ruled until his death in 1863."),
    'impactIcons' => [TRIBE, TRIBE, ARMY, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Dost Mohammad"),
    'prize' => null,
    'rank' => 2,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_8' => array(
    'id' => 'card_8',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Though part of the northern branch of the Silk Road, Afghanistan rarely consumed international goods as traders struggled to generate demand. By the nineteenth century, most of the commerce in the country took place in seasonal markets that capitalized on migration patterns."),
    'impactIcons' => [ROAD, ROAD, SPY, POLITICAL_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Kabul Bazaar"),
    'prize' => null,
    'rank' => 2,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_9' => array(
    'id' => 'card_9',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Afghan crafts such as weaving, pottery, and metalwork all reflected the cosmopolitan history of the country. Ancient Islamic motifs could be woven into designs that were both political and aesthetic. These goods were often produced at home and then taken to market for sale during yearly migrations."),
    'impactIcons' => [ROAD],
    'loyalty' => null,
    'name' => clienttranslate("Afghan Handicrafts"),
    'prize' => null,
    'rank' => 1,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_10' => array(
    'id' => 'card_10',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Commonly associated with its lethal properties, Arsenic has many other applications. In Afghanistan, it was used in fabric dyes to brighten colors and could be combined with black pepper to make a popular British anti-venom called the Tanjore pill."),
    'impactIcons' => [ROAD, MILITARY_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Balkh Arsenic Mine"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_11' => array(
    'id' => 'card_11',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Lapis lazuli has been mined in northwestern Afghanistan for nearly nine thousand years. Prized for its intense blue color, the stone was used in high-end Afghan products, and has been found in ancient Egyptian tombs and throughout Europe and Asia."),
    'impactIcons' => [ROAD, ROAD],
    'loyalty' => AFGHAN,
    'name' => clienttranslate("Lapis Lazuli Mine"),
    'prize' => null,
    'rank' => 2,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_12' => array(
    'id' => 'card_12',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The ancient capital of the Ghaznavid Empire, which once extended from central Persia to the Punjab. By the nineteenth century, Ghazni was largely in decline, though it still remained a center of trade and was critical to the logistical challenges facing an Afghan state."),
    'impactIcons' => [ROAD, ROAD, ROAD, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("City of Ghazni"),
    'prize' => null,
    'rank' => 3,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_13' => array(
    'id' => 'card_13',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Ghilzai people form the largest portion of the Pashtun population with concentrations in central and southern Afghanistan. Many tribes belonging to this group lived nomadically, and they formed an important element of the region’s cultural and commercial foundation."),
    'impactIcons' => [ROAD, ROAD],
    'loyalty' => null,
    'name' => clienttranslate("Ghilzai Nomads"),
    'prize' => RUSSIAN,
    'rank' => 2,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_14' => array(
    'id' => 'card_14',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Because of the scarcity of physical currency, credit was often the only lubricant in local economies and allowed Afghanistan’s small business class to stay liquid and respond to shortages that were endemic to the seasonal nature of the Afghan economy."),
    'impactIcons' => [ROAD, ROAD, LEVERAGE],
    'loyalty' => null,
    'name' => clienttranslate("Money Lenders"),
    'prize' => null,
    'rank' => 2,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_15' => array(
    'id' => 'card_15',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("After the death of Ahmad Shah, his son Timur moved the capital from Kandahar to Kabul and recruited Qizilbash, Shia colonists from Persia, to form a Royal Guard which he felt he could trust more than one made up of Pashtuns."),
    'impactIcons' => [ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Durrani Royal Guard"),
    'prize' => null,
    'rank' => 1,
    'region' => KABUL,
    'specialAbility' => SA_BODYGUARDS,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_16' => array(
    'id' => 'card_16',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("For over a thousand years the Bala Hissar was the central architectural feature of Kabul. During the Durrani Empire, the palace-fortress also served as the seat of political power in the region. The building was largely destroyed by an armory explosion during the British occupation in 1879."),
    'impactIcons' => [ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Bala Hissar"),
    'prize' => null,
    'rank' => 1,
    'region' => KABUL,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_17' => array(
    'id' => 'card_17',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The \"key\" to Kabul, this citadel south of the Afghan capital overlooked vital supply routes. It was captured by the British during the first Anglo-Afghan war."),
    'impactIcons' => [ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Citadel of Ghazni"),
    'prize' => null,
    'rank' => 1,
    'region' => KABUL,
    'specialAbility' => SA_CITADEL_KABUL,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_18' => array(
    'id' => 'card_18',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The fictional creation of Thomas Hughes, Sir Harry Paget Flashman was a scoundrel, a coward, and a brilliant, charming solider. His first fictional adventure was set during the first Anglo-Afghan War. While Flashman never existed, he embodied an ethos widespread in the British imagination."),
    'impactIcons' => [SPY],
    'loyalty' => null,
    'name' => clienttranslate("Harry Flashman"),
    'prize' => null,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_19' => array(
    'id' => 'card_19',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("While traveling through Asia in disguise, Pottinger found the city of Herat besieged by Persian forces. He revealed himself to the local commander and helped the Afghan forces defeat the Persians, though Afghan histories dispute his role in lifting the siege."),
    'impactIcons' => [SPY, SPY, ECONOMIC_SUIT],
    'loyalty' => BRITISH,
    'name' => clienttranslate("Eldred Pottinger"),
    'prize' => RUSSIAN,
    'rank' => 2,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_20' => array(
    'id' => 'card_20',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Army officer, politician, and orientalist, Rawlinson advocated for a larger role for Afghanistan in Britain’s foreign policy. He served as a political agent in Kandahar and fought in the First Anglo-Afghan war."),
    'impactIcons' => [SPY, ECONOMIC_SUIT],
    'loyalty' => BRITISH,
    'name' => clienttranslate("Henry Rawlinson"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_21' => array(
    'id' => 'card_21',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 104, 'top' => 156),
    ),
    'flavorText' => clienttranslate("Burns joined the East India Company at 16 and quickly rose through the ranks, aggravating senior operatives like Wade. He advised the British to support Dost Mohammad, but was rebuked by Macnaghten. He nonetheless aided the British coup and was killed when a mob overtook his home in Kabul."),
    'impactIcons' => [SPY, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Alexander Burnes"),
    'prize' => AFGHAN,
    'rank' => 2,
    'region' => PUNJAB,
    'specialAbility' => SA_STRANGE_BEDFELLOWS,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_22' => array(
    'id' => 'card_22',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 70, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Royal Geographical Society was primarily apolitical, but, under the leadership of Rawlinson (then its vice president), Hayward was sent on a politically-motivated mission to find the source of the Oxus River that proved fatal. His death was likely an act of political retribution."),
    'impactIcons' => [SPY, POLITICAL_SUIT],
    'loyalty' => BRITISH,
    'name' => clienttranslate("George Hayward"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_23' => array(
    'id' => 'card_23',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Uncle of Eldred Pottinger, Henry Pottinger led an expedition to Baluchistan and helped map Persia and western India. He would later replace Charles Elliot as the chief diplomat to China and oversaw the Treaty of Nanking and the acquisition of Hong Kong."),
    'impactIcons' => [SPY, ECONOMIC_SUIT],
    'loyalty' => BRITISH,
    'name' => clienttranslate("Henry Pottinger"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_24' => array(
    'id' => 'card_24',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Founder of the Sikh Empire, Ranjit Singh centralized power in the Punjab. Singh maintained power in part through his empire’s religious tolerance and his military reforms."),
    'impactIcons' => [TRIBE, TRIBE, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Ranjit Singh"),
    'prize' => null,
    'rank' => 2,
    'region' => PUNJAB,
    'specialAbility' => SA_CIVIL_SERVICE_REFORMS,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_25' => array(
    'id' => 'card_25',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Born in Pennsylvania, Harlan thought himself a modern day Alexander the Great. He enlisted with the East India Company and soon found himself in the service of Ranjit Singh. He later led an attack against Murad Beg and became Prince of Ghor Province."),
    'impactIcons' => [TRIBE],
    'loyalty' => AFGHAN,
    'name' => clienttranslate("Josiah Harlan"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_26' => array(
    'id' => 'card_26',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("An Italian veteran of the Napoleonic Wars, Avitabile traveled east after Waterloo, peddling his military expertise. He served as governor of Peshawar under Ranjit Singh. He was a brutal ruler and was infamous for his unorthodox execution techniques, including throwing the condemned from the top of the Mahabat Mosque."),
    'impactIcons' => [TRIBE, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Paolo Avitabile"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_27' => array(
    'id' => 'card_27',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Maqpon royal family held control over Baltistan, a region north of the Sikh Empire, for nearly 700 years. The rulers maintained a cosmopolitan identity that fused elements of Buddhism and Islam. In 1840 the Maqpon dynasty was conquered by Zorawar Singh Kahluria."),
    'impactIcons' => [TRIBE, LEVERAGE],
    'loyalty' => null,
    'name' => clienttranslate("Maqpon Dynasty"),
    'prize' => null,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_28' => array(
    'id' => 'card_28',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The oldest of its kind in Lahore, the Anarkali Bazaar is thought to take its name from a nearby mausoleum built to honor the likely fictitious slave girl buried alive by order of the Mughal Emperor Akbar."),
    'impactIcons' => [ROAD, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Anarkali Bazaar"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_29' => array(
    'id' => 'card_29',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate(" Providing passage through the Spin Ghar mountains, the Khyber Pass is one of the world’s most highly trafficked mountain passes and has often been a part of the Silk Road’s northern route. Hari Singh Nalwa controlled the pass under the authority of Ranjit Singh."),
    'impactIcons' => [ROAD, ROAD],
    'loyalty' => null,
    'name' => clienttranslate("Khyber Pass"),
    'prize' => null,
    'rank' => 2,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_30' => array(
    'id' => 'card_30',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Sikh identity came into being during the ascent of Mughal power. To survive persecution, Sikh gurus sought alliances with other minority religious groups. This coalition also facilitated far-reaching commercial networks, centralized around Lahore."),
    'impactIcons' => [ROAD, SPY, LEVERAGE],
    'loyalty' => null,
    'name' => clienttranslate("Sikh Merchants in Lahore"),
    'prize' => null,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_31' => array(
    'id' => 'card_31',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("A variant of the classic \"Brown Bess\" smooth-bore musket, the India Pattern (1795) was developed by the East India Company and was slightly lighter and more compact than the Short Land musket. The weapon was used until 1850."),
    'impactIcons' => [ARMY, INTELLIGENCE_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Company Weapons"),
    'prize' => null,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_32' => array(
    'id' => 'card_32',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The persistent anxieties of the Russophobes in the East India Company eventually convinced Lord Auckland to form the Army of the Indus in order to topple the Afghan state. When it marched, this massive force of British and Indian troops was made infamous by its massive baggage train. One officer even took two camels for the sole purpose of carrying his cigars."),
    'impactIcons' => [ARMY, ARMY, ARMY],
    'loyalty' => BRITISH,
    'name' => clienttranslate("Army of the Indus"),
    'prize' => AFGHAN,
    'rank' => 3,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_33' => array(
    'id' => 'card_33',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Kahluria was instrumental in the expansion of the Sikh Empire. He had a genius for logistics which enabled him to conduct successful campaigns in Ladakh and Baltistan. These conquests secured his reputation as \"The Indian Napoleon.\" He was killed by a Tibetan lancer at To-yo in 1841."),
    'impactIcons' => [ARMY, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Zorawar Singh Kahluria"),
    'prize' => null,
    'rank' => 2,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_34' => array(
    'id' => 'card_34',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 21, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 59, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 98, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Like the Sikhs to the north, the Sindhi people depended upon religious tolerance and alliances for their survival. Their coalition was crushed by Charles Napier’s campaign in 1843."),
    'impactIcons' => [ARMY, ECONOMIC_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Sindhi Warriors"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_35' => array(
    'id' => 'card_35',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Known as the Baagh Maar or Tiger-killer, he was the central military figure that enabled the regional stability of the Sikh Empire. He conquered the Kashmir and was later installed as its governor. He was also known for his feats of military engineering."),
    'impactIcons' => [ARMY, ARMY, POLITICAL_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Hari Singh Nalwa"),
    'prize' => null,
    'rank' => 2,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_36' => array(
    'id' => 'card_36',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("First formed in the late 18th century, regiments of Bengal infantry were used to augment the forces of the East India Company throughout the subcontinent. Many of these regiments were disbanded after the 1857 Indian Mutiny."),
    'impactIcons' => [ARMY, INTELLIGENCE_SUIT],
    'loyalty' => BRITISH,
    'name' =>  clienttranslate("Bengal Native Infantry"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_37' => array(
    'id' => 'card_37',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("First raised in the late 18th century by Francis Mackenzie, 1st Baron Seaforth, this regiment saw a variety of colonial action throughout the 19th century and was sent to Afghanistan in 1842."),
    'impactIcons' => [ARMY, POLITICAL_SUIT],
    'loyalty' => BRITISH,
    'name' =>  clienttranslate("Seaforth Highlanders"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_38' => array(
    'id' => 'card_38',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Among the five symbols of Sikh faith is the Kirpan, a small dagger or sword. This item symbolizes personal sovereignty and resistance to tyranny. Much of the success of the Sikhs in this period could be traced to their capable military prowess."),
    'impactIcons' => [ARMY, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Akali Sikhs"),
    'prize' => BRITISH,
    'rank' => 2,
    'region' => PUNJAB,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_39' => array(
    'id' => 'card_39',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 70, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Moorcroft led an expedition to central Asia in search of Marco Polo's legendary \"Turcoman\" horses. He fell ill in Northern Afghanistan and likely died, though some speculate he continued to operate as an informant for twelve more years before dying in an attempt to return to India."),
    'impactIcons' => [SPY],
    'loyalty' => null,
    'name' => clienttranslate("William Moorcroft"),
    'prize' => null,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_40' => array(
    'id' => 'card_40',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Macnaghten impressed his superiors with his grasp of Islamic law and quickly rose through the ranks of the EIC. He soon found himself managing a vast international intervention and intelligence network. His administrative failures contributed to EIC's defeat in the First Anglo-Afghan war."),
    'impactIcons' => [SPY, SPY, LEVERAGE],
    'loyalty' => BRITISH,
    'name' => clienttranslate("William Hay Macnaghten"),
    'prize' => AFGHAN,
    'rank' => 2,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_41' => array(
    'id' => 'card_41',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 104, 'top' => 159),
    ),
    'flavorText' => clienttranslate("Once enlisted in the EIC, Masson faked his death and took on a new name in order to explore Afghanistan on foot, undertaking historical research on ancient Bactria. Much of this work was supported by Prince Akbar Khan. When discovered, he was blackmailed into working as a British informant."),
    'impactIcons' => [SPY, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Charles Masson"),
    'prize' => null,
    'rank' => 2,
    'region' => KANDAHAR,
    'specialAbility' => SA_SAFE_HOUSE,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_42' => array(
    'id' => 'card_42',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Dost Mohammad relied on an extensive network of family connections in order to maintain control of Afghanistan. Five of his stepbrothers managed Kandahar and surrounding territories."),
    'impactIcons' => [TRIBE, LEVERAGE, ECONOMIC_SUIT],
    'loyalty' => AFGHAN,
    'name' => clienttranslate("Barakzai Sadars"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => SA_CHARISMATIC_COURTIERS,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_43' => array(
    'id' => 'card_43',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 105, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Once a prominent tribe in central Afghanistan, the Giljee were displaced by the Duranni. They were among the first tribes to revolt against the Shah Sujah."),
    'impactIcons' => [TRIBE, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Giljee Nobles"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => SA_BLACKMAIL_KANDAHAR,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_44' => array(
    'id' => 'card_44',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 70, 'top' => 154),
      TAX => array('type' => TAX, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Baluchi traditionally controlled the Bolan Pass. The failure of the British to maintain the traditional payments for the security of mountain passes like the Bolan contributed directly to the outbreak of rebellion that eventually destroyed the Army of the Indus."),
    'impactIcons' => [TRIBE, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Baluchi Chiefs"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_45' => array(
    'id' => 'card_45',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 70, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Originally a staunch supporter of Dost Mohammad and the Barakzai leaders, Kakar was one of the first defectors to Shah Shuja. Afghan poet Maulana Hamid Kashmirir describes Kakar as \"the outsider, the traitor, the master of betrayal… mixing poison in sugar.\""),
    'impactIcons' => [TRIBE, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Haji Khan Kakar"),
    'prize' => null,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_46' => array(
    'id' => 'card_46',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Rupee was the chief currency of Afghanistan during the nineteenth century, with much of the specie coming directly from raids into the Punjab. Because currency was rarely struck locally, banks in the major cities were highly leveraged in order to keep coins in local circulation."),
    'impactIcons' => [ROAD, ROAD, LEVERAGE, INTELLIGENCE_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Bank"),
    'prize' => null,
    'rank' => 2,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_47' => array(
    'id' => 'card_47',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Army of the Indus used the Bolan Pass to invade central Afghanistan. The dense ridges and maze-like cliff walkways made it easy for the Baluchi to ambush British soldiers without fear of reprisal."),
    'impactIcons' => [ROAD, ROAD, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Bolan Pass"),
    'prize' => RUSSIAN,
    'rank' => 2,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_48' => array(
    'id' => 'card_48',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Southern Afghanistan produces some of the highest quality pomegranates in the world. When British troops first entered Kandahar, they were amazed by the quality and variety of the produce at market."),
    'impactIcons' => [ROAD, POLITICAL_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Fruit markets"),
    'prize' => null,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_49' => array(
    'id' => 'card_49',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("For much of its history, Kandahar served as a critical agricultural and commercial anchor for the region's nomadic tribes. Its location also provided easy access to the Punjab. For these reasons, Kandahar was designated the capital of the Durrani Empire from 1747 till 1776."),
    'impactIcons' => [ROAD, POLITICAL_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Kandahari Markets"),
    'prize' => null,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_50' => array(
    'id' => 'card_50',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The vast majority of British regiments in the region were directly affiliated with the East India Company. However, the British Army also maintained some units. A few of these, including the 13th Light Infantry, were part of the British invasion through the Bolan Pass."),
    'impactIcons' => [ARMY, ARMY],
    'loyalty' => BRITISH,
    'name' => clienttranslate("British Regulars"),
    'prize' => RUSSIAN,
    'rank' => 2,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_51' => array(
    'id' => 'card_51',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Keane's varied military career was typical of officers in this period. He fought in the Battle of New Orleans, served in the West Indies, and, eventually, was stationed in India."),
    'impactIcons' => [ARMY],
    'loyalty' => BRITISH,
    'name' => clienttranslate("Sir John Keane"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => SA_INDIAN_SUPPLIES,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_52' => array(
    'id' => 'card_52',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      TAX => array('type' => TAX, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Often mercenaries were hired to extract revenue from regions outside of a ruler’s traditional control. Many of these mercenary forces were composed of politically ambitious Pashtuns or disenfranchised Giljee nobility."),
    'impactIcons' => [ARMY, POLITICAL_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Pashtun Mercenary"),
    'prize' => null,
    'rank' => 1,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_53' => array(
    'id' => 'card_53',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("An inexpensive and extremely effective weapon, the muzzle-loading jezail rifle was a staple of both regular and irregular Afghan forces. Compared to the 150 yard accuracy of the British Brown Bess, experienced jezail sharpshooters could be accurate at ranges up to 500 yards."),
    'impactIcons' => [ARMY, ARMY, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Jezail Sharpshooters"),
    'prize' => RUSSIAN,
    'rank' => 2,
    'region' => KANDAHAR,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_54' => array(
    'id' => 'card_54',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("After the collapse of the Durrani empire, long stretches of the Silk Road lapsed into lawlessness. Minor tribal rulers competed with bandits in hopes of extracting tolls. As a consequence, overland trade dried up as merchants looked for safer routes."),
    'impactIcons' => [SPY, LEVERAGE],
    'loyalty' => null,
    'name' => clienttranslate("Herati Bandits"),
    'prize' => null,
    'rank' => 1,
    'region' => HERAT,
    'specialAbility' => SA_BLACKMAIL_HERAT,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_55' => array(
    'id' => 'card_55',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 21, 'top' => 154),
      TAX => array('type' => TAX, 'left' => 59, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 97, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Persian-speaking Hazara people ruled a semi-autonomous region in western Afghanistan that remained outside of both the Persian and Afghan emperors until the second reign of Dost Mohammad."),
    'impactIcons' => [TRIBE, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Hazara Chiefs"),
    'prize' => null,
    'rank' => 1,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_56' => array(
    'id' => 'card_56',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 104, 'top' => 155),
    ),
    'flavorText' => clienttranslate("A political insider who was able to maintain influence throughout the 19th century, Yar Mohammad often served as a high level advisor. In 1839 he betrayed Prince Kameran and expelled British agents in hopes of placing Herat under Persian influence and protection."),
    'impactIcons' => [TRIBE, TRIBE, POLITICAL_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Yar Mohammad Alikozai"),
    'prize' => AFGHAN,
    'rank' => 2,
    'region' => HERAT,
    'specialAbility' => SA_WELL_CONNECTED,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_57' => array(
    'id' => 'card_57',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Many scions of the Durrani empire attempted to retain some authority in exile. They often maintained small, underground courts in the region’s more independent cities such as Herat. Dost Mohammad was systematic in his persecution of the former ruling class and made an example of those he caught, such as Shah Zaman whom he had blinded and imprisoned."),
    'impactIcons' => [TRIBE],
    'loyalty' => null,
    'name' => clienttranslate("Exiled Durrani Nobility"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_58' => array(
    'id' => 'card_58',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Ishaqzai were prominent during the Durrani empire but fell out of power with the ascendancy of the Barakzai. In the later 19th century they were relentlessly persecuted and forced to abandon their nomadic lifestyle for farming settlements."),
    'impactIcons' => [TRIBE, ECONOMIC_SUIT],
    'loyalty' => AFGHAN,
    'name' => clienttranslate("Ishaqzai Chiefs"),
    'prize' => null,
    'rank' => 1,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_59' => array(
    'id' => 'card_59',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 70, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Tajik people have their origins in the Muslim armies that crossed into central Asia in the 8th century. Because of the dominance of the Samanid Empire in the 9th and 10th centuries, Tajik people can be found throughout the region, forming a considerable plurality in western Afghanistan."),
    'impactIcons' => [ARMY, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Tajik Warband"),
    'prize' => null,
    'rank' => 2,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_60' => array(
    'id' => 'card_60',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 21, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 59, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 97, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Many tribes in Afghanistan were nomadic and herdsmen by trade. Still, they sometimes formed warbands and used seasonal raids to supplement their income."),
    'impactIcons' => [ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Nomadic Warlord"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_61' => array(
    'id' => 'card_61',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 59, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Karakul sheep had a coarse wool which was suitable only for rug-making. Their chief value was in their fat tails, which were used in cuisine and in soap-making."),
    'impactIcons' => [ROAD, ROAD],
    'loyalty' => null,
    'name' => clienttranslate("Karakul Sheep"),
    'prize' => null,
    'rank' => 2,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_62' => array(
    'id' => 'card_62',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("An ancient irrigation technology that is still in use in the present day, qanats use a series of vertical shafts and gently sloping tunnels to irrigate fields and regulate the flow of water while offering protection from evaporation."),
    'impactIcons' => [ROAD, POLITICAL_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Qanat System"),
    'prize' => null,
    'rank' => 1,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_63' => array(
    'id' => 'card_63',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Because of the long winter and difficult conditions of the passes between Herat and Kabul, west-bound commercial traffic was routed through Kandahar and then through Farah. Like most trade in Afghanistan, the goods on this route would have been luxury items because of the expense of the trip."),
    'impactIcons' => [ROAD, ROAD, ROAD],
    'loyalty' => null,
    'name' => clienttranslate("Farah Road"),
    'prize' => null,
    'rank' => 3,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_64' => array(
    'id' => 'card_64',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 59, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Though opium would prove a lucrative cash crop for Afghan farmers in the 20th century, during the 19th century production was subdued at best and was only traded regionally."),
    'impactIcons' => [ROAD, ROAD, SPY, MILITARY_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Opium Fields"),
    'prize' => null,
    'rank' => 2,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_65' => array(
    'id' => 'card_65',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 21, 'top' => 154),
      TAX => array('type' => TAX, 'left' => 59, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 97, 'top' => 154),
    ),
    'flavorText' => clienttranslate("One of the ancient roads between Herat and Kabul is marked by this medieval structure. Built around 1190, some suggest that it was part of Firozkoh, the lost capital of the Ghorid dynasty which was destroyed by Ögedei Khan, the son of Genghis Khan."),
    'impactIcons' => [ROAD, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Minaret of Jam"),
    'prize' => null,
    'rank' => 1,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_66' => array(
    'id' => 'card_66',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 103, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Baluchi long controlled the Bolan Pass and participated in trade with the Indian subcontinent. Smugglers even ran goods throughout southern Afghanistan and into Persia."),
    'impactIcons' => [ROAD, ROAD, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Baluchi Smugglers"),
    'prize' => AFGHAN,
    'rank' => 2,
    'region' => HERAT,
    'specialAbility' => SA_HERAT_INFLUENCE,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_67' => array(
    'id' => 'card_67',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 70, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Wheat has served as Afghanistan’s agricultural mainstay since antiquity. Though subsistence farming left little for the market, wheat was still sometimes milled into flour for sale to nomadic herdsmen."),
    'impactIcons' => [ROAD],
    'loyalty' => null,
    'name' => clienttranslate("Wheat Fields"),
    'prize' => null,
    'rank' => 2,
    'region' => HERAT,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_68' => array(
    'id' => 'card_68',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 104, 'top' => 154),
    ),
    'flavorText' =>  clienttranslate("Politician, scientist, and poet who briefly served as prime minister of Iran. He was betrayed and murdered on the orders of Mohammad Shah Qajar in 1835."),
    'impactIcons' => [SPY, SPY, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Ghaem Magham Farahani"),
    'prize' => null,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => SA_PERSIAN_INFLUENCE,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_69' => array(
    'id' => 'card_69',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 40, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 78, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Russian diplomat and intelligence officer who helped coordinate information networks across central Asia. He helped the Persians direct the unsuccessful siege of Herat in 1838."),
    'impactIcons' => [SPY, SPY],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Count Ivan Simonich"),
    'prize' => BRITISH,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_70' => array(
    'id' => 'card_70',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 105, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Satirist, playwright, and Alexander Pushkin's closest friend, Griboyedov served as the Russian ambassador to Persia. He attempted to provide asylum to three refugees who fled the royal harems and was killed when a mob stormed the embassy."),
    'impactIcons' => [SPY, SPY],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Alexander Griboyedov"),
    'prize' => AFGHAN,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => SA_RUSSIAN_INFLUENCE,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_71' => array(
    'id' => 'card_71',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 70, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Joseph Wolff was a minor celebrity among evangelical travel writers in England. He befriended Arthur Conolly on a previous journey to Asia, and, upon seeing the news of his imprisonment, embarked on a quixotic journey to Bukhara to save his friend. He did not succeed."),
    'impactIcons' => [SPY],
    'loyalty' => BRITISH,
    'name' => clienttranslate("Joseph Wolff"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_72' => array(
    'id' => 'card_72',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Bengal-born scholar of Persia who served as a diplomatic agent in Ludhiana, Wade distrusted Alexander Burnes and helped make the case for deeper British involvement in the region."),
    'impactIcons' => [SPY, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Claude Wade"),
    'prize' => RUSSIAN,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => SA_SAFE_HOUSE,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_73' => array(
    'id' => 'card_73',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 70, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Allard served as captain of the 7th Hussars under Napoleon. After the defeat at Waterloo, Allard traveled throughout Persia and central Asia. He eventually came to serve Ranjit Singh and helped reform the Sikh military."),
    'impactIcons' => [SPY, MILITARY_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Jean-François Allard"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_74' => array(
    'id' => 'card_74',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 70, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Prime minister to Mohammad Shah Qajar. He brought the Shah into Sufi mysticism. Aghasi fought against the mullahs who sought to decentralize Persian political authority and attempted to modernize the country while maintaining independence from the West."),
    'impactIcons' => [TRIBE, INTELLIGENCE_SUIT],
    'loyalty' => AFGHAN,
    'name' => clienttranslate("Hajj Mirza Aghasi"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_75' => array(
    'id' => 'card_75',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("A son of Fath Ali-Shah, Mirza was trained as a military commander and led troops against Russia and the Ottomans. He sent young commanders to Europe in hopes of integrating new military tactics into the Persian Army, but was largely unable to modernize the Persian army."),
    'impactIcons' => [TRIBE, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("Abbas Mirza"),
    'prize' => null,
    'rank' => 1,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_76' => array(
    'id' => 'card_76',
    'actions' => array(),
    'flavorText' => clienttranslate("Fath-Ali Shah developed Persian court etiquette and oversaw a growth in artistic production. Despite engaging in numerous wars with the Russians, Fath-Ali Shah maintained diplomatic and commercial contact with Russia and other Western powers."),
    'impactIcons' => [TRIBE, TRIBE, INTELLIGENCE_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Fath-Ali Shah"),
    'prize' => null,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_77' => array(
    'id' => 'card_77',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The grandson of Fath Ali-Shah, he was the designated heir to the Persian throne. Mohammad Shah rebuffed British attempts to outlaw the slave trade and fell under Russian influence in his effort to modernize Iran. Though sickly throughout his life, Mohammad Shah was a capable ruler."),
    'impactIcons' => [TRIBE, ARMY, INTELLIGENCE_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Mohammad Shah"),
    'prize' => null,
    'rank' => 1,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_78' => array(
    'id' => 'card_78',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The Qajar dynasty of Persia made large capital investments to expand the road network. This was largely a measure to integrate the border tribes with city centers."),
    'impactIcons' => [ROAD, ROAD, LEVERAGE, INTELLIGENCE_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Civic Improvements"),
    'prize' => null,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => SA_INFRASTRUCTURE,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_79' => array(
    'id' => 'card_79',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("In central Asia the slave trade continued throughout the 19th century. Many slaves were originally from populations that had been displaced by war or famine. Others came to market by way of the Indian Ocean and Africa's eastern coast."),
    'impactIcons' => [ROAD, SPY, LEVERAGE],
    'loyalty' => null,
    'name' => clienttranslate("Persian Slave Markets"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_80' => array(
    'id' => 'card_80',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The relationship between Britain and Persia was fluid for much the 19th century. The British formed a strategic alliance with the Persians in 1801 as a bulwark against French expansion in the East. However, the Persians supported Napoleon in 1807 and joined an alliance against Russia."),
    'impactIcons' => [ROAD, LEVERAGE],
    'loyalty' => BRITISH,
    'name' => clienttranslate("Anglo-Persian Trade"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_81' => array(
    'id' => 'card_81',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Persia's defeat in the Russo-Persian War led to the 1828 Treaty of Turkmenchay. Persia offered Russia territorial and economic concessions, including the right for Persian ships to navigate the Caspian Sea. The treaty sparked outrage throughout Persia and led to the storming of the Russian embassy."),
    'impactIcons' => [ROAD, ROAD, LEVERAGE],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Russo-Persian Trade"),
    'prize' => BRITISH,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_82' => array(
    'id' => 'card_82',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("In an effort to modernize the army, Abbas Mirza sent many Persian officers to England in 1813. Improved training led to the growth of Persian regional power, especially in relation to their chief rivals in Russia and the Ottoman Empire."),
    'impactIcons' => [ARMY, ARMY, INTELLIGENCE_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Persian Army"),
    'prize' => null,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_83' => array(
    'id' => 'card_83',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("One of the world's oldest military institutions with roots in the \"Immortal Guard\" of the Achaemenid Empire, these elite guards were an important dimension of the civic power of the Qajar dynasty."),
    'impactIcons' => [ARMY, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Shah's Guard"),
    'prize' => null,
    'rank' => 1,
    'region' => PERSIA,
    'specialAbility' => SA_BODYGUARDS,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_84' => array(
    'id' => 'card_84',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 59, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Infantrymen were often stationed at Orenburg which served as a staging ground for Russian operations across the Transcaspian Oblast."),
    'impactIcons' => [ARMY, ARMY, ECONOMIC_SUIT],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Russian Regulars"),
    'prize' => AFGHAN,
    'rank' => 2,
    'region' => PERSIA,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_85' => array(
    'id' => 'card_85',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Jewish populations have lived in central Asia since the 7th century but routinely faced persecution. In the early 19th century, many Jews fl ed Persia and settled in major cities across the region, including Bukhara, Herat, and Kabul."),
    'impactIcons' => [SPY, LEVERAGE, ECONOMIC_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Bukharan Jews"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_86' => array(
    'id' => 'card_86',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 70, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Exiled to central Asia at 14 for attempting to organize a resistance against Russia in Poland, he made the most of his misfortune and found work within the Russian Foreign Service. He failed to deliver Kabul to his Russian masters. Disheartened, he burned his personal papers and committed suicide."),
    'impactIcons' => [SPY, SPY],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Jan Prosper Witkiewicz"),
    'prize' => null,
    'rank' => 2,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_87' => array(
    'id' => 'card_87',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 21, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 59, 'top' => 154),
      BUILD => array('type' => BUILD, 'left' => 97, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Many diplomatic missions to the Russian steppe and central Asia used map-making as a cover for their intelligence gathering. The most famous of these was the Great Trigonometrical Survey led by the British to map the Indian subcontinent."),
    'impactIcons' => [SPY],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Imperial Surveyors"),
    'prize' => null,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_88' => array(
    'id' => 'card_88',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 70, 'top' => 154),
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("A renowned explorer and travel writer, Conolly first coined the phrase \"The Great Game\". During a later expedition, he was captured while attempting to rescue Charles Stoddart. The two were beheaded in Bukhara."),
    'impactIcons' => [SPY],
    'loyalty' => BRITISH,
    'name' => clienttranslate("Arthur Conolly"),
    'prize' => null,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_89' => array(
    'id' => 'card_89',
    'actions' => array(
      MOVE => array('type' => MOVE, 'left' => 21, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 59, 'top' => 154),
      BATTLE => array('type' => BATTLE, 'left' => 97, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Disguised as a merchant from Yarkand, Mehdi was, in fact, a Russian agent who operated in and around Kashmir. He attempted to open diplomatic channels with Ranjit Singh."),
    'impactIcons' => [SPY],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Aga Mehdi"),
    'prize' => null,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => INTELLIGENCE,
    'type' => COURT_CARD,
  ),
  'card_90' => array(
    'id' => 'card_90',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("A fierce and paranoid ruler, Nasrullah Khan gained notoriety across Europe for the imprisonment and execution of two British agents. In the 1830s Nasrullah organized several unsuccessful campaigns in the region against other local Khans in a bid for regional supremacy."),
    'impactIcons' => [TRIBE],
    'loyalty' => null,
    'name' => clienttranslate("Nasrullah Khan"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_91' => array(
    'id' => 'card_91',
    'actions' => array(
      BETRAY => array('type' => BETRAY, 'left' => 105, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Bahadur ramped up the enslavement of Russian citizens in order to compensate for shortfalls in trade. Fearing a Russian casus belli, British agents convinced the Khan to release the Russian slaves."),
    'impactIcons' => [TRIBE, ARMY, SPY],
    'loyalty' => null,
    'name' => clienttranslate("Allah Quli Bahadur"),
    'prize' => RUSSIAN,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => SA_SAVVY_OPERATOR,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_92' => array(
    'id' => 'card_92',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 21, 'top' => 154),
      TAX => array('type' => TAX, 'left' => 59, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 97, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Khan of Kunduz and later ruler of Bukhara, Mir Murad Beg's kingdom eventually extended to much of modern day Uzbekistan."),
    'impactIcons' => [TRIBE, SPY, MILITARY_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("Mir Murad Beg"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_93' => array(
    'id' => 'card_93',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Ascending to the throne at the age of 12, he expanded the Khanate of Kokand to its greatest territorial extent. Unlike his predecessor, Madali Khan opened diplomatic relationships with European powers. His removal from power led to decades of political turmoil in the region."),
    'impactIcons' => [TRIBE, TRIBE],
    'loyalty' => null,
    'name' => clienttranslate("Madali Khan"),
    'prize' => BRITISH,
    'rank' => 2,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => POLITICAL,
    'type' => COURT_CARD,
  ),
  'card_94' => array(
    'id' => 'card_94',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      BETRAY => array('type' => BETRAY, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("In central Asia the slave trade continued throughout the 19th century. Many slaves were originally from populations that had been displaced by war or famine. Others came to market by way of the Indian Ocean and Africa's eastern coast."),
    'impactIcons' => [ROAD, SPY, LEVERAGE],
    'loyalty' => null,
    'name' => clienttranslate("Khivan Slave Markets"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_95' => array(
    'id' => 'card_95',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("The city of Orenburg was a critical outpost, supply depot, and administrative city in the Russian Empire, enabling the Empire to project power across the steppe of central Asia. Virtually all diplomatic officers and military forces operating in the region were supported through Orenburg."),
    'impactIcons' => [ROAD],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Supplies from Orenburg"),
    'prize' => AFGHAN,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_96' => array(
    'id' => 'card_96',
    'actions' => array(
      TAX => array('type' => TAX, 'left' => 70, 'top' => 154),
      MOVE => array('type' => MOVE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("This location was central to overland trade with the Khanates of the Transcaspian. The caravans of this route were dominated by the Lohanis who were often considered the richest and most stable of the nomadic merchants of Afghanistan."),
    'impactIcons' => [ROAD, ROAD],
    'loyalty' => null,
    'name' => clienttranslate("Panjdeh Oasis"),
    'prize' => BRITISH,
    'rank' => 2,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => ECONOMIC,
    'type' => COURT_CARD,
  ),
  'card_97' => array(
    'id' => 'card_97',
    'actions' => array(
      BUILD => array('type' => BUILD, 'left' => 105, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Built in the 5th century, the Ark is a massive fortress which legend says was constructed by the epic hero Siyavusha. The Ark has undergone centuries of renovation and improvement."),
    'impactIcons' => [ARMY, INTELLIGENCE_SUIT],
    'loyalty' => null,
    'name' => clienttranslate("The Ark of Bukhara"),
    'prize' => null,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => SA_CITADEL_TRANSCASPIA,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_98' => array(
    'id' => 'card_98',
    'actions' => array(
      GIFT => array('type' => GIFT, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Western weaponry was commonly shipped to proxy states on the imperial frontiers in order to efficiently gain the upper hand over numerically superior native forces. Such supplies enabled the successful seizure of Georgia and Dagestan during the Russo-Persia war"),
    'impactIcons' => [ARMY, ARMY, ARMY],
    'loyalty' => null,
    'name' => clienttranslate("European Cannons"),
    'prize' => BRITISH,
    'rank' => 3,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_99' => array(
    'id' => 'card_99',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 104, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Cossacks formed an important component of the Russian strategy in central Asia. These irregular cavalry served as scouts, police forces, and skirmishers."),
    'impactIcons' => [ARMY, SPY],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Cossacks"),
    'prize' => BRITISH,
    'rank' => 1,
    'region' => TRANSCASPIA,
    'specialAbility' => SA_IRREGULARS,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_100' => array(
    'id' => 'card_100',
    'actions' => array(
      BATTLE => array('type' => BATTLE, 'left' => 108, 'top' => 154),
    ),
    'flavorText' => clienttranslate("Taken prisoner during the Napoleonic Wars, Perovsky continued his military career after being freed during the fall of Paris. In 1839 he led an expeditionary force from Orenburg in an attempt to subdue the Khanate of Khiva. His campaigns set the stage for a series of treaties that would put central Asia firmly under the control of the Russian Empire."),
    'impactIcons' => [ARMY, ARMY],
    'loyalty' => RUSSIAN,
    'name' => clienttranslate("Count Perovsky"),
    'prize' => BRITISH,
    'rank' => 2,
    'region' => TRANSCASPIA,
    'specialAbility' => null,
    'suit' => MILITARY,
    'type' => COURT_CARD,
  ),
  'card_101' => array(
    'id' => 'card_101',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_DOMINANCE_CHECK,
      'title' => clienttranslate('Dominance Check'),
      'description' => clienttranslate('Resolve a Dominance Check. If successful, clear blocks from map.'),
    ),
    'purchased' => array(
      'effect' => ECE_DOMINANCE_CHECK,
      'title' => clienttranslate('Dominance Check'),
      'description' => clienttranslate('Resolve a Dominance Check. If successful, clear blocks from map.'),
    ),
  ),
  'card_102' => array(
    'id' => 'card_102',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_DOMINANCE_CHECK,
      'title' => clienttranslate('Dominance Check'),
      'description' => clienttranslate('Resolve a Dominance Check. If successful, clear blocks from map.'),
    ),
    'purchased' => array(
      'effect' => ECE_DOMINANCE_CHECK,
      'title' => clienttranslate('Dominance Check'),
      'description' => clienttranslate('Resolve a Dominance Check. If successful, clear blocks from map.'),
    ),
  ),
  'card_103' => array(
    'id' => 'card_103',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_DOMINANCE_CHECK,
      'title' => clienttranslate('Dominance Check'),
      'description' => clienttranslate('Resolve a Dominance Check. If successful, clear blocks from map.'),
    ),
    'purchased' => array(
      'effect' => ECE_DOMINANCE_CHECK,
      'title' => clienttranslate('Dominance Check'),
      'description' => clienttranslate('Resolve a Dominance Check. If successful, clear blocks from map.'),
    ),
  ),
  'card_104' => array(
    'id' => 'card_104',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_DOMINANCE_CHECK,
      'title' => clienttranslate('Dominance Check'),
      'description' => clienttranslate('Resolve a Dominance Check. If successful, clear blocks from map.'),
    ),
    'purchased' => array(
      'effect' => ECE_DOMINANCE_CHECK,
      'title' => clienttranslate('Dominance Check'),
      'description' => clienttranslate('Resolve a Dominance Check. If successful, clear blocks from map.'),
    ),
  ),
  'card_105' => array(
    'id' => 'card_105',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_MILITARY_SUIT
    ),
    'purchased' => array(
      'effect' => ECE_NEW_TACTICS,
      'title' => clienttranslate('New Tactics'),
      'description' => clienttranslate('Your military cards are always considered favored until the next Dominance Check.'),
    ),
  ),
  'card_106' => array(
    'id' => 'card_106',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_EMBARRASSEMENT_OF_RICHES,
      'title' => clienttranslate('Embarrassment of Riches'),
      'description' => clienttranslate('Gifts are not worth influence until after the next Dominance Check.'),
    ),
    'purchased' => array(
      'effect' => ECE_KOH_I_NOOR_RECOVERED,
      'title' => clienttranslate('Koh-i-noor Recovered'),
      'description' => clienttranslate('Each of your gifts is worth an additional influence point until after the next Dominance Check.'),
    ),
  ),
  'card_107' => array(
    'id' => 'card_107',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_DISREGARD_FOR_CUSTOMS,
      'title' => clienttranslate('Disregard for Customs'),
      'description' => clienttranslate('All ignore all bribes until the next Dominance Check.'),
    ),
    'purchased' => array(
      'effect' => ECE_COURTLY_MANNERS,
      'title' => clienttranslate('Courtly Manners'),
      'description' => clienttranslate('You may choose to not pay bribes until the next Dominance Check.'),
    ),
  ),
  'card_108' => array(
    'id' => 'card_108',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_FAILURE_TO_IMPRESS,
      'title' => clienttranslate('Failure to Impress'),
      'description' => clienttranslate('All discard all loyalty prizes.'),
    ),
    'purchased' => array(
      'effect' => ECE_RUMOR,
      'title' => clienttranslate('Rumor'),
      'description' => clienttranslate('Choose a player. Their patriots do not count for influence until after the next Dominance Check.'),
    ),
  ),
  'card_109' => array(
    'id' => 'card_109',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_RIOTS_IN_PUNJAB,
      'title' => clienttranslate('Riots in Punjab'),
      'description' => clienttranslate('Remove all tribes and armies in Punjab.'),
    ),
    'purchased' => array(
      'effect' => ECE_CONFLICT_FATIGUE,
      'title' => clienttranslate('Conflict Fatigue'),
      'description' => clienttranslate('Coalitions require only two more blocks in order to be dominant during the next Dominance Check.'),
    ),
  ),
  'card_110' => array(
    'id' => 'card_110',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_RIOTS_IN_HERAT,
      'title' => clienttranslate('Riots in Herat'),
      'description' => clienttranslate('Remove all tribes and armies in Herat.'),
    ),
    'purchased' => array(
      'effect' => ECE_NATIONALISM,
      'title' => clienttranslate('Nationalism'),
      'description' => clienttranslate('Your tribes may move and battle as if they were armies until the next Dominance Check.'),
    ),
  ),
  // TODO (Frans, check interface for below card. It does not have a purchased effect)
  'card_111' => array(
    'id' => 'card_111',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_NO_EFFECT,
      'description' => clienttranslate('No effect.'),
    ),
    'purchased' => array(
      'effect' => ECE_PUBLIC_WITHDRAWAL,
      'title' => clienttranslate('Public Withdrawal'),
      'description' => clienttranslate('This card cannot be purchased. Any money placed on this card in the market is instead removed from the game.'),
    )
  ),
  'card_112' => array(
    'id' => 'card_112',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_RIOTS_IN_KABUL,
      'title' => clienttranslate('Riots in Kabul'),
      'description' => clienttranslate('Remove all tribes and armies in Kabul.'),
    ),
    'purchased' => array(
      'effect' => ECE_NATION_BUILDING,
      'title' => clienttranslate('Nation Building'),
      'description' => clienttranslate('Place twice as many blocks when you take the build action until the next Dominance Check.'),
    ),
  ),
  'card_113' => array(
    'id' => 'card_113',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_RIOTS_IN_PERSIA,
      'title' => clienttranslate('Riots in Persia'),
      'description' => clienttranslate('Remove all tribes and armies in Persia.'),
    ),
    'purchased' => array(
      'effect' => ECE_BACKING_OF_PERSIAN_ARISTOCRACY,
      'title' => clienttranslate('Backing of Persian Aristocracy'),
      'description' => clienttranslate('Take three rupees from the bank.'),
    )
  ),
  'card_114' => array(
    'id' => 'card_114',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_CONFIDENCE_FAILURE,
      'title' => clienttranslate('Confidence Failure'),
      'description' => clienttranslate('All players must immediately discard a card from their hand.'),
    ),
    'purchased' => array(
      'effect' => ECE_OTHER_PERSUASIVE_METHODS,
      'title' => clienttranslate("Other Persuasive Methods"),
      'description' => clienttranslate('Exchange your hand with another player. You may exchange an empty hand.'),
    ),
  ),
  'card_115' => array(
    'id' => 'card_115',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_INTELLIGENCE_SUIT
    ),
    'purchased' => array(
      'effect' => ECE_PASHTUNWALI_VALUES,
      'title' => clienttranslate("Pashtunwali Values"),
      'description' => clienttranslate('Choose a suit to favor. All favored suit change impact icons are ignored until the next Dominance Check.'),
    ),
  ),
  'card_116' => array(
    'id' => 'card_116',
    'type' => EVENT_CARD,
    'discarded' => array(
      'effect' => ECE_POLITICAL_SUIT
    ),
    'purchased' => array(
      'effect' => ECE_REBUKE,
      'title' => clienttranslate('Rebuke'),
      'description' => clienttranslate('Remove all tribes and armies in a single region.'),
    )
  ),
);

$this->wakhanCards = [
  'wakhan_card_1' => [
    'id' => 'wakhan_card_1',
    'back' => [
      'columnNumbers' => [3, 4, 5, 0, 1, 2],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [TAX, RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY, RADICALIZE],
      'columnArrow' => 2,
      'pragmaticLoyalty' => [RUSSIAN, AFGHAN, BRITISH],
      'regionOrder' => [TRANSCASPIA, KABUL, KANDAHAR, PERSIA, HERAT, PUNJAB],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_2' => [
    'id' => 'wakhan_card_2',
    'back' => [
      'columnNumbers' => [4, 5, 0, 1, 2, 3],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC, RADICALIZE_HIGHEST_RANKED_POLITICAL, RADICALIZE],
      'columnArrow' => 1,
      'pragmaticLoyalty' => [AFGHAN, BRITISH, RUSSIAN],
      'regionOrder' => [PERSIA, PUNJAB, KANDAHAR, HERAT, TRANSCASPIA, KABUL],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_3' => [
    'id' => 'wakhan_card_3',
    'back' => [
      'columnNumbers' => [2, 3, 4, 5, 0, 1],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [TAX, RADICALIZE_HIGHEST_RANKED_INTELLIGENCE, RADICALIZE],
      'columnArrow' => 3,
      'pragmaticLoyalty' => [BRITISH, RUSSIAN, AFGHAN],
      'regionOrder' => [PUNJAB, PERSIA, HERAT, KANDAHAR, TRANSCASPIA, KABUL],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_4' => [
    'id' => 'wakhan_card_4',
    'back' => [
      'columnNumbers' => [1, 2, 3, 4, 5, 0],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES, BUILD, RADICALIZE],
      'columnArrow' => 4,
      'pragmaticLoyalty' => [RUSSIAN, AFGHAN, BRITISH],
      'regionOrder' => [KANDAHAR, KABUL, HERAT, PUNJAB, TRANSCASPIA, PERSIA],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_5' => [
    'id' => 'wakhan_card_5',
    'back' => [
      'columnNumbers' => [4, 5, 0, 1, 2, 3],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION, BATTLE, RADICALIZE],
      'columnArrow' => 1,
      'pragmaticLoyalty' => [BRITISH, AFGHAN, RUSSIAN],
      'regionOrder' => [PERSIA, KANDAHAR, HERAT, TRANSCASPIA, KABUL, PUNJAB],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_6' => [
    'id' => 'wakhan_card_6',
    'back' => [
      'columnNumbers' => [5, 0, 1, 2, 3, 4],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [RADICALIZE_INTELLIGENCE, MOVE, RADICALIZE],
      'columnArrow' => 0,
      'pragmaticLoyalty' => [BRITISH, RUSSIAN, AFGHAN],
      'regionOrder' => [HERAT, PERSIA, TRANSCASPIA, KABUL, PUNJAB, KANDAHAR],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_7' => [
    'id' => 'wakhan_card_7',
    'back' => [
      'columnNumbers' => [1, 2, 3, 4, 5, 0],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [BUILD, MOVE, RADICALIZE],
      'columnArrow' => 4,
      'pragmaticLoyalty' => [AFGHAN, RUSSIAN, BRITISH],
      'regionOrder' => [PUNJAB, TRANSCASPIA, KABUL, PERSIA, KANDAHAR, HERAT],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_8' => [
    'id' => 'wakhan_card_8',
    'back' => [
      'columnNumbers' => [1, 2, 3, 4, 5, 0],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [TAX, BETRAY, RADICALIZE],
      'columnArrow' => 4,
      'pragmaticLoyalty' => [BRITISH, RUSSIAN, AFGHAN],
      'regionOrder' => [TRANSCASPIA, PERSIA, PUNJAB, KANDAHAR, HERAT, KABUL],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_9' => [
    'id' => 'wakhan_card_9',
    'back' => [
      'columnNumbers' => [0, 1, 2, 3, 4, 5],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS, RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS, RADICALIZE],
      'columnArrow' => 5,
      'pragmaticLoyalty' => [RUSSIAN, BRITISH, AFGHAN],
      'regionOrder' => [KABUL, PUNJAB, KANDAHAR, PERSIA, HERAT, TRANSCASPIA],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_10' => [
    'id' => 'wakhan_card_10',
    'back' => [
      'columnNumbers' => [5, 0, 1, 2, 3, 4],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION, MOVE, RADICALIZE],
      'columnArrow' => 0,
      'pragmaticLoyalty' => [AFGHAN, BRITISH, RUSSIAN],
      'regionOrder' => [PERSIA, KANDAHAR, KABUL, HERAT, PUNJAB, TRANSCASPIA],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_11' => [
    'id' => 'wakhan_card_11',
    'back' => [
      'columnNumbers' => [5, 0, 1, 2, 3, 4],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS, RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY, RADICALIZE],
      'columnArrow' => 0,
      'pragmaticLoyalty' => [AFGHAN, RUSSIAN, BRITISH],
      'regionOrder' => [PUNJAB, PERSIA, HERAT, KANDAHAR, KABUL, TRANSCASPIA],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_12' => [
    'id' => 'wakhan_card_12',
    'back' => [
      'columnNumbers' => [1, 2, 3, 4, 5, 0],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [MOVE, BETRAY, RADICALIZE],
      'columnArrow' => 4,
      'pragmaticLoyalty' => [BRITISH, AFGHAN, RUSSIAN],
      'regionOrder' => [KANDAHAR, HERAT, PERSIA, KABUL, TRANSCASPIA, PUNJAB],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_13' => [
    'id' => 'wakhan_card_13',
    'back' => [
      'columnNumbers' => [3, 4, 5, 0, 1, 2],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT, RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS, RADICALIZE],
      'columnArrow' => 2,
      'pragmaticLoyalty' => [AFGHAN, BRITISH, RUSSIAN],
      'regionOrder' => [HERAT, KABUL, TRANSCASPIA, PUNJAB, PERSIA, KANDAHAR],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_14' => [
    'id' => 'wakhan_card_14',
    'back' => [
      'columnNumbers' => [2, 3, 4, 5, 0, 1],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY, BATTLE, RADICALIZE],
      'columnArrow' => 3,
      'pragmaticLoyalty' => [AFGHAN, RUSSIAN, BRITISH],
      'regionOrder' => [KABUL, TRANSCASPIA, PERSIA, PUNJAB, KANDAHAR, HERAT],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_15' => [
    'id' => 'wakhan_card_15',
    'back' => [
      'columnNumbers' => [3, 4, 5, 0, 1, 2],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [MOVE, BATTLE, RADICALIZE],
      'columnArrow' => 2,
      'pragmaticLoyalty' => [RUSSIAN, BRITISH, AFGHAN],
      'regionOrder' => [TRANSCASPIA, KABUL, PUNJAB, PERSIA, HERAT, KANDAHAR],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_16' => [
    'id' => 'wakhan_card_16',
    'back' => [
      'columnNumbers' => [0, 1, 2, 3, 4, 5],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS, BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY, RADICALIZE],
      'columnArrow' => 5,
      'pragmaticLoyalty' => [AFGHAN, RUSSIAN, BRITISH],
      'regionOrder' => [PUNJAB, TRANSCASPIA, PERSIA, KANDAHAR, KABUL, HERAT],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_17' => [
    'id' => 'wakhan_card_17',
    'back' => [
      'columnNumbers' => [5, 0, 1, 2, 3, 4],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL, TAX, RADICALIZE],
      'columnArrow' => 0,
      'pragmaticLoyalty' => [RUSSIAN, BRITISH, AFGHAN],
      'regionOrder' => [TRANSCASPIA, KANDAHAR, PERSIA, HERAT, PUNJAB, KABUL],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_18' => [
    'id' => 'wakhan_card_18',
    'back' => [
      'columnNumbers' => [2, 3, 4, 5, 0, 1],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [TAX, BETRAY, RADICALIZE],
      'columnArrow' => 3,
      'pragmaticLoyalty' => [RUSSIAN, BRITISH, AFGHAN],
      'regionOrder' => [KABUL, PUNJAB, KANDAHAR, HERAT, PERSIA, TRANSCASPIA],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_19' => [
    'id' => 'wakhan_card_19',
    'back' => [
      'columnNumbers' => [3, 4, 5, 0, 1, 2],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [BUILD, MOVE, RADICALIZE],
      'columnArrow' => 2,
      'pragmaticLoyalty' => [RUSSIAN, AFGHAN, BRITISH],
      'regionOrder' => [KANDAHAR, HERAT, PUNJAB, TRANSCASPIA, KABUL, PERSIA],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_20' => [
    'id' => 'wakhan_card_20',
    'back' => [
      'columnNumbers' => [2, 3, 4, 5, 0, 1],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES, BUILD, RADICALIZE],
      'columnArrow' => 1,
      'pragmaticLoyalty' => [RUSSIAN, AFGHAN, BRITISH],
      'regionOrder' => [KANDAHAR, HERAT, KABUL, TRANSCASPIA, PERSIA, PUNJAB],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_21' => [
    'id' => 'wakhan_card_21',
    'back' => [
      'columnNumbers' => [0, 1, 2, 3, 4, 5],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION, BUILD, RADICALIZE],
      'columnArrow' => 5,
      'pragmaticLoyalty' => [BRITISH, AFGHAN, RUSSIAN],
      'regionOrder' => [HERAT, KANDAHAR, TRANSCASPIA, KABUL, PUNJAB, PERSIA],
      'rowSideArrow' => 0
    ]
  ],
  'wakhan_card_22' => [
    'id' => 'wakhan_card_22',
    'back' => [
      'columnNumbers' => [0, 1, 2, 3, 4, 5],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [BETRAY, BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY, RADICALIZE],
      'columnArrow' => 5,
      'pragmaticLoyalty' => [BRITISH, AFGHAN, RUSSIAN],
      'regionOrder' => [KABUL, HERAT, PUNJAB, TRANSCASPIA, PERSIA, KANDAHAR],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_23' => [
    'id' => 'wakhan_card_23',
    'back' => [
      'columnNumbers' => [2, 3, 4, 5, 0, 1],
      'rowSide' => [BOTTOM_RIGHT, TOP_LEFT],
    ],
    'front' => [
      'actions' => [RADICALIZE_HIGHEST_RANKED_POLITICAL, RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY, RADICALIZE],
      'columnArrow' => 3,
      'pragmaticLoyalty' => [BRITISH, RUSSIAN, AFGHAN],
      'regionOrder' => [HERAT, PUNJAB, TRANSCASPIA, KABUL, KANDAHAR, PERSIA],
      'rowSideArrow' => 1
    ]
  ],
  'wakhan_card_24' => [
    'id' => 'wakhan_card_24',
    'back' => [
      'columnNumbers' => [4, 5, 0, 1, 2, 3],
      'rowSide' => [TOP_LEFT, BOTTOM_RIGHT],
    ],
    'front' => [
      'actions' => [RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE, BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY, RADICALIZE],
      'columnArrow' => 1,
      'pragmaticLoyalty' => [AFGHAN, BRITISH, RUSSIAN],
      'regionOrder' => [PERSIA, TRANSCASPIA, KABUL, PUNJAB, KANDAHAR, HERAT],
      'rowSideArrow' => 1
    ]
  ],
];

$this->radicalizeActions = [
  RADICALIZE => [
    'id' => RADICALIZE,
    'text' => clienttranslate('Radizalize'),
  ],
  RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY => [
    'id' => RADICALIZE_IF_MILITARY_FAVORED_HIGHEST_RANKED_MILITARY,
    'text' => clienttranslate('If military cards are favored, radicalize the highest ranked military card'),
  ],
  RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC => [
    'id' => RADICALIZE_IF_POLITICAL_FAVORED_HIGHEST_RANKED_ECONOMIC,
    'text' => clienttranslate('If political cards are favored, radicalize the highest ranked economic card'),
  ],
  RADICALIZE_HIGHEST_RANKED_POLITICAL => [
    'id' => RADICALIZE_HIGHEST_RANKED_POLITICAL,
    'text' => clienttranslate('Radicalize the highest ranked political card'),
  ],
  RADICALIZE_HIGHEST_RANKED_INTELLIGENCE => [
    'id' => RADICALIZE_HIGHEST_RANKED_INTELLIGENCE,
    'text' => clienttranslate('Radicalize the highest ranked intelligence card'),
  ],
  RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES => [
    'id' => RADICALIZE_IF_FEWER_THAN_TWO_RUPEES_RADICALIZE_MOST_NET_RUPEES,
    'text' => clienttranslate('If Wakhan has fewer than 2 Rupees, radicalize the card that will net the most rupees'),
  ],
  RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION => [
    'id' => RADICALIZE_CARD_THAT_GIVES_CONTROL_OF_REGION,
    'text' => clienttranslate('Radicalize a card that will gain Wakhan control of a region'),
  ],
  RADICALIZE_INTELLIGENCE => [
    'id' => RADICALIZE_INTELLIGENCE,
    'text' => clienttranslate('Radicalize an intelligence card'),
  ],
  RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS => [
    'id' => RADICALIZE_CARD_THAT_WOULD_PLACE_MOST_BLOCKS,
    'text' => clienttranslate('Radicalize the card that would place most armies and/or roads'),
  ],
  RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS => [
    'id' => RADICALIZE_IF_NO_DOMINANT_COALITION_CARD_THAT_WOULD_PLACE_MOST_CYLINDERS,
    'text' => clienttranslate('If no coalition has dominance, radicalize the card that would place the most spies and/or tribes'),
  ],
  RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION => [
    'id' => RADICALIZE_IF_NO_CARD_WITH_MOVE_CARD_WITH_MOVE_ACTION,
    'text' => clienttranslate('If Wakhan has no card with the move action, radicalize a card with the move action'),
  ],
  RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT => [
    'id' => RADICALIZE_IF_DOMINANT_COALITION_MATCHING_PATRIOT,
    'text' => clienttranslate('If a coalition has dominance radicalize a matching patriot'),
  ],
  RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL => [
    'id' => RADICALIZE_IF_COURT_SIZE_AT_LIMIT_HIGHEST_RANKED_POLITICAL,
    'text' => clienttranslate('If Wakhan\'s court size is at its limit, radicalize the highest ranked political card'),
  ],
  RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE => [
    'id' => RADICALIZE_IF_FEWER_SPIES_THAN_ANOTHER_PLAYER_HIGHEST_RANKED_INTELLIGENCE,
    'text' => clienttranslate('If Wakhan has fewer spies than another player then radicalize the highest ranked intelligence card'),
  ],

  BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY => [
    'id' => BATTLE_HIGHEST_PRIORITY_COURT_CARD_WITH_MOST_SPIES_WHERE_WAKHAN_HAS_SPY,
    'text' => clienttranslate('Battle on the highest priority court card with the most spies where Wakhan also has at least one spy'),
  ],
];
