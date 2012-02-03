App.appController = Em.Object.create(
  campsiteDetailPage: (info) ->
    webId = info["id"]
    # Load campsite based on the id
    campsite = App.campsitesController.findProperty("webId", webId)
    App.campsitesController.set "current", campsite
    # Hide and unhide pages
    $("#campsites").hide()
    $("#info").hide()
    $("#campsite").show()

  campsitesPage: ->
    # Hide and unhide pages
    $("#campsite").hide()
    $("#info").hide()
    $("#campsites").show()

  infoPage: ->
    # Hide and unhide pages
    $("#campsites").hide()
    $("#campsite").hide()
    $("#info").show()
)