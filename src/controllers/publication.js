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
var Publication = require("../model/Publication");
var _COLLECTION = 'publication';

/**
 * Get list of all publications id's
 */
exports.list = async(function*(req, res) {
    var result = yield new Publication().find(true);
    res.send(result);
});

/**
 * Get a publication doc by id
 */
exports.get = async(function*(req, res) {
    var publication = new Publication()
    var result = yield publication.findFirstById(req.params.id)
    result == null ? res.statusCode = 404 : res.statusCode = 200 ;
    res.send(result);
});

/**
 * Create publications and return their ids
 */
exports.create = async(function*(req, res) {
    if (req.body !== undefined) {
        var ids =
            yield req.body.map(function (object) {
                let publication = new Publication();
                publication.setCategory(object.category);
                publication.setDomain(object.domain);
                return publication.create();
            });
        res.send(ids);
    }
});

/**
 * update a publication doc
 */
exports.update = async(function*(req, res) {

    if (req.body !== undefined) {
        let publication = new Publication();
        publication.setId(req.params.id);
        publication.setCategory(req.body.category);
        publication.setDomain(req.body.domain);
        res.send(yield publication.update());

    }
});

/**
 * remove a publication doc
 */
exports.remove = async(function*(req, res) {
   var publication = new  Publication()
       publication.delete(req.params.id);
   res.send("ok")
});


