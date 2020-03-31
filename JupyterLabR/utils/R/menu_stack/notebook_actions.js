define('nbextensions/menu_stack/notebook_actions', [
  'base/js/namespace',
  'jquery','base/js/events',
  './notebook_data',
  './meta',
  './logger',
  './config',
  './custom_actions',
  './utils',
  './moment/moment',
], function (Jupyter, $, events, notebook_data, meta, _logger, config, custom_actions, utils, moment) {

  function getNotebookDetail() {
    return notebook_data.getNotebookDetail(meta.getNotebookId());
  }

  function submitNotebook(description, theme, teamlist) {
    // console.log(description);
    // console.log(theme);
    // console.log(meta.isNotebookSubmitted());
    // console.log(meta.getNotebookMeta());
    if (!meta.isNotebookSubmitted()) {
      notebook_data.getNewNotebookId().then(function (response) {
        if (utils.isSucessResponse(response)) {
          submitNotebookHelper(response.data.notebookId, description, theme, teamlist);
        } else {
          meta.setNotebookMeta(null);
        }
      });
    } else {
      // console.log('not submit yet');
      // console.log(description);
      // console.log(theme);
      // console.log(teamlist);
      // notebook_actions.getNotebookDetail().then(function (response) {
      //   console.log(response);
      // });
      // utils.show_error_message('Submission failed as the notebook has already been submitted at <filepath>. Please contact the alphien team if this error persists.');
      submitNotebookHelper(meta.getNotebookId(), description, '', teamlist);
    }
  }

  function submitNotebookHelper (notebookId, description, theme, teamlist) {
    // console.log('desc:' + description);
    // console.log('theme:' + theme);
    // console.log('team:' + teamlist);
    var isAlreadySubmitted = meta.isNotebookSubmitted();
    meta.setNotebookMetaFromFields(notebookId, description, Jupyter.notebook.notebook_name);
    notebook_data.submitNotebook(notebookId, Jupyter.notebook.notebook_name, description, Jupyter.notebook.notebook_path, utils.getUserId(), utils.getUserName(), theme, teamlist).then(function (response) {
      if (utils.isSucessResponse(response)) {
        Jupyter.notebook.save_notebook().then(function (res) {
          //saveSubmittedNotebook();
          if (config.isServerOnline) {
            updateUIHelper(response);
            utils.show_header_message("Notebook submitted sucessfully");
          } else {
            updateUI();
          }
        });

      } else {
        if(!isAlreadySubmitted) {
          meta.setNotebookMeta(null);
        }
        if(response.displayMessage) {
          utils.show_header_error_message(response.displayMessage, 10000);
        } else {
          utils.show_header_error_message("Error while submitting notebook:");
        }
           _logger.logError("incorrect response" + response);
      }
    });
  }

  /*
  function saveSubmittedNotebook () {
    var copyUrl = config.pathToSubmitNotebook + "/" + meta.getNotebookId() + Jupyter.notebook.notebook_name.substring(Jupyter.notebook.notebook_name.indexOf('.'));
    var model = {
      type : "notebook",
      content : Jupyter.notebook.toJSON()
    };
    return Jupyter.notebook.contents.save(copyUrl, model).then(
      function (data) {
        _logger.log("File copied successfully at " + data.name);
      },
      function (error) {
        _logger.logError(error.message || error);
      }
    );
  }*/

  function updateLikeCount() {
    if (meta.isNotebookSubmitted()) {
      notebook_data.getNotebookDetail(meta.getNotebookId()).then(function (notebookData) {
        if (notebookData.status === 'SUCCESS') {
          if (notebookData.data.status === 'APPROVED') {
            notebook_data.updateLikeCount(meta.getNotebookId(),  utils.getUserId()).then(function (response) {
              if (utils.isSucessResponse(response)) {
                updateUI(response);
              } else {
                _logger.logError("incorrect response" + response);
              }
            });
          }
        }
      });
    }
  }

  function updateViewCount() {
    if (meta.isNotebookSubmitted()) {
      notebook_data.getNotebookDetail(meta.getNotebookId()).then(function (notebookData) {
        if (notebookData.status === 'SUCCESS') {
          if (notebookData.data.status === 'APPROVED') {
            return notebook_data.updateViewCount(meta.getNotebookId(),  utils.getUserId()).then(function (response) {
              if (utils.isSucessResponse(response)) {
                updateUI(response);
              } else {
                _logger.logError("incorrect response" + response);
              }
            });
          }
        }
      });
    }
  }

  function updateCloneCount(notebookId, userId) {
    if (meta.isNotebookSubmitted()) {
      notebook_data.getNotebookDetail(meta.getNotebookId()).then(function (notebookData) {
        if (notebookData.status === 'SUCCESS') {
          if (notebookData.data.status === 'APPROVED') {

            return notebook_data.updateCloneCount(meta.getNotebookId(),  utils.getUserId()).then(function (response) {
              if (utils.isSucessResponse(response)) {
                updateUI(response);
              } else {
                _logger.logError("incorrect response" + response);
              }
            });
          }
        }
      });
    }
  }

  events.on('notebook_data_updated', function () {
    //TODO: get latest data and update data , update data in noteBookData that will trigger/update view
    updateUI();
  });

  function updateUI () {
    setTimeout(
      updateUIDelay
    , 1000);
  }

  function updateUIDelay () {
    // console.log(meta.isNotebookSubmitted())
    if(meta.isNotebookSubmitted()) { //if its been submitted
      notebook_data.getNotebookDetail(meta.getNotebookId()).then(function (notebookData) {
        if (notebookData.status === 'SUCCESS') {
          updateUIHelper(notebookData);
        } else {
           showActionsIconsAndButtonOnIntialStatus();
           utils.show_header_error_message("Error while retrieving notebook info");
          _logger.logError('updateUI error while retrieving data from server', notebookData);
        }
      });
    } else {
      updateUIHelper(); //since notebook is not submissted yet we don't have notebook status
    }
  }

  function updateUIHelper (notebookData) {
    // console.log(notebookData);
    if (notebookData) {
      if (notebookData.data.status == 'APPROVED') {  //APPROVED
        showActionsIconsAndButtonOnApprovedStatus(notebookData);
      } else {
        // riyan
        showActionsIconsAndButtonOnApprovedStatus(notebookData);
        // showActionsIconsAndButtonOnIntialStatus();
      }
      $('#view').html('<span class="badge badge-secondary badge-margin badge-style" >' + notebookData.data.views + '</span>');
      $('#like').html('<span class="badge badge-secondary badge-margin badge-style">' + notebookData.data.likes + '</span>');
      $('#clone').html('<span class="badge badge-secondary badge-margin badge-style">' + notebookData.data.clones + '</span>');
    } else {
      showActionsIconsAndButtonOnIntialStatus();
    }
  }

  function showActionsIconsAndButtonOnApprovedStatus(notebookData) {
    var notebookpath = Jupyter.notebook.notebook_path.split('/');
    // console.log(notebookData);
    // console.log(notebookData.data.lastSubmittedDate);
    $("#action_button_span").hide();
    
    if(notebookpath.length > 1 && notebookpath[0] == 'Notebooks'){
      $("#action_icons_span").show();
    } else {
      $("#action_icons_span").hide();
    }

    if (notebookData.data.userlikes > 0) {
      $("#like").css('color', 'green');
    } else {
      $("#like").css('color', 'black');
    }
    $("#tooltip").html('<ul><li><strong>Contributed by: </strong>' + notebookData.data.userName
      + '</li><li><strong>Date of submission: </strong>' + moment(notebookData.data.lastSubmittedDate).format('DD/MM/YYYY')
      + '</li><li><strong>Description: </strong>' + notebookData.data.description + '</li></ul>');
  }


  function showActionsIconsAndButtonOnIntialStatus() {
    // riyan
    var notebookpath = Jupyter.notebook.notebook_path.split('/');
    if(notebookpath.length > 1 && notebookpath[0] == 'Notebooks'){
      $("#action_button_span").hide();
    }else{
      $("#action_button_span").show();
    }
    // riyan - end
    
    // $("#action_button_span").show();
    $("#action_icons_span").hide();
  }

  function getTest() {
    /*
    notebook_data.getTest().then(function(result) {
      console.log(result);
    });*/
  }

  return {
    getNotebookDetail: getNotebookDetail,
    submitNotebook: submitNotebook,
    updateUI: updateUI,
    updateLikeCount: updateLikeCount,
    updateViewCount: updateViewCount,
    updateCloneCount: updateCloneCount,
    getTest: getTest
  };

});
