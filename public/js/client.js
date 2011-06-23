var state = "login";
var game_focus = true;

$.fn.equals = function(compareTo) { 
  if (!compareTo || !compareTo.length || this.length!=compareTo.length) { 
    return false; 
  } 
  for (var i=0; i<this.length; i++) { 
    if (this[i]!==compareTo[i]) { 
      return false; 
    } 
  } 
  return true; 
}

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
      else if(received["who"]) {
	    $("#who").empty();
	    $("#who").append(received["who"]);
	    $("#who").append('<div class="contextMenu" id="myMenu1" style="display:none;"><ul>'+
	        '<li id="open"> Open</li>' +
	        '<li id="email"> Email</li>' +
	        '<li id="save"> Save</li>' +
	        '<li id="close"> Close</li>' +
	      '</ul>' +
	    '</div>')
		$(".who_element").contextMenu('myMenu1', {
	      bindings: {
		      menuStyle: {
		      },
	        'open': function(t) {
	          alert('Trigger was '+t.id+'\nAction was Open');
	        },
	        'email': function(t) {
	          alert('Trigger was '+t.id+'\nAction was Email');
	        },
	        'save': function(t) {
	          alert('Trigger was '+t.id+'\nAction was Save');
	        },
	        'delete': function(t) {
	          alert('Trigger was '+t.id+'\nAction was Delete');
	        },
	      }
	    });
      }
      else if(received["chat"]) {
	    $("#chat").append(received["chat"] + "<br>");
      }
      else if(received["cmd"]) {
        if(received["cmd"] == "clear_screen") {
            $("#scrolling-region").empty();
            console.log("Screen cleared.");
        }
      } 
      else if(received["scrollback"]) {
        $("button", scroll(received["scrollback"])).button();
      } 
      else if(received["state"]) {
	    state = received["state"];
      }
      else if (received["miniwindow"]) {
	    var data = received["miniwindow"];
	    var found = scroll(data[0]);
	    found.dialog({
		  position: data[1]["position"],
          title: data[1]["title"],
          width: data[1]["width"],
          height: 140,
	      resizable: data[1]["resizable"],
	      closeOnEscape: false,
	      open: function(event, ui) {
		    $(".ui-dialog-titlebar-close", ui.dialog).hide(); 
		  }
    	});
     
      }
      else if(received["dialog"]) {
        scroll(received["dialog"]).dialog({
          resizable: false,
            width: "auto",
			modal: true,
			buttons: {
				Ok: function() {
					$( this ).dialog( "close" );
				}
			},
			show: "highlight",
			hide: "explode",
			open: function(event, ui) { game_focus = false;},
			beforeClose: function(event, ui) { game_focus = true;}
			
		  });
      }
  };
  ws.onclose = function() { 
	$("#debug").removeClass( 'ui-state-highlight' );
	debug("Socket closed.");
	$("#debug").addClass('ui-state-error'); 
	
  };
  ws.onopen = function() {
	$("#debug").removeClass( 'ui-state-error' );
	debug("Connected."); 
	$("#debug").addClass( "ui-state-highlight" );
  };
});

function debug(str){ 
  $("#debug").empty();
  $("#debug").append(str); 
};

function scroll(str) {
  var div = $('<div>'+str+'</div>');
  $("#scrolling-region").append(div); 
 // $(document.body).animate({ scrollTop: document.body.scrollHeight }, 100);
  return div;
};

var bar_hidden = true;
$(document).keypress(function(e) {
  
  if (state == "playing" && game_focus && e.which == 13) {
	var cl = $("#command-line");
	if (!cl.val() || bar_hidden) {
		bar_hidden = !bar_hidden;
		cl.toggle();
	}    
    if (!bar_hidden) {
	  if (cl.val()) {
	    ws.send(JSON.stringify({"post":"command_line="+cl.val()}));
	    cl.val('');
	  }
	  cl.focus();
	  e.preventDefault();
    }
    else {
	  cl.blur();
    }
  }
});


$("form").live("submit", function() {
	if (!$("#command-line-form").equals($(this))) {
  	  ws.send(JSON.stringify({"post":$(this).serialize()}));
    }
    return false;
});

$("button").live("click", function() {
	if ($(this).val()) {
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

function checkRegexp( o, regexp, n ) {
	if ( !( regexp.test( o.val() ) ) ) {
		o.addClass( "ui-state-error" );
		updateTips( n );
		return false;
	} else {
		return true;
	}
}
//$(function(){
//    $("ul#ticker01").liScroll();
//});