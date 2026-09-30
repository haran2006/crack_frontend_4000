/**
 * KIRI Engine 3D AI Photogrammetry Client for Vercel Next.js Backend
 * Supports Dual Key Pool with Automatic Failover:
 * - Key 1: Primary (3 credits left)
 * - Key 2: Fresh Backup (10 credits)
 */

export interface KiriKeyInfo {
  id: number;
  name: string;
  key: string;
  balance: number;
  ok: boolean;
  keyMask: string;
}

export const KIRI_API_KEYS = [
  { id: 1, key: "kiri_OgOMLFas98Vr-8qa7TIBWm_6QeGN03kWzmfz2-9K7d8", name: "Primary Key 1 (kiri_OgOM...)" },
  { id: 2, key: "kiri_VSdTt99K1q0wp7Rdr11P0U3XKRwlK7vsqoA-KYyRnek", name: "Backup Key 2 (kiri_VSdT...)" },
];

export const KIRI_BASE_URL = "https://api.kiriengine.app";

export async function checkKeyBalance(apiKey: string): Promise<{ ok: boolean; balance: number; raw?: any }> {
  try {
    const res = await fetch(`${KIRI_BASE_URL}/api/v1/open/balance`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, balance: 0 };
    }

    const json = await res.json();
    return {
      ok: json.ok || json.code === 200,
      balance: json.data?.balance ?? 0,
      raw: json,
    };
  } catch (err: any) {
    return { ok: false, balance: 0 };
  }
}

export async function checkAllKiriBalances() {
  const keys: KiriKeyInfo[] = [];
  let totalBalance = 0;

  for (const k of KIRI_API_KEYS) {
    const res = await checkKeyBalance(k.key);
    keys.push({
      id: k.id,
      name: k.name,
      key: k.key,
      ok: res.ok,
      balance: res.balance,
      keyMask: k.key.slice(0, 10) + "..." + k.key.slice(-6),
    });
    if (res.ok && res.balance > 0) {
      totalBalance += res.balance;
    }
  }

  const activeKey = keys.find((k) => k.ok && k.balance > 0) || keys[0];

  return {
    ok: true,
    code: 200,
    msg: "success",
    data: {
      balance: totalBalance,
      keys,
      activeKey: activeKey.name,
    },
  };
}
