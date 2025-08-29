import { getAddress, isAddress } from "ethers";
import { PublicKey } from "@solana/web3.js";


export function validateEth(addr: string) {
    if (!isAddress(addr)) return null;
    // checksum normalize
    return getAddress(addr);
}


export function validateSol(addr: string) {
    try {
        const pk = new PublicKey(addr);
        return pk.toBase58() === addr ? addr : null;
    } catch { return null; }
}