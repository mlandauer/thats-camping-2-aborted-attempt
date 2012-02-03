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
  },

  userLatitudeBinding: 'campsite.userLatitude',
  userLongitudeBinding: 'campsite.userLongitude',
  mapUrl: function() {
    campsite = this.get('campsite');
    userLongitude = this.get('userLongitude');
    userLatitude = this.get('userLatitude');
    if (campsite && userLongitude && userLatitude) {
      return "http://maps.google.com/maps?saddr=you+are+here@" + userLatitude + "," + userLongitude + "&daddr=" +
        campsite.get("shortName") + "@" + campsite.get('latitude') + "," + campsite.get('longitude') + ")";
    }
  }.property('campsite', 'userLatitude', 'userLongitude')
});

