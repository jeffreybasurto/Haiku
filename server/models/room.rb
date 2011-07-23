# Player builds the interface between the world and the socket.
class Room
  include DataMapper::Resource
  
  property :id,         Serial
  property :vtag,       String
  property :created_at, DateTime
  property :name,       String
  property :x,          Integer
  property :y,          Integer
  property :z,          Integer
  
  has n, :players
  has n, :exits, :child_key => [ :source_id ]
  has n, :connections, self, :through => :exits, :via => :to
  

  def create_exit(dir, towards, two_way = false)  
    exit = Exit.new
    exit.dir = dir.to_s
    exit.to = towards
    exit.source = self
    self.exits << exit
    self.save!
    towards.create_exit(get_opposite_direction(dir), self) if two_way
  end
  # create a room next to this one.
  def create_in_direction dir
    new_room = Room.create({:created_at=>Time.now, :x=>self.x, :y=>self.y, :z=>self.z})
    
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
    return new_room
  end
  
  
  def Room.startup
    Room.all.destroy!
    Chat.all.destroy!
    r = Room.first_or_create({:vtag=>"first.room", :x=>0, :y=>0, :z=>0})
    r.create_in_direction(:east)
    r_t_l = r.create_in_direction(:north).create_in_direction(:east).create_in_direction(:north).create_in_direction(:north).create_in_direction(:west).create_in_direction(:west).create_in_direction(:west).create_in_direction(:west).create_in_direction(:south).create_in_direction(:south).create_in_direction(:south)
    
    r2 = r.create_in_direction(:south)
    r_t_l2 = r2.create_in_direction(:west).create_in_direction(:south).create_in_direction(:west).create_in_direction(:west).create_in_direction(:north)
    r_t_l.create_exit(:south, r_t_l2, true)
    r2.create_in_direction(:east)
    puts "Initialized rooms."
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
      room.connections.each do |r|
        next if found[r.id]
        found[r.id] = true
        main_list << r
      end
    end
  end
 
  # A* algorithm
  def pathfind(towards)
    towards.slice!("game_element_")
    found = Room.get(Integer(towards))
    
    def calculate_h(node, found) 
      (node.x - found.x).abs + (node.y - found.y).abs + (node.z - found.z).abs
    end
    
    h = {:node=>self, :parent=>nil, :h=>calculate_h(self, found)}
    open_list_members = {self.id=>h}
    open_list = [h]
    closed_list = {}
    loop do
      break if open_list.empty?
      open_list.sort!{|x, y| x[:h] <=> y[:h]}
      current_room = open_list.pop
      closed_list[current_room[:node].id] = true
      
      current_room[:node].exits.each do |ex|
        r = ex.to
        next if closed_list[r.id] || open_list_members[r.id]
        h = {:node=>r, :parent=>current_room, :dir_to_get_here=>ex.dir, :h=>calculate_h(r, found)}
        open_list << h
        open_list_members[r.id] = h
        break if r.id == found.id
      end
    end
    # The path is clear.  Now we must backtrade the parents ot the source node.
    answer = open_list_members[found.id]
    if answer != nil
      dirs = []
      loop do
        break if !answer[:parent]
        dirs.unshift(answer[:dir_to_get_here])
        answer = answer[:parent]
      end
      return dirs
    else
      return false
    end
  end
  
  
  def generate_map 
    map = [[],[]]
    self.bfs do |r|       
      
      map[0] << ["room",r.id, r.x,r.y,r.z, [["rest", ["/sprites/grass1.png"]]], false, 
                  r.players.collect do |ch| 
                      ["pc", ch.id, ch.get_sprite_states(), "walking"]
                  end]
                  
      walls = ["north", "east", "south", "west", "up", "down"] - r.exits.collect(&:dir)

      map[1] << ["walls", r.id, walls] unless walls.empty?
    end
    return map
  end
end


