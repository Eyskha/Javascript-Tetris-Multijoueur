const canvas = document.getElementById('canvasjoueur1');
const context = canvas.getContext('2d');
const canvasjoueur2 = document.getElementById('canvasjoueur2');
const contextjoueur2 = canvasjoueur2.getContext('2d');
var socket = io();

context.scale(20, 20);
contextjoueur2.scale(20, 20);

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        joueur.score += rowCount * 10;
        rowCount *= 2;
    }
	
	// Envoi des lignes à l'adversaire
	if(rowCount != 1){
		socket.emit('full rows', {
			nbrows: rowCount/2
		});
	}
}

function gestion_collision(arena, joueur) {  //on regarde si il y a collision entre la pièce en train d'être jouée et une pièce déjà présente dans l'arène
    for (let y = 0; y < joueur.matrix.length; ++y) {
        for (let x = 0; x < joueur.matrix[y].length; ++x) {
            if (joueur.matrix[y][x] !== 0 &&
               (arena[y + joueur.pos.y] &&
                arena[y + joueur.pos.y][x + joueur.pos.x]) !== 0) {
                return true;  //il y a collision , le programme se termine et retourne true
            }
        }
    }
    return false;  //pas de collision
}

function creer_Matrix(w, h) {  //pour créer l'arène initiale
    const matrix = new Array(h);
    for (var i=0;i<h;i++){
        matrix[i] = new Array(w).fill(0);
    }
    return matrix;
}

function nombre_entier_aleatoire(max) {
    var a=0;
    while(a==0){
        a=Math.floor(Math.random() * Math.floor(max));
    }
    return a;
}

function NewPiece(type){
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4,4],
            [4,4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset, inputcontext) {  //on dessine les pièces
    for (y=0;y<matrix.length;y++){
        for (x=0;x<matrix[y].length;x++){
            if (matrix[y][x] !==0){
                inputcontext.fillStyle = couleurs_pieces[matrix[y][x]];
                inputcontext.fillRect(x + offset.x,y + offset.y,1, 1);
            }
        }
    }
}

function drawArena(inputcontext, inputcanvas, inputarena, inputjoueur) {
    inputcontext.fillStyle = 'black';   //couleur du background de l'arène
    inputcontext.fillRect(0, 0, inputcanvas.width, inputcanvas.height);
	
    drawMatrix(inputarena, {x: 0, y: 0}, inputcontext);  //on dessine les pièces déjà présentes
    drawMatrix(inputjoueur.matrix, inputjoueur.pos, inputcontext);  //on dessine la pièce qui est en train de tomber
}

function ajout_piece_joueur(arena, joueur) {  //on ajoute la matrice du joueur à l'arène, cette pièce est placée définitivement (il y avait collision)
    for (y=0;y<joueur.matrix.length;y++){
        for (x=0;x<joueur.matrix[y].length;x++){
            if (joueur.matrix[y][x] !== 0) {
                arena[y + joueur.pos.y][x + joueur.pos.x] = joueur.matrix[y][x];
            }
        };
    };
}

function rotation(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

var nbappels = 0;
function playerDrop() {
	nbappels += 1; // nombre d'appels à la fonction playerDrop (pour 
    joueur.pos.y++;
    if (gestion_collision(arena, joueur)) {
        joueur.pos.y--;
        ajout_piece_joueur(arena, joueur);
        playerReset();
        arenaSweep();
        updateScore();
		
		nbRowsReceived = Math.ceil(nbRowsReceived/nbappels);
		addRowsArena(nbRowsReceived);
		nbRowsReceived = 0;
    }
    dropCounter = 0;
	
	// Contrôle si adversaire a envoyé des lignes
	socket.on('gift from player 2', data => {
		nbRowsReceived += data.nbrows;
	});
}

function playerMove(offset) {
    joueur.pos.x += offset;
    if (gestion_collision(arena, joueur)) {
        joueur.pos.x -= offset;
    }
}

function playerReset() {
    const pieces = 'TJLOSZI';
    joueur.matrix = NewPiece(pieces[pieces.length * Math.random() | 0]);
    joueur.pos.y = 0;
    joueur.pos.x = (arena[0].length / 2 | 0) -
                   (joueur.matrix[0].length / 2 | 0);
    if (gestion_collision(arena, joueur)) {
        arena.forEach(row => row.fill(0));
        joueur.score = 0;
        updateScore();
    }
}

function rotation_piece(dir) {
    const pos = joueur.pos.x;
    let offset = 1;
    rotation(joueur.matrix, dir);
    while (gestion_collision(arena, joueur)) {
        joueur.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > joueur.matrix[0].length) {
            rotation(joueur.matrix, -dir);
            joueur.pos.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
		socket.on('arena player 2', data => {
			arenajoueur2 = data.player2arena;
			joueur2 = data.player2joueur;
			drawArena(contextjoueur2, canvasjoueur2, arenajoueur2,joueur2);
		});
    }
	
    lastTime = time;
	
	socket.emit('arena update', {
		arena: arena,
		joueur: joueur
	});

    drawArena(context, canvas, arena, joueur);
    requestAnimationFrame(update);
	
}

function addRowsArena(nbrows){
	if(nbrows > 0){
		// Si 1ere ligne est non vide alors defaite
		if(arena[0].reduce((a,b) => a+b) != 0){
			// Game over
		}
		else {
			var aleat = nombre_entier_aleatoire(12);
			for(var i=0; i<nbrows; i++){
				const row = arena.splice(0, 1)[0].fill(8)
				row[aleat] = 0;
				arena.push(row);
			}
		}		
	}
}

function updateScore() {
    document.getElementById('score').innerText = joueur.score;
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 65) {
        rotation_piece(-1);
    } else if (event.keyCode === 90) {
        rotation_piece(1);
    }
});

const couleurs_pieces = [
    null,
    '#ee31c5',
    '#ff3f34',
    '#ffd32a',
    '#ffa000',
    '#0fbcf9',
    '#05c46b',
    '#3c40c6',
	'#ffffff'
];

const arena = creer_Matrix(12, 20);
const joueur = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

var arenajoueur2 = creer_Matrix(12, 20);
var joueur2 = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

var nbRowsReceived = 0;

socket.on('user connected', data => {
	var idjoueur = data.userID;
	console.log(idjoueur);
});

playerReset();
updateScore();
update();