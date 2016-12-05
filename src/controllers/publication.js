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
 *     Controller for the publication docs
 *
 * @author martijn <martijn@spent-time.com>
 */

/**
 * Module dependencies.
 */
var r = require('../config/rethink').r;
var {wrap: async} = require('co');

var _COLLECTION = 'publication';

/**
 * Get list of all publications id's
 */
exports.list = async(function*(req, res) {

    var result =
        yield r.table(_COLLECTION).map(function(obj)
        {
            return obj("id");
        });
    res.send(result);
});

/**
 * get a publication doc by id
 */
exports.get = async(function*(req, res) {

    var result =
        yield r.table(_COLLECTION).get(req.params.id);

    res.send(result);
});

/**
 * create a publication doc
 *
 * @todo maybe only return the created id. returning full doc now.
 * @todo make it work for single and multiple docs
 */
exports.create = async(function*(req, res) {

    var result =
        yield r.table(_COLLECTION).insert(req.body, {returnChanges: true});

    var docs = [];

    for (var i = 0; i < result.changes.length; i++) {

        docs.push(result.changes[i].new_val);
    }

    res.send(docs);
});

/**
 * update a publication doc
 */
exports.update = async(function*(req, res) {

    var result =
        yield r.table(_COLLECTION).filter({id: req.params.id}).update(req.body);

    res.send(result);
});

/**
 * remove a publication doc
 */
exports.remove = async(function*(req, res) {

    var result =
        yield r.table(_COLLECTION).filter({id: req.params.id}).delete();

    res.send(result);
});


