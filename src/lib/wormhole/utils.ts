import { ethers } from "ethers";
import config, { Config, ChainInfo } from "./config";
import {
  Controller__factory,
  ControllerVault__factory,
  CustomRouter__factory,
  ERC20Mock__factory,
} from "../ethers-contracts";
// import { relayer, ChainName, ChainId } from "@certusone/wormhole-sdk";

// export const DeliveryStatus = relayer.DeliveryStatus;

export interface DeployedAddresses {
  controller: Record<number, string>;
  controllerVault: Record<number, string>;
  customRouter: Record<number, string>;
  erc20s: Record<number, string[]>;
}

export function loadConfig(): Config {
  return config;
}

export function getChain(chainId: number): ChainInfo {
  const chain = config.chains[chainId];
  if (!chain) {
    throw new Error(`Chain ${chainId} not found`);
  }
  return chain;
}

export function getWallet(chainId: number): ethers.Wallet {
  console.log("getting ready to connect", chainId);
  const rpc = getChain(chainId).rpc;
  const provider = new ethers.providers.JsonRpcProvider(rpc);
  if (!process.env.PRIVATE_KEY) {
    throw Error(
      "No private key provided (use the PRIVATE_KEY environment variable)"
    );
  }
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
}

export async function loadDeployedAddresses(): Promise<DeployedAddresses> {
  try {
    const data = localStorage.getItem("deployed-addresses");
    if (data) {
      return JSON.parse(data);
    }
    return {
      controller: {},
      controllerVault: {},
      customRouter: {},
      erc20s: {},
    };
  } catch (error) {
    return {
      controller: {},
      controllerVault: {},
      customRouter: {},
      erc20s: {},
    };
  }
}

export async function storeDeployedAddresses(
  deployed: DeployedAddresses
): Promise<DeployedAddresses> {
  localStorage.setItem("deployed-addresses", JSON.stringify(deployed, null, 2));
  return deployed;
}

export async function getController(chainId: number) {
  const deployed = (await loadDeployedAddresses())?.controller[chainId];
  if (!deployed) {
    throw new Error(`No deployed controller on chain ${chainId}`);
  }
  return Controller__factory.connect(deployed, getWallet(chainId));
}

export async function getControllerVault(chainId: number) {
  const deployed = (await loadDeployedAddresses())?.controllerVault[chainId];
  if (!deployed) {
    throw new Error(`No deployed controller vault on chain ${chainId}`);
  }
  return ControllerVault__factory.connect(deployed, getWallet(chainId));
}

export async function getCustomRouter(chainId: number) {
  const deployed = (await loadDeployedAddresses())?.customRouter[chainId];
  if (!deployed) {
    throw new Error(`No deployed custom router on chain ${chainId}`);
  }
  return CustomRouter__factory.connect(deployed, getWallet(chainId));
}

export async function getERC20Mock(chainId: number, index: number = 0) {
  const deployed = (await loadDeployedAddresses())?.erc20s[chainId];
  if (!deployed || !deployed[index]) {
    throw new Error(
      `No deployed ERC20 mock (index ${index}) on chain ${chainId}`
    );
  }
  return ERC20Mock__factory.connect(deployed[index], getWallet(chainId));
}

export const wait = (tx: ethers.ContractTransaction) => tx.wait();

export function checkFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

export function getArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

// export async function getStatus(
//   sourceChain: ChainName,
//   transactionHash: string
// ): Promise<{ status: string; info: string }> {
//   const info = await relayer.getWormholeRelayerInfo(
//     sourceChain,
//     transactionHash,
//     { environment: "TESTNET" }
//   );
//   const status =
//     info.targetChainStatus.events[0]?.status || DeliveryStatus.PendingDelivery;
//   return { status, info: info.stringified || "Info not obtained" };
// }

// export const waitForDelivery = async (
//   sourceChain: ChainName,
//   transactionHash: string
// ) => {
//   let pastStatusString = "";
//   let waitCount = 0;
//   while (true) {
//     let waitTime = 15;
//     if (waitCount > 5) {
//       waitTime = 60;
//     }
//     await new Promise((resolve) => setTimeout(resolve, 1000 * waitTime));
//     waitCount += 1;
//     const res = await getStatus(sourceChain, transactionHash);
//     if (res.info !== pastStatusString) {
//       //   console.log(res.info);
//       pastStatusString = res.info;
//     }
//     if (res.status !== DeliveryStatus.PendingDelivery) break;
//     console.log(`\nContinuing to wait for delivery\n`);
//   }
// };

// export function chainIdToName(chainId: ChainId): ChainName {
//   //@ts-ignore
//   const chainMap: { [key in ChainId]: ChainName } = {
//     0: "unset",
//     1: "solana",
//     2: "ethereum",
//     3: "terra",
//     4: "bsc",
//     5: "polygon",
//     6: "avalanche",
//     7: "oasis",
//     8: "algorand",
//     9: "aurora",
//     10: "fantom",
//     11: "karura",
//     12: "acala",
//     13: "klaytn",
//     14: "celo",
//     15: "near",
//     16: "moonbeam",
//   };
//   return chainMap[chainId] || "UNKNOWN";
// }
