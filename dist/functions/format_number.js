"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatNumber = void 0;
// Format number with commas
function formatNumber(num) {
    let toFormat = num;
    if (typeof num === "string") {
        toFormat = Number.parseFloat(num);
    }
    const parts = toFormat.toString().split(".");
    return (parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
        (parts.length > 1 ? "." + parts[1].substring(0, 2) : ""));
}
exports.formatNumber = formatNumber;
