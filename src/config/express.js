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
 *     Express Server
 *
 * @author martijn <martijn@spent-time.com>
 */

var compression = require('compression');
var bodyParser = require('body-parser');

module.exports = function (app) {

    console.info('Configure Express');

    /**
     * Compression middleware (should be placed before express.static)
     */
    app.use(compression({
        threshold: 512
    }));

    /**
     * bodyParser should be above methodOverride
     */
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());
};
