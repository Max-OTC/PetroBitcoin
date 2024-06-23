"use client";
import { PrivyProvider } from "@privy-io/react-auth";
import { avalancheFuji, fantomTestnet } from "viem/chains";
import { defineChain } from "viem";

export default function PrivyProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";

  if (!appId) {
    throw new Error("NEXT_PUBLIC_PRIVY_APP_ID environment variable is not set");
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#676FFF",
          showWalletLoginFirst: true,
          logo: "./logo.svg",
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: fantomTestnet,
        supportedChains: [fantomTestnet, avalancheFuji],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
