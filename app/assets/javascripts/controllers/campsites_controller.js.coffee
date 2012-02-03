App.campsitesController = Em.ArrayProxy.create(
  # Initialize the array controller with an empty array.
  content: []
  sortedCampsites: (->
    content = @get("content")
    campsitesWithDistance = content.filter((c) ->
      if c.get("distance")
        YES
      else
        NO
    , content)
    # If there are no campsites with distance information (i.e the user location
    # is not known) then just return a list sorted by name    
    if campsitesWithDistance.length is 0
      content.sort (a, b) ->
        shortNameA = a.get("shortName")
        shortNameB = b.get("shortName")
        if shortNameA < shortNameB
          -1
        else if shortNameA > shortNameB
          1
        else
          0
    else
      campsitesWithDistance.sort (a, b) ->
        distanceA = a.get("distance")
        distanceB = b.get("distance")
        if distanceA < distanceB
          -1
        else if distanceA > distanceB
          1
        else
          0
  ).property("@each.distance", "@each.shortName").cacheable()
  updateUserPosition: (latitude, longitude) ->
    App.userPosition.set "latitude", latitude
    App.userPosition.set "longitude", longitude

  fetchParksAndCampsites: ->
    $.ajax "/data/data.json",
      async: false
      success: (data) ->
        all_parks = []
        all_campsites = []
        data.forEach (parksItem) ->
          campsites = []
          park = App.Park.create(parksItem)
          parksItem.campsites[0].forEach (campsiteItem) ->
            campsiteItem.park = park
            campsite = App.Campsite.create(campsiteItem)
            all_campsites.push campsite
            campsites.push campsite

          park.set "campsites", campsites
          all_parks.push park

        App.campsitesController.beginPropertyChanges()
        all_campsites.forEach (campsite) ->
          App.campsitesController.pushObject campsite

        App.campsitesController.endPropertyChanges()
        App.parksController.beginPropertyChanges()
        all_parks.forEach (park) ->
          App.parksController.pushObject park

        App.parksController.endPropertyChanges()
)