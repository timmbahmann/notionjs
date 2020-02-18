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
  this.getPages = getPages(limit, njs, this.meta, filter)

  /**
   * Sets a new limit and retrieves all pages within this limit
   * @param {number} newLimit - The new maximum number of pages retrieved
   */
  this.setLimit = function(newLimit) {
    limit = newLimit
    this.getPages = getPages(limit, njs, this.meta, filter)
  }

  /**
   * @returns {number} The current limit
   */
  this.getLimit = function() {
    return limit
  }

  /**
   * Sets a new filter and retrieves all pages matching the filter
   * @param {Object} - A new filter object
   */
  this.setFilter = function(newFilter) {
    filter = JSON.parse(JSON.stringify(newFilter))
    this.getPages = getPages(limit, njs, this.meta, filter)
  }

  /**
   * Gets an Array of tags and sets the corresponding filter
   * @param {string[]} tags - An array of tags that should be filtered by
   */
  this.setFilterByTags = function(tags) {
    let filters = tags.map(tag => {
      return {
        property: 'Tags',
        filter: {
          operator: 'enum_contains',
          value: {
            type: 'exact',
            value: tag
          }
        }
      }
    })
    filter = {
      operator: 'and',
      filters
    }
    if (filters === []) {
      filter = ''
    }
    this.getPages = getPages(limit, njs, this.meta, filter)
  }

  /**
   * @returns {Promise<Object[]>} Up to five featured articles
   */
  this.getFeaturedArticles = async function() {
    let FeaturedArticleFilter = {
      operator: 'and',
      filters: [
        {
          property: 'Featured',
          filter: {
            operator: 'checkbox_is',
            value: {
              type: 'exact',
              value: true
            }
          }
        }
      ]
    }
    return await getPages(5, njs, this.meta, FeaturedArticleFilter)()
  }

  /**
   * Gets all blocks from a page in the pages property with the given slug name
   * @property {string} slug - The slug name of the page
   * @returns {Promise} Returns a promise with all block and its properties inside an array
   */
  this.getPageBySlug = async function(slug) {
    let slugFilter = {
      operator: 'and',
      filters: [
        {
          property: 'Slug',
          filter: {
            operator: 'string_is',
            value: {
              type: 'exact',
              value: slug
            }
          }
        }
      ]
    }
    let pageMeta = await getPages(1, njs, this.meta, slugFilter)()
    return getPage(pageMeta[0].blockID, njs)
  }

  this.getRootPageMeta = function() {
    return njs.downloadPage(collectionID)
  }

  this.setMeta = function(meta) {
    this.meta = meta
    this.getPages = getPages(limit, njs, meta, filter)
  }

  this.getTagsFromRoot = function() {
    let tags = Object.values(
      Object.values(this.meta.collection)[0].value.schema
    )
      .find(prop => prop.name === 'Tags')
      .options.map(option => option.value)
    return tags
  }
}

let getPageBySlug = njs => async (pages, slug) => {
  let page = await getPageMetaBySlug(pages)(slug)
  return await getPage(page.blockID, njs)
}

let getPageMetaBySlug = pages => async slug => {
  const i = pages.findIndex(page => page.Slug === slug)
  if (i >= 0) {
    return pages[i]
  } else {
    throw new Error('Page not found ' + slug)
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
  let props = Object.keys(b.block[parentID].value.properties).reduce(
    (prev, key) => {
      prev[
        Object.values(b.collection)[0].value.schema[key].name
      ] = getTagByType(
        b.block[parentID].value.properties,
        Object.values(b.collection)[0].value.schema[key].name,
        key
      )
      return prev
    },
    {}
  )
  let page = {
    blocks: await Promise.all(
      Object.values(b.block)
        .filter(bl => bl.value.parent_id === parentID)
        .map(mapBlocks(njs))
    ),
    format: b.block[parentID].value.format,
    properties: props
  }
  return page
}

function getPages(limit, njs, meta, filter) {
  return function(rootPageMeta) {
    return new Promise((resolve, reject) =>
      getCollectionFromPage(
        limit,
        njs,
        filter,
        meta
      )(rootPageMeta)
        .then(getPageSort)
        .then(getSchema)
        .then(getPagesArray)
        .then(resolve)
        .catch(reject)
    )
  }
}

function setCorrectFilterProperty(data, filter) {
  if (!filter) return undefined
  let schema = Object.values(data.collection)[0].value.schema
  for (let i = 0; i < filter.filters.length; i++) {
    filter.filters[i].property =
      Object.keys(schema).find(
        key => schema[key].name === filter.filters[i].property
      ) || filter.filters[i].property
  }
  return filter
}

function getCollectionFromPage(limit, njs, filter, data) {
  return function() {
    filter = setCorrectFilterProperty(data, filter)
    return new Promise((resolve, reject) =>
      njs
        .queryCollection(
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
        .then(data => {
          resolve(data)
        })
        .catch(reject)
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

function getPropsFromBlocks(data) {
  return Object.keys(data.block)
    .filter(
      key =>
        data.block[key].value &&
        data.block[key].value.properties &&
        data.block[key].value.parent_id === Object.keys(data.collection)[0]
    )
    .reduce(reduceProps(data.block), {})
}

function getPageSort(data) {
  return new Promise((resolve, reject) => {
    let propsFromBlock = getPropsFromBlocks(data)
    let pageSort = {
      data,
      total: data.total,
      pageSort: Object.values(data.collection_view)[0]
        .value.page_sort.map(key => propsFromBlock[key])
        .filter(key => key)
    }
    resolve(pageSort)
  })
}

function getSchema({ data, pageSort, total }) {
  return new Promise((resolve, reject) => {
    let schema = Object.values(data.collection)[0].value.schema
    let props = Object.keys(schema).reduce((prev, key) => {
      prev[key] = {
        name: schema[key].name,
        meta: schema[key].name === 'Tags' ? schema[key].options : undefined
      }
      return prev
    }, {})
    resolve({
      pageSort,
      props,
      total
    })
  })
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
    case 'Featured':
      return page[tag][0][0] === 'Yes'
    default:
      return page[tag]
  }
}

let reducePages = (props, page) => (prev, tag) => {
  switch (tag) {
    case 'image':
      if (page[tag].startsWith('/')) {
        prev[tag] =
          'https://notion.so/image/' +
          encodeURIComponent('https://notion.so' + page[tag]) +
          '?width=520'
      } else if (
        page[tag].includes('amazonaws') &&
        page[tag].includes('notion')
      ) {
        prev[tag] = 'https://notion.so/image/' + encodeURIComponent(page[tag])
      } else if (page[tag].includes('images.unsplash.com')) {
        prev[tag] = page[tag] + '&w=520'
      } else {
        prev[tag] = page[tag]
      }
      break
    case 'blockID':
      prev[tag] = page[tag]
      break
    default:
      prev[props[tag].name] = getTagByType(page, props[tag].name, tag)
  }
  return prev
}

function getPagesArray({ pageSort, props, total }) {
  return new Promise((resolve, reject) =>
    resolve({
      pages: pageSort.map(page =>
        Object.keys(page).reduce(reducePages(props, page), {})
      ),
      total
    })
  )
}
