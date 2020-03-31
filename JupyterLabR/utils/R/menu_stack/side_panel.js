define('nbextensions/menu_stack/side_panel', [
  'base/js/namespace',
  'jquery',
  'base/js/utils',
  'base/js/dialog',
  'base/js/keyboard',
  'base/js/i18n',
  './notebook_data',
  './utils',
  './menu_stack_custom',
  './config',
  './notebook_actions',
  './meta',
  './jstree/jstree.min',
], function (Jupyter, $, utils, dialog, keyboard, i18n, notebook_data, customUtils, menu_stack_custom, config, notebook_actions, meta, jstree) {
  "use strict";

  var side_panel_start_width =40 ;
  var list_folder_global = [];
  var list_folder_private = ['Notebooks', 'NotebookSubmission', 'paperTrading'];
  var elm_jstree_global = null;
  var elm_search_global = null;
  var siteurl = 'https://www.alphien.com/mynotebooks';
  var title_forhome_global = 'Home';

  var initialize = function () {
    buildSidePanelMain();
    $(document).on('click', '#side_panel_inner > ul > li', function() {
      $('#side_panel_inner li').removeClass('active');
      $(this).closest('li').addClass('active');
      $(this).closest('li').find('i').removeClass('fa-folder-o');
      $(this).closest('li').find('i').addClass('fa-folder-open-o');
      var checkElement = $(this).next();
      if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
        $(this).closest('li').find('i').removeClass('fa-folder-open-o');
        $(this).closest('li').find('i').addClass('fa-folder-o');
        $(this).closest('li').removeClass('active');
        checkElement.slideUp('normal');
      }
      if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
        //$('#cssmenu ul ul:visible').slideUp('normal');
        checkElement.slideDown('normal');
      }
      if($(this).closest('li').find('ul').children().length == 0) {
        return true;
      } else {
        return false;
      }
    });

    $(document).on('click', '#side_panel_inner > ul > ul > li', function() {
      $('#side_panel_inner li').removeClass('active');
      $(this).closest('li').addClass('active');
      $(this).closest('li').find('i').removeClass('fa-folder-o');
      $(this).closest('li').find('i').addClass('fa-folder-open-o');
      var checkElement = $(this).next();
      if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
        $(this).closest('li').find('i').removeClass('fa-folder-open-o');
        $(this).closest('li').find('i').addClass('fa-folder-o');
        $(this).closest('li').removeClass('active');
        checkElement.slideUp('normal');
      }
      if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
        checkElement.slideDown('normal');
      }
      if($(this).closest('li').find('ul').children().length == 0) {
        return true;
      } else {
        return false;
      }
    });
  };

  var build_side_panel = function (main_panel, side_panel) {
    // riyan
    // side_panel.css('display', 'none');
    // riyan - end
    side_panel.insertAfter(main_panel);
    var side_panel_splitbar = $('<div class="side_panel_splitbar"/>');

    var search_panel_input = $('<input/>').attr('type','text').attr('id','search_panel_input').attr('placeholder','search').addClass('form-control');
    var side_panel_search = $('<div id="side_panel_search" class="side_panel_search"/>');
    side_panel_search.append(search_panel_input);
    side_panel.append(side_panel_search);
    elm_search_global = search_panel_input;
    
    var side_panel_list = $('<div id="side_panel_list" class="side_panel_list custom_overflow"/>');
    side_panel.append(side_panel_list);

    //main_panel.append(side_panel_splitbar);
    side_panel_splitbar.insertAfter(side_panel);
    //var navBarMenuButton = createButton("fa fa-angle-double-right", "nav-bar-menu-btn", funcNavBarMenu, "Show side menu").attr('id', 'btn_side_panel');
    //side_panel_splitbar.prepend(navBarMenuButton);
    //$('#btn_side_panel').prepend(side_panel_splitbar);
    return side_panel;
  };

  var delete_session = function () {
    Jupyter.notebook.session.delete();
  }

  function blur_element() {
    var focused = $(':focus');
    focused.blur();
  }

  // new JSTree
  function funcCreateFolder (node) {
    var pathnote = "";
    var typedir = "4-other";
    var typeaction = "allow";
    var locationnode = customUtils.getUserName();
    if (node) {
      if (node.id !== 'root' && node.text.toLowerCase() !== title_forhome_global.toLowerCase()) {
        pathnote = node.data.path;
        typedir = node.data.typedir;
        typeaction = node.data.typeaction;
        locationnode = node.data.path;
      }
    } else {
      var node = {
        id: 'root'
      }
    }
    Jupyter.notebook.contents.new_untitled(pathnote, {type: "directory"}).then(
      async function success(data) {
        // alert
        customUtils.show_header_message("New folder is created at location: " + locationnode + "/" + data.name);
        // create node
        if (data && elm_jstree_global){
          var newnode = [];
          newnode.push({
            title: data.name,
            name: data.name,
            path: data.path,
            type: data.type,
            writable: data.writable
          });
          var clonjson = await generateJsonTree(newnode, node.id, typedir, typeaction);
          elm_jstree_global.jstree(true).create_node(node.id, clonjson[0], "last", function (res) {}, 0);
        }
      }
    );
  }

  var createButton = function (iconClass, className, action, toolTip, btnText) {
    var btnCreateFolder = $('<button/>').attr({title: toolTip, class : className});
    if(iconClass) {
      var iIcon = $('<i/>').attr({class: iconClass});
      btnCreateFolder.append(iIcon);
    }
    if(btnText) {
      btnCreateFolder.text(btnText);
    }
    btnCreateFolder.click(function () {
      action();
    });
    return btnCreateFolder;
  }

  var createImageButton = function (icon, className, action, toolTip) {
    var btnCreateFolder = $('<button/>').attr({title: toolTip, class : className});
    //var iIcon = $('<img/>').attr({src : "/nbextensions/menu_stack/icons/" + icon});
    var iIcon = $('<img/>').attr({src : "https://dev.alphien.com/wikiapi/menu_stack/icons/" + icon});
    btnCreateFolder.append(iIcon);
    btnCreateFolder.click(function () {
      action();
    });
    return btnCreateFolder;
  }

  function isNotebook(type) {
    return type === 'notebook';
  }

  var slide_side_panel = function (main_panel, side_panel, desired_width) {
    // console.log('test');
    var anim_opts = {
      step: function (now, tween) {
        //main_panel.css('width', 100 - now + '%');
        main_panel.css('width', '100%');
      }
    };

    if (desired_width === undefined) {
      if (side_panel.is(':hidden')) {
        desired_width = (side_panel.data('last_width') || side_panel_start_width);
      }
      else {
        desired_width = 0;
      }
    }

    var visible = checkStatePanel();
    if (visible === undefined) {
      visible = desired_width > 0;
    }
    
    if (visible) {
      // show pannel
      main_panel.css({float: 'right', 'overflow-x': 'auto', 'max-width': '73%'});
      side_panel.show();
    } else {
      side_panel.hide();
      // riyan
      main_panel.css({float: '', 'overflow-x': '', width: '', 'max-width': '100%'});
      // old - version
      // anim_opts['complete'] = function () {
      //   side_panel.hide();
      //   console.log('hide')
      //   // riyan
      //   main_panel.css({float: '', 'overflow-x': '', width: '', 'max-width': '100%'});
      // };
    }
    
    // side_panel.animate({width: desired_width + '%'}, anim_opts);
    return visible;
  };

  var format_file_name = function (fileName) {
    return fileName.slice(0, -6);
  }

  // new function
    // get directory list - output json tree
    async function getChildrenDir (parentdir) {
      return Jupyter.notebook.contents.list_contents(parentdir.path).then(async function (list, error_msg) {
        var jsontree = [];
        jsontree = await generateJsonTree(list.content, parentdir.id, parentdir.typedir, parentdir.typeaction);
        return jsontree;
      });
    }

    // add node tree
    function openNodeTree (instance, obj) {
      if (instance) {
        instance.select_node(obj);
      }
    }

    // after rename - update node
    async function unpdateNodeRename(data, rename) {
      var inst = $.jstree.reference(data.reference);
      var obj = inst.get_node(data.reference);

      // replace node
      var replacenode = obj.data;
      replacenode.name = rename;
      replacenode.title = rename;
      replacenode.path = replacenode.parentName === '' ? replacenode.parentName + '' + rename : replacenode.parentName + '/' + rename ;
      var replacenodearr = [];
      replacenodearr.push(replacenode);
      var replacenodejs = await generateJsonTree(replacenodearr, obj.parent, replacenode.typedir, replacenode.typeaction);
      
      // delete node
      inst.delete_node(replacenode.id);
      // re-create node
      inst.create_node(
        obj.parent,
        replacenodejs[0],
        "last",
        function (res) {
          inst.select_node(res.id);
        },
        0
      );
    }

    // after delete - update node
    function unpdateNodeDelete(data) {
      var inst = $.jstree.reference(data.reference);
      var obj = inst.get_node(data.reference);
      var checkdel = null;
      if (inst.is_selected(obj)) {
        checkdel = inst.delete_node(inst.get_selected());
      } else {
        checkdel = inst.delete_node(obj);
      }
    }

    // after clone - update node
    async function unpdateNodeClone(data, note) {
      var inst = $.jstree.reference(data.reference);
      var obj = inst.get_node(data.reference);
      var parentpath = utils.url_path_split(note.path);
      var clonenew = [];
      clonenew.push({
        title: note.name,
        name: note.name,
        path: note.path,
        type: note.type,
        parentName: parentpath[0],
        children: [],
        writable: note.writable
      });
      var clonjson = await generateJsonTree(clonenew, obj.parents[0], obj.data.typedir, obj.data.typeaction);
      if (clonjson.length > 0) {
        for (var i = 0; i < clonjson.length; i++) {
          inst.create_node(obj.parents[0], clonjson[i], "last", function () {}, 0);
        }
      }
    }

    // after move - update node - not active
    function unpdateNodeMove (data) {
      // console.log(data);
    }

    // contextmenu - action for right click
    function customMenuTree (node) {
      // console.log(node);
      var activepath = Jupyter.notebook.notebook_path;
      var activenodeid = activepath.replace(/ /g,'%').replace(/\//g,'&');
      var isactivenode = activenodeid === node.id ? true : false;
      
      var items = {
        createFolderHome: {
          label: "Create new folder",
          icon: "fa fa-folder-o",
          _disabled: node.id === 'root' || (node.data.typeaction === 'allow' && node.data.title.toLowerCase() !== title_forhome_global.toLowerCase()) ? false : true,
          action: function (data) {
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            if (obj.data) {
              funcCreateFolder(obj);
            } else {
              console.log('Data not found');
            }
          }
        },
        createItem: {
          label: "Create new notebook",
          icon: "fa fa-file",
          _disabled: node.data.typeaction === 'strict' ? true : false,
          action: function (data) {
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            if (obj.data) {
              create_notebook({
                name: obj.data.name,
                path: obj.data.path,
                type: obj.data.type
              });
            } else {
              console.log('Data not found');
            }
          }
        },
        renameItem: {
          label: "Rename Notebook",
          icon: "fa fa-edit",
          _disabled: node.data.typeaction === 'strict' || isactivenode ? true : false,
          action: function (data) {
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            if (obj.data) {
              rename_notebook(obj.data, data);
            } else {
              console.log('Data not found');
            }
          }
        },
        renameFolder: {
          label: "Rename Folder",
          icon: "fa fa-edit",
          _disabled: node.data.typeaction === 'strict' || node.data.title.toLowerCase() === title_forhome_global.toLowerCase() ? true : false,
          action: function (data) {
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            if (obj.data) {
              // console.log(obj.data);
              var ddir = {
                name: obj.data.name,
                path: obj.data.path,
                type: obj.data.type
              }
              rename_folder(ddir, data)
            } else {
              console.log('Data not found');
            }
          }
        },
        deleteItem: {
          label: "Delete Notebook",
          icon: "fa fa-trash-o",
          _disabled: node.data.typeaction === 'strict' || isactivenode ? true : false,
          action: function (data) {
            var checkdel = null;
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            if (obj.data) {
              delete_notebook(obj.data, data);
            } else {
              console.log('Data not found');
            }
          }
        },
        deleteFolder: {
          label: "Delete Folder",
          icon: "fa fa-trash-o",
          _disabled: node.data.typeaction === 'strict' || node.data.title.toLowerCase() === title_forhome_global.toLowerCase() ? true : false,
          action: function (data) {
            var checkdel = null;
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            if (obj.data) {
              var ddir = {
                name: obj.data.name,
                path: obj.data.path,
                type: obj.data.type
              }
              delete_folder(ddir, data);
            } else {
              console.log('Data not found');
            }
          }
        },
        duplicateItem: {
          label: "Duplicate Notebook",
          icon: "fa fa-clone",
          _disabled: node.data.typeaction === 'strict' ? true : false,
          action: function (data) {
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            if (obj.data) {
              duplicate_notebook(obj.data, data);
            } else {
              console.log('Data not found');
            }
          }
        },
        // not use
        moveItem: {
          label: "Move Notebook",
          icon: "fa fa-arrows-alt",
          _disabled: node.data.typeaction === 'strict' ? true : false,
          action: function (data) {
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            if (obj.data) {
              move_notebook_custom(obj.data, data);
            } else {
              console.log('Data not found');
            }
          }
        },
        openNewPage: {
          label: "Open in New Tab",
          icon: "fa fa-external-link",
          separator_before: true,
          action: function (data) {
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            // notebook link
            var urlnote = siteurl + '/' + obj.data.path;
            window.open(urlnote, '_blank');
          }
        },
        copyUrl: {
          label: "Copy Notebook URL",
          icon: "fa fa-link",
          action: function (data) {
            var inst = $.jstree.reference(data.reference);
            var obj = inst.get_node(data.reference);
            
            // notebook link
            var urlnote = siteurl + '/' + obj.data.path;
            
            // create elm
            var dummy = document.createElement('input');
            document.body.appendChild(dummy);
            dummy.setAttribute('id', 'dummy_' + obj.data.id);
            document.getElementById('dummy_' + obj.data.id).value = urlnote;

            // select and copy
            dummy.select();
            document.execCommand('copy');
            
            // remove
            document.body.removeChild(dummy);
          }
        }
      };
      if (node.data.type === 'notebook') {
        delete items.createItem;
        delete items.renameFolder;
        delete items.deleteFolder;
        delete items.moveItem;
        delete items.createFolderHome;
      } else if (node.data.type === 'directory') {
        delete items.deleteItem;
        delete items.renameItem;
        delete items.moveItem;
        delete items.duplicateItem;
        delete items.moveItem;
        delete items.openNewPage;
        delete items.copyUrl;
      } else {
        // for root
        delete items.createItem;
        delete items.deleteItem;
        delete items.deleteFolder;
        delete items.renameItem;
        delete items.renameFolder;
        delete items.moveItem;
        delete items.duplicateItem;
        delete items.moveItem;
        delete items.openNewPage;
        delete items.copyUrl;
      }
      return items;
    }

    // generate tree in json format
    async function generateJsonTree (list, parent, typedir, typeaction) {
      typedir = typedir === undefined ? '4-other' : typedir;
      typeaction = typeaction === undefined ? 'allow' : typeaction;
      var allowlist = ['directory', 'notebook'];
      var jsontree = [];
      if (list.length > 0) {
        for (var j = 0; j < list.length; j++) {
          // put only allow list
          if (allowlist.indexOf(list[j].type) >= 0) {
            // let idlist = parent + '' + list[j].name.replace(/ /g,'') + '' + j;
            let idlist = list[j].path !== '' ? list[j].path.replace(/ /g,'%').replace(/\//g,'&') : list[j].name;
            let isfile = list[j].type === 'directory' ? false : true;
            let title = list[j].title === undefined ? list[j].name : list[j].title;
            let icon = isfile ? 'fa fa-file-o' : 'fa fa-folder';
            let hreflink = list[j].type === 'notebook' ? siteurl + '/' + list[j].path : '#';
            let parentpath = utils.url_path_split(list[j].path);
            jsontree.push({
              'id': idlist,
              'parent': parent,
              'text': list[j].name,
              'a_attr': {
                'href': hreflink,
                'title': title,
              },
              'li_attr' : {
                'class' : "custom_node_" + typedir
              },
              'icon' : icon,
              // 'state': {'opened': false},
              'data' : {
                'id': idlist,
                'file': isfile,
                'type': list[j].type,
                'name': list[j].name,
                'path': list[j].path,
                'title': title,
                'typedir': typedir,
                'typeaction': typeaction,
                'parentName': parentpath[0],
                'writable': list[j].writable
              }
            });
          }
        }
      }
      // sorting children list
      jsontree.sort(function(a,b) {return (a.text > b.text) ? 1 : ((b.text > a.text) ? -1 : 0);} );
      return jsontree;
    }

    // initialize tree
    async function buildListTree (parentElement, items, teamlist) {
      var listpaper = [];
      var listpaperTeam = [];
      var listTeam = [];
      var listOthers = [];
      var listAll = [];
      var listAllTree = [];
      for (var i = 0; i < items.length; i++) {
        items[i].typedir = '4-other';
        items[i].typeaction = 'allow';
        // for notebook list
        if (isNotebook(items[i].type)) {
          items[i].typedir = '5-other';
          listOthers.push(items[i]);
        } else {
          // for folder list
          if (teamlist.indexOf(items[i].name) >= 0) {
            // team folder
            items[i].typedir = '3-teamdir';
            listTeam.push(items[i]);
          } else {
            if (items[i].name.split('paperTrading').length > 1) {
              // paperTrading folder
              items[i].typeaction = 'strict';
              if (items[i].name == 'paperTrading') {
                items[i].typedir = '1-paperdir';
                listpaper.push(items[i]);
              } else {
                items[i].typedir = '2-paperteamdir';
                listpaperTeam.push(items[i]);
              }
            } else {
              // other folder
              var upperCaseList = list_folder_private.map(function(value) {
                return value.toUpperCase();
              });
              if (upperCaseList.indexOf(items[i].name.toUpperCase()) >= 0) {
                items[i].typeaction = 'strict';
              }
              listOthers.push(items[i]);
            }
          }
        }
      }
      listAll = listpaper.concat(listpaperTeam, listTeam, listOthers);
      var jsonlisttree = [];
      var itemjson = [];
      var idroot = 'root';
      
      // root
      var textroot = customUtils.getUserName();
      jsonlisttree.push({
        'id': idroot,
        'parent': "#",
        'text': textroot,
        // 'state': {'opened': true},
        'icon' : 'fa fa-folder',
        'data' : {
          'id': idroot,
          'file': 'root',
          'type': 'root',
          'name': textroot,
          'path': 'root',
          'title': textroot,
          'typedir': '4-other',
          'typeaction': 'allow',
          'parentName': '',
          'writable': false
        }
      });

      // folder L1
      for (var i = 0; i < listAll.length; i++) {
        itemjson = [];
        // let idlist = idroot + '' + listAll[i].name.replace(/ /g,'') + '' + i;
        let idlist = listAll[i].path !== '' ? listAll[i].path.replace(/ /g,'%').replace(/\//g,'&') : listAll[i].name;
        let isfile = listAll[i].type === 'directory' ? false : true;
        let icon = isfile ? 'fa fa-file-o' : 'fa fa-folder';
        let hreflink = listAll[i].type === 'notebook' ? siteurl + '/' + listAll[i].path : '#';
        let parentpath = utils.url_path_split(listAll[i].path);
        itemjson.push({
          'id': idlist,
          'parent': idroot,
          'text': listAll[i].name,
          'a_attr': {
            'href': hreflink,
            'title': listAll[i].title,
          },
          'li_attr' : {
            'class' : "custom_node_" + listAll[i].typedir
          },
          'icon' : icon,
          // 'state': {'opened': false},
          'data' : {
            'id': idlist,
            'file': isfile,
            'type': listAll[i].type,
            'name': listAll[i].name,
            'path': listAll[i].path,
            'title': listAll[i].title,
            'typedir': listAll[i].typedir,
            'typeaction': listAll[i].typeaction,
            'parentName': parentpath[0],
            'writable': listAll[i].writable
          }
        });

        // if has children
        var childlist = listAll[i].children;
        if (childlist.length > 0) {
          var childjson = await generateJsonTree(childlist, idlist, listAll[i].typedir, listAll[i].typeaction);
          if (childjson.length > 0) {
            itemjson = itemjson.concat(childjson);
          }
        }

        // merge array
        jsonlisttree = jsonlisttree.concat(itemjson);
      }
      list_folder_global = jsonlisttree;
      
      // generate tree
      $(document).ready(function(){
        var jstreeInit = null;
        jstreeInit = parentElement.jstree({
          "core" : {
            // so that create works
            // "check_callback" : true,
            "check_callback" : function (op, node, par, pos, more) {
              if ((op === "move_node" || op === "copy_node") && more && more.core) {
                var confmove = confirm('Are you sure to move "' + node.data.path + '"?')
                if (confmove) {
                  var activepath = Jupyter.notebook.notebook_path;
                  var activenodeid = activepath.replace(/ /g,'%').replace(/\//g,'&');
                  var datanodeactive = elm_jstree_global.jstree(true).get_node(activenodeid);
                  var isFolderActive = false;
                  if (datanodeactive.parents.indexOf(node.id) >= 0) {
                    isFolderActive = true;
                  }
                  var datanode = node.data;
                  if (datanode.typeaction === 'allow') {
                    if (datanode.type === 'notebook') {
                      // for notebook active
                      if (activenodeid === datanode.id) {
                        customUtils.show_warning_message('You can not move the active notebook!');
                        return false;
                      } else {
                        return true;
                      }
                    } else {
                      // for folder active
                      if (isFolderActive) {
                        customUtils.show_warning_message('You can not move the active folder!');
                        return false;
                      } else {
                        return true;
                      }
                    }
                  } else {
                    customUtils.show_warning_message('You can not move this notebook/folder!');
                    return false;
                  }
                } else {
                  return false
                }
              }
              return true
            },
            "data": jsonlisttree
          },
          "plugins" : ["html_data", "contextmenu", "dnd", "unique", "sort", "search", "state"],     
          "contextmenu":{
            "items": customMenuTree
          },
          "state": {
            "key" : "alnotebooktree",
            "preserve_loaded" : true
          },
          "dnd": {
            // "is_draggable": function (data) {
            //   var activepath = Jupyter.notebook.notebook_path;
            //   var activenodeid = activepath.replace(/ /g,'%').replace(/\//g,'&');
            //   var datanodeactive = elm_jstree_global.jstree(true).get_node(activenodeid);
            //   var isFolderActive = false;
            //   if (datanodeactive.parents.indexOf(data[0].id) >= 0) {
            //     isFolderActive = true;
            //   }
              
            //   var datanode = data[0].data;
            //   if (datanode.typeaction === 'allow') {
            //     if (datanode.type === 'notebook') {
            //       // for notebook active
            //       if (activenodeid === datanode.id) {
            //         return false;
            //       } else {
            //         return true;
            //       }
            //     } else {
            //       // for folder active
            //       if (isFolderActive) {
            //         return false;
            //       } else {
            //         return true;
            //       }
            //     }
            //   } else {
            //     return false;
            //   }
            // }
          },
          "sort": function (a, b) {
            let a1 = this.get_node(a);
            let b1 = this.get_node(b);
            if (a1.data.typedir === b1.data.typedir){
              return (a1.text.toLowerCase() > b1.text.toLowerCase()) ? 1 : -1;
            } else {
              return (a1.data.typedir > b1.data.typedir) ? 1 : -1;
            }
          }
        });

        jstreeInit.bind("move_node.jstree", async function (e, data) {
          var instance = data.instance;
          var oldinstance = data.instance.get_node(data.old_parent);
          var newinstance = data.new_instance.get_node(data.parent);
          var node = data.node;
          var olditem = oldinstance.data;
          var newitem = newinstance.data;

          // for rollback
          var rollbacknode = node.data;
          var rollbacknodearr = [];
          rollbacknodearr.push(rollbacknode);
          var roolbacknodejs = await generateJsonTree(rollbacknodearr, oldinstance.id, olditem.typedir, olditem.typeaction);

          // for replace
          var replacenode = node.data;

          // type node
          var typenode = node.data.type;

          if (newinstance.data.typeaction === 'allow') {
            var that = Jupyter.notebook;

            var item_path = node.data.path;
            var item_name = node.data.name;

            // Construct the new path using the user input and the item's name.
            var new_path = utils.url_path_join(newitem.path, item_name);

            replacenode.parentName = newitem.path;
            replacenode.path = new_path;
            replacenode.typeaction = newitem.typeaction;
            replacenode.typedir = newitem.typedir;

            var replacenodearr = [];
            replacenodearr.push(replacenode);
            var replacenodejs = await generateJsonTree(replacenodearr, newinstance.id, newitem.typedir, newitem.typeaction);

            that.contents.rename(item_path, new_path).then(function(data) {
              // delete node
              instance.delete_node(replacenode.id);
              // re-create node
              instance.create_node(newinstance.id, replacenodejs[0], "last", function () {}, 0);
              let msgShow = "Notebook:" + item_path + ". Success moved to: " + new_path;
              if (typenode === 'directory') {
                msgShow = "Directory:" + item_path + ". Success moved to: " + new_path;
              }
              customUtils.show_header_message(msgShow);
            }).catch(function(e) {
              // delete node
              instance.delete_node(replacenode.id);
              // re-create node
              instance.create_node(oldinstance.id, roolbacknodejs[0], "last", function () {}, 0);
              customUtils.show_error_message(e.message || e);
            });
          } else {
            // delete node
            instance.delete_node(replacenode.id);
            // re-create node
            instance.create_node(oldinstance.id, roolbacknodejs[0], "last", function () {}, 0);
            let msgShow = "This file can't move to folder: " + newinstance.data.path;
            if (typenode === 'directory') {
              msgShow = "This directory can't move to: " + newinstance.data.path;
            }
            customUtils.show_error_message(msgShow);
          }

          // console.log(data);
          // console.log(resmove);
        });

        jstreeInit.bind("dblclick.jstree", async function (e) {
          var instance = $.jstree.reference(this);
          var node = instance.get_node(e.target);
          var urlnote = '#';
          if (node.data.type === 'directory') {
            if (node.children.length <= 0) {
              syncChildDir(parentElement, node, true, false);
            }
          } else if (node.data.type === 'notebook') {
            // notebook link
            urlnote = siteurl + '/' + node.data.path;
            window.open(urlnote, '_parent');
          }
        });

        jstreeInit.bind('ready.jstree', async function (e, data) {
          var instance = $.jstree.reference(this);
          // to select notebook on default
          var activepath = Jupyter.notebook.notebook_path;
          var activenodeid = activepath.replace(/ /g,'%').replace(/\//g,'&');
          if (activenodeid !== '') {
            // check until node generated
            var looplimit = 0;
            var loopcheck = setInterval(function(){
              let checkselect = instance.get_node(activenodeid);
              if (checkselect || looplimit >= 45) {
                let arrNodeSelect = checkselect.parents;
                arrNodeSelect.push(checkselect.id);
                checkselect.a_attr.class += ' alp-active-note';
                instance.select_node(activenodeid);
                instance.set_icon(arrNodeSelect, 'fa fa-eye');
                
                // restore state
                // setTimeout(function(){ instance.restore_state(); }, 1500);
                instance.restore_state();

                // scroll to selectednote
                setTimeout(function(){
                  var jstreeelm = document.getElementById('side_panel_list');
                  var elmselected = document.getElementById(checkselect.id);
                  var elmselectedpos = elmselected.getBoundingClientRect();
                  elmselected.scrollIntoView()
                  // var newpos = jstreeelm.offsetHeight/2;
                  // console.log(newpos)
                  // console.log(elmselected.getBoundingClientRect())
                  // console.log(elmselected.offsetTop)
                  // console.log(jstreeelm.offsetHeight)
                  // jstreeelm.scrollTop = newpos;
                }, 500);
                
                clearInterval(loopcheck);
              }
              looplimit++;
            }, 1500);
          }
        });

        // disabled keyboard for spesific element
        Jupyter.notebook.keyboard_manager.register_events(elm_search_global);
        // search plugin
        var toClear = false;
        elm_search_global.keyup(function () {
          if(toClear) {
            clearTimeout(toClear);
          }
          toClear = setTimeout(function () {
            var v = elm_search_global.val();
            elm_jstree_global.jstree(true).search(v);
          }, 250);
        });
      });

      parentElement.on('keydown.jstree', '.jstree-anchor', function (e) {
        return false;
      });
      
      // sync child in backgroud
      syncChildInBackground(parentElement, jsonlisttree);

      // $(document).bind("dnd_start.vakata", function (e, data) {
      //   console.log('start');
      //   // var node = data.data.origin.get_node(data.data.nodes[0]);
      // }).bind("dnd_move.vakata", function(e, data) {
      //   console.log("Move dnd");
      // }).bind("dnd_stop.vakata", function (e, data) {
      //   console.log('stop');
      // });
    }

    // sync folder in backgroud process - 3 level
    async function syncChildInBackground (parentElement, parentlist) {
      for (var i = 0; i < parentlist.length; i++) {
        if (parentlist[i].data.type === 'directory' && parentlist[i].data.name.toLowerCase() !== title_forhome_global.toLowerCase()) {
          syncChildDir(parentElement, parentlist[i], false, true);
        }
      }
    }

    // param: element tree, parent node, is open folder, is recursive
    async function syncChildDir (parentElement, node, open, isRecursive) {
      let newnode = await getChildrenDir(node.data);
      if (newnode.length > 0) {
        // create node
        for (var i = 0; i < newnode.length; i++) {
          parentElement.jstree().create_node(node.id, newnode[i], "last", function () {}, 0);
          
          // recursive - deep scan
          if (isRecursive === true && newnode[i].data.type === 'directory') {
            syncChildDir(parentElement, newnode[i], false, false);
          }
        }

        // create node and refresh
        // list_folder_global = list_folder_global.concat(newnode);
        // parentElement.jstree(true).settings.core.data = list_folder_global;
        // parentElement.jstree(true).refresh({'skip_loading': true, 'forget_state': false});
        
        // open folder
        if (open === true) {
          parentElement.jstree().open_node(node.id, function(){;}, false);
        }
      }
    }

    // get list notebook by path
    var getContentNotebook = function (path) {
      return Jupyter.notebook.contents.list_contents(path).then(function (listnote, error_msg){
        var childnote = [];
        for (var j = 0; j < listnote.content.length; j++) {
          let modelnote = listnote.content[j];
          let parentpath = utils.url_path_split(modelnote.path);
          childnote.push({
            title: modelnote.name,
            name: modelnote.name,
            path: modelnote.path,
            type: modelnote.type,
            parentName: parentpath[0],
            writable: modelnote.writable
          });
        }
        return childnote;
      });
    }

    // generate side panel - folder level 1
    var generate_side_panel = function (side_panel) {
      var homelists = [];
      var teamlists = [];
      var home = {title: title_forhome_global, name: title_forhome_global, path: "", type: "directory"};
      home.children = [];
      var model = null;
      var side_panel_list = side_panel.find('.side_panel_list');
      // put element
      elm_jstree_global = side_panel_list;
      Jupyter.notebook.contents.list_contents("").then(function (result) {
        // home dir
        for (var i = 0; i < result.content.length; i++) {
          model = result.content[i];
          if (model.type == 'directory') {
            homelists.push({
              title: model.name,
              name: model.name,
              path: model.path,
              type: model.type,
              parentName: "",
              children: [],
              writable: model.writable
            });
          } else if (isNotebook(model.type)) {
            homelists.push({
              title: model.name,
              name: model.name,
              path: model.path,
              type: model.type,
              parentName: "",
              children: [],
              writable: model.writable
            });
            // home.children.push({
            //   title: model.name,
            //   name: model.name,
            //   path: model.path,
            //   type: model.type,
            //   parentName: "",
            //   writable: model.writable
            // });
          }
        }
        // homelists.push(home);
        // team dir
        notebook_data.getTeamList(customUtils.getUserName()).then(function (resli) {
          if (resli.status == 'SUCCESS') {
            for (var i = 0; i < resli.data.length; i++) {
              teamlists.push(resli.data[i].Team);
            }
          }
          buildListTree(side_panel_list, homelists, teamlists);
        });
      });
    }
  // new function end

  var buildSidePanelMain = function() {
    var main_panel = $('#site');
    var side_panel = $('#side_panel');
    var side_panel_test = $('<div id="side_panel_test" class="demo"/>');

    if (side_panel.length < 1) {
      side_panel = $('<div id="side_panel"/>');
      var side_panel_inner_header = $('<div id="side_panel_inner_header" class="side_panel_inner_header"/>');
      var div_buttons = $("<ul/>");
      var folderDiv = $("<div style='padding-top: 2px'/>");
      var fileDiv = $("<div/>");
      var helpDiv = $("<div style='padding-top: 2px'/>");
      div_buttons.append(fileDiv);
      div_buttons.append(folderDiv);
      div_buttons.append(helpDiv);

      var helplink = $("<button/>").attr({title: 'Only folders with .ipynb files will be shown', class: 'side-panel-btn'});
      var helpicon = $('<img/>').attr({src : "https://dev.alphien.com/wikiapi/menu_stack/icons/HelpFolder_Icon.png"});
      helplink.append(helpicon);
      helplink.css('cursor', 'default');

      folderDiv.append(createImageButton("NewFolder_Icon.png", "side-panel-btn", funcCreateFolder, "Create new folder")).append(" New Folder");
      fileDiv.append(createImageButton("NewNotebook_Icon.png", "side-panel-btn", function() {create_notebook({path: ""})} , "Create new notebook")).append(" New Notebook");
      // helpDiv.append(helplink).append("Folder Info");

      side_panel.append(side_panel_test);
      side_panel.append(side_panel_inner_header);
      side_panel_inner_header.append(div_buttons);
      side_panel.append($("<hr/>"));

      build_side_panel(main_panel, side_panel);
      // new list
      generate_side_panel(side_panel);
    }
  }

  var setStatePanel = function (visible) {
    console.log('setState');
    console.log(visible);
    $('#btn_side_panel').toggleClass('active', visible);
    window.localStorage.setItem('alnotepanel', visible);
  }

  var checkStatePanel = function () {
    var visible = true;
    var statepanel = window.localStorage.getItem('alnotepanel');
    if (statepanel !== undefined && statepanel !== '') {
      visible = statepanel;
    }
    return JSON.parse(visible);
  }

  // on click menu togle
  var toggleSidePanel = function () {
    // get state and update
    var checkstate = checkStatePanel();
    setStatePanel(!checkstate);
    
    // build panel
    //var main_panel = $('#notebook_panel');
    var main_panel = $('#site');
    var side_panel = $('#side_panel');
    buildSidePanelMain();
    
    // show hide
    var visible = slide_side_panel(main_panel, side_panel);
    var btnSidePanelIcon = $('#btn_side_panel').find("i");
    if(visible) {
      btnSidePanelIcon.attr({title: "Hide menu"})
    } else {
      btnSidePanelIcon.attr({title: "Show menu"})
    }
    return visible;
  };

  // init panel
  var initPanelCheck = function () {
    var main_panel = $('#site');
    var side_panel = $('#side_panel');
    slide_side_panel (main_panel, side_panel)
  }
  // initPanelCheck()

  // not use
  var open_notebook = function (e) {
    var w = window.open('', '_self');
    var url = utils.url_path_join(
      Jupyter.notebook.base_url, 'notebooks'
    );
    url += "/" + e.getAttribute("path");
    w.location = url;
  }

  var duplicate_notebook = function (e, datanode) {
    require(['notebook/js/notebook'], function on_success(notebook) {
      // get home notebook list
      var cbHomeList = Jupyter.notebook.contents.list_contents('').then(function (list) {
        var listhome = [];
        for (var i = 0; i < list.content.length; i++) {
          if (list.content[i].type == 'notebook') {
            listhome.push(list.content[i].name);
          }
        }
        return listhome;
      });
      var today = new Date();
      var datestr = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();

      var parentFolder = utils.url_path_split(e.path)[0];
      var copyToFolder;
      var parent_path = parentFolder.split('/');
      if(parent_path[0].toLowerCase() === 'Notebooks'.toLowerCase()) {
        copyToFolder = "";
      } else {
        copyToFolder = parentFolder;
      }
      // reset meta data - temp
      var originalMeta = null;
      var modelnew = null;
      var alreadysubmit = meta.isNotebookSubmitted();
      if (alreadysubmit) {
        originalMeta = meta.getNotebookMeta();
        meta.setNotebookMeta(null);
        modelnew = {
          type : "notebook",
          content : Jupyter.notebook.toJSON()
        };
      }
      // rootname
      var rootname = customUtils.getUserName();

      if (parent_path[0].toLowerCase() === 'Notebooks'.toLowerCase()) {
        // not active
        cbHomeList.then(function (listhome) {
          var namefilecheck = e.name.replace('.ipynb', '');
          var renamecheck = namefilecheck + ' (' + datestr + ').ipynb';
          var hreflink = utils.url_path_join(
            Jupyter.notebook.base_url, 'notebooks'
          );
          if (listhome.indexOf(renamecheck) == -1) {
            // rename
            return Jupyter.notebook.contents.save(renamecheck, modelnew).then(
              function (data) {
                meta.setNotebookMetaFromMetaData(originalMeta);
                customUtils.show_header_message("This notebook is read-only. New notebook will be created at location: " + rootname + "/" + data.name);
                notebook_actions.updateCloneCount();

                // // new - ChangeJstree
                // if (datanode) {
                //   unpdateNodeClone(datanode);
                // }
                setTimeout(sidePanel.refresh_notebook_bypath(data.path), 1000);
              },
              function (error) {
                customUtils.show_error_message(error.message || error);
              }
            );
          } else {
            hreflink += "/" + renamecheck;
            // console.log(hreflink);
            var modalconf = customUtils.show_modal_confirm("Confirmation","This notebook has already been cloned today at: <a href='" + hreflink + "'>" + rootname + "/" + renamecheck + "</a>. <br/> Do you want to replace it?");
            $(modalconf).find('.btn-warning').click(function () {
              // rename
              return Jupyter.notebook.contents.save(renamecheck, modelnew).then(
                function (data) {
                  meta.setNotebookMetaFromMetaData(originalMeta);
                  customUtils.show_header_message("Your notebook in: " + rootname + "/" + data.name + " replaced!");
                  notebook_actions.updateCloneCount();
                  
                  // // new - ChangeJstree
                  // if (datanode) {
                  //   unpdateNodeClone(datanode);
                  // }
                  setTimeout(sidePanel.refresh_notebook_bypath(data.path), 1000);
                },
                function (error) {
                  customUtils.show_error_message(error.message || error);
                }
              );
            });
          }
        });
      } else {
        // copy content new
        return Jupyter.notebook.contents.copy(e.path, copyToFolder).then(
          function (data) {
            var pathnew = data.path;
            if (modelnew !== null) {
              // update content new - remove meta data
              Jupyter.notebook.contents.save(pathnew, modelnew).then(
                function (datasave) {
                  // set back meta - temp
                  meta.setNotebookMetaFromMetaData(originalMeta);
                  customUtils.show_header_message("Success duplicate notebook at location: " + pathnew);
                },
                function (error) {
                  console.log('14')
                  customUtils.show_error_message(error.message || error);
                }
              );
            } else {
              customUtils.show_header_message("Success duplicate notebook at location: " + pathnew);
            }
            // new - ChangeJstree
            if (datanode) {
              unpdateNodeClone(datanode, data);
            }
          },
          function (err) {
            console.log('15')
            customUtils.show_error_message(err.message || err);
          }
        );
      }
    }, function reject() {
      console.log(this.writable + "ERROR");
    });
  };

  var delete_notebook = function (e, datanode) {
    Jupyter.notebook.contents.delete(e.path).then(function success() {
      if (datanode) {
        // new - ChangeJstree
        customUtils.show_header_message("Success delete notebook at: " + e.path);
        unpdateNodeDelete(datanode);
      }
    }).catch(function (err) {
      customUtils.show_error_message(err.message || err);
      console.warn('Error during deleting :', err);
    });
  }

  // new notebook - get param
  function getURLParameter (name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
  }

  // new notebook - update meta
  function updateMetaKernelspec () {
    Jupyter.notebook.save_notebook();
  }

  // check new notebook
  if (getURLParameter('newnotebook') == 'true') {
    updateMetaKernelspec()
  }
  
  // create new notebook
  var create_notebook = function (e) {
    var parentFolder = e.path;
    Jupyter.notebook.contents.new_untitled(parentFolder, {type: "notebook"}).then(
      function success(data) {
        var w = window.open('', '_self');
        var url = utils.url_path_join(
          Jupyter.notebook.base_url, 'notebooks',
          utils.encode_uri_components(data.path)
        );
        url += "?newnotebook=true"
        if (menu_stack_custom.kernel_name) {
          url += "&kernel_name=" + menu_stack_custom.kernel_name;
        }
        w.location = url;
      }
    ).catch(function (err) {
      customUtils.show_error_message(err.message || err);
      console.warn('Error during creating :', err);
    });
  }

  // not active
  var move_notebook_custom = function (e, datanode) {
    var listfolder = [];
    // slelect theme
    var div_select_elm = $('<div/>', {
      id: 'select_folder_elm_id'
    });
    var select_elm = '';

    Jupyter.notebook.contents.list_contents("").then(function success(data) {
      if (data.content) {
        select_elm = $("<select id='folder_access_id' style='margin: 0px;'></select>").addClass('form-control');
        var dlist = data.content;
        var hidefolder = ['R', 'submittedNotebook', 'NotebookSubmission'];
        for (var i = 0; i < dlist.length; i++) {
          if (dlist[i].type === 'directory' && dlist[i].writable) {
            if (hidefolder.indexOf(dlist[i].name) < 0) {
              $(select_elm).append($("<option></option>").attr("value",dlist[i].name).text(dlist[i].name)); 
              listfolder.push(dlist[i]);
            }
          }
        }
        div_select_elm.append(select_elm);
      }
    });
    
    var selectednote = [];
    selectednote.push(e);
    var num_items = selectednote.length;
    var parent_path = e.parentName;
    
    // Open a dialog to enter the new path, with current path as default.
    if (parent_path !== '') {
      // parent_path = utils.url_path_join('/', parent_path)
    }
    var input = $('<input/>').attr('type','text').attr('size','25').addClass('form-control').val(parent_path);
    var dialog_body = $('<div/>').
      append(
        $("<p/>").addClass("rename-message")
          .text('Enter a new destination directory path for this item')
      ).append(
        $("<br/>")
      ).append(
        $("<div/>").append(
          $("<span/>").text(utils.get_body_data("baseUrl")).addClass("server-root")
        ).append(
          input
        ).addClass("move-path")
      );
    var that = Jupyter.notebook;
    var d = dialog.modal({
      title : 'Move an Item',
      body : dialog_body,
      keyboard_manager: Jupyter.notebook.keyboard_manager,
      default_button: "Cancel",
      buttons : {
        Cancel : {},
        Move : {
          class: "btn-primary",
          click: function() {
            // Move all the items.
            selectednote.forEach(function(item) {
              var item_path = item.path;
              var item_name = item.name;
              // Construct the new path using the user input and the item's name.
              var new_path = utils.url_path_join(input.val(), item_name);
              that.contents.rename(item_path, new_path).then(function() {
                // After each move finishes, reload the list.
                customUtils.show_header_message("Notebook:" + item_path + ". Success moved to: " + new_path);
                
                // new - ChangeJstree
                if (datanode) {
                  unpdateNodeMove(datanode);
                }
                // setTimeout(sidePanel.refresh_notebook_bypath(new_path), 1000);
              }).catch(function(e) {
                // If any of the moves fails, show this dialog for that move.
                var failmsg = i18n.msg._("An error occurred while moving \"%1$s\" from \"%2$s\" to \"%3$s\".");
                dialog.modal({
                  title: i18n.msg._("Move Failed"),
                  body: $('<div/>')
                    .text(i18n.msg.sprintf(failmsg,item_name,item_path,new_path))
                    .append($('<div/>')
                    .addClass('alert alert-danger')
                    .text(e.message || e)),
                  buttons: {
                    OK: {'class': 'btn-primary'}
                  }
                });
                console.warn('Error during moving :', e);
              });
            });  // End of forEach.
          }
        }
      },
      // TODO: Consider adding fancier UI per Issue #941.
      open : function () {
        // Upon ENTER, click the OK button.
        input.keydown(function (event) {
          if (event.which === keyboard.keycodes.enter) {
            d.find('.btn-primary').first().click();
            return false;
          }
        });
        // Put the cursor at the end of the input.
        input.focus();
      }
    });
  }

  var rename_notebook = function (e, datanode) {
    var item_path = e.path;
    var parentFolder = utils.url_path_split(item_path)[0];
    var item_name = format_file_name(e.name);
    var rename_msg = 'Enter a new notebook name:';
    var rename_title = 'Rename file';
    var button_labels = ["Cancel", "Rename"];
    var input = $('<input/>').attr('type', 'text').attr('size', '25').addClass('form-control')
      .val(item_name);

    var dialog_body = $('<div/>').append(
      $("<p/>").addClass("rename-message")
        .text(rename_msg)
    ).append(
      $("<br/>")
    ).append(input);

    // riyan
    var c_btn_rename = '';
    var parent_path = item_path.split('/');
    // console.log(parent_path);
    if(parent_path[0].toLowerCase() == 'notebooks'){
      c_btn_rename = 'hide';
      dialog_body = $('<div/>')
        .append($('<div/>')
          .addClass('alert')
          .addClass('alert alert-danger')
          .html('This notebook is read-only.'));
    }
    // riyan - end

    var d = dialog.modal({
      title: rename_title,
      body: dialog_body,
      keyboard_manager: Jupyter.notebook.keyboard_manager,
      default_button: "Cancel",
      buttons: {
        Cancel: {},
        Rename: {
          class: "btn-primary " + c_btn_rename,
          click: function () {
            if (customUtils.validNotebookName(input.val()) && c_btn_rename == '') {
              if (e.isUpdate) {
                Jupyter.notebook.rename(input.val()).then(function () {
                }).catch(function (err) {
                  customUtils.show_error_message(err.message || err);
                  console.warn('Error during renaming :', err);
                });
              } else {
                Jupyter.notebook.contents.rename(item_path, utils.url_path_join(parentFolder, input.val() + ".ipynb")).then(function () {
                  // new - ChangeJstree
                  if (datanode) {
                    var ipname = input.val() + '.ipynb';
                    unpdateNodeRename(datanode, ipname);
                  }
                }).catch(function (err) {
                  customUtils.show_error_message(err.message || err);
                  console.warn('Error during renaming :', err);
                });
              }
            } else {
              customUtils.show_header_error_message("notebook name can not contain special characters");
              // console.warn('Error during renaming :', err);
              return false;
            }
          }
        }
      },
      open: function () {
        // Upon ENTER, click the OK button.
        input.keydown(function (event) {
          if (event.which === keyboard.keycodes.enter) {
            d.find('.btn-primary').first().click();
            return false;
          }
        });
        input.focus();
        if (input.val().indexOf(".") > 0) {
          input[0].setSelectionRange(0, input.val().indexOf("."));
        } else {
          input.select();
        }
      }
    });
  }

  var rename_folder = function (e, datanode) {
    var item_path = e.path;
    var parentFolder = utils.url_path_split(item_path)[0];
    var item_name = e.name;
    var rename_msg = 'Enter a new folder name:';
    var rename_title = 'Rename folder';
    var button_labels = ["Cancel", "Rename"];
    var input = $('<input/>').attr('type', 'text').attr('size', '25').addClass('form-control')
      .val(item_name);

    var dialog_body = $('<div/>').append(
      $("<p/>").addClass("rename-message").text(rename_msg)
    ).append(
      $("<br/>")
    ).append(input);

    var d = dialog.modal({
      title: rename_title,
      body: dialog_body,
      keyboard_manager: Jupyter.notebook.keyboard_manager,
      default_button: "Cancel",
      buttons: {
        Cancel: {},
        Rename: {
          class: "btn-primary",
          click: function () {
            Jupyter.notebook.contents.rename(item_path, utils.url_path_join(parentFolder, input.val())).then(function () {
              // new - ChangeJstree
              if (datanode) {
                var ipname = input.val();
                unpdateNodeRename(datanode, ipname);
              }
            }).catch(function (err) {
              customUtils.show_error_message(err.message || err);
              console.warn('Error during renaming :', err);
            });
          }
        }
      },
      open: function () {
        // Upon ENTER, click the OK button.
        input.keydown(function (event) {
          if (event.which === keyboard.keycodes.enter) {
            d.find('.btn-primary').first().click();
            return false;
          }
        });
        input.focus();
        if (input.val().indexOf(".") > 0) {
          input[0].setSelectionRange(0, input.val().indexOf("."));
        } else {
          input.select();
        }
      }
    });
  }

  var delete_folder = function (e, datanode) {
    Jupyter.notebook.contents.delete(e.path).then(function success() {
      if (datanode) {
        // new - ChangeJstree
        customUtils.show_header_message("Success delete folder at: " + e.path);
        unpdateNodeDelete(datanode);
      }
    }).catch(function (err) {
      customUtils.show_warning_message(err.message || err);
      console.warn('Error during delete :', err);
    });
  }

  // new JSTree
  var refresh_notebook_bypath = function (path) {
    if (path !== '' && siteurl !== '') {
      var urlnote = siteurl + '/' + path.replace(/ /gi, '_');
      window.open(urlnote, '_parent');
    }
    // console.log(path);
  }

  return {
    initialize: initialize,
    refresh_notebook_bypath: refresh_notebook_bypath,
    createButton: createButton,
    toggleSidePanel: toggleSidePanel,
    rename_notebook:rename_notebook
  };

});
