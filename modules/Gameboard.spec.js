const Gameboard = require("./Gameboard.js")
const WorldMap = require("./WorldMap.js")
let testWorldMap = new WorldMap()
let testPath = "roadsWide.asc"
let waterPath = "water.asc"
let buildingPath = "buildings.asc"
testWorldMap.importMap(waterPath,"water")
testWorldMap.importMap(testPath,"road")
testWorldMap.importMap(buildingPath,"building")

describe("Gameboard - initialize", ()=>{
  test("Make a new gameboard", ()=>{
    let testGameboard = new Gameboard(testWorldMap)
    expect(testGameboard.worldMap).toMatchObject(testWorldMap)
  })
})

describe("Gameboard - Position and world", () => {
  let testGameboard = new Gameboard(testWorldMap);
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
