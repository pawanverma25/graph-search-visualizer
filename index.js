window.onresize = function () { location.reload()};
const container = document.getElementById("container");
const table = document.getElementById("table");
const sizeInput = document.getElementById("cell-dimen");
const wallRadio = document.getElementById("wallRadio");
const weightRadio = document.getElementById("weightRadio");
const emptyRadio = document.getElementById("emptyRadio");

const values = { "wall": Infinity, "weight": 20, "empty": 0, "start": -1, "target": -2, "visited": 1 , "visited2" : 2 };

class Queue {
    constructor() {
        this.elements = {};
        this.head = 0;
        this.tail = 0;
    }
    enqueue(element) {
        this.elements[this.tail] = element;
        this.tail++;
    }
    dequeue() {
        const item = this.elements[this.head];
        delete this.elements[this.head];
        this.head++;
        return item;
    }
    get length() {
        return this.tail - this.head;
    }
    get isEmpty() {
        return this.length === 0;
    }
}

class Stack {
    constructor() {
        this.elements = {};
        this.top = 0;
    }
    push(element) {
        this.elements[this.top] = element;
        this.top++;
    }
    pop() {
        const item = this.elements[this.top-1];
        delete this.elements[this.top-1];
        this.top--;
        return item;
    }
    get length() {
        return this.top - 0;
    }
    get isEmpty() {
        return this.length === 0;
    }
}

var cell_dimen = 40;
var time = 0.001;
var row_count = Math.floor(container.clientHeight / cell_dimen);
var col_count = Math.floor(container.clientWidth / cell_dimen);
let Grid = new Array(row_count).fill().map(() => Array(col_count).fill(0));
let start = { x: 2, y: 2 },
    target = { x: row_count - 3, y: col_count - 3 };
var being_dragged = 0, being_visualized = 0;
const dir = [0, 1, 0, -1, 0];
var parents, visited;
//

// some functions for readability
function setCell(x, y, type) {
    if (Grid[x][y] == -1 || Grid[x][y] == -2) {
        return;
    }
    Grid[x][y] = values[`${type}`];
    document.getElementById(`${x + "-" + y}`).setAttribute("class", `${type}`);
    document.getElementById(`${x + "-" + y}`).style.backgroundColor = "";
}

function visitCell(x, y, type){
    visited[x][y] = values[`${type}`];
    document.getElementById(`${x + "-" + y}`).classList.add(`${type}`);
    document.getElementById(`${x + "-" + y}`).style.backgroundColor = "";
}

function setCellEL(el, type) {
    var i = parseInt(el.getAttribute("id").split("-")[0]);
    var j = parseInt(el.getAttribute("id").split("-")[1]);
    setCell(i, j, type);
}
function setTerminals(x, y, type) {
    Grid[x][y] = values[`${type}`];
    if (type == "start") {
        start.x = x;
        start.y = y;
    } else {
        target.x = x;
        target.y = y;
    }
    var el = document.getElementById(`${x + "-" + y}`);
    el.setAttribute("class", `${type}`);
    el.removeEventListener("mouseover", paintBrushPopulator);
    el.removeEventListener("click", cellClickToggler);
    removeEventListener("drop", dropListener);
    el.addEventListener("dragstart", terminalDragger);
    el.style.backgroundColor = "";
}

function setTerminalsEl(el, type) {
    var i = parseInt(el.getAttribute("id").split("-")[0]);
    var j = parseInt(el.getAttribute("id").split("-")[1]);
    setTerminals(i, j, type);
}

