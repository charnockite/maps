fs = require('fs')
var term = require('terminal-kit').terminal;
var ScreenBuffer = require('terminal-kit').ScreenBuffer;
const readline= require('readline')
readline.emitKeypressEvents(process.stdin)
process.stdin.setRawMode(true)


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

module.exports = Screen
