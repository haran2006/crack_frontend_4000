/**
 * KIRI Engine 3D Reconstruction Service (High-Performance Multi-Key Engine)
 * =========================================================================
 * Handles uploading photosets to KIRI Engine API using native streaming curl,
 * polling calculation status, downloading resulting 3D models (.zip),
 * and extracting .GLB files for in-browser inspection.
 *
 * Supports Multi-Key Failover Pool:
 * - Key 1: Primary (3 credits left)
 * - Key 2: Fresh Backup (10 credits)
 * Auto-detects quota exhaustion and fails over seamlessly without scan failure!
 */

const fs       = require("fs");
const path     = require("path");
const https    = require("https");
const { spawn } = require("child_process");
const AdmZip   = require("adm-zip");

const KIRI_API_KEYS = [
  { id: 1, key: "kiri_OgOMLFas98Vr-8qa7TIBWm_6QeGN03kWzmfz2-9K7d8", name: "Primary Key (kiri_OgOM...)" },
  { id: 2, key: "kiri_VSdTt99K1q0wp7Rdr11P0U3XKRwlK7vsqoA-KYyRnek", name: "Backup Key (kiri_VSdT...)" },
];

const KIRI_BASE_URL = "api.kiriengine.app";

/**
 * Check balance for a specific API key
 */
function checkKeyBalance(apiKey) {
  return new Promise((resolve) => {
    const options = {
      hostname: KIRI_BASE_URL,
      path: "/api/v1/open/balance",
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve({ ok: json.ok || json.code === 200, balance: json.data?.balance ?? 0, raw: json });
        } catch (e) {
          resolve({ ok: false, balance: 0, error: data });
        }
      });
    });
    req.on("error", (err) => resolve({ ok: false, balance: 0, error: err.message }));
    req.end();
  });
}

/**
 * Check Kiri API balance across all configured API keys
 */
async function checkBalance() {
  const results = [];
  let totalBalance = 0;

  for (const k of KIRI_API_KEYS) {
    const res = await checkKeyBalance(k.key);
    results.push({
      id: k.id,
      name: k.name,
      ok: res.ok,
      balance: res.balance,
      keyMask: k.key.slice(0, 10) + "..." + k.key.slice(-6),
    });
    if (res.ok && res.balance > 0) {
      totalBalance += res.balance;
    }
  }

  return {
    ok: true,
    code: 200,
    msg: "success",
    data: {
      balance: totalBalance,
      keys: results,
      activeKey: results.find((r) => r.ok && r.balance > 0)?.name || results[0].name,
    },
  };
}

/**
 * Upload photoset using a specific key
 */
function uploadWithKey(scanDir, scanId, keyObj, onProgress) {
  const files = fs.readdirSync(scanDir).filter((f) => f.endsWith(".jpg"));

  console.log(`\n  🚀 [KIRI ENGINE] Uploading ${files.length} images via [${keyObj.name}] for scan ${scanId}...`);

  const args = [
    "--location",
    "--silent",
    "--show-error",
    "--request", "POST",
    "https://api.kiriengine.app/api/v1/open/photo/image",
    "--header", `Authorization: Bearer ${keyObj.key}`,
    "--form", "modelQuality=1",
    "--form", "textureQuality=1",
    "--form", "fileFormat=GLB",
    "--form", "isMask=0",
  ];

  for (const f of files) {
    args.push("--form", `imagesFiles=@${path.join(scanDir, f)}`);
  }

  return new Promise((resolve, reject) => {
    const curl = spawn("curl.exe", args);

    let stdout = "";
    let stderr = "";

    curl.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    curl.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (onProgress) onProgress(chunk.toString());
    });

    curl.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`cURL upload failed with code ${code}: ${stderr}`));
      }

      try {
        const json = JSON.parse(stdout.trim());
        console.log(`  [KIRI ENGINE ${keyObj.name} RESPONSE]`, json);
        if (json.ok && json.data?.serialize) {
          resolve({ ...json.data, keyId: keyObj.id, apiKey: keyObj.key, keyName: keyObj.name });
        } else {
          const err = new Error(json.msg || "Failed to start 3D reconstruction");
          err.kiriCode = json.code;
          err.rawResponse = json;
          reject(err);
        }
      } catch (err) {
        reject(new Error(`Failed to parse KIRI response: ${stdout}`));
      }
    });

    curl.on("error", (err) => {
      reject(new Error(`Failed to spawn curl: ${err.message}`));
    });
  });
}

/**
 * Upload photoset with automatic multi-key failover
 */
