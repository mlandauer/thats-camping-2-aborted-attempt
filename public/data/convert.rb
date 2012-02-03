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

# Merge campsites and parks into one file
all_campsites = load_plist('Campsites.plist')
all_parks = load_plist('Parks.plist')

data = all_parks.map do |park|
  # Find all campsites that are in this park
  campsites = all_campsites.find_all{|campsite| campsite["parkWebId"] == park["webId"]}
  park.merge("campsites" => [campsites])
end

write_json(data, "data.json")