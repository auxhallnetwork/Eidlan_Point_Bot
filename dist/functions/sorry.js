"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sorry = void 0;
// Generic "unknown command" reply
function sorry(message) {
    return message.reply("I’m sorry but I can’t do that for you.");
}
exports.sorry = sorry;
