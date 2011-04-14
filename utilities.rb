class String
  def make_safe_for_web_client
    self.gsub('<', '&lt;')
    self.gsub('>', '&gt;')
    self.gsub('&', '&amp;')
  end
end