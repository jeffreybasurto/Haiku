var grid_width = 0;
var grid_height = 0;

function init_sprites() {
  // Build the structure for the entire screen.
  var sprites_area = $("#sprite-area");
  var y_total = 0,
      x_total = 0,
      y_reduced = false,
      x_reduced = false;
  var y_to = Math.floor((sprites_area.height()) / 62);
  var x_to = Math.floor((sprites_area.width()) / 62);
  if ((y_to) % 2 == 0) {
    y_to = y_to - 1;
    y_reduced = true;
  }
  if ((x_to) % 2 == 0) {
    x_to = x_to - 1;
    x_reduced = true;
  }
  
  grid_width = x_to;
  grid_height = y_to;
  
  sprites_area.css('margin-left', (x_reduced ? 31 : 0) + (sprites_area.width() % 62 / 2));
//  sprites_area.css('margin-right',(x_reduced ? 31 : 0) + (sprites_area.width() % 62 / 2));
  sprites_area.css('margin-top', (y_reduced ? 31 : 0) + (sprites_area.height() % 62 / 2));
//  sprites_area.css('margin-bottom', (y_reduced ? 31 : 0) + (sprites_area.height() % 62 / 2));

  sprites_area.empty();

  while (y_total < y_to) {
    var ydiv = $("<div class='y-div'></div>")
    sprites_area.append(ydiv);
    
    while(x_total < x_to) {
      ydiv.append("<div class='tile'></div>");
      x_total = x_total + 1;
    }
    y_total = y_total + 1;
    x_total = 0;
  }
}

function shift_grid_north() {  
  var sprite_area = $("#sprite-area");

  $(".y-div", sprite_area).filter(":visible").first().hide();
  
  var found = $(".y-div", sprite_area).filter(":visible").last().next(".y-div");
  found.show();
  if (found.length == 0) {  
    var ydiv = $("<div class='y-div'></div>");
    for(var x_total = 0;x_total < grid_width;x_total += 1) 
      ydiv.append("<div class='tile'></div>");
    sprite_area.append(ydiv);
  }
}

function shift_grid_south() {  
  var sprite_area = $("#sprite-area");

  $(".y-div", sprite_area).filter(":visible").last().hide();
  
  var found = $(".y-div", sprite_area).filter(":visible").first().prev(".y-div");
  found.show();
  if (found.length == 0) {  
    var ydiv = $("<div class='y-div'></div>");
    for(var x_total = 0;x_total < grid_width;x_total += 1) 
      ydiv.append("<div class='tile'></div>");
    sprite_area.prepend(ydiv);
  }
}

function shift_grid_east() {  
  var sprite_area = $("#sprite-area");
  $(".y-div", sprite_area).each(function() { 
    $(".tile", $(this)).filter( function(){
      return ($(this).css('display') != 'none');
    }).last().hide(); 
  });

  var found = $(".y-div", sprite_area);
  found.each(function() {
    var found2 = $(this).children(".tile").filter(function(){
      return ($(this).css('display') != 'none');
    }).first().prev(".tile");
    found2.show();
    if (found2.length == 0) {
      $(this).prepend("<div class='tile'></div>");
    }
  });
}

function shift_grid_west() {  
  var sprite_area = $("#sprite-area");
  $(".y-div", sprite_area).each(function() { 
    $(".tile", $(this)).filter( function(){
      return ($(this).css('display') != 'none');
    }).first().hide();
  });
  
  var found = $(".y-div", sprite_area);
  found.each(function() {
    var found2 = $(this).children(".tile").filter(function(){
      return ($(this).css('display') != 'none');
    }).last().next(".tile");
    found2.show();
    if (found2.length == 0) {
      $(this).append("<div class='tile'></div>");
    }
  });
}


function grid(x, y) {
  return $($("#sprite-area .tile")[y * grid_width + x]);
}

function grid_center() {
  var x = Math.floor(grid_width/2);
  var y = Math.floor(grid_height/2);
  return grid(x, y);
}

$(window).resize(_.debounce(init_sprites, 300));

(function($) {
  
  function sprite_animate(node, speed) {
    setTimeout(function() {
      var state = node.attr('data-animation-state');
      var found = $("img", node);

      state = state % found.length + 1;
      node.attr('data-animation-state', state);
        
      found.hide();
      $("img:eq(" + (state-1) + ")", node).show();

      sprite_animate(node, speed);
    }, speed);
  }
  
  $.fn.sprite = function(state) {
    this.each(function() {
      var $this = $(this);      
      $("img", $this).hide();
      var found = $('.frames[data-state="' + state + '"]',$this);
      found.attr('data-animation-state', 0);
      sprite_animate(found, 750);
    });
    return this;
  };
})(jQuery);

$(function() {
  init_sprites();
  grid_center().append(
  "<div id='game_element_232'>" +
    "<div class='sprite'>" +
      "<div class='frames' data-state='walking'>" +
        "<img src='/sprites/esper_s_w0.png'> " +
        "<img src='/sprites/esper_s_w1.png'> " +
        "<img src='/sprites/esper_s_w2.png'> " +
        "<img src='/sprites/esper_s_w1.png'> " +
      "</div> " +
    "</div>" +
  "</div> ");
  

  $("#game_element_232 .sprite").sprite('walking');
  
})





