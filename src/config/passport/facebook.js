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
 *   Facebook passport authentication
 *
 * @author martijn <martijn@cloud-coders.com>
 */

var r = require('../rethink').r;
var FacebookStrategy = require('passport-facebook').Strategy;
var config = require('../');

module.exports = new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL,
        profileFields: config.facebook.profileFields
    },
    function (accessToken, refreshToken, profile, done) {

        r.table('users').filter({

            'facebookId': profile.id

        }).run().then(function (result) {

            var user = result[0];

            if (!user) {

                user = {
                    facebookId: profile.id,
                    email: profile.email,
                    provider: 'facebook',
                    profile: profile._json
                };

                /**
                 * Insert and return
                 */
                r.table('users').insert(user, {returnChanges: true}).run().then(function (u) {

                    var user = u.changes[0].new_val;

                    return done(null, user);
                });

            } else {

                /**
                 * User found, return
                 */
                return done(null, user);
            }
        });
    }
);
