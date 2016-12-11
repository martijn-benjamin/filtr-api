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
 *     Routing
 *
 * @author martijn <martijn@scloud-coders.com>
 */

var auth = require('./middleware/authorization');

var fail = {
    failureRedirect: '/auth/failed'
};

var user = require('../controllers/user');
var publisher = require('../controllers/publisher');

module.exports = function (app, passport) {

    /**
     * We use passport authentication
     *
     * @type {function(this:*)}
     */
    var pauth = passport.authenticate.bind(passport);

    /**
     * Send back the auth failed code & generic, not so, meaningful message
     */
    app.get('/auth/failed', function (req, res) {

        res.status(403);
        return res.send({message: 'Sign in failed'});
    });

    /**
     * Signin with Facebook
     */
    app.get('/auth/facebook',
        pauth('facebook', {

            scope: ['email', 'public_profile', 'user_about_me'],

            failureRedirect: '/auth/failed'

        }), user.signin);

    app.get('/auth/facebook/callback', pauth('facebook', fail), user.authCallback);

    /**
     * Signin with Google
     */
    app.get('/auth/google',
        pauth('google', {

            scope: ['email'],

            failureRedirect: '/auth/failed'

        }), user.signin);

    app.get('/auth/google/callback', pauth('google', fail), user.authCallback);

    /**
     * Signin with LinkedIn
     */
    app.get('/auth/linkedin',
        pauth('linkedin', {

            failureRedirect: '/auth/failed'

        }), user.signin);

    app.get('/auth/linkedin/callback', pauth('linkedin', fail), user.authCallback);

    /**
     * Search for match on domain name
     */
    app.get('/_api/search/domain/:domain', publisher.domain);

    /**
     * Bulk match domain names
     */
    app.put('/_api/search/domain', publisher.bulk);

    /**
     * List all publications
     */
    app.get('/_api/publisher', publisher.list);

    /**
     * Get publication by id
     */
    app.get('/_api/publisher/:id', publisher.get);

    /**
     * Get user vote for a publisher
     *
     * @todo no auth? does not make much sense to fetch when no user id but we might want to have these votes open for the public?
     */
    app.get('/_api/vote/:id', publisher.vote);

    /**
     * Vote up for a publisher
     */
    app.put('/_api/vote-up/:id', auth.requiresLogin, publisher.voteUp);

    /**
     * Vote down for a publisher
     */
    app.put('/_api/vote-down/:id', auth.requiresLogin, publisher.voteDown);

    /**
     * Tag a publisher
     */
    app.put('/_api/tag/:id', auth.requiresLogin, publisher.tag);

    /**
     * Create publication
     */
    app.post('/_api/publisher', auth.requiresLogin, publisher.create);

    /**
     * Update publication
     */
    app.put('/_api/publisher/:id', auth.requiresLogin, publisher.update);

    /**
     * Delete publication
     */
    app.delete('/_api/publisher/:id', auth.requiresLogin, publisher.remove);

    /**
     * Sign out
     */
    app.get('/_api/signout', user.logout);

    /**
     * Retrieve current authenticated User info
     */
    app.get('/_api/user', function (req, res) {

        var user = req.user[0];

        res.send({
            id: user.id,
            provider: user.provider,
            email: user.email
        });
    });


    /**
     * Error handling
     */
    app.use(function (err, req, res, next) {

        console.error(err);

        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
            || (~err.message.indexOf('Cast to ObjectId failed')))) {

            return next();
        }

        if (err.stack.includes('ValidationError')) {

            res.status(422);
            res.send({error: err.stack});
            return;
        }

        // error page
        res.status(500);
        res.status({error: err.stack});
    });

};
