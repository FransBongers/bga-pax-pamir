define([
  "dojo","dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  "ebg/stock"
],
function (dojo, declare) {
  return declare("bgagame.paxpamireditiontwo", ebg.core.gamegui, new PaxPamir());             
});