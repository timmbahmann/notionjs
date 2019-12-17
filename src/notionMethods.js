function makeNotionMethods(post) {
  return {
    getRecordValues: async function getRecordValues(...records) {
      var { data } =
        (await post("getRecordValues", {
          requests: records
        })) || {};
      var { results } = data;
      return results;
    },
    loadPageChunk: async function loadPageChunk(pageId) {
      var { data } = (await post("loadPageChunk", { pageId })) || {};
      var { recordMap } = data;
      return recordMap;
    }
  };
}

module.exports = makeNotionMethods;
