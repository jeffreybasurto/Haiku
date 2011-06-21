var div_count = 0;

function debug(str){ 
  $("#debug").empty();
  $("#debug").append(str+"<br"); 
};

function scroll(str) {
  div_count = div_count + 1; 
  $("#scrolling-region").append("<div id=\""+div_count+"\">"+str+"</div>"); 
  $(document.body).animate({ scrollTop: document.body.scrollHeight }, 100);
  return div_count;
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

//$(function(){
//    $("ul#ticker01").liScroll();
//});