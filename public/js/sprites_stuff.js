var grid_width = 0;
var grid_height = 0;
var rng_y = [0,0];
var rng_x = [0,0];
var $sprite_area;

var refresh_selections = _.debounce(function() {
  $sprite_area.selectable("refresh");
}, 15);  

$(function() {
  $sprite_area = $("#sprite-area");
});

function init_sprites() {
  // Build the structure for the entire screen.
  var y_total = 0,
      x_total = 0,
      y_reduced = false,
      x_reduced = false;
  var y_to = Math.floor(($(window).height()) / 62);
  var x_to = Math.floor(($(window).width()) / 62);
  if ((y_to) % 2 == 0) {
    y_to = y_to - 1;
    y_reduced = true;
  }
  if ((x_to) % 2 == 0) {
    x_to = x_to - 1;
    x_reduced = true;
  }
  
  rng_y[0] = 0;
  rng_x[0] = 0;
  rng_y[1] = y_to;
  rng_x[1] = x_to;
  grid_width = x_to;
  grid_height = y_to;
  
  $sprite_area.css('margin-left', (x_reduced ? 31 : 0) + ($(window).width() % 62 / 2));
  $sprite_area.css('margin-top', (y_reduced ? 31 : 0) +($(window).height() % 62 / 2));

  $sprite_area.empty();

  while (y_total < y_to) {
    var ydiv = $("<div id='y-" + y_total + "' class='y-div'></div>")
    $sprite_area.append(ydiv);
    
    while(x_total < x_to) {
      ydiv.append("<div id='x-" + x_total + "' class='tile'></div>");
      x_total = x_total + 1;
    }
    y_total = y_total + 1;
    x_total = 0;
  }
  refresh_selections();  
}

function shift_grid_north() {  
  $(".y-div", $sprite_area).filter(":visible").first().hide();
  
  if ($(".y-div", $sprite_area).filter(":visible").last().next(".y-div").show().length == 0) {
    var ydiv = "<div class='y-div'>";    
    for(var x_total = 0;x_total < grid_width;x_total += 1) 
      ydiv += "<div class='tile'></div>";
    ydiv += "</div>";
    $sprite_area.append(ydiv);
  }}

function shift_grid_south() {  
  $(".y-div", $sprite_area).filter(":visible").last().hide();
  
  if ($(".y-div", $sprite_area).filter(":visible").first().prev(".y-div").show().length == 0) {
    var ydiv = "<div class='y-div'>";
    for(var x_total = 0;x_total < grid_width;x_total += 1) 
      ydiv += "<div class='tile'></div>";
    ydiv += "</div>";
    $sprite_area.prepend(ydiv);
  }  
}

function shift_grid_east() {  
  $(".y-div", $sprite_area).each(function() {
    var cache = $(this).children(".tile").filter(function() {
      return ($(this).css('display') != 'none');
    });
    cache.last().hide();
    if (cache.first().prev(".tile").show().length == 0)
      $(this).prepend("<div class='tile'></div>");
  });
}

function shift_grid_west() {  
  $(".y-div", $sprite_area).each(function() { 
    var cache = $(this).children(".tile").filter( function(){
      return ($(this).css('display') != 'none');
    });
    cache.first().hide();
    if (cache.last().next(".tile").show().length == 0)
      $(this).append("<div class='tile'></div>");
  });
}

function pan_grid_to(x, y) {
  x = x - Math.floor(grid_width/2) + Math.floor(grid_width/2);
  y = Math.floor(grid_height/2) - y - Math.floor(grid_height/2);
  
  if (x > 0)
    pan_grid("east", x);
  else if (x < 0)
    pan_grid("west", -x);

  if (y > 0)
    pan_grid("south", y);
  else if (y < 0)
    pan_grid("north", -y);

}



