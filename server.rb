require 'bundler/setup'
require 'pp'
Bundler.require

set :port, 3000
Thread.abort_on_exception = true

DataMapper::Logger.new($stdout, :debug)
# A Sqlite3 connection to a persistent database
DataMapper.setup(:default,ENV['DATABASE_URL'] || "sqlite://#{File.expand_path(File.dirname(File.expand_path(__FILE__)) + '/server/data.db')}")

load 'server/utilities.rb'
Dir[File.dirname(__FILE__) + '/server/models/*.rb'].each {|file| load file }


DataMapper.finalize # all models are defined in the files loaded above.
DataMapper.auto_upgrade!

Room.startup 

$welcome = File.open("server/data/welcome.htm", 'rb') { |f| f.read }
$creation = File.open("server/data/creation.htm", 'rb') {|f| f.read }

def load_data (str)
  File.open("server/data/#{str}", 'rb') {|f| f.read}
end

Thread.new do
  class EventMachine::WebSocket::Connection
    attr_accessor :player, :state
    def packet type, data
      send JSON.generate({type=>data})
    end
    def clear_screen
      packet "cmd", "clear_screen"
    end
    def login
      self.state = :playing
      clear_screen
      packet "state", "playing"
      packet "miniwindow", [load_data("chat_window.htm"), {:width=>"50%", :resizable=>true}]
            
      Room.first({:vtag=>"first.room"}).people << self      
      
      self.player.socket = self
      Player.connected << self.player 
    end
    def logout
      Player.connected.delete(self.player)
      self.state = :login
      Player.connected.each &:do_who
    end
  end
  
  puts "Starting websocket server."
  EM::run do
    EventMachine::WebSocket.start(:host => "0.0.0.0", :port => 8080) do |ws|
      ws.onopen do  
        ws.state = :login
        ws.player = Player.new
        ws.player.socket = ws
        ws.packet "cmd", "clear_screen"
        ws.packet "scrollback", $welcome
        ws.packet "state", "login"
      end
      # When we receive a message just echo it back for now.
      ws.onmessage do |msg| 
        JSON.parse(msg).each do |key, value|
          case key
          when "click" # one of our registered buttons was clicked.
            # value is the registration of the button.
            case ws.state
            when :login # when we're in login state we should determine if they want to create a new character or need help.
              case value
              when "create_account"
                ws.packet("form", [$creation, {:show=>"highlight", :hide=>"explode", :title=>"Create a New Account", :buttons=><<-eos
                  	{
                        'Create an account': function() {
                          var user_name = $( '#user_name' ),
                    			user_password = $( '#user_password' ),
                    			allFields = $( [] ).add( user_name ).add( user_password ),
                    			tips = $( '.validateTips');
                    	    var bValid = true;
                    		  allFields.removeClass( 'ui-state-error' );
                      	  bValid = bValid && checkLength( user_name, 'user_name', 3, 16 );
                          bValid = bValid && checkLength( user_password, 'user_password', 5, 16 );
                          bValid = bValid && checkRegexp( user_name, /^[a-z]([0-9a-z_])+$/i, 'Username may consist of a-z, 0-9, underscores, begin with a letter.' );
                          // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                          bValid = bValid && checkRegexp( user_password, /^([0-9a-zA-Z])+$/, 'Password field only allow : a-z 0-9' );

                          if ( bValid ) {
                            ws.send(JSON.stringify({"create_account":$("#creation_form").serialize()}));
                            $( this ).dialog( 'close' );
                          }
                        },	
                        Cancel: function() {
              			      $( this ).dialog( 'close' );
              	        }
              		}
                eos
                }])
              when "reset_password"
                ws.packet "dialog" , "<span class=\"coming_soon\">That's not yet implemented.</span>"
              else
                puts "Unrecognized click for #{value}"
              end
            end
          when "create_account"
            args = parse_query(value)
            if (ws.state == :login)
              input_name = args["user_name"].downcase.capitalize
              if Player.first({:name=>input_name})
                ws.packet "dialog", "That user name is already in use."
              else
                ws.packet "dialog", "Account successfully created."
                p = Player.new
                p.name = input_name
                p.password = args["user_password"]
                p.save
              end
            else
              ws.packet "dialog", "You cannot make a new account now."
            end
            
          when "post"
            # the user is posting data
            found = parse_query(value)
            case ws.state
            when :playing
              if found["command_line"]
                # command was entered.  What will we do with it.
                ws.player.interpret(found["command_line"])
              end
            when :login
              if !found["user_name"] || found["user_name"].empty? ||
                 !found["user_password"] || found["user_password"].empty?
                 ws.packet "dialog", "You must enter a valid user name and password. Try again."
              else
                 user = Player.first({:name=>found["user_name"].downcase.capitalize})
                 if !user  || user.password != found["user_password"]
                   ws.packet "dialog", "Incorrect user name or password. Try again."
                 else
                   ws.player = user
                   ws.login();
                   #if (user.first_login) 
                     user.first_login = false
                     user.guider("new_player")
                     user.save
                   #end
                 end
              end
            end
           
            #ws.send JSON.generate({"dialog"=>"<div class=\"dialog\" title=\"test\"><p>" + value.make_safe_for_web_client + "</p></div>"})
          else
            puts "Unrecognized packet (#{key}) received."
          end  
        end
      end
      ws.onclose { 
        ws.logout() if ws.player
      }

    end
  end
end

set :server, %w[thin webrick]

# web server routes defined below.   
get '/' do 
  erb :client, :locals=>{:host=>request.env["SERVER_NAME"]}
end


