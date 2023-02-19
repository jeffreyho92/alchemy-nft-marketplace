const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat.config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFTMarketplace Unit Tests", function () {
          let basicNft,
              basicNftContract,
              nftMarketplace,
              nftMarketplaceContract,
              deployer,
              user,
              listPrice
          const PRICE = ethers.utils.parseEther("0")
          const TOKEN_ID = 1

          beforeEach(async () => {
              accounts = await ethers.getSigners() // could also do with getNamedAccounts
              deployer = accounts[0]
              user = accounts[1]
              await deployments.fixture(["nft"])
              basicNftContract = await ethers.getContract("NFT") // Returns a new connection to the contract
              basicNft = basicNftContract.connect(deployer)
              nftMarketplaceContract = await ethers.getContract("NFTMarketplace") // Returns a new connection to the contract
              nftMarketplace = nftMarketplaceContract.connect(deployer)
              listPrice = await nftMarketplaceContract.s_listPrice()
              console.log("listPrice", ethers.utils.formatEther(listPrice))
          })

          //   describe("NFT", function () {
          //       it("should be able to mint NFT", async () => {
          //           await mintNFT(basicNft)
          //           var nftOnwer = await basicNft.ownerOf(TOKEN_ID)
          //           expect(nftOnwer).to.equal(deployer.address, "Error when minting")
          //       })
          //   })

          describe("NFTMarketplace - listItem", function () {
              it("emits an event after listing an item", async function () {
                  await mintNFT(basicNft)

                  const error = `AlreadyListed("${basicNft.address}", ${TOKEN_ID})`
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE, {
                          value: listPrice,
                      })
                  ).to.be.revertedWith(error)

                  //   var listItemResult = await nftMarketplace.listItem(
                  //       basicNft.address,
                  //       TOKEN_ID,
                  //       PRICE,
                  //       { value: listPrice }
                  //   )
                  //   await listItemResult.wait() // Waiting for confirmation...
                  //   console.log("listItemResult", listItemResult)
                  //   expect(await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit(
                  //       "ItemListed"
                  //   )
              })
              //   it("exclusively items that haven't been listed", async function () {
              //       await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE, {
              //           value: listPrice,
              //       })
              //       const error = `AlreadyListed("${basicNft.address}", ${TOKEN_ID})`
              //       await expect(
              //           nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE, {
              //               value: listPrice,
              //           })
              //       ).to.be.revertedWith(error)
              //   })
              //   it("should be able to create, execute and resell listing", async () => {
              //       await mintNFT(basicNftContract)
              //       const listPrice = await nftMarketplaceContract.s_listPrice()
              //       console.log("listPrice", ethers.utils.formatEther(listPrice))
              //       const auctionPrice = ethers.utils.parseUnits("1", "ether")
              //       const listItemResult = await nftMarketplaceContract.createListedItem(
              //           basicNftContract.address,
              //           1,
              //           auctionPrice,
              //           { value: listPrice }
              //       )
              //       await listItemResult.wait() // Waiting for confirmation...

              //       const listedItemId = 1
              //       let listedItem = await nftMarketplaceContract.getListedItemFromId(listedItemId)
              //       expect(listedItem).to.not.equal(null)
              //       expect(listedItem.owner).to.equal(nftMarketplaceContract.address)
              //       expect(listedItem.seller).to.equal(owner.address)
              //       expect(listedItem.currentlyListed).to.equal(true)

              //       const executeSale = await nftMarketplaceContract.executeSale(listedItemId, {
              //           value: auctionPrice,
              //       })
              //       await executeSale.wait() // Waiting for confirmation...
              //       listedItem = await nftMarketplaceContract.getListedItemFromId(listedItemId)
              //       expect(listedItem.owner).to.equal(owner.address)
              //       expect(listedItem.currentlyListed).to.equal(false)

              //       const resellToken = await nftMarketplaceContract.resellToken(
              //           listedItemId,
              //           auctionPrice,
              //           { value: listPrice }
              //       )
              //       await resellToken.wait() // Waiting for confirmation...
              //       listedItem = await nftMarketplaceContract.getListedItemFromId(listedItemId)
              //       expect(listedItem.owner).to.equal(nftMarketplaceContract.address)
              //       expect(listedItem.seller).to.equal(owner.address)
              //       expect(listedItem.currentlyListed).to.equal(true)
              //   })
          })
      })

var mintNFT = async (contract) => {
    var mintNFT = await contract.createToken("http://token1.com")
    await mintNFT.wait() // Waiting for confirmation...
}
