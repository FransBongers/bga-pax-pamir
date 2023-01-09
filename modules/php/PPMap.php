<?php

trait PPMapTrait
{
  public function setInitialRulers()
  {
    // Rulers: value is 0 if no ruler, otherwise playerId of the ruling player
    self::setGameStateInitialValue('ruler_transcaspia', 0);
    self::setGameStateInitialValue('ruler_kabul', 0);
    self::setGameStateInitialValue('ruler_persia', 0);
    self::setGameStateInitialValue('ruler_herat', 0);
    self::setGameStateInitialValue('ruler_kandahar', 0);
    self::setGameStateInitialValue('ruler_punjab', 0);
  }

  /*
    Returns rulers for all regions. Value will either be 0 (no ruler) or
    the playerId of the player ruling the region
  */
  function getAllRegionRulers()
  {

    $result = array();

    $result['transcaspia'] = intval($this->getGameStateValue('ruler_transcaspia'));
    $result['kabul'] = intval($this->getGameStateValue('ruler_kabul'));
    $result['persia'] = intval($this->getGameStateValue('ruler_persia'));
    $result['herat'] = intval($this->getGameStateValue('ruler_herat'));
    $result['kandahar'] = intval($this->getGameStateValue('ruler_kandahar'));
    $result['punjab'] = intval($this->getGameStateValue('ruler_punjab'));

    return $result;
  }
}
