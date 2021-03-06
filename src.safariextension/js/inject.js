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
 * The Original Code is gitblit Notifier.
 *
 * The Initial Developer of the Original Code is
 * David GUEHENNEC.
 * Portions created by the Initial Developer are Copyright (C) 2015
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

var sessionId = -1;

//* Listen for messages */
function manageMessage(event) {
  switch(event.name) {
        case "GitblitNotifier_getCookie":
            var name = event.message.name + "=";
            var ca = document.cookie.split(';');
            var value = "";
            for(var i=0; i<ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1);
                if (c.indexOf(name) != -1) {
                    value = c.substring(name.length, c.length);
                    break;
                }
            }
            safari.self.tab.dispatchMessage("GitblitNotifier_cookieResult",{id: event.message.id, url: event.message.url, name: event.message.name, value: value});
            break;
        case "GitblitNotifier_setCookie":
            var expires = "expires=" + (new Date(event.message.expirationDate*1000)).toUTCString();
            document.cookie = event.message.name + "=" + event.message.value + "; expires=session"; /* + expires;*/
            safari.self.tab.dispatchMessage("GitblitNotifier_cookieResult",{id: event.message.id, url: event.message.url, name: event.message.name});
            break;
        case "GitblitNotifier_removeCookie":
            document.cookie = event.message.name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            safari.self.tab.dispatchMessage("GitblitNotifier_cookieResult",{id: event.message.id, url: event.message.url, name: event.message.name});
            break;
        case "GitblitNotifier_reload":
            window.location.reload()
            break;
        default:
            break;
    }
    
}

function getCookiesValue(key)  {
    var ca = document.cookie.split(';');
    var value = "";
    for(var i=0; i<ca.length; i++) {
        var item = ca[i].split('=');
        if ((item.length === 2) && (item[0].trim() === key)) {
            value = item[1].trim();
            break;
        }
    }
    return value;
}

/**
 * adding message event listener of GitblitNotifier extension
 */
if (window.top === window) {
    safari.self.addEventListener("message", manageMessage, false);
    safari.self.tab.dispatchMessage("GitblitNotifier_message", {type: 'owsDOMContentLoaded'});
}
