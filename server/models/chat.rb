# Player builds the interface between the world and the socket.
class Chat
  include DataMapper::Resource
  
  property :id,         Serial
  property :created_at, DateTime
  property :updated_at, DateTime

  property :message,    String
 
  belongs_to :player
end
