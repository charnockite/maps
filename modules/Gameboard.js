const WorldMap = require('./WorldMap.js')
const Screen = require('./Screen.js')
class Gameboard{
  //game board - handle drawing map, keeping track of player position
  constructor(){
    let startX = 150
    let startY = 118
    this.worldMap = new WorldMap()
    this.screen = new Screen(this.worldMap, startX, startY)
    this.pcXPosition = startX + this.screen.xSize/2 //190
    this.pcYPosition = startY + this.screen.ySize/2 //130
    //initialize world map
    let roadPath = "roadsWide.asc"
    let waterPath = "water.asc"
    let buildingPath = "buildings.asc"
    let treePath = "trees.asc"
    this.worldMap.importMap(waterPath,"water")
    this.worldMap.importMap(roadPath,"road")
    this.worldMap.importMap(buildingPath,"building")
    this.worldMap.importMap(treePath, "tree")
    //this.screen.drawMap()
    this.lookMode = false
    this.lookXPosition = this.pcXPosition;
    this.lookYPosition = this.pcYPosition;
    this.mobs = []
    this.tiles = []
    this.items = []
  }
  //methods
  look(){
    //return information about a tile
    let result = this.screen.getValueAtCoordinates(this.lookXPosition,this.lookYPosition)
    this.screen.drawMap()
    this.screen.showLookCursor(this.lookXPosition,this.lookYPosition)
    return result
  }
  describe(){
    //return information about a tile
    let value = this.screen.getValueAtCoordinates(this.pcXPosition,this.pcYPosition)
    return value
  }
  getOffsets(direction){
    let offsetX = 0;
    let offsetY = 0;
    switch (direction){
      case "north":
        offsetY = -1
        break;
      case "east":
        offsetX = 1
        break;
      case "south":
        offsetY = 1
        break;
      case "west":
        offsetX = -1
        break;
    }
    return [offsetX,offsetY]
  }
  scrollScreen(direction){
    switch (direction){
      case "north":
        this.screen.scrollUp(1);
        break;
      case "east":
        this.screen.scrollRight(1);
        break;
      case "south":
        this.screen.scrollDown(1);
        break;
      case "west":
        this.screen.scrollLeft(1);
        break;
    }
  }
  attemptMove(direction){
    //check if move is legal
    //return true if legal
    //return false if illegal
    const [offsetX, offsetY] = this.getOffsets(direction)
    let targetX = this.pcXPosition + offsetX
    let targetY = this.pcYPosition + offsetY
    let value = this.screen.getValueAtCoordinates(targetX,targetY)
    if (!value){
      //empty space
      return true
    }
    if (value["value"] != "building"){
      return true
    } else {
      return false
    }
  }
  lookTo(direction){
    //move look cursor
    //return information about tile
    const [offsetX, offsetY] = this.getOffsets(direction)
    this.lookXPosition += offsetX;
    this.lookYPosition += offsetY;
    let result = this.look()
    return result
  }
  movePC(direction){
    //move PC
    const [offsetX, offsetY] = this.getOffsets(direction)
    this.pcXPosition += offsetX
    this.pcYPosition += offsetY
    this.lookXPosition += offsetX
    this.lookYPosition += offsetY
    this.scrollScreen(direction);
    this.screen.drawMap()
    //return result
    let result = this.screen.getValueAtCoordinates(this.pcXPosition,this.pcYPosition)
    return result
  }
  getObjectsAt(x,y,objectList, objectName){
    //int x, int y, property objectList, str objectName
    //return list of objects at x,y
    let objects = objectList.filter(entry => entry["x"] == x && entry["y"] == y)
    let results = objects.map(entry=>entry[objectName])
    return results
  }
  getMobsAt(x,y){
    //int x,y -> list of mobs at position
    let result = this.getObjectsAt(x,y,this.mobs,"mob")
    return result
  }
  getTilesAt(x,y){
    //int x,y -> list of tiles at position
    let result = this.getObjectsAt(x,y,this.tiles,"tile")
    return result
  }
  getItemsAt(x,y){
    //int x,y -> list of items at position
    let result = this.getObjectsAt(x,y,this.items,"item")
    return result
  }
  addMob(x,y,mob){
    //place a mob at x,y
    let newMobs = this.mobs.concat([{"x":x,"y":y,"mob":mob}])
    this.mobs = newMobs
  }
  addTile(x,y,tile){
    //place a tile at x,y
    let newTiles = this.tiles.concat([{"x":x,"y":y,"tile":tile}])
    this.tiles = newTiles
  }
  addItem(x,y,item){
    //place a tile at x,y
    let newItems = this.items.concat([{"x":x,"y":y,"item":item}])
    this.items = newItems
  }
  getCollisions(proposedXMove,proposedYMove){
    //int proposed move in x and y dirs
    //return collision object
    let testX = this.pcXPosition + proposedXMove
    let testY = this.pcYPosition + proposedYMove
    let mobs = this.getMobsAt(testX,testY)
    let tiles = this.getTilesAt(testX,testY)
    let items = this.getItemsAt(testX,testY)
    let testCollision = new Collision(testX, testY, mobs, tiles, items)
    return testCollision
  }
}

class Collision{
  constructor(pcX, pcY, mobs, tiles, items){
    //pcX int, pcY int
    this.proposedX = pcX;
    this.proposedY = pcY;
    //mobs, tiles, items = lists
    this.mobs = mobs;
    this.tiles = tiles;
    this.items = items;
  }
}

module.exports = Gameboard;
