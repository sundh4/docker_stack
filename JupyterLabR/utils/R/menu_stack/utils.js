define('nbextensions/menu_stack/utils'
  , ['require', 'jquery', 'base/js/dialog', './utils', './config', './logger'], function (require, $, dialog, utils, config, _logger) {
    "use strict";

    function add_css(url) {
      return $('<link/>').attr({
        type: 'text/css',
        rel: 'stylesheet',
        href: require.toUrl(url)
      }).appendTo('head');
    }

    function include_css() {
      add_css('./jstree/default/style.min.css');
      add_css('./icons.css');
      add_css('./side_panel.css');
      add_css('./menu_stack_custom.css');
    }

    var show_message = function (message) {
      var model = dialog.modal({
        title: "Success",
        body: $('<div/>')
          .append($('<div/>')
            .addClass('alert alert-success')
            .text(message))
      });
      setTimeout(function () {
        model.modal('hide')
      }, 3000);
    }

    var show_error_message = function (message) {
      var model = dialog.modal({
        title: "Error",
        body: $('<div/>')
          .append($('<div/>')
            .addClass('alert')
            .addClass('alert alert-danger')
            .html(message))
      });
    }

    var show_modal_confirm = function (title, message) {
      return dialog.modal({
        title: title,
        body: message,
        sanitize: false,
        buttons: {
          'Confirm': {
            class: 'btn-warning',
            click: function () {
              // console.log('test');
              return true;
            }
          },
          'Cancel': {}
        }
      });
    }

    var show_warning_message = function (message) {
      var model = dialog.modal({
        title: "Warning",
        body: $('<div/>')
          .append($('<div/>')
            .addClass('alert')
            .addClass('alert alert-warning')
            .html(message))
      });
    }

    var show_header_message = function (message, title = '', timeOut = 10000) {
      var span = $('#custom_message');
      span.attr("class", "custom_message_span_style");
      if (title != ''){
        span.attr("title", title);
      }
      span.text(message);
      span.fadeIn();

      // hide
      if(timeOut) {
        span.fadeOut(timeOut);
      } else {
        span.fadeOut(5000);
      }
    }

    var show_header_error_message = function (message, timeOut) {
      var span = $('#custom_message');
      span.attr("class", "custom_message_span_style_error");
      span.text(message);
      span.fadeIn();
      if(timeOut) {
        span.fadeOut(timeOut);
      } else {
        span.fadeOut(5000);
      }

    }

    var show_header_error_message_cstm = function (message, timeOut = 5000, title = '') {
      var span = $('#custom_message');
      span.attr("class", "custom_message_span_style_error");
      if (title != ''){
        span.attr("title", title);
      }
      span.text(message);
      span.fadeIn();
      span.fadeOut(timeOut);
    }

    var add_edit_icon = function () {
      //$("#notebook_name").append($('<img id="fileEdit" src="/nbextensions/menu_stack/icons/Pencil.png"/>'));	
      $("#notebook_name").append($('<img id="fileEdit" src="https://dev.alphien.com/wikiapi/menu_stack/icons/Pencil.png"/>'));
    }

    var isSucessResponse = function (response) {
      return response.status === 'SUCCESS' && response.data;
    }

    var getUrlVars = function () {
      var vars = [], hash;
      var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
      for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
      return vars;
    }

    var getUserId = function () {
      var userId = config.userId;
      if (typeof (Storage) !== "undefined") {
        userId = localStorage.getItem('userid')
      } else {
        _logger.logError("Sorry, your browser does not support web storage...");
      }
      if (config.local) {
        userId = config.userId;
      }
      return userId;
    }

    var getUserName = function () {
      var userName = config.userName;
      if (typeof (Storage) !== "undefined") {
        userName = localStorage.getItem('username')
      } else {
        _logger.logError("Sorry, your browser does not support web storage...");
      }
      if (config.local) {
        userName = config.userName;
      }
      return userName;
    }

    var saveUserInfo = function () {
      var userInfo = getUrlVars();

      var userId = userInfo["userid"];
      var userName = userInfo["username"];

      if (userId && userName) {
        if (typeof (Storage) !== "undefined") {
          localStorage.setItem('userid', userId);
          localStorage.setItem('username', userName);
        }
      }
    }

    var validNotebookName =  function(name) {
      if(/^[a-zA-Z0-9- ]*$/.test(name) == false) {
        return false;
      } else {
        return true;
      }
    }

    return {
      include_css: include_css,
      show_message: show_message,
      show_error_message: show_error_message,
      show_warning_message: show_warning_message,
      show_header_message: show_header_message,
      show_modal_confirm: show_modal_confirm,
      add_edit_icon: add_edit_icon,
      show_header_error_message: show_header_error_message,
      show_header_error_message_cstm: show_header_error_message_cstm,
      isSucessResponse: isSucessResponse,
      getUrlVars: getUrlVars,
      getUserId: getUserId,
      getUserName: getUserName,
      saveUserInfo: saveUserInfo,
      validNotebookName: validNotebookName
    };
  });
