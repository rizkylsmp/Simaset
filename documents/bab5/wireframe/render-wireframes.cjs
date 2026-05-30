const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { pathToFileURL } = require("url");

const chrome = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const root = __dirname;
const html = pathToFileURL(path.join(root, "index.html")).href;
const shots = [
  ["login", "wireframe-5-21-login.png"],
  ["dashboard", "wireframe-5-22-dashboard.png"],
  ["aset", "wireframe-5-23-kelola-aset.png"],
  ["substansi", "wireframe-5-24-data-substansi.png"],
  ["pusat", "wireframe-5-25-pusat-data.png"],
  ["peta", "wireframe-5-26-peta-interaktif.png"],
  ["sewa", "wireframe-5-27-penyewaan.png"],
  ["permintaan", "wireframe-5-28-permintaan-sewa.png"],
  ["masyarakat-tersedia", "wireframe-5-29-masyarakat-aset-tersedia.png"],
  ["masyarakat-diajukan", "wireframe-5-30-masyarakat-sewa-diajukan.png"],
  ["masyarakat-disetujui", "wireframe-5-31-masyarakat-sewa-disetujui.png"],
  ["riwayat", "wireframe-5-32-riwayat.png"],
  ["notifikasi", "wireframe-5-33-notifikasi.png"],
  ["backup", "wireframe-5-34-backup.png"],
  ["pengaturan", "wireframe-5-35-profil-pengaturan.png"],
  ["ekasmat", "wireframe-5-36-ekasmat.png"],
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForFile(file) {
  for (let i = 0; i < 100; i += 1) {
    if (fs.existsSync(file)) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${file}`);
}

async function main() {
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "simaset-wireframe-"));
  const chromeProcess = spawn(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--disable-features=ForcedColors,WebContentsForceDark",
    "--force-color-profile=srgb",
    "--hide-scrollbars",
    "--window-size=1420,900",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], { stdio: "ignore" });

  try {
    const portFile = path.join(userDataDir, "DevToolsActivePort");
    await waitForFile(portFile);
    const [port] = fs.readFileSync(portFile, "utf8").trim().split(/\s+/);
    const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((res) => res.json());
    const page = pages.find((entry) => entry.type === "page");
    if (!page) throw new Error("No debuggable Chrome page was found");
    const ws = new WebSocket(page.webSocketDebuggerUrl);

    let id = 0;
    const pending = new Map();
    let loadResolve;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message);
      }
      if (message.method === "Page.loadEventFired" && loadResolve) {
        loadResolve();
        loadResolve = undefined;
      }
    };

    await new Promise((resolve) => { ws.onopen = resolve; });
    const cdp = (method, params = {}) => new Promise((resolve, reject) => {
      const commandId = id += 1;
      pending.set(commandId, { resolve, reject });
      ws.send(JSON.stringify({ id: commandId, method, params }));
    });

    await cdp("Page.enable");
    await cdp("Runtime.enable");
    await cdp("Emulation.setDeviceMetricsOverride", {
      width: 1420,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    const loaded = new Promise((resolve) => { loadResolve = resolve; });
    await cdp("Page.navigate", { url: html });
    await loaded;
    await cdp("Runtime.evaluate", {
      expression: `(() => {
        const style = document.createElement("style");
        style.textContent = \`
          html { scroll-behavior: auto !important; }
          body { background: #fff !important; }
          .topbar, .intro, .screen-head { display: none !important; }
          .frame {
            border-radius: 0 !important;
            box-shadow: none !important;
            filter: grayscale(1) contrast(1.12) !important;
          }
          .frame *, .frame *::before, .frame *::after {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        \`;
        document.head.appendChild(style);
      })()`,
    });

    for (const [anchor, name] of shots) {
      const expression = `(() => {
        const el = document.getElementById(${JSON.stringify(anchor)});
        if (!el) throw new Error("Missing section ${anchor}");
        const frame = el.querySelector(".frame");
        if (!frame) throw new Error("Missing frame for section ${anchor}");
        frame.scrollIntoView({ block: "start", inline: "nearest" });
        const rect = frame.getBoundingClientRect();
        return {
          x: rect.left + window.scrollX,
          y: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        };
      })()`;
      const clipResult = await cdp("Runtime.evaluate", { expression, returnByValue: true });
      await delay(120);
      const clip = clipResult.result.result.value;
      const screenshot = await cdp("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: true,
        clip: {
          x: Math.max(0, clip.x),
          y: Math.max(0, clip.y),
          width: clip.width,
          height: clip.height,
          scale: 1,
        },
      });
      fs.writeFileSync(path.join(root, name), Buffer.from(screenshot.result.data, "base64"));
      console.log(name);
    }

    ws.close();
  } finally {
    chromeProcess.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
