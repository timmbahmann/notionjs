const extractID = require("./extractId");
const { getBlock } = require("./getRecords");

async function downloadPage(idOrUrl) {
  var pageId = extractID(idOrUrl);
  var rootBlock = await getPageRootBlock(pageId);

  return rootBlock;
}

module.exports = downloadPage;
// ************************

async function getPageRootBlock(pageId) {
  return await getBlock(pageId);
}
