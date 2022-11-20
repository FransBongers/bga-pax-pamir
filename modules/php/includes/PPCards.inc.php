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
 * modules/php/includes/PPCards.inc.php
 *
 */
use PPModules\PaxPamirEditionTwo\Factories\PPCardFactory as CardFactory;

use PPModules\PaxPamirEditionTwo\Enums\PPEnumCoalition;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumImpactIcon;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumRegion;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumSuit;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumSpecialAbility;
use PPModules\PaxPamirEditionTwo\Enums\PPEnumEventCardEffect;


$this->cards = [
    /////////////////////////////
    // Suit cards
    /////////////////////////////
    'card_1' => CardFactory::createCourtCard(
        'card_1', PPEnumSuit::Intelligence, 3, clienttranslate("Mohan Lal"), PPEnumRegion::Kabul, 
        PPEnumSpecialAbility::IndispensableAdvisors, false, false, false, true, false, false, 
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy], 
        clienttranslate("\"You all tell yourselves all sorts of fairy stories: you are here to 
        sell us your wonderful British goods, you want to set us free, you 
        want us to grow up… but [you came here] for one reason. To 
        surrender [our kingdom], to give it up. That is the only reason.\"")
    ),
    'card_2' => CardFactory::createCourtCard(
        'card_2', PPEnumSuit::Intelligence, 2, clienttranslate("Jan-Fishan Khan"), PPEnumRegion::Kabul, 
        null, false, false, false, true, false, true, 
        null, PPEnumCoalition::Russian,
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy, PPEnumImpactIcon::Army, PPEnumImpactIcon::MilitarySuit], 
        clienttranslate("Served Shah Shuja and the British during the fi rst 
        Anglo-Afghan War. For his service he was given his 
        name which means “scatterer of souls” from a Sufi 
        couplet: \"If I had a thousand lives I would 
        scatter them all at your blessed feet.\"")
    ),
    'card_3' => CardFactory::createCourtCard(
        'card_3', PPEnumSuit::Intelligence, 2, clienttranslate("Prince Akbar Khan"), PPEnumRegion::Kabul, 
        PPEnumSpecialAbility::Insurrection, false, false, false, false, false, true,
        PPEnumCoalition::Afghan, null, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy, PPEnumImpactIcon::Army, PPEnumImpactIcon::MilitarySuit], 
        clienttranslate("Son of Dost Mohammad and Afghan hero, Akbar Khan 
        led a revolt in Kabul against the British garrison. Later 
        he helped defeat General Elphinstone’s force. He famously 
        captured and killed William Macnaghten")
    ),
    'card_4' => CardFactory::createCourtCard(
        'card_4', PPEnumSuit::Intelligence, 1, clienttranslate("Charles Stoddart"), PPEnumRegion::Kabul, 
        null, false, true, false, true, false, false, 
        null, PPEnumCoalition::Afghan,
        [PPEnumImpactIcon::Spy], 
        clienttranslate("Stoddart was dispatched to Bukhara in an attempt 
        to convince Nasrullah Khan to free Russian slaves 
        and form a treaty with Britain. Upon arriving, 
        he was arrested and eventually beheaded. 
        His death caused a sensation in Britain.")
    ),
    'card_5' => CardFactory::createCourtCard(
        'card_5', PPEnumSuit::Political, 1, clienttranslate("Shah Shujah Durrani"), PPEnumRegion::Kabul, 
        PPEnumSpecialAbility::ClaimOfAncientLineage, false, false, true, false, false, false,
        null, PPEnumCoalition::Afghan,
        [PPEnumImpactIcon::Tribe], 
        clienttranslate("King of Afghanistan, deposed in 1809. He later traded the 
        793 carat Koh-i-Noor diamond to gain his freedom. The 
        British returned him to the throne in 1839, which he held 
        for just three years before his assassination.")
    ),
    'card_6' => CardFactory::createCourtCard(
        'card_6', PPEnumSuit::Political, 1, clienttranslate("Aminullah Khan Logari"), PPEnumRegion::Kabul,
        null, false, false, true, false, false, true,
        PPEnumCoalition::Afghan, null,
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army, PPEnumImpactIcon::Spy], 
        clienttranslate("During the reign of Shah Zaman, he was a prominent governor, 
        who maintained his power even as the Durrani emperors were ousted. 
        Though initially open to Shah Sujah’s restoration, Logari became 
        dissatisfi ed with British participation in Afghan politics.")
    ),
    'card_7' => CardFactory::createCourtCard(
        'card_7', PPEnumSuit::Political, 2, clienttranslate("Dost Mohammad"), PPEnumRegion::Kabul,
        null, false, false, false, false, false, false,
        null, null,
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army, PPEnumImpactIcon::Spy], 
        clienttranslate("Twice king of Afghanistan, Dost Mohammad was 
        born to a prominent family in the service of the 
        Durrani Empire. He was exiled to British India 
        after being usurped by Shah Shujah and the British. 
        He later returned to Kabul and ruled until his 
        death in 1863.")
    ),
    'card_8' => CardFactory::createCourtCard(
        'card_8', PPEnumSuit::Economic, 2, clienttranslate("Kabul Bazaar"), PPEnumRegion::Kabul, 
        null, true, false, false, false, false, false, 
        null, null,
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Spy, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate("Though part of the northern branch of the Silk Road, 
        Afghanistan rarely consumed international goods as 
        traders struggled to generate demand. By the nineteenth 
        century, most of the commerce in the 
        country took place in seasonal markets 
        that capitalized on migration patterns.")
    ),
    'card_9' => CardFactory::createCourtCard(
        'card_9', PPEnumSuit::Economic, 1, clienttranslate("Afghan Handicrafts"), PPEnumRegion::Kabul, 
        null, true, false, false, true, false, false, 
        null, null, 
        [PPEnumImpactIcon::Road], 
        clienttranslate("Afghan crafts s such as weaving, pottery, and metalwork 
        all refl ected the cosmopolitan history of the country. 
        Ancient Islamic motifs could be woven into designs that 
        were both political and aesthetic. These goods 
        were often produced at home and then taken to 
        market for sale during yearly migrations.")
    ),
    'card_10' => CardFactory::createCourtCard(
        'card_10', PPEnumSuit::Economic, 1, clienttranslate("Balkh Arsenic Mine"), PPEnumRegion::Kabul, 
        null, false, false, true, false, true, false, 
        null, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::MilitarySuit], 
        clienttranslate("Commonly associated with its lethal properties, Arsenic has many other applications. In Afghanistan, 
        it was used in fabric dyes to brighten colors and could be combined with black pepper to 
        make a popular British anti-venom called the Tanjore pill.")
    ),
    'card_11' => CardFactory::createCourtCard(
        'card_11', PPEnumSuit::Economic, 2, clienttranslate("Lapis Lazuli Mine"), PPEnumRegion::Kabul, 
        null, true, true, false, false, false, false, 
        PPEnumCoalition::Afghan, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road], 
        clienttranslate("Lapis lazuli has been mined in northwestern 
        Afghanistan for nearly nine thousand years. Prized 
        for its intense blue color, the stone was used in high-end Afghan products, 
        and has been found in ancient Egyptian tombs and throughout Europe and Asia.")
    ),
    'card_12' => CardFactory::createCourtCard(
        'card_12', PPEnumSuit::Economic, 3, clienttranslate("City of Ghazni"), PPEnumRegion::Kabul,
        null, false, true, false, false, false, false, 
        null, null,
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Army], 
        clienttranslate("The ancient capital of the Ghaznavid Empire, 
        which once extended from central Persia to the Punjab. By the nineteenth century, Ghazni was largely 
        in decline, though it still remained a center of trade and was critical to 
        the logistical challenges facing an Afghan state.")
    ),
    'card_13' => CardFactory::createCourtCard(
        'card_13', PPEnumSuit::Economic, 2, clienttranslate("Ghilzai Nomads"), PPEnumRegion::Kabul, 
        null, true, false, false, true, false, false, 
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road], 
        clienttranslate("The Ghilzai people form the largest portion of the Pashtun population 
        with concentrations in central and southern Afghanistan. Many tribes belonging to this 
        group lived nomadically, and they formed an important element of the region’s cultural 
        and commercial foundation.")
    ),
    'card_14' => CardFactory::createCourtCard(
        'card_14', PPEnumSuit::Economic, 2, clienttranslate("Money Landers"), PPEnumRegion::Kabul, 
        null, false, true, true, false, false, false, 
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Leverage], 
        clienttranslate("Because of the scarcity of physical currency, credit was often 
        the only lubricant in local economies and allowed Afghanistan’s small business 
        class to stay liquid and respond to shortages that were endemic to the seasonal 
        nature of the Afghan economy.")
    ),
    'card_15' => CardFactory::createCourtCard(
        'card_15', PPEnumSuit::Military, 1, clienttranslate("Durrani Royal Guard"), PPEnumRegion::Kabul, 
        PPEnumSpecialAbility::Bodyguards, false, false, false, false, true, false, 
        null, null, 
        [PPEnumImpactIcon::Army], 
        clienttranslate("After the death of Ahmad Shah, his son Timur moved the capital from Kandahar 
        to Kabul and recruited Qizilbash, Shia colonists from Persia, to form a Royal Guard which he 
        felt he could trust more than one made up of Pashtuns.")
    ),
    'card_16' => CardFactory::createCourtCard(
        'card_16', PPEnumSuit::Military, 1, clienttranslate("Bala Hissar"), PPEnumRegion::Kabul, 
        null, true, false, false, false, true, false, 
        null, null, 
        [PPEnumImpactIcon::Army], 
        clienttranslate("For over a thousand years the Bala Hissar was the central architectural feature 
        of Kabul. During the Durrani Empire, the palace-fortress also served as the seat of political 
        power in the region. The building was largely destroyed by an armory explosion during the British 
        occupation in 1879.")
    ),
    'card_17' => CardFactory::createCourtCard(
        'card_17', PPEnumSuit::Military, 1, clienttranslate("Citadel of Ghazni"), PPEnumRegion::Kabul, 
        PPEnumSpecialAbility::Citadel, false, false, true, false, false, false, 
        null, null,
        [PPEnumImpactIcon::Army], 
        clienttranslate("The \"key\" to Kabul, this citadel south of the Afghan capital overlooked vital 
        supply routes. It was captured by the British during the fi rst Anglo-Afghan war.")
    ),
    'card_18' => CardFactory::createCourtCard(
        'card_18', PPEnumSuit::Intelligence, 1, clienttranslate("Harry Flashman"), PPEnumRegion::Punjab, 
        null, false, true, false, false, true, false, 
        null, null, 
        [PPEnumImpactIcon::Spy], 
        clienttranslate("The fictional creation of Thomas Hughes, Sir Harry Paget Flashman was a scoundrel, 
        a coward, and a brilliant, charming solider. His fi rst fi ctional adventure was set during the first 
        Anglo-Afghan War. While Flashman never existed, he embodied an ethos widespread in the British imagination.")
    ),
    'card_19' => CardFactory::createCourtCard(
        'card_19', PPEnumSuit::Intelligence, 2, clienttranslate("Eldred Pottinger"), PPEnumRegion::Punjab,
        null, false, false, false, true, true, false, 
        PPEnumCoalition::British, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy, PPEnumImpactIcon::EconomicSuit], 
        clienttranslate("While traveling through Asia in disguise, Pottinger found the city of Herat besieged by 
        Persian forces. He revealed himself to the local commander and helped the Afghan forces defeat the Persians, 
        though Afghan histories dispute his role in lifting the siege.")
    ),
    'card_20' => CardFactory::createCourtCard(
        'card_20', PPEnumSuit::Intelligence, 1, clienttranslate("Henry Rawlinson"), PPEnumRegion::Punjab,
        null, false, true, false, true, false, false, 
        PPEnumCoalition::British, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::EconomicSuit], 
        clienttranslate("Army offi cer, politician, and orientalist, Rawlinson advocated for a larger role for Afghanistan in 
        Britain’s foreign policy. He served as a political agent in Kandahar and fought in the First Anglo-Afghan war.")
    ),
    'card_21' => CardFactory::createCourtCard(
        'card_21', PPEnumSuit::Intelligence, 2, clienttranslate("Alexander Burnes"), PPEnumRegion::Punjab, 
        PPEnumSpecialAbility::StrangeBedfellows, false, false, false, true, false, false, 
        null, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy], 
        clienttranslate("Burns joined the East India Company at 16 and quickly rose through the ranks, aggravating 
        senior operatives like Wade. He advised the British to support Dost Mohammad, but was rebuked by 
        Macnaghten. He nonetheless aided the British coup and was killed when a mob overtook his home in Kabul.")
    ),
    'card_22' => CardFactory::createCourtCard(
        'card_22', PPEnumSuit::Intelligence, 1, clienttranslate("George Hayward"), PPEnumRegion::Punjab, 
        null, false, true, false, true, false, false, 
        PPEnumCoalition::British, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate(" e Royal Geographical Society was primarily apolitical, but, under the leadership of 
        Rawlinson (then its vice president), Hayward was sent on a politically-motivated mission to 
        find the source of the Oxus River that proved fatal. His death was likely an act of political 
        retribution.")
    ),
    'card_23' => CardFactory::createCourtCard(
        'card_23', PPEnumSuit::Intelligence, 1, clienttranslate("Henry Pottinger"), PPEnumRegion::Punjab, 
        null, false, false, false, true, false, true, 
        PPEnumCoalition::British, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::EconomicSuit], 
        clienttranslate("Uncle of Eldred Pottinger, Henry Pottinger led an expedition to Baluchistan and helped 
        map Persia and western India. He would later replace Charles Elliot as the chief diplomat to China and 
        oversaw the Treaty of Nanking and the acquisition of Hong Kong.")
    ),
    'card_24' => CardFactory::createCourtCard(
        'card_24', PPEnumSuit::Political, 2, clienttranslate("Ranjit Singh"), PPEnumRegion::Punjab, 
        PPEnumSpecialAbility::CivilServiceReforms, false, false, false, false, true, false, 
        null, null, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army], 
        clienttranslate("Founder of the Sikh Empire, Ranjit Singh centralized power in the Punjab. Singh maintained 
        power in part through his empire’s religious tolerance and his military reforms.")
    ),
    'card_25' => CardFactory::createCourtCard(
        'card_25', PPEnumSuit::Political, 1, clienttranslate("Josiah Harlan"), PPEnumRegion::Punjab, 
        null, true, false, false, false, false, false,
        PPEnumCoalition::Afghan, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Tribe], 
        clienttranslate("Born in Pennsylvania, Harlan thought himself a modern day Alexander the Great. He enlisted 
        with the East India Company and soon found himself in the service of Ranjit Singh. He later led an attack 
        against Murad Beg and became Prince of Ghor Province.")
    ),
    'card_26' => CardFactory::createCourtCard(
        'card_26', PPEnumSuit::Political, 1, clienttranslate("Paolo Avitabile"), PPEnumRegion::Punjab, 
        null, false, false, false,  false, true, false,
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army], 
        clienttranslate("An Italian veteran of the Napoleonic Wars, Avitabile traveled east after Waterloo, 
        peddling his military expertise. He served as governor of Peshawar under Ranjit Singh. He was a 
        brutal ruler and was infamous for his unorthodox execution techniques, including throwing the condemned 
        from the top of the Mahabat Mosque.")
    ),
    'card_27' => CardFactory::createCourtCard(
        'card_27', PPEnumSuit::Political, 1, clienttranslate("Maqpon Dynasty"), PPEnumRegion::Punjab, 
        null, false, false, true, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Leverage], 
        clienttranslate("The Maqpon royal family held control over Baltistan, a region north of the Sikh Empire, 
        for nearly 700 years. The rulers maintained a cosmopolitan identity that fused elements of Buddhism and 
        Islam. In 1840 the Maqpon dynasty was conquered by Zorawar Singh Kahluria.")
    ),
    'card_28' => CardFactory::createCourtCard(
        'card_28', PPEnumSuit::Economic, 1, clienttranslate("Anarkali Bazaar"), PPEnumRegion::Punjab, 
        null, true, false, true, false, false, false,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Spy], 
        clienttranslate("The oldest of its kind in Lahore, the Anarkali Bazaar is thought to take its name from 
        a nearby mausoleum built to honor the likely fi ctitious slave girl buried alive by order of the Mughal 
        Emperor Akbar.")
    ),
    'card_29' => CardFactory::createCourtCard(
        'card_29', PPEnumSuit::Economic, 2, clienttranslate("Khyber Pass"), PPEnumRegion::Punjab, 
        PPEnumSpecialAbility::CivilServiceReforms, false, false, false, false, false, false,
        null, null,  
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road], 
        clienttranslate(" Providing passage through the Spin Ghar mountains, the Khyber Pass is one of the 
        world’s most highly traffi cked mountain passes and has often been a part of the Silk Road’s northern 
        route. Hari Singh Nalwa controlled the pass under the authority of Ranjit Singh.")
    ),
    'card_30' => CardFactory::createCourtCard(
        'card_30', PPEnumSuit::Economic, 1, clienttranslate("Sikh Merchants in Lahore"), PPEnumRegion::Punjab, 
        null, true, true, false, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Spy, PPEnumImpactIcon::Leverage], 
        clienttranslate("Sikh identity came into being during the ascent of Mughal power. To survive persecution, 
        Sikh gurus sought alliances with other minority religious groups. This coalition also facilitated 
        far-reaching commercial networks, centralized around Lahore.")
    ),
    'card_31' => CardFactory::createCourtCard(
        'card_31', PPEnumSuit::Military, 1, clienttranslate("Company Weapons"), PPEnumRegion::Punjab, 
        null, true, false, false, false, true, false,
        null, null,  
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("A variant of the classic \"Brown Bess\" smooth-bore musket, the India Pattern (1795) was 
        developed by the East India Company and was slightly lighter and more compact than the Short Land musket. 
        The weapon was used until 1850.")
    ),
    'card_32' => CardFactory::createCourtCard(
        'card_32', PPEnumSuit::Military, 3, clienttranslate("Army of the Indus"), PPEnumRegion::Punjab, 
        null, false, false, false, true, false, false,
        PPEnumCoalition::British, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army, PPEnumImpactIcon::Army], 
        clienttranslate("The persistent anxieties of the Russophobes in the East India Company eventually convinced 
        Lord Auckland to form the Army of the Indus in order to topple the Afghan state. When it marched, this massive 
        force of British and Indian troops was made infamous by its massive baggage train. One offi cer even took two 
        camels for the sole purpose of carrying his cigars.")
    ),
    'card_33' => CardFactory::createCourtCard(
        'card_33', PPEnumSuit::Military, 2, clienttranslate("Zorawar Singh Kahluria"), PPEnumRegion::Punjab, 
        null, false, true, false, false, false, true,
        null, null, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army], 
        clienttranslate("Kahluria was instrumental in the expansion of the Sikh Empire. He had a genius for logistics 
        which enabled him to conduct successful campaigns in Ladakh and Baltistan. These conquests secured his 
        reputation as \"The Indian Napoleon.\" He was killed by a Tibetan lancer at To-yo in 1841.")
    ),
    'card_34' => CardFactory::createCourtCard(
        'card_34', PPEnumSuit::Military, 1, clienttranslate("Sindhi Warriors"), PPEnumRegion::Punjab, 
        null, false, false, false, true, true, true,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::EconomicSuit], 
        clienttranslate("Like the Sikhs to the north, the Sindhi people depended upon religious tolerance and 
        alliances for their survival. Their coalition was crushed by Charles Napier’s campaign in 1843.")
    ),
    'card_35' => CardFactory::createCourtCard(
        'card_35', PPEnumSuit::Military, 2, clienttranslate("Hari Singh Nalwa"), PPEnumRegion::Punjab, 
        null, false, false, false, true, false, true,
        null, null, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate("Known as the Baagh Maar or Tiger-killer, he was the central military fi gure that enabled 
        the regional stability of the Sikh Empire. He conquered the Kashmir and was later installed as its governor. 
        He was also known for his feats of military engineering.")
    ),
    'card_36' => CardFactory::createCourtCard(
        'card_36', PPEnumSuit::Military, 1, clienttranslate("Bengal Native Infantry"), PPEnumRegion::Punjab, 
        null, false, false, false, false, true, true,
        PPEnumCoalition::British, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("First formed in the late 18th century, regiments of Bengal infantry were used to augment 
        the forces of the East India Company throughout the subcontinent. Many of these regiments were disbanded 
        after the 1857 Indian Mutiny.")
    ),
    'card_37' => CardFactory::createCourtCard(
        'card_37', PPEnumSuit::Military, 1, clienttranslate("Seaforth, Highlanders"), PPEnumRegion::Punjab, 
        null, false, false, false, true, false, true,
        PPEnumCoalition::British, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate("First raised in the late 18th century by Francis Mackenzie, 1st Baron Seaforth, this regiment 
        saw a variety of colonial action throughout the 19th century and was sent to Afghanistan in 1842.")
    ),
    'card_38' => CardFactory::createCourtCard(
        'card_38', PPEnumSuit::Military, 2, clienttranslate("Akali Sikhs"), PPEnumRegion::Punjab, 
        null, false, false, false, false, false, true,
        null, null, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army], 
        clienttranslate("Among the fi ve symbols of Sikh faith is the Kirpan, a small dagger or sword. This item symbolizes 
        personal sovereignty and resistance to tyranny. Much of the success of the Sikhs in this period could be traced to 
        their capable military prowess.")
    ),
    'card_39' => CardFactory::createCourtCard(
        'card_39', PPEnumSuit::Intelligence, 1, clienttranslate("William Moorcroft"), PPEnumRegion::Kandahar, 
        null, false, false, false, true, false, true,
        null, null, 
        [PPEnumImpactIcon::Spy], 
        clienttranslate("Moorcroft led an expedition to central Asia in search of Marco Polo's legendary \"Turcoman\" 
        horses. He fell ill in Northern Afghanistan and likely died, though some speculate he continued to operate as an 
        informant for twelve more years before dying in an attempt to return to India.")
    ),
    'card_40' => CardFactory::createCourtCard(
        'card_40', PPEnumSuit::Intelligence, 2, clienttranslate("William Hay Macnaghten"), PPEnumRegion::Kandahar, 
        null, true, false, false, true, false, false,
        PPEnumCoalition::British, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy, PPEnumImpactIcon::Leverage], 
        clienttranslate("Macnaghten impressed his superiors with his grasp of Islamic law and quickly rose through the 
        ranks of the EIC. He soon found himself managing a vast international intervention and intelligence network. 
        His administrative failures contributed to EIC's defeat in the First Anglo-Afghan war.")
    ),
    'card_41' => CardFactory::createCourtCard(
        'card_41', PPEnumSuit::Intelligence, 2, clienttranslate("Charles Masson"), PPEnumRegion::Kandahar, 
        PPEnumSpecialAbility::SafeHouse, false, false, true, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy], 
        clienttranslate("Once enlisted in the EIC, Masson faked his death and took on a new name in order to explore 
        Afghanistan on foot, undertaking historical research on ancient Bactria. Much of this work was supported by Prince 
        Akbar Khan. When discovered, he was blackmailed into working as a British informant.")
    ),
    'card_42' => CardFactory::createCourtCard(
        'card_42', PPEnumSuit::Political, 1, clienttranslate("Barakzai Sadars"), PPEnumRegion::Kandahar, 
        PPEnumSpecialAbility::CharismaticCourtiers, false, false, true, false, false, false,
        PPEnumCoalition::Afghan, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Leverage, PPEnumImpactIcon::EconomicSuit], 
        clienttranslate("Dost Mohammad relied on an extensive network of family connections in order to maintain control of 
        Afghanistan. Five of his stepbrothers managed Kandahar and surrounding territories.")
    ),
    'card_43' => CardFactory::createCourtCard(
        'card_43', PPEnumSuit::Political, 1, clienttranslate("Giljee Nobles"), PPEnumRegion::Kandahar, 
        PPEnumSpecialAbility::BlackMail, false, false, false, false, false, true,
        null, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army], 
        clienttranslate("Once a prominent tribe in central Afghanistan, the Giljee were displaced by the Duranni. They were 
        among the first tribes to revolt against the Shah Sujah.")
    ),
    'card_44' => CardFactory::createCourtCard(
        'card_44', PPEnumSuit::Political, 1, clienttranslate("Baluchi Chiefs"), PPEnumRegion::Kandahar, 
        null, true, false, true, false, false, false,
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army], 
        clienttranslate("The Baluchi traditionally controlled the Bolan Pass. The failure of the British to maintain the traditional 
        payments for the security of mountain passes like the Bolan contributed directly to the outbreak of rebellion that 
        eventually destroyed the Army of the Indus.")
    ),
    'card_45' => CardFactory::createCourtCard(
        'card_45', PPEnumSuit::Political, 1, clienttranslate("Haji Khan Kakar"), PPEnumRegion::Kandahar, 
        null, false, true, false, false, true, false,
        null, null, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army], 
        clienttranslate("Originally a staunch supporter of Dost Mohammad and the Barakzai leaders, Kakar was one of the 
        first defectors to Shah Shuja. Afghan poet Maulana Hamid Kashmirir describes Kakar as \"the outsider, the traitor, 
        the master of betrayal… mixing poison in sugar.\"")
    ),
    'card_46' => CardFactory::createCourtCard(
        'card_46', PPEnumSuit::Economic, 2, clienttranslate("Bank"), PPEnumRegion::Kandahar, 
        null, false, true, false, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Leverage, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("The Rupee was the chief currency of Afghanistan during the nineteenth century, with much of the specie 
        coming directly from raids into the Punjab. Because currency was rarely struck locally, banks in the major cities were 
        highly leveraged in order to keep coins in local circulation.")
    ),
    'card_47' => CardFactory::createCourtCard(
        'card_47', PPEnumSuit::Economic, 2, clienttranslate("Bolan Pass"), PPEnumRegion::Kandahar, 
        null, false, true, false, true, false, false,
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Army], 
        clienttranslate("The Army of the Indus used the Bolan Pass to invade central Afghanistan. The dense ridges and maze-like 
        cliff walkways made it easy for the Baluchi to ambush British soldiers without fear of reprisal.")
    ),
    'card_48' => CardFactory::createCourtCard(
        'card_48', PPEnumSuit::Economic, 1, clienttranslate("Fruits market"), PPEnumRegion::Kandahar, 
        null, false, false, true, true, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate("Southern Afghanistan produces some of the highest quality pomegranates in the world. When British 
        troops fi rst entered Kandahar, they were amazed by the quality and variety of the produce at market.")
    ),
    'card_49' => CardFactory::createCourtCard(
        'card_49', PPEnumSuit::Economic, 1, clienttranslate("Kandahari Markets"), PPEnumRegion::Kandahar, 
        null, true, false, true, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate("For much of its history, Kandahar served as a critical agricultural and commercial anchor for the region's 
        nomadic tribes. Its location also provided easy access to the Punjab. For these reasons, Kandahar was designated the capital 
        of the Durrani Empire from 1747 till 1776.")
    ),
    'card_50' => CardFactory::createCourtCard(
        'card_50', PPEnumSuit::Military, 2, clienttranslate("British Regulars"), PPEnumRegion::Kandahar, 
        null, false, false, false, true, false, true,
        PPEnumCoalition::British, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army], 
        clienttranslate("The vast majority of British regiments in the region were directly affi liated with the East India Company. 
        However, the British Army also maintained some units. A few of these, including the 13th Light Infantry, were part of the 
        British invasion through the Bolan Pass.")
    ),
    'card_51' => CardFactory::createCourtCard(
        'card_51', PPEnumSuit::Military, 1, clienttranslate("Sir Johns Keane"), PPEnumRegion::Kandahar, 
        PPEnumSpecialAbility::IndianSupplies, false, false, false, false, false, true,
        PPEnumCoalition::British, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Army], 
        clienttranslate("Keane's varied military career was typical of officers in this period. He fought in the Battle of New Orleans, 
        served in the West Indies, and, eventually, was stationed in India.")
    ),
    'card_52' => CardFactory::createCourtCard(
        'card_52', PPEnumSuit::Military, 1, clienttranslate("Pashtun Mercenary"), PPEnumRegion::Kandahar, 
        null, true, false, false, false, false, true,
        null, null, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate("Often mercenaries were hired to extract revenue from regions outside of a ruler’s traditional control. 
        Many of these mercenary forces were composed of politically ambitious Pashtuns or disenfranchised Giljee nobility.")
    ),
    'card_53' => CardFactory::createCourtCard(
        'card_53', PPEnumSuit::Military, 2, clienttranslate("Jezail Sharpshooters"), PPEnumRegion::Kandahar, 
        null, false, false, false, false, true, false,
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army, PPEnumImpactIcon::Spy], 
        clienttranslate("An inexpensive and extremely eff ective weapon, the muzzle-loading jezail rifl e was a staple of both 
        regular and irregular Afghan forces. Compared to the 150 yard accuracy of the British Brown Bess, experienced jezail 
        sharpshooters could be accurate at ranges up to 500 yards.")
    ),
    'card_54' => CardFactory::createCourtCard(
        'card_54', PPEnumSuit::Intelligence, 1, clienttranslate("Herati Bandits"), PPEnumRegion::Herat, 
        PPEnumSpecialAbility::BlackMail, true, false, false, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Leverage], 
        clienttranslate("After the collapse of the Durrani empire, long stretches of the Silk Road lapsed into lawlessness. 
        Minor tribal rulers competed with bandits in hopes of extracting tolls. As a consequence, overland trade dried up 
        as merchants looked for safer routes.")
    ),
    'card_55' => CardFactory::createCourtCard(
        'card_55', PPEnumSuit::Political, 1, clienttranslate("Hazara Chiefs"), PPEnumRegion::Herat, 
        null, true, false, false, true, false, true,
        null, null,  
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army], 
        clienttranslate("The Persian-speaking Hazara people ruled a semi-autonomous region in western Afghanistan that remained 
        outside of both the Persian and Afghan emperors until the second reign of Dost Mohammad.")
    ),
    'card_56' => CardFactory::createCourtCard(
        'card_56', PPEnumSuit::Political, 2, clienttranslate("Yar Mohammad Alikozai"), PPEnumRegion::Herat, 
        PPEnumSpecialAbility::WellConnected, false, false, false, false, true, false,
        null, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Tribe, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate("A political insider who was able to maintain infl uence throughout the 19th century, Yar Mohammad often 
        served as a high level advisor. In 1839 he betrayed Prince Kameran and expelled British agents in hopes of placing Herat 
        under Persian influence and protection.")
    ),
    'card_57' => CardFactory::createCourtCard(
        'card_57', PPEnumSuit::Political, 1, clienttranslate("Exiled Durrani Nobility"), PPEnumRegion::Herat, 
        null, false, false, false, true, true, false,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Tribe], 
        clienttranslate("Many scions of the Durrani empire attempted to retain some authority in exile. They often maintained small, 
        underground courts in the region’s more independent cities such as Herat. Dost Mohammad was systematic in his persecution of 
        the former ruling class and made an example of those he caught, such as Shah Zaman whom he had blinded and imprisoned.")
    ),
    'card_58' => CardFactory::createCourtCard(
        'card_58', PPEnumSuit::Political, 1, clienttranslate("Ishaqzai"), PPEnumRegion::Herat, 
        null, false, true, true, false, false, false,
        PPEnumCoalition::Afghan, null, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::EconomicSuit], 
        clienttranslate("The Ishaqzai were prominent during the Durrani empire but fell out of power with the ascendancy of the 
        Barakzai. In the later 19th century they were relentlessly persecuted and forced to abandon their nomadic lifestyle for 
        farming settlements.")
    ),
    'card_59' => CardFactory::createCourtCard(
        'card_59', PPEnumSuit::Military, 2, clienttranslate("Tajik Warband"), PPEnumRegion::Herat, 
        null, false, false, false, false, true, true,
        null, null, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army], 
        clienttranslate("The Tajik people have their origins in the Muslim armies that crossed into central Asia in the 8th century. 
        Because of the dominance of the Samanid Empire in the 9th and 10th centuries, Tajik people can be found throughout the 
        region, forming a considerable plurality in western Afghanistan.")
    ),
    'card_60' => CardFactory::createCourtCard(
        'card_60', PPEnumSuit::Military, 1, clienttranslate("Nomadic Warlord"), PPEnumRegion::Herat, 
        null, true, true, false, false, false, true,
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Army], 
        clienttranslate("Many tribes in Afghanistan were nomadic and herdsmen by trade. Still, they sometimes formed warbands 
        and used seasonal raids to supplement their income.")
    ),
    'card_61' => CardFactory::createCourtCard(
        'card_61', PPEnumSuit::Economic, 2, clienttranslate("Karakul Sheep"), PPEnumRegion::Herat, 
        null, true, false, false, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road], 
        clienttranslate("Karakul sheep had a coarse wool which was suitable only for rug-making. Their chief value was in their fat 
        tails, which were used in cuisine and in soap-making.")
    ),
    'card_62' => CardFactory::createCourtCard(
        'card_62', PPEnumSuit::Economic, 1, clienttranslate("Qanat System"), PPEnumRegion::Herat, 
        null, false, true, true, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::PoliticalSuit], 
        clienttranslate("An ancient irrigation technology that is still in use in the present day, qanats use a series of vertical 
        shafts and gently sloping tunnels to irrigate fi elds and regulate the fl ow of water while off ering protection from 
        evaporation.")
    ),
    'card_63' => CardFactory::createCourtCard(
        'card_63', PPEnumSuit::Economic, 3, clienttranslate("Farah Road"), PPEnumRegion::Herat, 
        null, false, false, false, true, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Road], 
        clienttranslate("Because of the long winter and diffi cult conditions of the passes between Herat and Kabul, west-bound 
        commercial traffi c was routed through Kandahar and then through Farah. Like most trade in Afghanistan, the goods on this route 
        would have been luxury items because of the expense of the trip.")
    ),
    'card_64' => CardFactory::createCourtCard(
        'card_64', PPEnumSuit::Economic, 2, clienttranslate("Opium Fields"), PPEnumRegion::Herat, 
        null, true, false, false, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Spy, PPEnumImpactIcon::MilitarySuit], 
        clienttranslate("Though opium would prove a lucrative cash crop for Afghan farmers in the 20th century, during the 19th 
        century production was subdued at best and was only traded regionally.")
    ),
    'card_65' => CardFactory::createCourtCard(
        'card_65', PPEnumSuit::Economic, 1, clienttranslate("Minaret of Jam"), PPEnumRegion::Herat, 
        null, true, false, false, true, false, true,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Army], 
        clienttranslate("One of the ancient roads between Herat and Kabul is marked by this medieval structure. Built around 1190, 
        some suggest that it was part of Firozkoh, the lost capital of the Ghorid dynasty which was destroyed by Ögedei Khan, the 
        son of Genghis Khan.")
    ),
    'card_66' => CardFactory::createCourtCard(
        'card_66', PPEnumSuit::Economic, 2, clienttranslate("Baluchi Smugglers"), PPEnumRegion::Herat, 
        PPEnumSpecialAbility::HeratInfluence, false, false, false, false, false, true,
        null, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Army], 
        clienttranslate("The Baluchi long controlled the Bolan Pass and participated in trade with the Indian subcontinent. Smugglers 
        even ran goods throughout southern Afghanistan and into Persia.")
    ),
    'card_67' => CardFactory::createCourtCard(
        'card_67', PPEnumSuit::Economic, 2, clienttranslate("Wheat Fields"), PPEnumRegion::Herat, 
        null, false, true, false, true, false, false,
        null, null, 
        [PPEnumImpactIcon::Road], 
        clienttranslate("Wheat has served as Afghanistan’s agricultural mainstay since antiquity. Though subsistence farming let 
        little for the market, wheat was still sometimes milled into fl our for sale to nomadic herdsmen.")
    ),
    'card_68' => CardFactory::createCourtCard(
        'card_68', PPEnumSuit::Intelligence, 2, clienttranslate("Ghaem Magham Farahani"), PPEnumRegion::Persia, 
        PPEnumSpecialAbility::PersianInfluence, true, false, false, false, false, false,
        null, null,  
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy, PPEnumImpactIcon::Army], 
        clienttranslate("Politician, scientist, and poet who briefl y served as prime minister of Iran. He was betrayed and murdered 
        on the orders of Mohammad Shah Qajar in 1835.")
    ),
    'card_69' => CardFactory::createCourtCard(
        'card_69', PPEnumSuit::Intelligence, 2, clienttranslate("Count Ivan Simonich"), PPEnumRegion::Persia, 
        null, false, false, false, true, false, true,
        PPEnumCoalition::Russian, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy], 
        clienttranslate("Russian diplomat and intelligence officer who helped coordinate information networks across central Asia. 
        He helped the Persians direct the unsuccessful siege of Herat in 1838.")
    ),
    'card_70' => CardFactory::createCourtCard(
        'card_70', PPEnumSuit::Intelligence, 2, clienttranslate("Alexander Griboyedov"), PPEnumRegion::Persia, 
        PPEnumSpecialAbility::RussianInfluence, false, false, false, true, false, false,
        PPEnumCoalition::Russian, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy], 
        clienttranslate("Satirist, playwright, and Alexander Pushkin's closest friend, Griboyedov served as the Russian ambassador 
        to Persia. He attempted to provide asylum to three refugees who fled the royal harems and was killed when a mob stormed 
        the embassy.")
    ),
    'card_71' => CardFactory::createCourtCard(
        'card_71', PPEnumSuit::Intelligence, 1, clienttranslate("Joseph Wolff"), PPEnumRegion::Persia, 
        null, true, false, false, true, false, false,
        PPEnumCoalition::British, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Spy], 
        clienttranslate("Joseph Wolff was a minor celebrity among evangelical travel writers in England. He befriended Arthur Conolly 
        on a previous journey to Asia, and, upon seeing the news of his imprisonment, embarked on a quixotic journey to Bukhara to 
        save his friend. He did not succeed.")
    ),
    'card_72' => CardFactory::createCourtCard(
        'card_72', PPEnumSuit::Intelligence, 2, clienttranslate("Claude Wade"), PPEnumRegion::Persia, 
        PPEnumSpecialAbility::SafeHouse, false, false, false, true, false, false,
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy], 
        clienttranslate("Bengal-born scholar of Persia who served as a diplomatic agent in Ludhiana, Wade distrusted Alexander 
        Burnes and helped make the case for deeper British involvement in the region.")
    ),
    'card_73' => CardFactory::createCourtCard(
        'card_73', PPEnumSuit::Intelligence, 1, clienttranslate("Jean-François Allard"), PPEnumRegion::Persia, 
        null, false, false, true, false, false, true,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::MilitarySuit], 
        clienttranslate("Allard served as captain of the 7th Hussars under Napoleon. After the defeat at Waterloo, Allard 
        traveled throughout Persia and central Asia. He eventually came to serve Ranjit Singh and helped reform the 
        Sikh military.")
    ),
    'card_74' => CardFactory::createCourtCard(
        'card_74', PPEnumSuit::Political, 1, clienttranslate("Hajj Mirza Aghasi"), PPEnumRegion::Persia, 
        null, false, false, false, false, true, true,
        PPEnumCoalition::Afghan, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("Prime minister to Mohammad Shah Qajar. He brought the Shah into Sufi mysticism. Aghasi fought against the 
        mullahs who sought to decentralize Persian political authority and attempted to modernize the country while maintaining 
        independence from the West.")
    ),
    'card_75' => CardFactory::createCourtCard(
        'card_75', PPEnumSuit::Political, 1, clienttranslate("Abbas Mirza"), PPEnumRegion::Persia, 
        null, true, false, false, false, false, true,
        true, true, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army], 
        clienttranslate("A son of Fath Ali-Shah, Mirza was trained as a military commander and led troops against Russia and the 
        Ottomans. He sent young commanders to Europe in hopes of integrating new military tactics into the Persian Army, but was 
        largely unable to modernize the Persian army.")
    ),
    'card_76' => CardFactory::createCourtCard(
        'card_76', PPEnumSuit::Political, 2, clienttranslate("Fath-Ali Shah"), PPEnumRegion::Persia, 
        null, false, false, false, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Tribe, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("Fath-Ali Shah developed Persian court etiquette and oversaw a growth in artistic production. Despite 
        engaging in numerous wars with the Russians, Fath-Ali Shah maintained diplomatic and commercial contact with Russia 
        and other Western powers.")
    ),
    'card_77' => CardFactory::createCourtCard(
        'card_77', PPEnumSuit::Political, 1, clienttranslate("Mohammad Shah"), PPEnumRegion::Persia, 
        null, false, false, true, false, true, false,
        null, null, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("The grandson of Fath Ali-Shah, he was the designated heir to the Persian throne. Mohammad Shah rebuffed 
        British attempts to outlaw the slave trade and fell under Russian infl uence in his effort to modernize Iran. Though sickly 
        throughout his life, Mohammad Shah was a capable ruler.")
    ),
    'card_78' => CardFactory::createCourtCard(
        'card_78', PPEnumSuit::Economic, 2, clienttranslate("Civic Improvements"), PPEnumRegion::Persia, 
        PPEnumSpecialAbility::CivilServiceReforms, false, false, true, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Leverage, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("The Qajar dynasty of Persia made large capital investments to expand the road network. This was largely a 
        measure to integrate the border tribes with city centers.")
    ),
    'card_79' => CardFactory::createCourtCard(
        'card_79', PPEnumSuit::Economic, 1, clienttranslate("Persian Slave Markets"), PPEnumRegion::Persia, 
        null, true, false, false, true, false, false,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Spy, PPEnumImpactIcon::Leverage], 
        clienttranslate("In central Asia the slave trade continued throughout the 19th century. Many slaves were originally from 
        populations that had been displaced by war or famine. Others came to market by way of the Indian Ocean and Africa's 
        eastern coast.")
    ),
    'card_80' => CardFactory::createCourtCard(
        'card_80', PPEnumSuit::Economic, 1, clienttranslate("Anglo-Paersian Trade"), PPEnumRegion::Persia, 
        null, true, false, true, false, false, false,
        PPEnumCoalition::British, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Leverage], 
        clienttranslate("The relationship between Britain and Persia was fluid for much the 19th century. The British formed 
        a strategic alliance with the Persians in 1801 as a bulwark against French expansion in the East. However, the Persians 
        supported Napoleon in 1807 and joined analliance against Russia.")
    ),
    'card_81' => CardFactory::createCourtCard(
        'card_81', PPEnumSuit::Economic, 2, clienttranslate("Russo-Persian Trade"), PPEnumRegion::Persia, 
        null, true, false, true, false, false, false,
        PPEnumCoalition::Russian, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road, PPEnumImpactIcon::Leverage], 
        clienttranslate("Persia's defeat in the Russo-Persian War led to the 1828 Treaty of Turkmenchay. Persia off ered Russia 
        territorial and economic concessions, including the right for Persian ships to navigate the Caspian Sea. The treaty 
        sparked outrage throughout Persia and led to the storming of the Russian embassy.")
    ),
    'card_82' => CardFactory::createCourtCard(
        'card_82', PPEnumSuit::Military, 2, clienttranslate("Persian Army"), PPEnumRegion::Persia, 
        null, false, true, false, false, false, true,
        null, null, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("In an eff ort to modernize the army, Abbas Mirza sent many Persian offi cers to England in 1813. Improved 
        training led to the growth of Persian regional power, especially in relation to their chief rivals in Russia and the 
        Ottoman Empire.")
    ),
    'card_83' => CardFactory::createCourtCard(
        'card_83', PPEnumSuit::Military, 1, clienttranslate("Shah's Guard"), PPEnumRegion::Persia, 
        PPEnumSpecialAbility::Bodyguards, true, false, false, false, false, false,
        true, true,  
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Spy], 
        clienttranslate("One of the world's oldest military institutions with roots in the \"Immortal Guard\" of the Achaemenid Empire, 
        these elite guards were an important dimension of the civic power of the Qajar dynasty.")
    ),
    'card_84' => CardFactory::createCourtCard(
        'card_84', PPEnumSuit::Military, 2, clienttranslate("Russian Regulars"), PPEnumRegion::Persia, 
        null, false, false, false, false, false, true,
        PPEnumCoalition::Russian, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army, PPEnumImpactIcon::EconomicSuit], 
        clienttranslate("Infantrymen were often stationed at Orenburg which served as a staging ground for Russian operations 
        across the Transcaspian Oblast.")
    ),
    'card_85' => CardFactory::createCourtCard(
        'card_85', PPEnumSuit::Intelligence, 1, clienttranslate("Bukharan Jews"), PPEnumRegion::Transcaspia, 
        null, false, true, true, false, false, false,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Leverage, PPEnumImpactIcon::EconomicSuit], 
        clienttranslate("Jewish populations have lived in central Asia since the 7th century but routinely faced persecution. In the 
        early 19th century, many Jews fl ed Persia and settled in major cities across the region, including Bukhara, Herat, and Kabul.")
    ),
    'card_86' => CardFactory::createCourtCard(
        'card_86', PPEnumSuit::Intelligence, 2, clienttranslate("Jan Prosper Witkiewicz"), PPEnumRegion::Transcaspia, 
        null, false, false, true, true, false, false,
        PPEnumCoalition::Russian, null, 
        [PPEnumImpactIcon::Spy, PPEnumImpactIcon::Spy], 
        clienttranslate("Exiled to central Asia at 14 for attempting to organize a resistance against Russia in Poland, he made the most 
        of his misfortune and found work within the Russian Foreign Service. He failed to deliver Kabul to his Russian masters. Disheartened, 
        he burned his personal papers and committed suicide.")
    ),
    'card_87' => CardFactory::createCourtCard(
        'card_87', PPEnumSuit::Intelligence, 1, clienttranslate("Imperial Surveyors"), PPEnumRegion::Transcaspia, 
        null, false, true, true, true, false, false,
        PPEnumCoalition::Russian, null, 
        [PPEnumImpactIcon::Spy], 
        clienttranslate("Many diplomatic missions to the Russian steppe and central Asia used map-making as a cover for 
        their intelligence gathering. The most famous of these was the Great Trigonometrical Survey led by the British 
        to map the Indian subcontinent. ")
    ),
    'card_88' => CardFactory::createCourtCard(
        'card_88', PPEnumSuit::Intelligence, 1, clienttranslate("Arthur Conolly"), PPEnumRegion::Transcaspia, 
        null, false, true, false, true, false, false,
        PPEnumCoalition::British, null, 
        [PPEnumImpactIcon::Spy], 
        clienttranslate("A renowned explorer and travel writer, Conolly first coined the phrase \"The Great Game\". During a later 
        expedition, he was captured while attempting to rescue Charles Stoddart. The two were beheaded in Bukhara.")
    ),
    'card_89' => CardFactory::createCourtCard(
        'card_89', PPEnumSuit::Intelligence, 1, clienttranslate("Aga Mehdi"), PPEnumRegion::Transcaspia, 
        null, false, false, false, true, true, true,
        PPEnumCoalition::Russian, null, 
        [PPEnumImpactIcon::Spy], 
        clienttranslate("Disguised as a merchant from Yarkand, Mehdi was, in fact, a Russian agent who operated in and around Kashmir. 
        He attempted to open diplomatic channels with Ranjit Singh.")
    ),
    'card_90' => CardFactory::createCourtCard(
        'card_90', PPEnumSuit::Political, 1, clienttranslate("Nasrullah Khan"), PPEnumRegion::Transcaspia, 
        null, true, false, false, false, true, false,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Tribe], 
        clienttranslate("A fierce and paranoid ruler, Nasrullah Khan gained notoriety across Europe for the imprisonment and 
        execution of two British agents. In the 1830s Nasrullah organized several unsuccessful campaigns in the region against 
        other local Khans in a bid for regional supremacy.")
    ),
    'card_91' => CardFactory::createCourtCard(
        'card_91', PPEnumSuit::Political, 1, clienttranslate("Allah Quli Bahadur"), PPEnumRegion::Transcaspia, 
        PPEnumSpecialAbility::SavvyOperator, false, false, false, false, true, false,
        null, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Army, PPEnumImpactIcon::Spy], 
        clienttranslate("Bahadur ramped up the enslavement of Russian citizens in order to compensate for shortfalls in trade. 
        Fearing a Russian casus belli, British agents convinced the Khan to release the Russian slaves.")
    ),
    'card_92' => CardFactory::createCourtCard(
        'card_92', PPEnumSuit::Political, 1, clienttranslate("Mir Murad Beg"), PPEnumRegion::Transcaspia, 
        null, true, false, false, true, false, true,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Spy, PPEnumImpactIcon::MilitarySuit], 
        clienttranslate("Khan of Kunduz and later ruler of Bukhara, Mir Murad Beg's kingdom eventually extended to much of 
        modern day Uzbekistan.")
    ),
    'card_93' => CardFactory::createCourtCard(
        'card_93', PPEnumSuit::Political, 2, clienttranslate("Madali Khan"), PPEnumRegion::Transcaspia, 
        null, false, false, false, false, true, true,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Tribe, PPEnumImpactIcon::Tribe], 
        clienttranslate("Ascending to the throne at the age of 12, he expanded the Khanate of Kokand to its greatest territorial extent. 
        Unlike his predecessor, Madali Khan opened diplomatic relationships with European powers. His removal from power led to decades 
        of political turmoil in the region.")
    ),
    'card_94' => CardFactory::createCourtCard(
        'card_94', PPEnumSuit::Economic, 1, clienttranslate("Khivan Slave Markets"), PPEnumRegion::Transcaspia, 
        null, true, false, false, false, true, false,
        PPEnumCoalition::British, PPEnumCoalition::Russian, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Spy, PPEnumImpactIcon::Leverage], 
        clienttranslate("In central Asia the slave trade continued throughout the 19th century. Many slaves were originally from 
        populations that had been displaced by war or famine. Others came to market by way of the Indian Ocean and Africa's 
        eastern coast.")
    ),
    'card_95' => CardFactory::createCourtCard(
        'card_95', PPEnumSuit::Economic, 1, clienttranslate("Supplies from Orenburg"), PPEnumRegion::Transcaspia, 
        null, true, false, false, true, false, false,
        PPEnumCoalition::Russian, PPEnumCoalition::Afghan, 
        [PPEnumImpactIcon::Road], 
        clienttranslate("The city of Orenburg was a critical outpost, supply depot, and administrative city in the Russian Empire, 
        enabling the Empire to project power across the steppe of central Asia. Virtually all diplomatic officers and military forces 
        operating in the region were supported through Orenburg.")
    ),
    'card_96' => CardFactory::createCourtCard(
        'card_96', PPEnumSuit::Economic, 1, clienttranslate("Panjdeh Oasis"), PPEnumRegion::Transcaspia, 
        null, true, false, false, true, false, false,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Road, PPEnumImpactIcon::Road], 
        clienttranslate("This location was central to overland trade with the Khanates of the Transcaspian. The caravans of this 
        route were dominated by the Lohanis who were often considered the richest and most stable of the nomadic merchants of 
        Afghanistan.")
    ),
    'card_97' => CardFactory::createCourtCard(
        'card_97', PPEnumSuit::Military, 1, clienttranslate("The Ark of Bukhara"), PPEnumRegion::Transcaspia, 
        PPEnumSpecialAbility::Citadel, false, false, true, false, false, false,
        null, null, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::IntelligenceSuit], 
        clienttranslate("Built in the 5th century, the Ark is a massive fortress which legend says was constructed by the epic hero 
        Siyavusha. The Ark has undergone centuries of renovation and improvement. ")
    ),
    'card_98' => CardFactory::createCourtCard(
        'card_98', PPEnumSuit::Military, 3, clienttranslate("European Cannons"), PPEnumRegion::Transcaspia, 
        null, false, true, false, false, false, false,
        null, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army, PPEnumImpactIcon::Army], 
        clienttranslate("Western weaponry was commonly shipped to proxy states on the imperial frontiers in order to effi ciently 
        gain the upper hand over numerically superior native forces. Such supplies enabled the successful seizure of Georgia 
        and Dagestan during the Russo-Persia war")
    ),
    'card_99' => CardFactory::createCourtCard(
        'card_99', PPEnumSuit::Military, 1, clienttranslate("Cossacks"), PPEnumRegion::Transcaspia, 
        PPEnumSpecialAbility::Irregulars, false, false, false, false, false, true,
        PPEnumCoalition::Russian, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Spy], 
        clienttranslate("Cossacks formed an important component of the Russian strategy in central Asia. These irregular cavalry 
        served as scouts, police forces, and skirmishers.")
    ),
    'card_100' => CardFactory::createCourtCard(
        'card_100', PPEnumSuit::Military, 2, clienttranslate("Count Perovsky"), PPEnumRegion::Transcaspia, 
        null, false, false, false, false, false, true,
        PPEnumCoalition::Russian, PPEnumCoalition::British, 
        [PPEnumImpactIcon::Army, PPEnumImpactIcon::Army], 
        clienttranslate("Taken prisoner during the Napoleonic Wars, Perovsky continued his military career after being freed during 
        the fall of Paris. In 1839 he led an expeditionary force from Orenburg in an attempt to subdue the Khanate of Khiva. His 
        campaigns set the stage for a series of treaties that would put central Asia fi rmly under the control of the Russian Empire.")
    ),

    /////////////////////////////
    // Dominance check cards
    /////////////////////////////
    'card_101' => CardFactory::createDominanceCheckCard('card_101'),
    'card_102' => CardFactory::createDominanceCheckCard('card_102'),
    'card_103' => CardFactory::createDominanceCheckCard('card_103'),
    'card_104' => CardFactory::createDominanceCheckCard('card_104'),

    /////////////////////////////
    // Event cards
    /////////////////////////////
    'card_105' => CardFactory::createEventCard(
        'card_105', PPEnumEventCardEffect::MilitarySuit, clienttranslate(""), PPEnumEventCardEffect::NewTactics, 
        clienttranslate("Your military cards are always considered favored until the next Dominance Check.")
    ),
    'card_106' => CardFactory::createEventCard(
        'card_106', PPEnumEventCardEffect::EmbarrassementOfRiches, 
        clienttranslate("Gifts are not worth infl uence until after the next Dominance Check."), 
        PPEnumEventCardEffect::KohINoorRecovered, 
        clienttranslate("Each of your gifts is worth an additional influence point until after the next Dominance Check.")
    ),
    'card_107' => CardFactory::createEventCard(
        'card_107', PPEnumEventCardEffect::DisregardForCustoms, 
        clienttranslate("All ignore all bribes until the next Dominance Check."), 
        PPEnumEventCardEffect::CourtlyManners, 
        clienttranslate("You may choose to not pay bribes until the next Dominance Check.")
    ),
    'card_108' => CardFactory::createEventCard(
        'card_108', PPEnumEventCardEffect::FailureToImpress, 
        clienttranslate("All discard all loyalty prizes."), 
        PPEnumEventCardEffect::Rumor, 
        clienttranslate("Choose a player. Their patriots do not count for infl uence until after the next Dominance Check.")
    ),
    'card_109' => CardFactory::createEventCard(
        'card_109', PPEnumEventCardEffect::RiotsInPunjab, 
        clienttranslate("Remove all tribes and armies in Punjab."), 
        PPEnumEventCardEffect::ConflictFatigue, 
        clienttranslate("Coalitions require only two more blocks in order to be dominant during the next Dominance Check.")
    ),
    'card_110' => CardFactory::createEventCard(
        'card_110', PPEnumEventCardEffect::RiotsInHerat, 
        clienttranslate("Remove all tribes and armies in Herat."), 
        PPEnumEventCardEffect::Nationalism, 
        clienttranslate("Your tribes may move and battle as if they were armies until the next Dominance Check.")
    ),
    'card_111' => CardFactory::createEventCard(
        'card_111', PPEnumEventCardEffect::NoEffect, 
        clienttranslate(""), 
        PPEnumEventCardEffect::PublicWithdrawal, 
        clienttranslate("")
    ),
    'card_112' => CardFactory::createEventCard(
        'card_112', PPEnumEventCardEffect::RiotsInKabul, 
        clienttranslate("No effect."), 
        PPEnumEventCardEffect::NationBuilding, 
        clienttranslate("This card cannot be purchased. Any money placed on this card in the market is instead removed from the game.")
    ),
    'card_113' => CardFactory::createEventCard(
        'card_113', PPEnumEventCardEffect::RiotsInPersia, 
        clienttranslate("Remove all tribes and armies in Kabul."), 
        PPEnumEventCardEffect::BackingOfPersianAristocracy, 
        clienttranslate("Place twice as many blocks when you take the build action until the next Dominance Check.")
    ),
    'card_114' => CardFactory::createEventCard(
        'card_114', PPEnumEventCardEffect::ConfidenceFailure, 
        clienttranslate("Remove all tribes and armies in Persia."), 
        PPEnumEventCardEffect::OtherPersuasiveMethods, 
        clienttranslate("Take three rupees from the bank.")
    ),
    'card_115' => CardFactory::createEventCard(
        'card_115', PPEnumEventCardEffect::IntelligenceSuit, 
        clienttranslate("All players must immediately discard a card from their hand."), 
        PPEnumEventCardEffect::PashtunwaliValues, 
        clienttranslate("Exchange your hand with another player. You may exchange an empty hand.")
    ),
    'card_116' => CardFactory::createEventCard(
        'card_116', PPEnumEventCardEffect::PoliticalSuit, 
        clienttranslate("Choose a suit to favor. All favored suit change impact icons are ignored until the next Dominance Check."), 
        PPEnumEventCardEffect::Rebuke, 
        clienttranslate("Remove all tribes and armies in a single region.")
    )
];

    