# Player builds the interface between the world and the socket.
class Room
  include DataMapper::Resource
  
  property :id,         Serial
  property :created_at, DateTime
  property :updated_at, DateTime
  property :name,       String
end