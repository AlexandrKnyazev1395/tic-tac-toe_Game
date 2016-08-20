//than win in default
var amountCellsToWin = 5;

$(document).ready(function($) {
	//settings
	amountCellsToWin = +$('#signsToWin').val();
	var sizeArea = +$('#sizeArea').val();

	createGame(sizeArea);
	changeSettings();
	
	
});

function changeSettings() {


	$('#settingsGame button').click(function(event) {
		var sizeArea = +$('#sizeArea').val();
		amountCellsToWin = +$('#signsToWin').val();

		if(sizeArea < amountCellsToWin){
			alert("amount signs to win must be no more than " + sizeArea + " cells");
			$('#signsToWin').val(sizeArea);
			amountCellsToWin = sizeArea;
		}
		if(amountCellsToWin < 3){
			alert("Setting 'sings to win' can't be lesser than 3");
			$('#signsToWin').val(3);
			amountCellsToWin = 3;
		}
		if(sizeArea < 3){
			alert("Setting 'size of area' can't be lesser than 3");
			$('#sizeArea').val(3);
		}
		createGame(sizeArea);
		$('#goodMessage').show('fast', function (argument) {
			setTimeout(function (argument) {
				$('#goodMessage').hide();
			}, 2000) 
		});

	});
}


function createGame (sizeArea) {

	class OneCell{
		
		constructor(id, status, coordinates){
			this.id = id; 				//number
			this.status = ''; 			//string ('crosses' or 'zeros')
			this.x = coordinates.x;		//number
			this.y = coordinates.y;     //number
			this.pixelCoordinates = {};	//object with properties minX, maxX, minY, maxY
		}
	}


	
	//this function create "OneCell" object for each cell
	var allCells = fillAreaGame(sizeArea, OneCell);

	//this function draw area for game and add to each "OneCell" object coordinates on area
	allCells = drawArea(sizeArea, allCells);


	toGame(allCells);
}

function fillAreaGame (size, OneCell) {
	var allCells = [];
	
	for (var i = 0; i < size; i++){
		allCells[i] = [];

		for (var j = 0; j < size; j++){
			var idCell = i*10+j;
			var coordinates = {
				x: i,
				y: j
			}
			allCells[i][j] = new OneCell(idCell, 0, coordinates);
		}

	}

	return allCells;
}

function drawArea (sizeArea, allCells){

	class SettingArea{

		constructor(areaElem, cellSize, sizeArea, backColor){
			this.cellSize = cellSize,
			this.width = this.height = cellSize * sizeArea,
			this.backColor = backColor,
			this.borderWidth = borderWidth;
			this.sizeArea = sizeArea;
		}

		applySettings(){
			areaElem.attr('width', this.width);
			areaElem.attr('height', this.height);
			areaElem.css('backgroundColor', this.backColor);
		}

		drawGrid(ctx){
			var x = this.cellSize;
			var y = this.cellSize;
			ctx.lineWidth = "1";
			ctx.strokeStyle = "black";

			for (var i = 1; i < 400 ; i ++) {
				ctx.beginPath();
				ctx.moveTo(x, 0);
				ctx.lineTo(x, this.height);
				ctx.stroke();
				
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(this.width, y);
				ctx.stroke();

				x += this.cellSize;
				y += this.cellSize;

			}

		}

		writeCoordinatesCells(allCells){
			class cellPixelCoordinates{
				constructor(minX, maxX, minY, maxY){
					this.minX = minX;
					this.maxX = maxX;
					this.minY = minY;
					this.maxY = maxY;
				}
			}
			for(var i = 0; i < allCells.length; i ++){

				for(var j = 0; j < allCells[i].length; j ++){

					var numX = allCells[i][j].x;
					var numY = allCells[i][j].y;

					var minX = this.cellSize * numX;
					var maxX = minX + this.cellSize;

					var minY = this.cellSize * numY;
					var maxY = minY + this.cellSize;

					allCells[i][j].pixelCoordinates = new cellPixelCoordinates(minX, maxX, minY, maxY);
				}
			}
			return allCells;
			
		}
	}

	//canvas block
	var areaElem = $('#areaGame');

	//settings of canvas block
	var cellPixelSize = 25;
	var backColor = 'yellow';
	var borderWidth = 1;

	var settingArea = new SettingArea(areaElem, cellPixelSize, sizeArea, backColor, borderWidth);
	settingArea.applySettings();
	var ctx = areaElem[0].getContext('2d');
	settingArea.drawGrid(ctx);
	//add in object allCells coordinates of cells in canvas
	return settingArea.writeCoordinatesCells(allCells);
	
}

