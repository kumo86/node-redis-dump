"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const async_1 = require("async");
const redis = require("redis");
class RedisDumper {
    constructor({ port, host, auth, tls }) {
        if (auth != null) {
            this.db = redis.createClient(port, host, {
                auth_pass: auth,
                tls: tls
            });
        }
        else {
            this.db = redis.createClient(port, host);
        }
    }
    close() {
        return this.db.end();
    }
    escape(value) {
        if (/^([a-zA-Z0-9_\:\-]+)$/.test("" + value)) {
            return "" + value;
        }
        else {
            return "'" + ("" + value).split('\\').join('\\\\').split('\'').join('\\\'') + "'";
        }
    }
    dump({ db, filter, format, convert, pretty }, callback) {
        let e;
        let keys = [];
        const types = [];
        const values = [];
        const ttls = [];
        if (typeof convert === 'string') {
            try {
                convert = JSON.parse(convert);
            }
            catch (_error) {
                // e = _error;
                return callback(_error);
            }
        }
        this.db.select(db);
        return async_1.waterfall([(next) => {
                try {
                    if (convert != null) {
                        return next(null, (function () {
                            var _results = [];
                            for (const k in convert) {
                                _results.push(k);
                            }
                            return _results;
                        })());
                    }
                    else {
                        return this.db.keys(filter, next);
                    }
                }
                catch (_error) {
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
                        }
                        else if (format === 'raw') {
                            callback(null, {});
                        }
                        else {
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
                    }
                    else {
                        const multi = this.db.multi();
                        for (let _j = 0, _len1 = keys.length; _j < _len1; _j++) {
                            multi.type(keys[_j]);
                        }
                        return multi.exec(next);
                    }
                }
                catch (_error) {
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
                    }
                    else {
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
                }
                catch (_error) {
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
                            }
                            else {
                                result.push("-1");
                            }
                        }
                        return next(null, result);
                    }
                    else {
                        multi = this.db.multi();
                        for (_k = 0, _len2 = keys.length; _k < _len2; _k++) {
                            key = keys[_k];
                            multi.ttl(key);
                        }
                        return multi.exec(next);
                    }
                }
                catch (_error) {
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
                                }
                                else {
                                    return callback(null, JSON.stringify(json));
                                }
                            }
                            else {
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
                                        commands.push("DEL     " + (this.escape(key)));
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
                                        commands.push("DEL     " + (this.escape(key)));
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
                                        commands.push("DEL     " + (this.escape(key)));
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
                                        commands.push("DEL     " + (this.escape(key)));
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
                }
                catch (_error) {
                    return next(_error);
                }
            }], function (err) {
            return callback(err);
        });
    }
}
function dump(params, callback) {
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
    dumper = new RedisDumper(params);
    return dumper.dump(params, function () {
        const params = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];
        dumper.close();
        return callback.apply(null, params);
    });
}
exports.dump = dump;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHVtcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9kdW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQXVDO0FBQ3ZDLCtCQUErQjtBQUkvQixNQUFNLFdBQVc7SUFHYixZQUFZLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDO1FBQy9CLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtZQUNkLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO2dCQUNyQyxTQUFTLEVBQUUsSUFBSTtnQkFDZixHQUFHLEVBQUUsR0FBRzthQUNYLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztJQUVNLEtBQUs7UUFDUixPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxLQUFLO1FBQ2YsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFO1lBQzFDLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQztTQUNyQjthQUFNO1lBQ0gsT0FBTyxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQztTQUNyRjtJQUNMLENBQUM7SUFFTSxJQUFJLENBQUMsRUFBQyxFQUFFLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLEVBQUUsUUFBUTtRQUN2RCxJQUFJLENB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