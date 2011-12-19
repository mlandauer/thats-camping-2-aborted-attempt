var App = Em.Application.create();

App.appController = Em.Object.create({
  campsiteDetailPage: function(eventType, matchObj) {
    var webId = App.router.getParams(matchObj[1])["id"];
    console.log("campsiteDetailPage webId", webId);
    // Load campsite based on the id
    var campsite = App.campsitesController.findProperty("webId", webId);
    console.log("campsiteDetailPage campsite", campsite);
    App.appController.set("campsite", campsite);
  },
  campsitesPage: function() {
    console.log("campsitesPage");
  }
});

App.router = new $.mobile.Router([
  { "#campsites$": "campsitesPage" },
  { "#campsite([?].*)?$": "campsiteDetailPage" },
], App.appController);

App.parksController = Em.ArrayProxy.create();

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
  }.property('@each.distance').cacheable(),

  updateUserPosition: function(latitude, longitude) {
    App.userPosition.set('latitude', latitude);
    App.userPosition.set('longitude', longitude);
  },

  fetchParksAndCampsites: function(){
    $.ajax('/data/data.json', {
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

App.CampsiteView = Ember.View.extend({
  didInsertElement: function() {
    // VERY DUMB and slow - gets called on every single insert of a campsite into the DOM
    $('#campsites ul').listview('refresh');
  }
});

App.CampsitesView = Em.CollectionView.extend({
  attributeBindings: ['data-role'],
  'data-role': 'listview',
  itemViewClass: App.CampsiteView
});


view = Em.View.create({
  templateName: 'campsites', 
  didInsertElement: function() {
    $('#campsites ul').listview();
  },
  contentBinding: 'App.campsitesController.sortedCampsites'
});

App.userPosition = Em.Object.create({
  latitude: null,
  longitude: null  
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371000; // m
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad(); 
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d;
}

Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}
Number.prototype.toDeg = function() {
  return this * 180 / Math.PI;
}

// Bearing (as an angle) to this campsite from the given location
function calculateBearing(lat1, lon1, lat2, lon2) {
  lon1 = lon1.toRad();
  lat1 = lat1.toRad();
  lon2 = lon2.toRad();
  lat2 = lat2.toRad();
  var dLon = lon2 - lon1;

  var y = Math.sin(dLon) * Math.cos(lat2);
  var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  // This is a number between 0 and 360
  var bearing = (Math.atan2(y, x).toDeg() + 360.0) % 360;
  return bearing;
}

App.Park = Em.Object.extend();

App.Campsite = Em.Object.extend({
  /* null values mean unknown */
  shortName: null,
  longName: null,
  latitude: null,
  longitude: null,
  webId: null,
  parkWebId: null,
  toilets: null,
  picnicTables: null,
  barbecues: null,
  showers: null,
  drinkingWater: null,
  caravans: null,
  trailers: null,
  car: null,
  description: null,

  // TODO: Should move to a view
  distanceAndBearingText: function() {
    return this.get("distanceText") + " " + this.get("bearingText");
  }.property('distanceText', 'bearingText'),

  distanceText: function() {
    var distance = this.get('distance');
    var units;
    if (distance === null)
      return "";

    if (distance > 1000) {
      distance /= 1000;
      units = "km";
    }
    else {
      units = "m"
    }
    return distance.toFixed(0) + " " + units;
  }.property('distance'),

  bearingText: function() {
    var bearing = this.get('bearing');
    if (bearing === null)
      return "";

    // Dividing the compass into 8 sectors that are centred on north
    var sector = Math.floor(((bearing + 22.5) % 360.0) / 45.0);
    var sectorNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return sectorNames[sector];  
  }.property('bearing'),

  bearing: function() {
    var userLatitude = this.get('userLatitude');
    var userLongitude = this.get('userLongitude');
    var latitude = this.get('latitude');
    var longitude = this.get('longitude');
    if (userLatitude && userLongitude && latitude && longitude) {
      return calculateBearing(userLatitude, userLongitude, latitude, longitude);;      
    }
    else {
      return null;      
    }    
  }.property('userLatitude', 'userLongitude', 'latitude', 'longitude'),

  userLatitudeBinding: 'App.userPosition.latitude',
  userLongitudeBinding: 'App.userPosition.longitude',
  distance: function() {
    var userLatitude = this.get('userLatitude');
    var userLongitude = this.get('userLongitude');
    var latitude = this.get('latitude');
    var longitude = this.get('longitude');
    if (userLatitude && userLongitude && latitude && longitude) {
      distance = calculateDistance(userLatitude, userLongitude, latitude, longitude);
      return distance;      
    }
    else {
      return null;      
    }
  }.property('userLatitude', 'userLongitude', 'latitude', 'longitude'),

  parkShortName: function() {
    return this.get("park").get("shortName");
  }.property('park'),

  campsiteUrl: function() {
    var webId = this.get("webId");
    return "#campsite?id=" + webId;
  }.property('webId')
});

// check for Geolocation support
if (navigator.geolocation) {
  console.log('Geolocation is supported!');
}
else {
  console.log('Geolocation is not supported for this Browser/OS version yet.');
}

window.onload = function() {
  var startPos;
  navigator.geolocation.getCurrentPosition(function(position) {
    startPos = position;
    App.campsitesController.updateUserPosition(startPos.coords.latitude, startPos.coords.longitude);
  }, function(error) {
    alert('Error occurred. Error code: ' + error.code);
  });
  // Continue watching the position continuously
  navigator.geolocation.watchPosition(function(position) {
    App.campsitesController.updateUserPosition(position.coords.latitude, position.coords.longitude);
  });
};

App.campsitesController.fetchParksAndCampsites();
view.appendTo('#campsites div[data-role="content"]');