function toGame(allCells, currentPlayer) {
	
	var firstPlayer = 'crosses';
	

	if(!currentPlayer){
		var currentPlayer = firstPlayer;
	}
	$('#currentPlayer').text( currentPlayer + ' go')
	$('body').on('click', '#areaGame', function(e) {

		$( 'body' ).off('click', '#areaGame');

		var xClick = e.pageX - $(this).offset().left;
    	var yClick = e.pageY - $(this).offset().top;
    	findClickedCell(xClick, yClick, currentPlayer);
	});


	
	

	function findClickedCell (xClick, yClick) {
		for(var i = 0; i < allCells.length; i ++){

			for(var j = 0; j < allCells[i].length; j ++){
				if (
						allCells[i][j].pixelCoordinates.minX < xClick && 
						allCells[i][j].pixelCoordinates.maxX > xClick &&
						allCells[i][j].pixelCoordinates.minY < yClick &&
						allCells[i][j].pixelCoordinates.maxY > yClick
					){
					if(allCells[i][j].status==''){
						//draw sign - X or 0
						allCells[i][j].status = currentPlayer;
						drawSign(allCells[i][j], currentPlayer);
						checkWin(allCells, allCells[i][j], currentPlayer);
					}
					else{
						toGame(allCells, currentPlayer);
					}
					return;
				}
				else{
					//if clicked cell wasn't finded
					if(i==allCells.length-1 && j == allCells[i].length-1){
						toGame(allCells, currentPlayer);
						return;
					}
				}
				

			}
		} 
	}

	function drawSign (cellObj, currentPlayer) {
		var areaElem = $('#areaGame');
		var ctx = areaElem[0].getContext('2d');
		//settings of signs
		var signLineWidth = "3";
		var signColor = "black";
		ctx.lineWidth = signLineWidth;
		ctx.strokeStyle = signColor;
		//draw "X"
		if(currentPlayer=='crosses'){	
			ctx.beginPath();
			ctx.moveTo(cellObj.pixelCoordinates.minX+5, cellObj.pixelCoordinates.minY+5);
			ctx.lineTo(cellObj.pixelCoordinates.maxX-5, cellObj.pixelCoordinates.maxY-5);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(cellObj.pixelCoordinates.maxX-5, cellObj.pixelCoordinates.minY+5);
			ctx.lineTo(cellObj.pixelCoordinates.minX+5, cellObj.pixelCoordinates.maxY-5);
			ctx.stroke();
		}
		//draw "0"
		if(currentPlayer=='zeros'){		
			ctx.beginPath(); 
			var radius = (cellObj.pixelCoordinates.maxX - cellObj.pixelCoordinates.minX)/2;
			var centerX = cellObj.pixelCoordinates.maxX -radius;
			var centerY = cellObj.pixelCoordinates.maxY -radius;
			ctx.arc(centerX, centerY, radius/1.4, 0, Math.PI*2, false);
			ctx.closePath();
			ctx.lineWidth = "3";
			ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
			ctx.stroke();
		}

		
	}


}

