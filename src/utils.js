function Capitalize(val) {
  return `${val.substring(0, 1).toUpperCase()}${val.substring(1)}`
}
function CamelCase(val) {
  return Capitalize(
    val.replace(/-([a-z])/g, function(g) {
      return g[1].toUpperCase()
    }),
  )
}

function hasTrailingSlash(val) {
  return val.substring(val.length - 1) === '/'
}

module.exports = {
  Capitalize,
  CamelCase,
  hasTrailingSlash,
}
