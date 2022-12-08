window.onresize = function(){ location.reload(); }
const container = document.getElementById("container");
const grid = document.getElementById("grid");
const sizeInput = document.getElementById("cell-dimen");
const wallRadio = document.getElementById("wallRadio");
const weightRadio = document.getElementById("weightRadio");
// var N = 1
//   , S = 2
//   , E = 4
//   , W = 8
//   , dirs = ['N', 'E', 'S', 'W']
//   , dirsValue = { N: N, E: E, S: S, W: W }
//   , DX = { E: 1, W: -1, N: 0, S: 0 }
//   , DY = { E: 0, W: 0, N: -1, S: 1 }
//   , OPPOSITE = { E: W, W: E, N: S, S: N }

const values = { "wall" : Infinity,
    "weight" : 10,
    "empty" : 1,
    "visited" : Infinity,
    "start" : 0,
    "target" :  180
};

//grid intial values

// class Cell{
//     constructor(x, y, type){
//         this.x = x;
//         this.y = y;
//         this.type = type;
//         this.isTarget = false;
//         this.value = values[type];
//     }
//     setCell(type){
//         document.getElementById(`${x+"-"+y}`).setAttribute("class", `${type}`);
//         if(type == "start" || type == "target"){
//             document.getElementById(`${x+"-"+y}`).removeEventListener("mouseover", paintBrushPopulator);
//             document.getElementById(`${x+"-"+y}`).removeEventListener("click", cellClickToggler);
//         }
//     }
// }


// var start = new Cell(2, 2, "start"), target = new Cell;
var cell_dimen = 40;
var row_count = Math.floor(container.clientHeight/cell_dimen);
var col_count = Math.floor(container.clientWidth/cell_dimen);
let Graph = Array(row_count).fill().map(() => Array(col_count).fill(0));
//

// some functions for readability
function setCell(x, y, type){
    Graph[x][y] = values[type];
    document.getElementById(`${x+"-"+y}`).setAttribute("class", `${type}`);
}
function setTerminals(x, y, type){
    Graph[x][y] = values[`${type}`];
    var el = document.getElementById(`${x+"-"+y}`);
    el.setAttribute("class", `${type}`);
    el.removeEventListener("mouseover", paintBrushPopulator);
    el.removeEventListener("click", cellClickToggler);
}
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
    grid.innerHTML = "";
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
        grid.appendChild(t_row);
    }
    Graph = new Array(row_count).fill().map(() => Array(col_count).fill(0));
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
            if(Graph[i][j] == 2 || Graph[i][j] == 3) continue;
            var r = 0.3 - Math.random();
            if(r > 0) setCell(i, j, type);
            else setCell(i, j, "empty");
        }
    }
}
//

function generateFence(){
    for(var i = 0; i < row_count; i++){
        setCell(i, 0, "wall");
        setCell(i, col_count-1, "wall");
    }
    for(var j = 0; j < col_count; j++){
        setCell(0, j, "wall");
        setCell(row_count-1, j, "wall");
    }
}

// function dfs(){

// }

// function recursiveBacktracker(){
//     generateFence();
// }

// function shuffle(o){
//     for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
//     return o;
// };

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
