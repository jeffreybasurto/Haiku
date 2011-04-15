
function debug(str){ 
  $("#debug").empty();
  $("#debug").append(str+"<br"); 
};
function scroll(str) { 
  $("#scrolling_region").append(str+"<br>"); 
  $(document.body).animate({ scrollTop: document.body.scrollHeight }, 1);
};


