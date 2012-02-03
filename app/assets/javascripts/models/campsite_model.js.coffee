calculateDistance = (lat1, lon1, lat2, lon2) ->
  R = 6371000
  dLat = (lat2 - lat1).toRad()
  dLon = (lon2 - lon1).toRad()
  a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  d = R * c
  d

# Bearing (as an angle) to this campsite from the given location
calculateBearing = (lat1, lon1, lat2, lon2) ->
  lon1 = lon1.toRad()
  lat1 = lat1.toRad()
  lon2 = lon2.toRad()
  lat2 = lat2.toRad()
  dLon = lon2 - lon1
  y = Math.sin(dLon) * Math.cos(lat2)
  x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  # This is a number between 0 and 360
  bearing = (Math.atan2(y, x).toDeg() + 360.0) % 360
  bearing

Number::toRad = ->
  this * Math.PI / 180

Number::toDeg = ->
  this * 180 / Math.PI

App.Campsite = Em.Object.extend(
  # null values mean unknown
  shortName: null
  longName: null
  latitude: null
  longitude: null
  webId: null
  parkWebId: null
  toilets: null
  picnicTables: null
  barbecues: null
  showers: null
  drinkingWater: null
  caravans: null
  trailers: null
  car: null
  description: null

  # TODO: Should move to a view
  distanceAndBearingText: (->
    @get("distanceText") + " " + @get("bearingText")
  ).property("distanceText", "bearingText")

  distanceText: (->
    distance = @get("distance")
    units = undefined
    return ""  if distance == null
    if distance > 1000
      distance /= 1000
      units = "km"
    else
      units = "m"
    distance.toFixed(0) + " " + units
  ).property("distance")

  bearingText: (->
    bearing = @get("bearing")
    return ""  if bearing == null
    # Dividing the compass into 8 sectors that are centred on north
    sector = Math.floor(((bearing + 22.5) % 360.0) / 45.0)
    sectorNames = [ "N", "NE", "E", "SE", "S", "SW", "W", "NW" ]
    sectorNames[sector]
  ).property("bearing")

  bearing: (->
    userLatitude = @get("userLatitude")
    userLongitude = @get("userLongitude")
    latitude = @get("latitude")
    longitude = @get("longitude")
    if userLatitude and userLongitude and latitude and longitude
      return calculateBearing(userLatitude, userLongitude, latitude, longitude)
    else
      null
  ).property("userLatitude", "userLongitude", "latitude", "longitude")

  userLatitudeBinding: "App.userPosition.latitude"
  userLongitudeBinding: "App.userPosition.longitude"

  distance: (->
    userLatitude = @get("userLatitude")
    userLongitude = @get("userLongitude")
    latitude = @get("latitude")
    longitude = @get("longitude")
    if userLatitude and userLongitude and latitude and longitude
      distance = calculateDistance(userLatitude, userLongitude, latitude, longitude)
      distance
    else
      null
  ).property("userLatitude", "userLongitude", "latitude", "longitude")

  parkShortName: (->
    @get("park").get "shortName"
  ).property("park")

  campsiteUrl: (->
    webId = @get("webId")
    "#campsite/" + webId
  ).property("webId")

  # Convenience wrappers around some of the properties
  hasFlushToilets: (-> @get("toilets") == "flush").property("toilets")
  hasNonFlushToilets: (-> @get("toilets") == "non_flush").property("toilets")
  hasToilets: (-> @get("toilets") != "none").property("toilets")
  hasWoodBarbecuesFirewoodSupplied: (-> @get("barbecues") == "wood_supplied").property("barbecues")
  hasWoodBarbecuesBringYourOwn: (-> @get("barbecues") == "wood_bring_your_own").property("barbecues")
  hasWoodBarbecues: (->
    @get("barbecues") == "wood" or @get("hasWoodBarbecuesFirewoodSupplied") or @get("hasWoodBarbecuesBringYourOwn")
  ).property("barbecues", "hasWoodBarbecuesFirewoodSupplied", "hasWoodBarbecuesBringYourOwn")
  hasGasElectricBarbecues: (-> @get("barbecues") == "gas_electric").property("barbecues")
  hasBarbecues: (-> @get("barbecues") != "none").property("barbecues")
  hasHotShowers: (-> @get("showers") == "hot").property("showers")
  hasColdShowers: (-> @get("showers") == "cold").property("showers")
  hasShowers: (-> @get("showers") != "none").property("showers")
)