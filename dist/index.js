"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var Model = /** @class */ (function () {
    function Model(obj_data) {
        //Instance Model Events
        //Global Model Events
        this._save = [];
        this._remove = [];
        this._reload = [];
        this._change = [];
        Object.assign(this, obj_data);
    }
    Model.prototype.getModelName = function () {
        return this.constructor.getModelName();
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
        var primary_id = this.constructor.getPrimaryKey();
        var query_obj = {};
        query_obj[primary_id] = this[primary_id];
        return query_obj;
    };
    Model.prototype.uniqueIdName = function () {
        return this.constructor.getPrimaryKey();
    };
    Model.prototype.uniqueId = function () {
        var unique_name = this.uniqueIdName();
        return this[unique_name];
    };
    Model.prototype.save = function () {
        var query_obj = this.uniqueQueryIdentifier();
        var update_object = this.toObject();
        this.constructor.findOneAndUpdate(query_obj, update_object, { upsert: true });
        this.emitEvent(['save']);
        // return (this.constructor as any).instantiateObject(update_object);
    };
    Model.prototype.remove = function () {
        var query_obj = this.uniqueQueryIdentifier();
        this.constructor.removeInstance(query_obj);
        this.constructor.remove(query_obj);
        this.emitEvent(['remove']);
    };
    Model.prototype.reload = function () {
        var model = this.constructor.findById(this.uniqueId(), true);
        var obj = model.toObject();
        Object.assign(this, obj);
        this.emitEvent(['reload']);
    };
    Model.prototype.getStorageValues = function () {
        var name = this.uniqueIdName();
        var id = this[name];
        return this.constructor.findById(id, true).toObject();
    };
    Model.prototype.getInstanceValues = function () {
        return this.toObject();
    };
    Model.prototype.getPropertyDifferences = function () {
        var instance = this.getInstanceValues();
        var storage = this.getStorageValues();
        return this.constructor.difference(instance, storage);
    };
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
        this.emitEvent(['delete']);
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
        var obj;
        if (typeof single !== "undefined" && single === true) {
            obj = new this(obj_data);
            return obj;
        }
        var primary_key = this.getPrimaryKey();
        obj = this._instances.filter(function (instance) { return instance[primary_key] === obj_data[primary_key]; })[0];
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
        old_data.push(instance);
        this.setAllData(old_data);
        var inst_obj = this.instantiateObject(instance, single);
        this.emitEvent(['create']);
        return inst_obj;
    };
    Model.removeInstance = function (search) {
        this._instances = this._instances.filter(function (instance) {
            var obj = instance.toObject();
            return !_.isMatch(obj, search);
        });
    };
    Model.removeStorage = function (search) {
        var all_data = this.getAllData();
        var new_data = all_data.filter(function (data) { return !_.isMatch(data, search); });
        this.setAllData(new_data);
    };
    Model.remove = function (search) {
        this.removeStorage(search);
        this._change.forEach(function (listener) { return listener(); });
    };
    Model.update = function (search, new_data, single) {
        var all_data = this.getAllData();
        var instances = all_data.filter(function (data) { return _.isMatch(data, search); });
        if (!instances) {
            return null;
        }
        this.remove(search);
        for (var i in instances) {
            var instance = instances[i];
            for (var o in new_data) {
                instance[o] = new_data[o];
            }
            this.create(instance, single);
        }
    };
    Model.updateOne = function (search, new_data, single) {
        var all_data = this.getAllData();
        var instance = all_data.filter(function (data) { return _.isMatch(data, search); })[0];
        if (!instance) {
            return null;
        }
        this.remove(search);
        for (var o in new_data) {
            instance[o] = new_data[o];
        }
        return this.create(instance, single);
    };
    Model.findOne = function (search, single) {
        var all_data = this.getAllData();
        var instance;
        if (!search) {
            instance = all_data[0];
        }
        else {
            instance = all_data.filter(function (data) { return _.isMatch(data, search); })[0];
        }
        if (typeof instance === 'undefined' || !instance)
            return null;
        instance = this.instantiateObject(instance, single);
        return instance;
    };
    Model.find = function (search, single) {
        var all_data = this.getAllData();
        var instances = all_data.filter(function (data) { return _.isMatch(data, search); });
        var final_objs = instances;
        var array = [];
        for (var i in final_objs) {
            var instance = final_objs[i];
            instance = this.instantiateObject(instance, single);
            array.push(instance);
        }
        return array;
    };
    Model.findOneAndUpdate = function (search, data, options) {
        if (typeof search !== 'object') {
            console.log('search wrong');
        }
        var all_data = this.getAllData();
        var instance = all_data.filter(function (data) { return _.isMatch(data, search); })[0];
        var final_obj = instance;
        if (!instance) {
            if (typeof options === 'object' && options.upsert === true) {
                if (_.isEmpty(data)) {
                    final_obj = this.create(search, options.single);
                }
                else {
                    final_obj = this.create(data, options.single);
                }
            }
            else {
                null;
            }
        }
        else {
            final_obj = this.updateOne(search, data, options.single);
        }
        return final_obj;
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
    Model.onCreate = function (listener) {
        var _this = this;
        this._create.push(listener);
        return function () {
            _this._create = _this._create.filter(function (l) { return l !== listener; });
        };
    };
    Model.onDelete = function (listener) {
        var _this = this;
        this._delete.push(listener);
        return function () {
            _this._delete = _this._delete.filter(function (l) { return l !== listener; });
        };
    };
    Model.onUpdate = function (listener) {
        var _this = this;
        this._update.push(listener);
        return function () {
            _this._update = _this._update.filter(function (l) { return l !== listener; });
        };
    };
    Model.onChange = function (listener) {
        var _this = this;
        this._change.push(listener);
        return function () {
            _this._change = _this._change.filter(function (l) { return l !== listener; });
        };
    };
    Model.emitEvent = function (array) {
        for (var i in array) {
            var kind = array[i];
            switch (kind) {
                case 'create':
                    this._create.forEach(function (listener) { return listener(); });
                    this._change.forEach(function (listener) { return listener(); });
                    break;
                case 'update':
                    this._update.forEach(function (listener) { return listener(); });
                    this._change.forEach(function (listener) { return listener(); });
                    break;
                case 'delete':
                    this._delete.forEach(function (listener) { return listener(); });
                    this._change.forEach(function (listener) { return listener(); });
                    break;
            }
        }
    };
    Model.prototype.onSave = function (listener) {
        var _this = this;
        console.log('on save listener working');
        this._save.push(listener);
        return function () {
            _this._save = _this._save.filter(function (l) { return l !== listener; });
        };
    };
    Model.prototype.onRemove = function (listener) {
        var _this = this;
        this._remove.push(listener);
        return function () {
            _this._remove = _this._remove.filter(function (l) { return l !== listener; });
        };
    };
    Model.prototype.onReload = function (listener) {
        var _this = this;
        this._reload.push(listener);
        return function () {
            _this._reload = _this._reload.filter(function (l) { return l !== listener; });
        };
    };
    Model.prototype.onChange = function (listener) {
        this._change.push(listener);
    };
    Model.prototype.emitEvent = function (array) {
        for (var i in array) {
            var kind = array[i];
            switch (kind) {
                case 'save':
                    this._save.forEach(function (listener) { return listener(); });
                    this._change.forEach(function (listener) { return listener(); });
                    break;
                case 'remove':
                    this._remove.forEach(function (listener) { return listener(); });
                    this._change.forEach(function (listener) { return listener(); });
                    break;
                case 'reload':
                    this._reload.forEach(function (listener) { return listener(); });
                    break;
            }
        }
    };
    //**************************************************
    //*********** STATIC *******************************
    //**************************************************
    Model._instances = [];
    //Global Model Events
    Model._create = [];
    Model._delete = [];
    Model._update = [];
    Model._change = [];
    return Model;
}());
exports.Model = Model;
