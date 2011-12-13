#!/usr/bin/env ruby
#
# Convert plist data to json

require 'rubygems'
require 'plist'
require 'json'

def convert_plist_to_json(input, output)
  result = Plist::parse_xml(File.join(File.dirname(__FILE__), input))
  File.open(File.join(File.dirname(__FILE__), output), 'w') do |f|
    f.write(JSON.pretty_generate(result))
  end
end

convert_plist_to_json('Campsites.plist', 'campsites.json')
convert_plist_to_json('Parks.plist', 'parks.json')
