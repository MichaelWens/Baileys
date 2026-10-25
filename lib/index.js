import makeWASocket from './Socket/index.js';
import chalk from "chalk";

const line1 = 
    chalk.hex("#FF3333")("▀▀█ ") + 
    chalk.hex("#00C2FF")("▄▀█ ") +
    chalk.hex("#00FF66")("▀▄▀ ") + 
    chalk.hex("#FFE600")("█ ")  + 
    chalk.hex("#FF00D4")("█ █ ") + 
    chalk.hex("#FF8800")("█▀");  

const line2 = 
    chalk.hex("#FF3333")("█▄▄ ") + 
    chalk.hex("#00C2FF")("█▀█ ") + 
    chalk.hex("#00FF66")("█ █ ") + 
    chalk.hex("#FFE600")("█ ")   + 
    chalk.hex("#FF00D4")("█▄█ ") +
    chalk.hex("#FF8800")("▄█");  

console.log(`\n${line1}\n${line2}\n`);
console.log(chalk.hex("#00c2ff")("Zaxius — a Baileys-based WhatsApp Web library\n"));

export * from '../WAProto/index.js';
export * from './Utils/index.js';
export * from './Types/index.js';
export * from './Defaults/index.js';
export * from './WABinary/index.js';
export * from './WAM/index.js';
export * from './WAUSync/index.js';
export * from './Store/index.js';
export { makeWASocket };
export default makeWASocket;
