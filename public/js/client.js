var state = "login";
var game_focus = true;

soundManager.debugMode = false;
soundManager.url = '/swf/';
soundManager.flashVersion = 9; // optional: shiny features (default = 8)
soundManager.useFlashBlock = false; // optionally, enable when you're ready to dive in
// enable HTML5 audio support, if you're feeling adventurous. iPad/iPhone will always get this.
// soundManager.useHTML5Audio = true;
soundManager.onready(function() {
  // Ready to use; soundManager.createSound() etc. can now be called.
  soundManager.createSound({
	  id: "bounce",
	  //url: '/imasuka.m4a',
	  //url: '/fantasia.mp3',
	  url: '/bounce.mp3',
	  //url: '/bass.mp3',
	  autoLoad: true,
	  autoPlay: false,
	  onload: function() {
	    //alert('The sound '+this.sID+' loaded!');
    },
    onfinish:function() {
      //this.play();
     }
  });
});


function number_range(minVal,maxVal,floatVal) {
  var randVal = minVal+(Math.random()*(maxVal-minVal));
  return typeof floatVal=='undefined'?Math.round(randVal):randVal.toFixed(floatVal);
}

jQuery.fn.reverse = [].reverse;


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

  function create_game_element(id, oftype, img_states) {
    var rval = "<div id='game_element_" +id+ "'><div class='"+ oftype + "'>";           
    img_states.forEach(function(each_state_arr) {
      rval += "<div class='frames' data-state='" + each_state_arr[0] + "'>";
      each_state_arr[1].forEach(function(item) {
        rval += "<img src='" + item  +"'>";
      });           
      rval += "</div>";
    });
    rval +="</div></div>";
    return rval;
  }

  // Let the library know where WebSocketMain.swf is:
  WEB_SOCKET_SWF_LOCATION = "WebSocketMain.swf";
  ws = new WebSocket('ws://'+window.location.hostname+':8080');
  ws.onmessage = function(e) { 
      var received = JSON.parse(e.data);
      console.log(received);
      if(received["sound"]) {
        soundManager.play(received['sound']);
      }
      else if(received["map"]) {
        var data = received["map"];
        init_sprites();
        // Now we should have an array of rooms.
        data[0].forEach(function(item) {          
          grid_center(item[2],item[3]).append(create_game_element(item[1], item[0], item[5]));
          if(item[6]) {
            $("#game_element_"+ item[1]).sprite(item[6]);
          }
        });
        data[1].forEach(function(item) {
          if (item[0] == "count") {
            $("#game_element_" + item[1]).append("<span class='counter'>" + item[2] + "</span>");
          }
        });
      }
      else if(received["form"]) {
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
          $("#client-region").css("position", "fixed");
          $("#client-region").css("left", $(window).width()/2 - $("#client-region").width()/2);
          $("#client-region").css("bottom", $(window).height());
          $("#client-region").animate({bottom: 15, left: $(window).width()/2 - $("#client-region").width()/2 }, "slow");
          $("#test_container").append($("#client-region"));
          
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
	    $("body").append(found);
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
		else if (options["left"]) {
		  found.animate({left:"0", bottom:"0"});
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

var accept_input = true;
var bar_hidden = true;
$(document).keypress(function(e) {
  if (state == "playing" && game_focus) {
    if (accept_input) {
      if (e.which == '100') {
        //shift_grid_east();
        ws.send(JSON.stringify({"post":"command_line="+"east"}));
      }
      else if (e.which == '119') {
        //shift_grid_north();
        ws.send(JSON.stringify({"post":"command_line="+"north"}));
      } 
      else if (e.which== '97') {
        //shift_grid_west();
        ws.send(JSON.stringify({"post":"command_line="+"west"}));
        
      }
      else if (e.which == '115') {
        //shift_grid_south();
        ws.send(JSON.stringify({"post":"command_line="+"south"}));
        
      }
    }
    
    if (e.which == 13) {
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
    $("#client-region").css("bottom", 15).css("left", $(window).width()/2 - $("#client-region").width()/2 );
  }
});

$("form", $("#wrapper")).live("submit", function() {
  if ($("#command-line-form").equals($(this))) {
	  return false;	
	}
  ws.send(JSON.stringify({"post":$(this).serialize()}));
  return false;
});

// when focused we need to disable input from the keyboard.
$("input").live("focusin", function() {
  accept_input = false;
  console.log("focusin");
});
$("input").live("focusout", function() {
  accept_input = true;
  console.log("focusout");
});

$("button").live("click", function() {
	if ($(this).val()) {
	  ws.send(JSON.stringify({"click":$(this).val()}));
  }
});

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




function unmute_sounds(send_msg) {
  soundManager.unmute();
  $('#unmute_button').hide();
  $('#mute_button').show();
  
  if (send_msg) {
    $.ajax({  
      type: "POST",  
      url: "/option",  
      data: "mute="+0,  
    });
  }
}


function mute_sounds(send_msg) {
  soundManager.mute();
  $('#mute_button').hide();
  $('#unmute_button').show();
  
  if (send_msg) {
    $.ajax({  
      type: "POST",  
      url: "/option",  
      data: "mute="+1,  
    });
  }
}
