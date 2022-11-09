<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PaxPamirEditionTwo implementation : © Julien Coignet <breddabasse@hotmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * modules/php/includes/PXPCards.inc.php
 *
 */

use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumCoalition;
use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumImpactIcon;
use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumRegion;
use PhobyJuan\PaxPamirEditionTwo\Factories\PXPCardFactory as CardFactory;

use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumSuit;
use PhobyJuan\PaxPamirEditionTwo\Enums\PXPEnumSpecialAbility;


$this->cards = [
    /////////////////////////////
    // Suit cards
    /////////////////////////////
    1 => CardFactory::createSuitCard(
        1, PXPEnumSuit::Intelligence, 3, "Mohan Lal", PXPEnumRegion::Kabul, 
        PXPEnumSpecialAbility::IndispensableAdvisor, false, false, false, true, false, false, 
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy]
    ),
    2 => CardFactory::createSuitCard(
        2, PXPEnumSuit::Intelligence, 2, "Jan-Fishan Khan", PXPEnumRegion::Kabul, 
        null, false, false, false, true, false, true, 
        null, PXPEnumCoalition::Russian,
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::MilitarySuit]
    ),
    3 => CardFactory::createSuitCard(
        3, PXPEnumSuit::Intelligence, 2, "Prince Akbar Khan", PXPEnumRegion::Kabul, 
        PXPEnumSpecialAbility::Insurrection, false, false, false, false, false, true,
        PXPEnumCoalition::Afghan, null, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::MilitarySuit]
    ),
    4 => CardFactory::createSuitCard(
        4, PXPEnumSuit::Intelligence, 1, "Charles Stoddart", PXPEnumRegion::Kabul, 
        null, false, true, false, true, false, false, 
        null, PXPEnumCoalition::Afghan,
        [PXPEnumImpactIcon::Spy]
    ),
    5 => CardFactory::createSuitCard(
        5, PXPEnumSuit::Political, 1, "Shah Shujah Durrani", PXPEnumRegion::Kabul, 
        PXPEnumSpecialAbility::ClaimOfAncientLineage, false, false, true, false, false, false,
        null, PXPEnumCoalition::Afghan,
        [PXPEnumImpactIcon::Tribe]
    ),
    6 => CardFactory::createSuitCard(
        6, PXPEnumSuit::Political, 1, "Aminullah Khan Logari", PXPEnumRegion::Kabul,
        null, false, false, true, false, false, true,
        PXPEnumCoalition::Afghan, null,
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Spy]
    ),
    7 => CardFactory::createSuitCard(
        7, PXPEnumSuit::Political, 2, "Dost Mohammad", PXPEnumRegion::Kabul,
        null, false, false, false, false, false, false,
        null, null,
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Spy]
    ),
    8 => CardFactory::createSuitCard(
        8, PXPEnumSuit::Economic, 2, "Kabul Bazaar", PXPEnumRegion::Kabul, 
        null, true, false, false, false, false, false, 
        null, null,
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::PoliticalSuit]
    ),
    9 => CardFactory::createSuitCard(
        9, PXPEnumSuit::Economic, 1, "Afghan Handicrafts", PXPEnumRegion::Kabul, 
        null, true, false, false, true, false, false, 
        null, null, 
        [PXPEnumImpactIcon::Road]
    ),
    10 => CardFactory::createSuitCard(
        10, PXPEnumSuit::Economic, 1, "Balkh Arsenic Mine", PXPEnumRegion::Kabul, 
        null, false, false, true, false, true, false, 
        null, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::MilitarySuit]
    ),
    11 => CardFactory::createSuitCard(
        11, PXPEnumSuit::Economic, 2, "Lapis Lazuli Mine", PXPEnumRegion::Kabul, 
        null, true, true, false, false, false, false, 
        PXPEnumCoalition::Afghan, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road]
    ),
    12 => CardFactory::createSuitCard(
        12, PXPEnumSuit::Economic, 3, "City of Ghazni", PXPEnumRegion::Kabul,
        null, false, true, false, false, false, false, 
        null, null,
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Army]
    ),
    13 => CardFactory::createSuitCard(
        13, PXPEnumSuit::Economic, 2, "Ghilzai Nomads", PXPEnumRegion::Kabul, 
        null, true, false, false, true, false, false, 
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road]
    ),
    14 => CardFactory::createSuitCard(
        14, PXPEnumSuit::Economic, 2, "Money Landers", PXPEnumRegion::Kabul, 
        null, false, true, true, false, false, false, 
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Leverage]
    ),
    15 => CardFactory::createSuitCard(
        15, PXPEnumSuit::Military, 1, "Durrani Royal Guards", PXPEnumRegion::Kabul, 
        PXPEnumSpecialAbility::Bodyguards, false, false, false, false, true, false, 
        null, null, 
        [PXPEnumImpactIcon::Army]
    ),
    16 => CardFactory::createSuitCard(
        16, PXPEnumSuit::Military, 1, "Bala Hissar", PXPEnumRegion::Kabul, 
        null, true, false, false, false, true, false, 
        null, null, 
        [PXPEnumImpactIcon::Army]
    ),
    17 => CardFactory::createSuitCard(
        17, PXPEnumSuit::Military, 1, "Citadel of Ghazni", PXPEnumRegion::Kabul, 
        PXPEnumSpecialAbility::Citadel, false, false, true, false, false, false, 
        null, null,
        [PXPEnumImpactIcon::Army]
    ),
    18 => CardFactory::createSuitCard(
        18, PXPEnumSuit::Intelligence, 1, "Harry Flashman", PXPEnumRegion::Punjab, 
        null, false, true, false, false, true, false, 
        null, null, 
        [PXPEnumImpactIcon::Spy]
    ),
    19 => CardFactory::createSuitCard(
        19, PXPEnumSuit::Intelligence, 2, "Eldred Pottinger", PXPEnumRegion::Punjab,
        null, false, false, false, true, true, false, 
        PXPEnumCoalition::British, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::EconomicSuit]
    ),
    20 => CardFactory::createSuitCard(
        20, PXPEnumSuit::Intelligence, 1, "Henry Rawlinson", PXPEnumRegion::Punjab,
        null, false, true, false, true, false, false, 
        PXPEnumCoalition::British, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::EconomicSuit]
    ),
    21 => CardFactory::createSuitCard(
        21, PXPEnumSuit::Intelligence, 2, "Alexander Burnes", PXPEnumRegion::Punjab, 
        PXPEnumSpecialAbility::StrangeBedfellows, false, false, false, true, false, false, 
        null, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe]
    ),
    22 => CardFactory::createSuitCard(
        22, PXPEnumSuit::Intelligence, 1, "George Hayward", PXPEnumRegion::Punjab, 
        null, false, true, false, true, false, false, 
        PXPEnumCoalition::British, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::PoliticalSuit]
    ),
    23 => CardFactory::createSuitCard(
        23, PXPEnumSuit::Intelligence, 1, "Henry Pottinger", PXPEnumRegion::Punjab, 
        null, false, false, false, true, false, true, 
        PXPEnumCoalition::British, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::EconomicSuit]
    ),
    24 => CardFactory::createSuitCard(
        24, PXPEnumSuit::Political, 2, "Ranjit Singh", PXPEnumRegion::Punjab, 
        PXPEnumSpecialAbility::CivilServiceReforms, false, false, false, false, true, false, 
        null, null, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army]
    ),
    25 => CardFactory::createSuitCard(
        25, PXPEnumSuit::Political, 1, "Josiah Harlan", PXPEnumRegion::Punjab, 
        null, true, false, false, false, false, false,
        PXPEnumCoalition::Afghan, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Tribe]
    ),
    26 => CardFactory::createSuitCard(
        26, PXPEnumSuit::Political, 1, "Paolo Avitabile", PXPEnumRegion::Punjab, 
        null, false, false, false,  false, true, false,
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army]
    ),
    27 => CardFactory::createSuitCard(
        27, PXPEnumSuit::Political, 1, "Maqpon Dynasty", PXPEnumRegion::Punjab, 
        null, false, false, true, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Leverage]
    ),
    28 => CardFactory::createSuitCard(
        28, PXPEnumSuit::Economic, 1, "Anarkali Bazaar", PXPEnumRegion::Punjab, 
        null, true, false, true, false, false, false,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Spy]
    ),
    29 => CardFactory::createSuitCard(
        29, PXPEnumSuit::Economic, 2, "Khyber Pass", PXPEnumRegion::Punjab, 
        PXPEnumSpecialAbility::CivilServiceReforms, false, false, false, false, false, false,
        null, null,  
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road]
    ),
    30 => CardFactory::createSuitCard(
        30, PXPEnumSuit::Economic, 1, "Sikh Merchants in Lahore", PXPEnumRegion::Punjab, 
        null, true, true, false, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Leverage]
    ),
    31 => CardFactory::createSuitCard(
        31, PXPEnumSuit::Military, 1, "Company Weapons", PXPEnumRegion::Punjab, 
        null, true, false, false, false, true, false,
        null, null,  
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    32 => CardFactory::createSuitCard(
        32, PXPEnumSuit::Military, 3, "Army of the Indus", PXPEnumRegion::Punjab, 
        null, false, false, false, true, false, false,
        PXPEnumCoalition::British, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army]
    ),
    33 => CardFactory::createSuitCard(
        33, PXPEnumSuit::Military, 2, "Zorawar Singh Kahluria", PXPEnumRegion::Punjab, 
        null, false, true, false, false, false, true,
        null, null, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army]
    ),
    34 => CardFactory::createSuitCard(
        34, PXPEnumSuit::Military, 1, "Sindhi Warriors", PXPEnumRegion::Punjab, 
        null, false, false, false, true, true, true,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::EconomicSuit]
    ),
    35 => CardFactory::createSuitCard(
        35, PXPEnumSuit::Military, 2, "Hari Singh Nalwa", PXPEnumRegion::Punjab, 
        null, false, false, false, true, false, true,
        null, null, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::PoliticalSuit]
    ),
    36 => CardFactory::createSuitCard(
        36, PXPEnumSuit::Military, 1, "Bengal Native Infantry", PXPEnumRegion::Punjab, 
        null, false, false, false, false, true, true,
        PXPEnumCoalition::British, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    37 => CardFactory::createSuitCard(
        37, PXPEnumSuit::Military, 1, "Seaforth, Highlanders", PXPEnumRegion::Punjab, 
        null, false, false, false, true, false, true,
        PXPEnumCoalition::British, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::PoliticalSuit]
    ),
    38 => CardFactory::createSuitCard(
        38, PXPEnumSuit::Military, 2, "Akali Sikhs", PXPEnumRegion::Punjab, 
        null, false, false, false, false, false, true,
        null, null, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army]
    ),
    39 => CardFactory::createSuitCard(
        39, PXPEnumSuit::Intelligence, 1, "William Moorcroft", PXPEnumRegion::Kandahar, 
        null, false, false, false, true, false, true,
        null, null, 
        [PXPEnumImpactIcon::Tribe]
    ),
    40 => CardFactory::createSuitCard(
        40, PXPEnumSuit::Intelligence, 2, "William Hay Macnaghten", PXPEnumRegion::Kandahar, 
        null, true, false, false, true, false, false,
        PXPEnumCoalition::British, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Leverage]
    ),
    41 => CardFactory::createSuitCard(
        41, PXPEnumSuit::Intelligence, 2, "Charles Masson", PXPEnumRegion::Kandahar, 
        PXPEnumSpecialAbility::SafeHouse, false, false, true, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe]
    ),
    42 => CardFactory::createSuitCard(
        42, PXPEnumSuit::Political, 1, "Barakzai Sadars", PXPEnumRegion::Kandahar, 
        PXPEnumSpecialAbility::CharismaticCourtiers, false, false, true, false, false, false,
        PXPEnumCoalition::Afghan, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Leverage, PXPEnumImpactIcon::PoliticalSuit]
    ),
    43 => CardFactory::createSuitCard(
        43, PXPEnumSuit::Political, 1, "Giljee Nobles", PXPEnumRegion::Kandahar, 
        PXPEnumSpecialAbility::BlackMail, false, false, false, false, false, true,
        null, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army]
    ),
    44 => CardFactory::createSuitCard(
        44, PXPEnumSuit::Political, 1, "Baluchi Chiefs", PXPEnumRegion::Kandahar, 
        null, true, false, true, false, false, false,
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army]
    ),
    45 => CardFactory::createSuitCard(
        45, PXPEnumSuit::Political, 1, "Haji Khan Kakar", PXPEnumRegion::Kandahar, 
        null, false, true, false, false, true, false,
        null, null, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army]
    ),
    46 => CardFactory::createSuitCard(
        46, PXPEnumSuit::Economic, 2, "Bank", PXPEnumRegion::Kandahar, 
        null, false, true, false, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Leverage, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    47 => CardFactory::createSuitCard(
        47, PXPEnumSuit::Economic, 2, "Bolan Pass", PXPEnumRegion::Kandahar, 
        null, false, true, false, true, false, false,
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Army]
    ),
    48 => CardFactory::createSuitCard(
        48, PXPEnumSuit::Economic, 1, "Fruits market", PXPEnumRegion::Kandahar, 
        null, false, false, true, true, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::PoliticalSuit]
    ),
    49 => CardFactory::createSuitCard(
        49, PXPEnumSuit::Economic, 1, "Kandahari Markets", PXPEnumRegion::Kandahar, 
        null, true, false, true, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::PoliticalSuit]
    ),
    50 => CardFactory::createSuitCard(
        50, PXPEnumSuit::Military, 2, "British Regulars", PXPEnumRegion::Kandahar, 
        null, false, false, false, true, false, true,
        PXPEnumCoalition::British, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army]
    ),
    51 => CardFactory::createSuitCard(
        51, PXPEnumSuit::Military, 1, "Sir Johns Keane", PXPEnumRegion::Kandahar, 
        PXPEnumSpecialAbility::IndianSupplies, false, false, false, false, false, true,
        PXPEnumCoalition::British, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Army]
    ),
    52 => CardFactory::createSuitCard(
        52, PXPEnumSuit::Military, 1, "Pashtun Mercenary", PXPEnumRegion::Kandahar, 
        null, true, false, false, false, false, true,
        null, null, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::PoliticalSuit]
    ),
    53 => CardFactory::createSuitCard(
        53, PXPEnumSuit::Military, 2, "Jezail Sharpshooters", PXPEnumRegion::Kandahar, 
        null, false, false, false, false, true, false,
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Spy]
    ),
    54 => CardFactory::createSuitCard(
        54, PXPEnumSuit::Intelligence, 1, "Herati Bandits", PXPEnumRegion::Herat, 
        PXPEnumSpecialAbility::BlackMail, true, false, false, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Leverage]
    ),
    55 => CardFactory::createSuitCard(
        55, PXPEnumSuit::Political, 1, "Hazara Chiefs", PXPEnumRegion::Herat, 
        null, true, false, false, true, false, true,
        null, null,  
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army]
    ),
    56 => CardFactory::createSuitCard(
        56, PXPEnumSuit::Political, 2, "Yar Mohammad Alikozai", PXPEnumRegion::Herat, 
        PXPEnumSpecialAbility::WellConnected, false, false, false, false, true, false,
        null, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::PoliticalSuit]
    ),
    57 => CardFactory::createSuitCard(
        57, PXPEnumSuit::Political, 1, "Exiled Durrani Nobility", PXPEnumRegion::Herat, 
        null, false, false, false, true, true, false,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Tribe]
    ),
    58 => CardFactory::createSuitCard(
        58, PXPEnumSuit::Political, 1, "Ishaqzai", PXPEnumRegion::Herat, 
        null, false, true, true, false, false, false,
        PXPEnumCoalition::Afghan, null, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::EconomicSuit]
    ),
    59 => CardFactory::createSuitCard(
        59, PXPEnumSuit::Military, 2, "Tajik Warband", PXPEnumRegion::Herat, 
        null, false, false, false, false, true, true,
        null, null, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army]
    ),
    60 => CardFactory::createSuitCard(
        60, PXPEnumSuit::Military, 1, "Nomadic Warlord", PXPEnumRegion::Herat, 
        null, true, true, false, false, false, true,
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Army]
    ),
    61 => CardFactory::createSuitCard(
        61, PXPEnumSuit::Economic, 2, "Karakul Sheep", PXPEnumRegion::Herat, 
        null, true, false, false, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road]
    ),
    62 => CardFactory::createSuitCard(
        62, PXPEnumSuit::Economic, 1, "Qanat System", PXPEnumRegion::Herat, 
        null, false, true, true, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::PoliticalSuit]
    ),
    63 => CardFactory::createSuitCard(
        63, PXPEnumSuit::Economic, 3, "Farah Road", PXPEnumRegion::Herat, 
        null, false, false, false, true, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road]
    ),
    64 => CardFactory::createSuitCard(
        64, PXPEnumSuit::Economic, 2, "Opium Fields", PXPEnumRegion::Herat, 
        null, true, false, false, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::MilitarySuit]
    ),
    65 => CardFactory::createSuitCard(
        65, PXPEnumSuit::Economic, 1, "Minaret of Jam", PXPEnumRegion::Herat, 
        null, true, false, false, true, false, true,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Army]
    ),
    66 => CardFactory::createSuitCard(
        66, PXPEnumSuit::Economic, 2, "Baluchi Smugglers", PXPEnumRegion::Herat, 
        PXPEnumSpecialAbility::HeratInfluence, false, false, false, false, false, true,
        null, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Army]
    ),
    67 => CardFactory::createSuitCard(
        67, PXPEnumSuit::Economic, 2, "Wheat Fields", PXPEnumRegion::Herat, 
        null, false, true, false, true, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road]
    ),
    68 => CardFactory::createSuitCard(
        68, PXPEnumSuit::Intelligence, 2, "Ghaem Magham Farahani", PXPEnumRegion::Persia, 
        PXPEnumSpecialAbility::PersianInfluence, true, false, false, false, false, false,
        null, null,  
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Army]
    ),
    69 => CardFactory::createSuitCard(
        69, PXPEnumSuit::Intelligence, 2, "Count Ivan Simonich", PXPEnumRegion::Persia, 
        null, false, false, false, true, false, true,
        PXPEnumCoalition::Russian, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy]
    ),
    70 => CardFactory::createSuitCard(
        70, PXPEnumSuit::Intelligence, 2, "Alexander Griboyedov", PXPEnumRegion::Persia, 
        PXPEnumSpecialAbility::RussianInfluence, false, false, false, true, false, false,
        PXPEnumCoalition::Russian, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy]
    ),
    71 => CardFactory::createSuitCard(
        71, PXPEnumSuit::Intelligence, 1, "Joseph Wolff", PXPEnumRegion::Persia, 
        null, true, false, false, true, false, false,
        PXPEnumCoalition::British, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Spy]
    ),
    72 => CardFactory::createSuitCard(
        72, PXPEnumSuit::Intelligence, 2, "Claude Wade", PXPEnumRegion::Persia, 
        PXPEnumSpecialAbility::SafeHouse, false, false, false, true, false, false,
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Spy]
    ),
    73 => CardFactory::createSuitCard(
        73, PXPEnumSuit::Intelligence, 1, "Jean-François Allard", PXPEnumRegion::Persia, 
        null, false, false, true, false, false, true,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::MilitarySuit]
    ),
    74 => CardFactory::createSuitCard(
        74, PXPEnumSuit::Political, 1, "Hajj Mirza Aghasi", PXPEnumRegion::Persia, 
        null, false, false, false, false, true, true,
        PXPEnumCoalition::Afghan, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    75 => CardFactory::createSuitCard(
        75, PXPEnumSuit::Political, 1, "Abbas Mirza", PXPEnumRegion::Persia, 
        null, true, false, false, false, false, true,
        true, true, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army]
    ),
    76 => CardFactory::createSuitCard(
        76, PXPEnumSuit::Political, 2, "Fath-Ali Shah", PXPEnumRegion::Persia, 
        null, false, false, false, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    77 => CardFactory::createSuitCard(
        77, PXPEnumSuit::Political, 1, "Mohammad Shah", PXPEnumRegion::Persia, 
        null, false, false, true, false, true, false,
        null, null, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    78 => CardFactory::createSuitCard(
        78, PXPEnumSuit::Economic, 2, "Civic Improvements", PXPEnumRegion::Persia, 
        PXPEnumSpecialAbility::CivilServiceReforms, false, false, true, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Leverage, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    79 => CardFactory::createSuitCard(
        79, PXPEnumSuit::Economic, 1, "Persian Slave Markets", PXPEnumRegion::Persia, 
        null, true, false, false, true, false, false,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Leverage]
    ),
    80 => CardFactory::createSuitCard(
        80, PXPEnumSuit::Economic, 1, "Anglo-Paersian Trade", PXPEnumRegion::Persia, 
        null, true, false, true, false, false, false,
        PXPEnumCoalition::British, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Leverage]
    ),
    81 => CardFactory::createSuitCard(
        81, PXPEnumSuit::Economic, 2, "Russo-Persian Trade", PXPEnumRegion::Persia, 
        null, true, false, true, false, false, false,
        PXPEnumCoalition::Russian, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Leverage]
    ),
    82 => CardFactory::createSuitCard(
        82, PXPEnumSuit::Military, 2, "Persian Army", PXPEnumRegion::Persia, 
        null, false, true, false, false, false, true,
        null, null, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    83 => CardFactory::createSuitCard(
        83, PXPEnumSuit::Military, 1, "Shah's Guard", PXPEnumRegion::Persia, 
        PXPEnumSpecialAbility::Bodyguards, true, false, false, false, false, false,
        true, true,  
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Spy]
    ),
    84 => CardFactory::createSuitCard(
        84, PXPEnumSuit::Military, 2, "Russian Regulars", PXPEnumRegion::Persia, 
        null, false, false, false, false, false, true,
        PXPEnumCoalition::Russian, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::EconomicSuit]
    ),
    85 => CardFactory::createSuitCard(
        85, PXPEnumSuit::Intelligence, 1, "Bukharan Jews", PXPEnumRegion::Transcapia, 
        null, false, true, true, false, false, false,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Leverage, PXPEnumImpactIcon::EconomicSuit]
    ),
    86 => CardFactory::createSuitCard(
        86, PXPEnumSuit::Intelligence, 2, "Jan Prosper Witkiewicz", PXPEnumRegion::Transcapia, 
        null, false, false, true, true, false, false,
        PXPEnumCoalition::Russian, null, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe]
    ),
    87 => CardFactory::createSuitCard(
        87, PXPEnumSuit::Intelligence, 1, "Imperial Surveyors", PXPEnumRegion::Transcapia, 
        null, false, true, true, true, false, false,
        PXPEnumCoalition::Russian, null, 
        [PXPEnumImpactIcon::Spy]
    ),
    88 => CardFactory::createSuitCard(
        88, PXPEnumSuit::Intelligence, 1, "Arthur Conolly", PXPEnumRegion::Transcapia, 
        null, false, true, false, true, false, false,
        PXPEnumCoalition::British, null, 
        [PXPEnumImpactIcon::Spy]
    ),
    89 => CardFactory::createSuitCard(
        89, PXPEnumSuit::Intelligence, 1, "Aga Mehdi", PXPEnumRegion::Transcapia, 
        null, false, false, false, true, true, true,
        PXPEnumCoalition::Russian, null, 
        [PXPEnumImpactIcon::Spy]
    ),
    90 => CardFactory::createSuitCard(
        90, PXPEnumSuit::Political, 1, "Nasrullah Khan", PXPEnumRegion::Transcapia, 
        null, true, false, false, false, true, false,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Tribe]
    ),
    91 => CardFactory::createSuitCard(
        91, PXPEnumSuit::Political, 1, "Allah Quli Bahadur", PXPEnumRegion::Transcapia, 
        PXPEnumSpecialAbility::SavvyOperator, false, false, false, false, true, false,
        null, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Spy]
    ),
    92 => CardFactory::createSuitCard(
        92, PXPEnumSuit::Political, 1, "Mir Murad Beg", PXPEnumRegion::Transcapia, 
        null, true, false, false, true, false, true,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::MilitarySuit]
    ),
    93 => CardFactory::createSuitCard(
        93, PXPEnumSuit::Political, 2, "Madali Khan", PXPEnumRegion::Transcapia, 
        null, false, false, false, false, true, true,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Tribe, PXPEnumImpactIcon::Tribe]
    ),
    94 => CardFactory::createSuitCard(
        94, PXPEnumSuit::Economic, 1, "Khivan Slave Markets", PXPEnumRegion::Transcapia, 
        null, true, false, false, false, true, false,
        PXPEnumCoalition::British, PXPEnumCoalition::Russian, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Spy, PXPEnumImpactIcon::Leverage]
    ),
    95 => CardFactory::createSuitCard(
        95, PXPEnumSuit::Economic, 1, "Supplies from Orenburg", PXPEnumRegion::Transcapia, 
        null, true, false, false, true, false, false,
        PXPEnumCoalition::Russian, PXPEnumCoalition::Afghan, 
        [PXPEnumImpactIcon::Road]
    ),
    96 => CardFactory::createSuitCard(
        96, PXPEnumSuit::Economic, 1, "Panjdeh Oasis", PXPEnumRegion::Transcapia, 
        null, true, false, false, true, false, false,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Road, PXPEnumImpactIcon::Road]
    ),
    97 => CardFactory::createSuitCard(
        97, PXPEnumSuit::Military, 1, "The Ark of Bukhara", PXPEnumRegion::Transcapia, 
        PXPEnumSpecialAbility::Citadel, false, false, true, false, false, false,
        null, null, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::IntelligenceSuit]
    ),
    98 => CardFactory::createSuitCard(
        98, PXPEnumSuit::Military, 3, "European Cannons", PXPEnumRegion::Transcapia, 
        null, false, true, false, false, false, false,
        null, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army]
    ),
    99 => CardFactory::createSuitCard(
        99, PXPEnumSuit::Military, 1, "Cossacks", PXPEnumRegion::Transcapia, 
        PXPEnumSpecialAbility::Irregulars, false, false, false, false, false, true,
        PXPEnumCoalition::Russian, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Spy]
    ),
    100 => CardFactory::createSuitCard(
        100, PXPEnumSuit::Military, 2, "Count Perovsky", PXPEnumRegion::Transcapia, 
        null, false, false, false, false, false, true,
        PXPEnumCoalition::Russian, PXPEnumCoalition::British, 
        [PXPEnumImpactIcon::Army, PXPEnumImpactIcon::Army]
    ),

];