
var currShape = [];
var currMatrix = $M([[1, 0, 0],[0, 1, 0],[0, 0, 1]]);
var board;

var originalItems = { lines: [], points: [] };
var originalMatrix = null;
var cloneItems = { lines: [], points: [] };

var cursorPoint;
var originalPolygon;
var closestOriginalPoint;
var connectedClonePoint;
var connectLine;

$(window).load(function() {
  board = JXG.JSXGraph.initBoard('graphWindow', {boundingbox: [-10, 10, 10, -10], axis:true, keepaspectratio: true, showCopyright: false});
  board.resizeContainer(window.innerWidth-20, window.innerHeight-70);
  for (var i = 0; i < 3; i++) {
    board.clickLeftArrow();
  }
  cursorPoint = board.create('point', [0,0], { size: 1, name:""});
  cursorPoint.showInfobox = false;
  cursorPoint.isDraggable = false;
  cursorPoint.visible(false);
  closestOriginalPoint = board.create('point', [0,0], { size: 2, color: '#ff55ff', name:""});
  closestOriginalPoint.isDraggable = false;
  connectedClonePoint = board.create('point', [0,0], {size: 2, color: '#aa33bb', name:""})
  connectedClonePoint.isDraggable = false;
  connectLine = board.create('line', [closestOriginalPoint, connectedClonePoint], { color: '#aaaaaa', straightLast: false, straightFirst: false});
  board.on('mousemove', function(e) {
    if (!originalItems.points[0]) return;
    var mouseCoords = getMouseCoords(e, e[JXG.touchProperty] ? 1 : undefined);
    var mouseX = mouseCoords.usrCoords[1];
    var mouseY = mouseCoords.usrCoords[2];
    var realMouseX = mouseCoords.scrCoords[1];
    var realMouseY = mouseCoords.scrCoords[2];
    cursorPoint.setPosition(JXG.COORDS_BY_USER, [mouseX, mouseY]);

    var dist = function(point, real) {
      var deltaX = point[1] - (!real ? mouseX : realMouseX);
      var deltaY = point[2] - (!real ? mouseY : realMouseY);
      return Math.sqrt(deltaX*deltaX + deltaY*deltaY);
    }

    var past = function(point1, point2, points) {
      var x = points[1];
      var y = points[2];
      var minX = Math.min(point1[1], point2[1]);
      var maxX = Math.max(point1[1], point2[1]);
      var minY = Math.min(point1[2], point2[2]);
      var maxY = Math.max(point1[2], point2[2]);
      return (x < minX || x > maxX || minX == maxX) && (y <= minY || y >= maxY || minY == maxY);
    }

    var closest = null;
    var closestDist = 1000000;

    for (var i = 0; i < originalItems.points.length; i++) {
      var coord1 = originalItems.points[i].coords.usrCoords;
      var coord2 = originalItems.points[(i+1)%originalItems.points.length].coords.usrCoords;
      var coords = JXG.Math.Geometry.projectCoordsToSegment([1, mouseX, mouseY], coord1, coord2)[0];

      var vertexD = dist(originalItems.points[i].coords.usrCoords);
      if (vertexD < closestDist) {
        closest = originalItems.points[i].coords.usrCoords;
        closestDist = vertexD;
      }
      if (dist(originalItems.points[i].coords.scrCoords, true) < 200) {
        originalItems.points[i].setAttribute({size: 3});
      } else {
        originalItems.points[i].setAttribute({size:1});
      }

      var d = dist(coords);
      if (past(coord1, coord2, coords)) continue;
      if (d < closestDist) {
        closest = coords;
        closestDist = d;
      }
    }

    if (closest) {
      closestOriginalPoint.setPosition(JXG.COORDS_BY_USER, [closest[1], closest[2]]);
      var updatedMatrix = currMatrix.multiply($M([[closest[1]], [closest[2]], [1]]));
      if (updatedMatrix) {
        connectedClonePoint.setPosition(JXG.COORDS_BY_USER, updatedMatrix.col(1).elements.slice(0, 2));
      }
    }
  });
  setShape([[0,0], [0, 2], [2, 2], [2, 0]]);
});

function setShape(shape) {
  if (shape) currShape = shape;
  else {
    currShape = originalMatrix.transpose().elements.map(function(i) { return i.slice(0, 2); });
  }
  loadShape(currShape);
  loadShape(currMatrix.multiply(originalMatrix).transpose().elements.map(function(i) { return i.slice(0, 2); }), true);
}

$(window).resize(function() {
  board.resizeContainer(window.innerWidth-20, window.innerHeight-70, false, true);
  board.setBoundingBox(board.getBoundingBox(), true);
});

function loadShape(points, clone) {
  var arr = !clone ? originalItems : cloneItems;
  if (!clone) originalMatrix = $M(points.map(function(i) { return [i[0], i[1], 1]; })).transpose();
  for (var i = 0; i < arr.points.length; i++) {
    board.removeObject(arr.points[i]);
    board.removeObject(arr.lines[i]);
  }
  arr.lines = [];
  arr.points = [];
  points.forEach(function(point, index) {
    var color = !clone ? '#ff0000' : '#777777';
    var size = !clone ? 1 : 1;
    var p = board.create('point',point, {size:size, name:"", color:color});
    arr.points.push(p);
    if (!clone) setPointEvents(p, index);
    else p.isDraggable = false;
  });
  arr.points.forEach(function(point, index) {
    var color = !clone ? '#00ff00' : '#0000ff';
    var opt = {
      straightFirst: false,
      straightLast: false,
      strokeWidth: 2,
      highlightStrokeColorOpacity: 1.0,
      color: color,
      highlightStrokeColor: color,
      strokeWidth: 3
    }
    var point2Index = (index+1)%arr.points.length;
    var point2 = arr.points[point2Index];
    var line = board.create('line', [point, point2], opt);
    if (!clone) setLineEvents(line, point, index, point2, point2Index);
    else line.isDraggable = false;
    arr.lines.push(line);
  });
  if (!clone) {
    originalPolygon = board.create('polygon', arr.points);
  }
}

function setPointEvents(point, index) {
  point.on('drag', function() {
    updatePoint(point, index);
  });
}

function setLineEvents(line, point1, index1, point2, index2) {
  line.on('drag', function() {
    updatePoint(point1, index1);
    updatePoint(point2, index2);
  })
}

function updatePoint(point, index) {
  if (!cloneItems.points[index] || !originalMatrix) return;
    var newOriginalMatrix = originalMatrix.transpose();
    newOriginalMatrix.elements[index][0] = point.X();
    newOriginalMatrix.elements[index][1] = point.Y();
    originalMatrix = newOriginalMatrix.transpose();
    var updatedMatrix = currMatrix.multiply(originalMatrix);
    cloneItems.points[index].setPosition(JXG.COORDS_BY_USER, updatedMatrix.col(index+1).elements.slice(0, 2));
}

function updateAllPoints() {
  originalItems.points.forEach(function(point, index) {
    updatePoint(point, index);
  });
}

function getMouseCoords(e, i) {
  var cPos = board.getCoordsTopLeftCorner(e, i),
      absPos = JXG.getPosition(e, i),
      dx = absPos[0]-cPos[0],
      dy = absPos[1]-cPos[1];

  return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
}