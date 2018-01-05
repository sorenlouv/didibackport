import qs from 'querystring';

export function toQuery(search) {
  return qs.parse(search.slice(1));
}

export function fromQuery(query) {
  return qs.stringify(query);
}

export function getBoolParam(location, param) {
  return toQuery(location.search)[param] === 'true';
}
