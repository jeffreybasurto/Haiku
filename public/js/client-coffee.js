(function() {
  var accept_input, bar_hidden, checkLength, checkRegexp, debug, game_focus, getUniqueTime, mute_sounds, number_range, scroll, state, unmute_sounds, updateTips, ws;
  ws = null;
  getUniqueTime = function() {
    var time;
    time = new Date().getTime();
    while(time == new Date().getTime());
    return new Date().getTime();
  };
  number_range = function(minVal, maxVal, floatVal) {
    var randVal;
    randVal = minVal + (Math.random() * (maxVal - minVal));
    if (typeof floatVal === "undefined") {
      return Math.round(randVal);
    } else {
      return randVal.toFixed(floatVal);
    }
  };
  debug = function(str) {
    $("#debug").empty();
    return $("#debug").append(str);
  };
  scroll = function(str) {
    var div;
    div = $("<div>" + str + "</div>");
    $("#scrolling-region").append(div);
    return div;
  };
  updateTips = function(t) {
    var tips;
    tips = $(".validateTips");
    tips.text(t).addClass("ui-state-highlight");
    return setTimeout((function() {
      return tips.removeClass("ui-state-highlight", 1500);
    }), 500);
  };
  checkLength = function(o, n, min, max) {
    if (o.val().length > max || o.val().length < min) {
      o.addClass("ui-state-error");
      updateTips("Length of " + n + " must be between " + min + " and " + max + ".");
      return false;
    } else {
      return true;
    }
  };
  checkRegexp = function(o, regexp, n) {
    if (!(regexp.test(o.val()))) {
      o.addClass("ui-state-error");
      updateTips(n);
      return false;
    } else {
      return true;
    }
  };
  unmute_sounds = function(send_msg) {
    soundManager.unmute();;    $("#unmute_button").hide();
    $("#mute_button").show();
    if (send_msg) {
      return $.ajax({
        type: "POST",
        url: "/option",
        data: "mute=" + 0
      });
    }
  };
  mute_sounds = function(send_msg) {
    soundManager.mute();;    $("#mute_button").hide();
    $("#unmute_button").show();
    if (send_msg) {
      return $.ajax({
        type: "POST",
        url: "/option",
        data: "mute=" + 1
      });
    }
  };
  state = "login";
  game_focus = true;
  $.fn.equals = function(compareTo) {
    var i;
    if (!compareTo || !compareTo.length || this.length !== compareTo.length) {
      return false;
    }
    i = 0;
    while (i < this.length) {
      if (this[i] !== compareTo[i]) {
        return false;
      }
      i++;
    }
    return true;
  };
  $(function() {
    var availableTags, create_game_element, lookup_element, plant_element;
    create_game_element = function(id, oftype, img_states) {
      var rval;
      rval = "<div class='" + oftype + "' id='game_element_" + id + "' style='position:absolute;'>";
      img_states.forEach(function(each_state_arr) {
        rval += "<div class='frames' data-state='" + each_state_arr[0] + "'>";
        each_state_arr[1].forEach(function(item) {
          return rval += "<img src='" + item + "'>";
        });
        return rval += "</div>";
      });
      rval += "</div>";
      return rval;
    };
    plant_element = function(item, into) {
      var new_div;
      if (!into) {
        new_div = $(create_game_element(item[1], item[0], item[5]));
        grid_center(item[2], item[3]).append(new_div);
        if (item[6]) {
          $("#game_element_" + item[1]).sprite(item[6]);
        }
        if (item[7]) {
          return item[7].forEach(function(item) {
            return plant_element(item, new_div);
          });
        }
      } else {
        new_div = $(create_game_element(item[1], item[0], item[2]));
        into.append(new_div);
        if (item[3]) {
          $("#game_element_" + item[1]).sprite(item[3]);
        }
        if (item[4]) {
          return item[4].forEach(function(item) {
            return plant_element(item, new_div);
          });
        }
      }
    };
    lookup_element = function(idn) {
      return $("#game_element_" + idn);
    };
    availableTags = ["say", "who", "quit"];
    $("#command-line").autocomplete({
      position: {
        my: "left bottom",
        at: "left top"
      },
      source: availableTags
    });
    $("#feedback-badge").feedbackBadge({
      css3Safe: ($.browser.safari ? true : false),
      onClick: function() {
        var div;
        div = $("<div></div>");
        div.load("feedback_form.html");
        $("body").prepend(div);
        $("button", div).button();
        div.dialog({
          modal: true
        });
        $("#feedback-form").live("submit", function() {
          console.log("feedback submit");
          return false;
        });
        $("#close-bt").live("click", function() {
          return div.remove();
        });
        return false;
      }
    });
    WEB_SOCKET_SWF_LOCATION = "WebSocketMain.swf";
    ws = new WebSocket('ws://'+window.location.hostname+':8080');
    ws.onmessage = function(e) {
      var context, data, direction, element, found, item, key, node, options, pair, path, player, sp, stamp, towards, value, who;
      pair = JSON.parse(e.data);
      key = pair[0];
      value = pair[1];
      switch (key) {
        case "sound":
          return soundManager.play(value);;
        case "sprite_state":
          item = value;
          sp = lookup_element(item[0]);
          sp.sprite(item[1]);
          return setTimeout((function() {
            return sp.sprite("walking");
          }), item[2]);
        case "mv":
          item = value;
          towards = lookup_element(item[1]);
          element = lookup_element(item[0]);
          direction = item[2];
          if (!direction) {
            element.appendTo(towards);
            return;
          }
          element.css("z-index", 100);
          if (direction === "north") {
            element.animate({
              top: "-=60"
            }, 250, "linear");
            return element.queue(function() {
              element.appendTo(towards);
              element.css("top", "0");
              return $(this).dequeue();
            });
          } else if (direction === "east") {
            element.animate({
              left: "+=60"
            }, 250, "linear");
            return element.queue(function() {
              element.appendTo(towards);
              element.css("left", "0");
              return $(this).dequeue();
            });
          } else if (direction === "south") {
            element.animate({
              top: "+=60"
            }, 250, "linear");
            return element.queue(function() {
              element.appendTo(towards);
              element.css("top", "0");
              return $(this).dequeue();
            });
          } else if (direction === "west") {
            element.animate({
              left: "-=60"
            }, 250, "linear");
            return element.queue(function() {
              element.appendTo(towards);
              element.css("left", "0");
              return $(this).dequeue();
            });
          }
          break;
        case "new":
          item = value;
          return plant_element(item[1], lookup_element(item[0]));
        case "route":
          path = value;
          node = path[path.length - 1];
          found = lookup_element(node);
          found.append("<canvas id=\"movement_marker\" class=\"tile_canvas\" width=\"60\" height=\"60\"></canvas>");
          context = $("#movement_marker", found)[0].getContext("2d");
          context.fillRect(0, 0, 60, 60);
          return $("#movement_marker", found).fadeOut(300, function() {
            return $("#movement_marker").remove();
          });
        case "map":
          data = value;
          init_sprites();
          data[0].forEach(function(item) {
            return plant_element(item, false);
          });
          return data[1].forEach(function(item) {
            if (item[0] === "count") {
              return $("#game_element_" + item[1]).append("<span class='counter'>" + item[2] + "</span>");
            } else if (item[0] === "walls") {
              return item[2].forEach(function(dir) {
                return $("#game_element_" + item[1]).append("<span class='" + dir + "-wall wall'></span>");
              });
            }
          });
        case "form":
          data = value;
          eval("var passed_buttons =" + data[1]["buttons"]);
          return scroll(data[0]).dialog({
            show: data[1]["show"],
            hide: data[1]["hide"],
            title: data[1]["title"],
            width: "auto",
            resizable: false,
            modal: true,
            buttons: passed_buttons
          });
        case "who":
          who = $("<div></div>");
          who.append(value);
          who.append("<div class=\"contextMenu\" id=\"myMenu1\" style=\"display:none;\"><ul>" + "<li id=\"pm\"> Private Message</li>" + "<li id=\"info\"> Info </li>" + "</ul>" + "</div>");
          $("#scrolling-region").append(who);
          $(".who_element").contextMenu("myMenu1", {
            bindings: {
              pm: function(t) {
                return alert("Trigger was " + t.id + "\nAction was private message.");
              },
              info: function(t) {
                return alert("Trigger was " + t.id + "\nAction was info");
              }
            }
          });
          return who.dialog({
            modal: true,
            buttons: {
              Ok: function() {
                return $(this).dialog("close");
              }
            }
          });
        case "center":
          return pan_grid_to(value[0], value[1]);
        case "pan":
          return pan_grid(value[0], value[1]);
        case "say":
          player = lookup_element(value[0]);
          stamp = getUniqueTime();
          player.append("<div id='" + stamp + "' class='chat-bubble'>" + value[1] + "</div>");
          found = $("#" + stamp, player);
          found.css("left", 30 - found.width() / 2);
          found.css("top", 0 - found.height() / 2);
          return found.fadeOut(5000, "easeInCubic", function() {
            return $(this).remove();
          });
        case "cmd":
          if (value === "clear_screen") {
            $("#scrolling-region").empty();
            return console.log("Screen cleared.");
          }
          break;
        case "roll":
          console.log("Rolling number");
          return animate("#" + value[0], 3500, "random");
        case "scrollback":
          return $("button", scroll(value)).button();
        case "state":
          state = value;
          if (state === "playing") {
            $("#command-line-form img").css("display", "inline");
            $("#test_container").append($("#client-region"));
            $("#client-region").css("position", "fixed");
            $("#client-region").css("left", $(window).width() / 2 - $("#client-region").width() / 2);
            $("#client-region").css("bottom", $(window).height());
            $("#client-region").animate({
              bottom: 15,
              left: $(window).width() / 2 - $("#client-region").width() / 2
            }, "slow");
            return $("#test_container").append($("#client-region"));
          } else if (state === "login") {
            $("#wrapper").css("vertical-align", "middle");
            return $("#command-line-form img").css("display", "none");
          }
          break;
        case "miniwindow":
          data = value[0];
          options = value[1];
          found = $(data);
          $("body").append(found);
          $("#tabs", found).tabs();
          $(".tag-for-resizable", found).resizable();
          $("#chat-resize", found).css("width", options["width"]);
          $("#chat-resize", found).resizable();
          $("#chat-resize").removeClass("ui-resizable");
          $(found).draggable({
            handle: ".ui-tabs-nav",
            snap: true
          });
          found.css("position", "absolute");
          if (options["right"]) {
            found.animate({
              top: "0",
              right: "0"
            });
          } else if (options["left"]) {
            found.animate({
              left: "0",
              bottom: "0"
            });
          } else {
            found.animate({
              top: "0",
              left: "0"
            });
          }
          return $("button", found).button();
        case "dialog":
          return scroll(value).dialog({
            resizable: false,
            width: "auto",
            modal: true,
            buttons: {
              Ok: function() {
                return $(this).dialog("close");
              },
              show: "highlight",
              hide: "explode",
              open: function(event, ui) {
                return game_focus = false;
              },
              beforeClose: function(event, ui) {
                return game_focus = true;
              }
            }
          });
        case "reload":
          return window.location.href = window.location.href;
        case "guider":
          found = value;
          if (found === "new_player") {
            guider.createGuider({
              buttons: [
                {
                  name: "Next"
                }
              ],
              description: "We're still very alpha.  You're seeing this guider because this is the first time you've logged into the game.  This guide will walk you through some of the basics of playing the game.",
              id: "alpha",
              next: "command-line",
              overlay: true,
              title: "Welcome to HaikuMud alpha!"
            }).show();
            guider.createGuider({
              attachTo: "#command-line-form",
              buttons: [
                {
                  name: "Next"
                }
              ],
              description: "Press enter to bring up your command line!  This is where you can communicate and input some useful commands.  <b>Try typing 'say hello world'.</b>",
              id: "command-line",
              next: "feedback",
              position: 11,
              title: "Return key for Command Line!",
              width: 450
            });
            guider.createGuider({
              attachTo: "#feedback-badge",
              buttons: [
                {
                  name: "Next"
                }
              ],
              description: "You can use this link if you'd like to leave feedback.  All ideas and suggestions are considered!",
              id: "feedback",
              next: "menu",
              overlay: true,
              title: "Feedback Welcome.",
              position: 3
            });
            guider.createGuider({
              attachTo: "#menu-buttons",
              buttons: [
                {
                  name: "Next"
                }
              ],
              description: "You can find help, options, and other useful functionality on this bar.",
              id: "menu",
              next: "finish",
              overlay: true,
              title: "Game Menu",
              position: 10
            });
            return guider.createGuider({
              buttons: [
                {
                  name: "Close",
                  onclick: guider.hideAll
                }
              ],
              description: "That's all for now!  You can get in touch with the author at jeffreybasurto@gmail.com.",
              id: "finish",
              next: "none",
              overlay: true,
              title: "That's all."
            });
          }
      }
    };
    ws.onclose = function() {
      $("#debug").removeClass("ui-state-highlight");
      debug("Socket closed.");
      return $("#debug").addClass("ui-state-error");
    };
    return ws.onopen = function() {
      $("#debug").removeClass("ui-state-error");
      debug("Connected.");
      return $("#debug").addClass("ui-state-highlight");
    };
  });
  accept_input = true;
  bar_hidden = true;
  $(document).keydown(function(e) {
    if (state === "playing" && game_focus) {
      if (accept_input) {
        if (e.which === "37") {
          return shift_grid_east();
        } else if (e.which === "38") {
          return shift_grid_south();
        } else if (e.which === "39") {
          return shift_grid_west();
        } else {
          if (e.which === "40") {
            return shift_grid_north();
          }
        }
      }
    }
  });
  $(document).keypress(function(e) {
    var cl;
    if (state === "playing" && game_focus) {
      if (accept_input) {
        if (e.which === "100") {
          ws.send(JSON.stringify({
            post: "command_line=" + "east"
          }));
        } else if (e.which === "119") {
          ws.send(JSON.stringify({
            post: "command_line=" + "north"
          }));
        } else if (e.which === "97") {
          ws.send(JSON.stringify({
            post: "command_line=" + "west"
          }));
        } else {
          if (e.which === "115") {
            ws.send(JSON.stringify({
              post: "command_line=" + "south"
            }));
          }
        }
      }
      if (e.which === 13) {
        cl = $("#command-line");
        if (!cl.val() || bar_hidden) {
          bar_hidden = !bar_hidden;
          cl.toggle();
        }
        if (!bar_hidden) {
          if (cl.val()) {
            ws.send(JSON.stringify({
              post: "command_line=" + cl.val()
            }));
            cl.val("");
          }
          cl.focus();
          return e.preventDefault();
        } else {
          return cl.blur();
        }
      }
    }
  });
  $(".tile").live("click", function() {
    var target;
    target = $(".room", $(this)).first().attr("id");
    if (target) {
      return ws.send(JSON.stringify({
        path: "" + target
      }));
    }
  });
  $(".who_element").live({
    mouseenter: function() {
      return $(this).toggleClass("selection", 400);
    },
    mouseleave: function() {
      return $(this).toggleClass("selection", 200);
    }
  });
  $(window).resize(function() {
    if (state === "playing") {
      return $("#client-region").css("bottom", 15).css("left", $(window).width() / 2 - $("#client-region").width() / 2);
    }
  });
  $("form", $("#wrapper")).live("submit", function() {
  if ($("#command-line-form").equals($(this))) {
  	return false;	
  }
  ws.send(JSON.stringify({"post":$(this).serialize()}));
  return false;
});;
  /*
  $('#wrapper form').live "submit", ->
    return false  if $("#command-line-form").equals($(this))
    ws.send JSON.stringify(post: $(this).serialize())
    false
    */
  $("input").live("focusin", function() {
    accept_input = false;
    return console.log("focusin");
  });
  $("input").live("focusout", function() {
    accept_input = true;
    return console.log("focusout");
  });
  $("button").live("click", function() {
    if ($(this).val()) {
      return ws.send(JSON.stringify({
        click: $(this).val()
      }));
    }
  });
}).call(this);
