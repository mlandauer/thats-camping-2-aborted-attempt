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

App.CampsiteDetailPageView = Em.View.extend({
  campsiteBinding: "App.appController.campsite",
  facilitiesFields: {
    have: ["picnic tables", "wood BBQs"],
    notHave: ["toilets", "showers", "drinking water"]
  },
  facilitiesFields: function() {
    var campsite = this.get("campsite");
    var have = [];
    var notHave = [];
    if (campsite) {
      if (campsite.get('hasFlushToilets'))
        have.push("flush toilets");
      else if (campsite.get('hasNonFlushToilets'))
        have.push("non-flush toilets");
      else if (!campsite.get('toilets'))
        notHave.push("toilets");

      if (campsite.get('picnicTables'))
        have.push("picnic tables");
      else
        notHave.push("picnic tables");
      
      // TODO: show whether you need to bring your own firewood elsewhere
      // Like "You will need to bring firewood (if you want to use the wood BBQs) and drinking water"
      if (campsite.get('hasWoodBarbecues'))
        have.push("wood BBQs");
      else if (campsite.get('hasGasElectricBarbecues'))
        have.push("gas/electric BBQs");
      else if (!campsite.get('hasBarbecues'))
        notHave.push("BBQs");

      if (campsite.get('hasHotShowers'))
        have.push("hot showers");
      else if (campsite.get('hasColdShowers'))
        have.push("cold showers");
      else if (!campsite.get("hasShowers"))
        notHave.push("showers");

      if (campsite.get("drinkingWater"))
        have.push("drinking water");
      else
        notHave.push("drinking water");
    }

    return { have: have, notHave: notHave };
  }.property('campsite'),

  accessFields: function() {
    var campsite = this.get("campsite");
    var have = [];
    var notHave = [];
    if (campsite) {
      if (campsite.get('caravans'))
        have.push("caravans");
      else
        notHave.push("caravans");
      if (campsite.get('trailers'))
        have.push("trailers");
      else
        notHave.push("trailers");
      if (campsite.get('car'))
        have.push("car camping");
      else
        notHave.push("car camping");      
    }

    return { have: have, notHave: notHave };
  }.property('campsite'),

  haveFacilitiesText: function() {
    return this.listAsText(this.get('facilitiesFields')["have"]);
  }.property('facilitiesFields'),
  notHaveFacilitiesText: function() {
    return this.listAsText(this.get('facilitiesFields')["notHave"]);
  }.property('facilitiesFields'),
  haveAccessText: function() {
    return this.listAsText(this.get('accessFields')["have"]);
  }.property('accessFields'),
  notHaveAccessText: function() {
    return this.listAsText(this.get('accessFields')["notHave"]);
  }.property('accessFields'),

  listAsText: function(list) {
    if (list.length == 0) {
      return null;
    }
    else if (list.length == 1) {
      return list[0];      
    }
    else {
      return list.slice(0, -1).join(", ") + " and " + list[list.length - 1];    
    }
  }
});

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
  }.property('webId'),

  // Convenience wrappers around some of the properties
  hasFlushToilets: function() { return this.get("toilets") == "flush"; }.property('toilets'),
  hasNonFlushToilets: function() { return this.get("toilets") == "non_flush"; }.property('toilets'),
  hasToilets: function() { return this.get("toilets") != "none"; }.property('toilets'),
  hasWoodBarbecuesFirewoodSupplied: function() { return this.get("barbecues") == "wood_supplied"; }.property('barbecues'),
  hasWoodBarbecuesBringYourOwn: function() { return this.get("barbecues") == "wood_bring_your_own"; }.property('barbecues'),
  hasWoodBarbecues: function() {
    return this.get("barbecues") == "wood" || this.get("hasWoodBarbecuesFirewoodSupplied") || this.get("hasWoodBarbecuesBringYourOwn");
  }.property('barbecues', 'hasWoodBarbecuesFirewoodSupplied', 'hasWoodBarbecuesBringYourOwn'),
  hasGasElectricBarbecues: function() { return this.get("barbecues") == "gas_electric"; }.property('barbecues'),
  hasBarbecues: function() { return this.get("barbecues") != "none"; }.property('barbecues'),
  hasHotShowers: function() { return this.get("showers") == "hot"; }.property('showers'),
  hasColdShowers: function() { return this.get("showers") == "cold"; }.property('showers'),
  hasShowers: function() { return this.get("showers") != "none"; }.property('showers'),
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

