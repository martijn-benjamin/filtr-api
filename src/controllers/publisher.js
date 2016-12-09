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
 *     Controller for the publishers
 *
 * @author martijn <martijn@spent-time.com>
 * @author denzyl <denzyl@live.nl>
 */

var r = require('../config/rethink').r;
var {wrap: async} = require('co');
var Publisher = require("../model/Publisher");
var _COLLECTION = 'publisher';

/**
 * Simple search matching name for Domain type
 */
exports.domain = async(function*(req, res) {

    var result =
        yield r.table(_COLLECTION).filter({type: 'Domain', name: req.params.domain});

    res.send(result);
});

/**
 * Simple search matching name
 */
exports.name = async(function*(req, res) {

    var result =
        yield r.table(_COLLECTION).filter({name: req.params.name});

    res.send(result);
});

/**
 * Bulk match Publisher names. All types.
 *
 * @todo maybe we can avoid the object to array vv conversion
 */
exports.bulk = async(function*(req, res) {

    var publisherNameArray = Object.keys(req.body).map(function (key) {
        return key.toLowerCase();
    });

    var found =
        yield r.table(_COLLECTION).filter(
            function (doc) {
                return r.expr(publisherNameArray).contains(doc('name'));
            }
        );

    var result = {};

    for (var i = 0; i < found.length; i++) {

        result[found[i].name] = found[i];
    }

    res.send(result);
});

/**
 * Get list of all Publishers
 */
exports.list = async(function*(req, res) {

    var result =
        yield new Publisher().find(false);

    res.send(result);
});

/**
 * Get a Publisher by id
 */
exports.get = async(function*(req, res) {

    var publisher = new Publisher();

    var result =
        yield publisher.findFirstById(req.params.id);

    result == null ? res.statusCode = 404 : res.statusCode = 200;

    res.send(result);
});

/**
 * Create Publishers and return their ids
 */
exports.create = async(function*(req, res) {

    if (req.body !== undefined) {

        var ids =
            yield req.body.map(function (object) {

                let publisher = new Publisher();

                publisher.setName(object.name);
                publisher.setType(object.type);
                publisher.setScore(object.score);

                return publisher.create();
            });

        res.send(ids);
    }
});

/**
 * update a Publisher
 */
exports.update = async(function*(req, res) {

    if (req.body !== undefined) {

        let publisher = new Publisher();

        publisher.setId(req.params.id);
        publisher.setName(req.body.name);
        publisher.setType(req.body.type);
        publisher.setScore(req.body.score);

        res.send(yield publisher.update());
    }
});

/**
 * remove a Publisher
 */
exports.remove = async(function*(req, res) {

    var publisher = new Publisher();

    var result =
        yield publisher.delete(req.params.id);

    res.send(result);
});

/**
 * Up vote
 *
 * @todo check if user already up voted this pub
 */
exports.voteUp = async(function*(req, res) {

    var voted =
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id});

    // not voted yet
    if (voted.length === 0) {

        yield r.table('vote').insert({publicationId: req.params.id, userId: req.user[0].id, score: 1});

        var result =
            yield r.table(_COLLECTION).get(req.params.id).update({
                score: r.row('score').add(1).default(0)
            }, {
                returnChanges: true
            });

        return res.send(result);

    } else if (voted.length > 1) {

        // something wrong here
        console.error('Multiple voting entries found');

        res.statusCode = 500;

        return res.send({
            message: 'Multiple voting entries found'
        });

    } else if (voted[0].score === 1) {

        // already upvoted
        res.statusCode = 403;

        return res.send({
            message: 'You already up voted this Publisher'
        });

    } else {

        // voted down before, double up vote
        // @todo do we have to add that the vote can go back to 0 == neutral / not voted?
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id}).update({score: 1});

        var result =
            yield r.table(_COLLECTION).get(req.params.id).update({
                score: r.row('score').add(2).default(0)
            }, {
                returnChanges: true
            });

        return res.send(result);
    }
});

/**
 * Down vote
 *
 * @todo check if user already down voted this pub
 */
exports.voteDown = async(function*(req, res) {

    var voted =
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id});

    console.info(voted);

    // not voted yet
    if (voted.length === 0) {

        yield r.table('vote').insert({publicationId: req.params.id, userId: req.user[0].id, score: -1});

        var result =
            yield r.table(_COLLECTION).get(req.params.id).update({
                score: r.row('score').sub(1).default(0)
            }, {
                returnChanges: true
            });

        return res.send(result);

    } else if (voted.length > 1) {

        // something wrong here
        console.error('Multiple voting entries found');

        res.statusCode = 500;

        return res.send({
            message: 'Multiple voting entries found'
        });

    } else if (voted[0].score === -1) {

        // already downvoted
        res.statusCode = 403;

        return res.send({
            message: 'You already down voted this Publisher'
        });

    } else {

        // voted up before, double down vote
        // @todo do we have to add that the vote can go back to 0 == neutral / not voted?
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id}).update({score: -1});

        var result =
            yield r.table(_COLLECTION).get(req.params.id).update({
                score: r.row('score').sub(2).default(0)
            }, {
                returnChanges: true
            });

        return res.send(result);
    }
});