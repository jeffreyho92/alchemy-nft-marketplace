# Alchemy NFT Marketplace

## Contract

```bash
yarn install

npx hardhat test test/unit/NFTMarketplace.test.js

npx hardhat deploy --tags nft,frontend --network matic
# or
npx hardhat deploy --tags nft,frontend --network goerli

#build frontend
npx hardhat deploy --tags nft,frontend

# start local blockchain node
npx hardhat node
npx hardhat deploy --tags all --network localhost
```

## Frontend

```bash
yarn install

yarn dev
```

## Graph

https://thegraph.com/studio/subgraph/alchemy-nft-marketplace-/

update src/mapping.ts

```bash
yarn install

graph codegen && graph build   

graph deploy --studio alchemy-nft-marketplace-
```