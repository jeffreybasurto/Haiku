var last_executed = 0;
var r_value = 0;
function random_for_easing(min, max) {
  var t = new Date().getTime();
  if ((t - last_executed) > 100) {
    r_value = (min + Math.random() * (max - min));
    last_executed = t;
  }
  return r_value;
}

jQuery.easing.random = function(percentage_elapsed, time_elapsed, value_start, value_difference, time_duration) {  
  var modified_by = $.easing.easeOutExpo(percentage_elapsed, time_elapsed, value_start, value_difference, time_duration);
  var variance = 100 - Math.round(percentage_elapsed*modified_by*100);
  
  var min = 100-variance;
  var max = 100+variance;
  return random_for_easing(min, max) / 100;
}

//       linear: function(percentage_elapsed, time_elapsed, value_start, value_difference, time_duration) {
//           return value_start + value_difference * percentage_elapsed;
//      }

function animate(idn, duration, easing) {
  var $input = $(idn);
  var num = $input.text();
  $input.animate({"some_tag_to_reference":num},
    {
      easing: easing == undefined ? "linear" : easing,
      duration: duration == undefined ? 500 : parseInt(duration),
      step: function(now,fx) {  
        $(this).text(Math.round(now)); 
      },
      complete: function() {
        $(this).text(num);
      }
    });
}