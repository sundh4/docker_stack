define('nbextensions/menu_stack/notebook_data', [
  'base/js/namespace',
  'jquery',
  './config',
  './http',
  './logger',
  './utils',
], function (Jupyter, $, config, http, _logger, utils) {

 const datastore = {
   notebookData: {
       id:Jupyter.notebook.metadata.id,
       name: Jupyter.notebook.notebook_name,
       status: null,
       description: null,
       createdBy: null,
       createdDate: null,
       submittedDate: new Date(),
       likes: 0,
       views: 0,
       clones: 0
   }
 };

 function post(endpoint, data) {
    const url = config.apiNotebookUrl + endpoint;
    const headers = new Headers(config.getHeaders());

   return http.post(url, headers, data).then(json => {return json;})
   .catch(error => _logger.logError('Error:', error));
 }

 function get(endpoint, params, useEndpoint) {
   const url = config.apiNotebookUrl + endpoint;
   const headers = new Headers(config.getHeaders());

   return http.get(url, headers, params).then(json => {return json;})
     .catch(error => _logger.logError('Error:', error));
 }

  function getForce(endpoint, params) {
    const url = endpoint;
    const headers = new Headers(config.getHeaders());

    return http.get(url, headers, params).then(json => {return json;})
      .catch(error => _logger.logError('Error:', error));
  }

  function isNotebookAlreadySubmitted(notebookId) {
    //todo: get notebook detail based on id to see if status is approved or not if not then user can submit again , display resubmit dialog box
    return new Promise((resolve, reject) => {
      datastore.notebookData.status = 'SUBMITTED';
      resolve(getNotebookDetail());
    });
  }

  function submitNotebook(notebookId, notebookName, description, location, userId, userName, theme, teamlist) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        var fileContentData = Jupyter.notebook.toJSON();
        // var postData = {notebookId: notebookId, notebookName: notebookName, description: description, location:  location, userId: userId, userName: userName, theme: theme, team: teamlist, fromsite: 'dev'};
        var postData = {notebookId: notebookId, notebookName: notebookName, description: description, location:  location, userId: userId, userName: userName, theme: theme, team: teamlist};
        postData.fileContent = fileContentData;
        post('submitNotebook', postData).then(response => {
          return resolve(response);
        });
      } else {
        datastore.notebookData.notebookId = '12344545';
        datastore.notebookData.name = notebookName;
        datastore.notebookData.description = description;
        datastore.notebookData.status = 'SUBMITTED';
        resolve(getNotebookDetail());
      }
    });
  }

  function updateLikeCount(notebookId, userId) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        const postData = {notebookId: notebookId, userId: userId};
        post('likeNotebook', postData).then(response => {
          return resolve(response);
        });
      } else {
        if (Number(datastore.notebookData.likes) === 0) {
          datastore.notebookData.likes = 1;
        } else {
          datastore.notebookData.likes = 0;
        }
        getNotebookDetail().then(function (response) {
          if (utils.isSucessResponse(response)) {
            var updatedData = response;
            updatedData.data.isLike = Number(updatedData.data.likes) === 1 ? true : false;
            resolve(updatedData);
          } else {
            _logger.logError("error while getting notebook detail");
          }
        });
      }
    });
  }

  function updateViewCount(notebookId, userId) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        const postData = {notebookId: notebookId, userId: userId};
        post('viewNotebook', postData).then(response => {
          return resolve(response);
        });
      } else {
        datastore.notebookData.views += Number(datastore.notebookData.views) + 1;
        getNotebookDetail().then(function (response) {
          resolve(response);
        });
      }
    });
  }

  function updateCloneCount(notebookId, userId) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        const postData = {notebookId: notebookId, userId: userId};
        post('cloneNotebook', postData).then(response => {
          return resolve(response);
        });
      } else {
        datastore.notebookData.clones += Number(datastore.notebookData.clones) + 1;
        getNotebookDetail().then(function (response) {
          resolve(response);
        });
      }
    });
  }

  function postForce(url, data) {
    const headers = new Headers(config.getHeaders());

    return http.post(url, headers, data).then(json => {return json;})
      .catch(error => _logger.logError('Error:', error));
  }

  function getTest() {
    //todo: get notebook detail based on id to see if status is approved or not if not then user can submit again , display resubmit dialog box
     //return getForce('https://api.github.com/users/xiaotian/repos');
   //return postForce("http://localhost:8080/submit_notebook", {name: 'aa', location: 'l', userId: '77', description: 'des' ,updatedBy: '76'});
    return getForce('http://localhost:8080/api/getNotebookInfo/a9b35a49-9cca-4e53-9889-edc59f7f3f49');

  }

  function getNotebookDetail(notebookId) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        get("getNotebookInfo/" + notebookId + "/" + utils.getUserId()).then(response => {
          return resolve(response);
        });
      } else {
        resolve({
          status: 'SUCCESS',
          data: datastore.notebookData
        });
      }
    });
  }

  function getNewNotebookId() {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        get("generateNotebookId").then(response => {
          return resolve(response);
        });
      } else {
        resolve({
          status: 'SUCCESS',
          data: datastore.notebookData
        });
      }
    });
  }

  // riyan - get folder access
  function getFolderAccess(username) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        get("getFolderAccess/" + username).then(response => {
          return resolve(response);
        });
      } else {
        resolve({
          status: 'SUCCESS',
          data: datastore.notebookData
        });
      }
    });
  }

  // riyan - team list
  function getTeamList(username) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        get("getTeamList/" + username).then(response => {
          return resolve(response);
        });
      } else {
        resolve({
          status: 'SUCCESS',
          data: datastore.notebookData
        });
      }
    });
  }

  // riyan - alphathon
  function getAlphathon(username) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        get("getAlphathon/" + username).then(response => {
          return resolve(response);
        });
      } else {
        resolve({
          status: 'SUCCESS',
          data: datastore.notebookData
        });
      }
    });
  }

  // riyan - alphathon
  function getAlphathonteam(code, username) {
    return new Promise((resolve, reject) => {
      if (config.isServerOnline) {
        get("getAlphathonTeam/" + code + "/" + username).then(response => {
          return resolve(response);
        });
      } else {
        resolve({
          status: 'SUCCESS',
          data: datastore.notebookData
        });
      }
    });
  }

  return {
    getNotebookDetail: getNotebookDetail,
    submitNotebook: submitNotebook,
    updateViewCount: updateViewCount,
    updateLikeCount: updateLikeCount,
    updateCloneCount: updateCloneCount,
    getNewNotebookId: getNewNotebookId,
    getFolderAccess: getFolderAccess,
    getTeamList: getTeamList,
    getAlphathon: getAlphathon,
    getAlphathonteam: getAlphathonteam,
    getTest, getTest
  };

});
