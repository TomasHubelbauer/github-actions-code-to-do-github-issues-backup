import https from 'https';
import promisify from './promisify.js';
import makeOptions from './makeOptions.js';
import makeUrl from './makeUrl.js';

export default async function surveyPages(/** @type {string} */ token, /** @type {string} */ route, /** @type {Record<string, string>} */ params) {
  const response = await promisify(https.request)(makeUrl(route, params), makeOptions(token, 'HEAD'));
  if (!response.headers.link) {
    console.log(response.headers);
    throw new Error('No link header found!');
  }

  return +response.headers.link.match(/(\d+)>; rel="last"/)[1];
}
