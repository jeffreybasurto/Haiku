class Exit
  include DataMapper::Resource
  belongs_to :source, 'Room', :key => true
  belongs_to :to, 'Room', :key => true
end