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
 * modules/php/Objects/PXPEnumSpecialAbility.php
 *
 */

namespace PhobyJuan\PaxPamirEditionTwo\Enums;

abstract class PXPEnumSpecialAbility
{
    const IndispensableAdvisors = "indispensable_advisors"; // Card #1
    const Insurrection = "insurrection"; // Card #3
    const ClaimOfAncientLineage = "claim_of_ancient_lineage"; // Card #5
    const Bodyguards = "bodyguards"; // Card #15, #83                   Your political cards cannot be targets of the betray action
    const Citadel = "citadel"; // Card #16, #97                         Your tribes in 'Region' cannot be attacked
    const StrangeBedfellows = "strange_bedfellows"; // Card #21
    const CivilServiceReforms = "civil_service_reforms"; // Card #24
    const SafeHouse = "safe_house"; // Card #41, #72                     When another player removes your spy in battle, you may place it on this card instead.
    const CharismaticCourtiers = "charismatic_courtiers"; // Card #42
    const BlackMail = "black_mail"; // Card #43, #54
    const IndianSupplies = "indian_supplies"; // Card #51
    const WellConnected = "well_connected"; // Card #56                  Your spies may double their distance when using a move action.
    const HeratInfluence = "herat_influence"; // Card #66                You do not pay for Herat cards in the market
    const PersianInfluence = "persian_influence"; // Card #68            You do not pay for Persia cards in the market
    const RussianInfluence = "russian_influence"; // Card #70            You do not pay for Russian Patriots in the market
    const Infrastructure = "infrastructure"; // Card #78                After you take the build action, place one additional block in a legal place
    const SavvyOperator = "savvy_operator"; // Card #91                  This card is always treated as if it were in the favored suit.
    const Irregulars = "irregulars"; // Card #99                        This card is always treated as if it were in the favored suit.
}