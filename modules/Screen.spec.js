const Screen = require("./Screen.js")
const WorldMap = require("./WorldMap.js")

describe("Screen - Game screen map window", () => {
  let testPath = "roads.asc"
  let waterPath = "water.asc"
  let buildingPath = "buildings.asc"
  let testWorldMap = new WorldMap
  let testScreen = new Screen(testWorldMap, 150, 118)
  testWorldMap.importMap(waterPath,"water")
  testWorldMap.importMap(testPath,"road")
  testWorldMap.importMap(buildingPath,"building")
  xMin = 150;
  xMax = 230;
  yMin = 118;
  yMax = 142;
  test("Show map", ()=>{
    //testScreen.drawMap()
  })
  test("Scroll map", () => {
    //scroll map
    //testScreen.scrollUp(1)
  })
});
