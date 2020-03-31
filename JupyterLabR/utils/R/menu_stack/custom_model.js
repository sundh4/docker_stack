define('nbextensions/menu_stack/custom_model', [
  'base/js/namespace',
  'jquery',
  'base/js/dialog',
  'base/js/keyboard',
  './notebook_actions',
  './notebook_data',
  './meta',
  './logger',
  './utils',
  './side_panel',
  './moment/moment',
], function (Jupyter, $, dialog, keyboard, notebook_actions, notebook_data, meta, _logger, utils, panel, moment) {
  var header = "Submit";
  var strConfirmFunc = "submitClick()";
  var btnText = "Submit";

  function showSubmitDialog() {
    if(meta.isNotebookSubmitted()) {
      notebook_actions.getNotebookDetail().then(function (response) {
        if (utils.isSucessResponse(response)) {
          if(response.data.status !== 'APPROVED') {
            // riyan
            notebook_data.getFolderAccess(utils.getUserName()).then(function (res) {
              let resfolder = res;
              notebook_data.getTeamList(utils.getUserName()).then(function (resli) {
                let resteam = resli;
                notebook_data.getAlphathon(utils.getUserName()).then(function (resli2) {
                  openModal('renderModal', header, strConfirmFunc, btnText, response.data, resfolder.data, resteam.data, resli2.data);
                });
              });
            });
            // openModal('renderModal', header, strConfirmFunc, btnText, response.data);
          } else {
            utils.show_header_message("This notebook is already approved");
          }
        } else {
          utils.show_header_error_message("Error while retrieving notebook info");
        }
      });
    } else {
      notebook_data.getFolderAccess(utils.getUserName()).then(function (res) {
        let resfolder = res;
        notebook_data.getTeamList(utils.getUserName()).then(function (resli) {
          let resteam = resli;
          notebook_data.getAlphathon(utils.getUserName()).then(function (resli2) {
            openModal('renderModal', header, strConfirmFunc, btnText, {}, resfolder.data, resteam.data, resli2.data);
          })
        });
      });
    }
  }

  // change disabled status - riyan
  function changeDisabeledForm (id, status) {
    if ($('#' + id).length) {
      $('#' + id).prop('disabled', status);
    }
  }

  function openModal(placementId, heading, strConfirmFunc, btnText, notebookData, folderList, teamList, competition) {
    // data submit
    var d_teamcom = '';
    // other
    var rename_title = 'Submission Window';
    var button_labels = ["Submit", "Cancel"];
    var label_warning = "";
    var showSubmittedLabel = false;
    var input = $('<textarea style="display: none;" id ="txtDescription" rows="4" cols="50" disabled/>').addClass('form-control');
    //var label_name= $('<label><strong>Name</strong>  NewNotebook name</label>');
    var label_description = $('<label style="display: none;"><strong>Terms and Conditions</strong></label>');

    var divelm_checktnc_elm = $('<div/>', {
      id: 'div_tnc_elm_id',
      style: 'margin-top: 10px;'
    });
    var divtnc_label = $('<label />', { 'for': 'divtnc_elmid', text: 'Terms and Conditions', style: 'margin-bottom: 0px;'});
    var divtnc_elm = $('<div />', { id: 'divtnc_elmid', style: 'width: 100%; border: solid thin #ddd; padding: 5px; border-radius: 3px; height: 200px; overflow-y: auto' });
    divtnc_elm.text('Test');
    divelm_checktnc_elm.append(divtnc_label).append(divtnc_elm);

    // slelect theme
    var div_select_elm = $('<div/>', {
      id: 'select_theme_elm_id'
    });
    var select_elm = '';
    var label_select = '';

    // check box tnc
    var div_checktnc_elm = $('<div/>', {
      id: 'check_tnc_elm_id',
      style: 'margin-top: 10px;'
    });
    var checktnc_label = $('<label />', { 'for': 'checkbox_tnc_elmid', text: 'I agree to the terms and conditions', style: 'margin-bottom: 0px;'});
    var checktnc_elm = $('<input />', { type: 'checkbox', id: 'checkbox_tnc_elmid', value: 'agree', style: 'margin-right: 5px;', checked: true });
    
    // check box paper
    var div_check_elm = $('<div/>', {
      id: 'check_paper_elm_id',
      style: 'margin-top: 10px;'
    });
    var check_label_msg = $('<div />', { id: 'checkbox_paper_msg', text: 'Your strategy will be sent for paper trading. Your code is private and will only be seen by a select group of Alphien employees during the review process.', style: 'color: red; font-style: italic;'});
    var check_label = $('<label />', { 'for': 'checkbox_paper_trad_elmid', text: 'Submit strategy for paper trading', style: 'margin-bottom: 0px;'});
    var check_elm = $('<input />', { type: 'checkbox', id: 'checkbox_paper_trad_elmid', value: 'paperTrading', style: 'margin-right: 5px;', checked: true });

    // select competition
    // comp check list
    var comlistdb = ['general'];
    if (competition.length > 0) {
      for (var i = 0; i < competition.length; i++) {
        comlistdb.push(competition[i].Team);
      }
    }
    
    // elm competition
    var div_select_comp = $('<div/>', {
      id: 'select_comp_elm_id'
    });
    if (comlistdb.length > 0) {
      var select_comp_label = $('<label />', { 'for': 'select_comp_elmid', text: 'Select competition:', style: 'margin-top: 10px; font-weight: bold;'});
      var select_comp_elm = $("<select id='select_comp_elmid' style='margin: 0px;'></select>").addClass('form-control');
      for (var i = 0; i < comlistdb.length; i++) {
        // select - use
        $(select_comp_elm).append($("<option></option>").attr({"value":comlistdb[i]}).text(comlistdb[i]));
      }
      div_select_comp.append(select_comp_label).append(select_comp_elm);
    }

    // select team
    var div_select_team = $('<div/>', {
      id: 'select_team_elm_id'
    });
    var select_team_label = $('<label />', { 'for': 'select_team_elmid', text: 'Submit as:', style: 'margin-top: 10px; font-weight: bold;'});
    var selected_team_elmid = $('<label />', { id: 'selected_team_elmid', text: 'individual', style: 'margin-top: 10px; margin-left: 10px; color: red; font-weight: bold; text-transform: capitalize'});
    var select_team_elm = $("<select id='select_team_elmid' style='margin: 0px; display: none;'></select>").addClass('form-control');
    $(select_team_elm).append($("<option></option>").attr({"value":"individual", "title":"Individual"}).text("Individual"));
    $(select_team_elm).append($("<option></option>").attr({"value":"team", "title":"Your Team"}).text("Team"));
    div_select_team.append(select_team_label).append(selected_team_elmid).append(select_team_elm);

    // check payout
    var div_checkpay_elm = $('<div/>', {
      id: 'check_pay_elm_id',
      style: 'margin-top: 10px;'
    });
    var checkpay_label = $('<label />', { 'for': 'checkbox_pay_elmid', text: 'Do you want to submit any Custom Payouts along with the strategy', style: 'margin-bottom: 0px;'});
    var checkpay_elm = $('<input />', { type: 'checkbox', id: 'checkbox_pay_elmid', value: 'payouts', style: 'margin-right: 5px;', checked: false });

    // select payout
    var div_select_pay = $('<div/>', {
      id: 'select_pay_elm_id'
    });
    var select_pay_label = $('<label />', { 'for': 'select_pay_elmid', text: 'Select strategy:', style: 'margin-top: 10px; font-weight: bold;'});
    var select_pay_elm = $("<select id='select_pay_elmid' style='margin: 0px;'></select>").addClass('form-control');
    $(select_pay_elm).append($("<option></option>").attr({"value":"alFunctionEx"}).text("alFunctionEx"));
    div_select_pay.append(select_pay_label).append(select_pay_elm);
    div_select_pay.hide();

    // team check list
    var teamlistdb = [];
    if (teamList.length > 0) {
      for (var i = 0; i < teamList.length; i++) {
        teamlistdb.push(teamList[i].Team);
      }
    }
    var div_checklist_team = $('<div/>', {
      id: 'select_check_team_elm_id'
    });
    if (teamlistdb.length > 0) {
      var s_team_label = $('<label />', { 'for': 'select_teamsend_elmid', text: 'Team:', style: 'margin-top: 10px; font-weight: bold;'});
      var s_team_elm = $("<select id='select_teamsend_elmid' style='margin: 0px;'></select>").addClass('form-control');
      for (var i = 0; i < teamlistdb.length; i++) {
        // select - use
        $(s_team_elm).append($("<option></option>").attr({"value":teamlistdb[i]}).text(teamlistdb[i]));

        // checkbox - not use
        var c_team_span = $('<span />', { style: 'margin-right: 15px;' });
        var c_team_label = $('<label />', { 'for': 'checkbox_team_list_' + teamlistdb[i], text: teamlistdb[i], style: 'margin-bottom: 0px;'});
        var c_team_elm = $('<input />', { type: 'checkbox', id: 'checkbox_team_list_' + teamlistdb[i], value: teamlistdb[i], class:'checkbox_team_list', style: 'margin-right: 5px;'});
        c_team_span.append(c_team_elm).append(c_team_label)
        // div_checklist_team.append(c_team_span);
      }
      div_checklist_team.append(s_team_label).append(s_team_elm);
    } else {
      var c_team_empty_label = $('<div />', { text: 'You have not a team yet!', style: 'color: red; font-style: italic; margin-top: 5px;'});
      div_checklist_team.append(c_team_empty_label);
    }
    
    // riyan
    // console.log(folderList)
    if(folderList.length > 0){
      label_select = $('<label style="margin-top: 10px;"><strong>Theme</strong></label>');
      select_elm = $("<select id='folder_access_id' style='margin: 0px;'></select>").addClass('form-control');
      // $(select_elm).append($("<option></option>").attr({"value":"", "title":"Need approved by admin"}).text("* Need Approved")); 
      // $(select_elm).append($("<option></option>").attr({"value":"paperTrading", "title":"For strategy submission"}).text("* Paper Trading")); 
      $.each(folderList, function(key, value) {   
        var arraccess = value.application.split("/");
        // console.log(value.application.split("/"));
        if (arraccess[0] == 'Drive' && arraccess[1] != 'Admin' && arraccess.length == 2) {
          $(select_elm).append($("<option></option>").attr("value",arraccess[1]).text(arraccess[1])); 
        }
      });
    }

    // add div
    div_checktnc_elm.append(checktnc_elm).append(checktnc_label);
    div_select_team.append(div_checklist_team);
    div_check_elm.append(check_elm).append(check_label).append(check_label_msg).append(div_select_comp).append(div_select_team);
    div_select_elm.append(label_select).append(select_elm);
    div_checkpay_elm.append(checkpay_elm).append(checkpay_label).append(div_select_pay);

    // function on change - checkbox
    check_label_msg.show();
    div_select_team.show();
    div_checklist_team.hide();
    select_elm.prop('disabled', check_elm.is(':checked'));
    check_elm.change(function () {
      changeDisabeledForm('folder_access_id', this.checked);
      if (this.checked) {
        check_label_msg.show();
        div_select_team.show();
      } else {
        check_label_msg.hide();
        div_select_team.hide();
      }
    });

    // function change checkbox pay
    checkpay_elm.change(function () {
      if (this.checked) {
        div_select_pay.show();
        console.log('pay');
      } else {
        div_select_pay.hide();
        console.log('not pay');
      }
    });

    // select competition
    select_comp_elm.change(function () {
      var submitedlabel = 'individual';
      var selectchange = $('#select_teamsend_elmid');
      if (selectchange) {
        selectchange.find('option').remove().end();
      }
      if (select_team_elm) {
        $(select_team_elm).find('option').remove().end();
      }
      console.log(teamlistdb);
      if (this.value === 'general') {
        if (selectchange) {
          for (let i = 0; i < teamlistdb.length; i++) {
            selectchange.append($("<option></option>").attr({"value":teamlistdb[i]}).text(teamlistdb[i]));
          }
        }
        // submit as
        if (select_team_elm) {
          $(select_team_elm).append($("<option></option>").attr({"value":"individual", "title":"Individual"}).text("Individual"));
          $(select_team_elm).append($("<option></option>").attr({"value":"team", "title":"Your Team"}).text("Team"));
        }
      } else {
        notebook_data.getAlphathonteam(this.value, utils.getUserName()).then(function (res) {
          if (res.data.length > 0) {
            var rlistateamd = res.data;
            console.log(rlistateamd);
            if (selectchange) {
              for (let i = 0; i < rlistateamd.length; i++) {
                selectchange.append($("<option></option>").attr({"value":rlistateamd[i].Team, "lead":rlistateamd[i].Team_leader}).text(rlistateamd[i].Team));
              }
            }
            if (select_team_elm) {
              $(select_team_elm).append($("<option></option>").attr({"value":"team", "title":"Your Team"}).text("Team"));
              div_checklist_team.show();
              submitedlabel = 'team';
            }
          } else {
            // submit as
            if (select_team_elm) {
              $(select_team_elm).append($("<option></option>").attr({"value":"individual", "title":"Individual"}).text("Individual"));
              div_checklist_team.hide();
            }
          }
        });
      }
      selected_team_elmid.text(submitedlabel);
    });

    // select team
    select_team_elm.change(function () {
      if (this.value == 'team') {
        div_checklist_team.show();
      } else {
        div_checklist_team.hide();
      }
    });

    if (notebookData) {
      showSubmittedLabel = (notebookData.status === 'SUBMITTED');
      label_warning = $('<label class="text-danger">Your notebook has been submitted on ' +  moment(notebookData.submittedDate).format('DD/MM/YYYY hh:mm:ss A') + ', once you click “Submit”, your old copy will be overwritten.</label>');
    }

    var dialog_body = $('<div/>').append(showSubmittedLabel ? label_warning:'').append(
      $("<p/>") //.append(label_name)
    ).append(divelm_checktnc_elm).append(label_description).append(input).append(div_checktnc_elm).append(div_check_elm).append(div_select_elm).append(div_checkpay_elm);

    var d = dialog.modal({
      title: rename_title,
      body: dialog_body,
      keyboard_manager: Jupyter.notebook.keyboard_manager,
      default_button: "Submit",
      buttons: {
        Submit: {
          class: "btn-primary",
          id: "submit-btn-strategy",
          click: function () {
            // if(input.val().length >= 100) {
            //   notebook_actions.submitNotebook(input.val());
            //   return true;
            // } else {
            //   input.css('border-color', 'red');
            //   return false;
            // }
            
            // console.log(select_elm);
            // console.log(select_elm.prop('disabled'));
            // console.log(select_elm.val());
            // console.log(check_elm.prop('checked'));
            // console.log(check_elm.val());

            // tnc
            var valtnc = checktnc_elm[0].checked
            
            // competition
            var compselect = '';
            if (select_comp_elm) {
              compselect = select_comp_elm.val();
            }
            
            // teams
            var selectedteam = [];
            $('#select_check_team_elm_id input:checked').each(function() {
              selectedteam.push($(this).attr('value'));
            });
            var teamliststr = '';
            
            // is team lead
            var islead = false;

            if (select_team_elm.val() == 'individual') {
              teamliststr = '#';
            } else {
              // if (selectedteam.length > 0) {
              //   teamliststr = selectedteam.join(';');
              // } else {
              //   teamliststr = '#';
              // }
              teamliststr = s_team_elm.val();
              var checklead = $('#select_teamsend_elmid option:selected').attr('lead');
              if (checklead !== undefined && checklead === 'N') {
                islead = true;
              }
            }
            console.log(islead);

            // themes
            var themenote = '';
            if (check_elm.prop('checked') == true) {
              themenote = check_elm.val();
            } else {
              if(select_elm == ''){
                themenote = '';
              } else {
                themenote = select_elm.val();
              }
            }
            
            // console.log(valtnc);
            // console.log(compselect);
            // console.log(teamliststr);
            // console.log(themenote);
            // console.log(input.val());
            notebook_actions.submitNotebook(input.val(), themenote, teamliststr);

            // if(select_elm == ''){
            //   notebook_actions.submitNotebook(input.val(), '');
            // }else{
            //   notebook_actions.submitNotebook(input.val(), select_elm.val());
            // }
            return true;
          }
        },
        Cancel: {}
      },
      open: function () {
        // Upon ENTER, click the OK button.
        /*
        input.keydown(function (event) {
          if (event.which === keyboard.keycodes.enter) {
            d.find('.btn-primary').first().click();
            return false;
          }
        });*/
        input.focus();
      }
    });
  }

  $(document).on('click', '#txtDescription', function () {
    $(this).css('border-color', 'lightgrey');
  });


  $(document).on('click', '#notebook_name', function () {
    panel.rename_notebook({path: Jupyter.notebook.notebook_path, name : Jupyter.notebook.notebook_name, isUpdate: true});
    //this.element.find('span.filename').text(Jupyter.notebook.notebook_name);
  });

  return {
    showSubmitDialog: showSubmitDialog
  };

});
