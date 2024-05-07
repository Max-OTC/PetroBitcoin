// components/layout/menu.tsx

"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { usePathname } from "next/navigation";
import { GoHomeFill } from "react-icons/go";
import { MdOutlineInsertChart } from "react-icons/md";
import { RiExchangeBoxLine } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { BiSolidWallet } from "react-icons/bi";
import { useWallets } from "@privy-io/react-auth";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { FaTimes } from "react-icons/fa";
import { getPayload, login as apiLogin } from "@pionerfriends/api-client";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import {
  createWalletClient,
  custom,
  verifyMessage,
} from "viem";

export function Menu() {
  const setWalletClient = useAuthStore((state) => state.setWalletClient);
  const { ready, authenticated, user, logout } = usePrivy();
  const pathname = usePathname();
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const setProvider = useAuthStore((state) => state.setProvider);
  const setEthersSigner = useAuthStore((state) => state.setEthersSigner);
  const setWallet = useAuthStore((state) => state.setWallet);
  const setToken = useAuthStore((state) => state.setToken);
  const token = useAuthStore((state) => state.token);
  const provider = useAuthStore((state) => state.provider);
  const [payload, setPayload] = useState<{
    uuid: string;
    message: string;
  } | null>(null);
  const [payloadError, setPayloadError] = useState(false);
  const [loginError, setLoginError] = useState(false);

  const disableLogin = !!(authenticated && token);

  const { login } = useLogin({
    onComplete: async (user, isNewUser, wasAlreadyAuthenticated) => {
      console.log(user, isNewUser, wasAlreadyAuthenticated);
      await fetchPayload();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    const tokenFromCookie = Cookies.get("token");
    if (tokenFromCookie && !token && ready && authenticated) {
      setToken(tokenFromCookie);
    }
  }, [authenticated]);

  useEffect(() => {
    const fetchData = async () => {
      if (ready && authenticated && wallet) {
        setWallet(wallet);
        const provider = await wallet.getEthereumProvider();
        setProvider(provider);
        const walletClient = createWalletClient({
          transport: custom(provider),
          account: wallet.address as `0x${string}`,
        });
        setWalletClient(walletClient);
      }
    };

    fetchData();
  }, [wallet]);

  const fetchPayload = async () => {
    if (wallet && !token) {
      const address = wallet.address;

      try {
        const payloadResponse = await getPayload(address);
        if (
          payloadResponse &&
          payloadResponse.status === 200 &&
          payloadResponse.data.uuid &&
          payloadResponse.data.message
        ) {
          setPayload(payloadResponse.data);
          setPayloadError(false);
        } else {
          setPayload(null);
          setPayloadError(true);
        }
      } catch (error) {
        console.error("Error fetching payload:", error);
        setPayloadError(true);
      }
    }
  };

  const signMessage = async () => {
    if (payload && !token) {
      const { uuid, message } = payload;

      try {
        const provider = await wallet.getEthereumProvider();
        const walletClient = createWalletClient({
          transport: custom(provider),
          account: wallet.address as `0x${string}`,
        });

        console.log("meny walletClient", walletClient);

        const signature = await walletClient.signMessage({
          account: wallet.address as `0x${string}`,
          message: message,
        });

        const valid = await verifyMessage({
          address: wallet.address as `0x${string}`,
          message: message,
          signature: signature,
        });

        console.log("signature", signature, message, valid);

        return { uuid, signature };
      } catch (error) {
        console.error("Error signing message:", error);
        setLoginError(true);
      }
    }
  };

  useEffect(() => {
    if (payload) {
      signMessage().then((signedData) => {
        if (signedData) {
          const { uuid, signature } = signedData;
          attemptLogin(uuid, signature);
        }
      });
    }
  }, [payload]);

  const attemptLogin = async (uuid: string, signature: string) => {
    try {
      const loginResponse = await apiLogin(uuid, signature);

      if (
        loginResponse &&
        loginResponse.status === 200 &&
        loginResponse.data.token
      ) {
        const token = loginResponse.data.token;
        setToken(token);
        setLoginError(false);
      } else {
        setPayload(null);
        setLoginError(true);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginError(true);
    }
  };

  useEffect(() => {
    if (loginError) {
      logout();
      setPayload(null);
      setToken(null);
      setPayloadError(false);
      setLoginError(false);
    }
  }, [loginError]);

  return (
    <div className="w-full sticky bottom-0 h-[110px] md:h-[130px]">
      <div className="w-full h-[1px] bg-border"></div>
      <div className="container bg-background flex items-center justify-center">
        {ready ? (
          ready && authenticated && token ? (
            <div className="text-center text-white p-3 flex items-center">
              <h3 className="mr-2">Account: {wallet?.address}</h3>
              <button
                onClick={() => {
                  logout();
                  setPayload(null);
                  setToken(null);
                  setPayloadError(false);
                  setLoginError(false);
                }}
                className="text-white hover:text-gray-200"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ) : payload ? (
            <div className="text-center text-white p-3 flex items-center">
              <span className="mr-2">Signing in...</span>
              <button
                onClick={() => {
                  logout();
                  setPayload(null);
                  setToken(null);
                  setPayloadError(false);
                  setLoginError(false);
                }}
                className="text-white hover:text-gray-200"
              >
                <FaTimes size={10} />
              </button>
            </div>
          ) : (
            <button
              disabled={disableLogin}
              onClick={() => {
                setPayload(null);
                setToken(null);
                setPayloadError(false);
                setLoginError(false);
                if (ready) {
                  login();
                }
              }}
              className="text-center text-white p-3"
            >
              Log in
            </button>
          )
        ) : (
          <div className="text-center text-white p-3">Loading...</div>
        )}
      </div>
      <div className="bg-accent text-card-foreground">
        <div className="flex items-center justify-between w-full container py-3 space-x-5">
          {menus.map((x) => {
            return (
              <Link
                href={x.link}
                key={x.name}
                className={`${pathname === x.link ? "text-primary" : "text-card-foreground"
                  } group flex flex-col items-center text-center space-y-1 hover:text-primary w-full cursor-pointer transition-all`}
              >
                <div className="text-[1.5rem] md:text-[2rem]">{x.icon}</div>
                <p>{x.name}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const useWalletAndProvider = () => {
  const { wallets } = useWallets();
  const provider = useAuthStore((state) => state.provider);

  return { wallet: wallets[0], provider };
};

const menus = [
  { name: "Home", icon: <GoHomeFill />, link: "/" },
  { name: "Markets", icon: <MdOutlineInsertChart />, link: "/markets" },
  { name: "Trade", icon: <RiExchangeBoxLine />, link: "/trade" },
  { name: "Wallet", icon: <BiSolidWallet />, link: "/wallet" },
  { name: "User", icon: <IoPersonSharp />, link: "/user" },
];

export default Menu;
