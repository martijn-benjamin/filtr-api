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
 * @author martijn <martijn@cloud-coders.com>
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

    return res.send(result);
});

/**
 * Simple search matching name
 */
exports.name = async(function*(req, res) {

    var result =
        yield r.table(_COLLECTION).filter({name: req.params.name});

    return res.send(result);
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

    return res.send(result);
});

/**
 * Get list of all Publishers
 */
exports.list = async(function*(req, res) {

    var result =
        yield new Publisher().find(false);

    return res.send(result);
});

/**
 * Get a Publisher by id
 *
 * @todo pretty quick and dirty collection of the tag count. could use some reviewing for efficiency and performance
 */
exports.get = async(function*(req, res) {

    var publisher = new Publisher();

    var result =
        yield publisher.findFirstById(req.params.id);

    if (result) {

        var tags = yield r.table('vote').filter({publicationId: req.params.id}).group('tag').count();

        result['tags'] = {};

        for (var i = 0; i < tags.length; i++) {

            result['tags'][tags[i].group] = tags[i].reduction;
        }

    } else {

        res.statusCode = 404;
    }

    return res.send(result);
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

        return res.send(ids);
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

        return res.send(yield publisher.update());
    }
});

/**
 * remove a Publisher
 */
exports.remove = async(function*(req, res) {

    var publisher = new Publisher();

    var result =
        yield publisher.delete(req.params.id);

    return res.send(result);
});


/**
 * Get vote
 */
exports.vote = async(function*(req, res) {

    console.info(req.user);

    if (!req.user) {
        return res.send([]);
    }

    var result =
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id});

    return res.send(result);
});

/**
 * Up vote
 *
 * @todo check if user already up voted this pub
 */
exports.voteUp = async(function*(req, res) {

    var entry =
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id});

    // not entry
    if (entry.length === 0) {

        // add entry for this publisher / user
        yield r.table('vote').insert({
            publicationId: req.params.id,
            userId: req.user[0].id,
            score: 1,
            tag: ''
        });

        // update publisher overall count
        var result =
            yield r.table(_COLLECTION).get(req.params.id).update({
                score: r.row('score').add(1).default(0)
            }, {
                returnChanges: true
            });

        return res.send(result);

    } else if (entry[0].score === 1) {

        // already up voted
        res.statusCode = 403;

        return res.send({
            message: 'You already up voted this Publisher'
        });

    } else {

        // user either has:
        // 0 == not voted yet, we add 1
        // -1 == previous down vote we add 2 to neutralize the down vote and add the up vote

        var add = 1;

        // we need to go from down vote to up vote
        if (entry[0].score === -1) {
            add = 2;
        }

        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id}).update({score: 1});

        result =
            yield r.table(_COLLECTION).get(req.params.id).update({
                score: r.row('score').add(add)
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

    var entry =
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id});

    // no entry
    if (entry.length === 0) {

        yield r.table('vote').insert({
            publicationId: req.params.id,
            userId: req.user[0].id,
            score: -1,
            tag: ''
        });

        var result =
            yield r.table(_COLLECTION).get(req.params.id).update({
                score: r.row('score').sub(1).default(0)
            }, {
                returnChanges: true
            });

        return res.send(result);

    } else if (entry[0].score === -1) {

        // already down voted
        res.statusCode = 403;

        return res.send({
            message: 'You already down voted this Publisher'
        });

    } else {

        // user either has:
        // 0 == not voted yet, we sub 1
        // 1 == previous up vote we sub 2 to neutralize the up vote and add the down vote

        var sub = 1;

        // we need to go from down vote to up vote
        if (entry[0].score === 1) {
            sub = 2;
        }

        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id}).update({score: -1});

        result =
            yield r.table(_COLLECTION).get(req.params.id).update({
                score: r.row('score').sub(sub)
            }, {
                returnChanges: true
            });

        return res.send(result);
    }
});

/**
 * Tag
 */
exports.tag = async(function*(req, res) {

    var tag = req.body.tag;

    var tagged =
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id});

    console.info(tagged);

    // not voted or tagged yet
    if (tagged.length === 0) {

        // neutral score & provided tag
        yield r.table('vote').insert({
            publicationId: req.params.id,
            userId: req.user[0].id,
            score: 0,
            tag: tag
        });

    } else {

        // update tag
        yield r.table('vote').filter({publicationId: req.params.id, userId: req.user[0].id}).update({tag: tag});

    }

    return res.send({
        message: 'ok'
    });
});