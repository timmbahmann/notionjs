// const {
//   getBlock,
//   getCollection,
//   getUser,
//   getCollectionView,
//   getSpace
// } = require("./getRecords");
// const downloadPage = require("./downloadPage");

const generatePost = require("./post");
const makeNotionMethods = require("./notionMethods");
const makeGetRecords = require("./getRecords");

class Notion {
  constructor(token_v2 = undefined) {
    this.token_v2 = token_v2 || process.env.TOKEN_V2;
    this.post = generatePost(token_v2);
    const { loadPageChunk, getRecordValues } = makeNotionMethods(this.post);
    const {
      getBlock,
      getCollection,
      getUser,
      getCollectionView,
      getSpace
    } = makeGetRecords(loadPageChunk, getRecordValues);
    const downloadPage = makeDownloadPage(getBlock);

    this.getBlock = getBlock;
    this.getCollection = getCollection;
    this.getCollectionView = getCollectionView;
    this.getSpace = getSpace;
    this.getUser = getUser;
    this.downloadPage = downloadPage;
  }
}

module.exports = Notion;
