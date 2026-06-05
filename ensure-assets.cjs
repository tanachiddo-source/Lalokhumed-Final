const fs = require('fs');
const path = require('path');
const https = require('https');

function downloadAsset(url, dest) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        if (res.headers.location) {
          downloadAsset(res.headers.location, dest).then(resolve).catch(reject);
          return;
        }
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err) => {
      reject(err);
    });

    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error(`Download timeout for ${url}`));
    });
  });
}

async function run() {
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const assetsToDownload = [
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%202%20Transparent.png",
      dest: path.join(publicDir, "Logo_2_Transparent.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%201%20Transparent.png",
      dest: path.join(publicDir, "Logo_1_Transparent.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Logo%201%20Transparent.png",
      dest: path.join(publicDir, "favicon.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20Slide%201.png",
      dest: path.join(publicDir, "Home_Slide_1.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20slide%202.png",
      dest: path.join(publicDir, "Home_slide_2.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20Slide%203.png",
      dest: path.join(publicDir, "Home_Slide_3.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20Slide%204.png",
      dest: path.join(publicDir, "Home_Slide_4.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/Home%20Section%201.png",
      dest: path.join(publicDir, "Home_Section_1.png")
    },
    {
      url: "https://raw.githubusercontent.com/tanachiddo-source/Lalokhumed-Final/63392fb297c2dc80233ac4a2e0865cccb3eccb02/public/About%20IV.png",
      dest: path.join(publicDir, "About_IV.png")
    }
  ];

  console.log("Starting build-time asset verification & sync...");
  for (const asset of assetsToDownload) {
    try {
      const encodedUrl = asset.url.replace(/ /g, "%20");
      await downloadAsset(encodedUrl, asset.dest);
      console.log(`Successfully synced ${path.basename(asset.dest)}`);
    } catch (e) {
      console.error(`Warning: Failed to sync ${asset.url}:`, e.message || e);
    }
  }

  // Also make sure Logo_1 is copied over favicon.png if both exist locally
  const logo1Path = path.join(publicDir, "Logo_1_Transparent.png");
  const faviconPath = path.join(publicDir, "favicon.png");
  if (fs.existsSync(logo1Path)) {
    fs.copyFileSync(logo1Path, faviconPath);
    console.log("Local sync: Copied Logo_1_Transparent.png to favicon.png");
  }
}

run().catch((err) => {
  console.error("Asset sync failed:", err);
  process.exit(0); // Exit successfully so we don't block the build even if a single download fails
});
