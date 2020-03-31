define('nbextensions/menu_stack/custom_actions', [
    'jquery',
    'base/js/namespace',
    'tree/js/notebooklist',
    'base/js/dialog',
    'base/js/events',
    './utils',
    './side_panel',
    './notebook_actions',
    './meta'
  ], function ($, Jupyter, Notebooklist, dialog, events, utils, sidePanel, notebook_actions, meta) {
    "use strict";

    var actions = {};

    function blur_element() {
      var focused = $(':focus');
      focused.blur();
    }

    actions.handle_custom_current_cell = function () {
      Jupyter.notebook.execute_cell();
      blur_element();
    };

    actions.handle_custom_run_all_above = function () {
      Jupyter.notebook.execute_cells_above();
      Jupyter.notebook.select_next();
      blur_element();
    };

    actions.handle_custom_run_all = function () {
      Jupyter.notebook.execute_all_cells();
      blur_element();
    };

    // clear output
    actions.handle_custom_clear_all_output = function () {
      Jupyter.notebook.clear_all_output();
      blur_element();
    };

    // trusted notebook output
    actions.handle_custom_trusted_note = function () {
      if (Jupyter.notebook.trusted === false) {
        var body = $("<div>").append($("<p>")
          .text("A trusted Jupyter notebook may execute hidden malicious code when you open it. Selecting trust will immediately reload this notebook in a trusted state.")
        );

        var nb = Jupyter.notebook;
        dialog.modal({
          notebook: Jupyter.notebook,
          keyboard_manager: Jupyter.notebook.keyboard_manager,
          title: "Trust this notebook?",
          body: body,
          buttons: {
            Cancel : {},
            Trust : {
              class : "btn-danger",
              click : function () {
                  var cells = nb.get_cells();
                  for (var i = 0; i < cells.length; i++) {
                    var cell = cells[i];
                    if (cell.cell_type === 'code') {
                      cell.output_area.trusted = true;
                    }
                  }
                  // If its write only and dirty, save before 
                  // trusting
                  var pr;
                  if(nb.writable && nb.dirty) {
                    pr = nb.save_notebook();
                  }
                  else {
                    pr = Promise.resolve();
                  }
                  return pr.then(function() {                            
                    nb.contents.trust(nb.notebook_path)
                    .then(function(res) {
                      nb.events.trigger("trust_changed.Notebook", true);
                      window.location.reload();
                    }, function(err) {
                      console.log(err);
                    });
                  });
              }
            }
          }
        });
        // Jupyter.notebook.trust_notebook();
        blur_element();
      }
    };

    actions.handle_custom_delete = function () {
      Jupyter.notebook.contents.delete(Jupyter.notebook.notebook_path).then(function success() {
        blur_element();
        delete_session();
        actions.handle_custom_open_notebook("Notebooks/Tutorial/start.ipynb");
      });
    };

    var delete_session = function () {
      Jupyter.notebook.session.delete();
    };

    actions.handle_custom_open_notebook = function (notebookName) {
      var w = window.open('', '_self');
      var parent = Jupyter.utils.url_path_split(Jupyter.notebook.notebook_path)[0];
      var url = Jupyter.utils.url_path_join(
        Jupyter.notebook.base_url, 'notebooks'
      );
      url += "/" + notebookName;
      w.location = url;
    };

     var save_success = function() {
       utils.show_header_message("Notebook saved successfully");
     }

    events.on('notebook_renamed.Notebook', function () {
      // console.log(Jupyter.notebook.notebook_path);
      sidePanel.refresh_notebook_bypath(Jupyter.notebook.notebook_path);
      utils.add_edit_icon();
    });

    actions.handle_save = function () {
      require(['notebook/js/notebook'], function on_success (notebook) {
        events.on('notebook_saved.Notebook',save_success);
        var orig_notebook_save_notebook = notebook.Notebook.prototype.save_notebook;
        var parentFolder = Jupyter.utils.url_path_split(Jupyter.notebook.notebook_path)[0];
        var cbHomeList = Jupyter.notebook.contents.list_contents('').then(function (list) {
          var listhome = [];
          for (var i = 0; i < list.content.length; i++) {
            if (list.content[i].type == 'notebook') {
              listhome.push(list.content[i].name);
            }
          }
          return listhome;
        });
        notebook.Notebook.prototype.save_notebook = function (check_last_modified) {
          // console.log(Jupyter.notebook.notebook_path);
          // console.log(parentFolder);
          // console.log(this.writable);
          // riyan - start
          var today = new Date();
          var datestr = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
          var parent_path = parentFolder.split('/');
          // console.log(parent_path);
          
          // rootname
          var rootname = utils.getUserName();
          if (parent_path[0].toLowerCase() === 'Notebooks'.toLowerCase()) {
            cbHomeList.then(function (listhome) {
              var namefilecheck = Jupyter.notebook.notebook_name.replace('.ipynb', '');
              var renamecheck = namefilecheck + ' (' + datestr + ').ipynb';
              var model = {
                type : "notebook",
                content : Jupyter.notebook.toJSON()
              };
              var hreflink = Jupyter.utils.url_path_join(
                Jupyter.notebook.base_url, 'notebooks'
              );

              // console.log(listhome.indexOf(renamecheck));
              if (listhome.indexOf(renamecheck) == -1) {
                var modalconf = utils.show_modal_confirm("Confirmation","This notebook is read-only. New notebook will be created at location: " + rootname + "/");
                $(modalconf).find('.btn-warning').click(function () {
                  var originalMeta = null;
                  if (meta.isNotebookSubmitted()) {
                    originalMeta = meta.getNotebookMeta();
                    meta.setNotebookMeta(null);
                  }
                  // rename
                  return Jupyter.notebook.contents.save(renamecheck, model).then(
                    function (data) {
                      // console.log(originalMeta);
                      meta.setNotebookMetaFromMetaData(originalMeta);
                      // utils.show_header_message("This notebook is read-only. New notebook is created at location: Home/" + data.name);
                      // console.log('before calling updateCloneCount');
                      notebook_actions.updateCloneCount();
                      
                      // refresh page
                      setTimeout(sidePanel.refresh_notebook_bypath(data.path), 1000);
                    },
                    function (error) {
                      utils.show_error_message(error.message || error);
                    }
                  );
                });
              } else {
                hreflink += "/" + renamecheck;
                // console.log(hreflink);
                var modalconf = utils.show_modal_confirm("Confirmation","This notebook has already been cloned today at: <a href='" + hreflink + "'>" + rootname + "/" + renamecheck + "</a>. <br/> Do you want to replace it?");
                $(modalconf).find('.btn-warning').click(function () {
                  // confirm replace
                  var originalMeta = null;
                  if (meta.isNotebookSubmitted()) {
                    originalMeta = meta.getNotebookMeta();
                    meta.setNotebookMeta(null);
                  }
                  // rename
                  return Jupyter.notebook.contents.save(renamecheck, model).then(
                    function (data) {
                      // console.log(originalMeta);
                      meta.setNotebookMetaFromMetaData(originalMeta);
                      utils.show_header_message("Your notebook in: " + rootname + "/" + data.name + " replaced!");
                      notebook_actions.updateCloneCount();

                      // refresh page
                      setTimeout(sidePanel.refresh_notebook_bypath(data.path), 1000);
                    },
                    function (error) {
                      utils.show_error_message(error.message || error);
                    }
                  );
                });
              }
            });
            
          } else {
            // console.log('else');
            return orig_notebook_save_notebook.apply(this, arguments);
          }
        };
      }, function reject() {
        console.log(this.writable + "ERROR");
      });
    };

    return actions;
  });
