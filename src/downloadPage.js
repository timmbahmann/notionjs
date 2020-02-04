import extractID from './extractId'
import { getBlock } from './getRecords'

export default async function downloadPage(idOrUrl) {
  var pageId = extractID(idOrUrl)
  var rootBlock = await getPageRootBlock(pageId)

  return rootBlock
}
// ************************

async function getPageRootBlock(pageId) {
  return await getBlock(pageId)
}