function pan_grid(dir, times) {
  if (dir == "north") 
    shift_grid_south();
  else if (dir == "east") 
    shift_grid_west();
  else if (dir == "south")
    shift_grid_north();
  else if (dir == "west") 
    shift_grid_east();
  if(times > 1)
    pan_grid(dir, times-1);
  else
    refresh_selections();
}

function grid(x, y) {
  while(x >= rng_x[1] || x <= rng_x[0] || y >= rng_y[1] || y <= rng_y[0] ) {
    while(x >= rng_x[1]) {
      rng_x[1] += 1;  
      
      var ydiv = $("#sprite-area .y-div");
  
      ydiv.each(function() {
        $(this).append("<div id='x-" + rng_x[1] + "' class='tile'></div>");
      });
      var sprite_area = $("#sprite-area");
      $(".y-div", sprite_area).each(function() { 
        $(".tile", $(this)).filter( function(){
          return ($(this).css('display') != 'none');
        }).last().hide(); 
      });
    }

    while(rng_x[0] >= x) {
      rng_x[0] -= 1;
      var ydiv = $("#sprite-area .y-div");
    
      ydiv.each(function() {
        $(this).prepend("<div id='x-"+ rng_x[0] +  "' class='tile'></div>");
      });
      var sprite_area = $("#sprite-area");
      $(".y-div", sprite_area).each(function() { 
        $(".tile", $(this)).filter( function(){
          return ($(this).css('display') != 'none');
        }).first().hide();
      });
    }
      
    while(y >= rng_y[1]) {
      rng_y[1] += 1;
      
      var ydiv = $("<div id='y-"+ rng_y[1]+"' class='y-div'></div>");
      for(var x_total = rng_x[0];x_total < rng_x[1];x_total += 1) 
        ydiv.append("<div id='x-" + x_total + "' class='tile'></div>");
      
          
      $("#sprite-area").append(ydiv);
      $("#sprite-area .y-div").filter(":visible").last().hide();
    }

    while(y <= rng_y[0]) {
      rng_y[0] -= 1
      
      var ydiv = $("<div id='y-"+ rng_y[0]+"' class='y-div'></div>");
      
      for(var x_total = rng_x[0];x_total < rng_x[1];x_total += 1) 
        ydiv.append("<div id='x-" + x_total + "' class='tile'></div>");
      $("#sprite-area").prepend(ydiv);
      $("#sprite-area .y-div").filter(":visible").first().hide();
    }
  }
  return $("#y-" + y + " #x-" + x);
  //return $($("#sprite-area .tile")[y * grid_width + x]);
}

function grid_center(addx, addy) {
  var x = Math.floor(grid_width/2);
  var y = Math.floor(grid_height/2);
  return grid(x+addx, y-addy);
}

$(window).resize(_.debounce(function() {
  init_sprites(); 
  if (state == "playing") {
    ws.send(JSON.stringify({"post":"command_line="+"look"}));
  }  
}, 300));


(function($) {
  var sprites_hash = new Object;

  function sprite_animate(node, speed) {
    function sprite_one_frame() {
      var state = node.attr('data-animation-state');
      var found = $("img", node);

      state = state % found.length + 1;
      node.attr('data-animation-state', state);

      found.hide();
      $("img:eq(" + (state-1) + ")", node).show();
    }
    sprite_one_frame();
    return setInterval(sprite_one_frame, speed);
  }
  
  $.fn.sprite = function(state) {
    this.each(function() {
      var $this = $(this);
      console.log($this.attr("id"));
      if(state == 'stop') {
        clearInterval(sprites_hash[$this.attr("id")]);
      }
      else {
        $("img", $this).hide();
        var found = $('.frames[data-state="' + state + '"]',$this);

        clearInterval(sprites_hash[$this.attr("id")]);
        if (found.length != 0) {
          found.attr('data-animation-state', 0);
          sprites_hash[$this.attr("id")] = sprite_animate(found, 750);
        }
      }
    });
    return this;
  };
})(jQuery);

$(function() {
  init_sprites();
});



