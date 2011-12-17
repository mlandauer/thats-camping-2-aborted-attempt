#!/usr/bin/env ruby
#
# Convert plist data to json

require 'rubygems'
require 'plist'
require 'json'

def load_plist(input)
  Plist::parse_xml(File.join(File.dirname(__FILE__), input))
end

def write_json(data, output)
  File.open(File.join(File.dirname(__FILE__), output), 'w') do |f|
    f.write(JSON.pretty_generate(data))
  end
end

def convert_plist_to_json(input, output)
  write_json(load_plist(input), output)
end

convert_plist_to_json('Campsites.plist', 'campsites.json')
convert_plist_to_json('Parks.plist', 'parks.json')
