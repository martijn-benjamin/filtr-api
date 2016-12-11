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
 *   Generic require login routing middleware
 *
 * @author martijn <martijn@cloud-coders.com>
 */
exports.requiresLogin = function (req, res, next) {

    /**
     * Authenticated. Request can be propagated to next action
     */
    if (req.isAuthenticated()) {
        return next();
    }

    /**
     * Set the unauthorized http status code
     */
    res.status(401);

    res.send({"message": "requires authentication"});
};

/**
 * @todo implement
 *
 * @type {{hasAuthorization: Function}}
 */
exports.publication = {
    hasAuthorization: function (req, res, next) {

        /**
         * @todo check authorization
         */
        console.info('Check publication authorization');

        next();
    }
};

/**
 * @todo implement
 *
 * @type {{hasAuthorization: Function}}
 */
exports.setting = {
    hasAuthorization: function (req, res, next) {

        /**
         * @todo check authorization
         */
        console.info('Check setting Authorization');

        next();
    }
};