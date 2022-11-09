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
    const IndispensableAdvisor = "IndispensableAdvisor"; // Card #1
    const Insurrection = "Insurrection"; // Card #3
    const ClaimOfAncientLineage = "ClaimOfAncientLineage"; // Card #5
    const Bodyguards = "Bodyguards"; // Card #15, #83                   Your political cards cannot be targets of the betray action
    const Citadel = "Citadel"; // Card #16, #97                         Your tribes in 'Region' cannot be attacked
    const StrangeBedfellows = "StrangeBedfellows"; // Card #21
    const CivilServiceReforms = "CivilServiceReforms"; // Card #24
    const SafeHouse = "SafeHouse"; // Card #41, #72                     When another player removes your spy in battle, you may place it on this card instead.
    const CharismaticCourtiers = "CharismaticCourtiers"; // Card #42
    const BlackMail = "BlackMail"; // Card #43, #54
    const IndianSupplies = "IndianSupplies"; // Card #51
    const WellConnected = "WellConnected"; // Card #56                  Your spies may double their distance when using a move action.
    const HeratInfluence = "HeratInfluence"; // Card #66                You do not pay for Herat cards in the market
    const PersianInfluence = "PersianInfluence"; // Card #68            You do not pay for Persia cards in the market
    const RussianInfluence = "RussianInfluence"; // Card #70            You do not pay for Russian Patriots in the market
    const Infrastructure = "Infrastructure"; // Card #78                After you take the build action, place one additional block in a legal place
    const SavvyOperator = "SavvyOperator"; // Card #91                  This card is always treated as if it were in the favored suit.
    const Irregulars = "Irregulars"; // Card #99                        This card is always treated as if it were in the favored suit.
}