const extractID = require("./extractId");

function makeDownloadPage(getBlock) {
  return async function downloadPage(idOrUrl) {
    var pageId = extractID(idOrUrl);
    var rootBlock = await getBlock(pageId);

    return rootBlock;
  };
}

module.exports = makeDownloadPage;
