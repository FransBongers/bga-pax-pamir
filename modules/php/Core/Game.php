<?php
namespace PaxPamir\Core;
use PaxPamirEditionTwo;

/*
 * Game: a wrapper over table object to allow more generic modules
 */
class Game
{
  public static function get()
  {
    return PaxPamirEditionTwo::get();
  }
}
