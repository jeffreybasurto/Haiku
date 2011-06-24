# Player builds the interface between the world and the socket.
class Player
  include DataMapper::Resource
  
  property :id,         Serial
  property :created_at, DateTime
  property :name,       String
  property :password,   String
  property :first_login, Boolean, :default  => true
  
  attr_accessor :socket, :prefix
  def prefix
    @prefix || "say"
  end
  def packet type, data
    @socket.packet(type, data) if @socket
  end
  
  class << self; attr_accessor :connected; end
  
  def self.connected
    @connected ||= [] 
  end
  # in game communication of some kind.
  def communicate value
    Player.connected.each { |p| 
      p.packet("chat", "<span class=\"say\">#{name}: #{value.make_safe_for_web_client()}</span>") 
    }  
  end
  def guider str
    packet "guider", str
  end
  # in the future you might have some sort of command table here to check against.
  def interpret str
    str.lstrip!
    args = str.split(" ")
    case args[0]
    when "say"
      communicate args[1..-1].join(" ")
      self.prefix = "say"
      return;
    else
      if self.prefix 
        interpret(self.prefix + " "+ args.join(" "))
      else
        packet "dialog", "command not found: #{args[0]}"
      end
    end
  end
  
  def info_span
    "<span class=\"who_element\" id=\"player#{self.id}\">#{self.name}</span>"
  end

  def do_who
    list = ""
    
    Player.connected.each do |p|
      list << p.info_span
    end
    self.packet("who", list)
  end
  
end