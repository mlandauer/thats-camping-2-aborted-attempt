window.onload = ->
  startPos = undefined
  navigator.geolocation.getCurrentPosition ((position) ->
    startPos = position
    App.campsitesController.updateUserPosition startPos.coords.latitude, startPos.coords.longitude
  ), (error) ->
    alert "Error occurred. Error code: " + error.code

  # Continue watching the position continuously
  navigator.geolocation.watchPosition (position) ->
    App.campsitesController.updateUserPosition position.coords.latitude, position.coords.longitude

  App.campsitesController.fetchParksAndCampsites()