async function uploadPhotosetToKiri(scanDir, scanId, onProgress) {
  const files = fs.readdirSync(scanDir).filter((f) => f.endsWith(".jpg"));
  if (files.length < 20) {
    throw new Error(`KIRI Engine requires at least 20 images for 3D reconstruction. Scan contains ${files.length} images.`);
  }

  // Check if we already have an active serialize for this scan
  const metaPath = path.join(scanDir, "scan_metadata.json");
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
      if (meta.kiri?.serialize) {
        const st = await getModelStatus(meta.kiri.serialize, meta.kiri.apiKey);
        if (st.code === 200 && (st.data?.status === 0 || st.data?.status === 3 || st.data?.status === 2)) {
          console.log(`  [KIRI] Re-using active task ${meta.kiri.serialize} for scan ${scanId} (Status: ${st.data.status})`);
          return { serialize: meta.kiri.serialize, calculateType: meta.kiri.calculateType || 1, reUsed: true, apiKey: meta.kiri.apiKey };
        }
      }
    } catch (e) {}
  }

  let lastError = null;

  for (let i = 0; i < KIRI_API_KEYS.length; i++) {
    const keyObj = KIRI_API_KEYS[i];
    try {
      if (i > 0) {
        console.log(`  🔄 [KIRI KEY POOL] Failing over to Key ${keyObj.id} (${keyObj.name})...`);
      }
      const result = await uploadWithKey(scanDir, scanId, keyObj, onProgress);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`  ⚠️ [KIRI KEY ${keyObj.id} FAILED] ${err.message}`);
      if (i < KIRI_API_KEYS.length - 1) {
        console.log(`  🔄 [KIRI KEY FAILOVER] Switching from ${keyObj.name} to next key due to: ${err.message}`);
      }
    }
  }

  throw lastError || new Error("All KIRI Engine API keys failed.");
}

/**
 * Retrieve calculation status for a task
 */
async function getModelStatus(serialize, apiKey) {
  const keysToTry = apiKey
    ? [apiKey, ...KIRI_API_KEYS.map((k) => k.key).filter((k) => k !== apiKey)]
    : KIRI_API_KEYS.map((k) => k.key);

  let lastRes = null;
  for (const k of keysToTry) {
    try {
      const res = await new Promise((resolve, reject) => {
        const options = {
          hostname: KIRI_BASE_URL,
          path: `/api/v1/open/model/getStatus?serialize=${encodeURIComponent(serialize)}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${k}`,
          },
        };
        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse status: ${data}`));
            }
          });
        });
        req.on("error", reject);
        req.end();
      });

      if (res && res.code === 200) {
        return res;
      }
      lastRes = res;
    } catch (e) {
      // try next key
    }
  }

  return lastRes || { ok: false, error: "Status check failed across all keys" };
}

/**
 * Get download link for finished 3D model
 */
async function getModelDownloadUrl(serialize, apiKey) {
  const keysToTry = apiKey
    ? [apiKey, ...KIRI_API_KEYS.map((k) => k.key).filter((k) => k !== apiKey)]
    : KIRI_API_KEYS.map((k) => k.key);

  let lastRes = null;
  for (const k of keysToTry) {
    try {
      const res = await new Promise((resolve, reject) => {
        const options = {
          hostname: KIRI_BASE_URL,
          path: `/api/v1/open/model/getModelZip?serialize=${encodeURIComponent(serialize)}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${k}`,
          },
        };
        const req = https.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error(`Failed to parse download URL: ${data}`));
            }
          });
        });
        req.on("error", reject);
        req.end();
      });

      if (res && res.data?.modelUrl) {
        return res;
      }
      lastRes = res;
    } catch (e) {
      // try next key
    }
  }

  return lastRes || { ok: false, error: "Download URL fetch failed across all keys" };
}

/**
 * Download remote file to local path with redirect support
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/**
 * Extract .GLB file from downloaded zip
 */
function extractGlbFromZip(zipPath, outputDir) {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputDir, true);

  // Search for any .glb file inside outputDir
  function findGlb(dir) {
    const entries = fs.readdirSync(dir);
    for (const e of entries) {
      const full = path.join(dir, e);
      if (fs.statSync(full).isDirectory()) {
        const found = findGlb(full);
        if (found) return found;
      } else if (e.toLowerCase().endsWith(".glb")) {
        return full;
      }
    }
    return null;
  }

  const foundGlb = findGlb(outputDir);
  const targetGlb = path.join(outputDir, "model.glb");

  if (foundGlb && foundGlb !== targetGlb) {
    fs.copyFileSync(foundGlb, targetGlb);
  }
  return fs.existsSync(targetGlb) ? targetGlb : null;
}

module.exports = {
  KIRI_API_KEYS,
  checkBalance,
  uploadPhotosetToKiri,
  getModelStatus,
  getModelDownloadUrl,
  downloadFile,
  extractGlbFromZip,
};
