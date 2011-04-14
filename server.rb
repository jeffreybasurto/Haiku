require 'bundler/setup'
require 'pp'
Bundler.require

set :port, 3000
Thread.abort_on_exception = true

load 'utilities.rb'

$welcome = <<-HERE
<div style="font-size:20px;">Welcome to <img src="haikulogo.png" alt="haikumud">. </div>
<div style="font-size:16px;color:grey;">HaikuMud (C) 2011 Jeffrey "Retnur/Runter" Basurto.</div>
<br>
<div style="font-size:18; font-family: courier new;">
  <form name="login" onSubmit="return false;">
    <input type="text" name="user_name">  User Name <br>
    <input type="password" name="user_pass">  Password <br>
    <input type="submit" name="login_submit" value="Log In">
  </form>
</div>
<div>
  <a href>Forgot Your Password?</a> or <a href>Create a New Account</a>
</div>
HERE

Thread.new do
  puts "Starting websocket server."
  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
    ws.onopen { ws.send JSON.generate({"scrollback"=>$welcome})}
    # When we receive a message just echo it back for now.
    ws.onmessage { |msg| 
      msg = JSON.parse(msg)
      ws.send JSON.generate({"scrollback"=>msg["chat"].make_safe_for_web_client})
    }
    ws.onclose { puts "Connection closed." }
  end
end

# web server routes defined below.   
get '/' do 
  erb :client, :locals=>{:host=>request.env["SERVER_NAME"]}
end


