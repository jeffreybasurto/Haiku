function init_sprites() {
  // Build the structure for the entire screen.
  var sprites_area = $("#sprite-area");
  var y_total = 0;
  var x_total = 0;
  var y_to = Math.floor((sprites_area.height()) / 62);
  var x_to = Math.floor((sprites_area.width()) / 62);
  
  sprites_area.css('margin-left', (sprites_area.width()) % 62 / 2);
  sprites_area.css('margin-top', (sprites_area.height()) % 62 / 2);
  
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
