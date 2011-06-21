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

function updateTips( t ) {
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