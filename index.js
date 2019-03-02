const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')


// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// Global variables
var ID = 0;
var boardwidth = 0;
var boardheight = 0;
var headX = 0;
var headY = 0;
var health = 0;
var lastmove = '';
var Board = [];

function UpdateHead(Dir) {
  switch (Dir) {
    case 'up':
        headY--; 
        lastmove = 'up';
        break;
    case 'down':
        headY++;
        lastmove = 'down';
        break;
    case 'left':
        headX--;
        lastmove = 'left';
        break;
    case 'right':
        headX++;
        lastmove = 'right';
        break;
    default:
        // You dead..
    }
}

function fill2DimensionsArray(arr, req){
  var fud = [];
  fud = JSON.parse(req.board.food);
  console.log(String(fud));
//  console.log(String(JSON.parse(req.board.food)));  
//    for (var i = 0; i < rows-1; i++) {
//        arr.push([0]);
//        for (var j = 0; j < columns-1; j++) {
//            arr[i].push([0]);
//        }
//    }
}

function PrintBoard(Board) {
  console.log('PrintBoard');

    for(var i = 0; i < Board.length; i++) {
        console.log(String(Board[i]));
    }

}

function Initialize(req) {

    ID = JSON.stringify(req.body.game.id);
    boardwidth = JSON.stringify(req.body.board.width);
    boardheight = JSON.stringify(req.body.board.height);
    headX = JSON.stringify(req.body.you.body[0].x);
    headY = JSON.stringify(req.body.you.body[0].y);
    health = JSON.stringify(req.body.you.health);
    console.log('ID: '+ID+' width:'+boardwidth+' height:'+boardheight);
    Board = new Array(parseInt(boardheight)).fill(0).map(() => new Array(parseInt(boardwidth)).fill(0));
 //   fill2DimensionsArray(Board,req);

}

function InitialMoveRemove(directions,lastmove) {

   switch (lastmove) {
    case 'up':
//        console.log('Remove down!');
        directions.splice(directions.indexOf('down'),1);
        break;
    case 'down':
//        console.log('Remove Up!');
        directions.splice(directions.indexOf('up'),1);
        break;
    case 'left':
//        console.log('Remove right!');
        directions.splice(directions.indexOf('right'),1);
        break;
    case 'right':
//        console.log('Remove left!');
        directions.splice(directions.indexOf('left'),1);
        break;
    default:
        // You dead..
    }

    if (headY == 0) {
//        console.log('xRemove Up!');
        directions.splice(directions.indexOf('up'),1);
    } else if (headY == boardheight - 1) {
//        console.log('xRemove down!');
        directions.splice(directions.indexOf('down'),1);
    }

    if (headX == 0) {
//        console.log('xRemove Left!');
        directions.splice(directions.indexOf('left'),1);
    } else if (headX == boardwidth - 1) {
//        console.log('xRemove Right!');
        directions.splice(directions.indexOf('right'),1);
    }

}

// --- SNAKE LOGIC GOES BELOW THIS LINE ---
// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

    Initialize(request);

  const data = {
    "color": "#004466",
    "headType": "evil",
    "tailType": "skinny"  
  }
  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
health = JSON.stringify(request.body.you.health);
//  console.log('STATUS: ' + response.statusCode);
  console.log('Head at ('+headX+','+headY+') health:'+health);
  PrintBoard(Board);

    var directions = ['up','down','left','right'];
    // put code to limit choices
    InitialMoveRemove(directions,lastmove);
    console.log('Direction Options: '+String(directions));

//    } else if () {

//    } else {
        var mdir = directions[Math.floor(Math.random() * directions.length)]    
//    }


    // pick randomly. Should be done after not choosing any direction.
    console.log('Moving '+ mdir + ' on Turn: '+request.body.turn);



  // UpdateHead so you know where your head is next turn.
    UpdateHead(mdir); 
    // Response data
  const data = {
  //  move: 'right', // one of: ['up','down','left','right']
      move: mdir
  }
  return response.json(data)
//response.on('error',(error) => { console.error(error)})

})

app.post('/end', (request, response) => {
  // NOTE: Any cleanup when a game is complete.
    lastmove = '';
    Board = [];
  return response.json({})
})

app.post('/ping', (request, response) => {
  // Used for checking if this snake is still alive.
console.log('PING!!!');
  return response.json({});
})


// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
