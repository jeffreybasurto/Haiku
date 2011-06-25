var state = "login";
var game_focus = true;

function number_range(minVal,maxVal,floatVal) {
  var randVal = minVal+(Math.random()*(maxVal-minVal));
  return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}

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
  var availableTags = [
    "say",
    "who",
    "quit",
  ];
  $( "#command-line" ).autocomplete({
	position: { my : "left bottom", at: "left top" },
    source: availableTags
  });
  $('#feedback-badge').feedbackBadge({
    css3Safe: $.browser.safari ? true : false, //this trick prevents old safari browser versions to scroll properly
	onClick: function () {
	  // Do your magic in here when you click the badge
	  // Now I just show a simple popup, you could use the jQuery UI dialog
	  var div = $('<div></div>');
	  div.load('feedback_form.html');
	  $('body').prepend(div);
	  $("button", div).button();
				
      div.dialog({"modal":true});
	  //After ataching the popup to the dom - load the form by ajax
	  $('#feedback-form').live('submit', function () {
        console.log("feedback submit");
        return false;
      });
	  $('#close-bt').live('click', function () {
	    //Do your magic in here when the form cancel button is clicked
	    div.remove();
	  });
	  return false;
    }
  });

  // Let the library know where WebSocketMain.swf is:
  WEB_SOCKET_SWF_LOCATION = "WebSocketMain.swf";
  ws = new WebSocket('ws://'+window.location.hostname+':8080');
  ws.onmessage = function(e) { 
      var received = JSON.parse(e.data);
      console.log(received);
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
	    var who = $("<div></div>");
	    who.append(received["who"]);
	    who.append('<div class="contextMenu" id="myMenu1" style="display:none;"><ul>'+
	        '<li id="pm"> Private Message</li>' +
	        '<li id="info"> Info </li>' +
	      '</ul>' +
	    '</div>');
	    $("#scrolling-region").append(who); 
		$(".who_element").contextMenu('myMenu1', {
	      bindings: {
	        'pm': function(t) {
	          alert('Trigger was '+t.id+'\nAction was private message.');
	        },
	        'info': function(t) {
	          alert('Trigger was '+t.id+'\nAction was info');
	        }
	      }
	    });
	
        who.dialog({
	            modal: true,
	            buttons: { "Ok": function() { $(this).dialog("close"); }  }
	    });
      }
      else if(received["guider"]) {
	    var found = received["guider"];
        if(found == "new_player") {
	      guider.createGuider({
		    buttons: [{name: "Next"	}],
		    description: "We're still very alpha.  You're seeing this guider because this is the first time you've logged into the game.  This guide will walk you through some of the basics of playing the game.",
		    id: "alpha",
		    next: "command-line",
		    overlay: true,
		    title: "Welcome to HaikuMud alpha!"
		  }).show();
		  /* .show() means that this guider will get shown immediately after creation. */
          guider.createGuider({
		    attachTo: "#command-line-form",
		    buttons: [{name: "Next"}],
		    description: "Press enter to bring up your command line!  This is where you can communicate and input some useful commands.  <b>Try typing 'say hello world'.</b>",
		    id: "command-line",
		    next: "feedback",
		    position: 11,
		    title: "Return key for Command Line!",
		    width: 450
		  });		
		  guider.createGuider({
			attachTo: "#feedback-badge",
			buttons:[{name: "Next"}],
			description: "You can use this link if you'd like to leave feedback.  All ideas and suggestions are considered!",
			id: "feedback",
			next: "menu",
			overlay: true,
			title: "Feedback Welcome.",
			position:3
		  })
		  guider.createGuider({
			attachTo: "#menu-buttons",
		    buttons: [{name: "Next"}],
		    description: "You can find help, options, and other useful functionality on this bar.",
		    id: "menu",
		    next: "finish",
		    overlay: true,
		    title: "Game Menu",
		    position:10	
		  })
		  guider.createGuider({
		    buttons: [{name: "Close", onclick: guider.hideAll }],
		    description: "That's all for now!  You can get in touch with the author at jeffreybasurto@gmail.com.",
		    id: "finish",
		    next: "none",
		    overlay: true,
		    title: "That's all."
		  })
        }

      }
      else if(received["chat"]) {
	    var chat_box = $("#chat");
	    var new_node = $(received["chat"] + "<br>")
	    chat_box.append(new_node);
	    new_node.effect("highlight", {}, 3000);
	
	    $("#chat-tab").effect("highlight", {}, 3000);
	
	    $("#chat-resize").scrollTop(chat_box.attr('scrollHeight'));
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
	    if(state == "playing") {
		  $("#command-line-form img").css("display", "inline");
		  //$("#cell").css("vertical-align", "bottom");
          $("#test_container").append($("#client-region"));
          $("#client-region").animate({bottom: -$(document).height() + $("#client-region").height() * 2}, "slow");

  	    }
        else if (state == "login") {
	      $("#wrapper").css("vertical-align", "middle");
	      $("#command-line-form img").css("display", "none");
        }
      }
      else if (received["miniwindow"]) {
	    var data = received["miniwindow"][0];
	    var options = received["miniwindow"][1];
	    var found = $(data);
	    $("#test_container").append(found);
	    $("#tabs", found).tabs();
		$(".tag-for-resizable", found).resizable();
		$("#chat-resize", found).css("width", options["width"]);
		$("#chat-resize", found).resizable();
		$('#chat-resize').removeClass('ui-resizable');

		
		$(found).draggable({ handle: '.ui-tabs-nav', snap:true});
        found.css("position", "absolute");
		if (options["right"]) {
		  found.animate({top:"0", right:"0"});
		}
		else
		{
          found.animate({top:"0", left:"0"});
        }
        $("button", found).button();
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
      else if (received["reload"]) {
        window.location.href=window.location.href;
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
  //$(window).trigger("resize");
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

$(".who_element").live({
  mouseenter: function() { 
	$(this).toggleClass( "selection", 400 );
  },
  mouseleave: function () {
	$(this).toggleClass( "selection", 200 );
  }
});

$(window).resize(function() {
  if (state == "playing") {
    $("#client-region").stop(true, true);
    $("#client-region").animate({bottom: -$(document).height() + $("#client-region").height() * 2}, "slow");
  }
});

$("form", $("#wrapper")).live("submit", function() {
	if ($("#command-line-form").equals($(this))) {
	  return false;	
	}
  	ws.send(JSON.stringify({"post":$(this).serialize()}));
   
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
