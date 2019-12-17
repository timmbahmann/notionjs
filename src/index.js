const {
  getBlock,
  getCollection,
  getUser,
  getCollectionView,
  getSpace
} = require("./getRecords");
const downloadPage = require("./downloadPage");

function Notion() {}

Notion.prototype.getBlock = getBlock;
Notion.prototype.getCollection = getCollection;
Notion.prototype.getCollectionView = getCollectionView;
Notion.prototype.getSpace = getSpace;
Notion.prototype.getUser = getUser;
Notion.prototype.downloadPage = downloadPage;

module.exports = Notion;
