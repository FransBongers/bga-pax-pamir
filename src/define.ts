define([
  'dojo',
  'dojo/_base/declare',
  g_gamethemeurl + 'modules/js/vendor/nouislider.min.js',
  'dojo/fx',
  'dojox/fx/ext-dojo/complex',
  'ebg/core/gamegui',
  'ebg/counter',
  'ebg/stock',
  'ebg/zone',
], function (dojo, declare, noUiSliderDefined) {
  if (noUiSliderDefined) {
    noUiSlider = noUiSliderDefined;
  }
  return declare('bgagame.paxpamir', ebg.core.gamegui, new PaxPamir());
});
