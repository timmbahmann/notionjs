import Njs from './index'

/**
 * Creates a new PageAPI.
 * @class
 * @param {string} collectionID - A number in the form of '09691d5a-403c-4754-b8f6-c73b0d71a8e9'
 * @param {number} [newLimit=10] - Maximum number of pages returned (default: 10)
 */
export default function Page(collectionID, filter, limit) {
  /**
   * The assosicated njs instance
   */
  const njs = new Njs()

  /**
   * The Maximum number of pages returned at a time (default : 10)
   */
  limit = limit && limit > 0 ? limit : 10

  /**
   * All pages with the current limit
   */
  this.pages = getPages(limit, njs, collectionID, filter)

  /**
   * Sets a new limit and retrieves all pages within this limit
   * @param {number} newLimit - The new maximum number of pages retrieved
   */
  this.setLimit = async function(newLimit) {
    limit = newLimit
    this.pages = getPages(limit, njs, collectionID, filter)
    this.getPageBySlug = getPageBySlug(this.pages)
  }

  /**
   * Sets a new filter and retrieves all pages matching the filter
   * @param {Object} - A new filter object
   */
  this.setFilter = async function(newFilter) {
    filter = newFilter
    this.pages = getPages(limit, njs, collectionID, filter)
    this.getPageBySlug = getPageBySlug(this.pages, njs)
  }

  /**
   * Gets all blocks from a page in the pages property with the given slug name
   * @property {string} slug - The slug name of the page
   * @returns {Promise} Returns a promise with all block and its properties inside an array
   */
  this.getPageBySlug = getPageBySlug(this.pages, njs)
}

let getPageBySlug = (p, njs) => async slug => {
  let page = await getPageMetaBySlug(p)(slug)
  return await getPage(page.blockID, njs)
}

let getPageMetaBySlug = p => async slug => {
  let pages = await p
  const i = pages.findIndex(page => page.Slug === slug)
  if (i >= 0) {
    return pages[i]
  } else {
    throw new Error('Page not found')
  }
}

let mapBlocks = njs =>
  async function(block) {
    if (block.value.type === 'toggle') {
      let page = await getPage(block.value.id, njs)
      return {
        type: block.value.type,
        props: block.value.properties,
        page
      }
    }
    return {
      type: block.value.type,
      props: block.value.properties
    }
  }

async function getPage(parentID, njs) {
  let b = await njs.downloadPage(parentID)
  return Promise.all(
    Object.values(b.block)
      .filter(bl => bl.value.parent_id === parentID)
      .map(mapBlocks(njs))
  )
}

function getPages(limit, njs, collectionID, filter) {
  return new Promise((resolve, reject) =>
    njs
      .downloadPage(collectionID)
      .then(getCollectionFromPage(limit, njs, filter))
      .then(getPageSort)
      .then(getSchema)
      .then(getPagesArray)
      .then(resolve)
      .catch(reject)
  )
}

function setCorrectFilterProperty(data, filter) {
  if (!filter) return undefined
  let schema = Object.values(data.collection)[0].value.schema
  for (let i = 0; i < filter.filters.length; i++) {
    filter.filters[i].property = Object.keys(schema).find(
      key => schema[key].name === filter.filters[i].property
    )
  }
  return filter
}

function getCollectionFromPage(limit, njs, filter) {
  return function(data) {
    filter = setCorrectFilterProperty(data, filter)
    return njs.queryCollection(
      Object.keys(data.collection)[0],
      Object.keys(data.collection_view)[0],
      { aggregations: [], filter },
      {
        type: 'table',
        limit: limit,
        searchQuery: '',
        userTimeZone: 'Europe/Berlin',
        userLocale: 'de',
        loadContentCover: false
      }
    )
  }
}

let reduceProps = blocks => (prev, key) => {
  prev[key] = {
    ...blocks[key].value.properties,
    image: blocks[key].value.format ? blocks[key].value.format.page_cover : '',
    blockID: key
  }
  return prev
}

function getPropsFromBlocks(blocks) {
  return Object.keys(blocks)
    .filter(key => blocks[key].value && blocks[key].value.properties)
    .reduce(reduceProps(blocks), {})
}

function getPageSort(data) {
  let propsFromBlock = getPropsFromBlocks(data.block)
  return {
    data,
    pageSort: Object.values(data.collection_view)[0]
      .value.page_sort.map(key => propsFromBlock[key])
      .filter(key => key)
  }
}

function getSchema({ data, pageSort }) {
  let schema = Object.values(data.collection)[0].value.schema
  let props = Object.keys(schema).reduce((prev, key) => {
    prev[key] = schema[key].name
    return prev
  }, {})
  return {
    pageSort,
    props
  }
}

function getTagByType(page, tagName, tag) {
  switch (tagName) {
    case 'Tags':
    case 'Vorschautext':
    case 'Status':
    case 'Name':
    case 'Slug':
      return page[tag][0][0]
    case 'Veröffentlichungsdatum':
      return page[tag][0][1][0][1].start_date
    default:
      return page[tag]
  }
}

let reducePages = (props, page) => (prev, tag) => {
  if (tag === 'image' || tag === 'blockID') {
    prev[tag] = page[tag]
  } else {
    prev[props[tag]] = getTagByType(page, props[tag], tag)
  }
  return prev
}

function getPagesArray({ pageSort, props }) {
  return pageSort.map(page =>
    Object.keys(page).reduce(reducePages(props, page), {})
  )
}
