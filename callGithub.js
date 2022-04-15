import https from 'https';
import promisify from './promisify.js';
import buffer from './buffer.js';
import makeOptions from './makeOptions.js';
import makeUrl from './makeUrl.js';

export default async function callGitHub(
  /** @type {string} */ token,
  /** @type {string} */ route,
  {
    /** @type {Record<string, string>} */ params,
    /** @type {string} */ method,
    /** @type {object} */ body,
  } = options) {
  const options = makeOptions(token, method);
  const url = makeUrl(route, params);
  const response = await promisify(https.request, body ? JSON.stringify(body) : undefined)(url, options);
  return JSON.parse(await buffer(response));
}
