function animate(idn, duration, easing) {
  var $input = $(idn);
  console.log($input);
  var num = $input.text();
  $input.animate({"some_tag_to_reference":num},
    {
      easing: easing == undefined ? "linear" : easing,
      duration: duration == undefined ? 500 : parseInt(duration),
      step: function(now,fx) {  
        $(this).text(Math.round(now)); 
      }
    });
}