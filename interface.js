
function help() {
  var str = 'This is a Matrix Transformation visualizer! ';
  str += 'Every coordinate point of a shape is put into a matrix. We can then multiply it by another matrix ';
  str += 'to achieve transformations such as dialations, shears, flips, rotations, and even shifts!<br><br>';
  str += 'You can click "New Shape" to get a list of pre-made shapes. Once you\'ve selected one, you can also ';
  str += 'drag points or lines to your hearts desire. You\'ll notice that as you move your mouse around the original shape, ';
  str += 'there is a dot to show the connection between the original shape and the transformed shape.<br><br>';
  str += 'The "Matrix Transformer" will allow you to input your own matrix to test what transformations different ';
  str += 'types of matricies will give you. You can reset this to the intentity by clicking "Reset". ';
  str += 'You can even use advanced functions or variables such as cos(), sin(), sqrt(), pi, and more.<br><br>';
  str += 'The "Transformations" panel will allow you to select transformations without having to figure them out ';
  str += 'for yourself. This makes it extremely easy to trasform in any way you\'d like!<br><br>Enjoy!';
  BootstrapDialog.show({
    type: BootstrapDialog.TYPE_PRIMARY,
    title: 'What\'s going on?',
    message: str,
    buttons: [{
      label: 'Sweet',
      action: function(dialog) {
        dialog.close();
      }
    }]
  });
}

function developers() {
  var str = 'Hey there! I wrote this program on 2/24/16 after spending most of the afternoon at Starbucks and working most of the evening. ';
  str += 'The code is completely open source, so you can check out everything at the GitHub link below!';
  BootstrapDialog.show({
    //size: BootstrapDialog.SIZE_WIDE,
    type: BootstrapDialog.TYPE_PRIMARY,
    title: 'Developers <3',
    message: str,
    buttons: [{
      label: 'Github',
      cssClass: 'btn-primary',
      action: function(dialog) {
        var win = window.open('https://github.com/demipixel/matrix-transformations', '_blank');
        win.focus();
      }
    }, {
      label: 'Sounds Good',
      action: function(dialog) {
        dialog.close()
      }
    }],
    onshown: function(dialog) {
      var input = dialog.getModalBody().find('#jsoninput');
      input.select();
    }
  });
}

function newShape() {
  var shapes = ['Square', 'Circle', 'Star', 'Custom'];
  var str = '';
  shapes.forEach(function(shape, index) {
    str += '<button class="btn btn-primary newshape" data-id="'+index+'">'+shape+'</button><br>';
  });
  BootstrapDialog.show({
    size: BootstrapDialog.SIZE_SMALL,
    type: BootstrapDialog.TYPE_SUCCESS,
    title: 'New Shape',
    message: str,
    buttons: [{
      label: 'Cancel',
      action: function(dialog) {
        dialog.close();
      }
    }, {
      label: 'Sounds Good',
      cssClass: 'btn-success',
      action: function(dialog) {
        var $selected = $('.newshape.btn-warning');
        if ($selected.get(0)) {
          generateNewShape($selected.data('id'));
        }
        dialog.close()
      }
    }],
    onshow: function(dialog) {
      $(dialog.getModalBody()).css('text-align', 'center');
      $(dialog.getModalBody().find('.newshape')).click(function() {
        $(dialog.getModalBody().find('.btn-warning')).removeClass('btn-warning').addClass('btn-primary');
        $(this).removeClass('btn-primary').addClass('btn-warning');
        if ($(this).text() == 'Custom') {
          dialog.close();
          customShape();
        }
      });
    }
  });
}

