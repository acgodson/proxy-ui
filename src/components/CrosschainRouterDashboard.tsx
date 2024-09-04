"use client";
import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
} from "@/components/ui";
import { ethers } from "ethers";
import {
  AlertCircle,
  ArrowRight,
  DollarSign,
  PillBottle,
  Wallet,
  Zap,
} from "lucide-react";
import {
  CustomRouter__factory,
  ERC20Mock__factory,
} from "@/lib/./ethers-contracts";
import {
  getChain,
  loadDeployedAddresses,
  storeDeployedAddresses,
} from "@/lib/wormhole/utils";

declare global {
  interface Window {
    ethereum: any;
  }
}

const CrosschainRouterDashboard = () => {
  const [account, setAccount] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const [currentChainId, setCurrentChainId] = useState("14");
  const [routerAddress, setRouterAddress] = useState("");
  const [gasFeeAmount, setGasFeeAmount] = useState("");
  const [tokenFeeAmount, setTokenFeeAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("1000");
  // const [selectedToken, setSelectedToken] = useState("");

  const [routerStatus, setRouterStatus] = useState("Not Deployed");
  const [feeTankBalance, setFeeTankBalance] = useState("0.00");
  const [userBalance, setUserBalance] = useState("0.00");

  const [prompt, setPrompt] = useState("");

  const targetChainId = "14";
  const tokenAddress = "0xC96824Ee77B0905144465E5A3dd768e74025D438";
  const controllerAddress = "0x52567724E0260319652dce08671980E8Bcc08776";
  const vaultAddress = "0xFcE551C5bE9238CE1EB00e66e2a422154fbc222e";

  useEffect(() => {
    checkIfWalletIsConnected();
    if (window.ethereum) {
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    switchToFujiNetwork();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  useEffect(() => {
    if (account) {
      checkUserTokenBalance();
    }
  }, [account]);

  useEffect(() => {
    if (account && routerAddress) {
      fetchRouterStats();
    }
  }, [account, routerAddress]);

  async function fetchRouterStats() {
    if (!account || !routerAddress) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const router = CustomRouter__factory.connect(routerAddress, provider);
    const admin = await router.routerAdmins(account);
    console.log("retrieved admin status", admin);
    if (admin) {
      console.log("admin registered");
      setRouterStatus("Active");
    }
  }

  async function fetchAddresses() {
    const deployed = await loadDeployedAddresses();
    const _customRouter = deployed.customRouter[6];
    if (_customRouter && _customRouter.length > 0) {
      setRouterAddress(_customRouter);
      setRouterStatus("Deployed");
    }
  }

  useEffect(() => {
    fetchAddresses();
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error(
          "An error occurred while checking the wallet connection:",
          error
        );
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error("An error occurred while connecting the wallet:", error);
      }
    } else {
      alert(
        "MetaMask is not installed. Please install it to use this feature."
      );
    }
  };

  const handleChainChanged = (chainId: string) => {
    setCurrentChainId(chainId);
    loadRouterAddress();
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      setAccount("");
      setIsConnected(false);
    }
    loadRouterAddress();
  };

  const handleDeploy = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first.");
      return;
    }
    const chain = getChain(Number(targetChainId));
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const factory = new CustomRouter__factory(signer);
    try {
      const router = await factory.deploy(
        chain.wormholeRelayer,
        chain.tokenBridge,
        chain.wormhole,
        controllerAddress,
        vaultAddress,
        tokenAddress,
        targetChainId
      );
      await router.deployed();

      const deployed = await loadDeployedAddresses();
      deployed.customRouter[6] = router.address;
      await storeDeployedAddresses(deployed);
      setRouterAddress(router.address);
      // localStorage.setItem(`routerAddress_${currentChainId}`, router.address);
      setRouterStatus("Deployed");
    } catch (error) {
      console.error("Error deploying router:", error);
    }
  };

  const loadRouterAddress = () => {
    const storedAddress = localStorage.getItem(
      `routerAddress_${currentChainId}`
    );
    if (storedAddress) {
      setRouterAddress(storedAddress);
      checkRouterStatus(storedAddress);
    } else {
      setRouterAddress("");
      setRouterStatus("Not Deployed");
    }
  };

  async function switchToFujiNetwork() {
    if (window.ethereum) {
      try {
        // Check if wallet is connected
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          const currentChainId = await window.ethereum.request({
            method: "eth_chainId",
          });

          // Convert the chain ID to decimal
          const fujiChainId = "0xa869";

          // If not on Fuji network, prompt the user to switch
          if (currentChainId !== fujiChainId) {
            try {
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: fujiChainId }],
              });
            } catch (switchError: any) {
              // If the network is not added, add it
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: fujiChainId,
                      chainName: "Avalanche Fuji C-Chain",
                      rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
                      nativeCurrency: {
                        name: "AVAX",
                        symbol: "AVAX",
                        decimals: 18,
                      },
                      blockExplorerUrls: [
                        "https://cchain.explorer.avax-test.network",
                      ],
                    },
                  ],
                });
              } else {
                console.error("Error switching network:", switchError);
              }
            }
          }
        } else {
          console.log("No wallet connected");
          // Optionally, prompt user to connect wallet
        }
      } catch (error) {
        console.error("Error checking or switching network:", error);
      }
    } else {
      console.log("Ethereum object not found, install MetaMask.");
    }
  }

  const checkRouterStatus = async (address: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const router = CustomRouter__factory.connect(address, provider);
    try {
      const admin = await router.routerAdmins(account);
      setRouterStatus(admin ? "Active" : "Not Registered (Not Admin)");
      console.log("admin status", admin);
      if (admin) {
        const balance = await router.feeTank(account);
        setFeeTankBalance(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.error("Error checking router status:", error);
      setRouterStatus("Error");
    }
  };

  const checkUserTokenBalance = async () => {
    if (!account) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const token = ERC20Mock__factory.connect(tokenAddress, provider);
    try {
      const amount = await token.balanceOf(account);
      setUserBalance(ethers.utils.formatEther(amount));
    } catch (error) {
      console.error("Error checking router status:", error);
      setUserBalance("0");
    }
  };

  // this deposit to the tank is not really eth buterc20 token, hence we have to check for allowance and rename for handlefundgas to topupTank

  // Check and increase token approval if necessary
  // const currentAllowance = await token.allowance(
  //   sourceWallet.address,
  //   routerSource.address
  // );

  // if (currentAllowance.lt(amount)) {
  //   console.log("Increasing token approval...");
  //   await token
  //     .approve(routerSource.address, ethers.constants.MaxUint256, {
  //       nonce: await sourceNonceManager.getNextNonce(),
  //     })
  //     .then(wait);
  // }

  const handleFundGas = async () => {
    if (!account || !routerAddress || !gasFeeAmount) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const router = CustomRouter__factory.connect(routerAddress, signer);
    try {
      // if user is not an admin register the admin befoe funding the account
      const admin = await router.routerAdmins(account);
      console.log("admin status", admin);
      if (!admin) {
        const tx = await router.registerAdmin(account);
        await tx.wait();
      }

      const depositTx = await router.depositToFeeTank(
        ethers.utils.parseEther(gasFeeAmount)
      );

      await depositTx.wait();

      checkRouterStatus(routerAddress);
    } catch (error) {
      console.error("Error funding gas:", error);
    }
  };

  const handleMintTokens: () => Promise<void> = async () => {
    if (!tokenAmount) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const token = ERC20Mock__factory.connect(tokenAddress, signer);
    try {
      const tx = await token.mint(
        account,
        ethers.utils.parseEther(tokenAmount)
      );
      await tx.wait();
      alert(`${tokenAmount} tokens minted successfully!`);
    } catch (error) {
      console.error("Error minting tokens:", error);
    }
  };

  const handleRegister = async () => {
    if (!account || !routerAddress) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const router = CustomRouter__factory.connect(routerAddress, signer);
    try {
      const admin = await router.routerAdmins(account);
      console.log("admin status", admin);
      if (!admin) {
        const tx = await router.registerAdmin(account);
        await tx.wait();
        console.log("admin registered");
        setRouterStatus("Active");
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleSubmitPrompt = async () => {
    if (!routerAddress || !prompt) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const router = CustomRouter__factory.connect(routerAddress, signer);
    try {
      const requestHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(prompt)
      );
      const fixedNonce = Math.floor(Math.random() * 1000000);
      const operationType = 0; // Low
      const messageCost = await router.quoteCrossChainMessage(targetChainId);
      const tx = await router.generateKey(
        requestHash,
        fixedNonce,
        operationType,
        { value: messageCost }
      );
      await tx.wait();
      alert("Prompt submitted successfully!");
    } catch (error) {
      console.error("Error submitting prompt:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1c20] to-[#2c313c] text-white p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl text-gray-100 font-light tracking-wide">
          ProxyAI
        </h1>
        <div className="flex items-center">
          <Select value={currentChainId} onValueChange={setCurrentChainId}>
            <SelectTrigger className="mr-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent className="bg-[#2c313c] border-white/20">
              <SelectItem value="14">Fuji Testnet</SelectItem>
              {/* <SelectItem value="5">Goerli Testnet</SelectItem>
              <SelectItem value="137">Polygon Mainnet</SelectItem> */}
              {/* Add more networks as needed */}
            </SelectContent>
          </Select>
          {account && (
            <Button
              onClick={() => {}}
              className="mr-6 flex-row bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full px-6 py-2 flex items-center transition-all duration-300"
            >
              <PillBottle className="mr-2 h-4 w-4" />
              {userBalance}
            </Button>
          )}
          <Button
            onClick={connectWallet}
            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-full px-6 py-2 flex items-center transition-all duration-300"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isConnected
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect MetaMask"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Deploy Router */}
        <Card className="bg-white/5 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-white/5">
            <CardTitle className="text-xl font-light flex items-center">
              <Zap className="mr-2 h-5 w-5" />
              Deploy Router
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {routerStatus !== "Not Deployed" && (
              <Input
                type="text"
                placeholder="Router Address"
                value={routerAddress}
                onChange={(e) => setRouterAddress(e.target.value)}
                className="mb-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300"
                disabled={routerStatus !== "Not Deployed"}
              />
            )}
            <Button
              onClick={handleDeploy}
              className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-lg py-2 flex items-center justify-center transition-all duration-300"
              disabled={routerStatus !== "Not Deployed"}
            >
              <Zap className="mr-2 h-4 w-4" /> Deploy Router
            </Button>
          </CardContent>
        </Card>

        {/* Mint Tokens */}
        <Card className="bg-white/5 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-white/5">
            <CardTitle className="text-xl font-light flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Mint Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Input
              type="number"
              placeholder="Token Amount"
              value={Number(tokenAmount)}
              onChange={(e) => setTokenAmount(e.target.value.toString())}
              className="mb-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300"
              disabled={true}
            />
            <Button
              onClick={handleMintTokens}
              className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-lg py-2 flex items-center justify-center transition-all duration-300"
            >
              <DollarSign className="mr-2 h-4 w-4" /> Mint Tokens
            </Button>
          </CardContent>
        </Card>

        {/* fund router */}
        <Card className="bg-white/5 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-white/5">
            <CardTitle className="text-xl font-light flex items-center">
              <ArrowRight className="mr-2 h-5 w-5" />
              Fund Router
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {routerStatus !== "Not Deployed" && routerStatus !== "Active" && (
              <Button
                onClick={handleRegister}
                className="mb-3 w-full bg-blue-500/10 hover:bg-blue-500/20 text-white backdrop-blur-sm rounded-lg py-2 flex items-center justify-center transition-all duration-300"
              >
                <ArrowRight className="mr-2 h-4 w-4" /> Register Admin
              </Button>
            )}
            <Input
              type="number"
              placeholder="Gas Fee Amount"
              value={tokenFeeAmount}
              onChange={(e) => setTokenFeeAmount(e.target.value)}
              className="mb-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300"
              disabled={routerStatus !== "Active"}
            />
            <Button
              onClick={handleFundGas}
              className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-lg py-2 flex items-center justify-center transition-all duration-300"
              disabled={routerStatus !== "Active"}
            >
              <ArrowRight className="mr-2 h-4 w-4" /> Fund Router
            </Button>
            {routerStatus === "Active" && (
              <p className="mt-4 text-sm">
                Tank Balance: {feeTankBalance} test USDC
              </p>
            )}
          </CardContent>
        </Card>

        {/*  router status */}
        <Card className="bg-white/5 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-white/5">
            <CardTitle className="text-xl font-light flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              Router Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center text-yellow-300 mb-4">
              <AlertCircle className="mr-2 h-5 w-5" />
              <span className="text-lg font-light">{routerStatus}</span>
            </div>
            {routerStatus === "Active" && (
              <>
                <Input
                  type="text"
                  placeholder="Enter a prompt for GPT"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mb-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300"
                />
                <Button
                  onClick={handleSubmitPrompt}
                  className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-lg py-2 flex items-center justify-center transition-all duration-300"
                >
                  Submit Prompt
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* {[
          {
            title: "Deploy Router",
            icon: Zap,
            action: handleDeploy,
            input: routerAddress,
            setInput: setRouterAddress,
            placeholder: "Router Address",
          },
          {
            title: "Fund Gas",
            icon: ArrowRight,
            action: handleFundGas,
            input: gasFeeAmount,
            setInput: setGasFeeAmount,
            placeholder: "Gas Fee Amount",
            inputType: "number",
          },
          {
            title: "Fund Tokens",
            icon: DollarSign,
            action: handleFundTokens,
            input: tokenAmount,
            setInput: setTokenAmount,
            placeholder: "Token Amount",
            inputType: "number",
            hasSelect: true,
          },
          { title: "Router Status", icon: AlertCircle, status: true },
        ].map((item, index) => (
          <Card
            key={index}
            className="bg-white/5 backdrop-blur-md border-0 shadow-lg rounded-xl overflow-hidden"
          >
            <CardHeader className="bg-white/5">
              <CardTitle className="text-xl font-light flex items-center">
                <item.icon className="mr-2 h-5 w-5" />
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {item.status ? (
                <div className="flex items-center text-yellow-300">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <span className="text-lg font-light">
                    Router not deployed
                  </span>
                </div>
              ) : (
                <>
                  {item.input !== undefined && (
                    <Input
                      type={item.inputType || "text"}
                      placeholder={item.placeholder}
                      value={item.input}
                      onChange={(e) => item.setInput(e.target.value)}
                      className="mb-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300"
                    />
                  )}
                  {item.hasSelect && (
                    <Select
                      value={selectedToken}
                      onValueChange={setSelectedToken}
                    >
                      <SelectTrigger className="mb-4 bg-white/10 border-white/20 focus:border-white/30 rounded-lg transition-all duration-300">
                        <SelectValue placeholder="Select Token" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c313c] border-white/20">
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="DAI">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    onClick={item.action}
                    className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm rounded-lg py-2 flex items-center justify-center transition-all duration-300"
                  >
                    <item.icon className="mr-2 h-4 w-4" /> {item.title}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))} */}
      </div>
    </div>
  );
};

export default CrosschainRouterDashboard;
