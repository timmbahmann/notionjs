import {
  getBlock,
  getCollection,
  getUser,
  getCollectionView,
  getSpace
} from './getRecords'
import downloadPage from './downloadPage'
import { queryCollection } from './notionMethods'

function Notion() {
  if (!process.env.TOKEN_V2) {
    throw new Error(`Your TOKEN_V2 is undefined. 
    You need it to use this API. You can find yours on your Notion page by looking at the cookies while logged in. 
    For further help, please open an issue at https://github.com/Gamaranto/notionjs
    `)
  }
}

Notion.prototype.getBlock = getBlock
Notion.prototype.getCollection = getCollection
Notion.prototype.getCollectionView = getCollectionView
Notion.prototype.getSpace = getSpace
Notion.prototype.getUser = getUser
Notion.prototype.downloadPage = downloadPage
Notion.prototype.queryCollection = queryCollection

export default Notion
