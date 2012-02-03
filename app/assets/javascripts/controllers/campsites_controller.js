App.campsitesController = Em.ArrayProxy.create({
  // Initialize the array controller with an empty array.
  content: [],

  sortedCampsites: function() {
    var content = this.get('content');
    var campsitesWithDistance = content.filter(function(c) {
      if (c.get("distance")) {
        return YES;
      }
      else {
        return NO;
      }
    }, content);
    // If there are no campsites with distance information (i.e the user location
    // is not known) then just return a list sorted by name
    if (campsitesWithDistance.length == 0) {
      return content.sort(function(a, b) {
        var shortNameA = a.get('shortName'), shortNameB = b.get('shortName');
        if (shortNameA < shortNameB) {
          return -1;
        }
        else if (shortNameA > shortNameB) {
          return 1;
        }
        else {
          return 0;
        }
      });
    }
    else {
      return campsitesWithDistance.sort(function(a, b) {
        var distanceA = a.get('distance'),
            distanceB = b.get('distance');

        if (distanceA < distanceB) {
          return -1;
        }
        else if (distanceA > distanceB) {
          return 1;
        }
        else {
          return 0
        }
      });      
    }
  }.property('@each.distance', '@each.shortName').cacheable(),

  updateUserPosition: function(latitude, longitude) {
    App.userPosition.set('latitude', latitude);
    App.userPosition.set('longitude', longitude);
  },

  fetchParksAndCampsites: function(){
    $.ajax('/data/data.json', {
      async: false,
      success: function(data){
        var all_parks = [];
        var all_campsites = [];

        data.forEach(function(parksItem){
          var campsites = [];
          park = App.Park.create(parksItem);
          parksItem.campsites[0].forEach(function(campsiteItem){
            campsiteItem.park = park;
            var campsite = App.Campsite.create(campsiteItem);
            all_campsites.push(campsite);
            campsites.push(campsite);
          });
          park.set("campsites", campsites);
          all_parks.push(park);
        });

        App.campsitesController.beginPropertyChanges();
        all_campsites.forEach(function(campsite){
          App.campsitesController.pushObject(campsite);
        });
        App.campsitesController.endPropertyChanges();
        App.campsitesController.beginPropertyChanges();
        all_parks.forEach(function(park){
          App.parksController.pushObject(park);
        });
        App.parksController.endPropertyChanges();
      }
    });
  }
});
