$(document).ready(function(){
    var startPos = [0,0]
    var n = 8
    var canvas = document.getElementById('canvas');
    var background 
    var c


    c = canvas.getContext('2d')
    alert(canvas.width)

    canvas.addEventListener("mouseup", doMouseUp, false);

    $('#size').change(function(){
        n = $('#size').val()
    })


    drawBoard()


/*************** canvas functions *************/
    function doMouseUp() {
        var startx, starty
        var sqSize = canvas.width / n
        
        startx = event.pageX-canvas.offsetLeft;
        starty = event.pageY-canvas.offsetTop;

        startx /= sqSize
        starty /= sqSize

        startx = Math.floor(startx)
        starty = Math.floor(starty)

        alert([startx,starty])
        start($('#size').val(),[startx,starty])

    }
    function drawBoard() {
        var squareSize = canvas.width / n
        var x,y, sx,sy
        var black = true
        if (background == null) {
            background = c.createImageData(canvas.width,canvas.height)   

            for (sx = 0; sx < n; sx++) {
                black = !black
            for (sy = 0; sy < n; sy++) {
                black = !black
                for (x = sx*squareSize; x < (sx+1)*squareSize; x++){
                for (y = sy*squareSize; y < (sy+1)*squareSize; y++){
                    if (black) {
                        setPixel(background,x,y,[0,0,0,255])
                    }
                    else {
                        setPixel(background,x,y,[255,255,255,255])
                    }
                
                }
                }
            }
            }
        }
        c.beginPath()
        c.putImageData(background,0,0)
    }
    function setPixel(imageData, x, y, rgba) {
        index = (x + y * imageData.width) * 4;
        imageData.data[index+0] = rgba[0];
        imageData.data[index+1] = rgba[1];
        imageData.data[index+2] = rgba[2];
        imageData.data[index+3] = rgba[3];
    }
/***********************************************************/

/*************** begin constructor functions ***************/
    function makeHorse(start) {
        /* variables */
        this.pos = {"x":start[0], "y":start[1], "nextIndex":0}
        this.track = [{"x":this.pos.x,"y":this.pos.y,"nextIndex":this.pos.nextIndex}]
        this.steps = 0
        this.next = []

        /* methods */
        this.addToTrack = function(){
            this.steps++
            this.track[this.steps] = {"x":this.pos.x, "y":this.pos.y, "nextIndex":0}
        }
        this.getNext = function(board) {
            this.next = getNext(board,this.pos)
        }
        this.sortNext = function(board) {
            sortNext(board,this.next)
        }
        this.move = function(board) {
            move(board,this)
        }
    }
    
    function makeBoard(n) {
        this.squares = []
        this.size = n

        this.read = function(pos){
            return this.squares[pos.x + this.size*pos.y]
        }
        this.write = function(pos,step){
            this.squares[pos.x +this.size*pos.y] = step
        }
        this.init = function () {
            for (var i=0; i < n*n; i++){
                this.squares.push(-1)
            }
        }
    }
/*************** end constructor functions ***************/


/*************** begin functions *************************/
    function start(n,pos) {
        var horse = new makeHorse(pos)
        var board = new makeBoard(n)

    //    horse.pos.x = 5
    //    horse.pos.y = 5
    //    horse.addToTrack()

        board.init()
        board.write(horse.pos,horse.steps)

        horse.move(board)

    }
    function move(board,horse) {
        if (horse.steps < board.size*board.size - 1 && horse.steps >= 0){
            horse.getNext(board)
            horse.sortNext(board)

            alert([horse.steps,horse.next.length,horse.pos.nextIndex, JSON.stringify(horse.next)])
            if (horse.next.length > 0 && horse.pos.nextIndex < horse.next.length) {
                horse.pos.x = horse.next[horse.pos.nextIndex].x
                horse.pos.y = horse.next[horse.pos.nextIndex].y
                horse.pos.nextindex = 0
                horse.addToTrack()
                board.write(horse.pos,horse.steps)

                move(board, horse)
            }
            else {
                board.write(horse.pos,-1)
                horse.track[horse.steps].nextIndex = 0
                horse.steps--
                if (horse.steps < 0) {
                    alert("no solution found!")
                    return
                }
                horse.pos.x = horse.track[horse.steps].x
                horse.pos.y = horse.track[horse.steps].y
                horse.pos.nextIndex = ++horse.track[horse.steps].nextIndex

                move(board,horse)
            }
        }
        else {
            if (horse.steps < 0) {
                alert("no solution found!")
            }
            else {
                alert(JSON.stringify(horse.track))
            }
        }
    }
    function sortNext(board,next){
            var l
            var tmp
            var i, j
            
            if (next.length > 0) {
                for (i = 0; i < next.length; i++){
                    tmp = getNext(board,next[i])
                    next[i].weight += tmp.length
                }
                for (i = 0; i < next.length; i++){
                    tmp = {"x":next[i].x,"y":next[i].y,"weight":next[i].weight}
                for (j = i+1; j < next.length; j++){
                    if(tmp.weight > next[j].weight){
                        next[i] = {"x":next[j].x,"y":next[j].y,"weight":next[j].weight}
                        next[j] = {"x":tmp.x,"y":tmp.y,"weight":tmp.weight}
                    }
                }}

            }

    }

    function getNext(board,cpos){
            var next = []
            var pos = {}

            pos.x = cpos.x + 1
            pos.y = cpos.y + 2
            if (pos.x < board.size && pos.y < board.size && board.read(pos) < 0) {
                next.push({"x":pos.x,"y":pos.y,"weight":board.read(pos)})
            }

            pos.x = cpos.x + 1
            pos.y = cpos.y - 2
            if (pos.x < board.size && pos.y >= 0 && board.read(pos) < 0) {
                next.push({"x":pos.x,"y":pos.y,"weight":board.read(pos)})
            }

            pos.x = cpos.x - 1
            pos.y = cpos.y - 2
            if (pos.x >= 0 && pos.y >= 0 && board.read(pos) < 0) {
                next.push({"x":pos.x,"y":pos.y,"weight":board.read(pos)})
            }

            pos.x = cpos.x - 1
            pos.y = cpos.y + 2
            if (pos.x >= 0 && pos.y < board.size && board.read(pos) < 0) {
                next.push({"x":pos.x,"y":pos.y,"weight":board.read(pos)})
            }

            pos.x = cpos.x + 2
            pos.y = cpos.y + 1
            if (pos.x < board.size && pos.y < board.size && board.read(pos) < 0) {
                next.push({"x":pos.x,"y":pos.y,"weight":board.read(pos)})
            }

            pos.x = cpos.x + 2
            pos.y = cpos.y - 1
            if (pos.x < board.size && pos.y >= 0 && board.read(pos) < 0) {
                next.push({"x":pos.x,"y":pos.y,"weight":board.read(pos)})
            }

            pos.x = cpos.x - 2
            pos.y = cpos.y - 1
            if (pos.x >= 0 && pos.y >= 0 && board.read(pos) < 0) {
                next.push({"x":pos.x,"y":pos.y,"weight":board.read(pos)})
            }

            pos.x = cpos.x - 2
            pos.y = cpos.y + 1
            if (pos.x >= 0 && pos.y < board.size && board.read(pos) < 0) {
                next.push({"x":pos.x,"y":pos.y,"weight":board.read(pos)})
            }

            return next
    }

/*************** end functions *************************/
})
