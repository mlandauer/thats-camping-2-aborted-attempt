App.CampsiteDetailPageView = Em.View.extend(
  campsiteBinding: "App.appController.campsite"

  facilitiesFields: (->
    campsite = @get("campsite")
    have = []
    notHave = []
    if campsite
      if campsite.get("hasFlushToilets")
        have.push "flush toilets"
      else if campsite.get("hasNonFlushToilets")
        have.push "non-flush toilets"
      else notHave.push "toilets"  unless campsite.get("toilets")
      if campsite.get("picnicTables")
        have.push "picnic tables"
      else
        notHave.push "picnic tables"

      # TODO: show whether you need to bring your own firewood elsewhere
      # Like "You will need to bring firewood (if you want to use the wood BBQs) and drinking water"
      if campsite.get("hasWoodBarbecues")
        have.push "wood BBQs"
      else if campsite.get("hasGasElectricBarbecues")
        have.push "gas/electric BBQs"
      else notHave.push "BBQs"  unless campsite.get("hasBarbecues")
      if campsite.get("hasHotShowers")
        have.push "hot showers"
      else if campsite.get("hasColdShowers")
        have.push "cold showers"
      else notHave.push "showers"  unless campsite.get("hasShowers")
      if campsite.get("drinkingWater")
        have.push "drinking water"
      else
        notHave.push "drinking water"
    have: have
    notHave: notHave
  ).property("campsite")
  accessFields: (->
    campsite = @get("campsite")
    have = []
    notHave = []
    if campsite
      if campsite.get("caravans")
        have.push "caravans"
      else
        notHave.push "caravans"
      if campsite.get("trailers")
        have.push "trailers"
      else
        notHave.push "trailers"
      if campsite.get("car")
        have.push "car camping"
      else
        notHave.push "car camping"
    have: have
    notHave: notHave
  ).property("campsite")
  haveFacilitiesText: (->
    @listAsText @get("facilitiesFields")["have"]
  ).property("facilitiesFields")
  notHaveFacilitiesText: (->
    @listAsText @get("facilitiesFields")["notHave"]
  ).property("facilitiesFields")
  haveAccessText: (->
    @listAsText @get("accessFields")["have"]
  ).property("accessFields")
  notHaveAccessText: (->
    @listAsText @get("accessFields")["notHave"]
  ).property("accessFields")
  listAsText: (list) ->
    if list.length is 0
      null
    else if list.length is 1
      list[0]
    else
      list.slice(0, -1).join(", ") + " and " + list[list.length - 1]

  userLatitudeBinding: "campsite.userLatitude"
  userLongitudeBinding: "campsite.userLongitude"
  mapUrl: (->
    campsite = @get("campsite")
    userLongitude = @get("userLongitude")
    userLatitude = @get("userLatitude")
    "http://maps.google.com/maps?saddr=you+are+here@" + userLatitude + "," + userLongitude + "&daddr=" + campsite.get("shortName") + "@" + campsite.get("latitude") + "," + campsite.get("longitude") + ")"  if campsite and userLongitude and userLatitude
  ).property("campsite", "userLatitude", "userLongitude")
)