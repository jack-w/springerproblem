$(document).ready(function(){
var canvas = document.getElementById('canvas');
var c
var background

c = canvas.getContext('2d')
drawBoard()

canvas.addEventListener("mouseup", doMouseUp, false);

$('#reset').click(function(){drawBoard()})

/*************** canvas functions *************/
function doMouseUp(event) {
    var startx, starty
    var n = $('#size').val()
    var sqSize = canvas.width / n
    var drawRate = $('#drawRate').val()
    
    startx = event.pageX-canvas.offsetLeft;
    starty = event.pageY-canvas.offsetTop;

    startx /= sqSize
    starty /= sqSize

    startx = Math.floor(startx)
    starty = Math.floor(starty)

//    alert([startx,starty])

    var board = new makeBoard(n,[startx,starty])
    var i = 0
    if (n%2 == 0){
    board.init()
    board.move()
    }
    else {
        if ((startx + starty*n)%2 == 0 ) {
            board.init()
            board.move()
        }
        else {
            alert('there cannot be a solution!')
            i = board.size*board.size
        }
    }


    setInterval(function(){
        if (i < board.size*board.size) {
            var x,y, r
            var n = $('#size').val()
            var sqSize = canvas.width / n
            r = 0.3 * sqSize
            x = board.prev[i].x * sqSize + sqSize/2
            y = board.prev[i].y * sqSize + sqSize/2
            c.beginPath()
            c.arc(x,y,r,0,2*Math.PI,false)
            c.fillStyle = "green"
            c.fill()
            c.beginPath()
            c.fillStyle = "white"
            c.fillText(board.readState(board.prev[i]),x,y)
            i++
        }
    },drawRate)

}
function drawBoard() {
//    alert('hi')
    var n = $('#size').val()
    var sqSize = canvas.width / n
    var x,y, sx,sy
    var black = true

    for (sx = 0; sx < n; sx++) {
        if (n%2 == 0) {
            black = !black
        }
    for (sy = 0; sy < n; sy++) {
        black = !black
        c.beginPath()
        c.rect(sx*sqSize,sy*sqSize, sqSize,sqSize)
        if(black){
            c.fillStyle = 'black'
        }
        else {
            c.fillStyle = 'white'
        }
        c.fill()
    }
    }
}
function setPixel(imageData, x, y, rgba) {
    index = (x + y * imageData.width) * 4;
    imageData.data[index+0] = rgba[0];
    imageData.data[index+1] = rgba[1];
    imageData.data[index+2] = rgba[2];
    imageData.data[index+3] = rgba[3];
}
/***********************************************************/

/********** constructor function **********/
/******************************************/
function makeBoard(size,begin) {
    /****** variables ******/
    this.pos = {"x":begin[0],"y":begin[1],"nextIndex":0}
    this.steps = 0
    this.size = size
    this.squares = []
    this.next = []
    this.prev = [{"x":begin[0],"y":begin[1]}]

    /****** methods ********/
    this.move = function(){
        move(this)
    }
    this.sortNext = function(){
        sortNext(this,this.next)
    }
    this.getNext = function(){
        this.next = getNext(this,this.pos)
    }
    this.writeState = function(pos,steps){
        this.squares[pos.x + pos.y*this.size].state = steps 
    }
    this.writeNextIndex = function(pos,next){
        this.squares[pos.x + pos.y*this.size].nextIndex = next 
    }
    this.readState = function(pos){
        return this.squares[pos.x + pos.y*this.size].state
    }
    this.readNextIndex = function(pos){
        return this.squares[pos.x + pos.y*this.size].nextIndex
    }
    this.incNextIndex = function(pos){
        this.squares[pos.x + pos.y * this.size].nextIndex++
    }
    this.init = function(){
        var x,y, i
        for (x = 0; x < this.size; x++) {
        for (y = 0; y < this.size; y++) {
            i = x + y * this.size
            this.squares[i] = {"x":x,"y":y,"state":-1,"nextIndex":0}
        }
        }
        i = this.pos.x + this.pos.y * this.size
        this.squares[i] = {"x":this.pos.x,"y":this.pos.y,"state":0,"nextIndex":0}
    }
}
/******************************************/


/************* other methods **************/
/******************************************/
function move(board){
    if (board.steps < board.size*board.size -1 && board.steps > -1) {
        board.getNext()
//        alert(JSON.stringify(board.pos))
        board.sortNext()
        var n = board.readNextIndex(board.pos)
        if (board.next.length > 0 && n < board.next.length) {
            board.pos.x = board.next[n].x
            board.pos.y = board.next[n].y
            board.steps++
            board.writeNextIndex(board.pos,0)
            board.writeState(board.pos,board.steps)
            board.prev[board.steps] = {"x":board.pos.x,"y":board.pos.y}
            move(board)
        }
        else {
            board.writeState(board.pos, -1)
            board.steps--
            board.pos.x = board.prev[board.steps].x
            board.pos.y = board.prev[board.steps].y
            board.incNextIndex(board.pos)
            move(board)
        }
    }
    else {
        if (board.steps < 0) {
            alert('no solution found!')
        }
//        alert(JSON.stringify([board.prev,board.prev.length]))
        return
    }
}
function getNext(board,inPos) {
    var next = []
    var pos = {}

    pos.x = inPos.x + 1
    pos.y = inPos.y + 2
    if (pos.x < board.size && pos.y < board.size && board.readState(pos) < 0){
        next.push({"x":pos.x,"y":pos.y,"weight":-1})
    }

    pos.x = inPos.x + 1
    pos.y = inPos.y - 2
    if (pos.x < board.size && pos.y > -1 && board.readState(pos) < 0){
        next.push({"x":pos.x,"y":pos.y,"weight":-1})
    }

    pos.x = inPos.x - 1
    pos.y = inPos.y + 2
    if (pos.x > -1 && pos.y < board.size && board.readState(pos) < 0){
        next.push({"x":pos.x,"y":pos.y,"weight":-1})
    }

    pos.x = inPos.x - 1
    pos.y = inPos.y - 2
    if (pos.x > -1 && pos.y > -1 && board.readState(pos) < 0){
        next.push({"x":pos.x,"y":pos.y,"weight":-1})
    }

    pos.x = inPos.x + 2
    pos.y = inPos.y + 1
    if (pos.x < board.size && pos.y < board.size && board.readState(pos) < 0){
        next.push({"x":pos.x,"y":pos.y,"weight":-1})
    }

    pos.x = inPos.x + 2
    pos.y = inPos.y - 1
    if (pos.x < board.size && pos.y > -1 && board.readState(pos) < 0){
        next.push({"x":pos.x,"y":pos.y,"weight":-1})
    }

    pos.x = inPos.x - 2
    pos.y = inPos.y + 1
    if (pos.x > -1 && pos.y < board.size && board.readState(pos) < 0){
        next.push({"x":pos.x,"y":pos.y,"weight":-1})
    }

    pos.x = inPos.x - 2 
    pos.y = inPos.y - 1
    if (pos.x > -1 && pos.y > -1 && board.readState(pos) < 0){
        next.push({"x":pos.x,"y":pos.y,"weight":-1})
    }
    return next
}
function sortNext(board,next) {
    var i,j
    var tmp 
    var tmpNext
    if (next.length > 0){
        for (i = 0; i < next.length; i++){
            tmp = getNext(board,next[i])
            next[i].weight = tmp.length
        }
        for (i = 0; i < next.length; i++){
            for (j = i+1; j < next.length; j++){
                if (next[i].weight > next[j].weight){
                    tmp = {}
                    tmp.x = next[i].x
                    tmp.y = next[i].y
                    tmp.weight = next[i].weight
                    next[i].x = next[j].x
                    next[i].y = next[j].y
                    next[i].weight = next[j].weight
                    next[j].x = tmp.x
                    next[j].y = tmp.y
                    next[j].weight = tmp.weight
                }
            }
        }
    }
}
/******************************************/
})
