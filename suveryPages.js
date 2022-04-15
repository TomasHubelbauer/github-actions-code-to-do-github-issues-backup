import https from 'https';
import promisify from './promisify.js';
import makeOptions from './makeOptions.js';
import makeUrl from './makeUrl.js';
import buffer from './buffer.js';

export default async function surveyPages(/** @type {string} */ token, /** @type {string} */ route, /** @type {Record<string, string>} */ params) {
  const url = makeUrl(route, params);
  const response = await promisify(https.request)(url, makeOptions(token, 'GET'));
  if (!response.headers.link) {
    // Note that this seems to indicate one page and I think this is a bug:
    // TODO: Solve this in https://support.github.com/ticket/personal/0/1588363
    return 1;

    console.log(response.statusCode, response.statusMessage, url);
    console.log(response.headers);
    console.log((await buffer(response)).toString());
    throw new Error('No link header found!');
  }

  return +response.headers.link.match(/(\d+)>; rel="last"/)[1];
}
