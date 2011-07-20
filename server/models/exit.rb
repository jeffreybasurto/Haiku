class Exit
  include DataMapper::Resource
  property :dir, String
  belongs_to :source, 'Room', :key => true
  belongs_to :to, 'Room', :key => true
end