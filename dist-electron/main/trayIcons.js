"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrayImage = getTrayImage;
const electron_1 = require("electron");
// 1x1 红色像素 PNG (用于运行中)
const RED_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
// 1x1 灰色像素 PNG (用于暂停)
const GRAY_1X1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const SIZE = 22; // macOS 推荐 22x22
function getTrayImage(active) {
    const base64 = active ? RED_1X1 : GRAY_1X1;
    return electron_1.nativeImage
        .createFromDataURL(`data:image/png;base64,${base64}`)
        .resize({ width: SIZE, height: SIZE });
}
