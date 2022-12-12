window.onresize = function () {
    row_count = Math.floor(container.clientHeight / cell_dimen);
    col_count = Math.floor(container.clientWidth / cell_dimen);
    Grid = new Array(row_count).fill().map(() => Array(col_count).fill(1));
    (start = { x: 2, y: 2 }), (target = { x: row_count - 3, y: col_count - 3 });
    generateGrid();
};
const container = document.getElementById("container");
const table = document.getElementById("table");
const sizeInput = document.getElementById("cell-dimen");
const wallRadio = document.getElementById("wallRadio");
const weightRadio = document.getElementById("weightRadio");
const emptyRadio = document.getElementById("emptyRadio");

const values = { wall: Infinity, weight: 10, empty: 1, start: -1, target: -2, visited: Infinity };

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

var cell_dimen = 40;
var time = 0.001;
var row_count = Math.floor(container.clientHeight / cell_dimen);
var col_count = Math.floor(container.clientWidth / cell_dimen);
let Grid = new Array(row_count).fill().map(() => Array(col_count).fill(1));
let start = { x: 2, y: 2 },
    target = { x: row_count - 3, y: col_count - 3 };
var being_dragged = 0;
//

// some functions for readability
function setCell(x, y, type) {
    if (Grid[x][y] == -1 || Grid[x][y] == -2) {
        return;
    }
    Grid[x][y] = values[type];
    document.getElementById(`${x + "-" + y}`).setAttribute("class", `${type}`);
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
    Grid = new Array(row_count).fill().map(() => Array(col_count).fill(1));
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

// clicks an other
function paintBrushPopulator(e) {
    var x = parseInt(e.target.getAttribute("id").split("-")[0]);
    var y = parseInt(e.target.getAttribute("id").split("-")[1]);
    if (e.buttons == 1) {
        if (wallRadio.checked == true) setCell(x, y, "wall");
        else if (weightRadio.checked == true) setCell(x, y, "weight");
        else setCell(x, y, "empty");
    }
}
function cellClickToggler(e) {
    var x = parseInt(e.target.getAttribute("id").split("-")[0]);
    var y = parseInt(e.target.getAttribute("id").split("-")[1]);
    if (wallRadio.checked == true) setCell(x, y, "wall");
    else if (weightRadio.checked == true) setCell(x, y, "weight");
    else setCell(x, y, "empty");
}

function terminalDragger(e) {
    if (e.target.classList[0] == "start") being_dragged = 1;
    else being_dragged = 2;
}
function dragEnterListener(e) {
    e.preventDefault();
    if (being_dragged == 1) e.target.style.borderColor = "#0275d8";
    else e.target.style.borderColor = "#d9534f";
    e.target.style.borderWidth = "3px";
}
function dragLeaveListener(e) {
    e.target.style.borderWidth = "0.5px";
    e.target.style.borderColor = "#FF2E63";
}
function dropListener(e) {
    e.preventDefault();
    if (being_dragged == 1) {
        if (e.target.getAttribute("id") != `${target.x + "-" + target.y}`) {
            Grid[start.x][start.y] = 1;
            setCell(start.x, start.y, "empty");
            setTerminalsEl(e.target, "start");
        }
    } else {
        if (e.target.getAttribute("id") != `${start.x + "-" + start.y}`) {
            Grid[target.x][target.y] = 1;
            setCell(target.x, target.y, "empty");
            setTerminalsEl(e.target, "target");
        }
    }
    e.target.style.borderWidth = "0.5px";
    e.target.style.borderColor = "#FF2E63";
}
//

// clear board function
document.getElementById("clear-board").addEventListener("click", generateGrid);
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
            var r = 0.3 - Math.random();
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
    if (maxi - mini < 3) {
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
    if (maxj - minj < 3) {
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

const dir = [0, 1, 0, -1, 0];
let parents;
document.getElementById("bfs").addEventListener("click", async () => {
    disableBtns();
    parents = new Array(row_count+1).fill().map(() => Array(col_count+1).fill(-1));
    var q = new Queue();
    q.enqueue([start.x, start.y]);

    await timeout();
    setCell(start.x, start.y, "visited");
    let cur;
    while (!q.isEmpty) {
        cur = q.dequeue();
        if (Grid[cur[0]][cur[1]] == -2) {
            await optimalPath(cur);
            return;
        }
        if (Grid[cur[0]][cur[1]] != Infinity) {
            await timeout();
            setCell(cur[0], cur[1], "visited");
            enableBtns();
        }
        for (var i = 0; i < 4; i++) {
            var next = [cur[0] + dir[i], cur[1] + dir[i + 1]];
            if (next[0] >= 0 && next[1] >= 0 && next[0] < row_count && next[1] < col_count && (Grid[next[0]][next[1]] == 1 || Grid[next[0]][next[1]] == -2)) {
                q.enqueue(next);
                await timeout();
                setCell(next[0], next[1], "visited");
                parents[next[0]][next[1]] = cur;
            }
        }
    }
    enableBtns();
});

async function optimalPath(cur) {
    document.getElementById(`${cur[0] + "-" + cur[1]}`).style.backgroundColor = "#5cb85c";
    while (Grid[cur[0]][cur[1]] != -1) {
        await timeout();
        setCell(cur[0], cur[1], "path");
        console.log(parents, cur);
        cur = parents[cur[0]][cur[1]];
    }
    await timeout();
    document.getElementById(`${cur[0] + "-" + cur[1]}`).style.backgroundColor = "#5cb85c";
}
