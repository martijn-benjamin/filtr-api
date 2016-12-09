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
 *     Publisher model
 *
 * @author martijn <martijn@spent-time.com>
 * @author denzyl <denzyl@live.nl>
 */

let r = require('../config/rethink').r;
let {wrap: async} = require('co');

let _COLLECTION = 'publisher';

/**
 *
 * @constructor
 */
function Publisher() {
    this.id = null;
    this.name = null;
    this.type = null;
    this.score = 0;
}

/**
 * @param id
 */
Publisher.prototype.setId = function (id) {

    this.id = id;
};

/**
 * Check if type is correct and set it.
 * @todo throw exception if not a valid type
 * @param type
 */
Publisher.prototype.setType = function (type) {
    this.type = type;
};

/**
 *
 * @param score
 */
Publisher.prototype.setScore = function (score) {
    this.score = score;
};

/**
 * Set the name
 *
 * @param name string
 */
Publisher.prototype.setName = function (name) {
    this.name = name;
};

/**
 * Create and validate a Publisher
 */
Publisher.prototype.create = async(function*() {

    return yield r.table(_COLLECTION).insert({
        name: this.name,
        type: this.type
    }, {
        returnChanges: true
    }).then(function (cursor) {

        return cursor.generated_keys[0];
    });
});

Publisher.prototype.update = function () {

    if (this.id != null) {

        return r.table(_COLLECTION).update(this.stringify(), {
            returnChanges: true
        }).then(function (obj) {

            return obj.changes[0].new_val;
        });
    }
};

/**
 * @todo Check if all fields are valid
 */
Publisher.prototype.isValid = function () {
};

/**
 * Parse to fields that are needed to JSON String
 * @returns {{domain: *, category: *, id: *}}
 */
Publisher.prototype.stringify = function () {

    return {
        id: this.id,
        name: this.name,
        type: this.type,
        score: this.score
    }
};

/**
 * Return all Publishers
 * @returns {Array|*}
 */
Publisher.prototype.find = function (onlyId) {

    Publisher.prototype.onlyId = onlyId;

    return r.table(_COLLECTION).map(function (obj) {

        if (Publisher.prototype.onlyId == true) {
            return obj('id');
        }

        var p = new Publisher();

        p.setId(obj('id'));
        p.setName(obj('name'));
        p.setType(obj('type'));
        p.setScore(obj('score'));

        return p.stringify();
    })
};

/**
 * Find a Publisher by its id
 * @todo throw exception if documentnotfound doesn't exists
 * @param id
 * @returns {*}
 */
Publisher.prototype.findFirstById = function (id) {

    return r.table(_COLLECTION).get(id).then(function (obj) {

        var p = new Publisher();
        p.setId(obj.id);
        p.setName(obj.name);
        p.setType(obj.type);
        p.setScore(obj.score);

        return p.stringify();
    });
};

/**
 * Remove doc if the param is not set it will try the
 * id field inside the object
 * @todo throw exception if documentnotfound doesn't exists
 * @param id
 */
Publisher.prototype.delete = function (id) {

    if (id == undefined) {
        id = this.id;
    }

    return r.table(_COLLECTION).get(id).delete();
};

module.exports = Publisher;