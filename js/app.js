var App = Em.Application.create();

App.campsitesController = Em.ArrayProxy.create({
  // Initialize the array controller with an empty array.
  content: [] 
});

view = Em.View.create({
  templateName: 'campsites', 
  didInsertElement: function() {
    $('ul').listview();
  },
  contentBinding: 'App.campsitesController.content'
});

view.appendTo('div[data-role="content"]');

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
  description: null
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