var EMPTY_NEW_CUSTOM_POINT = '<div class="custom-point col-md-12" style="margin-bottom: 5px">';
EMPTY_NEW_CUSTOM_POINT += '<div class="col-md-4"><input class="form-control point-1"></div>';
EMPTY_NEW_CUSTOM_POINT += '<div class="col-md-4"><input class="form-control point-2"></div>';
EMPTY_NEW_CUSTOM_POINT += '<div class="col-md-4"><button class="btn btn-danger" onClick=$(this).parent().parent().remove()>Remove</div>';
EMPTY_NEW_CUSTOM_POINT += '</div>';
function customShape() {
  var str = '';
  str += '<div class="error-panel alert alert-danger" style="display: none"></div>';
  str += '<button class="btn btn-danger clear-custom-shape" style="width: 100%">Clear</button><br><br>';
  str += '<div class="custom-points">';
  str += EMPTY_NEW_CUSTOM_POINT;
  str += '</div>';
  str += '<button class="btn btn-success new-custom-point" style="width: 100%; margin-top: 10px">New Point</button>';
  BootstrapDialog.show({
    size: BootstrapDialog.SIZE_NORMAL,
    type: BootstrapDialog.TYPE_SUCCESS,
    title: 'New Custom Shape',
    message: str,
    buttons: [{
      label: 'Cancel',
      action: function(dialog) {
        dialog.close();
      }
    }, {
      label: 'Back',
      cssClass: 'btn-warning',
      action: function(dialog) {
        dialog.close();
        newShape();
      }
    }, {
      label: 'Submit',
      cssClass: 'btn-success',
      action: function(dialog) {
        var points = [];
        var close = true;
        dialog.getModalBody().find('.custom-point').each(function(index, element) {
          $e = $(element);
          var xVal = $e.find('.point-1').val();
          var yVal = $e.find('.point-2').val()
          var x;
          var y;
          try {
            x = math.eval(xVal);
            y = math.eval(yVal);
          } catch(err) {
            dialog.getModalBody().find('.error-panel').text(err).show();
            close = false;
            return;
          }

          if (x !== undefined && y !== undefined) points.push([typeof x == 'object' ? x.value : x, typeof y == 'object' ? y.value : y]);
        });
        if (close) {
          if (points.length) setShape(points);
          dialog.close();
        }
      }
    }],
    onshow: function(dialog) {
      var modalBody = dialog.getModalBody();
      var $customPoints = modalBody.find('.custom-points');
      modalBody.find('.custom-point .col-md-4 .btn-danger').remove();
      modalBody.find('.clear-custom-shape').click(function() {
        $customPoints.empty().append(EMPTY_NEW_CUSTOM_POINT);
        modalBody.find('.custom-point .col-md-4 .btn-danger').remove();
      });
      modalBody.find('.new-custom-point').click(function() {
        $customPoints.append(EMPTY_NEW_CUSTOM_POINT);
      });
      if (originalItems.points.length) {
        $customPoints.empty();
        originalItems.points.forEach(function(point, i) {
          $point = $(EMPTY_NEW_CUSTOM_POINT);
          $point.find('.point-1').val(Math.round(point.X()*1000)/1000);
          $point.find('.point-2').val(Math.round(point.Y()*1000/1000));
          $customPoints.append($point);
          if (i == 0) {
            modalBody.find('.custom-point .col-md-4 .btn-danger').remove();
          }
        });
      }
    }
  });
}

var matrixInput = [[1, 0, 0], [0, 1, 0]];
var threeSizeMatrix = false;
function editMatrix(err, attempt, errIndex) {
  var str = '';
  for (var i = 0; i < (threeSizeMatrix?3:2); i++) {
    str += '<div>';
    for (var j = 0; j < (threeSizeMatrix ? 3 : 2); j++) {
      var input;
      var style = i == 2 ? ' style="padding-left:25px"' : '';
      if (i < 2) input = '<input class="form-control" value="'+(attempt?attempt[i][j]:matrixInput[i][j])+'">';
      else input = (j < 2 ? 0 : 1);
      str += '<div data-row='+i+' data-col='+j+' class="matrix-'+i+'-'+j+' editmatrix col-md-'+(threeSizeMatrix?4:6)+'"'+style+'>'+input+'</div>';
    }
    str += '</div><br><br>';
  }
  BootstrapDialog.show({
    size: threeSizeMatrix ? BootstrapDialog.SIZE_WIDE : BootstrapDialog.SIZE_NORMAL,
    type: !err ? BootstrapDialog.TYPE_INFO : BootstrapDialog.TYPE_DANGER,
    title: 'Edit Matrix'+(err?' ('+err+')':''),
    message: str,
    buttons: [{
      label: 'Cancel',
      action: function(dialog) {
        dialog.close();
      }
    }, {
      label: !threeSizeMatrix ? 'Extended' : 'Compact',
      cssClass: 'btn-warning',
      action: function(dialog) {
        dialog.close();
        threeSizeMatrix = !threeSizeMatrix;
        editMatrix();
      }
    }, {
      label: 'Reset',
      cssClass: 'btn-danger',
      action: function(dialog) {
        dialog.close();
        editMatrix(null, [[1, 0, 0], [0, 1, 0]]);
      }
    }, {
      label: 'Apply',
      cssClass: 'btn-success',
      action: function(dialog) {
        var matrix = [[1, 0, 0], [0, 1, 0]];
        var error = null;
        var errorI = -1;
        $('.editmatrix input').each(function(index, element) {
          $e = $(element);
          var row = $e.parent().data('row');
          var col = $e.parent().data('col');
          matrix[row][col] = $e.val();
          if (error) return;
          try {
            math.eval($e.val());
          } catch(err) {
            errorI = [row, col];
            error = err;
          }
        });
        if (error) {
          dialog.close();
          return editMatrix(error, matrix, errorI);
        } else {
          matrixInput = matrix;
          processMatrix();
        }
        dialog.close();
      }
    }],
    onshown: function(dialog) {
      if (errIndex) $(dialog.getModalBody().find('.matrix-'+errIndex[0]+'-'+errIndex[1])).find('input').select();
    }
  });
}

