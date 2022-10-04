"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = void 0;
const crypto_1 = require("crypto");
function encryptBuffer(chunk, sKey) {
    const iv = (0, crypto_1.randomBytes)(16);
    const key = (0, crypto_1.createHash)('sha256').update(sKey).digest('base64').slice(0, 32);
    const cipher = (0, crypto_1.createCipheriv)('aes-256-cbc', key, iv);
    const result = Buffer.concat([iv, cipher.update(chunk), cipher.final()]);
    return result;
}
function decrypt(chunk, sKey) {
    const iv = chunk.slice(0, 16);
    chunk = chunk.slice(16);
    let key = (0, crypto_1.createHash)('sha256').update(sKey).digest('base64').slice(0, 32);
    const decipher = (0, crypto_1.createDecipheriv)('aes-256-cbc', key, iv);
    const result = Buffer.concat([decipher.update(chunk), decipher.final()]);
    return result;
}
exports.decrypt = decrypt;
exports.default = encryptBuffer;
// readFile(
//   join(
//     __dirname,
//     '..',
//     '..',
//     'uploads',
//     'ba824130-9993-465c-84af-4587d14151ff/rivos/f930eff8-7d8b-441e-8115-6a4a5b1fae9a-SnapTik_7134701247759945006.mp4',
//   ),
//   (_, buffer) => {
//     writeFile(
//       join(__dirname, '..', '..', 'uploads', 'test.mp4'),
//       decrypt(buffer, 'ba824130-9993-465c-84af-4587d14151ff'),
//       () => console.log(null),
//     );
//   },
// );
