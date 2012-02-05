App.Park = Em.Object.extend(
  path: (-> "#park/" + @get("webId")).property("webId")
  html_description: (->
    description = @get("description")
    "<p>" + description.replace("\n\n", "</p><p>") + "</p>"
  ).property("description")
)
