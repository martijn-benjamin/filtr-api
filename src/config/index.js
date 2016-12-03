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
 *     Setup env
 *
 * @author martijn <martijn@spent-time.com>
 */

var path = require('path');
var extend = require('util')._extend;

var development = require('./env/development');
var production = require('./env/production');

var defaults = {
    root: path.join(__dirname, '..')
};

module.exports = {
    development: extend(development, defaults),
    production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];
