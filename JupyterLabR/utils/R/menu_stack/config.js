define('nbextensions/menu_stack/config', [
  'jquery'
], function ($) {

  const apiNotebookUrl = "https://notebookapi.alphien.com/api/";
  // const apiNotebookUrl = "https://beta.alphien.com/notebook/api/";
  //const apiNotebookUrl = "http://shuklaabhisek.000webhostapp.com/api/";
  //const pathToSubmitNotebook = 'SubmitLocation1';
  const pathToSubmitNotebook = '/mnt/public/Jupyter/submitLocation';
  const debugMode = false;
  const isServerOnline = true;
  const userId = '123';
  const userName = 'DemoUser';
  const local = false;

  var getHeaders = function getHeaders() {
    return {
      //Accept: "application/json",
      //"Content-Type": "application/json"
    };
  };
  /*

   return ({
   accept: "application/json",
   contentType : "application/json",
   mode: "no-cors",
   host: "localhost:8080"
   });
   */
  return {
    apiNotebookUrl: apiNotebookUrl,
    debugMode: debugMode,
    getHeaders: getHeaders,
    isServerOnline: isServerOnline,
    userId: userId,
    userName: userName,
    local: local
  }
});
