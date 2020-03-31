define('nbextensions/menu_stack/logger', [
  'base/js/namespace',
  'jquery',
  './config',
], function (Jupyter, $, config) {

  function logError(errorDecsription, response) {
    if (config.debugMode) {
      if(response && response.message) {
        console.log(errorDecsription + " : " + response.message);
      } else {
        console.log(errorDecsription);
      }
    }
    return {status: 'SUCCESS'}
  }

  function log(message, response) {
    if (config.debugMode) {
      if(response && response.message) {
        console.log(message + " : " + response.message);
      } else {
        console.log(message);
      }
    }
    return {status: 'SUCCESS'}
  }

  return {
    logError: logError,
    log: log,
  };

});
