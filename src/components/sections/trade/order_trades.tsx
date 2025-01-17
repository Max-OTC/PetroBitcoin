"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import { FaEquals } from "react-icons/fa";
import { ChangeEvent, useEffect, useCallback, useMemo, useState } from "react";
import SheetPlaceOrder from "@/components/sheet/place_open";
import { useTradeStore } from "@/store/tradeStore";
import { OrderBook } from "@/components/sections/trade/OrderBook";
import { useAuthStore } from "@/store/authStore";
import useBlurEffect from "@/hooks/blur";
import { useColorStore } from "@/store/colorStore";
import { useMethodColor } from "@/hooks/useMethodColor";
import { useOpenQuoteChecks } from "@/hooks/useOpenQuoteChecks";
import Link from "next/link";
import { config } from "@/config";

function SectionTradeOrderTrades() {
  const [isOrderBookCollapsed, setIsOrderBookCollapsed] = useState(true);
  const {
    leverage,
    bidPrice,
    askPrice,
    entryPrice,
    maxAmount,
    currentMethod,
    amount,
    amountUSD,
    currentTabIndex,
    symbol,
    setCurrentMethod: setCurrentMethodStore,
    setEntryPrice,
    setAmount,
    setAmountUSD,
    setCurrentTabIndex: setCurrentTabIndexStore,
    setCurrentTabIndex,
    setSliderValue,
    accountLeverage,
    balance,
  } = useTradeStore();

  const blur = useBlurEffect();
  const isDevMode = config.devMode;
  const marketOpenState = useAuthStore((state) => state.isMarketOpen);
  const isMarketOpen = marketOpenState;
  const [showErrors, setShowErrors] = useState(false);

  const testBool = true;
  const color = useColorStore((state) => state.color) || "#E0AD0C";
  useMethodColor();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowErrors(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [amount, entryPrice]);

  const {
    quotes,
    sufficientBalance,
    maxAmountOpenable,
    isBalanceZero,
    isAmountMinAmount,
    noQuotesReceived,
    minAmount,
    recommendedStep,
    canBuyMinAmount,
    lastValidBalance,
    minCollateralForMinAmount,
  } = useOpenQuoteChecks(amount, entryPrice);

  const handleAmountChange = useCallback(
    (value: string) => {
      setAmount(value);
      setAmountUSD((parseFloat(value) * parseFloat(entryPrice)).toString());
    },
    [setAmount, setAmountUSD, entryPrice]
  );

  const handleAmountUSDChange = useCallback(
    (value: string) => {
      setAmountUSD(value);
      setAmount((parseFloat(value) / parseFloat(entryPrice)).toString());
    },
    [setAmount, setAmountUSD, entryPrice]
  );

  const handlePercentageClick = useCallback(
    (percentage: number) => {
      const newValue = noQuotesReceived
        ? (percentage / 100) * 100
        : (percentage / 100) * maxAmountOpenable;
      const roundedValue =
        Math.round(newValue / recommendedStep) * recommendedStep;
      setSliderValue(roundedValue);
      setAmount(roundedValue.toString());
      setAmountUSD((roundedValue * parseFloat(entryPrice)).toString());
    },
    [
      noQuotesReceived,
      maxAmountOpenable,
      recommendedStep,
      setSliderValue,
      setAmount,
      setAmountUSD,
      entryPrice,
    ]
  );

  useEffect(() => {
    if (currentTabIndex === "Market") {
      const { bidPrice: latestBidPrice, askPrice: latestAskPrice } =
        useTradeStore.getState();
      setEntryPrice(
        currentMethod === "Buy"
          ? latestAskPrice.toString()
          : latestBidPrice.toString()
      );
    }
  }, [currentTabIndex, currentMethod, setEntryPrice, symbol]); // Add symbol to dependencies

  useEffect(() => {
    const checkPriceSpread = () => {
      const state = useTradeStore.getState();
      const { bidPrice, askPrice } = state;

      // Calculate the percentage difference
      const priceDifference = Math.abs(askPrice - bidPrice);
      const averagePrice = (askPrice + bidPrice) / 2;
      const percentageDifference = (priceDifference / averagePrice) * 100;

      // If the difference is more than 0.5% and we're in Market tab
      if (percentageDifference > 0.5 && currentTabIndex === "Market") {
        // Switch to Limit
        setCurrentTabIndex("Limit");

        // Switch back to Market after a brief delay
        setTimeout(() => {
          setCurrentTabIndex("Market");
        }, 50); // 50ms delay, adjust if needed
      }
    };

    // Run the check immediately
    checkPriceSpread();

    // Set up an interval to run the check every second
    const intervalId = setInterval(checkPriceSpread, 1000);

    // Clean up the interval on unmount
    return () => clearInterval(intervalId);
  }, [currentTabIndex, setCurrentTabIndex]);

  const renderBalanceWarning = () => {
    if (!showErrors) return null;

    if (isBalanceZero) {
      return (
        <p className="text-red-500 text-sm">
          Your balance is zero. Please{" "}
          <Link href="/wallet" className="text-blue-500 underline">
            deposit funds
          </Link>{" "}
          to continue trading.
        </p>
      );
    }

    if (
      !sufficientBalance &&
      !isBalanceZero &&
      !noQuotesReceived &&
      !isAmountMinAmount
    ) {
      if (Math.floor(maxAmountOpenable) === 0) {
        if (!isMarketOpen) {
          return (
            <p className="text-red-500 text-sm">
              The market is currently closed. Trading is not available at this
              time.
            </p>
          );
        } else {
          return (
            <p className="text-red-500 text-sm">
              The market is currently closed. RWAs are not 24/24h crypto.
            </p>
          );
        }
      } else {
        return (
          <p className="text-red-500 text-sm">
            Min contract required balance:{" "}
            {minCollateralForMinAmount.toFixed(8)}
          </p>
        );
      }
    }
    return null;
  };
  return (
    <div className={`container ${blur ? "blur" : ""}`}>
      <div className="mt-5">
        <div className="border-b flex space-x-5 px-5">
          {["Limit", "Market"].map((x) => (
            <div
              key={x}
              onClick={() => {
                setCurrentTabIndex(x);
                setCurrentTabIndexStore(x);
              }}
            >
              <h2
                className={`${
                  currentTabIndex === x ? "text-white" : "text-card-foreground"
                } transition-all font-medium cursor-pointer`}
              >
                {x}
              </h2>
              <div
                className={`w-[18px] h-[4px] ${
                  currentTabIndex === x ? "bg-white" : "bg-transparent"
                } mt-3 transition-all`}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch space-y-5 sm:space-y-0 sm:space-x-5 pt-5 px-5">
          <div className="w-full sm:w-2/3 flex flex-col space-y-5">
            <div className="flex border-b">
              {["Buy", "Sell"].map((x) => (
                <h3
                  key={x}
                  onClick={() => setCurrentMethodStore(x)}
                  className={`w-full text-center pb-3 border-b-[3px] ${
                    currentMethod === x
                      ? `border-[${color}] text-[${color}]`
                      : "border-transparent"
                  } font-medium transition-all cursor-pointer`}
                >
                  {x}
                </h3>
              ))}
            </div>

            <div className="flex flex-col space-y-5">
              <p className="text-card-foreground text-xs sm:text-sm">Price</p>
              <div className="flex pb-3 items-center space-x-2">
                <input
                  type="number"
                  className={`pb-3 outline-none w-full border-b-[1px] bg-transparent hover:shadow-[0_0_0_2px] hover:shadow-[#e0ae0c85]`}
                  placeholder="Input Price"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  disabled={currentTabIndex === "Market"}
                />
                <p>USDP</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col space-y-2 w-full">
                  <p className="text-card-foreground text-xs sm:text-sm">
                    Amount (Contracts)
                  </p>
                  <input
                    type="number"
                    className={`pb-3 outline-none w-full border-b-[1px] bg-transparent hover:shadow-[0_0_0_2px] hover:shadow-[${color}]`}
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                  />
                </div>
                <div className="mt-5">
                  <FaEquals className="text-[0.8rem]" />
                </div>
                <div className="flex flex-col space-y-2 w-full">
                  <p className="text-card-foreground text-xs sm:text-sm">
                    Amount (USDP)
                  </p>
                  <input
                    type="number"
                    className={`pb-3 outline-none w-full border-b-[1px] bg-transparent hover:shadow-[0_0_0_2px] hover:shadow-[${color}]`}
                    value={amountUSD}
                    onChange={(e) => handleAmountUSDChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {[25, 50, 75, 100].map((x) => (
                  <button
                    key={x}
                    onClick={() => handlePercentageClick(x)}
                    className={`w-full bg-card py-2 text-center hover:bg-[#e0ae0c86] rounded-lg cursor-pointer`}
                  >
                    {x}%
                  </button>
                ))}
              </div>
              {renderBalanceWarning()}
              {showErrors && isAmountMinAmount && (
                <p className="text-red-500 text-sm">
                  Min amount allowed at this price: {minAmount.toFixed(3)}
                </p>
              )}
              {showErrors && noQuotesReceived && !isMarketOpen && (
                <p className="text-card-foreground text-sm">
                  <span className="loader"></span>
                  Waiting for solvers quote.
                </p>
              )}
              {showErrors && isAmountMinAmount && canBuyMinAmount && (
                <p className="text-yellow-500 text-sm">
                  The amount is less than the minimum required, but you have
                  sufficient balance to buy the minimum amount of {minAmount}{" "}
                  contracts.
                </p>
              )}
              <div className="flex  sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm">
                <Link
                  href="/user"
                  className="text-card-foreground hover:underline mb-1 sm:mb-0"
                >
                  {leverage}x Account Leverage
                </Link>
                <p className="text-card-foreground mb-1 text-xs sm:text-sm">
                  <span className="text-red-500">12.25%</span> APR
                </p>
                <p className="text-card-foreground text-xs sm:text-sm">
                  Balance: {Number(lastValidBalance).toFixed(2)} USDP
                </p>
              </div>
              <div>
                <Drawer>
                  <DrawerTrigger
                    className={`w-full py-2 rounded-lg text-black text-xs sm:text-sm ${
                      isMarketOpen
                        ? `bg-[#666EFF] hover:bg-[#e0ae0cea]`
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!isMarketOpen}
                  >
                    <p>{isMarketOpen ? currentMethod : "Market Closed"}</p>
                  </DrawerTrigger>
                  {!isMarketOpen && (
                    <p className="text-red-500 text-sm mt-2"></p>
                  )}
                  <SheetPlaceOrder />
                </Drawer>
              </div>
            </div>
          </div>
          <div className="relative w-full sm:w-1/3 bg-card mt-5 sm:mt-0">
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full transform sm:hidden bg-black text-white py-2 px-1 rounded-l-lg writing-mode-vertical"
              onClick={() => setIsOrderBookCollapsed(!isOrderBookCollapsed)}
            >
              <span className="transform rotate-180">
                {isOrderBookCollapsed ? "Show OrderBook" : "Hide OrderBook"}
              </span>
            </button>
            <div
              className={`${
                isOrderBookCollapsed ? "hidden" : "block"
              } sm:block w-full`}
            >
              <OrderBook
                maxRows={5}
                isOrderBookOn={isMarketOpen}
                className="text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionTradeOrderTrades;
