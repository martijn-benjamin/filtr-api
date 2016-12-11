'use strict';

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

/**
 * <p>
 *   User controller
 *
 * @author martijn <martijn@cloud-coders.com>
 */
var crypto = require('crypto');

/**
 * Validation is not required if using OAuth
 */
exports.skipValidation = function () {
    return ~oAuthTypes.indexOf(this.provider);
};

exports.signin = function () {
};

/**
 * Auth callback
 */
exports.authCallback = login;

exports.session = login;

/**
 * Session
 */
function login(req, res) {

    var path = req.route.path;
    var redirectTo = req.session.returnTo ? req.session.returnTo : '/';
    delete req.session.returnTo;

    if (path === '/auth/users/session') {

        return res.send(req.user);

    } else {

        return res.redirect(redirectTo);
    }
}

/**
 * Logout
 */
exports.logout = function (req, res) {

    req.logout();
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');

    return res.send({'TimeToSay': 'Bye! Adiós! Doei! Au revoir! Tschüss! Ciao! さようなら! пока! tchau!'});
};