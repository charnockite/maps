fs = require('fs')
var term = require('terminal-kit').terminal;
var ScreenBuffer = require('terminal-kit').ScreenBuffer;
const readline= require('readline')
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

exports.importMap = importMap;
exports.getMapForWindow = getMapForWindow;
exports.drawMap = drawMap;

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
    this.screenBuffer.put({"x":xCenter,"y":yCenter,"attr":{"color":"green"}},"@")
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
}


exports.WorldMap = WorldMap;
exports.Screen = Screen;

//decreasing y moves north in the map
//increasing x moves east

function mainLoop(){
  xMin = 150;
  xMax = 230;
  yMin = 118;
  yMax = 142;
  let testPath = "roads.asc"
  let waterPath = "water.asc"
  let buildingPath = "buildings.asc"
  let roadMap = importMap(testPath, "road")
  let waterMap = importMap(waterPath, "water")
  let buildingMap = importMap(buildingPath, "building")
  let combinedMap = roadMap.concat(waterMap,buildingMap)
  let filtered = getMapForWindow(combinedMap,xMin,xMax,yMin,yMax)
  drawMap(filtered, xMin, yMin)
  //wait for input
  process.stdin.on('keypress', (key,data) =>{
    if (data.ctrl && data.name === 'q'){
      //quit
      process.exit()
    }else{
      //on input, do something
      switch (data.name) {
        case 'left':
          xMin = xMin - 1
          xMax = xMax - 1
          filtered = getMapForWindow(combinedMap, xMin, xMax, yMin, yMax)
          drawMap(filtered, xMin, yMin)
          break;
        case 'up':
          yMin = yMin - 1
          yMax = yMax - 1
          filtered = getMapForWindow(combinedMap, xMin, xMax, yMin, yMax)
          drawMap(filtered, xMin, yMin)
          break;
        case 'down':
          yMin = yMin + 1
          yMax = yMax + 1
          filtered = getMapForWindow(combinedMap, xMin, xMax, yMin, yMax)
          drawMap(filtered, xMin, yMin)
          break;
        case 'right':
          xMin = xMin + 1
          xMax = xMax + 1
          filtered = getMapForWindow(combinedMap, xMin, xMax, yMin, yMax)
          drawMap(filtered, xMin, yMin)
          break;
      }
    }
  })
}

//mainLoop()
