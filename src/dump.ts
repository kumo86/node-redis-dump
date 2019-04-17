import {waterfall as run} from 'async';
import * as redis from 'redis';
import {RedisClient} from 'redis';


class RedisDumper {
    db: RedisClient;
    clean: boolean;

    constructor({port, host, auth, tls, dirty}) {
        this.clean = !dirty;
        if (auth != null) {
            this.db = redis.createClient(port, host, {
                auth_pass: auth,
                tls: tls
            });
        } else {
            this.db = redis.createClient(port, host);
        }
    }

    public close() {
        return this.db.end();
    }

    public escape(value) {
        if (/^([a-zA-Z0-9_\:\-]+)$/.test("" + value)) {
            return "" + value;
        } else {
            return "'" + ("" + value).split('\\').join('\\\\').split('\'').join('\\\'') + "'";
        }
    }

    public dump({db, filter, format, convert, pretty}, callback) {
        let e;
        let keys = [];
        const types = [];
        const values = [];
        const ttls = [];
        if (typeof convert === 'string') {
            try {
                convert = JSON.parse(convert);
            } catch (_error) {
                // e = _error;
                return callback(_error);
            }
        }
        this.db.select(db);
        return run([(next) => {
            try {
                if (convert != null) {
                    return next(null, (function () {
                        var _results = [];
                        for (const k in convert) {
                            _results.push(k);
                        }
                        return _results;
                    })());
                } else {
                    return this.db.keys(filter, next);
                }
            } catch (_error) {
                return next(_error);
            }
        }, (reply, next) => {
            // var k, key, multi, v, _i, _j, _len, _len1;
            try {
                for (let _i = 0, _len = reply.length; _i < _len; _i++) {
                    keys.push(reply[_i]);
                }
                if (keys.length === 0) {
                    if (format === 'json') {
                        callback(null, '{}');
                    } else if (format === 'raw') {
                        callback(null, {});
                    } else {
                        callback(null, '');
                    }
                    next(null, null);
                    return;
                }
                keys = keys.sort();
                if (convert != null) {
                    return next(null, (function () {
                        const _results = [];
                        for (const k in convert) {
                            const v = convert[k];
                            _results.push(v.type);
                        }
                        return _results;
                    })());
                } else {
                    const multi = this.db.multi();
                    for (let _j = 0, _len1 = keys.length; _j < _len1; _j++) {
                        multi.type(keys[_j]);
                    }
                    return multi.exec(next);
                }
            } catch (_error) {
                return next(_error);
            }
        }, (replies, next) => {
            var entry, i, multi, result, type, val, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref;
            try {
                if (keys.length === 0) {
                    next(null, null);
                    return;
                }
                for (_i = 0, _len = replies.length; _i < _len; _i++) {
                    type = replies[_i];
                    types.push(type);
                }
                if (convert != null) {
                    result = [];
                    for (i = _j = 0, _len1 = types.length; _j < _len1; i = ++_j) {
                        type = types[i];
                        switch (type) {
                            case 'string':
                                result.push(convert[keys[i]].value);
                                break;
                            case 'list':
                                result.push(convert[keys[i]].value);
                                break;
                            case 'set':
                                result.push(convert[keys[i]].value);
                                break;
                            case 'zset':
                                val = [];
                                _ref = convert[keys[i]].value;
                                for (_k = 0, _len2 = _ref.length; _k < _len2; _k++) {
                                    entry = _ref[_k];
                                    val.push(entry[1]);
                                    val.push(entry[0]);
                                }
                                result.push(val);
                                break;
                            case 'hash':
                                result.push(convert[keys[i]].value);
                        }
                    }
                    return next(null, result);
                } else {
                    multi = this.db.multi();
                    for (i = _l = 0, _len3 = types.length; _l < _len3; i = ++_l) {
                        type = types[i];
                        switch (type) {
                            case 'string':
                                multi.get(keys[i]);
                                break;
                            case 'list':
                                multi.lrange(keys[i], 0, -1);
                                break;
                            case 'set':
                                multi.smembers(keys[i]);
                                break;
                            case 'zset':
                                multi.zrange(keys[i], 0, -1, 'withscores');
                                break;
                            case 'hash':
                                multi.hgetall(keys[i]);
                        }
                    }
                    return multi.exec(next);
                }
            } catch (_error) {
                return next(_error);
            }
        }, (replies, next) => {
            var key, multi, result, value, _i, _j, _k, _len, _len1, _len2;
            try {
                if (keys.length === 0) {
                    next(null, null);
                    return;
                }
                for (_i = 0, _len = replies.length; _i < _len; _i++) {
                    value = replies[_i];
                    values.push(value);
                }
                if (convert != null) {
                    result = [];
                    for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
                        key = keys[_j];
                        if (convert[key].ttl != null) {
                            result.push("" + convert[key].ttl);
                        } else {
                            result.push("-1");
                        }
                    }
                    return next(null, result);
                } else {
                    multi = this.db.multi();
                    for (_k = 0, _len2 = keys.length; _k < _len2; _k++) {
                        key = keys[_k];
                        multi.ttl(key);
                    }
                    return multi.exec(next);
                }
            } catch (_error) {
                return next(_error);
            }
        }, (replies, next) => {
            var commands, i, item, j, json, k, key, len, ttl, type, v, value, _i, _j, _k, _len, _len1, _len2;
            try {
                if (keys.length === 0) {
                    next(null, null);
                    return;
                }
                for (_i = 0, _len = replies.length; _i < _len; _i++) {
                    ttl = replies[_i];
                    ttls.push(ttl);
                }
                switch (format) {
                    case 'json' || 'raw':
                        json = {};
                        for (i = _j = 0, _len1 = types.length; _j < _len1; i = ++_j) {
                            type = types[i];
                            key = keys[i];
                            value = values[i];
                            switch (type) {
                                case 'string':
                                    json[key] = {
                                        type: 'string',
                                        value: value
                                    };
                                    break;
                                case 'list':
                                    json[key] = {
                                        type: 'list',
                                        value: value
                                    };
                                    break;
                                case 'set':
                                    json[key] = {
                                        type: 'set',
                                        value: value.sort()
                                    };
                                    break;
                                case 'zset':
                                    json[key] = {
                                        type: 'zset',
                                        value: (function () {
                                            var _k, _len2, _results;
                                            _results = [];
                                            for (j = _k = 0, _len2 = value.length; _k < _len2; j = _k += 2) {
                                                item = value[j];
                                                _results.push([parseInt(value[j + 1], 10), value[j]]);
                                            }
                                            return _results;
                                        })()
                                    };
                                    break;
                                case 'hash':
                                    json[key] = {
                                        type: 'hash',
                                        value: value
                                    };
                            }
                            ttl = parseInt(ttls[i], 10);
                            if (!isNaN(ttl) && ttl !== -1) {
                                json[key].ttl = ttl;
                            }
                        }
                        if (format === 'json') {
                            if (pretty) {
                                return callback(null, JSON.stringify(json, null, 4));
                            } else {
                                return callback(null, JSON.stringify(json));
                            }
                        } else {
                            return callback(null, json);
                        }
                        break;
                    default:
                        commands = [];
                        for (i = _k = 0, _len2 = types.length; _k < _len2; i = ++_k) {
                            type = types[i];
                            key = keys[i];
                            value = values[i];
                            switch (type) {
                                case 'string':
                                    commands.push("SET     " + (this.escape(key)) + " " + (this.escape(value)));
                                    break;
                                case 'list':
                                    if (this.clean) commands.push("DEL     " + (this.escape(key)));
                                    commands.push("RPUSH   " + (this.escape(key)) + " " + (((function () {
                                        var _l, _len3, _results;
                                        _results = [];
                                        for (_l = 0, _len3 = value.length; _l < _len3; _l++) {
                                            item = value[_l];
                                            _results.push(this.escape(item));
                                        }
                                        return _results;
                                    }).call(this)).join(' ')));
                                    break;
                                case 'set':
                                    if (this.clean) commands.push("DEL     " + (this.escape(key)));
                                    if (value.length !== 0) {
                                        commands.push("SADD    " + (this.escape(key)) + " " + (((function () {
                                            var _l, _len3, _results;
                                            _results = [];
                                            for (_l = 0, _len3 = value.length; _l < _len3; _l++) {
                                                item = value[_l];
                                                _results.push(this.escape(item));
                                            }
                                            return _results;
                                        }).call(this)).join(' ')));
                                    }
                                    break;
                                case 'zset':
                                    if (this.clean) commands.push("DEL     " + (this.escape(key)));
                                    if (value.length !== 0) {
                                        // SPLIT
                                        const limit = 1000;
                                        for (let i = 0; i < value.length; i += limit) {
                                            const subValue = value.slice(i, i + limit);
                                            commands.push("ZADD    " + (this.escape(key)) + " " + (((function () {
                                                var _l, _len3, _results;
                                                _results = [];
                                                for (j = _l = 0, _len3 = subValue.length; _l < _len3; j = _l += 2) {
                                                    item = subValue[j];
                                                    _results.push(this.escape(subValue[j + 1]) + ' ' + this.escape(subValue[j]));
                                                }
                                                return _results;
                                            }).call(this)).join(' ')));
                                        }
                                    }
                                    break;
                                case 'hash':
                                    if (this.clean) commands.push("DEL     " + (this.escape(key)));
                                    len = 0;
                                    for (k in value) {
                                        len++;
                                    }
                                    if (len !== 0) {
                                        commands.push("HMSET   " + (this.escape(key)) + " " + (((function () {
                                            var _results;
                                            _results = [];
                                            for (k in value) {
                                                v = value[k];
                                                _results.push(this.escape(k) + ' ' + this.escape(v));
                                            }
                                            return _results;
                                        }).call(this)).join(' ')));
                                    }
                            }
                            ttl = parseInt(ttls[i], 10);
                            if (!isNaN(ttl) && ttl !== -1) {
                                commands.push("EXPIRE  " + (this.escape(key)) + " " + ttl);
                            }
                        }
                        return callback(null, commands.join("\n"));
                }
            } catch (_error) {
                return next(_error);
            }

        }], function (err) {
            return callback(err);
        });
    }
}

export function dump(params, callback) {
    var dumper;
    if (params.port == null) {
        params.port = 6379;
    }
    if (params.host == null) {
        params.host = '127.0.0.1';
    }
    if (params.db == null) {
        params.db = '0';
    }
    if (params.filter == null) {
        params.filter = '*';
    }
    if (params.format == null) {
        params.format = 'redis';
    }
    if (params.convert == null) {
        params.convert = null;
    }
    if (params.dirty == null) {
        params.dirty = false;
    }
    dumper = new RedisDumper(params);
    return dumper.dump(params, function () {
        const params = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
        dumper.close();
        return callback.apply(null, params);
    });
}
