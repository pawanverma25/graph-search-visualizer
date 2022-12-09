window.onresize = function(){ location.reload(); }
const container = document.getElementById("container");
const table = document.getElementById("table");
const sizeInput = document.getElementById("cell-dimen");
const wallRadio = document.getElementById("wallRadio");
const weightRadio = document.getElementById("weightRadio");
// var N = 1
//   , S = 2
//   , E = 4
//   , W = 8
const dirs = ['E', 'S', 'W', 'N']
//   , dirsValue = { N: N, E: E, S: S, W: W }
  , DX = { E: 1, W: -1, N: 0, S: 0 }
  , DY = { E: 0, W: 0, N: -1, S: 1 }
//   , OPPOSITE = { E: W, W: E, N: S, S: N }

const values = { "wall" : Infinity,
    "weight" : 10,
    "empty" : 1,
    "start" : -1,
    "target" :  0
};

//grid intial values

// class Cell{
//     constructor(x, y, type){
//         this.x = x;
//         this.y = y;
//         this.type = type;
//         this.isStart = false;
//         this.isTarget = false;
//         this.value = values[type];
//     }
// }


// var start = new Cell(2, 2, "start"), target = new Cell;
var cell_dimen = 40;
var speed = 100;
var row_count = Math.floor(container.clientHeight/cell_dimen);
var col_count = Math.floor(container.clientWidth/cell_dimen);
let Grid = Array(row_count).fill().map(() => Array(col_count).fill(0));
//

// some functions for readability
function setCell(x, y, type){
    Grid[x][y] = values[type];
    document.getElementById(`${x+"-"+y}`).setAttribute("class", `${type}`);
}
function setTerminals(x, y, type){
    Grid[x][y] = values[`${type}`];
    var el = document.getElementById(`${x+"-"+y}`);
    el.setAttribute("class", `${type}`);
    el.removeEventListener("mouseover", paintBrushPopulator);
    el.removeEventListener("click", cellClickToggler);
}
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function generateFence(){
    var d = 0, i = 0, j = 0;
    while(Grid[i][j] != Infinity){
        if(Grid[i][j] == 0 || Grid[i][j] == -1) continue;
        await timeout(speed);
        setCell(i, j, "wall");
        var ni = i + DX[dirs[d]], nj = j + DY[dirs[d]];
        if(ni < 0 || nj < 0 || nj >= col_count || ni >= row_count) d++;
        ni = i + DX[dirs[d]];
        nj = j + DY[dirs[d]];
        i = ni, j = nj;
    }
}
function shuffle(arr){
    var j, x, i = arr.length;
    while (i) {
        j = Math.floor(Math.random() * i);
        x = arr[--i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
};

//


// collapseable
var angle = 0;
document.getElementById("collapse-button").addEventListener("click", (e)=>{
    angle = (180 + angle) % 360;
    e.target.style.transform = `rotate(${angle}deg)`;
});
//


//grid generation
function generateGrid(){
    table.innerHTML = "";
    for(var i = 0; i < row_count; i++){
        var t_row = document.createElement("tr");
        t_row.setAttribute("id", "row"+i);
        for(var j = 0; j < col_count; j++){
            var t_cell = document.createElement("td");
            t_cell.style.height = cell_dimen+"px";
            t_cell.style.width = cell_dimen+"px"; 
            t_cell.style.backgroundSize = cell_dimen+"px";
            t_cell.classList.add("empty");
            t_cell.setAttribute("id", `${i+"-"+j}`);
            t_cell.addEventListener("mouseover", paintBrushPopulator);
            t_cell.addEventListener("click", cellClickToggler);
            t_row.appendChild(t_cell);
        }
        table.appendChild(t_row);
    }
    Grid = new Array(row_count).fill().map(() => Array(col_count).fill(0));
    setTerminals(2, 2, "start");
    setTerminals(row_count-3, col_count-3, "target");
}
generateGrid();
//



//grid resizer
sizeInput.addEventListener("input", ()=>{
    cell_dimen = sizeInput.value;
    row_count = Math.floor(container.clientHeight/cell_dimen);
    col_count = Math.floor(container.clientWidth/cell_dimen);
    generateGrid();
});
//

//speed input
document.addEventListener("input", (e)=>{
    speed = 201 - e.target.value;
});
//

// user added walls and weights 
function paintBrushPopulator(e){
    var x = parseInt(e.target.getAttribute("id").split("-")[0]);
    var y = parseInt(e.target.getAttribute("id").split("-")[1]);
    if(e.buttons == 1){
        if(wallRadio.checked == true) setCell(x,y, "wall")
        else setCell(x, y, "weight");
    }
    e.preventDefault();
}
function cellClickToggler(e){
    var x = parseInt(e.target.getAttribute("id").split("-")[0]);
    var y = parseInt(e.target.getAttribute("id").split("-")[1]);
    if (e.target.classList[0] == "wall" || e.target.classList[0] == "weight"){
        setCell(x, y, "empty");
    }
    else {
        if(wallRadio.checked == true) setCell(x, y, "wall");
        else setCell(x, y, "weight");
    }
}
//


// clear wall function
document.getElementById("clear-walls").addEventListener("click", generateGrid);
//


// random populator
document.getElementById("walls-random").addEventListener("click", randomPopulator);
document.getElementById("weights-random").addEventListener("click", randomPopulator);
function randomPopulator(e){
    var type;
    if(e.target.getAttribute("id") == "walls-random") type = "wall";
    else type = "weight";
    for(var i = 0; i < row_count; i++){
        for(var j = 0; j < col_count; j++){
            if(Grid[i][j] == 2 || Grid[i][j] == 3) continue;
            var r = 0.3 - Math.random();
            if(r > 0) setCell(i, j, type);
            else setCell(i, j, "empty");
        }
    }
}
//

// function recursiveBacktracker(){
//     generateFence();
// }


// function carve_passages_from(cx, cy, Graph) {
//     var directions = shuffle(dirs)
  
//     directions.forEach(function(direction) {
//       var nx = cx + DX[direction]
//         , ny = cy + DY[direction]
  
//       if (ny >= 0 && ny <= (Graph.length - 1) && nx >= 0
//         && nx <= (Graph.length - 1) && Graph[ny][nx] === 0) {
//         Graph[cy][cx] += dirsValue[direction];
//         Graph[ny][nx] += OPPOSITE[direction];
//         carve_passages_from(nx, ny, Graph)
//       }
//     })
//   }
  
//   carve_passages_from(0, 0, Graph)
