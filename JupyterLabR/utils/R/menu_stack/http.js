define('nbextensions/menu_stack/http', [
  'base/js/namespace',
  'jquery',
  './config',
  './logger'
], function (Jupyter, $, config, _logger) {

  const handleHttpReject = (requestUrl, error) => {
    console.log('handleHttpReject');
    console.log(error);
    return Promise.reject(error);
  };

  const handleHttpErrorResponse = (requestUrl, response) => {
    console.log('handleHttpErrorResponse');
    console.log(response.status);
    response.text().then( errorMessage => {
      console.log(errorMessage);
    });
    return Promise.reject(response);
  };

  const get = (requestUrl, headers, params = {}, cache = "default") => {
    const queryString = Object.keys(params)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join("&");
    const finalRequestUrl = queryString ? `${requestUrl}?${queryString}` : requestUrl;
    if (!headers) {
      _logger.logError('headers are not specified');
      return Promise.reject();
    }
    return fetch(finalRequestUrl, {
      method: "GET",
      headers,
      cache,
    }).then(
      (response) => {
        if (response.ok) {
          return response.json();
        }
        return handleHttpErrorResponse(requestUrl, response);
      }, (error) => {
        return handleHttpReject(requestUrl, error);
      },
    );
  };

  const isEmptyParamEndpoint = (requestUrl) => {
    const requestEndpoint = requestUrl.substring(requestUrl.lastIndexOf("/") + 1);
    return false;
  };

  const post = (requestUrl, headers, params) => {
   console.log("HTTP POST Request " + requestUrl + "with params " + JSON.stringify(params));
    if ((!params || Object.keys(params).length === 0) && !isEmptyParamEndpoint(requestUrl)) {
      _logger.logError("HTTP POST Request param is empty");
      return Promise.reject();
    }
    return fetch(requestUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    }).then(
      (response) => {
        if (response.ok) {
          return response.json();
        }
        return handleHttpErrorResponse(requestUrl, response);
      }, (error) => {
        return handleHttpReject(requestUrl, error);
      },
    );
  };

  return {
    get: get,
    post: post
  };
});

