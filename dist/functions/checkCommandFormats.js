"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGrantCommand = void 0;
function validateGrantCommand(message, size) {
    const match = message.content.match(/@/);
    var checkSize = size == 0;
    return !match != checkSize;
}
exports.validateGrantCommand = validateGrantCommand;
