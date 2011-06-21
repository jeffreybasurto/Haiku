# Player builds the interface between the world and the socket.
class Player
  include DataMapper::Resource
  
  property :id,         Serial
  property :created_at, DateTime
  
  attr_accessor :socket

  def Player.list
    @list ||= []
  end

  def Player.connected
    Player.list
  end
  
  def initialize
    Player.list << self
    
    # verbs .. ugly for now, but we'll change later TODO
    @verbs = {:say=>proc {|value| self.communicate(value) }} # Take the value from the packet "say" and pass it to communicate.
  end
    
    
  def send data
    @socket.send(data) if @socket
  end
  
  # in game communication of some kind.
  def communicate value
    Player.connected.each { |p| p.send(value) }  
  end
end