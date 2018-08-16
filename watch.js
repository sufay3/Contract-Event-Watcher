var _ = require("underscore");
var Web3 = require("web3");
var MongoClient = require("mongodb").MongoClient;
var utils = require("./utils.js");

var dbName = "ethereum";
var collName = "logs";

var checkArgs = function () {
    args = Array.prototype.slice.call(arguments);
    if (args.length != 3) {
        console.log("Error: the arg count of watch is not correct");
        return false;
    }

    if (!args[0] instanceof Web3) {
        console.log("Error: the first arg of watch is not an instance of the Web3 object");
        return false;
    }

    if (!args[1] instanceof MongoClient) {
        console.log("Error: the second arg of watch is not an instance of the MongoClient object");
        return false;
    }

    if (!_.isObject(args[2])) {
        console.log("Error:the third arg of watch should be an object");
        return false;
    }

    handleTopics(args[2].topics);

    return true;
}

var handleTopics = function (topics) {
    if (topics && _.isArray(topics)) {
        topics = topics.map(function (topic) {
            return topic.indexOf("0x") == 0 ? topic : utils.padZero(topic, 64);
        })
    }
}

/**
 * write data to mongodb
 * 
 * @param {MongoClient} mongodb MongoClient instance
 * @param {String} dbName db name to which to write data
 * @param {String} collName collection name to which to write data
 * @param {Object | Array} data data to write to mongodb
 * @notice assume that mongodb is a connected MongoClient object
 */
var write = function (mongodb, dbName, collName, data) {
    if ((!_.isObject(data) && !_.isArray(data)) || _.isEmpty(data)) {
        return;
    }

    if (_.isObject(data)) {
        mongodb.db(dbName).collection(collName).insertOne(data);
    } else {
        mongodb.db(dbName).collection(collName).insertMany(data);
    }
}

var watch = function (web3, mongodb, options) {
    if (!checkArgs(web3, mongodb, options)) {
        return;
    }

    web3.eth.subscribe("logs", options, function (err, log, instance) {
        if (!err) {
            write(mongodb, dbName, collName, log);
        } else {
            console.log(err.stack);
        }
    })
}

module.exports = watch;