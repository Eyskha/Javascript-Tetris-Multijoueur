const canvas = document.getElementById('playarea');
const context = canvas .getContext('2d');

scale = 20;
context.scale(scale,scale);

const nbCasesWidth = canvas.width / scale;
const nbCasesHeight = canvas.height / scale;

const playzone = [];
initplayzone();

const pieces = [
	[
		[0, 1, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	[
		[1, 1, 0],
		[0, 1, 1],
		[0, 0, 0]
	],
	[
		[0, 1, 1],
		[1, 1, 0],
		[0, 0, 0]
	],
	[
		[1, 1],
		[1, 1]
	],
	[
		[0, 0, 1],
		[1, 1, 1],
		[0, 0, 0]
	],
	[
		[1, 0, 0],
		[1, 1, 1],
		[0, 0, 0]
	],
	[
		[0, 0, 0, 0],
		[1, 1, 1, 1],
		[0, 0, 0, 0],
		[0, 0, 0, 0]
	]
];
	
const couleurs = [
	'red',
	'blue',
	'yellow',
	'green',
	'pink',
	'cyan',
	'orange'
];

const player = {
	pos: {x: 3, y: 0},
	piece: 5
}

function drawPiece(indexpiece, x, y){
	piece = pieces[indexpiece];
	for(let i=0; i < piece.length; i++){
		for(let j=0; j < piece[i].length; j++){
			if(piece[i][j] !== 0){
				context.fillStyle = couleurs[indexpiece];
				context.fillRect(x+j, y+i, 1, 1);
			}
		}
	}
}

const delay = 1000;
let lastTime = 0;

function update(time = 0){
	// Clear canvas
	context.fillStyle = '#000';
	context.fillRect(0,0,canvas.width,canvas.height);
	
	// Chute automatique de la pièce ?
	if(time-lastTime >= delay){
		player.pos.y++;
		lastTime = time;
		if(collision()){
			player.pos.y--;
			placementPiece();
		}
	}
	
	// Actualisation de la position de la pièce et affichage
	drawPiece(player.piece,player.pos.x,player.pos.y);
	drawPlayzone();
	
	window.requestAnimationFrame(update);
}

update();

// Déplacements avec détection contact avec bords
document.addEventListener("keydown", event => {
	if(event.keyCode == 37){
		player.pos.x--;
		if(collision()){
			player.pos.x++;
		}
	}
	else if(event.keyCode == 39){
		player.pos.x++;
		if(collision()){
			player.pos.x--;
		}
	}
	else if(event.keyCode == 40){
		player.pos.y++;
		if(collision()){
			player.pos.y--;
			placementPiece();
		}
	}
});

function initplayzone(){
	// Matrice de 0 pour la zone de jeu entourée de 1 pour les bords
	borderRow = new Array(nbCasesWidth+2).fill(1);
	playzone.push(borderRow);
	
	for(let j=0; j < nbCasesHeight; j++){
		row = new Array(nbCasesWidth).fill(0);
		row.unshift(1); // bord gauche
		row.push(1); // bord droit
		
		playzone.push(row);
	}
	
	playzone.push(borderRow);
}

function collision(){
	piece = pieces[player.piece];
	for(let i=0; i < piece.length; i++){
		for(let j=0; j < piece[i].length; j++){
			if(piece[i][j] && playzone[player.pos.y + i + 1][player.pos.x + j + 1]){
				return 1; // Collision
			}
		}
	}
	return 0; // No collision
}

function placementPiece(){
	// Si collision en bas de la pièce alors placement et nouvelle pièce
	piece = pieces[player.piece];
	for(let i=0; i < piece.length; i++){
		for(let j=0; j < piece[i].length; j++){
			if(piece[i][j]){
				playzone[player.pos.y + i + 1][player.pos.x + j + 1] = player.piece+1;
			}
		}
	}
			
	player.piece = Math.floor(Math.random()*7);
	player.pos = {x: 3, y: 0};
}

function drawPlayzone(){
	for(let i=1; i < playzone.length-1; i++){
		for(let j=1; j < playzone[i].length-1; j++){
			if(playzone[i][j]!=0){
				context.fillStyle = couleurs[playzone[i][j]-1];
				context.fillRect(j-1, i-1, 1, 1);
			}
		}
	}
}