function checkWin (allCells, clickedCell, currentPlayer) {

	var nearSameSigns = checkRoute(clickedCell.x, clickedCell.y, clickedCell.status);

	function checkRoute (x,y, status) {
		var routesArray = [[1,0], [0,1], [1,1], [-1,0], [0,-1], [-1,-1], [1,-1], [-1,1]]

		for(var i = 0; i < 8; i++){
			var route = routesArray[i];
			if(allCells[x + route[0]]){
				if (allCells[x + route[0]][y + route[1]]){
					if(allCells[x + route[0]][y + route[1]].status == status){
						//we find equations of straight by two points
						var pointsOnStraight = findStraightEquation(x,y, allCells[x + route[0]][y + route[1]].x, 
																		allCells[x + route[0]][y + route[1]].y, allCells.length);
						var findSignsInStraight = checkSameSigns(pointsOnStraight, status);
						if (findSignsInStraight){
							drawWinLine(findSignsInStraight.winCells);
							alert(findSignsInStraight.status + ' win');
							return 1;
						}
					}
				}
			}
			
			

		}

		//next turn
		if(currentPlayer == "crosses"){
			toGame(allCells, "zeros");
			return;
		}
		else if(currentPlayer == "zeros"){
			toGame(allCells, "crosses");
		}
		
	}

	function findStraightEquation(x1, y1, x2, y2, areaLength) {
		 var pointsOnStraight = [];
		//(y-y1)/(y2 - y1) = (x-x1)/(x2-x1)
		//find x:
		// x = (x2 - x1) * (y - y1) / (y2-y1) + x1
		//find y:
		// y = (y2-y1) * (i - x1) / (x2 - x1) + y1
		for( var i = 0; i < (+areaLength); i ++){
			if (y2-y1 != 0){
				var x = (x2 - x1) * (i - y1) / (y2 - y1) + x1;
				var coordinate = [x, i];

			}
			else{
				var y = (y2-y1) * (i - x1) / (x2 - x1) + y1;
				var coordinate = [i, y];
			}
			var check = areaLength - 1;
			if(coordinate[0] < 0 ||  coordinate[1] < 0 || coordinate[0] > check || coordinate[1] > check){
				continue;
			}
			pointsOnStraight.push(coordinate);
			
		}
		return pointsOnStraight;
		 
	}

	function checkSameSigns(pointsOnStraight, status) {
		var counterSigns = 0;
		var winCells = [];
		for( var i = 0; i < pointsOnStraight.length; i ++){
			if(allCells[pointsOnStraight[i][0]][pointsOnStraight[i][1]].status == status){
				counterSigns++;
				winCells.push(allCells[pointsOnStraight[i][0]][pointsOnStraight[i][1]]);
			}
			else{
				counterSigns = 0;
				winCells = [];
			}
			if(counterSigns >=amountCellsToWin){
				return {
					status: status,
					winCells: winCells
				}
			}
		}
		return 0;
	}

	function drawWinLine (winCells) {
		var areaElem = $('#areaGame');
		var ctx = areaElem[0].getContext('2d');
		ctx.strokeStyle = "red";
		console.log(winCells);
		console.log(Object.keys(winCells).length);
		var middleX1 = winCells[0].pixelCoordinates.maxX - ((winCells[0].pixelCoordinates.maxX - winCells[0].pixelCoordinates.minX)/2);
		var middleY1 = winCells[0].pixelCoordinates.maxY - ((winCells[0].pixelCoordinates.maxY - winCells[0].pixelCoordinates.minY)/2);
		var middleX2 = winCells[Object.keys(winCells).length-1].pixelCoordinates.maxX -	((winCells[Object.keys(winCells).length-1].pixelCoordinates.maxX - winCells[Object.keys(winCells).length-1].pixelCoordinates.minX)/2);
        var middleY2 = winCells[Object.keys(winCells).length-1].pixelCoordinates.maxY -	((winCells[Object.keys(winCells).length-1].pixelCoordinates.maxY - winCells[Object.keys(winCells).length-1].pixelCoordinates.minY)/2);
		ctx.beginPath();
		ctx.moveTo(middleX1, middleY1);
		ctx.lineTo(middleX2, middleY2);
		ctx.stroke();
	}
}

