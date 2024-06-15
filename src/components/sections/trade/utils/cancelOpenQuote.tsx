//cancelO
import {
  sendSignedCancelOpenQuote,
  SignedCancelOpenQuoteRequest,
  sendSignedCancelCloseQuote,
  signedCancelCloseQuoteResponse,
} from "@pionerfriends/api-client";
import { useAuthStore } from "@/store/authStore";
import { useWalletAndProvider } from "@/components/layout/menu";
import { parseUnits } from "viem";
import {
  networks,
  contracts,
  NetworkKey,
} from "@pionerfriends/blockchain-client";
import { Order } from "@/components/sections/trade/SectionOrders";
import { generateRandomNonce } from "@/components/web3/utils";
import { toast } from "react-toastify";

export async function cancelOrder(
  order: Order,
  wallet: any,
  token: string,
  provider: any
) {
  if (!wallet || !token || !wallet.address) {
    console.error("Missing wallet, token, walletClient or wallet.address");
    toast.error("Failed to cancel order: Invalid wallet or token");
    return false;
  }
  console.log("cancelOrder", order);

  try {
    const ethersProvider = await wallet.getEthersProvider();
    const ethersSigner = await ethersProvider.getSigner();
    const chainId = useAuthStore.getState().chainId;

    console.log("ethersSigner", ethersSigner);

    const domainOpen = {
      name: "PionerV1Open",
      version: "1.0",
      chainId: Number(chainId),
      verifyingContract:
        networks[chainId as unknown as NetworkKey].contracts.PionerV1Open,
    };

    const cancelSignType = {
      CancelRequestSign: [
        { name: "orderHash", type: "bytes" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const cancelSignValue = {
      orderHash: order.targetHash,
      nonce: Date.now().toString(),
    };

    console.log("cancelSignValue", cancelSignValue);

    const signatureCancel = await ethersSigner._signTypedData(
      domainOpen,
      cancelSignType,
      cancelSignValue
    );
    let success;
    const cancel: SignedCancelOpenQuoteRequest = {
      issuerAddress: wallet.address,
      counterpartyAddress: order.counterpartyAddress,
      version: "1.0",
      chainId: Number(chainId),
      verifyingContract:
        networks[chainId as unknown as NetworkKey].contracts.PionerV1Open,
      targetHash: order.targetHash,
      nonceCancel: cancelSignValue.nonce,
      signatureCancel: signatureCancel,
      emitTime: Date.now().toString(),
      messageState: 0,
    };

    success = await sendSignedCancelOpenQuote(cancel, token);

    if (!success) {
      toast.error("Failed to cancel order");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error canceling order:", error);
    toast.error("An error occurred while canceling the order");
    return false;
  }
}
