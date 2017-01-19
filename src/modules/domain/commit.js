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
 * Portions created by the Initial Developer are Copyright (C) 2013
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * Benjamin ROBIN
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

var EXPORTED_SYMBOLS = ["gitblit_notifier_commit"];

/**
 * Creates an instance of commit.
 *
 * @constructor
 * @this {commit}
 *
 * @param {String}
 *            date the commit date
 * @param {String}
 *            time the commit time
 * @param {String}
 *            project the project name
 * @param {String}
 *            comment the comment of the commit
 * @param {String}
 *            author the author of the commit
 * @param {String}
 *            sha1 the sha1 of the commit
 * @param {String}
 *            branch the branch of the commit          
 */
var gitblit_notifier_commit = function(date, time, project, comment, author, sha1, branch, link) {
    this.date = date;
    this.time = time;
    this.project = project;
    this.comment = comment;
    this.author = author;
    this.sha1 = sha1;
    this.branch = branch;
    this.link = link;
    this.isRead = false;
};

/**
 * Freeze the interface
 */
Object.freeze(gitblit_notifier_commit);