function hasDash(id) {
  const idRegex = new RegExp(
    /^[a-z,0-9]{8}-[a-z,0-9]{4}-[a-z,0-9]{4}-[a-z,0-9]{4}-[a-z,0-9]{12}$/g
  )
  return idRegex.test(id)
}

function hasNoDash(id) {
  const idRegex = new RegExp(
    /^[a-z,0-9]{8}[a-z,0-9]{4}[a-z,0-9]{4}[a-z,0-9]{4}[a-z,0-9]{12}$/g
  )
  return idRegex.test(id)
}

function toDash(id) {
  if (hasDash(id)) {
    return id
  }
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(
    16,
    20
  )}-${id.slice(20)}`
}

function toNoDash(id) {
  if (hasNoDash(id)) {
    return id
  }
  return id.replace(/-/g, '')
}

function idFromUrl(url, { withDash = true } = {}) {
  var id = url.slice(-32)
  return withDash ? toDash(id) : toNoDash(id)
}

export default function extractID(urlOrID, { withDash = true } = {}) {
  if (hasDash(urlOrID) || hasNoDash(urlOrID)) {
    return withDash ? toDash(urlOrID) : toNoDash(urlOrID)
  }
  return idFromUrl(urlOrID, { withDash })
}
