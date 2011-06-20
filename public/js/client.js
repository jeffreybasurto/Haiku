var div_count = 0;

function debug(str){ 
  $("#debug").empty();
  $("#debug").append(str+"<br"); 
};
function scroll(str) {
  div_count = div_count + 1; 
  $("#scrolling-region").append("<div id=\""+div_count+"\">"+str); 
  $(document.body).animate({ scrollTop: document.body.scrollHeight }, 1);
  return div_count;
};

$("form").live("submit", function() {
	ws.send(JSON.stringify({"form":$(this).serialize()}));
    return false;
});


