var mongojs = require('mongojs');
var globalVars = require('./../../globalVars');

function mongoCommon() {
    var db = null;

    this.getDB = function () {
        return db;
    };
    this.openDB = function () {
        if (db == null)
            db = mongojs(globalVars.LocalServer);
    };
    this.disposeDB = function () {
        if (db != null) {
            db.close();
            db = null;
        }
    };

    this.getObjectId = function (id) {
        return mongojs.ObjectId(id);
    };

    this.Query = function (collection, filters, sorts, skipNumber, callback) {
        var self = this;
        var findStr = filters === null || filters === "" ? {} : filters;
        var sortStr = sorts === null ? {} : sorts;
        collection.find(findStr).skip(skipNumber).sort(sortStr, function (err, result) {
            self.QueryComplete(err, result, callback);
        });
    };

    this.QueryWithPage = function (collection, filters, sorts, skipNumber, limitNumber, callback) {
        var self = this;
        var findStr = filters === null || filters === "" ? {} : filters;
        var sortStr = sorts === null ? { $natural: -1 } : sorts;
        collection.find(findStr).sort(sortStr).skip(skipNumber).limit(limitNumber, function (err, result) {
            self.QueryComplete(err, result, callback);
        });
    };

    this.QueryComplete = function (err, result, callback) {
        var message = {};
        if (err) {
            //trace error into local file
            console.log('ERROR: [mongoCommon.queryComplete()] - Exception raised: ' + err);
            message.status = false;
            message.content = err;
        }
        else {
            message.status = true;
            message.content = result;
        }
        if (callback) callback(message);
    };
}

mongoCommon.prototype.saveData = function (collection, data, callback) {
    if (!collection || collection.length == 0) {
        var collectionErr = new Error('The saving collection can not be NULL!');
        if (callback) callback({ status: false, content: collectionErr });
    }
    if (!data || data == {}) {
        var dataErr = new Error('The saving data can not be NULL or EMPTY!');
        if (callback) callback({ status: false, content: dataErr });
    }
    console.log("DEBUG: [mongoCommon.saveData()] - saving data into collection: [" + collection + "], Data: " + JSON.stringify(data));
    var self = this;
    try {
        self.openDB();
        var dbCollection = self.getDB().collection(collection);
        dbCollection.save(data, function (err, result) {
            self.disposeDB();
            var message = {};
            if (err) {
                console.log("ERROR: [mongoCommon.saveData()] - Exception raised: " + err);
                message.status = false;
                message.content = err;
            }
            else {
                message.status = true;
                message.content = result;
            }
            if (callback) callback(message);
        });
    }
    catch (err) {
        self.disposeDB();
        console.log("ERROR: [mongoCommon.saveData()] - Exception raised: " + err);
        var message = {
            status: false,
            content: err
        };
        if (callback) callback(message);
    }
};

mongoCommon.prototype.selectData = function (queryFilter, callback) {
    if (!queryFilter.collection || queryFilter.collection.length == 0) {
        var message = {
            status: false,
            content: new Error("collection name is required while select data on mongodb!")
        };
        if (callback) callback(message);
        return;
    }
    var filters = queryFilter.filters ? queryFilter.filters : null
    var sorts = queryFilter.sorts ? queryFilter.sorts : null;
    var skipNumber = queryFilter.skip ? queryFilter.skip : 0;
    var limitNumber = queryFilter.limit ? queryFilter.limit : 100;

    var self = this;
    try {
        self.openDB();
        var dbCollection = self.getDB().collection(queryFilter.collection);
        if (limitNumber > 0) {
            dbCollection.runCommand('count', function (err, resultOfCount) {
                if (err) {
                    self.disposeDB();
                    var message = {
                        status: false,
                        content: err
                    };
                    if (callback) callback(message);
                }
                else {
                    var rowCount = resultOfCount.n;
                    self.QueryWithPage(dbCollection, filters, sorts, skipNumber, limitNumber, function (returnMessage) {
                        self.disposeDB();
                        returnMessage.RowCount = rowCount;
                        if (callback) callback(returnMessage);
                    });
                }
            });
        }
        else {
            self.Query(dbCollection, filters, sorts, skipNumber, function (returnMessage) {
                self.disposeDB();
                if (callback) callback(returnMessage);
            });
        }
    }
    catch (err) {
        self.disposeDB();
        //trace error into local file
        console.log("ERROR: [mongoCommon.selectData()] - Exception raised: " + err);
        //callback
        var message = {
            status: false,
            content: err
        };
        if (callback) callback();
    }
};

mongoCommon.prototype.updateData = function (collection, targetData, updateData, callback) {
    if (!collection || collection.length == 0) {
        var collectionErr = new Error('The updating collection cannot been NULL!');
        if (callback) callback({ status: false, content: collectionErr });
        return;
    }
    if (updateData == null || updateData == {}) {
        var dataErr = new Error('The updating data cannot been NULL or EMPTY!');
        if (callback) callback({ status: false, content: dataErr });
        return;
    }

    console.log("DEBUG: [mongoCommon.updateData()] - updating data from collection: [" + collection + "], Data: [" + JSON.stringify(targetData) + "] with: " + JSON.stringify(updateData));
    var self = this;
    try {
        self.openDB();
        var dbCollection = self.getDB().collection(collection);
        dbCollection.findAndModify({ query: targetData, update: { $set: updateData }, new: true }, function (err, data) {
            self.disposeDB();
            var message = {};
            if (err) {
                //trace error into local file
                console.log("ERROR: [mongoCommon.updateData()] - Exception raised: " + err);
                message.status = false;
                message.content = err;
            }
            else {
                message.status = true;
                message.content = data;
            }
            if (callback) callback(message);
        });
    }
    catch (err) {
        self.disposeDB();
        //trace error into local file
        console.log("ERROR: [mongoCommon.updateData()] - Exception raised: " + err);
        var message = {
            status: false,
            content: err
        };
        if (callback) callback(message);
    }
};

mongoCommon.prototype.updateDataArray = function (collection, filterData, updateData, callback) {
    if (!collection || collection.length == 0) {
        var collectionErr = new Error('The updating collection cannot been NULL!');
        if (callback) callback({ status: false, content: collectionErr });
        return;
    }
    if (filterData == null || filterData == {}) {
        var dataErr = new Error('The updating data cannot been NULL or EMPTY!');
        if (callback) callback({ status: false, content: dataErr });
        return;
    }

    console.log("DEBUG: [mongoCommon.updateData()] - updating data from collection: [" + collection + "], Data: [" + JSON.stringify(filterData) + "] with: " + JSON.stringify(filterData));
    var self = this;
    try {
        self.openDB();
        var dbCollection = self.getDB().collection(collection);
        dbCollection.update(filterData, updateData, function (err, data) {
            self.disposeDB();
            var message = {};
            if (err) {
                //trace error into local file
                console.log("ERROR: [mongoCommon.updateData()] - Exception raised: " + err);
                message.status = false;
                message.content = err;
            }
            else {
                message.status = true;
                message.content = data;
            }
            if (callback) callback(message);
        });
    }
    catch (err) {
        self.disposeDB();
        //trace error into local file
        console.log("ERROR: [mongoCommon.updateData()] - Exception raised: " + err);
        var message = {
            status: false,
            content: err
        };
        if (callback) callback(message);
    }
};


module.exports = mongoCommon;