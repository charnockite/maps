fs = require('fs')
var term = require('terminal-kit').terminal;
var ScreenBuffer = require('terminal-kit').ScreenBuffer;
const readline= require('readline')
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)


class WorldMap{
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
  constructor(worldMap, startX, startY){
    this.worldMap = worldMap
    this.xSize = 80;
    this.ySize = 24;
    this.xMin = startX;
    this.yMin = startY;
    this.screenBuffer = new ScreenBuffer({"width":this.xSize,"height":this.ySize,"dst":term})
  }
  //methods
  drawMap(){
    //draw map to screen
    //get filtered map data
    let map = this.worldMap.getMapForWindow(this.xMin, this.xMin + this.xSize, this.yMin, this.yMin + this.ySize)
    term.clear().hideCursor()
    //empty screenBuffer
    this.screenBuffer.clear()
    this.screenBuffer.fill({"attr":{"bgColor":"black"}})
    map.forEach(entry=> {
      switch (entry.value){
        case 'road':
        this.screenBuffer.put({"x":(entry["x"]-this.xMin),"y":(entry["y"]-this.yMin),"attr":{"color":"grey","bgColor":"black"}},".")
        break;
        case 'water':
        this.screenBuffer.put({"x":(entry["x"]-this.xMin),"y":(entry["y"]-this.yMin),"attr":{"color":"blue","bgColor":"black"}},"~")
        break;
        case 'building':
        this.screenBuffer.put({"x":(entry["x"]-this.xMin),"y":(entry["y"]-this.yMin),"attr":{"color":"grey","bgColor":"black"}},"#")
        break;
      }
    })
    //put your dude up
    let xCenter = this.xSize/2;
    let yCenter = this.ySize/2;
    this.screenBuffer.put({"x":xCenter,"y":yCenter,"attr":{"color":"green", "bgColor":"black"}},"@")
    this.screenBuffer.draw()
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
    let tileInfo = this.worldMap.getMapForWindow(x, x + 1, y, y+1)
    return tileInfo
  }
}

class Game{
  constructor(){
    let startX = 150
    let startY = 118
    this.worldMap = new WorldMap()
    this.screen = new Screen(this.worldMap, startX, startY)
    this.pcXPosition = startX
    this.pcYPosition = startY
    //initialize world map
    let roadPath = "roadsWide.asc"
    let waterPath = "water.asc"
    let buildingPath = "buildings.asc"
    this.worldMap.importMap(waterPath,"water")
    this.worldMap.importMap(roadPath,"road")
    this.worldMap.importMap(buildingPath,"building")
    this.screen.drawMap()
  }
  //methods

  lookMode(){
    let offsetX = 0;
    let offsetY = 0;
    process.stdin.on('keypress', (key,data) =>{
      switch (data.name){
        case 'left':
          this.offsetX-=1;
          this.look(offsetX, offsetY)
          break;
        case 'up':
          this.offsetY-=1;
          this.look(offsetX, offsetY)
          break;
        case 'down':
          this.offsetY+=1;
          this.look(offsetX, offsetY)
          break;
        case 'right':
          this.offsetX+=1;
          this.look(offsetX, offsetY)
          break;
        case 'x':
          console.log("exit")
          return
      }
    })
  }
  look(x,y){
    //return information about a tile
    console.log(this.screen.getValueAtCoordinates(this.xPosition + offsetX,this.yPosition + offsetY))
    return
  }
}

class DungeonMaster{
  constructor(){
    this.game = new Game
  }
  manage(){
    let playReturn = "start"
    while (playReturn != 1){
      let playReturn = this.game.play()
      if (playReturn = "look"){
        //look mode
        console.log("look mode")
        }
      }
  }
}

exports.WorldMap = WorldMap;
exports.Screen = Screen;
exports.Game = Game;
//decreasing y moves north in the map
//increasing x moves east

let dm = new DungeonMaster
dm.manage()
//mainLoop()
