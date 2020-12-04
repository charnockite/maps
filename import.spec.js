const importMaps = require("./importMaps.js")

describe("Create objects", () =>{
  //create required objects
  test("Create WorldMap object", ()=> {
    let testMap = new importMaps.WorldMap;
    expect(testMap instanceof importMaps.WorldMap).toBeTruthy()
  })
  test("Create Screen object", ()=> {
    let testScreen = new importMaps.Screen;
    expect(testScreen instanceof importMaps.Screen).toBeTruthy()
  })
})

describe("WorldMap - Import maps", () => {
  test("Import a map", () => {
    //do a test
    testPath = "roads.asc"
    nCols = 403;
    nRows = 300;
    nEntries = nCols * nRows;
    let testWorldMap = new importMaps.WorldMap
    testWorldMap.importMap(testPath,"road")
    let results = testWorldMap.getMap()
    //expect(results).toMatchObject(expectedOutput);
    //expect(results.length).toEqual(nRows);
    expect(results[0]).toMatchObject({"x":101,"y":0,value:"road"})
  });
  test("Import two maps", () => {
    //do a test
    testPath1 = "roads.asc"
    testPath2 = "water.asc"
    nCols = 403;
    nRows = 300;
    nEntries = nCols * nRows;
    let testWorldMap = new importMaps.WorldMap
    testWorldMap.importMap(testPath1, "road")
    testWorldMap.importMap(testPath2, "water")
    let results = testWorldMap.getMap()
    //expect(results).toMatchObject(expectedOutput);
    //expect(results.length).toEqual(nRows);
    expect(results[0]).toMatchObject({"x":101,"y":0,value:"road"})
    expect(results[19000]).toMatchObject({value:"water"})
  });
});

describe("WorldMap - Filter maps", () => {
  test("Filter a map to x and y limits", () => {
    //do a test
    testPath = "roads.asc"
    let testWorldMap = new importMaps.WorldMap
    testMap = testWorldMap.importMap(testPath, "road")
    xMin = 100;
    xMax = 200;
    yMin = 200;
    yMax = 250;
    let filtered = testWorldMap.getMapForWindow(xMin,xMax,yMin,yMax)
    //expect(results).toMatchObject(expectedOutput);
    //expect(results.length).toEqual(nRows);
    expect(filtered.reduce((acc,value)=>{
        if (value["x"] < acc){
          return value["x"]
        }else{
          return acc
        }
      },filtered[0]["x"])).toEqual(xMin);
    expect(filtered.reduce((acc,value)=>{
        if (value["x"] > acc){
          return value["x"]
        }else{
          return acc
        }
      },filtered[0]["x"])).toEqual(xMax);
    expect(filtered.reduce((acc,value)=>{
        if (value["y"] < acc){
          return value["y"]
        }else{
          return acc
        }
      },filtered[0]["y"])).toEqual(yMin);
    expect(filtered.reduce((acc,value)=>{
        if (value["y"] > acc){
          return value["y"]
        }else{
          return acc
        }
      },filtered[0]["y"])).toEqual(yMax);
  });
});

describe("Screen - Interactive map", () => {
  let testPath = "roads.asc"
  let waterPath = "water.asc"
  let buildingPath = "buildings.asc"
  let testWorldMap = new importMaps.WorldMap
  let testScreen = new importMaps.Screen(testWorldMap, 150, 118)
  testWorldMap.importMap(waterPath,"water")
  testWorldMap.importMap(testPath,"road")
  testWorldMap.importMap(buildingPath,"building")
  xMin = 150;
  xMax = 230;
  yMin = 118;
  yMax = 142;
  test("Show map", ()=>{
    testScreen.drawMap()
  })
  test("Scroll map", () => {
    //scroll map
    testScreen.scrollUp(1)
  })
});
