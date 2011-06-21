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