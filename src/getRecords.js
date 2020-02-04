import extractID from './extractId'
import { getRecordValues, loadPageChunk } from './notionMethods'

// ****************************

function getRecord({ table, id }) {
  if (table == 'block') {
    return loadPageChunk(id)
  } else {
    return getRecordValues({ table, id })
  }
}

export async function getBlock(urlOrID) {
  var blockID = extractID(urlOrID)
  var block = await getRecord({ table: 'block', id: blockID })
  return block ? block : new Error(`Block with ID:${blockID} not found.`)
}

export async function getCollection(urlOrID) {
  var collectionID = extractID(urlOrID)
  var collection = await getRecord({ table: 'collection', id: collectionID })
  return collection
    ? collection
    : new Error(`Collection with ID:${collectionID} not found.`)
}

export async function getSpace(urlOrID) {
  var spaceID = extractID(urlOrID)
  var space = await getRecord({ table: 'space', id: spaceID })
  return space ? space : new Error(`Space with ID: ${spaceID} not found.`)
}

export async function getUser(urlOrID) {
  var userID = extractID(urlOrID)
  var user = await getRecord({ table: 'notion_user', id: userID })
  return user ? user : new Error(`User with ID: ${userID} not found.`)
}

export async function getCollectionView(
  viewUrlorId,
  collectionIdorUrl = undefined
) {
  if (viewUrlorId.startsWith('http')) {
    const viewRegex = new RegExp(/([a-f0-9]{32})\?v=([a-f0-9]{32})/)
    const match = viewRegex.exec(viewUrlorId)
    if (!match) {
      return new Error(`The view url ${viewUrlOrId} is invalid.`)
    }
    var [_, collectionID, viewID] = match
    return await getRecord({ table: 'collection_view', id: extractID(viewID) })
  }
}