function transformations(err, def, errIndex) {
  var transform = ['Flip X Axis', 'Flip Y Axis', 'Flip over X=Y', 'Scale X', 'Scale Y', 'Shear X', 'Shear Y', 'Rotate'];
  var normalDefaults = [false, false, false, '1', '1', '0', '0', '0 deg', '0', '0'];
  var defaults = def || normalDefaults;
  if (threeSizeMatrix) { transform.push('Shift X'); transform.push('Shift Y'); }
  var str = '';
  for (var i = 0; i < transform.length; i++) {
    var inputType = i <= 2 ? 'checkbox' : 'text';
    var transDefault = i <= 2 ? (defaults[i] ? 'checked' : '') : 'value="'+defaults[i]+'"';
    str += '<div><div class="col-md-4"><h5>'+transform[i]+'</h5></div><div class="col-md-8"><input data-id='+i+' class="id-'+i+' transform form-control" type="'+inputType+'" '+transDefault+'></div></div><br><br>';
  }
  BootstrapDialog.show({
    type: !err ? BootstrapDialog.TYPE_WARNING : BootstrapDialog.TYPE_DANGER,
    title: 'Matrix Transformations'+(err?' ('+err+')':''),
    message: str,
    buttons: [{
      label: 'Cancel',
      action: function(dialog) {
        dialog.close();
      }
    }, {
      label: !threeSizeMatrix ? 'Extended' : 'Compact',
      cssClass: 'btn-warning',
      action: function(dialog) {
        dialog.close();
        threeSizeMatrix = !threeSizeMatrix;
        transformations();
      }
    }, {
      label: 'Apply and Show',
      cssClass: 'btn-success',
      action: function(dialog) {
        applyTransformation(dialog, normalDefaults, true);
      }
    }, {
      label: 'Apply',
      cssClass: 'btn-success',
      action: function(dialog) {
        applyTransformation(dialog, normalDefaults, false);
      }
    }],
    onshown: function(dialog) {
      $(dialog.getModalBody().find('.id-'+errIndex)).select();
    }
  });
}

function applyTransformation(dialog, normalDefaults, animation) {
  var textAnswers = []
  var answers = [];
  var error = null;
  var errorAt = null;
  $('.transform').each(function(index, element) {
    $e = $(element);
    var id = $e.data('id');
    textAnswers[id] = id <= 2 ? $e.is(':checked') : $e.val();
    if (error) return;
    try {
      if (id <= 2) answers[id] = $e.is(':checked');
      else {
        answers[id] = math.eval($e.val()) || normalDefaults[id];
        if (typeof answers[id] == 'object') answers[id] = answers[id].value;
      }
    } catch(err) {
      error = err;
      errorAt = index;
    }
  });
  if (error) {
    dialog.close();
    return transformations(error, textAnswers, errorAt);
  } else {
    answers.forEach(function(answer, index) {
      if (answer != normalDefaults[index] && answer+' deg' != normalDefaults[index]) generateTransformation(index, answer);
    });
    if (animation) displayTransformation();
    else quickTransformation();
  }
  dialog.close();
}

function generateNewShape(id) {
  var shape = []
  if (id == 0) {
    shape = [[0,0], [0,2], [2,2], [2,0]];
  } else if (id == 1) {
    var size = 20;
    for (var i = 0; i < size; i++) {
      shape.push([Math.cos(Math.PI*2/size*i)*2, Math.sin(Math.PI*2/size*i)*2])
    }
    setShape(shape);
  } else if (id == 2) {
    var points = 5;
    var RADIUS = 2
    for (var i = 0; i < points*2; i++) {
      var radius = i % 2 == 0 ? 0.5 : 1;
      radius *= RADIUS;
      shape.push([Math.cos(Math.PI*2/(points*2)*i-Math.PI/2)*radius, Math.sin(Math.PI*2/(points*2)*i-Math.PI/2)*radius])
    }
  }
  setShape(shape);
}

