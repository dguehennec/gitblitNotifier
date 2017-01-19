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

var EXPORTED_SYMBOLS = ["gitblit_notifier_Prefs"];

/**
 * Creates an instance of Prefs.
 *
 * @constructor
 * @this {Prefs}
 */
var gitblit_notifier_Prefs = {
    _prefs: null,
    _is_first_launch: false,
    _previous_version: 0
};

/**
 * pref identifiers
 *
 * @constant
 */
gitblit_notifier_Prefs.PREF = {
    // General
    CURRENT_VERSION                 : "currentVersion",
    // Commit
    COMMIT_NB_DISPLAYED             : "commitNbDisplayed",
    COMMIT_NB_CHARACTERS_DISPLAYED  : "commitNbCharactersDisplayed",
    COMMIT_HISTORY_VIEW_DISPLAYED   : "commitHistoryViewEnabled",
    SYSTEM_NOTIFICATION_ENABLED     : "systemNotificationEnabled",
    SOUND_NOTIFICATION_ENABLED      : "soundNotificationEnabled",
    NOTIFICATION_DURATION           : "notificationDuration",
    // Identification
    USER_SERVER                     : "userServer"
};
gitblit_notifier_Util.deepFreeze(gitblit_notifier_Prefs.PREF);

/**
 * Load preferences
 *
 * @this {Prefs}
 */
gitblit_notifier_Prefs.load = function() {
    
    // Get the previous version
    var previous_version = this._getPref(this.PREF.CURRENT_VERSION);

    // Check if this is the first time the extension is started
    if (previous_version===0) {
        this._is_first_launch = true;
    }
    
    // Set the current version
    this.pref_current_version = gitblit_notifier_Constant.VERSION;
    this._prefs.setPref(this.PREF.CURRENT_VERSION, this.pref_current_version);
    
    // Commit
    this.pref_commitNbDisplayed = this._getPref(this.PREF.COMMIT_NB_DISPLAYED);
    this.pref_commitNbCharactersDisplayed = this._getPref(this.PREF.COMMIT_NB_CHARACTERS_DISPLAYED);
    this.pref_commitHistoryViewEnabled = this._getPref(this.PREF.COMMIT_HISTORY_VIEW_DISPLAYED);
    this.pref_systemNotificationEnabled = this._getPref(this.PREF.SYSTEM_NOTIFICATION_ENABLED);
    this.pref_soundNotificationEnabled = this._getPref(this.PREF.SOUND_NOTIFICATION_ENABLED);
    this.pref_notificationDuration = this._getPref(this.PREF.NOTIFICATION_DURATION);

    // Identification
    this.pref_userServer = this._getPref(this.PREF.USER_SERVER);
};

/**
 * Init preference object, listen for preference change
 *
 * @this {Prefs}
 */
gitblit_notifier_Prefs.init = function(callback) {
    if (!this._prefs) {
        this._prefs = PrefsService;
	this._prefs.init( function() {
		gitblit_notifier_Prefs.load();
		if(callback) {
		    callback();
		}
	});
    }
    else {
        this.load();
        if(callback) {
            callback();
        }
    }
};

/**
 * Remove observer, called from shutdown
 *
 * @this {Prefs}
 */
gitblit_notifier_Prefs.release = function() {
    if (this._prefs) {
        this._prefs = null;
    }
};

/**
 * get preference
 *
 * @this {Prefs}
 * @param {String} key of the preference
 * @return {Object} value of the preference key
 */
gitblit_notifier_Prefs.getPref = function(key) {
    var value = undefined;
    switch (key) {


        // commit
        case this.PREF.COMMIT_NB_DISPLAYED:
            value = this.pref_commitNbDisplayed;
            break;
        case this.PREF.COMMIT_NB_CHARACTERS_DISPLAYED:
            value = this.pref_commitNbCharactersDisplayed;
            break;
        case this.PREF.COMMIT_HISTORY_VIEW_DISPLAYED:
            value = this.pref_commitHistoryViewEnabled;
            break;
        case this.PREF.SYSTEM_NOTIFICATION_ENABLED:
            value = this.pref_systemNotificationEnabled;
            break;
        case this.PREF.SOUND_NOTIFICATION_ENABLED:
            value = this.pref_soundNotificationEnabled;
            break;
        case this.PREF.NOTIFICATION_DURATION:
            value = this.pref_notificationDuration;
            break;

        // Identification
        case this.PREF.USER_SERVER:
            value = this.pref_userServer;
            break;

        default:
            break;
    }
    return value;
}

/**
 * Update preference
 *
 * @this {Prefs}
 */
gitblit_notifier_Prefs.updatePref = function(key, value) {

    if (this._prefs) {
        this._prefs.setPref(key, value);
    }

    switch (key) {
        // commit
        case this.PREF.COMMIT_NB_DISPLAYED:
            this.pref_commitNbDisplayed = value;
            break;
        case this.PREF.COMMIT_NB_CHARACTERS_DISPLAYED:
            this.pref_commitNbCharactersDisplayed = value;
            break;
        case this.PREF.COMMIT_HISTORY_VIEW_DISPLAYED:
            this.pref_commitHistoryViewEnabled = value;
            break;
        case this.PREF.SYSTEM_NOTIFICATION_ENABLED:
            this.pref_systemNotificationEnabled = value;
            break;
        case this.PREF.SOUND_NOTIFICATION_ENABLED:
            this.pref_soundNotificationEnabled = value;
            break;
        case this.PREF.NOTIFICATION_DURATION:
            this.pref_notificationDuration = value;
            break;

        // Identification
        case this.PREF.USER_SERVER:
            this.pref_userServer = value;
            break;

        default:
            break;
    }
};

