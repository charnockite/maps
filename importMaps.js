fs = require('fs')
var term = require('terminal-kit').terminal;
var ScreenBuffer = require('terminal-kit').ScreenBuffer;
const readline= require('readline')
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)

exports.importMap = importMap;
exports.getMapForWindow = getMapForWindow;
exports.drawMap = drawMap;

function importMap(path, mapType){
  //string -> map grid
  //load file
  fileData = fs.readFileSync(path)
  //split into lines
  splitData = fileData.toString().split("\n")
  //get parameters from header lines
  headers = splitData.slice(0,7);
  nCols = Number(headers[0].split(" ").pop())
  nRows = Number(headers[1].split(" ").pop())
  ndv = headers[5].split(" ").pop()
  cellSize = Number(headers[4].split(" ").pop())
  xOrigin = Number(headers[2].split(" ").pop())
  yOrigin = Number(headers[3].split(" ").pop())
  xTopLeft = xOrigin;
  yTopLeft = yOrigin + (nRows - 1) * cellSize;
  body = splitData.slice(7,)
  output = []
  function getCoords(i,j){
    //i,j row, column
    return [xTopLeft + cellSize * j, yTopLeft + cellSize * i]
  }

  for (i = 0; i<nRows; i++){
    //parse row and remove leading space
    row = body[i].split(" ").slice(1);
    //split row into columns
    for (j = 0; j<nCols; j++){
    //parse data
      cellData = row[j];
      //do something
      if (cellData != ndv){
        let [xCoord, yCoord] = getCoords(i,j)
        output.push({"x":j,"y":i,"value":mapType})
      }
    }
  }
  return output
}

function getMapForWindow(map, xMin, xMax, yMin, yMax){
  function filterExpression(value){
    return (value["x"] >= xMin && value["x"] <= xMax && value["y"] >= yMin && value["y"] <= yMax)
  }
  let filtered = map.filter(filterExpression)
  return filtered
}

function drawMap(map, xMin, yMin){
  //draw map to screen
  let screenBuffer = new ScreenBuffer({"width":80,"height":24,"dst":term})
  term.clear().hideCursor()
  map.forEach(entry=> {
    switch (entry.value){
      case 'road':
      screenBuffer.put({"x":(entry["x"]-xMin),"y":(entry["y"]-yMin),"attr":{"color":"grey","bgColor":"black"}},".")
      break;
      case 'water':
      screenBuffer.put({"x":(entry["x"]-xMin),"y":(entry["y"]-yMin),"attr":{"color":"blue","bgColor":"black"}},"~")
      break;
      case 'building':
      screenBuffer.put({"x":(entry["x"]-xMin),"y":(entry["y"]-yMin),"attr":{"color":"grey","bgColor":"black"}},"#")
      break;
    }
  })
  //put your dude up
  let xCenter = 40;
  let yCenter = 12;
  screenBuffer.put({"x":xCenter,"y":yCenter,"attr":{"color":"green"}},"@")
  screenBuffer.draw()
}


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

mainLoop()
