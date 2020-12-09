fs = require('fs')

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

module.exports = WorldMap;
