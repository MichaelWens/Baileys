# <div align='center'>Zaxius</div>

<p align="center">

  <img src="https://files.catbox.moe/nak9qb.jpg" width="180" alt="zaxius"/>

</p>

<div align='center'>

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/source-GitHub-black.svg)](https://github.com/MichaelWens/Baileys)
[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](package.json)

A WebSockets library for interacting with WhatsApp Web, maintained under the **Zaxius** brand.
This project is a fork built on top of [Baileys](https://github.com/WhiskeySockets/Baileys) by WhiskeySockets.

</div>

---

## Installation

Requires **Node.js 20+** (this package is ESM-only; see [Import](#import)).

From the npm registry (once published):
```bash
npm install @zaxius/baileys
```

Directly from GitHub:
```bash
npm install github:MichaelWens/Baileys
```

Or add it to your `package.json` manually:
```json
"dependencies": {
  "@zaxius/baileys": "github:MichaelWens/Baileys"
}
```

Already have a bot built on the original `@whiskeysockets/baileys` and don't want to change every
`require`/`import` in your codebase? Alias the dependency name instead, so the original package
name points to this fork:
```json
"dependencies": {
  "@whiskeysockets/baileys": "github:MichaelWens/Baileys"
}
```
With this alias, keep using `require('@whiskeysockets/baileys')` in your code as-is — npm will
resolve it to this fork under the hood.

You can also pin to a specific branch or commit:
```bash
npm install github:MichaelWens/Baileys#main
```

## Import

ESM (works on every supported Node.js version):
```javascript
import makeWASocket, { Browsers, DisconnectReason } from '@zaxius/baileys';
```

CommonJS: the package is ESM-only, so `require()` only works on Node.js 22.12+ or 20.19+
(Node's `require(esm)` support). On older versions use `import` instead.
```javascript
const {
  default: makeWASocket,
  // other exports
} = require('@zaxius/baileys');
```

---

# Connecting To WhatsApp

## With QR Code
```javascript
const {
  default: makeWASocket,
  Browsers
} = require('@zaxius/baileys');

const client = makeWASocket({
  browser: Browsers.zaxius('Chrome')
});

// `printQRInTerminal` is deprecated: the QR string now arrives via connection.update.
// Render it with your own QR library (e.g. qrcode-terminal) if you want it in the terminal.
client.ev.on('connection.update', ({ connection, qr }) => {
  if (qr) console.log('Scan this QR string:', qr);
  if (connection === 'open') console.log('Connected');
});
```

## Connect With Pairing Code
```javascript
const {
  default: makeWASocket,
  fetchLatestWaWebVersion,
  Browsers
} = require('@zaxius/baileys');

async function start() {
  // fetchLatestWaWebVersion() resolves to { version, isLatest, error? }
  const { version } = await fetchLatestWaWebVersion();

  const client = makeWASocket({
    browser: Browsers.zaxius('Chrome'),
    printQRInTerminal: false,
    version,
    aiLabel: false // set true to show an AI label on messages sent by the bot
    // other options
  });

  const number = "628XXXXXXXXXX";
  const code = await client.requestPairingCode(number.trim()); // or (number, "YYYYYYYY") for a custom pairing code

  console.log("Your pairing code: " + code);
}

start();
```

# Storing Data
```javascript
const {
  default: makeWASocket,
  makeInMemoryStore
} = require('@zaxius/baileys');
const pino = require('pino');

const store = makeInMemoryStore({
  logger: pino().child({ level: 'silent', stream: 'store' })
});
const client = makeWASocket({
  // options
});
store.bind(client.ev);

client.ev.on('contacts.upsert', () => {
  console.log('New contact: ' + Object.values(store.contacts()));
});
```

# Sending Messages

## Send / relay a message with `noSelfSync`

`noSelfSync` is a `relayMessage` option (private/1-on-1 chats only) that controls whether the
message is also synced to your **other own linked devices** (other phones/WhatsApp Web sessions
logged into the same account). It does not affect delivery to the recipient.

- **`noSelfSync: true`** — the message is sent to the recipient as normal, but is **not** synced
  to your other own devices. Useful when you don't want a message to show up on your other
  linked sessions (e.g. silent/automated sends from a bot account).
- **`noSelfSync: false`** (default) — normal behavior. The message is sent to the recipient and
  also synced to your other own devices, so it appears everywhere you're logged in, just like
  sending from the official WhatsApp app.

```javascript
// Sent to the recipient, but NOT synced to your other devices
await client.relayMessage(m.chat, {
  conversation: "Hello from Zaxius"
}, {
  noSelfSync: true
});

// Sent to the recipient AND synced to your other devices (default behavior)
await client.relayMessage(m.chat, {
  conversation: "Hello from Zaxius"
}, {
  noSelfSync: false
});

// Also works through sendMessage
await client.sendMessage(m.chat, {
  text: "Hello from Zaxius"
}, {
  noSelfSync: true
});
```

## Send an orderMessage
```javascript
const fs = require('fs');
const thumbnail = fs.readFileSync('./zaxiusthumb.jpg');

await client.sendMessage(m.chat, {
  thumbnail,
  message: "Order summary",
  orderTitle: "My Store",
  totalAmount1000: 72502,
  totalCurrencyCode: "IDR"
}, { quoted: m });
```

## Send a pollResultSnapshotMessage
```javascript
await client.sendMessage(m.chat, {
  pollResultMessage: {
    name: "My Poll",
    options: [
      { optionName: "Option 1" },
      { optionName: "Option 2" }
    ],
    newsletter: {
      newsletterName: "0X8 - Society",
      newsletterJid: "120363424944937940@newsletter"
    }
  }
});
```

## Send a productMessage
```javascript
await client.relayMessage(m.chat, {
  productMessage: {
    title: "Product.pdf",
    description: "Product description",
    thumbnail: { url: "./zaxiusthumb.jpg" },
    productId: "EXAMPLE_TOKEN",
    retailerId: "EXAMPLE_RETAILER_ID",
    url: "https://example.com",
    body: "Body text",
    footer: "Footer",
    buttons: [
      {
        name: "cta_url",
        buttonParamsJson: "{\"display_text\":\"Visit\",\"url\":\"https://example.com\"}"
      }
    ],
    priceAmount1000: 72502,
    currencyCode: "IDR"
  }
});
```

## Send an interactiveMessage
```javascript
await client.sendMessage(m.chat, {
  image: { url: "./zaxiusimg.jpg" },
  text: "body",
  title: "title", // required when sending media
  footer: "footer",
  interactiveButtons: [
    {
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "\0"
      })
    }
  ],
  messageParams: JSON.stringify({
    bottom_sheet: {
      /** other params **/
    }
  })
});
```

## Send a member label
```javascript
await client.sendMessage(m.chat, {
  groupLabel: {
    labelText: "Tagged members appear here"
  }
});
```

## Send a message to group members
```javascript
await client.sendMessageMembers(m.chat, {
  extendedTextMessage: {
    text: "Hello members"
  }
}, {});
```

# Simple sendMessage Helpers

## Send text
```javascript
await client.sendText(m.chat, "Hello!", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

## Send image
```javascript
await client.sendImage(m.chat, { url: "./zaxiusimg.jpg" }, "Caption", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

## Send video
```javascript
await client.sendVideo(m.chat, { url: "./video.mp4" }, "Caption", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

## Send audio
```javascript
await client.sendAudio(m.chat, { url: "./zaxiusaudio.mp3" }, {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

## Send location
```javascript
await client.sendLocation(m.chat, "Caption", 90.0, 90.0, "https://example.com", "1234567890", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

## Send poll
```javascript
await client.sendPoll(m.chat, "Pick one", ["1", "2", "3"], true, {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

## Send quiz
```javascript
await client.sendQuiz(m.chat, "Quiz question", ["1", "2", "3"], "2", {
  contextInfo: {
    mentionedJid: [m.chat]
  }
}, {
  key: {
    remoteJid: "status@broadcast",
    participant: m.sender,
    fromMe: true
  },
  message: {
    conversation: "\0"
  }
});
```

## Send status mention
```javascript
await client.statusMention(m.chat, {
  extendedTextMessage: {
    text: "Mentioned in status"
  }
});
```

---

# Credits

Zaxius is a fork of [Baileys](https://github.com/WhiskeySockets/Baileys), originally created by
[Adhiraj Singh](https://github.com/adiwajshing) and maintained by the WhiskeySockets community.
All credit for the underlying protocol implementation goes to the original authors and contributors.
See [LICENSE](LICENSE) for the full license text and copyright notices.

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on reporting issues and submitting pull requests.

# Disclaimer

This is **not** an official WhatsApp product. Use of this library to send bulk or unsolicited messages
may violate WhatsApp's Terms of Service and can result in your number being banned. Use responsibly.
