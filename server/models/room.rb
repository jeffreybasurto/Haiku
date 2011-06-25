# Player builds the interface between the world and the socket.
class Room
  include DataMapper::Resource
  
  property :id,         Serial
  property :vtag,       String
  property :created_at, DateTime
  property :updated_at, DateTime
  property :name,       String
  
  attr_accessor :people
  def people
    @people ||= []
  end
  
  def Room.startup
    Room.first_or_create({:vtag=>"first.room"})
    puts "Initialized rooms."
  end
end