App.appController = Em.Object.create({
  campsiteDetailPage: function(info) {
    var webId = info["id"];
    // Load campsite based on the id
    var campsite = App.campsitesController.findProperty("webId", webId);
    App.appController.set("campsite", campsite);
    // Hide and unhide pages
    $('#campsites').hide();
    $('#info').hide();
    $('#campsite').show();

  },
  campsitesPage: function() {
    // Hide and unhide pages
    $('#campsite').hide();
    $('#info').hide();
    $('#campsites').show();
  },
  infoPage: function() {
    // Hide and unhide pages
    $('#campsites').hide();
    $('#campsite').hide();
    $('#info').show();
  }
});
