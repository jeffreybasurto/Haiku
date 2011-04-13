require 'bundler/setup'
Bundler.require
require 'pp'
set :port, 3000

Thread.new do
  puts "Starting websocket server."
  EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
    ws.onopen { ws.send "Welcome to <b>HaikuMud</b>." }
    ws.onmessage { |msg| puts "Received: #{msg}" }
    ws.onclose { puts "Connection closed." }
  end
end

get '/' do 
  erb :index
end
