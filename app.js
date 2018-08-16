var _ = require("underscore");
var Web3 = require("web3");
var MongoClient = require("mongodb").MongoClient;
var watch = require("./watch.js")


const WEBSOCKET_URL = "ws://localhost:8546";
const MONGO_URL = "mongodb://localhost:27017";

var App = function (options) {
    this.options = options;
    this.initialized = false;

    this.web3 = null;
    this.mongodb = null;
    this.watch = watch;
}

App.prototype.init = function () {
    if (this.initialized) {
        return Promise.resolve(true);
    }

    console.log("initializing app...");

    if (this.options === null || !_.isObject(this.options)) {
        console.log("Error: init options should be an object");
        return Promise.reject(false);
    }

    wsUrl = this.options.wsUrl;
    mongoUrl = this.options.mongoUrl;

    if (wsUrl === null) {
        wsUrl = WEBSOCKET_URL;
        console.log("Warn: ws url is set to ${WEBSOCKET_URL} by default");
    }

    if (mongoUrl === null) {
        mongoUrl = MONGO_URL;
        console.log("Warn: mongodb url is set to ${MONGO_URL} by default");
    }

    if (!this._setWeb3(wsUrl)) {
        console.log("Error: failed to set web3");
        return Promise.reject(false);
    }

    return this._setMongodb(mongoUrl).then(success => {
        if (success) {
            this.initialized = true;
            return Promise.resolve(true);
        } else {
            return Promise.reject(false);
        }
    });
}

App.prototype._setWeb3 = function (wsUrl) {
    if (!wsUrl) {
        console.log("Error: ws url can not be empty");
        return false;
    } else {
        this.web3 = new Web3();
        this.web3.setProvider(new Web3.providers.WebsocketProvider(wsUrl));
        return true;
    }
}

App.prototype._setMongodb = function (mongoUrl) {
    if (!mongoUrl) {
        console.log("Error: mongo url can not be empty");
        return Promise.reject(new Error("mongo url can not be empty"));
    } else {
        return MongoClient.connect(mongoUrl, { useNewUrlParser: true })
            .then(client => {
                if (client) {
                    this.mongodb = client;
                    return Promise.resolve(true);
                } else {
                    console.log("Error: failed to set mongodb. ${err.message}");
                    return Promise.reject(false);
                }
            }).catch(err => {
                console.log("Error: mongodb exception. ${err.message}");
                return Promise.reject(false);
            });
    }
}

App.prototype.start = function (options) {
    if (!this.initialized) {
        console.log("Error: app has not be initialized");
        return;
    }

    if (!_.isObject(options)) {
        console.log("Error: strat options should be an object");
        return;
    }

    console.log("starting app...");
    this.watch(this.web3, this.mongodb, options);
    console.log("app running");
}

module.exports = App;