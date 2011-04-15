require 'bundler/setup'
require 'pp'
Bundler.require

set :port, 3000
Thread.abort_on_exception = true

load 'utilities.rb'
load 'player.rb'

$welcome = <<-HERE
<div style="font-size:20px;">Welcome to <img src="haikulogo.png" alt="haikumud">. </div>
<div style="font-size:16px;color:grey;">HaikuMud (C) 2011 Jeffrey "Retnur/Runter" Basurto.</div>
<br>
<div style="font-size:18px; font-family: courier new;">
  <input id="user_name" type="text">  User Name <br>
  <input id="user_pass" type="password">  Password <br>  
  <button style="font-size:15px;">Log In</button>
</div>
<div style="font-size:12px;">
  <a href>Forgot Your Password?</a> or <a href>Create a New Account</a>
</div>
HERE

Thread.new do
  puts "Starting websocket server."
  EM::run do
    EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
      ws.onopen {  ws.send JSON.generate({"scrollback"=>$welcome}) }
      # When we receive a message just echo it back for now.
      ws.onmessage { |msg| 
        JSON.parse(msg).each do |key, value|
          case key
          when "chat"
            ws.send JSON.generate({"scrollback"=>value.make_safe_for_web_client})
          else
            puts "Unrecognized packet received."
          end  
        end
      }
      ws.onclose { puts "Connection closed." }

    end
  end
end

# web server routes defined below.   
get '/' do 
  erb :client, :locals=>{:host=>request.env["SERVER_NAME"]}
end


