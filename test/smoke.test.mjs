// Smoke test: the package imports and its main public exports are reachable.
// Uses only Node's built-in test runner. Does NOT open a WhatsApp connection.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import makeWASocket, * as baileys from '../lib/index.js';

test('default export is makeWASocket', () => {
    assert.equal(typeof makeWASocket, 'function');
    assert.equal(baileys.default, makeWASocket);
});

test('core public exports are present', () => {
    for (const name of [
        'makeInMemoryStore',
        'makeCacheManagerStore',
        'fetchLatestBaileysVersion',
        'fetchLatestWaWebVersion',
        'Browsers',
        'DisconnectReason',
        'jidDecode',
        'isInteropUser'
    ]) {
        assert.notEqual(baileys[name], undefined, `missing export: ${name}`);
    }
});

test('Zaxius browser identity', () => {
    assert.equal(baileys.Browsers.zaxius('Chrome')[0], 'Zaxius');
});

test('DisconnectReason values are stable', () => {
    assert.equal(baileys.DisconnectReason.connectionClosed, 428);
    assert.equal(baileys.DisconnectReason.loggedOut, 401);
});

test('JID helpers', () => {
    assert.equal(baileys.jidDecode('628123456789@s.whatsapp.net').user, '628123456789');
    assert.equal(baileys.isInteropUser('abc@interop'), true);
    assert.equal(baileys.isInteropUser('628123456789@s.whatsapp.net'), false);
});
