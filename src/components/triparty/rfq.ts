import {
  sendRfq,
  QuoteWebsocketClient,
  QuoteResponse,
} from "@pionerfriends/api-client";
import { useAuthStore } from "@/store/authStore";
import {
  adjustQuantities,
  getPairConfig,
  initializeSymbolList,
  loadPrefixData,
} from "./configReader";
import { useTradeStore } from "@/store/tradeStore";
import { useEffect } from "react";
import { useRfqRequestStore } from "@/store/rfqStore";
import { formatSymbols } from "@/components/triparty/priceUpdater";

export const useRfqRequest = () => {
  const token = useAuthStore((state) => state.token);
  const rfqRequest = useRfqRequestStore((state) => state.rfqRequest);
  const updateRfqRequest = useRfqRequestStore(
    (state) => state.updateRfqRequest
  );
  const entryPrice = useTradeStore((state) => state.entryPrice);
  const amount = useTradeStore((state) => state.amount);
  const symbol = useTradeStore((state) => state.symbol);
  const leverage = useTradeStore((state) => state.leverage);

  const setRfqRequest = async () => {
    const [symbol1, symbol2] = await formatSymbols(symbol);

    try {
      const resolvedSymbol1 = await symbol1;
      const resolvedSymbol2 = await symbol2;
      const adjustedAmount = parseFloat(amount) === 0 ? "1" : amount;

      const adjustedQuantitiesResult = await adjustQuantities(
        parseFloat(entryPrice),
        parseFloat(entryPrice),
        parseFloat(adjustedAmount),
        parseFloat(adjustedAmount),
        resolvedSymbol1,
        resolvedSymbol2,
        leverage
      );

      const lConfig = await getPairConfig(
        resolvedSymbol1,
        resolvedSymbol2,
        "long",
        leverage,
        parseFloat(entryPrice) * adjustedQuantitiesResult.lQuantity
      );

      const sConfig = await getPairConfig(
        resolvedSymbol1,
        resolvedSymbol2,
        "short",
        leverage,
        parseFloat(entryPrice) * adjustedQuantitiesResult.sQuantity
      );

      updateRfqRequest({
        expiration: "10000",
        assetAId: resolvedSymbol1,
        assetBId: resolvedSymbol2,
        sPrice: String(entryPrice),
        sQuantity: adjustedQuantitiesResult.sQuantity.toString(),
        sInterestRate: sConfig?.funding?.toString() || "",
        sIsPayingApr: sConfig?.isAPayingApr || true,
        sImA: sConfig?.imA?.toString() || "",
        sImB: sConfig?.imB?.toString() || "",
        sDfA: sConfig?.dfA?.toString() || "",
        sDfB: sConfig?.dfB?.toString() || "",
        sExpirationA: sConfig?.expiryA?.toString() || "",
        sExpirationB: sConfig?.expiryB?.toString() || "",
        sTimelockA: sConfig?.timeLockA?.toString() || "",
        sTimelockB: sConfig?.timeLockB?.toString() || "",
        lPrice: String(entryPrice),
        lQuantity: adjustedQuantitiesResult.lQuantity.toString(),
        lInterestRate: lConfig?.funding?.toString() || "",
        lIsPayingApr: lConfig?.isAPayingApr || true,
        lImA: lConfig?.imA?.toString() || "",
        lImB: lConfig?.imB?.toString() || "",
        lDfA: lConfig?.dfA?.toString() || "",
        lDfB: lConfig?.dfB?.toString() || "",
        lExpirationA: lConfig?.expiryA?.toString() || "",
        lExpirationB: lConfig?.expiryB?.toString() || "",
        lTimelockA: lConfig?.timeLockA?.toString() || "",
        lTimelockB: lConfig?.timeLockB?.toString() || "",
      });
    } catch (error) {
      console.error("Error updating RFQ request:", error);
    }
  };

  useEffect(() => {
    console.log("HFEZHFHEZYUHFYEZGHYFGHYZEHGHYUEZGHGYHEZYUGFHYH")
    const intervalId = setInterval(() => {
      initializeSymbolList();
      loadPrefixData();
    }, 500000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (token != null) {
      const sendRfqRequest = async () => {
        try {
          await setRfqRequest(); /*
          console.log(rfqRequest.assetAId);
          console.log(rfqRequest.assetBId);
          console.log(rfqRequest.chainId);
          console.log(rfqRequest.expiration);
          console.log(rfqRequest.lDfA);
          console.log(rfqRequest.lDfB);
          console.log(rfqRequest.lExpirationA);
          console.log(rfqRequest.lExpirationB);
          console.log(rfqRequest.lImA);
          console.log(rfqRequest.lImB);
          console.log(rfqRequest.lInterestRate);
          console.log(rfqRequest.lIsPayingApr);
          console.log(rfqRequest.lPrice);
          console.log(rfqRequest.lQuantity);
          console.log(rfqRequest.lTimelockA);
          console.log(rfqRequest.lTimelockB);
          console.log(rfqRequest.sDfA);
          console.log(rfqRequest.sDfB);
          console.log(rfqRequest.sExpirationA);
          console.log(rfqRequest.sExpirationB);
          console.log(rfqRequest.sImA);
          console.log(rfqRequest.sImB);
          console.log(rfqRequest.sInterestRate);
          console.log(rfqRequest.sIsPayingApr);
          console.log(rfqRequest.sPrice);
          console.log(rfqRequest.sQuantity);
          console.log(rfqRequest.sTimelockA);
          console.log(rfqRequest.sTimelockB);*/
          await sendRfq(rfqRequest, token);
          console.log("RFQ request sent successfully");
        } catch (error) {
          console.error("Error sending RFQ request:", error);
        }
      };

      const intervalId = setInterval(() => {
        sendRfqRequest();
      }, 10000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [rfqRequest, token, setRfqRequest]);

  return { rfqRequest, setRfqRequest };
};

export const RfqRequestUpdater: React.FC = () => {
  const { rfqRequest } = useRfqRequest();

  return null;
};
