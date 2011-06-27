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
  
  
  sprites_area.css('margin-left', (x_reduced ? 31 : 0) + (sprites_area.width() % 62 / 2));
//  sprites_area.css('margin-right',(x_reduced ? 31 : 0) + (sprites_area.width() % 62 / 2));
  sprites_area.css('margin-top', (y_reduced ? 31 : 0) + (sprites_area.height() % 62 / 2));
//  sprites_area.css('margin-bottom', (y_reduced ? 31 : 0) + (sprites_area.height() % 62 / 2));
  console.log(x_reduced);
  console.log(y_reduced);
  
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
    sprites_area.append("<br>");
    y_total = y_total + 1;
    x_total = 0;
  }
}

$(window).resize(_.debounce(init_sprites, 300));
