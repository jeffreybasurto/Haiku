$(function(){  
  $("#sprite-area").selectable({ 
    distance: 4, 
  //  filter: '.tile'
    filter: '* > .tile',
    autoRefresh: false
  }); 
});



/*
$(".tile").live("mouseenter", function() {
  $(this).css("border", "1px solid red");
  if($(this).is(":empty")) {
  }
  else {
    $(".north-wall", this).css("border-top", "1px solid red");
    $(".east-wall", this).css("border-right", "1px solid red");
    $(".south-wall", this).css("border-bottom", "1px solid red");
    $(".west-wall", this).css("border-left", "1px solid red");
    
  }  
});

$(".tile").live("mouseleave", function() {
  $(this).css("border", "");
  $(".north-wall", this).css("border-top", "");
  $(".east-wall", this).css("border-right", "");
  $(".south-wall", this).css("border-bottom", "");
  $(".west-wall", this).css("border-left", "");
});*/