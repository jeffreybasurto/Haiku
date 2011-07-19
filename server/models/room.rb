# Player builds the interface between the world and the socket.
class Room
  include DataMapper::Resource
  
  property :id,         Serial
  property :vtag,       String
  property :created_at, DateTime
  property :updated_at, DateTime
  property :name,       String
  property :x,          Integer
  property :y,          Integer
  property :z,          Integer
  
  has n, :players
  has n, :exits, :child_key => [ :source_id ]
  has n, :connections, self, :through => :exits, :via => :to
  
  def Room.startup
    r = Room.first_or_create({:vtag=>"first.room"})
    r2 = Room.first_or_create({:vtag=>"second.room"})
    puts "Initialized rooms."
    
    Exit.all.destroy!
    
    e = Exit.new
    e.to = r2
    r.exits << e
    r.save!
  end

  def generate_map() 
    players.collect &:name
  end
end


