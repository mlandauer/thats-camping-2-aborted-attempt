var App = Em.Application.create();

App.campsitesController = Em.ArrayProxy.create({
  // Initialize the array controller with an empty array.
  content: [],
  updateUserPosition: function(latitude, longitude) {
    App.userPosition.set('latitude', latitude);
    App.userPosition.set('longitude', longitude);
  },
});

view = Em.View.create({
  templateName: 'campsites', 
  didInsertElement: function() {
    $('ul').listview();
  },
  contentBinding: 'App.campsitesController.content'
});

view.appendTo('div[data-role="content"]');

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
    // Dividing the compass into 8 sectors that are centred on north
    var sector = Math.floor(((this.get('bearing') + 22.5) % 360.0) / 45.0);
    var sectorNames = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return sectorNames[sector];  
  }.property('bearing'),

  bearing: function() {
    var userLatitude = this.get('userLatitude');
    var userLongitude = this.get('userLongitude');
    if (userLatitude && userLongitude) {
      return calculateBearing(userLatitude, userLongitude, this.get('latitude'), this.get('longitude'));;      
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
    if (userLatitude && userLongitude) {
      distance = calculateDistance(userLatitude, userLongitude, this.get('latitude'), this.get('longitude'));
      return distance;      
    }
    else {
      return null;      
    }
  }.property('userLatitude', 'userLongitude', 'latitude', 'longitude')
});

c1 = App.Campsite.create({
  shortName: "Acacia Flat",
  longName: "Acacia Flat",
  latitude: -33.6149,
  longitude: 150.3553,
  webId: "c20080416100015976",
  parkWebId: "N0004",
  toilets: "non_flush",
  picnicTables: false,
  barbecues: "wood",
  showers: "none",
  drinkingWater: false,
  caravans: false,
  trailers: false,
  car: false,
  description: "Explore the \"cradle of conservation\", the Blue Gum Forest. Enjoy birdwatching, long walks and plenty of photogenic flora."
});

c2 = App.Campsite.create({
  shortName: "Aragunnu",
  longName: "Aragunnu campground",
  latitude: -36.585,
  longitude: 150.0419,
  webId: "c20080416100011852",
  parkWebId: "N0021",
  toilets: "non_flush",
  picnicTables: false,
  barbecues: "wood",
  showers: "none",
  drinkingWater: false,
  caravans: false,
  trailers: true,
  car: true,
  description: ""
});

App.campsitesController.pushObject(c1);
App.campsitesController.pushObject(c2);

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
    App.campsitesController.updateUserPosition(startPos.coords.latitude, startPos.coords.longitude);
  });
};

