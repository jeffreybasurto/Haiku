# Player builds the interface between the world and the socket.
class Player
  include DataMapper::Resource
  
  property :id,         Serial
  property :created_at, DateTime
  property :name,       String
  property :password,   String
  
  attr_accessor :socket
    
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
      p.packet("scrollback", "#{name} says, '#{value}'") 
    }  
  end
  
  # in the future you might have some sort of command table here to check against.
  def interpret str
    str.lstrip!
    args = str.split(" ")
    case args[0]
    when "say"
      communicate args[1..-1].join(" ")
    end
  end
end