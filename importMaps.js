fs = require('fs')
var term = require('terminal-kit').terminal;
var ScreenBuffer = require('terminal-kit').ScreenBuffer;
const readline= require('readline')
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)


class WorldMap{
  //map storage and access
  constructor(){
    this.map = []
  }
  //properties

  //methods
  importMap(path, mapType){
    //string -> map grid
    //load file
    let fileData = fs.readFileSync(path)
    //split into lines
    let splitData = fileData.toString().split("\n")
    //get parameters from header lines
    let headers = splitData.slice(0,7);
    let nCols = Number(headers[0].split(" ").pop())
    let nRows = Number(headers[1].split(" ").pop())
    let ndv = headers[5].split(" ").pop()
    let cellSize = Number(headers[4].split(" ").pop())
    let xOrigin = Number(headers[2].split(" ").pop())
    let yOrigin = Number(headers[3].split(" ").pop())
    let xTopLeft = xOrigin;
    let yTopLeft = yOrigin + (nRows - 1) * cellSize;
    let body = splitData.slice(7,)
    let output = []
    function getCoords(i,j){
      //i,j row, column
      return [xTopLeft + cellSize * j, yTopLeft + cellSize * i]
    }
    for (let i = 0; i<nRows; i++){
      //parse row and remove leading space
      let row = body[i].split(" ").slice(1);
      //split row into columns
      for (let j = 0; j<nCols; j++){
      //parse data
        let cellData = row[j];
        //do something
        if (cellData != ndv){
          let [xCoord, yCoord] = getCoords(i,j)
          output.push({"x":j,"y":i,"value":mapType})
        }
      }
    }
    this.map = this.map.concat(output)
  }
  getMap(){
    return this.map;
  }
  getMapForWindow(xMin, xMax, yMin, yMax){
    function filterExpression(value){
      return (value["x"] >= xMin && value["x"] <= xMax && value["y"] >= yMin && value["y"] <= yMax)
    }
    let filtered = this.map.filter(filterExpression)
    return filtered
  }

}

class Screen {
  //screen elements
  constructor(worldMap, startX, startY){
    this.worldMap = worldMap
    this.xSize = 80;
    this.ySize = 24;
    this.xMin = startX;
    this.yMin = startY;
    this.terminalBuffer = new ScreenBuffer({"width":this.xSize,"height":this.ySize,"dst":term})
    this.mapBuffer = new ScreenBuffer({"width":this.xSize,"height":this.ySize - 4,"dst":this.terminalBuffer})
    this.messageBuffer = new ScreenBuffer({"width":this.xSize,"height":1,"x":1,"y":20,"dst":this.terminalBuffer})
    this.allowDrawing = false; //make true to allow drawing
    //this.terminalBuffer.clear()
    //this.terminalBuffer.fill({"attr":{"bgColor":"black"}})
    //this.terminalBuffer.draw()
    //term.clear()
  }
  //methods
  drawMap(){
    //draw map to screen
    //get filtered map data
    let map = this.worldMap.getMapForWindow(this.xMin, this.xMin + this.xSize, this.yMin, this.yMin + this.ySize)
    if (this.allowDrawing){
      term.clear().hideCursor()
      //empty screenBuffer
      this.mapBuffer.clear()
      this.mapBuffer.fill({"attr":{"bgColor":"black"}})
    }
    map.forEach(entry=> {
      switch (entry.value){
        case 'road':
        this.mapBuffer.put({"x":(entry["x"]-this.xMin),"y":(entry["y"]-this.yMin),"attr":{"color":"grey","bgColor":"black"}},".")
        break;
        case 'water':
        this.mapBuffer.put({"x":(entry["x"]-this.xMin),"y":(entry["y"]-this.yMin),"attr":{"color":"blue","bgColor":"black"}},"~")
        break;
        case 'tree':
        this.mapBuffer.put({"x":(entry["x"]-this.xMin),"y":(entry["y"]-this.yMin),"attr":{"color":"green","bgColor":"black"}},"T")
        break;
        case 'building':
        this.mapBuffer.put({"x":(entry["x"]-this.xMin),"y":(entry["y"]-this.yMin),"attr":{"color":"grey","bgColor":"black"}},"#")
        break;

      }
    })
    //put your dude up
    let xCenter = this.xSize/2;
    let yCenter = this.ySize/2;
    this.mapBuffer.put({"x":xCenter,"y":yCenter,"attr":{"color":"green", "bgColor":"black"}},"@")
    if (this.allowDrawing){
      this.mapBuffer.draw()
      this.terminalBuffer.draw()
    }
  }
  scrollUp(amount){
    //up means the map moves down underneath PC at center
    this.yMin-=amount;
    this.drawMap()
  }
  scrollDown(amount){
    //up means the map moves down underneath PC at center
    this.yMin+=amount;
    this.drawMap()
  }
  scrollLeft(amount){
    //up means the map moves down underneath PC at center
    this.xMin-=amount;
    this.drawMap()
  }
  scrollRight(amount){
    //up means the map moves down underneath PC at center
    this.xMin+=amount;
    this.drawMap()
  }
  getValueAtCoordinates(x,y){
    //return value in map at coordinates
    let tileInfo = this.worldMap.getMapForWindow(x, x, y, y)
    //console.log(tileInfo)
    if (tileInfo.length == 1){
      return tileInfo[0]
    }
  }
  writeMessage(message){
    //write message to message box
    this.messageBuffer.fill({"attr":{"bgColor":"black"}})
    this.messageBuffer.put({"x":0,"y":0, "attr":{"bgColor":"black"}},message)
    if (this.allowDrawing){
      this.messageBuffer.draw()
      this.terminalBuffer.draw()
    }
  }
  showLookCursor(x,y){
    this.mapBuffer.put({"x":x - this.xMin,"y":y - this.yMin,"attr":{"color":"white", "bgColor":"black"}},"_")
    if (this.allowDrawing){
      this.mapBuffer.draw()
      this.terminalBuffer.draw()
    }
  }
}

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
}

