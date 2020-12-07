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
  test("Add mob at x,y", ()=>{
    let testMob = "a mob"
    testGameboard.addMob(0,0,testMob)
    expect(testGameboard.mobs[0]).toMatchObject({"x":0,"y":0,"mob":"a mob"})
  })
  test("Add tile at x,y", ()=>{
    let testTile = "a tile"
    testGameboard.addTile(0,0,testTile)
    expect(testGameboard.tiles[0]).toMatchObject({"x":0,"y":0,"tile":"a tile"})
  })
  test("Add item at x,y", ()=>{
    let testItem = "an item"
    testGameboard.addItem(0,0,testItem)
    expect(testGameboard.items[0]).toMatchObject({"x":0,"y":0,"item":"an item"})
  })
})

describe("Collision - information about a proposed move", () => {
  test("Make collision", ()=>{
    let pcX = 1;
    let pcY = 0;
    let testCollision = new importMaps.Collision(pcX, pcY);
    expect(testCollision.constructor.name).toEqual("Collision")
  })
  test("Return collision information", ()=>{
    let proposedXMove = 1;
    let proposedYMove = 0;
    let mobs = []
    let tiles = []
    let items = []
    let testCollision = new importMaps.Collision(proposedXMove,proposedYMove, mobs, tiles, items)
    expect(testCollision.mobs).toEqual([])
    expect(testCollision.tiles).toEqual([])
    expect(testCollision.items).toEqual([])
  })
  test("Return collision information", ()=>{
    let proposedXMove = 1;
    let proposedYMove = 0;
    let mobs = []
    let tiles = [{"value":"road"}]
    let items = []
    let testCollision = new importMaps.Collision(proposedXMove,proposedYMove, mobs, tiles, items)
    expect(testCollision.mobs).toEqual([])
    expect(testCollision.tiles).toEqual([{"value":"road"}])
    expect(testCollision.items).toEqual([])
  })
  test("Collect collision information and generate", ()=>{
    let proposedXMove = 1;
    let proposedYMove = 0;
    let testGameboard = new importMaps.Gameboard;
    let testMob = "a mob"
    let testTile = "a tile"
    let testItem = "an item"
    let testX = testGameboard.pcXPosition + proposedXMove
    let testY = testGameboard.pcYPosition + proposedYMove
    //add testmob in tile to right of PC
    testGameboard.addMob(testX,testY,testMob)
    testGameboard.addTile(testX,testY,testTile)
    testGameboard.addItem(testX,testY,testItem)
    let mobs = testGameboard.getMobsAt(testX,testY)
    let tiles = testGameboard.getTilesAt(testX,testY)
    let items = testGameboard.getItemsAt(testX,testY)
    let testCollision = new importMaps.Collision(proposedXMove,proposedYMove, mobs, tiles, items)
    expect(testCollision.mobs).toMatchObject(["a mob"]);
    expect(testCollision.tiles).toMatchObject(["a tile"]);
    expect(testCollision.items).toMatchObject(["an item"]);
  })
})

describe("DungeonMaster - manage game for player", () => {
  let dm = new importMaps.DungeonMaster
  test("Start new game", ()=>{
    //dm.mainLoop()
  })
  test("Describe scene to player", ()=>{
    let infoBundle = dm.gameboard.describe();
    //console.log(infoBundle)
    let description = dm.describe(infoBundle)
    expect(description).toEqual("You are standing on a road.");
  })
  test("Given requested move, get collisions", ()=>{
    let proposedXMove = 1;
    let proposedYMove = 0;
    let testMob = "a mob"
    let testTile = "a tile"
    let testItem = "an item"
    let testX = dm.gameboard.pcXPosition + proposedXMove
    let testY = dm.gameboard.pcYPosition + proposedYMove
    //add testmob in tile to right of PC
    dm.gameboard.addMob(testX,testY,testMob)
    dm.gameboard.addTile(testX,testY,testTile)
    dm.gameboard.addItem(testX,testY,testItem)
    let result = dm.gameboard.getCollisions(proposedXMove,proposedYMove)
    expect(result.mobs).toEqual(["a mob"])
    expect(result.tiles).toEqual(["a tile"])
    expect(result.items).toEqual(["an item"])
  })
  test("Given collisions, interpret for player",()=>{
    let proposedXMove = 1;
    let proposedYMove = 0;
    let testMob = "a mob"
    let testTile = "a tile"
    let testItem = "an item"
    let testX = dm.gameboard.pcXPosition + proposedXMove
    let testY = dm.gameboard.pcYPosition + proposedYMove
    //add testmob in tile to right of PC
    dm.gameboard.addMob(testX,testY,testMob)
    dm.gameboard.addTile(testX,testY,testTile)
    dm.gameboard.addItem(testX,testY,testItem)
    let testCollision = dm.gameboard.getCollisions(proposedXMove,proposedYMove)
    let interpretation = dm.interpret(testCollision)
    expect(interpretation).toEqual(`There is ${testCollision.mobs[0]}
      and ${testCollision.items[0]} on the ${testCollision.tiles[0]}`)
  })
  test("Given proposed move, check if valid and do move", ()=>{
    let proposedMove = "east";
    dm.doMoveIfValid(proposedMove);
    expect(dm.gameboard.pcXPosition).toEqual(191);
    expect(dm.gameboard.pcYPosition).toEqual(130);

  })
  test("Given proposed invalid move, check if valid and do not move", ()=>{
    let dm = new importMaps.DungeonMaster
    let startX = dm.gameboard.pcXPosition;
    let startY = dm.gameboard.pcYPosition;
    //add building east of PC
    dm.gameboard.addTile(startX + 1, startY, "building")
    let proposedMove = "east";
    //try to move into a wall
    dm.doMoveIfValid(proposedMove);
    expect(dm.gameboard.pcXPosition).toEqual(190);
    expect(dm.gameboard.pcYPosition).toEqual(130);
  })
  
  test("Given valid proposed move, make the move", ()=>{
    //move is valid
    let dm = new importMaps.DungeonMaster
    let startX = 190;
    let startY = 130;
    dm.doMove("east")
    expect(dm.gameboard.pcXPosition).toEqual(191);
    expect(dm.gameboard.pcYPosition).toEqual(130);
  })

  test("Look at the trees", ()=>{
    let result = ""
    for (i=0;i<27;i++){
      result = dm.gameboard.lookTo("east")
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
