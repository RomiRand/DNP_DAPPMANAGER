import { ChainDriver, InstalledPackageData } from "../../common";

/**
 * Get ChainDriver for a given dnp
 * Uses a hardcoded registry for new packages that have not updated their manifests yet
 */
export function getChainDriverName(
  dnp: InstalledPackageData
): ChainDriver | null {
  return (dnp.chain || knownChains[dnp.dnpName]) ?? null;
}

const knownChains: { [dnpName: string]: ChainDriver } = {
  "openethereum.dnp.dappnode.eth": "ethereum",
  "ropsten.dnp.dappnode.eth": "ethereum",
  "rinkeby.dnp.dappnode.eth": "ethereum",
  "kovan.dnp.dappnode.eth": "ethereum",
  "bitcoin.dnp.dappnode.eth": "bitcoin",
  "monero.dnp.dappnode.eth": "monero",
  "prysm.dnp.dappnode.eth": "ethereum2",
  "prysm-prater.dnp.dappnode.eth": "ethereum2",
  "teku.dnp.dappnode.eth": "ethereum2",
  "teku-prater.dnp.dappnode.eth": "ethereum2",
  "lighthouse.dnp.dappnode.eth": "ethereum2",
  "lighthouse-prater.dnp.dappnode.eth": "ethereum2"
};
