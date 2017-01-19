/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Gitblit Notifier.
 *
 * The Initial Developer of the Original Code is
 * David GUEHENNEC.
 * Portions created by the Initial Developer are Copyright (C) 2017
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

/**
 * Creates an instance of popup.
 * 
 * @constructor
 * @this {Popup}
 */
var gitblit_notifier_popup = {};

/**
 * init
 * 
 * @this {Popup}
 */
gitblit_notifier_popup.init = function(background) {
    if(!background) {
        return;
    }

    // add event listener on button
    $('#gitblit_notifier_tooltipCheckNow').on('click', $.proxy(function(evt) {
        evt.stopPropagation();
        this.checkNowClick();
    }, this));
    $('#gitblit_notifier_tooltipHome').on('click', $.proxy(function(evt) {
        evt.stopPropagation();
        this._gitblit_notifier_Controller.openWebInterface();
    }, this));
    $('#gitblit_notifier_tooltipOption').on('click', $.proxy(function(evt) {
        evt.stopPropagation();
        this.optionClick();
    }, this));

    // initialize background objects
    if (!background || !background['gitblit_notifier_Controller'] || !background['gitblit_notifier_Prefs'] || !background['gitblit_notifier_Util']) {
        $('#gitblit_notifier_tooltipCommit').text(chrome.i18n.getMessage("tooltip_errorInitPage_title"));
        return;
    }
    this._gitblit_notifier_Controller = background['gitblit_notifier_Controller'];
    this._gitblit_notifier_Prefs = background['gitblit_notifier_Prefs'];
    this._gitblit_notifier_Util = background['gitblit_notifier_Util'];
    this.lastCommitRead = undefined;

    // Register
    this._gitblit_notifier_Controller.addCallBackRefresh(this);

    this.refresh();
};

/**
 * Call when the window is closed
 * 
 * @this {Popup}
 */
gitblit_notifier_popup.release = function() {
    this._gitblit_notifier_Controller.confirmLastCommitRead(this.lastCommitRead);
    this._gitblit_notifier_Controller.removeCallBackRefresh(this);
};

/**
 * Initiliaze tooltip
 * 
 * @this {Popup}
 */
gitblit_notifier_popup.refresh = function() {
    this.initializeTooltipInformation();
    this.initializeTooltipUnreadCommit();
    this.initializeTooltipReadCommit();
};
/**
 * Initialize tooltip unread commit
 * 
 * @private
 * @this {gitblit_notifier_popup}
 */
gitblit_notifier_popup.initializeTooltipInformation = function() {
    var errorMsg = this._gitblit_notifier_Controller.getLastErrorMessage();
    $("#gitblit_notifier_tooltipInformation").empty();

    if(this._gitblit_notifier_Controller.isConnected()) {
        if(!errorMsg || errorMsg ==='') {
            $("#gitblit_notifier_tooltipInformationGroup").hide();
            return;
        }
    }
    if(this._gitblit_notifier_Controller.isConnecting()) {
        errorMsg = chrome.i18n.getMessage("tooltip_connectionInProgress_description");
    }
    $("#gitblit_notifier_tooltipInformationGroup").show();
    $('<div/>', {
        text : errorMsg || chrome.i18n.getMessage("tooltip_notConnected_description")
    }).appendTo("#gitblit_notifier_tooltipInformation");
}

/**
 * Initialize tooltip unread commit
 * 
 * @private
 * @this {gitblit_notifier_popup}
 */
gitblit_notifier_popup.initializeTooltipUnreadCommit = function() {
    // clean commit
    $("#gitblit_notifier_tooltipCommit").empty();

    if(!this._gitblit_notifier_Controller.isConnected()) {
        $("#gitblit_notifier_tooltipCommitGroup").hide();
        return;
    }
    $("#gitblit_notifier_tooltipCommitGroup").show();
    var unreadCommit = this._gitblit_notifier_Controller.getUnreadCommit();
    if(unreadCommit.length>0) {
        this.lastCommitRead = unreadCommit[0];
    }
    this.displayCommits('#gitblit_notifier_tooltipCommit', unreadCommit, 'tooltip_noUnreadCommit');
};

/**
 * Initialize tooltip read commit
 * 
 * @private
 * @this {gitblit_notifier_popup}
 */