function generateTransformation(id, data) {
  var matrix;
  if (id == 0) matrix = [[1, 0, 0], [0, -1, 0]];
  else if (id == 1) matrix = [[-1, 0, 0], [0, 1, 0]];
  else if (id == 2) matrix = [[0, 1, 0], [1, 0, 0]];
  else if (id == 3) matrix = [[data, 0, 0], [0, 1, 0]];
  else if (id == 4) matrix = [[1, 0, 0], [0, data, 0]];
  else if (id == 5) matrix = [[1, data, 0], [0, 1, 0]];
  else if (id == 6) matrix = [[1, 0, 0], [data, 1, 0]];
  else if (id == 7) matrix = [[Math.cos(data), -Math.sin(data), 0], [Math.sin(data), Math.cos(data), 0]];
  else if (id == 8) matrix = [[1, 0, data], [0, 1, 0]];
  else if (id == 9) matrix = [[1, 0, 0], [0, 1, data]];

  matrix.push([0, 0, 1]);
  displayStack.push({ id: id, matrix: $M(matrix) });
}

var displayStack = [];
function displayTransformation() {
  if (displayStack.length == 0) {
    processMatrix();
    return;
  }
  var genTable = function(matrix, threeSize, align) {
    var ele = matrix.elements;
    var str = '<table style="font-size:20"'+(align?' align="'+align+'"':'')+'>';
    for (var i = 0; i < 2; i++) {
      str += '<tr>';
      for (var j = 0; j < (threeSize?3:2); j++) {
        str += '<td>'+Math.round(ele[i][j]*100)/100+'</td>';
      }
      str += '</tr>';
    }
    str += '</table>';
    return str;
  }
  var names = ['Flip X Axis', 'Flip Y Axis', 'Flip over X=Y', 'Scale X', 'Scale Y', 'Shear X', 'Shear Y', 'Rotate', 'Shift X', 'Shift Y'];
  var trans = displayStack.pop(0);
  var str = '<div>';
  for (var i = 0; i < 3; i++) {
    if (i == 1) str += '<span class="col-md-2 glyphicon glyphicon-remove" style="font-size:60;padding-top:30px;text-align:center"></span>'
    else str += '<div class="tableDisplay '+(i==0?'left':'right')+' col-md-5">'+(i==0?genTable(trans.matrix, threeSizeMatrix, 'right'):genTable(getEvalMatrix(), threeSizeMatrix))+'</div>';
  }
  str += '</div><br><br><br><br><br><br><br><br>';
  var out = trans.matrix.multiply(getEvalMatrix());
  out = out.map(function(item) { return Math.round(item*1000)/1000; });
  matrixInput = out.elements.slice(0, 2);
  var BEFORE_TIME = 3000;
  var ANIMATION_TIME = 500;
  var AFTER_TIME = 3000;
  BootstrapDialog.show({
    size: BootstrapDialog.SIZE_WIDE,
    type: BootstrapDialog.TYPE_Primary,
    title: 'Matrix Transformations: '+names[trans.id],
    message: str,
    buttons: [],
    onshown: function(dialog) {
      setTimeout(function() {
        for (var i = 0; i < 2; i++) {
          $('.tableDisplay.'+(i==0?'left':'right')).animate({
            left: (i==0?'+':'-') + '=160'
          }, ANIMATION_TIME, 'easeInQuad', function() {
            if ($(this).hasClass('right')) {
              $(this).html(genTable(out, threeSizeMatrix));
            } else $(this).html('');
            $('.glyphicon-remove').removeClass('glyphicon-remove glyphicon');
          });
        }
      }, BEFORE_TIME);
      setTimeout(function() {
        dialog.close();
        displayTransformation();
      }, BEFORE_TIME+ANIMATION_TIME+AFTER_TIME);
    }
  });
}

function quickTransformation() {
  while (displayStack.length) {
    var trans = displayStack.pop(0);
    var out = trans.matrix.multiply(getEvalMatrix());
    out = out.map(function(item) { return Math.round(item*1000)/1000; });
    matrixInput = out.elements.slice(0, 2);
  }
  processMatrix();
}

function getEvalMatrix() {
  var matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 3; j++) {
      matrix[i][j] = math.eval(matrixInput[i][j]);
    }
  }
  return $M(matrix);
}

function processMatrix() {
  currMatrix = getEvalMatrix();
  setShape();
}