class String
  def make_safe_for_web_client
    self.gsub('<', '&lt;')
    self.gsub('>', '&gt;')
    self.gsub('&', '&amp;')
  end
end

def parse_query(qs, d = '&;')
  params = {}

  (qs || '').split(/[#{d}] */n).each do |p|
    k, v = p.split('=', 2)

    if cur = params[k]
      if cur.class == Array
        params[k] << v
      else
        params[k] = [cur, v]
      end
    else
      params[k] = v
    end
  end
  return params
end

def get_opposite_direction dir
  case dir
  when "north",:north, 0
    :south
  when "east", :east, 1
    :west
  when "south",:south, 2
    :north
  when "west",:west, 3
    :east
  when "up",:up, 4
    :down
  when "down",:down, 5
    :up
  end
end