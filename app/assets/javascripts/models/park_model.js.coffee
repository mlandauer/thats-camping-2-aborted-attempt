App.Park = Em.Object.extend(
  path: (-> "#park/" + @get("webId")).property("webId")
)
