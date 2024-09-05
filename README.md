Here's a refined and structured version of your README for the ProxyAI with Wormhole frontend repository:

---

# ProxyAI with Wormhole

This repository contains the Next.js implementation of ProxyAI, leverages Wormhole for cross-chain authorization and payments for AI services. The controller (target) chain is already deployed on [`Celo`](https://alfajores.celoscan.io/address/0x52567724E0260319652dce08671980E8Bcc08776) and the web-app router sends requests to the controller from the `Fuji` testnet.

To interact with this app, you'll need to fund your `Metamask wallet` with at least 0.1 Testnet AVAX. You can obtain free testnet AVAX from [Faucets](http://faucets.chain.link).

## Step by Step Interactions

1. **Deploy your Custom Router**


2. **Top up your Wallet with Mock USDC Token**

   - Add mock [USDC](https://testnet.snowtrace.io/token/0xC96824Ee77B0905144465E5A3dd768e74025D438?chainid=43113) tokens to your account to pay for services.

3. **Register your Wallet as your Router's Admin**

   - Sign the `Register Admin` transaction to register your account as the admin for your custom router.

4. **Top up Router’s USDC Tank for Request Payments**

   - Sign the following transactions to ensure your router can pay for requests:
     - `Approval` transaction for the router to spend your USDC.
     - `Deposit` transaction to add USDC to the router’s balance.

5. **Submit a Prompt to the GPT API**
   - After funding your router, you can submit prompts to the GPT API by signing the following transactions:
     - `GenerateKey` transaction to create a session key.
     - `Submit Receipt` transaction to confirm the submission.