async function timeout() {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function disableBtns(){
    being_visualized = 1;
    document.getElementById("mazes").disabled = true;
    sizeInput.disabled = true;
    document.getElementById("start").disabled = true;
    wallRadio.disabled = true;
    weightRadio.disabled = true;
    emptyRadio.disabled = true;
    document.getElementById("clear-path").disabled = true;
    document.getElementById("clear-board").disabled = true;
}

function enableBtns(){
    being_visualized = 0;
    document.getElementById("mazes").disabled = false;
    sizeInput.disabled = false;
    document.getElementById("start").disabled = false;
    wallRadio.disabled = false;
    weightRadio.disabled = false;
    emptyRadio.disabled = false;
    document.getElementById("clear-path").disabled = false;
    document.getElementById("clear-board").disabled = false;
}

function shuffle(arr) {
    var j,
        x,
        i = arr.length;
    while (i) {
        j = Math.floor(Math.random() * i);
        x = arr[--i];
        arr[i] = arr[j];
        arr[j] = x;
    }
    return arr;
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

//

// collapseable
var angle = 0,
    collapsed = true;
document.getElementById("collapse-button").addEventListener("click", (e) => {
    angle = (180 + angle) % 360;
    e.target.style.transform = `rotate(${angle}deg)`;
    if (collapsed) document.getElementById("legend").style.maxHeight = "280px";
    else document.getElementById("legend").style.maxHeight = "0px";
    collapsed = !collapsed;
});
//

//grid generation
function generateGrid() {
    table.innerHTML = "";
    for (var i = 0; i < row_count; i++) {
        var t_row = document.createElement("tr");
        t_row.setAttribute("id", "row" + i);
        for (var j = 0; j < col_count; j++) {
            var t_cell = document.createElement("td");
            t_cell.style.height = cell_dimen + "px";
            t_cell.style.width = cell_dimen + "px";
            t_cell.style.backgroundSize = cell_dimen + "px";
            t_cell.classList.add("empty");
            t_cell.setAttribute("id", `${i + "-" + j}`);
            t_cell.addEventListener("mouseover", paintBrushPopulator);
            t_cell.addEventListener("touchmove", touchPopulator);
            t_cell.addEventListener("click", cellClickToggler);
            t_cell.addEventListener("dragenter", dragEnterListener);
            t_cell.addEventListener("dragleave", dragLeaveListener);
            t_cell.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            t_cell.addEventListener("drop", dropListener);
            t_row.appendChild(t_cell);
        }
        table.appendChild(t_row);
    }
    Grid = new Array(row_count).fill().map(() => Array(col_count).fill(0));
    setTerminals(start.x, start.y, "start");
    setTerminals(target.x, target.y, "target");
}
generateGrid();
//

//grid resizer
sizeInput.addEventListener("input", () => {
    cell_dimen = sizeInput.value;
    row_count = Math.floor(container.clientHeight / cell_dimen);
    col_count = Math.floor(container.clientWidth / cell_dimen);
    (start = { x: 2, y: 2 }), (target = { x: row_count - 3, y: col_count - 3 });
    generateGrid();
});
//

//speed input
document.getElementById("speed").addEventListener("input", (e) => {
    time = 50.01 - e.target.value;
});
//

// clicks and touches
function touchPopulator(e){
    if(being_visualized == 1) return;
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el != table && el.nodeName == "TD") {
        if (wallRadio.checked == true) setCellEL(el, "wall");
        else if (weightRadio.checked == true) setCellEL(el, "weight");
        else setCellEL(el, "empty");
    }
}

function paintBrushPopulator(e) {
    if(being_visualized == 1) return;
    if (e.buttons == 1) {
        if (wallRadio.checked == true) setCellEL(e.target, "wall");
        else if (weightRadio.checked == true) setCellEL(e.target, "weight");
        else setCellEL(e.target, "empty");
    }
}
function cellClickToggler(e) {
    if(being_visualized == 1) return;
    var x = parseInt(e.target.getAttribute("id").split("-")[0]);
    var y = parseInt(e.target.getAttribute("id").split("-")[1]);
    if (wallRadio.checked == true) setCell(x, y, "wall");
    else if (weightRadio.checked == true) setCell(x, y, "weight");
    else setCell(x, y, "empty");
}

function terminalDragger(e) {
    if(being_visualized == 1) return;
    if (e.target.classList[0] == "start") being_dragged = 1;
    else being_dragged = 2;
}
function dragEnterListener(e) {
    if(being_visualized == 1) return;
    e.preventDefault();
    if (being_dragged == 1) e.target.style.borderColor = "#0275d8";
    else e.target.style.borderColor = "#d9534f";
    e.target.style.borderWidth = "3px";
}
function dragLeaveListener(e) {
    if(being_visualized == 1) return;
    e.target.style.borderWidth = "0.5px";
    e.target.style.borderColor = "#FF2E63";
}
function dropListener(e) {
    if(being_visualized == 1) return;
    e.preventDefault();
    if (being_dragged == 1) {
        if (e.target.getAttribute("id") != `${target.x + "-" + target.y}`) {
            Grid[start.x][start.y] = 0;
            setCell(start.x, start.y, "empty");
            setTerminalsEl(e.target, "start");
        }
    } else {
        if (e.target.getAttribute("id") != `${start.x + "-" + start.y}`) {
            Grid[target.x][target.y] = 0;
            setCell(target.x, target.y, "empty");
            setTerminalsEl(e.target, "target");
        }
    }
    e.target.style.borderWidth = "0.5px";
    e.target.style.borderColor = "#FF2E63";
}
//

// clear function
document.getElementById("clear-board").addEventListener("click", generateGrid);
document.getElementById("clear-path").addEventListener("click", ()=>{
    for(var i = 0; i < row_count; i++){
        for(var j = 0; j < col_count; j++){
            if(Grid[i][j] == 20){
                setCell(i, j, "weight");
            }
            else if(Grid[i][j] != Infinity){
                setCell(i, j, "empty");
            }
        }
    }
    setTerminals(start.x, start.y, "start");
    setTerminals(target.x, target.y, "target");
    enableBtns();
});
//

// random populator
document.getElementById("walls-random").addEventListener("click", randomPopulator);
document.getElementById("weights-random").addEventListener("click", randomPopulator);
function randomPopulator(e) {
    var type;
    if (e.target.getAttribute("id") == "walls-random") type = "wall";
    else type = "weight";
    for (var i = 0; i < row_count; i++) {
        for (var j = 0; j < col_count; j++) {
            if (Grid[i][j] == -1 || Grid[i][j] == -2) continue;
            var r = 0.5 - Math.random();
            if (r > 0) setCell(i, j, type);
            else setCell(i, j, "empty");
        }
    }
}
//

async function addOuterWalls() {
    for (var i = 0; i < row_count; i++) {
        if (i == 0 || i == row_count - 1) {
            for (var j = 0; j < col_count; j++) {
                await timeout();
                setCell(i, j, "wall");
            }
        } else {
            await timeout();
            setCell(i, 0, "wall");
            setCell(i, col_count - 1, "wall");
        }
    }
}

async function addInnerWalls(h, minj, maxj, mini, maxi) {
    if (h) {
        if (maxj - minj < 2) {
            return;
        }
        var x = Math.floor(randomNumber(mini, maxi) / 2) * 2;
        await addHWall(minj, maxj, x);
        await addInnerWalls(!h, minj, maxj, mini, x - 1);
        await addInnerWalls(!h, minj, maxj, x + 1, maxi);
    } else {
        if (maxi - mini < 2) {
            return;
        }
        var y = Math.floor(randomNumber(minj, maxj) / 2) * 2;
        await addVWall(mini, maxi, y);
        await addInnerWalls(!h, minj, y - 1, mini, maxi);
        await addInnerWalls(!h, y + 1, maxj, mini, maxi);
    }
}

async function addInnerWallsH(minj, maxj, mini, maxi) {
    if (maxi - mini < 4) {
        var y = Math.floor(randomNumber(minj, maxj) / 2) * 2;
        await addVWall(mini, maxi, y);
        await addInnerWalls(false, minj, y - 1, mini, maxi);
        await addInnerWalls(false, y + 1, maxj, mini, maxi);
        return;
    } else {
        var x = Math.floor(randomNumber(mini, maxi) / 2) * 2;
        await addHWall(minj, maxj, x);
        await addInnerWallsH(minj, maxj, mini, x - 1);
        await addInnerWallsH(minj, maxj, x + 1, maxi);
    }
}

async function addInnerWallsV(minj, maxj, mini, maxi) {
    if (maxj - minj < 4) {
        var x = Math.floor(randomNumber(mini, maxi) / 2) * 2;
        await addHWall(minj, maxj, x);
        await addInnerWalls(true, minj, maxj, mini, x - 1);
        await addInnerWalls(true, minj, maxj, x + 1, maxi);
    } else {
        var y = Math.floor(randomNumber(minj, maxj) / 2) * 2;
        await addVWall(mini, maxi, y);
        await addInnerWallsV(minj, y - 1, mini, maxi);
        await addInnerWallsV(y + 1, maxj, mini, maxi);
    }
}

async function addHWall(minj, maxj, x) {
    var hole = Math.floor(randomNumber(minj, maxj) / 2) * 2 + 1;
    for (var i = minj; i <= maxj; i++) {
        await timeout();
        if (i == hole) setCell(x, i, "empty");
        else setCell(x, i, "wall");
    }
}

async function addVWall(mini, maxi, y) {
    var hole = Math.floor(randomNumber(mini, maxi) / 2) * 2 + 1;

    for (var i = mini; i <= maxi; i++) {
        await timeout();
        if (i == hole) setCell(i, y, "empty");
        else setCell(i, y, "wall");
    }
}

document.getElementById("recursive-division").addEventListener("click", async () => {
    disableBtns();
    generateGrid();
    await addOuterWalls();
    await addInnerWalls(Math.random() > 0.5, 1, col_count - 2, 1, row_count - 2);
    enableBtns();
});

document.getElementById("recursive-division-vertical").addEventListener("click", async () => {
    disableBtns();
    generateGrid();
    await addOuterWalls();
    await addInnerWallsV(1, col_count - 2, 1, row_count - 2);
    enableBtns();
});

document.getElementById("recursive-division-horizontal").addEventListener("click", async () => {
    disableBtns();
    generateGrid();
    await addOuterWalls();
    await addInnerWallsH(1, col_count - 2, 1, row_count - 2);
    enableBtns();
});

async function bfs(){
    parents = new Array(row_count).fill().map(() => Array(col_count).fill(-1));
    visited = new Array(row_count).fill().map(() => Array(col_count).fill(0));
    var q = new Queue();
    q.enqueue([start.x, start.y]);
    await timeout();
    visitCell(start.x, start.y, "visited");
    let cur;
    while (!q.isEmpty) {
        cur = q.dequeue();
        if (Grid[cur[0]][cur[1]] != 0) {
            await timeout();
            visitCell(cur[0], cur[1], "visited");
        }
        for (var i = 0; i < 4; i++) {
            var next = [cur[0] + dir[i], cur[1] + dir[i + 1]];
            if (next[0] >= 0 && next[1] >= 0 && next[0] < row_count && next[1] < col_count && Grid[next[0]][next[1]] != Infinity && visited[next[0]][next[1]] != 1) {
                q.enqueue(next);
                await timeout();
                visitCell(next[0], next[1], "visited");
                parents[next[0]][next[1]] = cur;
                if (Grid[next[0]][next[1]] == -2) {
                    await optimalPath(next, -1);
                    return;
                }
            }
        }
    }
}
document.getElementById("bfs").addEventListener("click", async () => {
    disableBtns();
    await bfs();
    document.getElementById("clear-path").disabled = false;
});

async function optimalPath(cur, t) {
    document.getElementById(`${cur[0] + "-" + cur[1]}`).classList.add("path");
    while (cur != -1 && Grid[cur[0]][cur[1]] != t) {
        await timeout();
        document.getElementById(`${cur[0] + "-" + cur[1]}`).classList.add("path");
        cur = parents[cur[0]][cur[1]];
    }
    if(cur != -1) document.getElementById(`${cur[0] + "-" + cur[1]}`).classList.add("path");
}

var found;
async function dfs(cur){
    if(found == true) return;
    if (visited[cur[0]][cur[1]] != 1) {
        await timeout();
        visitCell(cur[0], cur[1], "visited");
    }
    if (Grid[cur[0]][cur[1]] == -2) {
        await optimalPath(cur, -1);
        document.getElementById("clear-path").disabled = false;
        found = true;
        return;
    }
    for (var i = 0; i < 4; i++) {
        var next = [cur[0] + dir[i], cur[1] + dir[i + 1]];
        if (next[0] >= 0 && next[1] >= 0 && next[0] < row_count && next[1] < col_count && Grid[next[0]][next[1]] != Infinity && visited[next[0]][next[1]] != 1) {
            parents[next[0]][next[1]] = cur;
            await dfs(next);
        }
    }
}
document.getElementById("dfs").addEventListener("click", async ()=>{
    found = false;
    parents = new Array(row_count).fill().map(() => Array(col_count).fill(-1));
    visited = new Array(row_count).fill().map(() => Array(col_count).fill(0));
    disableBtns();
    await dfs([start.x, start.y]);
    document.getElementById("clear-path").disabled = false;
});


async function bbfs(t){
    var type, q = new Queue();
    if(t == 1) {
        type = "visited2";
        q.enqueue([target.x, target.y]);
    }
    else {
        type = "visited";
        q.enqueue([start.x, start.y]);
    }
    while (!q.isEmpty) {
        var cur = q.dequeue();
        if (visited[cur[0]][cur[1]] != 0) {
            await timeout();
            visitCell(cur[0], cur[1], type);
        }
        for (var i = 0; i < 4; i++) {
            var next = [cur[0] + dir[i], cur[1] + dir[i + 1]];
            if(found == true) return;
            if (next[0] >= 0 && next[1] >= 0 && next[0] < row_count && next[1] < col_count && (Grid[next[0]][next[1]] != Infinity &&  visited[next[0]][next[1]] != 3-t)) {
                q.enqueue(next);
                if (visited[next[0]][next[1]] == t || Grid[next[0]][next[1]] == -t) {
                    found = true;
                    optimalPath(cur, t-3);
                    optimalPath(next, -t);
                    document.getElementById("clear-path").disabled = false;
                    return;
                }
                await timeout();
                visitCell(next[0], next[1], type);
                parents[next[0]][next[1]] = cur;
            }
        }
    }
    document.getElementById("clear-path").disabled = false;
}
document.getElementById("bbfs").addEventListener("click", () => {
     
    found = false;
    disableBtns();
    parents = new Array(row_count).fill().map(() => Array(col_count).fill(-1));
    visited = new Array(row_count).fill().map(() => Array(col_count).fill(0));
    bbfs(1);
    bbfs(2);
});

///////// weighed algorithms
var Graph, distance;
function generateAdjGraph(){
    Graph = [];
    for(var i = 0; i < row_count; i++){
        var row = [];
        for(var j = 0; j < col_count; j++){
            var neighbours = [];
            for (var k = 0; k < 4; k++) {                
                var next = [i + dir[k], j + dir[k+1]], value;
                if (next[0] >= 0 && next[1] >= 0 && next[0] < row_count && next[1] < col_count && Grid[next[0]][next[1]] != Infinity){
                    if(Grid[next[0]][next[1]] == 20) value = 20;
                    else value = 1;
                    neighbours.push([value, next]);
                }
            }
            row.push(neighbours);
        }
        Graph.push(row);
    }
}


class PriorityQueue{
    constructor(){
        this.values = []
    }
    swap(index1, index2){
        var temp = this.values[index1];
        this.values[index1] = this.values[index2];
        this.values[index2] = temp;
        return this.values;
    }
    heapifyUp(){
        var index = this.values.length - 1;
        while(index > 0){
            let parent = Math.floor((index - 1)/2);
            if(this.values[parent][0] > this.values[index][0]){
                this.swap(index, parent);
                index = parent;
            } else{
                break;
            }
        }
    }
    
    push(value){
        this.values.push(value)
        this.heapifyUp();
    }

    heapifyDown(){
        var parent = 0;
        const length = this.values.length;
        while (true){
            let left = 2*parent + 1;
            let right = 2*parent + 2;
            let swap = null;      
            if (left < length && this.values[left][0] < this.values[parent][0]) swap = left;
            if (right < length && ((swap === null && this.values[right][0] < this.values[parent][0]) || (swap !== null && this.values[right][0] < this.values[left][0]))) swap = right;
            if (swap === null) break;
            this.swap(parent, swap);
            parent = swap;
        }
    }

    pop(){
        this.swap(0, this.values.length - 1);
        var poppedNode = this.values.pop();
        if(this.values.length > 1){
            this.heapifyDown();
        }
        return poppedNode;
    }
}

// async function visualizeDijstras(){
//     var distancePQ = new PriorityQueue();
//     for(var i = 0; i < row_count; i++){
//         for(var j = 0; j < col_count; j++){
//             distancePQ.push([distance[i][j], [i, j]]);
//         }
//     }
//     while(distancePQ.values.length > 0){
//         var cur = distancePQ.pop();
//         if(Grid[cur[1][0]][cur[1][1]] == -2) return; 
//         await timeout();
//         document.getElementById(`${cur[1][0] + "-" + cur[1][1]}`).classList.add("visited");
//         document.getElementById(`${cur[1][0] + "-" + cur[1][1]}`).style.backgroundColor = "";
//     }
// }

document.getElementById("dijkstras").addEventListener("click", async ()=> {
    disableBtns();
    generateAdjGraph();
    
    parents = new Array(row_count).fill().map(() => Array(col_count).fill(-1));
    distance = new Array(row_count).fill().map(() => Array(col_count).fill(100000));
    var pq = new PriorityQueue();
    pq.push([0, [start.x, start.y]]);
    distance[start.x][start.y] = 0;
    while(pq.values.length > 0){
        var cur = pq.pop();
        await timeout();
        document.getElementById(`${cur[1][0] + "-" + cur[1][1]}`).classList.add("visited");
        document.getElementById(`${cur[1][0] + "-" + cur[1][1]}`).style.backgroundColor = "";
        if(Grid[cur[1][0]][cur[1][1]] == -2) break; 
        Graph[cur[1][0]][cur[1][1]].forEach(neighbour => {
            if(neighbour[0] + cur[0] < distance[neighbour[1][0]][neighbour[1][1]]){
                distance[neighbour[1][0]][neighbour[1][1]] = neighbour[0] + cur[0];
                pq.push([neighbour[0] + cur[0], neighbour[1]]);
                parents[neighbour[1][0]][neighbour[1][1]] = cur[1];
            }
        });
    }
    await optimalPath([target.x, target.y], -1);
    document.getElementById("clear-path").disabled = false;
});