class String
  def make_safe_for_web_client
    self.replace('<', '&lt;')
    self.replace('>', '&gt;')
    self.replace('&', '&amp;')
  end
end