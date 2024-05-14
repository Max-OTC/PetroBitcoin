import { getPrices } from "@pionerfriends/api-client";

async function calculatePairPrices(
  pairs: string[],
  token: string | null
): Promise<{ [pair: string]: { bid: number; ask: number } }> {
  const assetIds = new Set<string>();
  const pairPrices: { [pair: string]: { bid: number; ask: number } } = {};

  try {
    // Collect unique asset IDs from the pairs
    for (const pair of pairs) {
      const [assetAId, assetBId] = pair.split("/");
      assetIds.add(assetAId);
      assetIds.add(assetBId);
    }

    // Check if token is null
    if (token === null) {
      throw new Error("Token is null");
    }

    // Retrieve prices for all unique asset IDs
    const prices = await getPrices(Array.from(assetIds), token);

    // Check if prices is defined
    if (prices && prices.data) {
      // Calculate bid and ask prices for each pair
      for (const pair of pairs) {
        const [assetAId, assetBId] = pair.split("/");
        if (prices.data[assetAId] && prices.data[assetBId]) {
          const bidA = Number(prices.data[assetAId]["bidPrice"] || 0);
          const bidB = Number(prices.data[assetBId]["bidPrice"] || 0);
          const askA = Number(prices.data[assetAId]["askPrice"] || 0);
          const askB = Number(prices.data[assetBId]["askPrice"] || 0);
          const bid = bidB !== 0 ? bidA / bidB : 0;
          const ask = askB !== 0 ? askA / askB : 0;
          pairPrices[pair] = { bid, ask };
        } else {
          pairPrices[pair] = { bid: 0, ask: 0 };
        }
      }
    } else {
      throw new Error("Unable to retrieve prices");
    }
  } catch (error) {
    throw error;
  }

  return pairPrices;
}

export { calculatePairPrices };
