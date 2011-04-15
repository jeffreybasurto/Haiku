  $(function() {
    $( "button, input:submit, a" ).button();
  });

  $(document).ready(function(){
    function debug(str){ 
      $("#debug").empty();
      $("#debug").append(str+"<br"); 
    };
    function scroll(str) { 
      $("#scrolling_region").append(str+"<br>"); 
      $(document.body).animate({ scrollTop: document.body.scrollHeight }, 1);
    };

    ws = new WebSocket("<%= 'ws://'+host+':8080' %>");

    ws.onmessage = function(e) { scroll(JSON.parse(e.data)["scrollback"]); };
    ws.onclose = function() { debug("<span style=\"color:red;\">Socket closed.</span>"); };
    ws.onopen = function() { debug("Connected."); };
  });

  function CommandSubmit() {
    // Send what's in our input buffer to the mud. 
    ws.send(JSON.stringify({"chat":document.forms["input"]["user_input"].value}));
    document.forms["input"]["user_input"].value='';
	return false;
  }