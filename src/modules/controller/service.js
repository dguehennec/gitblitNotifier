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

var EXPORTED_SYMBOLS = [ "gitblit_notifier_Service" ];

/**
 * Creates an instance of Service.
 * 
 * @constructor
 * @this {Service}
 * @param {Controller}
 *            The parent controller
 */
var gitblit_notifier_Service = function(parent) {
    this._stateTimer = null;
    this._isInitialized = true;
    this._connectStep = 0;
    this._lastreadSha1 = undefined;
    this._fisrtResponse = true;
    this._commits = [];
    this._lastErrorMessage = "";
    this._parent = parent;
    this._logger = new gitblit_notifier_Logger("Service");
    this._logger.info("initialized");
    this._request = undefined;
    this._maxDelayResponse = 30*1000;
};

/**
 * Release Service.
 * 
 * @this {Service}
 */
gitblit_notifier_Service.prototype.shutdown = function() {
    this._logger.info("Shutdown...");
    this.closeConnection();
};

/**
 * is initialized
 * 
 * @this {Service}
 * @return {boolean} true if service initialized
 */
gitblit_notifier_Service.prototype.isInitialized = function() {
    return this._isInitialized;
};


/**
 * Indicate if connected
 *
 * @this {Controller}
 * @return {Boolean} true if connected
 */
gitblit_notifier_Service.prototype.isConnected = function() {
    return (this._connectStep === 2);
};

/**
 * Indicate if is Connecting
 *
 * @this {Controller}
 * @return {Boolean} true if is Connecting
 */
gitblit_notifier_Service.prototype.isConnecting = function() {
    return (this._connectStep === 1);
};

/**
 * Initialize Connection
 * Call from the UI or when launching this app if the password is defined
 */
gitblit_notifier_Service.prototype.initializeConnection = function() {
    this._lastErrorMessage = "";
    this._connectStep = 1;
    this._planRefresh(1000);
    // refresh listeners
    this._parent.event();
};

/**
 * Close Connection
 *
 * @this {Service}
 */
gitblit_notifier_Service.prototype.closeConnection = function() {
    this._connectStep = 0;
    this._fisrtResponse = true;
    this._request.abort();
    this._lastErrorMessage = "";
    this._commits = [];
    this._stopRefreshTimer();
    // refresh listeners
    this._parent.event();
};

/**
 * Check now
 * 
 * @this {Service}
 */
gitblit_notifier_Service.prototype.checkNow = function() {
    this._logger.info("checkNow");
    this._planRefresh(0);

};

/**
 * preferences updated
 * 
 * @this {Service}
 */
gitblit_notifier_Service.prototype.prefUpdated = function() {
    this._logger.trace("prefUpdated");
};

/**
 * Get unread commits
 * 
 * @this {Controller}
 * @return {int} the unread commits
 */
gitblit_notifier_Service.prototype.getUnreadCommit = function() {
    this._logger.trace("getUnreadCommit");
    var unreadCommits = [];
    this._commits.forEach(function(item) {
        if(!item.isRead) {
            unreadCommits.push(item);
        }
    });
    return unreadCommits;
}


/**
 * Get last read commits
 * 
 * @this {Controller}
 * @return {int} the unread commits
 */
gitblit_notifier_Service.prototype.getLastReadCommit = function() {
    this._logger.trace("getLastReadCommit");
    var readCommits = [];
    this._commits.forEach(function(item) {
        if(item.isRead) {
            readCommits.push(item);
        }
    });
    return readCommits;
}

/**
 * Get unread commits count
 * 
 * @this {Controller}
 * @return {int} the count of unread commits
 */
gitblit_notifier_Service.prototype.getUnreadCommitCount = function() {
    this._logger.trace("getUnreadCommitCount");
    return this.getUnreadCommit().length;
}

/**
 * confirm Last Commit Read
 * 
 * @this {Controller}
 */
gitblit_notifier_Service.prototype.confirmLastCommitRead = function(commit) {
    this._logger.trace("confirmLastCommitRead: " + commit);
    if(commit) {
        var found = false;
        this._commits.forEach(function(item) {
            if(item.sha1 === commit.sha1) {
                found = true;
            }
            if(found) {
                item.isRead = true;
            }
        });
        // refresh listeners
        this._parent.event();
    }
}

/**
 * Get last error message
 * 
 * @this {Service}
 * @return {String} the last error message
 */
gitblit_notifier_Service.prototype.getLastErrorMessage = function() {
    this._logger.trace("getLastErrorMessage");
    return this._lastErrorMessage;
};

/**
 * After the delay run the refresh state
 * 
 * @private
 * @this {Service}
 * @param {Number}
 *            delayMs the delay before calling _refreshState function
 */
gitblit_notifier_Service.prototype._planRefresh = function(delayMs) {
    this._logger.trace("planRefresh: " + delayMs);
    var object = this;
    this._stopRefreshTimer();
    this._stateTimer = gitblit_notifier_Util.setTimer(this._stateTimer, function() {
        object._parent.event(true);
        object._getActivity();
        object._planRefresh(120000);
    }, delayMs);
};


/**
 * Cancel the running timer to the refresh state
 * 
 * @private
 * @this {Service}
 */
gitblit_notifier_Service.prototype._stopRefreshTimer = function() {
    this._logger.trace("stopRefreshTimer");
    if (this._stateTimer) {
        clearTimeout(this._stateTimer);
    } else {
        this._stateTimer = null;
    }
};

