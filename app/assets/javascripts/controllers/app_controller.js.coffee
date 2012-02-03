App.appController = Em.Object.create(
  campsiteDetailPage: (info) ->
    webId = info["id"]
    # Load campsite based on the id
    campsite = App.campsitesController.findProperty("webId", webId)
    App.campsitesController.set "current", campsite
    # Hide and unhide pages
    $("#campsites").hide()
    $("#campsite").show()
    $('#park').hide()
    $("#info").hide()

  parkDetailPage: (info) ->
    park = App.parksController.findProperty("webId", info["id"])
    App.parksController.set "current", park
    # Hide and unhide pages
    $("#campsites").hide()
    $("#campsite").hide()
    $('#park').show()
    $("#info").hide()

  campsitesPage: ->
    # Hide and unhide pages
    $("#campsites").show()
    $("#campsite").hide()
    $('#park').hide()
    $("#info").hide()

  infoPage: ->
    # Hide and unhide pages
    $("#campsites").hide()
    $("#campsite").hide()
    $('#park').hide()
    $("#info").show()
)