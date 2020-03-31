define('nbextensions/menu_stack/meta', [
  'base/js/namespace',
  'jquery',
  './logger',
], function (Jupyter, $, _logger) {


  const setNotebookMeta = function(notebookData) {
    if(notebookData && notebookData !== null) {
      if (Jupyter.notebook.metadata.menu_stack === undefined) {
        Jupyter.notebook.metadata.menu_stack = {};
      }
      Jupyter.notebook.metadata.menu_stack.notebookId = notebookData.notebookId;
      Jupyter.notebook.metadata.menu_stack.description = notebookData.description;
      Jupyter.notebook.metadata.menu_stack.name = Jupyter.notebook.notebook_name;
    } else {
      Jupyter.notebook.metadata.menu_stack = {};
    }
  };

  const setNotebookMetaFromMetaData = function(metaData) {
    if(metaData && metaData !== null) {
      if (Jupyter.notebook.metadata.menu_stack === undefined) {
        Jupyter.notebook.metadata.menu_stack = {};
      }
      Jupyter.notebook.metadata.menu_stack.notebookId = metaData.notebookId;
      Jupyter.notebook.metadata.menu_stack.description = metaData.description;
      Jupyter.notebook.metadata.menu_stack.name = metaData.name;
    }
  };

  const setNotebookMetaFromFields = function(notebookId, description, name) {
    setNotebookMetaFromMetaData({notebookId:notebookId, description:description, name: name});
  };

  const getNotebookMeta = function() {
     return Jupyter.notebook.metadata.menu_stack;
  };

  const getNotebookId = function() {
      if (Jupyter.notebook.metadata.menu_stack !== undefined) {
        return Jupyter.notebook.metadata.menu_stack.notebookId;
      } else {
        return null;
      }
  };

  const isNotebookSubmitted = function() {
    return (getNotebookId()) ? true : false;
  };

  return {
    getNotebookMeta: getNotebookMeta,
    setNotebookMeta: setNotebookMeta,
    getNotebookId: getNotebookId,
    isNotebookSubmitted: isNotebookSubmitted,
    setNotebookMetaFromMetaData: setNotebookMetaFromMetaData,
    setNotebookMetaFromFields: setNotebookMetaFromFields
  };
});
