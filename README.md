# Real State Web3

This repository contains a real estate web application that enables users to purchase properties using Ethereum (ETH) cryptocurrency.

## Installation

To install the necessary dependencies, run the following command:

```
npm install
```

## Testing

To run tests, use the following command:

```
npm run hardhat test
```

## Local Development Node

To run a local development node with multiple wallets each having 100 ETH and to view all logs from smart contract actions, use the following command:

```
npm run hardhat node
```

This command will host several wallets with 100 ETH each, and all logs from smart contract actions will be displayed in the terminal.

## Deployment

To deploy the contracts, execute the deployment script with the following command:

```
npx hardhat run scripts/deploy.js --network localhost
```

Upon successful deployment, the console will display:

```
Deployed Real Estate Contract at: [RealEstateContractAddress]
Minting 3 properties...

Deployed Escrow Contract at: [EscrowContractAddress]
Listing 3 properties...

Finished.
```

The addresses will be pasted in the `config.json` file for reference in the user interface (UI).

## User Interface (UI)

To start the UI, use the following command:

```
npm run start
```

This will initiate the user interface for the real estate web application.