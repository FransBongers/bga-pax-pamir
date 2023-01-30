<?php
namespace PaxPamir;

use PaxPamir\Core\Globals;

trait PPMapTrait
{

  /*
    Returns rulers for all regions. Value will either be 0 (no ruler) or
    the playerId of the player ruling the region
  */
  function getAllRegionRulers()
  {

    $result = array();

    $result['transcaspia'] = Globals::getRulerTranscaspia();
    $result['kabul'] = Globals::getRulerKabul();
    $result['persia'] = Globals::getRulerPersia();
    $result['herat'] = Globals::getRulerHerat();
    $result['kandahar'] = Globals::getRulerKandahar();
    $result['punjab'] = Globals::getRulerPunjab();

    return $result;
  }
}
