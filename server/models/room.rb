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
  

  def create_exit(dir, towards, two_way = false)  
    exit = Exit.new
    exit.dir = dir
    exit.to = towards
    exit.source = self
    self.exits << exit
    self.save!
    towards.create_exit(get_opposite_direction(dir), self) if two_way
  end
  # create a room next to this one.
  def create_in_direction dir
    new_room = Room.create({:x=>self.x, :y=>self.y, :z=>self.z})
    
    case dir
    when "north",:north, 0
      new_room.y += 1
    when "east", :east, 1
      new_room.x += 1
    when "south",:south, 2
      new_room.y -= 1
    when "west",:west, 3
      new_room.x -= 1
    when "up",:up, 4
      new_room.y += 1
    when "down",:down, 5
      new_room.y -= 1
    end
    
    create_exit(dir, new_room, true) # two way exit
  end
  
  
  def Room.startup
    Room.all.destroy!
    r = Room.first_or_create({:vtag=>"first.room", :x=>0, :y=>0, :z=>0})
    r2 = r.create_in_direction(:east)
    puts "Initialized rooms."
    r.connections.each { |room| pp room }
  end

  def find_exit(dir)
    targets = [self.x, self.y, self.z]
    case dir
    when :north, "north", 0
      targets[1] += 1
    when :east, "east", 1
      targets[0] += 1
    when :south, "south", 2
      targets[1] -= 1
    when :west, "west", 3
      targets[0] -= 1
    when :up, "up", 4
      targets[2] += 1
    when :down, "down", 5
      targets[2] -= 1
    end
    
    exits.each do |ex|
      return ex if ex.to.x == targets[0] && ex.to.y == targets[1] && ex.to.z == targets[2]
    end
    return nil
  end

  def bfs
    main_list = [self]
    found = {self.id=>true}
    
    loop do 
      break if main_list.empty?
      room = main_list.pop
      yield room
      self.connections.each do |r|
        next if found[r.id]
        found[r.id] = true
        main_list << r
      end
    end
  end

  def generate_map 
    map = [[],[]]
    self.bfs do |r| 
      map[0] << ["room",r.id, r.x,r.y,r.z, [["rest", ["/sprites/grass1.png"]]], false]
      if r.players.length > 1
        map[1] << ["count", r.id, r.players.length]
      end
      r.players.each do |ch|
        map[0] << ["pc", ch.id, ch.room.x, ch.room.y, ch.room.z, 
          [["walking", ["/sprites/moogle_s_w0.png",
                        "/sprites/moogle_s_w1.png"]]], "walking"]
      end
      
    end
    return map
  end
end


