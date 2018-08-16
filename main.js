var App = require("./app.js");
var utils = require("./utils.js");

// app options
var appOptions = {
    wsUrl: "ws://localhost:8546",
    mongoUrl: "mongodb://localhost:27017"
};

// watch options
var event = "Transfer(address,address,uint256)";
var watchOptions = {
    "topics": [utils.sha3(event)]
};

// define entry function
var main = function main(appOptions, watchOptions) {
    let app = new App(appOptions);

    app.init().then(initialized => {
        if (initialized) {
            app.start(watchOptions);
        }
    });
};

// start app
main(appOptions, watchOptions);


