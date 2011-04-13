require 'bundler/setup'
Bundler.require
require 'pp'
set :port, 3000

Thread.new do
  puts "Starting websocket server."
  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
    ws.onopen { ws.send "Welcome to <b>HaikuMud</b>." }
    # When we receive a message just echo it back for now.
    ws.onmessage { |msg| ws.send msg }
    ws.onclose { puts "Connection closed." }
  end
end

get '/' do 
  erb :index, :locals=>{:host=>request.env["SERVER_NAME"]}
end
