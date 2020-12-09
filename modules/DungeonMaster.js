const Gameboard = require('./Gameboard.js')

class DungeonMaster{
  //control game for player
  //keep track of turns, enemies, etc.
  constructor(){
    //this.gameboard = new Gameboard
    this.gameboards = new Map([])
    this.currentGameboard = new Gameboard()
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
    this.currentGameboard.screen.writeMessage(message)
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
  interpret(collision){
    //collision Collision object
    //do things and report to player
    return `There is ${collision.mobs[0]}
      and ${collision.items[0]} on the ${collision.tiles[0]}`
  }
  doMove(direction){
    //str direction
    //move the PC on the Gameboard
    this.currentGameboard.movePC(direction)
  }
  doMoveIfValid(direction){
    //str direction
    //check if move is valid
    let [xOffset, yOffset] = this.getOffsets(direction)
    let collision = this.currentGameboard.getCollisions(xOffset, yOffset)
    //check valid move tiles
    if (collision.tiles[0] != "building"){
      this.doMove(direction)
    }
  }

  setupGameboard(mapName, worldMap){
    //WorldMap worldMap
    //setup gameboard and add to list
    let newGameboard = new Gameboard(worldMap)
    this.gameboards.set(mapName, newGameboard)
  }

  switchGameboard(key){
    //string key
    //switch to requested gameboard
    this.currentGameboard = this.gameboards.get(key)
  }

  followEntrance(destGameboardID, destX, destY){
    //string destGameboardID, int destX, int destY
    //switch to requested gameboard and set pc position
    this.switchGameboard(destGameboardID)
    this.currentGameboard.pcXPosition = destX
    this.currentGameboard.pcYPosition = destY
  }

  mainLoop(){
    //draw map
    //describe scene
    //accept player input
    //pass information to Game
    //roll dice upon player action
      //this.screen.drawMap()
    let result = this.currentGameboard.describe()
    this.currentGameboard.screen.drawMap() //ewwww
    this.describe(result)
    process.stdin.on('keypress', (key,data) =>{
      //default case doesn't pass a turn
      //look doesn't pass a turn
      //move passes a turn
      //console.log(`x:${this.gameboard.pcXPosition},y:${this.gameboard.pcYPosition}`)
      if (data.ctrl && data.name === 'q'){
        //quitmmport.spec.js
        process.exit()
      }else{
        //on input, do something
        if (this.lookMode){
          if (data.name ==  'x') {
            //exit look mode
            this.lookMode = false
            this.currentGameboard.screen.drawMap()
          } else {
            //look mode
            let lookResult;
            switch (data.name){
              case 'left':
                lookResult = this.currentGameboard.lookTo('west');
                this.describeLook(lookResult)
                break;
              case 'up':
                lookResult = this.currentGameboard.lookTo('north');
                this.describeLook(lookResult)
                break;
              case 'down':
                lookResult = this.currentGameboard.lookTo('south');
                this.describeLook(lookResult)
                break;
              case 'right':
                lookResult = this.currentGameboard.lookTo('east');
                this.describeLook(lookResult)
                break;
              }
            }//end look mode
        } else { //not look mode
          switch (data.name) {
            case 'left':
              //attempt move
              if(this.currentGameboard.attemptMove("west")){
                //do move
                let result = this.currentGameboard.movePC("west")
                //get info
                this.describe(result)}
              break;
            case 'up':
              //attempt move
              if(this.currentGameboard.attemptMove("north")){
                //do move
                let result = this.currentGameboard.movePC("north")
                //get info
                this.describe(result)}
              break;
            case 'down':
              //attempt move
              if(this.currentGameboard.attemptMove("south")){
                //do move
                let result = this.currentGameboard.movePC("south")
                //get info
                this.describe(result)}
              break;
            case 'right':
              //attempt move
              if(this.currentGameboard.attemptMove("east")){
                //do move
                let result = this.currentGameboard.movePC("east")
                //get info
                this.describe(result)}
              break;
            case 'l':
              this.lookMode = true
              let result = this.currentGameboard.describe()
              break;
            }//end switch
          }//end else
        }//end not exiting else
      })//end listener
    }//end mainLoop
  }//end DM

  module.exports = DungeonMaster
