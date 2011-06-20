require 'bundler/setup'
require 'pp'
Bundler.require

set :port, 3000
Thread.abort_on_exception = true

load 'utilities.rb'
load 'models/player.rb'

$welcome = File.open("data/welcome.htm", 'rb') { |f| f.read }

Thread.new do
  class EventMachine::WebSocket::Connection
    attr_accessor :player
  end
  
  puts "Starting websocket server."
  EM::run do
    EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
      ws.onopen do  
        ws.player = Player.new
        ws.player.socket = ws
        ws.send JSON.generate({"scrollback"=>$welcome})    
      end
      # When we receive a message just echo it back for now.
      ws.onmessage do |msg| 
        JSON.parse(msg).each do |key, value|
          case key
          when "chat"
            ws.send JSON.generate({"scrollback"=>value.make_safe_for_web_client})
          else
            puts "Unrecognized packet received."
          end  
        end
      end
      ws.onclose { puts "Connection closed." }

    end
  end
end

set :server, %w[thin webrick]

# web server routes defined below.   
get '/' do 
  erb :client, :locals=>{:host=>request.env["SERVER_NAME"]}
end


