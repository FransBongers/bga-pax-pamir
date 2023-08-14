define([
  'dojo',
  'dojo/_base/declare',
  'dojo/fx',
  'dojox/fx/ext-dojo/complex',
  'ebg/core/gamegui',
  'ebg/counter',
  'ebg/stock',
  'ebg/zone',
  g_gamethemeurl + "modules/js/bga-animations.js",
], function (dojo, declare) {
  return declare('bgagame.paxpamir', ebg.core.gamegui, new PaxPamir());
});
