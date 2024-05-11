# real_state_web3
A real state webapp which allows to buy properties using ETH

```
npm i

```
npm hardhat test

```
npm hardhat node

This will host several (20) wallet with 100ETH and all logs from the smart contract action will be here in this terminal

New Terminal:
``` 
npx hardhat run scripts/deploy.js --network localhost

You will get console of 
"
Deployed Real Estate Contract at: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
Minting 3 properties...

Deployed Escrow Contract at: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
Listing 3 properties...

Finished.
"

This address will be pasted in config.json for UI reference

Then in new Terminal: UI
```
npm run start