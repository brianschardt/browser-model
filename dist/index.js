"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var get = require("lodash.get");
var Model = /** @class */ (function () {
    function Model(obj_data) {
        //Instance Model Events
        //events are save, remove, reload, change
        this._events = {};
        Object.assign(this, obj_data);
    }
    Model.prototype.getModelName = function () {
        return this.static.getModelName();
    };
    Model.prototype.toObject = function () {
        var properties = Object.getOwnPropertyNames(this);
        var obj = {};
        for (var i in properties) {
            var property = properties[i];
            obj[property] = this[property];
        }
        return obj;
    };
    Model.prototype.uniqueQueryIdentifier = function () {
        var primary_id = this.static.getPrimaryKey();
        var query_obj = {};
        query_obj[primary_id] = this[primary_id];
        return query_obj;
    };
    Model.prototype.uniqueIdName = function () {
        return this.static.getPrimaryKey();
    };
    Model.prototype.uniqueId = function () {
        var unique_name = this.uniqueIdName();
        return this[unique_name];
    };
    Model.prototype.save = function () {
        var query_obj = this.uniqueQueryIdentifier();
        var update_object = this.toObject();
        this.static.findOneAndUpdate(query_obj, update_object, { upsert: true });
        this.emit(['save', 'change']);
        // return (this.constructor as any).instantiateObject(update_object);
    };
    Model.prototype.remove = function () {
        var query_obj = this.uniqueQueryIdentifier();
        this.static.remove(query_obj);
        this.static.removeInstance(query_obj);
        this.emit(['remove', 'change']);
    };
    Model.prototype.reload = function () {
        var model = this.static.findById(this.uniqueId(), true);
        var obj = model.toObject();
        Object.assign(this, obj);
        this.emit(['reload', 'change']);
    };
    Model.prototype.getStorageValues = function () {
        var name = this.uniqueIdName();
        var id = this[name];
        return this.static.findById(id, true).toObject();
    };
    Model.prototype.getInstanceValues = function () {
        return this.toObject();
    };
    Model.prototype.getPropertyDifferences = function () {
        var instance = this.getInstanceValues();
        var storage = this.getStorageValues();
        return this.static.difference(instance, storage);
    };
    Object.defineProperty(Model.prototype, "static", {
        get: function () {
            return this.constructor;
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.storageDifference = function () {
        var diff = this.getPropertyDifferences();
        var storage = this.getStorageValues();
        var storage_differences = _.pick(storage, function (value, key, object) {
            return diff.includes(key);
        });
        return storage_differences;
    };
    Model.prototype.instanceDifference = function () {
        var diff = this.getPropertyDifferences();
        var instance = this.getInstanceValues();
        var instance_differences = _.pick(instance, function (value, key, object) {
            return diff.includes(key);
        });
        return instance_differences;
    };
    //********               *********
    //******** RELATIONSHIPS *********
    //********               *********
    Model.prototype.belongsTo = function (model, foreign_key, reference_key) {
        var query_obj = {};
        query_obj[reference_key] = this[foreign_key];
        return model.findOne(query_obj);
    };
    Model.prototype.hasOne = function (model, foreign_key, reference_key) {
        var query_obj = {};
        query_obj[foreign_key] = this[reference_key];
        return model.findOne(query_obj);
    };
    Model.prototype.hasMany = function (model, foreign_key, reference_key) {
        var query_obj = {};
        query_obj[foreign_key] = this[reference_key];
        return model.find(query_obj);
    };
    Model.prototype.belongsToMany = function (model, foreign_key, reference_key, contains) {
        var query_obj = {};
        if (contains) {
            var value_array = this.static.newGet(this.toObject(), foreign_key);
            var instance_array = [];
            for (var i in value_array) {
                var value = value_array[i];
                query_obj[reference_key] = value;
                var instances = model.find(query_obj);
                instance_array = instance_array.concat(instances);
            }
            return instance_array;
        }
        else {
            query_obj[foreign_key] = get(this.toObject(), reference_key);
            return model.findArray(query_obj);
        }
    };
    //***************************************
    //*********** STATIC ********************
    //***************************************
    Model.describe = function () {
        var properties = Object.getOwnPropertyNames(this);
        properties = properties.splice(3);
        return properties;
    };
    Model.setlocalStorage = function (name, data) {
        localStorage.setItem(name, JSON.stringify(data));
    };
    Model.getlocalStorage = function (name) {
        return JSON.parse(localStorage.getItem(name) || '[]');
    };
    Model.removeLocalStorage = function (name) {
        localStorage.removeItem(name);
    };
    Model.getModelName = function () {
        if (!this.model_name)
            this.model_name = this.toString().split('(' || /s+/)[0].split(' ' || /s+/)[1];
        return this.model_name;
    };
    Model.removeAllData = function () {
        var model_name = this.getModelName();
        this.removeLocalStorage(model_name);
        this._instances = [];
        this.emit(['remove', 'change']);
    };
    Model.setAllData = function (data) {
        var model_name = this.getModelName();
        this.setlocalStorage(model_name, data);
    };
    Model.getAllData = function () {
        var model_name = this.getModelName();
        var data = this.getlocalStorage(model_name);
        if (!data) {
            data = [];
            this.setAllData(data);
        }
        return data;
    };
    Model.getPrimaryKey = function () {
        var schema = this.SCHEMA;
        var primary_key = 'id';
        for (var key in schema) {
            var prop = schema[key];
            if (typeof prop === 'object') {
                for (var i in prop) {
                    var eprop = prop[i];
                    if (i === 'primary' && eprop === true) {
                        primary_key = key;
                    }
                }
            }
        }
        return primary_key;
    };
    Model.getSchema = function () {
        var schema = this.SCHEMA;
        if (!schema[this.getPrimaryKey()]) {
            schema['id'] = { type: 'number', primary: true };
        }
        return schema;
    };
    Model.schemaValidate = function (data) {
        var schema = this.getSchema();
        var new_data = {};
        for (var key in schema) {
            if (data[key]) {
                new_data[key] = data[key];
            }
            else {
                new_data[key] = '';
            }
        }
        return new_data;
    };
    //singe means that this object does not share a data reference to anywhere else
    Model.instantiateObject = function (obj_data, single) {
        var _this = this;
        var obj;
        if (!this._instances)
            this._instances = [];
        if (typeof single !== "undefined" && single === true) {
            obj = new this(obj_data);
            return obj;
        }
        var primary_key = this.getPrimaryKey();
        obj = this._instances.filter(function (instance) {
            return instance[primary_key] === obj_data[primary_key] && instance instanceof _this;
        })[0];
        if (!obj) {
            obj = new this(obj_data);
            this._instances.push(obj);
        }
        return obj;
    };
    Model.create = function (data, single) {
        var old_data = this.getAllData();
        var instance = this.schemaValidate(data);
        var primary_key = this.getPrimaryKey();
        if (!instance[primary_key]) {
            var id = 1;
            if (old_data.length != 0) {
                id = Math.max.apply(Math, old_data.map(function (o) { return o[primary_key]; }));
                id++;
            }
            instance[primary_key] = id;
        }
        var check = old_data.filter(function (m) { return m[primary_key] === instance[primary_key]; })[0];
        if (check) {
            throw Error("Duplicate key in " + this.getModelName() + " model, key: " + primary_key + " value: " + instance[primary_key]);
        } //means there is already an object with this primary key
        if (!instance[primary_key] || instance[primary_key] == '') {
            throw Error("No key given in " + this.getModelName() + " model, key: " + primary_key + " value: " + instance[primary_key]);
        }
        old_data.push(instance);
        this.setAllData(old_data);
        var inst_obj = this.instantiateObject(instance, single);
        this.emit(['create', 'change']);
        return inst_obj;
    };
    Model.removeInstance = function (search) {
        this._instances = this._instances.filter(function (instance) {
            var obj = instance.toObject();
            return !_.isMatch(obj, search);
        });
        this.emit(['remove', 'change']);
    };
    Model.removeStorage = function (search) {
        var all_data = this.getAllData();
        var new_data = all_data.filter(function (data) { return !_.isMatch(data, search); });
        this.setAllData(new_data);
    };
    Model.remove = function (search) {
        this.removeStorage(search);
        this.emit(['remove', 'change']);
    };
    Model.update = function (search, new_data, single) {
        var all_data = this.getAllData();
        var instances = all_data.filter(function (data) { return _.isMatch(data, search); });
        if (!instances) {
            return null;
        }
        this.remove(search);
        var array = [];
        for (var i in instances) {
            var instance = instances[i];
            var primary = this.getPrimaryKey();
            var query_obj = {};
            query_obj[primary] = instance[primary];
            var r_instance = this.updateOne(query_obj, new_data, single);
            array.push(r_instance);
        }
        return array;
    };
    Model.updateOne = function (search, new_data, single) {
        var all_data = this.getAllData();
        var instance = all_data.filter(function (data) { return _.isMatch(data, search); })[0];
        if (!instance)
            return null;
        this.remove(search);
        for (var o in new_data) {
            instance[o] = new_data[o];
        }
        var new_i = this.create(instance, single);
        var obj = new_i.toObject();
        var schema = this.getSchema();
        for (var i in new_data) {
            if (schema[i]) {
                new_i[i] = new_data[i];
            }
        }
        return new_i;
    };
    Model.search = function (search) {
        var all_data = this.getAllData();
        var instances = all_data.filter(function (data) {
            var found = true;
            var keys = _.keys(search);
            for (var i in keys) {
                var key = keys[i];
                var value = search[key];
                var nested_value = get(data, key);
                if (nested_value != value)
                    found = false;
            }
            return found;
        });
        return instances;
    };
    Model.find = function (search, single) {
        var all_data = this.getAllData();
        var instances = this.search(search);
        var final_objs = instances;
        var array = [];
        for (var i in final_objs) {
            var instance = final_objs[i];
            instance = this.instantiateObject(instance, single);
            array.push(instance);
        }
        return array;
    };
    Model.findOne = function (search, single) {
        var all_data = this.getAllData();
        var instance;
        if (!search) {
            instance = all_data[0];
        }
        else {
            instance = this.search(search)[0];
        }
        if (typeof instance === 'undefined' || !instance)
            return null;
        instance = this.instantiateObject(instance, single);
        return instance;
    };
    Model.findArray = function (search, single) {
        var _this = this;
        var all_data = this.getAllData();
        var key = _.keys(search)[0];
        var value = search[key];
        var instances = all_data.filter(function (data) {
            var nested_value = _this.newGet(data, key);
            return nested_value.length > 0;
        });
        var final_objs = instances;
        var array = [];
        for (var i in final_objs) {
            var instance = final_objs[i];
            instance = this.instantiateObject(instance, single);
            array.push(instance);
        }
        return array;
    };
    Model.findOneArray = function (search, single) {
        var _this = this;
        var all_data = this.getAllData();
        var instance;
        if (!search) {
            instance = all_data[0];
        }
        else {
            var key_1 = _.keys(search)[0];
            var value = search[key_1];
            instance = all_data.filter(function (data) {
                var nested_value = _this.newGet(data, key_1);
                return nested_value.length > 0;
            })[0];
        }
        if (typeof instance === 'undefined' || !instance)
            return null;
        instance = this.instantiateObject(instance, single);
        return instance;
    };
    Model.findOneAndUpdate = function (search, data, options) {
        if (typeof search !== 'object')
            throw Error("No search query given in " + this.getModelName() + " model");
        var all_data = this.getAllData();
        var instance = all_data.filter(function (data) { return _.isMatch(data, search); })[0];
        var final_obj = instance;
        if (!instance) {
            if (typeof options === 'object' && options.upsert === true) {
                if (_.isEmpty(data)) {
                    instance = this.create(search, options.single);
                }
                else {
                    instance = this.create(data, options.single);
                }
            }
            else {
                instance = null;
            }
        }
        else {
            instance = this.updateOne(search, data, options.single);
        }
        return instance;
    };
    Model.createOrUpdate = function (search) {
        var primary_key = this.getPrimaryKey();
        var value = search[primary_key];
        var query_obj = {};
        query_obj[primary_key] = value;
        var new_i = this.findOneAndUpdate(query_obj, search, { upsert: true });
        return new_i;
    };
    Model.findById = function (id, single) {
        var primary_key = this.getPrimaryKey();
        var obj = {};
        obj[primary_key] = id;
        return this.findOne(obj, single);
    };
    Model.difference = function (a, b) {
        var diff = _.reduce(a, function (result, value, key) {
            return _.isEqual(value, b[key]) ?
                result : result.concat(key);
        }, []);
        return diff;
    };
    Model.newGet = function (obj, str) {
        var keys = str.split("."); // split on dot notation
        var check_array = [];
        for (var i in keys) {
            var check_str = void 0;
            var key = keys[i];
            var em_check_array = [];
            if (check_array.length <= 0) {
                var t_1 = get(obj, key);
                em_check_array.push(get(obj, key));
            }
            else {
                for (var z in check_array) {
                    var local_str = check_array[z];
                    check_str = local_str + '.' + key;
                    var t_2 = get(obj, check_str);
                    if (_.isArray(t_2)) {
                        em_check_array.push(get(obj, check_str));
                    }
                    else {
                        em_check_array.push(get(obj, check_str));
                        break;
                    }
                }
            }
            for (var t in em_check_array) {
                var check = em_check_array[t];
                if (_.isArray(check)) {
                    var len = check.length;
                    for (var o = 0; o < len; o++) {
                        check_array.push(key + '[' + o + ']');
                    }
                }
                else {
                    if (check_array.length <= 0) {
                        check_array.push(key);
                    }
                    else {
                        for (var o in check_array) {
                            check_array[o] = check_array[o] + '.' + key;
                        }
                    }
                }
            }
        }
        var values = [];
        for (var i in check_array) {
            var check = check_array[i];
            values.push(get(obj, check));
        }
        return values;
    };
    Model.on = function (events, listener) {
        var _this = this;
        if (!this._events)
            this._events = {};
        if (typeof events === 'string') {
            if (!this._events[events])
                this._events[events] = [];
            this._events[events].push(listener);
            return function () {
                _this._events[events] = _this._events[events].filter(function (l) { return l !== listener; });
            };
        }
        else {
            for (var i in events) {
                var event_1 = events[i];
                if (!this._events[event_1])
                    this._events[event_1] = [];
                this._events[event_1].push(listener);
            }
            return function () {
                for (var _i = 0, events_1 = events; _i < events_1.length; _i++) {
                    var event_2 = events_1[_i];
                    _this._events[event_2] = _this._events[event_2].filter(function (l) { return l !== listener; });
                }
            };
        }
    };
    Model.emit = function (events, data) {
        if (!this._events)
            this._events = {};
        if (typeof events === 'string') {
            var event_listeners = this._events[events];
            if (event_listeners)
                event_listeners.forEach(function (listener) { return listener(data); });
        }
        else {
            for (var i in events) {
                var kind = events[i];
                var event_listeners = this._events[kind];
                if (event_listeners)
                    event_listeners.forEach(function (listener) { return listener(data); });
            }
        }
    };
    Model.prototype.on = function (events, listener) {
        var _this = this;
        if (typeof events === 'string') {
            if (!this._events[events])
                this._events[events] = [];
            this._events[events].push(listener);
            return function () {
                _this._events[events] = _this._events[events].filter(function (l) { return l !== listener; });
            };
        }
        else {
            for (var i in events) {
                var event_3 = events[i];
                if (!this._events[event_3])
                    this._events[event_3] = [];
                this._events[event_3].push(listener);
            }
            return function () {
                for (var _i = 0, events_2 = events; _i < events_2.length; _i++) {
                    var event_4 = events_2[_i];
                    _this._events[event_4] = _this._events[event_4].filter(function (l) { return l !== listener; });
                }
            };
        }
    };
    Model.prototype.emit = function (events, data, toStatic) {
        if (typeof events === 'string') {
            var event_listeners = this._events[events];
            if (event_listeners)
                event_listeners.forEach(function (listener) { return listener(data); });
        }
        else {
            for (var i in events) {
                var kind = events[i];
                var event_listeners = this._events[kind];
                if (event_listeners)
                    event_listeners.forEach(function (listener) { return listener(data); });
            }
        }
        if (toStatic)
            this.static.emit(events, data); //this will send it to the whole class events
    };
    return Model;
}());
exports.Model = Model;
