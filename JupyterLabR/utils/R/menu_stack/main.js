define([
  'base/js/namespace',
  'base/js/events',
  './custom_actions',
  './side_panel',
  './utils',
  './context_menu',
  './custom_model',
  './notebook_actions',
  './meta'
], function (Jupyter, events, custom_actions, side_panel, utils, context_menu, custom_model, notebook_actions, meta) {
  "use strict";
  var action_names = {};


  function register_new_actions() {
    action_names.custom_run_current = Jupyter.keyboard_manager.actions.register({
      'help': 'Run current cell',
      'icon': 'fa fa-play run-current-cell',
      'handler': custom_actions.handle_custom_current_cell
    }, 'run-current', 'custom-button');

    action_names.custom_run_all_above = Jupyter.keyboard_manager.actions.register({
      'help': 'Run all above',
      'icon': 'fa fa-fast-forward run-all-above',
      'handler': custom_actions.handle_custom_run_all_above
    }, 'run-all-above', 'custom-button');

    action_names.custom_run_all = Jupyter.keyboard_manager.actions.register({
      'help': 'Run all' ,
      'icon': 'fa fa-forward  run-all',
      'handler': custom_actions.handle_custom_run_all
    }, 'run-all', 'custom-button');

    action_names.custom_delete = Jupyter.keyboard_manager.actions.register({
      'help': 'Delete notebook',
      'icon': 'fa fa-trash-o',
      'handler': custom_actions.handle_custom_delete
    }, 'delete-notebook', 'custom-button');
    // clear output
    action_names.custom_clear_allout = Jupyter.keyboard_manager.actions.register({
      'help': 'Clear all output',
      'icon': 'fa fa-eraser clear-all-output',
      'handler': custom_actions.handle_custom_clear_all_output
    }, 'clear-all-output', 'custom-button');
    // trusted btn
    action_names.custom_trusted_note = Jupyter.keyboard_manager.actions.register({
      'help': 'Trusted notebook',
      'icon': 'fa fa-check-square trusted-notebook-output',
      'handler': custom_actions.handle_custom_trusted_note
    }, 'trusted-notebook-output', 'custom-button');

    return true;
  }

  function hide_main_run() {
    $('#run_int :button[title="Run"]').hide();
  }

  function initialize() {
    register_new_actions();
    hide_main_run();
    $('span.autosave_status').hide();
    $('span.checkpoint_status').hide();
    // $('<span id="custom_message"/>').insertAfter($('#notebook_name'));
    // new wireframe
    // $('<span id="custom_message"/>').insertAfter($('#menubar'));
    // $('<span id="custom_message"/>').insertAfter($('#save_widget'));
    $('<span id="custom_message"/>').insertBefore($('#menubar-container'));
    //var notebookName = $('#notebook_name');
    $('span.filename').unbind("click");
    add_custom_header();
    checkMetaAndUpdate();
    return true;
  }

  function hide_menu_bar() {
    // $('#header-container').show();
    $('#header-container').hide();
    $('#menubar').hide();
    $('#kernel_logo_widget').hide();
    $('#ipython_notebook').hide();
    $('#login_widget').hide();
    return true;
  }

  var funcNavBarMenu = function () {
    // var visible = side_panel.toggleSidePanel();
    setTimeout(function () {
      $(':focus').blur();
    }, 100);
  }

  // new notebook - get param
  function getURLParameter (name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
  }
  // new notebook - update meta
  function initUpdateMetaKernelspec () {
    Jupyter.notebook.save_notebook();
  }
  // new notebook - check update
  function checkMetaAndUpdate () {
    if (getURLParameter('newnotebook') == 'true') {
      initUpdateMetaKernelspec()
    }
  }

  window.onmessage = function(e){
    if (e.data == 'autosave') {
      initUpdateMetaKernelspec()
    }
  };

  function insert_after(_title, _insertAfter) {
    var previous_button = $("#maintoolbar-container :button[title='" + _title + "']");
    var next_button = $("#maintoolbar-container :button[title='" + _insertAfter + "']");
    previous_button.after(next_button);
  }

  function addClass(_title, _className) {
    var _element = $("#maintoolbar-container :button[title='" + _title + "']");
    _element.attr("class", _className);
  }

  function add_custom_header() {
    var navBarMenuButton = side_panel.createButton("fa fa-align-left", "nav-bar-menu-btn", funcNavBarMenu, "Show side menu").attr({'id': 'btn_side_panel'});
    var containerDiv =  $('<div class="container-custome-header"/>');
    var span = $('<span class ="nav-bar-header"/>');
    var parent = Jupyter.utils.url_path_split(Jupyter.notebook.notebook_path)[0];
    if(!$.trim(parent)) {
      span.append("<h3>My Notebooks</h3>");
    } else {
      span.append("<h3>" + parent + "</h3>");
    }
    containerDiv.append(navBarMenuButton);
    containerDiv.append(span);
    // new wireframe
    $('#header-container').prepend(containerDiv);
    $('[data-toggle="tooltip"]').tooltip({
      position: {
        my: "center bottom-20",
        at: "center top",
        using: function( position, feedback ) {
          $( this ).css( position );
          $( "<div>" )
            .addClass( "arrow" )
            .addClass( feedback.vertical )
            .addClass( feedback.horizontal )
            .appendTo( this );
        }
      }
    });
    // $('#header').prepend(containerDiv);
  }

  function changeNoteToTrust() {
    // console.log('start trust');
    var nb = Jupyter.notebook;
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
      // console.log('start trust - save');
      // pr = nb.save_notebook();
      return true;
    } else {
      // console.log('start trust - prom');
      pr = Promise.resolve();
    }
    return pr.then(function() {                            
      nb.contents.trust(nb.notebook_path)
      .then(function(res) {
        // console.log('start trust - suc');
        // nb.events.trigger("trust_changed.Notebook", true);
        // window.location.reload();
      }, function(err) {
        // console.log('start trust - error');
        console.log(err);
      });
    });
  }

  function add_toolbar_items() {
    // console.log(Jupyter.notebook)
    setTimeout(function(){
      var istrustnote = Jupyter.notebook.trusted;

      $(Jupyter.toolbar.add_buttons_group([
        action_names.custom_run_current,
        action_names.custom_run_all,
        action_names.custom_run_all_above,
        // action_names.custom_delete,
        action_names.custom_clear_allout
      ]));

      // btn trust
      // $(Jupyter.toolbar.add_buttons_group(
      //   [
      //     action_names.custom_trusted_note
      //   ],
      //   'trusted-notebook-output'
      // ));
      if (istrustnote === false) {
        // utils.show_header_message('Untrusted notebook. See more..','This is not a trusted notebook. Some HTML plots might not be shown properly. Please click on the "Not Trusted" button to show the HTML outputs.');
        // $(':button[title="Trusted notebook"]').html('Not Trusted');
        // $(':button[title="Trusted notebook"]').attr({title: "Click here to trust this notebook"});
        
        // console.log(utils.getUserName())
        // if (utils.getUserName() == 'riyan') {
        //   changeNoteToTrust();
        // }
        changeNoteToTrust();
        // console.log('do trust');
      } else {
        // $(':button[title="Trusted notebook"]').html('Trusted');
        // $(':button[title="Trusted notebook"]').attr({title: "Trusted Notebook"});
      }
      // $("#trusted-notebook-output").insertBefore("#notebook_action_div");
      // btn trust - end

      insert_after("Run", "Run current cell");
      insert_after("Run current cell", "Run all");
      insert_after("Run all", "Run all above");
      insert_after("open the command palette", "Clear all output");
      $("#save-notbook").prepend($("#maintoolbar-container :button[title='Show side menu']"));
      var parent = Jupyter.utils.url_path_split(Jupyter.notebook.notebook_path)[0];
      $("#maintoolbar-container :button[title='Show side menu']").addClass("menu-item-btn");
      var parent_path = parent.split('/');
      // console.log(parent_path);
      if(parent_path[0].toLowerCase() === 'Notebooks'.toLowerCase() || !Jupyter.notebook.writable) {
        Jupyter.notebook.set_autosave_interval(0);
        events.trigger('notebook_read_only.Notebook');
        $("#maintoolbar-container :button[title='Delete notebook']").remove();
        $("#notebook_name").off("click");
      } else {
        if (parent_path[0].toLowerCase() != '') {
          $("#maintoolbar-container :button[title='Delete notebook']").remove();
        }
        $("#notebook_name").addClass("notebook-rename").attr({title: "click here to rename"});
        utils.add_edit_icon();
      }
      return true;
    }, 1500);
  }

  function add_actions_icons() {
    var notebook_action_div = $('<div id="notebook_action_div"/>');
    var action_icons_span = $('<span id="action_icons_span"/>');
    var action_button_span = $('<span id="action_button_span"/>');

    //notebook_action_div.append($('<BR/>'));
    notebook_action_div.append(action_icons_span);
    notebook_action_div.append(action_button_span);

    var clone = $('<i class = "fa fa-clone fa-lg action_icon" id="clone">');
    var view = $('<i class = "fa fa-eye fa-lg action_icon" id="view"/>');
    var like = $('<i class = "fa fa-thumbs-up fa-lg action_icon" id="like"/>');
    var info = $('<i class = "fa fa-info-circle fa-lg action_icon action_icon_info tooltip1" id="info"/>');
    action_icons_span.append(info);
    action_icons_span.append(clone);
    action_icons_span.append(view);
    action_icons_span.append(like);
    var tooltip = $('<span id="tooltip" class="tooltiptext1"></span>');
    info.append(tooltip);
    like.click(function () {
      $('.fa-thumbs-up').animate({fontSize: '1.33333333em', lineHeight: '0em'}).animate({fontSize: '1.33333333em', lineHeight:'0.99em'});
      notebook_actions.updateLikeCount();
    });

    var parent = Jupyter.utils.url_path_split(Jupyter.notebook.notebook_path)[0];
    // console.log(parent);
    var parent_path = parent.split('/');
    if(parent_path[0].toLowerCase() !== 'Notebooks'.toLowerCase()) {
      // new wireframe
      var btn = side_panel.createButton(null, "submit_button btn btn-success btn-sm", showSubmitDialog, "Submit completed notebook for review", "Submit").attr('id', 'submit_button');
      // action_button_span.append(btn);
    }
    //on load default values
   // notebook_actions.updateUI();
    action_icons_span.hide();
    action_button_span.hide();
    // new-wireframe
    // $("#kernel_logo_widget").before(notebook_action_div);
    $("#maintoolbar-container").append(notebook_action_div);
    $("#login_widget + span a").addClass('submit_button btn btn-danger btn-sm cp-btn-class');
    // $("#maintoolbar-container").append('<div id="cp-btn-id"><span> <a href="/hub/home" class="submit_button btn btn-danger btn-sm">Control Panel</a></span></div>');
    
    return true;
  }
/*
  function cloneClick () {
    alert('d');
  }

  function add_actions_buttons() {
    var div = $('<span id="action_buttons"/>');
    var notebookDetail = notebook_actions.getNotebookDetail('uuid');
    if (notebookDetail && notebookDetail.status && notebookDetail.status == 'SUCCESS') {
      if(notebookDetail.data.status == 'APPROVED') {
        var clone_button = side_panel.createButton(null, "clone_button", cloneClick, "Clone notebook", "Clone").attr('id', 'clone_button');
        div.append(clone_button);
      }
    }

    $("#kernel_logo_widget").before(div);
    return true;
  }*/

  function showSubmitDialog() {
    custom_model.showSubmitDialog();
  }

  function add_side_panel() {
    // side_panel.initialize();
  }

  function load_data() {
    // disabled popup
    window.onbeforeunload = null;
    
    utils.saveUserInfo();
    notebook_actions.updateViewCount();
    notebook_actions.updateUI();

    // Jupyter.notebook.contents.list_contents('').then(function (resdata) {
    //   for (var i = 0; i < resdata.content.length; i++) {
    //     if (resdata.content[i].type == 'notebook') {
    //       console.log(meta.isNotebookSubmitted());
    //       console.log(resdata.content[i]);
    //     }
    //   }
    // });

    //notebook_actions.getTest();
  }



  function load_ipython_extension() {
    utils.include_css();
    return Jupyter.notebook.config.loaded
      .then(initialize)
      .then(hide_menu_bar)
      .then(add_toolbar_items)
      .then(add_side_panel)
      .then(add_actions_icons)
      .then(custom_actions.handle_save)
      .then(load_data),
      function on_error(err) {
        console.warn("Menu Stack", 'error loading config:', err);
      };
  }

  return {
    load_ipython_extension: load_ipython_extension
  };
});


/*
1. chnage checking of submitted to approved for all actions.
2. get user Id and name from frame

 */