/* *************************** Public *************************** */

/**
 * Check if this is the first start of the extension
 *
 * @this {Prefs}
 * @param {Boolean} True if the flag should be reseted
 */
gitblit_notifier_Prefs.isFirstStart = function(reset) {
    var ret = this._is_first_launch;
    if (reset) {
        this._is_first_launch = false;
    }
    return ret;
};

/* *************************** email *************************** */

/**
 * indicate the current version
 *
 * @this {Prefs}
 * @return {Number} the current version
 */
gitblit_notifier_Prefs.getCurrentVersion = function() {
    return this.pref_current_version;
};

/* *************************** commit *************************** */

/**
 * get the number of commits displayed
 *
 * @this {Prefs}
 * @return {number} number of commits
 */
gitblit_notifier_Prefs.getCommitNbDisplayed = function() {
    return this.pref_commitNbDisplayed;
};

/**
 * get the number of characters displayed
 *
 * @this {Prefs}
 * @return {number} number of characters
 */
gitblit_notifier_Prefs.getCommitNbCharactersDisplayed = function() {
    return this.pref_commitNbCharactersDisplayed;
};

/**
 * indicate if the history is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
gitblit_notifier_Prefs.getCommitHistoryViewEnabled = function() {
    return this.pref_commitHistoryViewEnabled;
};

/**
 * indicate if the system notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
gitblit_notifier_Prefs.isSystemNotificationEnabled = function() {
    return this.pref_systemNotificationEnabled;
};

/**
 * indicate if the sound notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
gitblit_notifier_Prefs.isSoundNotificationEnable = function() {
    return this.pref_soundNotificationEnabled;
};

/**
 * get the notification duration
 *
 * @this {Prefs}
 * @return {Number} the notification duration
 */
gitblit_notifier_Prefs.getNotificationDuration = function() {
    return this.pref_notificationDuration;
};

/* *************************** identification *************************** */

/**
 * get the user server
 *
 * @this {Prefs}
 * @return {String} the server
 */
gitblit_notifier_Prefs.getUserServer = function() {
    if(this.pref_userServer && (this.pref_userServer[this.pref_userServer.length-1] !== '/')) {
        this.pref_userServer = this.pref_userServer + '/';
    }
    return this.pref_userServer;
};

/* *************************** Private *************************** */

/**
 * get preference
 *
 * @private
 *
 * @this {Prefs}
 *
 * @param {String}
 *            pref the preference name
 * @return {Object} the preference value
 */
gitblit_notifier_Prefs._getPref = function(pref) {
    if (this._prefs) {
        return this._prefs.getPref(pref);
    }
    return null;
};

/**
 * get a complex preference
 *
 * @private
 * @this {Prefs}
 *
 * @param {String}
 *            pref the preference name
 * @return {Object} the preference value
 */
gitblit_notifier_Prefs._getComplexPref = function(pref) {
    var value = null;
    try {
        var strVal = this._prefs.getPref(pref);
        if (strVal && strVal.length > 0) {
            value = JSON.parse(strVal);
        }
    }
    catch (e) {
    }
    return value;
};

/**
 * Creates an instance of PrefsService.
 *
 * @constructor
 * @this {PrefsService}
 */
var PrefsService = {
    _defaultsPref : {
        prefs : {
            'currentVersion' : 0,
            'commitNbDisplayed' : 5,
            'commitNbCharactersDisplayed' : 160,
            'commitHistoryViewEnabled' : true,
            'systemNotificationEnabled' : true,
            'soundNotificationEnabled' : true,
            'notificationDuration' : 14
        }
    },
    _currentPref : undefined,
    _saveTimerDelay : undefined
};

/**
 * initialize the PrefsService.
 *
 * @this {PrefsService}
 * @param {Function} the callback when initialized
 */
PrefsService.init = function(callback) {
    var loadFunction = function(storage) {
        PrefsService._currentPref = storage;
        if (callback) {
            callback();
        }
    };
    if(chrome.storage.sync) {
        chrome.storage.sync.get(this._defaultsPref, loadFunction);
    } else {
        chrome.storage.local.get(this._defaultsPref, loadFunction);
    }
};

/**
 * get the value of the key.
 *
 * @this {PrefsService}
 * @param {String} the key
 * @return {Object} the value
 */
PrefsService.getPref = function(key) {
    var value = null;
    if(this._currentPref && this._currentPref.prefs[key] !== undefined) {
        value = this._currentPref.prefs[key];
    }
    return value;
};


/**
 * set the value of the key.
 *
 * @this {PrefsService}
 * @param {String} the key
 * @param {Object} the value
 */
PrefsService.setPref = function(key, value) {
    this._currentPref.prefs[key] = value;
    this.synchronize();
};

/**
 * remove the key.
 *
 * @this {PrefsService}
 * @param {String} the key
 */
PrefsService.removePref = function(key) {
    if(this._currentPref.prefs[key] !== undefined) {
        delete this._currentPref.prefs[key];
        this.synchronize();
    }
};

/**
 * synchronize preferences
 *
 * @private
 * @this {PrefsService}
 * @param {String} the key
 */
PrefsService.synchronize = function(forced) {
    //synchronise preference after 1 seconds no change delay if not forced
    clearTimeout(this._saveTimerDelay);
    var that = this;
    var saveFunction = function() {
        if(chrome.storage.sync) {
            chrome.storage.sync.set(that._currentPref);
        } else {
            chrome.storage.local.set(that._currentPref);
        }
    };
    if(forced) {
        saveFunction();
    } else {
        this._saveTimerDelay = setTimeout(function() {
            saveFunction();
        }, 1000);
    }
};