class DungeonMaster{
  //control game for player
  //keep track of turns, enemies, etc.
  constructor(){
    this.gameBoard = new Gameboard
    this.descriptionMap = new Map([
      ["road","You are standing on a road."],
      ["tree","You are standing beneath a shady tree."],
      ["water","You struggle to stay afloat in the crashing waves."],
      ["building","You are standing on a building."],
      ["lava","You step into molten lava."]
    ])
    this.descriptionLookMap = new Map([
      ["road","You see a road."],
      ["tree","You see some trees."],
      ["water","You gaze out into the crashing ocean."],
      ["building","You see a dilapidated building."],
      ["lava","You see molten lava, somewhere between liquid and solid, and glowing deep red."]
    ])
  }
  announce(message){
    //write a message to the buffer
    this.gameBoard.screen.writeMessage(message)
  }
  describe(infoBundle){
    //interpret results for player
    if (infoBundle === undefined){
      this.announce("");
      return
    }
    if ('value' in infoBundle){
      let value = infoBundle["value"]
      let description = this.descriptionMap.get(value)
      this.announce(description);
      return description
      }
    }
  describeLook(infoBundle){
    //interpret results for player for things seen from a distance
    if (infoBundle === undefined){
      this.announce("");
      return
    }
    if ('value' in infoBundle){
      let value = infoBundle["value"]
      let description = this.descriptionLookMap.get(value)
      this.announce(description)
      return description
  }
}

  mainLoop(){
    //draw map
    //describe scene
    //accept player input
    //pass information to Game
    //roll dice upon player action
      //this.screen.drawMap()
    let result = this.gameBoard.describe()
    this.gameBoard.screen.drawMap() //ewwww
    this.describe(result)
    process.stdin.on('keypress', (key,data) =>{
      //default case doesn't pass a turn
      //look doesn't pass a turn
      //move passes a turn
      //console.log(`x:${this.gameBoard.pcXPosition},y:${this.gameBoard.pcYPosition}`)
      if (data.ctrl && data.name === 'q'){
        //quitmmport.spec.js
        process.exit()
      }else{
        //on input, do something
        if (this.lookMode){
          if (data.name ==  'x') {
            //exit look mode
            this.lookMode = false
            this.gameBoard.screen.drawMap()
          } else {
            //look mode
            let lookResult;
            switch (data.name){
              case 'left':
                lookResult = this.gameBoard.lookTo('west');
                this.describeLook(lookResult)
                break;
              case 'up':
                lookResult = this.gameBoard.lookTo('north');
                this.describeLook(lookResult)
                break;
              case 'down':
                lookResult = this.gameBoard.lookTo('south');
                this.describeLook(lookResult)
                break;
              case 'right':
                lookResult = this.gameBoard.lookTo('east');
                this.describeLook(lookResult)
                break;
              }
            }//end look mode
        } else { //not look mode
          switch (data.name) {
            case 'left':
              //attempt move
              if(this.gameBoard.attemptMove("west")){
                //do move
                let result = this.gameBoard.movePC("west")
                //get info
                this.describe(result)}
              break;
            case 'up':
              //attempt move
              if(this.gameBoard.attemptMove("north")){
                //do move
                let result = this.gameBoard.movePC("north")
                //get info
                this.describe(result)}
              break;
            case 'down':
              //attempt move
              if(this.gameBoard.attemptMove("south")){
                //do move
                let result = this.gameBoard.movePC("south")
                //get info
                this.describe(result)}
              break;
            case 'right':
              //attempt move
              if(this.gameBoard.attemptMove("east")){
                //do move
                let result = this.gameBoard.movePC("east")
                //get info
                this.describe(result)}
              break;
            case 'l':
              this.lookMode = true
              let result = this.gameBoard.describe()
              break;
            }//end switch
          }//end else
        }//end not exiting else
      })//end listener
    }//end mainLoop
  }//end DM

exports.WorldMap = WorldMap;
exports.Screen = Screen;
exports.Gameboard = Gameboard;
exports.DungeonMaster = DungeonMaster;
//decreasing y moves north in the map
//increasing x moves east

let dm = new DungeonMaster
dm.gameBoard.screen.allowDrawing = true
dm.mainLoop()
