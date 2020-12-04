const importMaps = require("./importMaps.js")

describe("Import maps", () => {
  test("Import a map", () => {
    //do a test
    testPath = "roads.asc"
    nCols = 403;
    nRows = 300;
    nEntries = nCols * nRows;
    let results = importMaps.importMap(testPath, "road")
    let expectedOutput = [{"x":0,"y":0,"value":1}]
    //expect(results).toMatchObject(expectedOutput);
    //expect(results.length).toEqual(nRows);
    expect(results[0]).toMatchObject({"x":101,"y":0,value:'road'})
  });
});

describe("Filter maps", () => {
  test("Filter a map to x and y limits", () => {
    //do a test
    testPath = "roads.asc"
    testMap = importMaps.importMap(testPath, "road")
    xMin = 100;
    xMax = 200;
    yMin = 200;
    yMax = 250;
    filtered = importMaps.getMapForWindow(testMap,xMin,xMax,yMin,yMax)
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

describe("Interactive map", () => {
  test("Scroll map", ()=>{
    let testPath = "roads.asc"
    let waterPath = "water.asc"
    let buildingPath = "buildings.asc"
    let roadMap = importMaps.importMap(testPath, "road")
    let waterMap = importMaps.importMap(waterPath, "water")
    let buildingMap = importMaps.importMap(buildingPath, "building")
    let combinedMap = roadMap.concat(waterMap,buildingMap)
    xMin = 150;
    xMax = 230;
    yMin = 118;
    yMax = 142;
    let start = importMaps.getMapForWindow(combinedMap,xMin,xMax,yMin,yMax)
    importMaps.drawMap(start, xMin, yMin)
    //scroll map
  })
});
