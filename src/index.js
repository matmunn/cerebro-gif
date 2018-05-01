const React = require('react');
const Preview = require('./Preview');
const icon = require('./plugin-icon.png');
const { memoize } = require('cerebro-tools');

/**
 * API key for unsplash.com
 * @type {String}
 */
const API_KEY = '8ce23e9b920ba876e98f4c5f6787cc57a70f0832561850541a996fa0d75cdbfe';


/**
 * Fetch photos from Unsplash API 
 *
 * @param  {Function} searchTerm
 * @return {Promise}
 */
const fetchPhotos = searchTerm => {
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&client_id=${API_KEY}`;
  return fetch(url).then(resp => {
    if (resp.status === 403) {
      return "rateLimited";
    } else if (resp.status === 422) {
      return "unexpectedError";
    } else {
      return resp.json().then(resp => resp.results)
    }
  });
};

/**
 * Version of fetchPhotos with caching
 *
 * @type {Function}
 */
const cachedFetchPhotos = memoize(fetchPhotos);

/**
 * Cerebro plugin to find photos
 *
 * @param  {String} options.term
 * @param  {Function} options.display
 */
const fn = ({term, display, actions}) => {
  let match = term.match(/^photo\s+(.+)/i);
  match = match || term.match(/(.+)\sphoto$/i);
  if (match) {
    clearTimeout(this.runFunc)

    this.runFunc = setTimeout(() => {
      cachedFetchPhotos(match[1]).then(results => {
        var response;
        if (results === "rateLimited") {
          response = {
            title: "Couldn't complete search - API rate limit reached."
          }
        } else if (results === "unexpectedError") {
          response = {
            title: "An unepected error occurred while searching for photos."
          }
        } else {
          if (results.length === 0) {
            response = {
              title: "No photo results were found on Unsplash."
            }
          } else {
            response = results.map(item => ({
              icon,
              id: item.id,
              title: item.urls.raw,
              clipboard: item.urls.raw,
              onSelect: () => {
                fetch(`${item.links.download_location}?client_id=${API_KEY}`)
                actions.copyToClipboard(item.urls.raw)
              },
              getPreview: () => <Preview urls={item.urls} id={item.id} user={item.user}  />
            }))
          }
        }
        display(response)
      })
    }, 800)
  }
};

module.exports = {
  fn,
  icon,
  name: 'Find relevant photos',
  keyword: 'photo',
};
