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

var EXPORTED_SYMBOLS = [ "gitblit_notifier_Controller" ];

/**
 * Creates an instance of Controller.
 * 
 * @constructor
 * @this {Controller}
 */
var gitblit_notifier_Controller = {
    /** @private */
    /** The listeners list. */
    _callbackList : [],
    /** @private */
    /** The logger. */
    _logger : new gitblit_notifier_Logger("Controller"),
    /** @private */
    /** The service */
    _service : undefined
};

/**
 * initialize controller
 *
 * @this {Controller}
 */
gitblit_notifier_Controller.init = function() {
    gitblit_notifier_Prefs.init(function() {
        gitblit_notifier_Controller.autoConnect();
    });
    
}

/**
 * add CallBack Refresh
 * 
 * @this {Controller}
 * @param {Object}
 *            callback the callback listener
 */
gitblit_notifier_Controller.addCallBackRefresh = function(callback) {
    this._callbackList.push(callback);
};

/**
 * remove CallBack Refresh
 * 
 * @this {Controller}
 * @param {Object}
 *            callback the callback listener
 */
gitblit_notifier_Controller.removeCallBackRefresh = function(callback) {
    for (var index = 0; index < this._callbackList.length; index++) {
        if (this._callbackList[index] === callback) {
            this._callbackList.splice(index, 1);
            break;
        }
    }
};

/**
 * send event to callback listeners
 * 
 * @this {Controller}
 * @param {Object}
 *            event the event
 */
gitblit_notifier_Controller.event = function(event) {
    for (var index = 0; index < this._callbackList.length; index++) {
        var callback = this._callbackList[index];
        if (callback && callback.refresh) {
            callback.refresh(event);
        }
    }
};

/**
 * Get the service singleton
 * 
 * @this {Controller}
 * @return {Service} the service
 */
gitblit_notifier_Controller.getService = function(create) {
    if (!this._service && create) {
        this._service = new gitblit_notifier_Service(this);
    }
    return this._service;
};

/**
 * is initialized
 * 
 * @this {Controller}
 * @return {boolean} true if interface initialized
 */
gitblit_notifier_Controller.isInitialized = function() {
    if (this._service && this._service.isInitialized()) {
        return true;
    }
    return false;
};


/**
 * Start auto-connect if necessary
 *
 * @this {Controller}
 * @return {Boolean} False if we need to ask the password
 */
gitblit_notifier_Controller.autoConnect = function() {
    if (gitblit_notifier_Prefs.getUserServer() && (gitblit_notifier_Prefs.getUserServer() !== '')) {
        return this.initializeConnection();
    }
    return true;
};

/**
 * Initialize Connection
 *
 * @this {Controller}
 *
 * @return {Boolean} True if we did launch the connect query
 */
gitblit_notifier_Controller.initializeConnection = function() {
    if (!this.isConnected()) {
        return this.getService(true).initializeConnection();
    }
    return false;
};

/**
 * Close Connection
 *
 * @this {Controller}
 */
gitblit_notifier_Controller.closeConnection = function() {
    if (!this.isInitialized()) {
        return;
    }
    this._service.closeConnection();
};
/**
 * Check now
 * 
 * @this {Controller}
 */
gitblit_notifier_Controller.checkNow = function() {
    if (!this.isInitialized()) {
        return;
    }
    this._service.checkNow();
};

/**
 * Indicate if connected
 *
 * @this {Controller}
 * @return {Boolean} true if connected
 */
gitblit_notifier_Controller.isConnected = function() {
    var srv = this.getService();
    return srv ? srv.isConnected() : false;
};

/**
 * Indicate if is Connecting
 *
 * @this {Controller}
 * @return {Boolean} true if is Connecting
 */
gitblit_notifier_Controller.isConnecting = function() {
    var srv = this.getService();
    return srv ? srv.isConnecting() : false;
};


/**
 * Open Web Interface
 * 
 * @this {Controller}
 */
gitblit_notifier_Controller.openWebInterface = function() {
    if (!this.isInitialized()) {
        return;
    }
    gitblit_notifier_Util.openURL(gitblit_notifier_Prefs.getUserServer());
};

/**
 * Get unread commits count
 * 
 * @this {Controller}
 * @return {int} the count of unread commits
 */
gitblit_notifier_Controller.getUnreadCommitCount = function() {
    if (!this.isInitialized()) {
        return;
    }
    return this._service.getUnreadCommitCount();
}

/**
 * Get last read commits
 * 
 * @this {Controller}
 * @return {int} the last read commits
 */
gitblit_notifier_Controller.getLastReadCommit = function(nbcommits) {
    if (!this.isInitialized()) {
        return;
    }
    return this._service.getLastReadCommit(nbcommits);
}


/**
 * Get unread commits
 * 
 * @this {Controller}
 * @return {int} the unread commits
 */
gitblit_notifier_Controller.getUnreadCommit = function() {
    if (!this.isInitialized()) {
        return;
    }
    return this._service.getUnreadCommit();
}

/**
 * confirm Last Commit Read
 * 
 * @this {Controller}
 */
gitblit_notifier_Controller.confirmLastCommitRead = function(commit) {
    if (!this.isInitialized()) {
        return;
    }
    this._service.confirmLastCommitRead(commit);
}



/**
 * Get last error message
 * 
 * @this {Controller}
 * @return {String} the last service error message
 */
gitblit_notifier_Controller.getLastErrorMessage = function() {
    if (!this.isInitialized()) {
        return;
    }
    return this._service.getLastErrorMessage();
}

gitblit_notifier_Controller.init();