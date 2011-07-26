# Player builds the interface between the world and the socket.
class Player
  include DataMapper::Resource
  
  property :id,         Serial
  property :created_at, DateTime
  property :name,       String
  property :password,   String
  property :first_login, Boolean, :default  => true
  
  has n, :chats
  belongs_to :room, :required=>false
  
  attr_accessor :socket, :prefix
  
  def prefix
    @prefix || "say"
  end

  def packet type, data
    @socket.packet(type, data) if @socket
  end
  
  class << self; attr_accessor :connected; end
  
  def self.connected
    @connected ||= [] 
  end

  # in game communication of some kind.
  def communicate value
    c = Chat.new
    c.created_at = Time.now
    c.message = value
    self.chats << c
    Player.connected.each { |p| 
      p.packet("say", [self.id, "#{value.make_safe_for_web_client()}"]) 
    }
    c.save
    self.save
  end
  def do_test
    found = []
    Chat.all.each do |c|
      found << "[" + c.created_at.to_s + "] " + c.player.name + ": " + c.message
    end
    self.packet("dialog", found.join("<br>"))
  end
  
  def do_random
    packet("dialog", "<div class='outter-random-interface'><div class=\"random-interface\">#{rand(100)}</div></div>");
  end
  
  def guider str
    packet "guider", str
  end
  # in the future you might have some sort of command table here to check against.
  def interpret str
    str.lstrip!
    args = str.split(" ")
    case args[0]
    when "random"
      do_random();
    when "test"
      do_test();
    when "look"
      do_look();
    when "north"
      move(:north)
    when "east"
      move(:east)
    when "south"
      move(:south)
    when "west"
      move(:west)
    when "who"
      #packet "dialog", "<div id=\"who\"></div>"
      do_who
    when "say"
      communicate args[1..-1].join(" ")
      self.prefix = "say"
    when "quit"
      self.prefix = ""
      do_quit
    else
      if self.prefix 
        interpret(self.prefix + " "+ args.join(" "))
      else
        packet "dialog", "command not found: #{args[0]}"
      end
    end
  end
  
  def info_span
    "<span class=\"who_element\" id=\"player#{self.id}\">#{self.name}</span>"
  end

  # this should be dynamic in the future, but for now it's the same for all.
  def get_sprite_states()
    [
      ["walking", ["/sprites/moogle_s_w0.png", "/sprites/moogle_s_w1.png"]],
      ["alert", ["/sprites/moogle_s_alert0.png"]]
    ]
  end

  def move dir
    exit =  self.room.find_exit(dir)
    if !exit
      self.packet("sound", "bounce")
      Player.connected.each { |p| p.packet("sprite_state", [self.id, "alert", 1000])}
    else
      exit.to.players << self
      exit.to.save
      # just update this player for everyone.
      graph = [self.id, self.room.id, dir]
      Player.connected.each { |p| p.packet("mv", graph) }
      self.packet("pan", [dir, 1])
    end    
  end

  def do_look
    graph = self.room.generate_map();

    self.packet("map",graph)
    self.packet("center", [self.room.x, self.room.y]);
  end

  def do_quit
    self.socket.logout();
  end

  def do_who
    list = ""
    
    Player.connected.each do |p|
      list << p.info_span
    end
    self.packet("who", list)
  end
  
  def info str
    packet("chat", "<span class=\"info\"><img src=\"horn-icon.png\" alt=\"announcement\"> #{str}</span>")
  end
end