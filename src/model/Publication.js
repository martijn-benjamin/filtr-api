let r = require('../config/rethink').r;
let {wrap: async} = require('co');

let _COLLECTION = 'publication';
let _HOAX = 'hoax';
let _SATIRE = "satire";
let _CLICKBAIT = "clickbait";

/**
 *
 * @constructor
 */
function Publication() {
    this.id = null
    this.domain = null;
    this.category = null;
}
/**
 * @param id
 */
Publication.prototype.setId = function (id) {

    this.id = id;
};

/**
 * Set the domain
 * @todo Check if it is a valid domain
 * @param domain string
 */
Publication.prototype.setDomain = function (domain) {
    this.domain = domain;
};
/**
 * Create and validate a publication
 */
Publication.prototype.create = async(function*() {

    var result =
        yield r.table(_COLLECTION).insert({
            domain: this.domain,
            category: this.category
        }, {returnChanges: true}).run().then(function (cursor) {
            return cursor.generated_keys[0];
        });
    return result;
});

/**
 * Check if category is correct and set it.
 * @todo throw exception if not a valid category
 * @param category
 */
Publication.prototype.setCategory = function (category) {
    this.category = category;
};
/**
 * Set category as hoax
 */
Publication.prototype.isHoax = function () {
    this.category = _HOAX;
};
/**
 * Set category as clickbait
 */
Publication.prototype.isCLickBait = function () {
    this.category = _CLICKBAIT;
};
/**
 * Set category as satire
 */
Publication.prototype.isSatire = function () {
    this.category = _SATIRE;
};
Publication.prototype.update = function () {
    if (this.id != null) {
        return r.table(_COLLECTION).update(this.stringify(), {returnChanges: true}).then(function (obj) {
            return obj.changes[0].new_val;
        });
    }
};
/**
 * @todo Check if all fields are valid
 */
Publication.prototype.isValid = function () {
};
/**
 * Parse to fields that are needed to JSON String
 * @returns {{domain: *, category: *, id: *}}
 */
Publication.prototype.stringify = function () {
    return {
        domain: this.domain,
        category: this.category,
        id: this.id
    }
};
/**
 * Return all publications
 * @returns {Array|*}
 */
Publication.prototype.find = function (onlyId) {
    Publication.prototype.onlyId = onlyId;

    return r.table(_COLLECTION).map(function (obj) {
        if (Publication.prototype.onlyId == true) {
            return obj("id");
        }
        var p = new Publication();
        p.setDomain(obj("domain"));
        p.setId(obj("id"));
        p.setCategory(obj("category"));
        return p.stringify();
    })
};
/**
 * Find a publication by its id
 * @todo throw exception if documentnotfound doesn't exists
 * @param id
 * @returns {*}
 */
Publication.prototype.findFirstById = function (id) {
    return r.table(_COLLECTION).get(id).then(function (obj) {
        var p = new Publication();
        p.setDomain(obj.domain);
        p.setCategory(obj.category);
        p.setId(obj.id);
        return p.stringify();

    });

};

/**
 * Remove doc if the param is not set it will try the
 * id field inside the object
 * @todo throw exception if documentnotfound doesn't exists
 * @param id
 */
Publication.prototype.delete = function (id) {
    if (id == undefined) {
        id = this.id;
    }
    return r.table(_COLLECTION).get(id).delete().run();
};


module.exports = Publication;