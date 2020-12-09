const DungeonMaster = require("./DungeonMaster.js")

describe("DungeonMaster - manage game for player", () => {
  let dm = new DungeonMaster
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
    let dm = new DungeonMaster
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
    let dm = new DungeonMaster
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