gitblit_notifier_popup.initializeTooltipReadCommit = function() {   
    // clean commit
    $("#gitblit_notifier_tooltipCommitRead").empty();

    if(!this._gitblit_notifier_Controller.isConnected() || !this._gitblit_notifier_Prefs.getCommitHistoryViewEnabled()) {
        $("#gitblit_notifier_tooltipCommitReadGroup").hide();
        return;
    }
    $("#gitblit_notifier_tooltipCommitReadGroup").show();

    var readCommit = this._gitblit_notifier_Controller.getLastReadCommit(this._gitblit_notifier_Prefs.getCommitNbDisplayed());
    this.displayCommits('#gitblit_notifier_tooltipCommitRead', readCommit, 'tooltip_noReadCommit');
};

/**
 * Initialize commits displayed
 * 
 * @private
 * @this {gitblit_notifier_popup}
 */
gitblit_notifier_popup.displayCommits = function(object, commitList, defaultComment) {
    var index, label, that = this;
    // display messages
    if (commitList.length === 0) {
        $('<div/>', {
            class : 'eventLabelDesc',
            text : chrome.i18n.getMessage(defaultComment)
        }).appendTo(object);
    } else {
        for (index = 0; index < Math.min(this._gitblit_notifier_Prefs.getCommitNbDisplayed(), commitList.length); index++) {
            var currentCommit = commitList[index];
            $('<div/>', {
                id : object.replace('#','') + index,
                url : currentCommit.link,
                class : 'eventLabelContent',
            }).appendTo(object);
            $(object + index).on('click', function(evt) {
                that._gitblit_notifier_Util.openURL(evt.currentTarget.getAttribute('url'));
            });
            if(index>0) {
                $('<hr/>').appendTo(object + index);
            }
            $('<div/>', {
                class : 'eventLabelDate',
                text : currentCommit.date + ' ' + currentCommit.time
            }).appendTo(object + index);
            $('<div/>', {
                class : 'eventLabelProject',
                text : chrome.i18n.getMessage("tooltip_project").replace('%PROJECT%', this._gitblit_notifier_Util.maxStringLength(currentCommit.project, 60))
            }).appendTo(object + index);
            $('<div/>', {
                class : 'eventLabelAuthor',
                text : chrome.i18n.getMessage("tooltip_author").replace('%AUTHOR%', currentCommit.author).replace('%SHA1%',currentCommit.sha1).replace('%BRANCH%', this._gitblit_notifier_Util.maxStringLength(currentCommit.branch, 20))
            }).appendTo(object + index);
            $('<div/>', {
                class : 'eventLabelDesc',
                text : this._gitblit_notifier_Util.maxStringLength(currentCommit.comment, this._gitblit_notifier_Prefs.getCommitNbCharactersDisplayed())
            }).appendTo(object + index);
           
        }
    }
}

/**
 * call on check now event
 */
gitblit_notifier_popup.openOptionPage = function(tab) {
    var selectedTab = "";
    if(tab) {
        selectedTab = "#"+tab;
    }
    var optionsUrl = chrome.extension.getURL("options.html");
    chrome.tabs.query({}, function(extensionTabs) {
        var found = false;
        for ( var i = 0; i < extensionTabs.length; i++) {
            if (extensionTabs[i].url && optionsUrl == extensionTabs[i].url.split("#")[0]) {
                found = true;
                chrome.tabs.update(extensionTabs[i].id, {
                    "selected" : true,
                    "url" : "options.html"+selectedTab
                });
            }
        }
        if (found == false) {
            chrome.tabs.create({
                url : "options.html"+selectedTab
            });
        }
    });
};

/**
 * call on check now event
 */
gitblit_notifier_popup.checkNowClick = function() {
    this._gitblit_notifier_Controller.checkNow();
};

/**
 * call on option event
 */
gitblit_notifier_popup.optionClick = function() {
    this.openOptionPage();
}

/**
 * add event listener to notify when content is loaded or unloaded
 */
document.addEventListener("DOMContentLoaded", function() {
    var backgroundPage = chrome.extension.getBackgroundPage();
    gitblit_notifier_popup.init(backgroundPage);
});

$(window).on("unload", function() {
    gitblit_notifier_popup.release();
});
