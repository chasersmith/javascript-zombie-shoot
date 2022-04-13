// Copyright © 2017 Chase Smith
// https://mit-license.org/
// https://github.com/chasersmith

var mouseX;
var mouseY;

$( "#gameCanvas" ).on( "mousemove", function( event ) {
	mouseX = event.pageX;
	mouseY = event.pageY;
});

$(document).ready(function(){

	var versionNumber = "Dev 1.0";
    
    // 0=startScreen 1=game 2=gameover
	var gameState = 0;

	var canvasWidth = 640;
	var canvasHeight = 480;

	var canvas = $("#gameCanvas")[0];
	var context = canvas.getContext("2d");
	var mousePos;

	var score = 0;
	var health = 100;
	var timer = 0;
	var spawnZombie = false;
	var musicPlaying = false;

	//crosshair
	var crossHair = new Image();
	var crosshairX = 50;
	var crosshairY = 50;
	crossHair.src = "media/crosshair.png";

	//zombies
	var zombies = [];
	var zombieLeft = new Image();
	zombieLeft.src = "media/zombieLEFT.png";
	var zombieRight = new Image();
	zombieRight.src = "media/zombieRIGHT.png";

	//start screen stuff
	var menuGuy = new Image();
	menuGuy.src = "media/menuguy.png";
	var playButton = {x:320, y:250, width:200, height:70};

	var fps = 30;
	setInterval(function(){
		update();
		draw();
	}, 1000/fps);

    // Gamelogic ran every frame
	function update(){
		switch(gameState){
			// Menu state
			case 0:{
				document.body.onmousedown = function() {
					if(mousePos.x >= playButton.x && mousePos.x <= playButton.x + playButton.width
						&& mousePos.y >= playButton.y && mousePos.y <= playButton.y + playButton.height){
							gameState = 1;
					}
				};
				break;
			}

			// Game state
			case 1:{
				if(!musicPlaying){
					var audioElement = document.getElementById('gameMusic');
					audioElement.setAttribute("preload", "auto");
					audioElement.autobuffer = true;
					audioElement.load();
					audioElement.play();
					musicPlaying = true;
				}

				timer += 1;
				crosshairX = mousePos.x - 50;
				crosshairY = mousePos.y - 50;

                // Zombie spawn timer based on score
				if(timer >= 70 - (score * .5)){
					timer = 0;
					spawnZombie = true;
				}  

				if(health <= 0){
					gameState = 2;
				}

                // Crosshair logic
				document.body.onmousedown = function() {
					var ch = { 
                        x: crosshairX, 
                        y: crosshairY, 
                        width: 40, 
                        height: 100 
                    };

					for (var i = 0; i < zombies.length; i++) {

                        // If user clicks on zombie, add to score and remove zombie
						if (collides(zombies[i], ch)) {
							score+=1;
							zombies[i].active = false;
						}
					}
				};

				zombies.forEach(function(zombie) {
					zombie.update();
				});

                // Array of active zombies
				zombies = zombies.filter(function(zombie){
					return zombie.active;
				});

				if (spawnZombie) {
					zombies.push(Zombie(null, "left"));
					zombies.push(Zombie(null, "right"));
					spawnZombie = false;
				}

				break;
			}

            // Gameover state
			case 2:{
				document.body.onmousedown = function() {
                    // Initialize game if user clicks on play button
					if (mousePos.x >= playButton.x -130 && mousePos.x <= playButton.x -130 + playButton.width
						&& mousePos.y >= playButton.y && mousePos.y <= playButton.y + playButton.height){
							gameState = 0;
							health = 100;
							score = 0;
							zombies = [];
							timer = 0;
					}
				};

				break;
			}
		}
	}

    // Media to draw every frame
	function draw(){
		switch (gameState) {
            // Menu state
			case 0: {
				context.clearRect(0,0, canvasWidth, canvasHeight);

				context.fillStyle = "#a5a5a5";
				context.fillRect(0,0, canvasWidth, canvasHeight);

				context.fillStyle = "#000";
				context.font = "72px Comic Sans MS";
				context.fillText("Zombie Shoot", canvasWidth/2 - 250, canvasHeight/2 - 100);

				context.drawImage(menuGuy, 30,210);

				context.fillStyle = "#000000";
				context.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);
				context.fillStyle = "#ffffff";
				context.font = "30px Comic Sans MS";
				context.fillText("PLAY", 380, 295);

				context.fillStyle = "#000";
				context.font = "20px Comic Sans MS";
				context.fillText("Version " + versionNumber, 500, 450 );

				break;
			}

            // Game state
			case 1: {
				context.clearRect(0,0, canvasWidth, canvasHeight);

				context.fillStyle = "#005804";
				context.fillRect(0,0, canvasWidth, canvasHeight);

				context.fillStyle = "#000";
				context.font = "20px Comic Sans MS";
				context.fillText("Score: " + score, 50, 50);
				context.fillText("Health: " + health, 400, 50);

				zombies.forEach(function(zombie) {
					zombie.draw();
				});

				context.drawImage(crossHair, crosshairX, crosshairY, 100, 100);

				break;
			}

            // Gameover state
			case 2: {
				context.clearRect(0,0, canvasWidth, canvasHeight);

				context.fillStyle = "#a5a5a5";
				context.fillRect(0,0, canvasWidth, canvasHeight);

				context.fillStyle = "#000";
				context.font = "72px Comic Sans MS";
				context.fillText("GAME OVER", canvasWidth/2 - 250, canvasHeight/2 - 100);

				context.fillStyle = "#000000";
				context.fillRect(playButton.x -130, playButton.y, playButton.width, playButton.height);
				context.fillStyle = "#ffffff";
				context.font = "30px Comic Sans MS";
				context.fillText("RETRY", playButton.x - 75, 295);
				context.fillStyle = "#ffffff";
				context.fillText("Score: " + score, canvasWidth/2 - 100, canvasHeight/2 - 25);

				break;
			}
		}
	}

	function Zombie(I, dir) {
		I = I || {};
		I.active = true;
		I.speed = 5;
		I.y = getRandomInt(50, 350);

		if(dir == "left"){
			I.x = 800;
		}
		else if(dir == "right"){
			I.x = -100;
		}

		I.width = 100;
		I.height = 100;

		I.inBounds = function() {
			return I.x >= 0 && I.x <= canvasWidth &&
			I.y >= 0 && I.y <= canvasHeight;
		};

		I.draw = function() {
			if (this.active) {
				if (dir == "left") {
					var temp_zombieL = zombieLeft;
					context.drawImage(temp_zombieL, this.x, this.y, this.width, this.height);
				}
				else if (dir == "right") {
					var temp_zombieR = zombieRight;
					context.drawImage(temp_zombieR, this.x, this.y, this.width, this.height);
				}
			}
		};

		I.update = function() {
			if (dir == "left") {
				this.x -= this.speed;

				if (this.x <= -100) {
					this.active = false;
					health -= 10;
				}
			}
			else if (dir == "right") {
				this.x += this.speed;

				if (this.x >= 650) {
					this.active = false;
					health -= 10;
				}
			}
		};

		I.onclick = function(){
			I.remove();
		};

		return I;
	}

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

    // Return boolean based on if a is in bounds of b
	function collides(a, b) {
  	    return a.x < b.x + b.width &&
    	    a.x + a.width > b.x &&
            a.y < b.y + b.height &&
    	    a.y + a.height > b.y;
	}

	function getMousePos(evt) {
        var rect = canvas.getBoundingClientRect();

        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }

	canvas.addEventListener('mousemove', function(evt) {
        mousePos = getMousePos(evt);
    }, false);
});
