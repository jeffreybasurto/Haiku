require 'bundler/setup'
Bundler.require
set :port, 3000

load 'utilities.rb'

$welcome = <<-HERE
<span style="font-size:20px;">Welcome to <img src="haikulogo.png" alt="haikumud">. <span>
HERE

Thread.new do
  puts "Starting websocket server."
  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
    ws.onopen { ws.send JSON.generate({"scrollback"=>$welcome})}
    # When we receive a message just echo it back for now.
    ws.onmessage { |msg| 
      msg = JSON.parse(msg)
      ws.send JSON.generate({"scrollback"=>msg.make_safe_for_web_client()}) 
    }
    ws.onclose { puts "Connection closed." }
  end
end

# web server routes defined below.   
get '/' do 
  erb :client, :locals=>{:host=>request.env["SERVER_NAME"]}
end


