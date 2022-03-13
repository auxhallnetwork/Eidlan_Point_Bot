"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const listener_1 = require("../listener");
class CommandErrorListener extends listener_1.CustomListener {
    constructor() {
        super("commandError", {
            emitter: "commandHandler",
            event: "error",
        });
    }
    async listenerExec(err, message, command) {
        console.warn(err);
    }
}
exports.default = CommandErrorListener;
