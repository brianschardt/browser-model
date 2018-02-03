"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("underscore");
var Model = /** @class */ (function () {
    function Model() {
    }
    Model.prototype.getModelName = function () {
        return this.constructor.getModelName();
    };
    //Static
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
        }
        return new_data;
    };
    Model.instantiateObject = function (obj_data) {
        var obj = new this();
        Object.assign(obj, obj_data);
        return obj;
    };
    Model.create = function (data) {
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
        var inst_obj = this.instantiateObject(instance);
        return inst_obj;
    };
    Model.remove = function (search) {
        var all_data = this.getAllData();
        var new_data = all_data.filter(function (data) { return !_.isMatch(data, search); });
        this.setAllData(new_data);
    };
    Model.update = function (search, new_data) {
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
            this.create(instance);
        }
    };
    Model.updateOne = function (search, new_data) {
        var all_data = this.getAllData();
        var instance = all_data.filter(function (data) { return _.isMatch(data, search); })[0];
        if (!instance) {
            return null;
        }
        this.remove(search);
        for (var o in new_data) {
            instance[o] = new_data[o];
        }
        return this.create(instance);
    };
    Model.findOne = function (search) {
        var all_data = this.getAllData();
        var instance;
        if (!search) {
            instance = all_data[0];
        }
        else {
            instance = all_data.filter(function (data) { return _.isMatch(data, search); })[0];
        }
        instance = this.instantiateObject(instance);
        return instance;
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
                    final_obj = this.create(search);
                }
                else {
                    final_obj = this.create(data);
                }
            }
            else {
                null;
            }
        }
        else {
            final_obj = this.updateOne(search, data);
        }
        return final_obj;
    };
    Model.findById = function (id) {
        var primary_key = this.getPrimaryKey();
        var obj = {};
        obj[primary_key] = id;
        return this.findOne(obj);
    };
    return Model;
}());
exports.Model = Model;
