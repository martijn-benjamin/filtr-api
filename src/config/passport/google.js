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
 *   Google Oauth Authentication
 *
 * @author martijn <martijn@cloud-coders.com>
 */
var r = require('../rethink').r;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../');

/**
 * Expose Google Strategy
 */
module.exports = new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL
    },
    function (accessToken, refreshToken, profile, done) {

        r.table('users').filter({

            'googleId': profile.id

        }).run().then(function (result) {

            var user = result[0];

            if (!user) {

                user = {
                    googleId: profile.id,
                    provider: 'google',
                    profile: profile._json,
                    email: profile.emails[0].value
                };

                r.table('users').insert(user, {returnChanges: true}).run().then(function (u) {

                    var user = u.changes[0].new_val;

                    return done(null, user);
                });

            } else {

                return done(null, user);
            }
        });
    }
);
