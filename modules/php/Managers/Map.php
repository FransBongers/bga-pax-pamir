<?php
namespace PaxPamir\Managers;

use PaxPamir\Core\Globals;

class Map
{

  /*
    Returns rulers for all regions. Value will either be 0 (no ruler) or
    the playerId of the player ruling the region
  */
  public static function getRulers()
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
