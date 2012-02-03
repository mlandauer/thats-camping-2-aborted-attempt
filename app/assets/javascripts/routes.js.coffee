#= require 'sproutcore-routing'

SC.routes.add "campsite/:id", App.appController, "campsiteDetailPage"
SC.routes.add "", App.appController, "campsitesPage"
SC.routes.add "info", App.appController, "infoPage"