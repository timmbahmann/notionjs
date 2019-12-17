const post = require("./post");

async function getRecordValues(...records) {
  var { data } =
    (await post("getRecordValues", {
      requests: records
    })) || {};
  var { results } = data;
  return results;
}

async function loadPageChunk(pageId) {
  var { data } = (await post("loadPageChunk", { pageId })) || {};
  var { recordMap } = data;
  return recordMap;
}

module.exports = { getRecordValues, loadPageChunk };
