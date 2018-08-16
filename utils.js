var _ = require("underscore");
var utils = require("web3-utils");

var sha3 = function (source) {
    return utils.sha3(source);
}

var padZero = function (str, num) {
    if (!_.isString(str) || !_.isNumber(num) || str.length >= num) {
        return str;
    }

    return padZero("0" + str);
}

module.exports = {
    sha3: sha3,
    padZero: padZero
};