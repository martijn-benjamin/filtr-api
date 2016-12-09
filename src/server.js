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
 *     Server
 *
 * @author martijn <martijn@spent-time.com>
 */

var config = require('./config');
var express = require('express');
var http = require('http');
var session = require('express-session');
var RethinkDBStore = require('express-session-rethinkdb')(session);
var passport = require('passport');

console.info("==================================================================================");
console.info("                                                                                  ");
console.info(" Starting....   Time for the awesome                                              ");
console.info("                                                                                  ");
console.info("==================================================================================");

/**
 * Start server
 */
console.info('Start Server');

var sessionStore = new RethinkDBStore({
    connectOptions: {
        db: config.db
    }
});

var app = express();
var server = http.Server(app);

/**
 * Bootstrap
 *
 * - Passport
 * - Express
 * - Routing
 * - RethinkDB
 */
require('./config/passport')(passport);
require('./config/express')(app, passport, sessionStore);
require('./config/routes')(app, passport);
require('./config/rethink');

/**
 * Server listen
 */
server.listen(config.port);

/**
 * All done.
 */
console.info('Filtr API started on port ' + config.port);
console.info("==================================================================================");