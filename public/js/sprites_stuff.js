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
  
  
  sprites_area.css('margin-left', sprites_area.width() % 62 / 2);
  sprites_area.css('margin-right', sprites_area.width() % 62 / 2);
  sprites_area.css('margin-top', sprites_area.height() % 62 / 2);
  sprites_area.css('margin-bottom', sprites_area.height() % 62 / 2);
  
  if(x_reduced == true) {
    sprites_area.css('margin-left', sprites_area.css('margin-left') + 31+"px");
    sprites_area.css('margin-right', sprites_area.css('margin-right') + 31 +"px");
  }
  
  if (y_reduced == true) {
    sprites_area.css('margin-bottom', sprites_area.css('margin-bottom') + 31+"px");
    sprites_area.css('margin-top', sprites_area.css('margin-top') + 31 +"px");
  }
  
  
  console.log(sprites_area.height());
  console.log(sprites_area.width());
  
  sprites_area.empty();
  console.log(y_to);
  console.log(x_to);
  while (y_total < y_to) {
    while(x_total < x_to) {
      sprites_area.append("<div class='tile' id='tile" + x_total + "_" + y_total + "'> ["+ x_total + "," + y_total +  "]</div>");
      x_total = x_total + 1;
    }
    y_total = y_total + 1;
    x_total = 0;
  }
}

$(window).resize(_.debounce(init_sprites, 300));
