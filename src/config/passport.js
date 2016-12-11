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
 *   Passport Authentication
 *
 * @author martijn <martijn@cloud-coders.com>
 */

var r = require('../config/rethink').r;
var facebook = require('./passport/facebook');
var google = require('./passport/google');
var linkedin = require('./passport/linkedin');

module.exports = function (passport) {

    console.info('Configure Passport');

    // serialize sessions
    passport.serializeUser(function (user, done) {

        return done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {

        r.table('users').filter({id: id}).run().then(function (user) {

            return done(null, user);

        }).error(function (error) {

            console.error(error);
        });
    });

    // use these strategies
    passport.use(facebook);
    passport.use(google);
    passport.use(linkedin);

    console.info('Using Strategies: facebook, google, linkedin');
};