/**
 * get activity
 * 
 * @private
 * @this {Service}
 */
gitblit_notifier_Service.prototype._getActivity = function() {
    this._logger.trace("_getActivity");
    var url = gitblit_notifier_Prefs.getUserServer() + "activity/";

    try {
        this._request = new XMLHttpRequest();
        var request = this._request;
        request.withCredentials = true;
        request.parent = this;
        request.timeout = this._maxDelayResponse;
        request.open("GET", url, true);
        request.addEventListener("loadend", function() {
            request.parent._logger.trace("Response (" + request.status + ")", request.responseText);
            if (request.status === 200) {
                request.parent._lastErrorMessage = "";
                request.parent._connectStep = 2;
                request.parent._parseActivityResponse(request.responseText);
            }
            else {
                if(request.parent._connectStep === 1) {
                    request.parent._connectStep = 0;
                }
                if (request.status === 0) {
                    request.parent._lastErrorMessage = gitblit_notifier_Util.getBundleString("connector.error.req").replace("%REASON%", request.status);
                    request.parent._logger.error("Error network : " + url);
                }
                else {
                    request.parent._lastErrorMessage = gitblit_notifier_Util.getBundleString("connector.error.req").replace("%REASON%", request.status);
                    request.parent._logger.error("Error, status: " + request.status + " : " + url);
                }
            }
            // refresh listeners
            request.parent._parent.event();
        }, false);

        request.addEventListener("timeout", function() {
            this._connectStep = 0;
            request.parent._lastErrorMessage = gitblit_notifier_Util.getBundleString("connector.error.req").replace("%REASON%", gitblit_notifier_Util.getBundleString("connector.error.req_timeout"))
            request.parent._logger.warning("Request timeout: " + url);
            // refresh listeners
            request.parent._parent.event();
        }, false);

        request.send();
        return true;
    }
    catch (e) {
        this._logger.error(url + " -- error: " + e);
    }
    return false;
};

/**
 * parse activity response
 * 
 * @private
 * @this {Service}
 */
gitblit_notifier_Service.prototype._parseActivityResponse = function(activity) {
    this._logger.trace("_parseActivityResponse");
    var commitTempList = [], newCommitList = [];
    var htmlObject = document.createElement('div');
    htmlObject.innerHTML = activity.split('<body>')[1].split('</body>')[0];
    var activities = htmlObject.getElementsByClassName("activity");
    for(var indexActivity = 0; indexActivity < activities.length; indexActivity++) {
        var activity = activities[indexActivity];
        var date = activity.parentNode.innerHTML.split(/\s*["]\s*/)[9];
        var commits = activity.getElementsByTagName("TR");
        for(var indexCommit = 0; indexCommit < commits.length; indexCommit++) {
            var values = commits[indexCommit].innerText.replace(new RegExp("\t", "g"), "").split("\n");
            var match, link = "";
            var re = /<a href="..\/commit\/(.*)" target/gm;
            if(match = re.exec(commits[indexCommit].innerHTML)) {
                link = gitblit_notifier_Prefs.getUserServer() + '/commit/' + match[1];
            }
            commitTempList.push(new gitblit_notifier_commit(date, values[1], values[4], values[13], values[17], values[19], values[21], link));
        };
    };

    for(var indexCommit = 0; indexCommit < commitTempList.length; indexCommit++) {
        var commit = commitTempList[indexCommit];
        if(!this._fisrtResponse) {
            if(this._commitNotExist(commit)) {
                newCommitList.push(commit);
                // Play a sound
                if (gitblit_notifier_Prefs.isSoundNotificationEnable()) {
                    gitblit_notifier_Util.playSound();
                }
                // Display a notification
                if (gitblit_notifier_Prefs.isSystemNotificationEnabled()) {
                    gitblit_notifier_Util.showNotification('New commit of ' + commit.author + ' on project ' + commit.project, commit.comment, gitblit_notifier_Prefs.getNotificationDuration()*1000);
                }
            }
        } else {
            commit.isRead = true;
            newCommitList.push(commit);
        }
    }
    this._commits = newCommitList.concat(this._commits);
    this._fisrtResponse = false;
}

/**
 * commitIsUnread
 * 
 * @private
 * @this {Service}
 */
gitblit_notifier_Service.prototype._commitNotExist = function(commit) {
    var found = true;
    this._commits.forEach(function(item) {
        if(commit.sha1 === item.sha1) {
            found = false;
        }
    });
    return found;
}

/**
 * commitIsUnread
 * 
 * @private
 * @this {Service}
 */
gitblit_notifier_Service.prototype._commitIsUnread = function(commit) {
    var unread = false;
    this._commits.forEach(function(item) {
        if((commit.sha1 === item.sha1) && !item.isRead) {
            unread = true;
        }
    });
    return unread;
}


/**
 * commitIsRead
 * 
 * @private
 * @this {Service}
 */
gitblit_notifier_Service.prototype._commitIsRead = function(commit) {
    var read = false;
    this._commits.forEach(function(item) {
        if((commit.sha1 === item.sha1) && item.isRead) {
            read = true;
        }
    });
    return read;
}

/**
 * commitIsRead
 * 
 * @private
 * @this {Service}
 */
gitblit_notifier_Service.prototype._setCommitsRead = function() {
    this._commits.forEach(function(item) {
        item.isRead = true;
    });
}

/**
 * Freeze the interface
 */
Object.freeze(gitblit_notifier_Service);
