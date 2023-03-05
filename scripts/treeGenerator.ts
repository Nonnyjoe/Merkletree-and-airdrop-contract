import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers/lib/utils";
import { Bytes } from "ethers/lib/utils";
import { ethers } from "hardhat";

import * as fs from "fs";
import * as path from "path";
import { parse } from 'csv-parse';
import { any } from "hardhat/internal/core/params/argumentTypes";

type AccountDetail ={
    Address: string;
    Amount: number;
}

async function main() {
        const csvFilePath = path.resolve(__dirname, '../data/users.csv');
        const filePath = `../data/objData.json`
        const headers = ['Address', 'Amount'];
        let leaves: string[] = [];

        /////////////////////////////////////////////////////////////////////
        // Reads data from a csv file, convert the data to a json object 
        // Creates a json file then writes this object to the json file
        ////////////////////////////////////////////////////////////////////
        const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
        parse(fileContent, {
          delimiter: ',',
          columns: headers,
        }, (error, result
            : AccountDetail[]
            ) => {
          if (error) {
            console.error(error);
          }
          const jsonData = JSON.stringify(result);
            fs.writeFileSync(`./data/objData.json`,jsonData);
          });
    
   
         /////////////////////////////////////////////////////////////////////
        // Reads data from a Json file, then loops through all the objects  
        // in the Json file then creates a leaf for each object by hashing 
        // a combination of the address and amount of each object variable
        ////////////////////////////////////////////////////////////////////
        const fileData = fs.readFileSync(`./data/objData.json`, 'utf-8');
        const jsonData2 = JSON.parse(fileData);
        jsonData2.shift();
        const newUsers:AccountDetail[] = jsonData2;
        for(let i = 0; i < jsonData2.length; i++){
          const add = jsonData2[i].Address;
          const amo = jsonData2[i].Amount;
        let leaf = ethers.utils.solidityKeccak256( ["address", "uint256"],[add, amo]);
        leaves.push(leaf);
        }
  
        ///////////////////////////////////////////////////////////////////
        // write the leaves to a new file
        /////////////////////////////////////////////////////////////////////
      const leavesFile = path.resolve(__dirname, '../data/leaves.json');
      const leavesJson = JSON.stringify(leaves);
      fs.writeFileSync(leavesFile, leavesJson);

      ///////////////////////////////////////////////////////////////////////////
      // create a merkle tree with the leaves
      ////////////////////////////////////////////////////////////////////////////
       const tree = new MerkleTree(leaves, keccak256, { sortPairs: true });
       let root = tree.getRoot().toString("hex");
       root = `0x${root}`;
       console.log(`USER'S ROOT IS ${root}`);
       
       //////////////////////////////////////////////////////////////////////////////////
       // test functionality by verifying the first leaf in the leaves.json file
       /////////////////////////////////////////////////////////////////////////////////
       let leaf1 = `0xa3f18bab3ba7bbef1a7c0c671dd7d194fdbe6b40e508e7ad7da6ad19b100a1d9`;
       const proof = tree.getProof(leaf1);
       console.log(tree.verify(proof, leaf1, root)) 





        ////////////////////////////////////////////////
        //Contract deployment and interaction starts here
        //////////////////////////////////////////////////

        const [owner, owner2] = await ethers.getSigners();
        const AirdropToken = await ethers.getContractFactory("airdropToken");
        const airdropToken = await AirdropToken.deploy(10000000,"NONNY", "NNY", root);
        await airdropToken.deployed();

        console.log(`airdropToken Address is ${airdropToken.address} `);

        ////////////////////////////////////////////////////////////////
        //set the root from the script to the contract
        /////////////////////////////////////////////////////////////////

        const user = '0xA771E1625DD4FAa2Ff0a41FA119Eb9644c9A46C8';
        const helpers = require("@nomicfoundation/hardhat-network-helpers");
        await helpers.impersonateAccount(user);
        const impersonatedSigner = await ethers.getSigner(user);
        await helpers.setBalance(impersonatedSigner.address, 1000000000000000000000000000000000)


        console.log(root);
        // const arryfyRoot = ethers.utils.arrayify(root);
       // console.log(`testing`);
       // const setMerkleRoot = await airdropToken.connect(impersonatedSigner).setMerkleRoot(root);
        
        console.log(`testing22`);

        //////////////////////////////////////////////////////////////////////
        // claim airdrop
        ///////////////////////////////////////////////////////////////////
function clipProof(proofs:any) {
  let nodes:string[] = [];
 for(let i = 0; i < proofs.length; i++){
  // console.log(proofs[i]);
  nodes.push(`0x${proofs[i].data.toString('hex')}`);
 }
return nodes;
}

        let userBallance = await airdropToken.connect(impersonatedSigner).balanceOf(impersonatedSigner.address);
        console.log(`USER BALANCE BEFOR CLAIMING IS ${userBallance}`);

        let userLeaf = ethers.utils.solidityKeccak256( ["address", "uint256"],[impersonatedSigner.address, 1000]);
        // console.log(tree);
        const userProof = tree.getProof(userLeaf);
        console.log(impersonatedSigner.address);
        console.log(`USER leaf IS ${userLeaf}`)
        console.log(`USER PROOF IS ${userProof}`)
        console.log(tree.verify(userProof, userLeaf, root)) 
        let hexProofs = clipProof(userProof);
        console.log(hexProofs);
        console.log(userLeaf);
        console.log(root);
        console.log(tree.verify(hexProofs, userLeaf, root));
        const claimAirdrop = await airdropToken.connect(impersonatedSigner).claimAirdrop(hexProofs, root, userLeaf);

        let userBallance2 = await airdropToken.connect(impersonatedSigner).balanceOf(impersonatedSigner.address);
        console.log(`USER BALANCE AFTER CLAIMING IS ${userBallance2}`);
        


  }
  main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
