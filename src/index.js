import {
  getBlock,
  getCollection,
  getUser,
  getCollectionView,
  getSpace
} from './getRecords'
import downloadPage from './downloadPage'
import { queryCollection } from './notionMethods'

function Notion() {}

Notion.prototype.getBlock = getBlock
Notion.prototype.getCollection = getCollection
Notion.prototype.getCollectionView = getCollectionView
Notion.prototype.getSpace = getSpace
Notion.prototype.getUser = getUser
Notion.prototype.downloadPage = downloadPage
Notion.prototype.queryCollection = queryCollection

export default Notion
