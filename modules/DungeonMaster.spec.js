const DungeonMaster = require("./DungeonMaster.js")
const WorldMap = require("./WorldMap.js")
const Gameboard = require("./Gameboard.js")

describe("DungeonMaster - manage game for player", () => {
  let dm = new DungeonMaster
  //load test gameboard
  let testWorldMap = new WorldMap()
  let testPath = "roadsWide.asc"
  let waterPath = "water.asc"
  let buildingPath = "buildings.asc"
  let treePath = "trees.asc"
  testWorldMap.importMap(waterPath,"water")
  testWorldMap.importMap(testPath,"road")
  testWorldMap.importMap(buildingPath,"building")
  testWorldMap.importMap(treePath,"tree")

  let testGbName = 'test map'
  let testGameboard = new Gameboard(testWorldMap)

  test("Set up a new gameboard", ()=>{
    dm.setupGameboard(testGbName,testWorldMap)
    expect(dm.gameboards.has(testGbName)).toBeTruthy
  })
  test("Switch to the new gameboard", ()=>{
    dm.switchGameboard(testGbName)
    expect(dm.currentGameboard).toMatchObject(testGameboard)
  })
  test("Add a second gameboard", ()=>{
    let dungeon = new WorldMap
    dm.setupGameboard('dungeon', dungeon)
    dm.switchGameboard('dungeon')
    let testGb = new Gameboard(dungeon)
    expect(dm.currentGameboard).toMatchObject(testGb)
    dm.switchGameboard(testGbName)
  })

  test("Describe scene to player", ()=>{
    let infoBundle = dm.currentGameboard.describe();
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
    let testX = testGameboard.pcXPosition + proposedXMove
    let testY = testGameboard.pcYPosition + proposedYMove
    //add testmob in tile to right of PC
    testGameboard.addMob(testX,testY,testMob)
    testGameboard.addTile(testX,testY,testTile)
    testGameboard.addItem(testX,testY,testItem)
    let result = testGameboard.getCollisions(proposedXMove,proposedYMove)
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
    let testX = testGameboard.pcXPosition + proposedXMove
    let testY = testGameboard.pcYPosition + proposedYMove
    //add testmob in tile to right of PC
    testGameboard.addMob(testX,testY,testMob)
    testGameboard.addTile(testX,testY,testTile)
    testGameboard.addItem(testX,testY,testItem)
    let testCollision = testGameboard.getCollisions(proposedXMove,proposedYMove)
    let interpretation = dm.interpret(testCollision)
    expect(interpretation).toEqual(`There is ${testCollision.mobs[0]}
      and ${testCollision.items[0]} on the ${testCollision.tiles[0]}`)
  })
  test("Given proposed move, check if valid and do move", ()=>{
    let proposedMove = "east";
    dm.doMoveIfValid(proposedMove);
    expect(dm.currentGameboard.pcXPosition).toEqual(191);
    expect(dm.currentGameboard.pcYPosition).toEqual(130);

  })
  test("Given proposed invalid move, check if valid and do not move", ()=>{
    let startX = 190;
    let startY = 130;
    dm.currentGameboard.pcXPosition = startX
    dm.currentGameboard.pcYPosition = startY
    //add building east of PC
    dm.currentGameboard.addTile(startX + 1, startY, "building")
    let proposedMove = "east";
    //try to move into a wall
    dm.doMoveIfValid(proposedMove);
    expect(dm.currentGameboard.pcXPosition).toEqual(190);
    expect(dm.currentGameboard.pcYPosition).toEqual(130);
  })

  test("Given valid proposed move, make the move", ()=>{
    let startX = 190;
    let startY = 130;
    dm.currentGameboard.pcXPosition = startX
    dm.currentGameboard.pcYPosition = startY
    //move is valid
    dm.doMove("east")
    expect(dm.currentGameboard.pcXPosition).toEqual(191);
    expect(dm.currentGameboard.pcYPosition).toEqual(130);
  })

  test("Look at the trees", ()=>{
    let result = ""
    for (i=0;i<27;i++){
      result = testGameboard.lookTo("east")
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

describe("Follow entrances between gameboards", ()=>{
  test("Follow an entrance", () =>{
    let dm = new DungeonMaster
    let startMap = new WorldMap()
    let destMap = new WorldMap()
    let testPath = "roadsWide.asc"
    let waterPath = "water.asc"
    let buildingPath = "buildings.asc"
    let treePath = "trees.asc"
    startMap.importMap(waterPath,"water")
    startMap.importMap(testPath,"road")
    startMap.importMap(buildingPath,"building")
    startMap.importMap(treePath,"tree")
    destMap.importMap(waterPath,"water")
    dm.setupGameboard('start',startMap)
    dm.setupGameboard('dungeon',destMap)
    let destGameboardID = "dungeon";
    let destX = 13;
    let destY = 27;
    dm.followEntrance(destGameboardID,destX,destY)
    expect(dm.currentGameboard.pcXPosition).toEqual(13);
    expect(dm.currentGameboard.pcYPosition).toEqual(27);
    expect(dm.currentGameboard).toEqual(dm.gameboards.get(destGameboardID))
    expect(dm.currentGameboard.worldMap).toMatchObject(destMap)
    //switch back
    dm.followEntrance('start',42,69)
    expect(dm.currentGameboard.pcXPosition).toEqual(42);
    expect(dm.currentGameboard.pcYPosition).toEqual(69);
    expect(dm.currentGameboard).toEqual(dm.gameboards.get('start'))
    expect(dm.currentGameboard.worldMap).toMatchObject(startMap)
  })
})
