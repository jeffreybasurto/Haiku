$(function(){
  // Let the library know where WebSocketMain.swf is:
  WEB_SOCKET_SWF_LOCATION = "WebSocketMain.swf";
  ws = new WebSocket('ws://'+window.location.hostname+':8080');
  ws.onmessage = function(e) { 
      var received = JSON.parse(e.data);
      if(received["form"]) {
        var data = received["form"];
        eval("var passed_buttons =" + data[1]["buttons"]); 
        scroll(data[0]).dialog({
          show: data[1]["show"],
          hide: data[1]["hide"],
          title: data[1]["title"],
          width: "auto",
	        resizable: false,
    		modal: true,
    		buttons: passed_buttons
    	  });
      }
      if(received["cmd"]) {
        if(received["cmd"] == "clear_screen") {
            $("#scrolling-region").empty();
            console.log("Screen cleared.");
        }
      }
      if(received["scrollback"]) {
        $("button", scroll(received["scrollback"])).button();
      } 
      if(received["dialog"]) {
        scroll(received["dialog"]).dialog({
          resizable: false,
			modal: true,
			buttons: {
				Ok: function() {
					$( this ).dialog( "close" );
				}
			},
			show: "highlight",
			hide: "explode"
		  });
      }
  };
  ws.onclose = function() { debug("<span style=\"color:red;\">Socket closed.</span>"); };
  ws.onopen = function() { debug("Connected."); };
});

function debug(str){ 
  $("#debug").empty();
  $("#debug").append(str+"<br"); 
};

function scroll(str) {
  var div = $("<div>" + str + "</div>");
  $("#scrolling-region").append(div); 
  $(document.body).animate({ scrollTop: document.body.scrollHeight }, 100);
  return div;
};

$("form").live("submit", function() {
	ws.send(JSON.stringify({"post":$(this).serialize()}));
    return false;
});

$("button").live("click", function() {
	if ($(this).val()) {
      console.log($(this).val());	
	  ws.send(JSON.stringify({"click":$(this).val()}))
    }
})

function updateTips( t ) {
	var tips = $( '.validateTips');
	tips
		.text( t )
		.addClass( "ui-state-highlight" );
	setTimeout(function() {
		tips.removeClass( "ui-state-highlight", 1500 );
	}, 500 );
}

function checkLength( o, n, min, max ) {
	if ( o.val().length > max || o.val().length < min ) {
		o.addClass( "ui-state-error" );
		updateTips( "Length of " + n + " must be between " +
			min + " and " + max + "." );
		return false;
	} else {
		return true;
	}
}
//$(function(){
//    $("ul#ticker01").liScroll();
//});