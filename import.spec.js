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

describe("Screen - Game screen map window", () => {
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
    //testScreen.drawMap()
  })
  test("Scroll map", () => {
    //scroll map
    //testScreen.scrollUp(1)
  })
});

describe("Gameboard - Position and world", () => {
  let testGameboard = new importMaps.Gameboard;
  test("Get info bundle about player position", ()=>{
    let result = testGameboard.describe()
    expect(result).toMatchObject({"x":190,"y":130,"value":"road"})
  })
  test("Request player one tile east", ()=>{
    expect(testGameboard.attemptMove("east")).toBeTruthy()
  })
  test("Move player one tile east", ()=>{
    if(testGameboard.attemptMove("east")){
      //do move
      testGameboard.movePC("east")
      //get info
      let result = testGameboard.describe()
      expect(result).toMatchObject({"x":191,"y":130,"value":"road"})
    }
  })
  test("Move player 23 tiles east and hit building", ()=>{
    //22 tiles east then hit building at 23
    for (i = 0; i < 23; i++){
    if(testGameboard.attemptMove("east")){
      //do move
      testGameboard.movePC("east")
      //get info
    } else {
      //illegal move
      expect(i).toEqual(22)
    }
  }
  })
});

describe("DungeonMaster - manage game for player", ()=>{
  let dm = new importMaps.DungeonMaster
  test("Start new game", ()=>{
    dm.mainLoop()
  })
  test("Describe scene to player", ()=>{
    let infoBundle = dm.gameBoard.describe();
    //console.log(infoBundle)
    let description = dm.describe(infoBundle)
    expect(description).toEqual("You are standing on a road.");
  })
  test("Look at the trees", ()=>{
    let result = ""
    for (i=0;i<27;i++){
      result = dm.gameBoard.lookTo("east")
      //console.log(result)
    }
    expect(dm.describeLook(result)).toEqual("You see some trees.")
  })
  test("Load responses from an object for standing", ()=>{
    //need to pull descriptions of world from a module
    let testTile = {"x":0,"y":0,"value":"lava"}
    let result = dm.describe(testTile);
    expect(result).toEqual("You step into molten lava.")
  })
  test("Load responses from an object for looking", ()=>{
    //need to pull descriptions of world from a module
    let testTile = {"x":0,"y":0,"value":"lava"}
    let result = dm.describeLook(testTile);
    expect(result).toEqual("You see molten lava, somewhere between liquid and solid, and glowing deep red.")
  })
});
