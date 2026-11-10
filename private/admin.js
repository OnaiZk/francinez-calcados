"use strict";

/* ==========================================================================
   FRANCINEZ CALÇADOS — Authenticated Admin Controller & Studio Photo Engine
   Protected by HttpOnly Session + Strict CSP + Double-Layer CSRF Verification
   ========================================================================== */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeHex(hex) {
  const s = String(hex || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(s) ? s : "#A58E74";
}

function resolvePreviewSrc(src) {
  const s = String(src || "").trim();
  if (/^data:image\/(jpeg|jpg|png);base64,/i.test(s)) {
    return s;
  }
  const clean = s.replace(/^\/+/, "");
  if (/^assets\/(products|uploads)\/[a-zA-Z0-9._-]{1,100}\.(png|jpg|jpeg|webp)$/i.test(clean)) {
    return `/${clean}`;
  }
  return "/assets/products/nb-9060-castor.png";
}

const StudioPhotoEngine = {
  OUT_WIDTH: 800,
  OUT_HEIGHT: 600,

  loadImageElement(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (/^https?:\/\//i.test(src)) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  },

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  colorDistSq(r1, g1, b1, r2, g2, b2) {
    const dr = r1 - r2;
    const dg = g1 - g2;
    const db = b1 - b2;
    return (2 * dr * dr + 4 * dg * dg + 3 * db * db) / 9;
  },

  rgbToHex(r, g, b) {
    const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  },

  extractBorderClusters(data, width, height) {
    const samples = [];
    const step = Math.max(2, Math.floor(Math.min(width, height) / 40));

    for (let x = 0; x < width; x += step) {
      for (let y = 0; y < Math.max(4, Math.floor(height * 0.05)); y += 2) {
        const idx = (y * width + x) * 4;
        samples.push([data[idx], data[idx + 1], data[idx + 2]]);
      }
    }

    const maxY = Math.floor(height * 0.85);
    const edgeW = Math.max(4, Math.floor(width * 0.05));
    for (let y = 0; y < maxY; y += step) {
      for (let x = 0; x < edgeW; x += 2) {
        const idxL = (y * width + x) * 4;
        const idxR = (y * width + (width - 1 - x)) * 4;
        samples.push([data[idxL], data[idxL + 1], data[idxL + 2]]);
        samples.push([data[idxR], data[idxR + 1], data[idxR + 2]]);
      }
    }

    const clusters = [];
    const clusterRadiusSq = 28 * 28;
    for (let i = 0; i < samples.length; i++) {
      const [r, g, b] = samples[i];
      let matched = null;
      for (let c = 0; c < clusters.length; c++) {
        const cl = clusters[c];
        if (this.colorDistSq(r, g, b, cl.r, cl.g, cl.b) <= clusterRadiusSq) {
          matched = cl;
          break;
        }
      }
      if (matched) {
        matched.count += 1;
        matched.r += (r - matched.r) / matched.count;
        matched.g += (g - matched.g) / matched.count;
        matched.b += (b - matched.b) / matched.count;
      } else if (clusters.length < 12) {
        clusters.push({ r, g, b, count: 1 });
      }
    }

    return clusters.sort((a, b) => b.count - a.count).slice(0, 6);
  },

  segmentShoeForeground(srcCanvas, tolerance = 44) {
    const width = srcCanvas.width;
    const height = srcCanvas.height;
    const ctx = srcCanvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const clusters = this.extractBorderClusters(data, width, height);
    const threshSq = tolerance * tolerance;
    const totalPixels = width * height;
    const bgMask = new Uint8Array(totalPixels);
    const visited = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let qHead = 0;
    let qTail = 0;

    const matchesBg = (pixelIdx) => {
      const i4 = pixelIdx * 4;
      if (data[i4 + 3] < 30) return true;
      const r = data[i4];
      const g = data[i4 + 1];
      const b = data[i4 + 2];
      for (let c = 0; c < clusters.length; c++) {
        const cl = clusters[c];
        if (this.colorDistSq(r, g, b, cl.r, cl.g, cl.b) <= threshSq) {
          return true;
        }
      }
      return false;
    };

    const enqueueIfBg = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const pIdx = y * width + x;
      if (visited[pIdx]) return;
      visited[pIdx] = 1;
      if (matchesBg(pIdx)) {
        bgMask[pIdx] = 1;
        queue[qTail++] = pIdx;
      }
    };

    for (let x = 0; x < width; x++) {
      enqueueIfBg(x, 0);
      enqueueIfBg(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      enqueueIfBg(0, y);
      enqueueIfBg(width - 1, y);
    }

    while (qHead < qTail) {
      const curr = queue[qHead++];
      const cx = curr % width;
      const cy = (curr - cx) / width;

      const c4 = curr * 4;
      const cr = data[c4];
      const cg = data[c4 + 1];
      const cb = data[c4 + 2];

      const neighbors = [
        [cx - 1, cy],
        [cx + 1, cy],
        [cx, cy - 1],
        [cx, cy + 1]
      ];

      for (let n = 0; n < 4; n++) {
        const nx = neighbors[n][0];
        const ny = neighbors[n][1];
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const nIdx = ny * width + nx;
        if (visited[nIdx]) continue;
        visited[nIdx] = 1;

        const n4 = nIdx * 4;
        const nr = data[n4];
        const ng = data[n4 + 1];
        const nb = data[n4 + 2];
        const stepDistSq = this.colorDistSq(cr, cg, cb, nr, ng, nb);

        if (matchesBg(nIdx) && stepDistSq <= (tolerance * 0.75) ** 2) {
          bgMask[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }

    let fgCount = 0;
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let colorSamples = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pIdx = y * width + x;
        if (bgMask[pIdx] === 0) {
          fgCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;

          if (fgCount % 7 === 0) {
            const i4 = pIdx * 4;
            sumR += data[i4];
            sumG += data[i4 + 1];
            sumB += data[i4 + 2];
            colorSamples++;
          }
        }
      }
    }

    const fgRatio = fgCount / totalPixels;

    if (fgRatio < 0.04 || fgRatio > 0.94 || maxX <= minX || maxY <= minY) {
      return {
        cutoutSuccess: false,
        dominantHex:
          colorSamples > 0
            ? this.rgbToHex(sumR / colorSamples, sumG / colorSamples, sumB / colorSamples)
            : "#8E7962"
      };
    }

    const alpha = new Float32Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      alpha[i] = bgMask[i] === 1 ? 0 : 255;
    }

    const smoothAlpha = new Uint8ClampedArray(totalPixels);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const sum =
          alpha[idx - width - 1] +
          alpha[idx - width] +
          alpha[idx - width + 1] +
          alpha[idx - 1] +
          alpha[idx] * 2 +
          alpha[idx + 1] +
          alpha[idx + width - 1] +
          alpha[idx + width] +
          alpha[idx + width + 1];
        smoothAlpha[idx] = Math.round(sum / 10);
      }
    }

    for (let i = 0; i < totalPixels; i++) {
      const i4 = i * 4;
      const a = smoothAlpha[i];
      data[i4 + 3] = a;
      if (a > 0 && a < 250) {
        const blend = a / 255;
        data[i4] = Math.round(data[i4] * blend + 239 * (1 - blend));
        data[i4 + 1] = Math.round(data[i4 + 1] * blend + 236 * (1 - blend));
        data[i4 + 2] = Math.round(data[i4 + 2] * blend + 230 * (1 - blend));
      }
    }

    const cutoutCanvas = document.createElement("canvas");
    cutoutCanvas.width = width;
    cutoutCanvas.height = height;
    cutoutCanvas.getContext("2d").putImageData(imgData, 0, 0);

    const dominantHex =
      colorSamples > 0
        ? this.rgbToHex(sumR / colorSamples, sumG / colorSamples, sumB / colorSamples)
        : "#8E7962";

    return {
      cutoutSuccess: true,
      cutoutCanvas,
      bbox: {
        x: minX,
        y: minY,
        w: Math.max(1, maxX - minX + 1),
        h: Math.max(1, maxY - minY + 1)
      },
      dominantHex
    };
  },

  drawStudioBackdrop(ctx, w, h) {
    const wallGrad = ctx.createLinearGradient(0, 0, 0, h * 0.76);
    wallGrad.addColorStop(0, "#F4F1EB");
    wallGrad.addColorStop(1, "#EFECE6");
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, h);

    const floorY = Math.round(h * 0.73);
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, "#EDE9E0");
    floorGrad.addColorStop(0.35, "#E9E4DA");
    floorGrad.addColorStop(1, "#E2DDD1");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 40, w * 0.5, h * 0.48, w * 0.62);
    glow.addColorStop(0, "rgba(255, 253, 249, 0.34)");
    glow.addColorStop(1, "rgba(239, 236, 230, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  },

  async standardizeImage(srcUrl, options = {}) {
    const mode = options.mode || "cutout";
    const tolerance = Number(options.tolerance || 44);
    const flipHorizontal = Boolean(options.flipHorizontal);

    const img = await this.loadImageElement(srcUrl);

    const maxWorkDim = 720;
    const scaleWork = Math.min(1, maxWorkDim / Math.max(img.width, img.height));
    const workW = Math.max(1, Math.round(img.width * scaleWork));
    const workH = Math.max(1, Math.round(img.height * scaleWork));

    const workCanvas = document.createElement("canvas");
    workCanvas.width = workW;
    workCanvas.height = workH;
    const workCtx = workCanvas.getContext("2d");

    if (flipHorizontal) {
      workCtx.translate(workW, 0);
      workCtx.scale(-1, 1);
    }
    workCtx.drawImage(img, 0, 0, workW, workH);
    workCtx.setTransform(1, 0, 0, 1, 0, 0);

    const outCanvas = document.createElement("canvas");
    outCanvas.width = this.OUT_WIDTH;
    outCanvas.height = this.OUT_HEIGHT;
    const outCtx = outCanvas.getContext("2d");

    this.drawStudioBackdrop(outCtx, this.OUT_WIDTH, this.OUT_HEIGHT);

    let dominantHex = "#8E7962";

    if (mode === "cutout") {
      const seg = this.segmentShoeForeground(workCanvas, tolerance);
      dominantHex = seg.dominantHex || dominantHex;

      if (seg.cutoutSuccess && seg.cutoutCanvas) {
        const { x, y, w, h } = seg.bbox;
        const targetMaxW = this.OUT_WIDTH * 0.72;
        const targetMaxH = this.OUT_HEIGHT * 0.64;
        const fitScale = Math.min(targetMaxW / w, targetMaxH / h);

        const drawW = Math.round(w * fitScale);
        const drawH = Math.round(h * fitScale);
        const drawX = Math.round((this.OUT_WIDTH - drawW) / 2);
        const soleBaseY = Math.round(this.OUT_HEIGHT * 0.795);
        const drawY = Math.max(44, soleBaseY - drawH);

        outCtx.save();
        outCtx.translate(this.OUT_WIDTH / 2, soleBaseY - 6);
        outCtx.scale(1, 0.16);
        const shadowRadius = Math.max(140, drawW * 0.49);
        const shadowGrad = outCtx.createRadialGradient(0, 0, shadowRadius * 0.15, 0, 0, shadowRadius);
        shadowGrad.addColorStop(0, "rgba(28, 23, 18, 0.30)");
        shadowGrad.addColorStop(0.55, "rgba(28, 23, 18, 0.14)");
        shadowGrad.addColorStop(1, "rgba(28, 23, 18, 0)");
        outCtx.fillStyle = shadowGrad;
        outCtx.beginPath();
        outCtx.arc(0, 0, shadowRadius, 0, Math.PI * 2);
        outCtx.fill();
        outCtx.restore();

        outCtx.save();
        outCtx.filter = "blur(8px) brightness(0.18)";
        outCtx.globalAlpha = 0.22;
        outCtx.drawImage(
          seg.cutoutCanvas,
          x,
          y + Math.floor(h * 0.72),
          w,
          Math.ceil(h * 0.28),
          drawX + 4,
          soleBaseY - Math.round(drawH * 0.24) + 8,
          drawW - 8,
          Math.round(drawH * 0.24)
        );
        outCtx.restore();

        outCtx.save();
        outCtx.filter = "contrast(1.03) saturate(1.02)";
        outCtx.drawImage(seg.cutoutCanvas, x, y, w, h, drawX, drawY, drawW, drawH);
        outCtx.restore();

        return {
          dataUrl: outCanvas.toDataURL("image/jpeg", 0.88),
          dominantHex,
          usedCutout: true
        };
      }
    }

    const srcAspect = workW / workH;
    const dstAspect = this.OUT_WIDTH / this.OUT_HEIGHT;
    let sx = 0;
    let sy = 0;
    let sw = workW;
    let sh = workH;

    if (srcAspect > dstAspect) {
      sw = Math.round(workH * dstAspect);
      sx = Math.round((workW - sw) / 2);
    } else {
      sh = Math.round(workW / dstAspect);
      sy = Math.round((workH - sh) / 2);
    }

    outCtx.save();
    outCtx.filter = "contrast(1.04) sepia(0.06) brightness(1.02)";
    outCtx.drawImage(workCanvas, sx, sy, sw, sh, 0, 0, this.OUT_WIDTH, this.OUT_HEIGHT);
    outCtx.restore();

    const vig = outCtx.createRadialGradient(
      this.OUT_WIDTH * 0.5,
      this.OUT_HEIGHT * 0.52,
      this.OUT_WIDTH * 0.28,
      this.OUT_WIDTH * 0.5,
      this.OUT_HEIGHT * 0.5,
      this.OUT_WIDTH * 0.68
    );
    vig.addColorStop(0, "rgba(239, 236, 230, 0)");
    vig.addColorStop(1, "rgba(239, 236, 230, 0.55)");
    outCtx.fillStyle = vig;
    outCtx.fillRect(0, 0, this.OUT_WIDTH, this.OUT_HEIGHT);

    return {
      dataUrl: outCanvas.toDataURL("image/jpeg", 0.88),
      dominantHex,
      usedCutout: false
    };
  }
};

/* ==========================================================================
   Authenticated Server State & CSRF API Client
   ========================================================================== */

const adminState = {
  csrfToken: "",
  whatsAppPhone: "5511981264344",
  products: [],
  activeTab: "list",
  searchQuery: "",
  editingProductId: null,
  rawUploadedSrc: null,
  standardizedDataUrl: "assets/products/nb-9060-castor.png",
  studioMode: "cutout",
  studioTolerance: 44,
  flipHorizontal: false,
  extraColors: [],
  busySaving: false
};

async function adminApiFetch(url, method = "GET", bodyObj = null) {
  const headers = {
    Accept: "application/json"
  };

  if (method !== "GET" && method !== "HEAD") {
    headers["Content-Type"] = "application/json";
    headers["X-CSRF-Token"] = adminState.csrfToken;
  }

  const resp = await fetch(url, {
    method,
    credentials: "same-origin",
    headers,
    body: bodyObj !== null ? JSON.stringify(bodyObj) : undefined
  });

  if (resp.status === 401) {
    window.location.reload();
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || "Erro na operação administrativa.");
  }
  return data;
}

async function ensureServerImageUploaded(imgSrc) {
  const s = String(imgSrc || "").trim();
  if (/^data:image\/(jpeg|jpg|png);base64,/i.test(s)) {
    const uploaded = await adminApiFetch("/api/admin/upload-image", "POST", { dataUrl: s });
    return uploaded.imagePath;
  }
  const clean = s.replace(/^\/+/, "");
  if (/^assets\/(products|uploads)\/[a-zA-Z0-9._-]{1,80}\.(png|jpg|jpeg|webp)$/i.test(clean)) {
    return clean;
  }
  return "assets/products/nb-9060-castor.png";
}

async function persistProductsToServer(nextProducts, successMessage) {
  const data = await adminApiFetch("/api/admin/products", "PUT", { products: nextProducts });
  adminState.products = Array.isArray(data.products) ? data.products : nextProducts;
  renderAdminProductsList();
  if (successMessage) {
    showAdminToast(successMessage);
  }
}

function showAdminToast(message) {
  const toast = document.getElementById("admin-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(showAdminToast._timer);
  showAdminToast._timer = setTimeout(() => {
    toast.hidden = true;
  }, 3600);
}

function switchAdminTab(tabName) {
  adminState.activeTab = tabName;
  const listSec = document.getElementById("admin-section-list");
  const formSec = document.getElementById("admin-section-form");
  const secSec = document.getElementById("admin-section-security");
  const btnList = document.getElementById("tab-btn-list");
  const btnForm = document.getElementById("tab-btn-form");
  const btnSec = document.getElementById("tab-btn-security");

  if (listSec) listSec.hidden = tabName !== "list";
  if (formSec) formSec.hidden = tabName !== "form";
  if (secSec) secSec.hidden = tabName !== "security";

  if (btnList) btnList.setAttribute("aria-selected", tabName === "list" ? "true" : "false");
  if (btnForm) btnForm.setAttribute("aria-selected", tabName === "form" ? "true" : "false");
  if (btnSec) btnSec.setAttribute("aria-selected", tabName === "security" ? "true" : "false");

  if (tabName === "list") {
    renderAdminProductsList();
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function updateAdminStats() {
  const all = adminState.products;
  const activeCount = all.filter((p) => !p.hidden).length;
  const hiddenCount = all.filter((p) => p.hidden).length;

  const activeEl = document.getElementById("stat-active-count");
  const hiddenEl = document.getElementById("stat-hidden-count");
  const tabTotalEl = document.getElementById("tab-total-count");

  if (activeEl) activeEl.textContent = String(activeCount);
  if (hiddenEl) hiddenEl.textContent = String(hiddenCount);
  if (tabTotalEl) tabTotalEl.textContent = String(all.length);
}

function renderAdminProductsList() {
  updateAdminStats();
  const container = document.getElementById("admin-products-list");
  if (!container) return;

  const all = adminState.products;
  const q = adminState.searchQuery.toLowerCase().trim();

  const filtered = all.filter((p) => {
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.tier.toLowerCase().includes(q)
    );
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum calçado encontrado</h3>
        <p>Tente outro termo na busca ou cadastre um novo calçado.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map((p) => {
      const mainColor = (p.colors && p.colors[0]) || {
        name: "Padrão",
        image: "assets/products/nb-9060-castor.png"
      };
      const isHidden = Boolean(p.hidden);
      const cardVal = p.cardPrice !== null && p.cardPrice !== undefined ? p.cardPrice : "";

      return `
        <article class="admin-prod-row ${isHidden ? "is-paused" : ""}" data-admin-prod="${escapeHtml(p.id)}">
          <div class="admin-prod-thumb-wrap">
            <img src="${escapeHtml(resolvePreviewSrc(mainColor.image))}" alt="${escapeHtml(p.name)}" class="admin-prod-thumb" />
            <span class="admin-prod-status ${isHidden ? "status-paused" : "status-live"}">
              ${isHidden ? "PAUSADO" : "NO AR"}
            </span>
          </div>

          <div class="admin-prod-main">
            <div class="admin-prod-meta">${escapeHtml(p.brand)} · ${escapeHtml(p.tier)} · Tam. ${escapeHtml(p.sizeLabel)} (${escapeHtml(p.colors.length)} ${p.colors.length === 1 ? "cor" : "cores"})</div>
            <h3 class="admin-prod-title">${escapeHtml(p.name)}</h3>

            <div class="admin-quick-prices">
              <div class="admin-price-field">
                <label>Pix (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  class="field-input tabular"
                  data-quick-pix="${escapeHtml(p.id)}"
                  value="${escapeHtml(p.pixPrice)}"
                />
              </div>
              <div class="admin-price-field">
                <label>Cartão (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  class="field-input tabular"
                  data-quick-card="${escapeHtml(p.id)}"
                  value="${escapeHtml(cardVal)}"
                  placeholder="Taxa"
                />
              </div>
              <button
                type="button"
                class="btn-sharp-gold admin-save-price-btn"
                data-admin-action="save-quick-price"
                data-product-id="${escapeHtml(p.id)}"
              >
                SALVAR PREÇO
              </button>
            </div>
          </div>

          <div class="admin-prod-actions">
            <button
              type="button"
              class="btn-sharp-outline"
              data-admin-action="edit-product"
              data-product-id="${escapeHtml(p.id)}"
            >
              EDITAR COMPLETO
            </button>
            <button
              type="button"
              class="btn-sharp-outline"
              data-admin-action="toggle-pause"
              data-product-id="${escapeHtml(p.id)}"
            >
              ${isHidden ? "ATIVAR NO SITE" : "PAUSAR (ESGOTADO)"}
            </button>
            <button
              type="button"
              class="btn-sharp-outline admin-delete-btn"
              data-admin-action="delete-product"
              data-product-id="${escapeHtml(p.id)}"
            >
              EXCLUIR
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

/* ==========================================================================
   Create / Edit Form & Studio Photo Workflow
   ========================================================================== */

async function refreshStudioPreview() {
  if (!adminState.rawUploadedSrc) return;

  const statusText = document.getElementById("studio-status-text");
  const previewImg = document.getElementById("studio-result-preview");
  const badgeEl = document.getElementById("preview-badge-tier");

  if (statusText) statusText.textContent = "Padronizando foto no estúdio da loja...";

  try {
    const srcForCanvas = adminState.rawUploadedSrc.startsWith("data:")
      ? adminState.rawUploadedSrc
      : resolvePreviewSrc(adminState.rawUploadedSrc);

    const res = await StudioPhotoEngine.standardizeImage(srcForCanvas, {
      mode: adminState.studioMode,
      tolerance: adminState.studioTolerance,
      flipHorizontal: adminState.flipHorizontal
    });

    adminState.standardizedDataUrl = res.dataUrl;
    if (previewImg) previewImg.src = res.dataUrl;
    if (badgeEl) {
      badgeEl.textContent = res.usedCutout
        ? "✓ FUNDO ESTÚDIO AUTOMÁTICO"
        : "✓ ENQUADRADO NO ESTÚDIO";
    }
    if (statusText) {
      statusText.textContent =
        "Foto padronizada automaticamente (Fundo #EFECE6 · Sombra de estúdio · Proporção 4:3)";
    }

    const colorHexInput = document.getElementById("prod-color-hex");
    if (colorHexInput && res.dominantHex) {
      colorHexInput.value = sanitizeHex(res.dominantHex);
    }
  } catch (_) {
    if (statusText) statusText.textContent = "Não foi possível processar esta imagem.";
  }
}

function getSelectedFormSizes() {
  const btns = document.querySelectorAll("#admin-size-checkboxes .admin-size-toggle[aria-pressed='true']");
  const sizes = Array.from(btns)
    .map((b) => Number(b.getAttribute("data-size-num")))
    .sort((a, b) => a - b);
  return sizes.length > 0 ? sizes : [34, 35, 36, 37, 38, 39];
}

function setSelectedFormSizes(sizesArray) {
  const set = new Set((sizesArray || []).map(Number));
  document.querySelectorAll("#admin-size-checkboxes .admin-size-toggle").forEach((btn) => {
    const num = Number(btn.getAttribute("data-size-num"));
    btn.setAttribute("aria-pressed", set.has(num) ? "true" : "false");
  });
}

function renderExtraColorsEditor() {
  const container = document.getElementById("admin-extra-colors-list");
  if (!container) return;

  if (adminState.extraColors.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = adminState.extraColors
    .map(
      (col, idx) => `
      <div class="admin-extra-color-row" data-extra-idx="${idx}">
        <img src="${escapeHtml(resolvePreviewSrc(col.image))}" alt="${escapeHtml(col.name || "Cor extra")}" class="admin-extra-thumb" />
        <div class="admin-extra-fields">
          <div class="admin-color-input-row">
            <input
              type="color"
              class="admin-color-picker"
              data-extra-field="hex"
              data-extra-idx="${idx}"
              value="${sanitizeHex(col.hex || "#232220")}"
              aria-label="Cor da variante"
            />
            <input
              type="text"
              class="field-input"
              maxlength="60"
              data-extra-field="name"
              data-extra-idx="${idx}"
              value="${escapeHtml(col.name || "")}"
              placeholder="Nome da cor (Ex.: Preto / Branco)"
            />
          </div>
          <div class="admin-extra-actions">
            <label class="btn-sharp-outline admin-file-label">
              ENVIAR FOTO DESTA COR (PADRONIZA SOZINHO)
              <input type="file" accept="image/jpeg,image/png,image/webp" data-extra-file="${idx}" hidden />
            </label>
            <button
              type="button"
              class="btn-sharp-outline admin-delete-btn"
              data-extra-remove="${idx}"
            >
              REMOVER COR
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

function startNewProductForm() {
  adminState.editingProductId = null;
  adminState.rawUploadedSrc = null;
  adminState.standardizedDataUrl = "assets/products/nb-9060-castor.png";
  adminState.studioMode = "cutout";
  adminState.studioTolerance = 44;
  adminState.flipHorizontal = false;
  adminState.extraColors = [];

  document.getElementById("form-heading-title").textContent = "CADASTRAR NOVO CALÇADO";
  document.getElementById("btn-submit-product").textContent = "SALVAR NOVO CALÇADO NO CATÁLOGO";
  document.getElementById("edit-product-id").value = "";
  document.getElementById("prod-name").value = "";
  document.getElementById("prod-brand").value = "New Balance";
  document.getElementById("prod-category").value = "Tênis";
  document.getElementById("prod-tier").value = "Importado · 1ª Linha";
  document.getElementById("prod-color-name").value = "";
  document.getElementById("prod-color-hex").value = "#A58E74";
  document.getElementById("prod-desc").value = "";
  document.getElementById("prod-pix-price").value = "";
  document.getElementById("prod-card-price").value = "";
  document.getElementById("prod-installments").value = "";
  document.getElementById("studio-result-preview").src = resolvePreviewSrc(adminState.standardizedDataUrl);
  document.getElementById("preview-badge-tier").textContent = "PADRÃO ESTÚDIO AUTOMÁTICO";
  document.getElementById("studio-tolerance-range").value = "44";
  document.getElementById("studio-tolerance-val").textContent = "Automático (44)";

  setSelectedFormSizes([34, 35, 36, 37, 38, 39]);
  renderExtraColorsEditor();
  switchAdminTab("form");
}

function startEditProductForm(productId) {
  const product = adminState.products.find((p) => p.id === productId);
  if (!product) return;

  adminState.editingProductId = product.id;
  const mainColor = (product.colors && product.colors[0]) || {
    name: "Padrão",
    hex: "#A58E74",
    image: "assets/products/nb-9060-castor.png"
  };

  adminState.rawUploadedSrc = mainColor.image;
  adminState.standardizedDataUrl = mainColor.image;
  adminState.flipHorizontal = false;
  adminState.extraColors = (product.colors || []).slice(1).map((c) => ({ ...c }));

  document.getElementById("form-heading-title").textContent = `EDITAR: ${product.name.toUpperCase()}`;
  document.getElementById("btn-submit-product").textContent = "SALVAR ALTERAÇÕES DO CALÇADO";
  document.getElementById("edit-product-id").value = product.id;
  document.getElementById("prod-name").value = product.name;
  document.getElementById("prod-brand").value = product.brand;
  document.getElementById("prod-category").value = product.category || "Tênis";
  document.getElementById("prod-tier").value = product.tier || "Importado · 1ª Linha";
  document.getElementById("prod-color-name").value = mainColor.name;
  document.getElementById("prod-color-hex").value = sanitizeHex(mainColor.hex || "#A58E74");
  document.getElementById("prod-desc").value = product.description || "";
  document.getElementById("prod-pix-price").value = product.pixPrice;
  document.getElementById("prod-card-price").value =
    product.cardPrice !== null && product.cardPrice !== undefined ? product.cardPrice : "";
  document.getElementById("prod-installments").value = product.installments || "";
  document.getElementById("studio-result-preview").src = resolvePreviewSrc(mainColor.image);
  document.getElementById("preview-badge-tier").textContent = product.tier;

  setSelectedFormSizes(product.sizes || [34, 35, 36, 37, 38, 39]);
  renderExtraColorsEditor();
  switchAdminTab("form");
}

function setupAdminEvents() {
  // Secure Logout
  const logoutBtn = document.getElementById("btn-admin-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await adminApiFetch("/api/auth/logout", "POST", {});
      } catch (_) {
        // Proceed to reload regardless
      }
      window.location.reload();
    });
  }

  // Save WhatsApp Phone
  const waInput = document.getElementById("admin-wa-input");
  const saveWaBtn = document.getElementById("admin-save-wa-btn");
  if (saveWaBtn && waInput) {
    saveWaBtn.addEventListener("click", async () => {
      try {
        const res = await adminApiFetch("/api/admin/settings", "PUT", {
          whatsAppPhone: waInput.value
        });
        adminState.whatsAppPhone = res.whatsAppPhone;
        waInput.value = res.whatsAppPhone;
        showAdminToast(`WhatsApp da loja atualizado com segurança para +${res.whatsAppPhone}!`);
      } catch (err) {
        showAdminToast(err.message);
      }
    });
  }

  // Tabs
  document.querySelectorAll("[data-admin-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-admin-tab");
      if (targetTab === "form" && !adminState.editingProductId) {
        startNewProductForm();
      } else {
        switchAdminTab(targetTab);
      }
    });
  });

  const btnGoNew = document.getElementById("btn-go-new-product");
  if (btnGoNew) btnGoNew.addEventListener("click", startNewProductForm);

  const btnCancelEdit = document.getElementById("btn-cancel-edit");
  if (btnCancelEdit) btnCancelEdit.addEventListener("click", () => switchAdminTab("list"));

  // Search in admin list
  const searchInput = document.getElementById("admin-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      adminState.searchQuery = e.target.value;
      renderAdminProductsList();
    });
  }

  // Product list actions (Quick price save, Edit, Pause, Delete)
  const listEl = document.getElementById("admin-products-list");
  if (listEl) {
    listEl.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-admin-action]");
      if (!btn || adminState.busySaving) return;
      const action = btn.getAttribute("data-admin-action");
      const productId = btn.getAttribute("data-product-id");
      const all = JSON.parse(JSON.stringify(adminState.products));
      const idx = all.findIndex((p) => p.id === productId);
      if (idx === -1) return;

      if (action === "edit-product") {
        startEditProductForm(productId);
        return;
      }

      adminState.busySaving = true;
      try {
        if (action === "save-quick-price") {
          const pixInput = listEl.querySelector(`[data-quick-pix="${CSS.escape(productId)}"]`);
          const cardInput = listEl.querySelector(`[data-quick-card="${CSS.escape(productId)}"]`);
          const newPix = parseFloat(pixInput ? pixInput.value : "");
          const newCard =
            cardInput && cardInput.value.trim() !== "" ? parseFloat(cardInput.value) : null;

          if (Number.isNaN(newPix) || newPix <= 0) {
            showAdminToast("Informe um valor no Pix válido.");
            return;
          }

          all[idx].pixPrice = newPix;
          all[idx].cardPrice = !Number.isNaN(newCard) && newCard > 0 ? newCard : null;
          if (all[idx].cardPrice) {
            const par3 = (all[idx].cardPrice / 3).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
            all[idx].installments = `em até 3x de R$ ${par3}`;
          } else {
            all[idx].installments = "Consultar taxa da maquininha";
          }

          await persistProductsToServer(all, `Preço de "${all[idx].name}" salvo no site!`);
        } else if (action === "toggle-pause") {
          all[idx].hidden = !all[idx].hidden;
          await persistProductsToServer(
            all,
            all[idx].hidden
              ? `"${all[idx].name}" foi pausado (oculto para clientes).`
              : `"${all[idx].name}" voltou para o ar na vitrine!`
          );
        } else if (action === "delete-product") {
          const removedName = all[idx].name;
          all.splice(idx, 1);
          await persistProductsToServer(all, `"${removedName}" foi removido do catálogo.`);
        }
      } catch (err) {
        showAdminToast(err.message);
      } finally {
        adminState.busySaving = false;
      }
    });
  }

  // Studio Photo File Upload
  const fileInput = document.getElementById("studio-file-input");
  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (file.size > 12 * 1024 * 1024) {
        showAdminToast("Escolha uma foto com até 12 MB.");
        return;
      }
      const rawDataUrl = await StudioPhotoEngine.readFileAsDataURL(file);
      adminState.rawUploadedSrc = rawDataUrl;
      await refreshStudioPreview();
      showAdminToast("Foto padronizada automaticamente no estúdio da loja!");
    });
  }

  // Studio Mode Buttons
  const btnCutout = document.getElementById("btn-mode-cutout");
  const btnFrame = document.getElementById("btn-mode-frame");
  if (btnCutout && btnFrame) {
    btnCutout.addEventListener("click", () => {
      adminState.studioMode = "cutout";
      btnCutout.setAttribute("aria-pressed", "true");
      btnFrame.setAttribute("aria-pressed", "false");
      refreshStudioPreview();
    });
    btnFrame.addEventListener("click", () => {
      adminState.studioMode = "frame";
      btnFrame.setAttribute("aria-pressed", "true");
      btnCutout.setAttribute("aria-pressed", "false");
      refreshStudioPreview();
    });
  }

  const btnFlip = document.getElementById("btn-flip-horizontal");
  if (btnFlip) {
    btnFlip.addEventListener("click", () => {
      adminState.flipHorizontal = !adminState.flipHorizontal;
      refreshStudioPreview();
    });
  }

  const tolRange = document.getElementById("studio-tolerance-range");
  const tolVal = document.getElementById("studio-tolerance-val");
  if (tolRange) {
    tolRange.addEventListener("input", (e) => {
      adminState.studioTolerance = Number(e.target.value);
      if (tolVal) tolVal.textContent = `Nível ${adminState.studioTolerance}`;
      refreshStudioPreview();
    });
  }

  // Auto-calculate 3x installment text when Card Price changes
  const cardPriceInput = document.getElementById("prod-card-price");
  const installmentsInput = document.getElementById("prod-installments");
  if (cardPriceInput && installmentsInput) {
    cardPriceInput.addEventListener("input", () => {
      const val = parseFloat(cardPriceInput.value);
      if (!Number.isNaN(val) && val > 0) {
        const p3 = (val / 3).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        installmentsInput.value = `em até 3x de R$ ${p3}`;
      } else {
        installmentsInput.value = "Consultar taxa da maquininha";
      }
    });
  }

  // Size Grid Toggles & Presets
  const sizeGrid = document.getElementById("admin-size-checkboxes");
  if (sizeGrid) {
    sizeGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".admin-size-toggle");
      if (!btn) return;
      const isPressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", isPressed ? "false" : "true");
    });
  }

  document.querySelectorAll("[data-size-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-size-preset");
      if (preset === "fem") setSelectedFormSizes([34, 35, 36, 37, 38, 39]);
      if (preset === "masc") setSelectedFormSizes([38, 39, 40, 41, 42, 43]);
      if (preset === "all") setSelectedFormSizes([34, 35, 36, 37, 38, 39, 40, 41, 42, 43]);
    });
  });

  // Extra Colors
  const btnAddColor = document.getElementById("btn-add-extra-color");
  if (btnAddColor) {
    btnAddColor.addEventListener("click", () => {
      if (adminState.extraColors.length >= 11) {
        showAdminToast("Limite máximo de 12 cores por modelo atingido.");
        return;
      }
      adminState.extraColors.push({
        name: "",
        hex: "#232220",
        image: adminState.standardizedDataUrl
      });
      renderExtraColorsEditor();
    });
  }

  const extraColorsList = document.getElementById("admin-extra-colors-list");
  if (extraColorsList) {
    extraColorsList.addEventListener("input", (e) => {
      const field = e.target.getAttribute("data-extra-field");
      const idx = Number(e.target.getAttribute("data-extra-idx"));
      if (field && adminState.extraColors[idx]) {
        adminState.extraColors[idx][field] = e.target.value;
      }
    });

    extraColorsList.addEventListener("click", (e) => {
      const rmBtn = e.target.closest("[data-extra-remove]");
      if (!rmBtn) return;
      const idx = Number(rmBtn.getAttribute("data-extra-remove"));
      adminState.extraColors.splice(idx, 1);
      renderExtraColorsEditor();
    });

    extraColorsList.addEventListener("change", async (e) => {
      const idxAttr = e.target.getAttribute("data-extra-file");
      if (idxAttr === null) return;
      const idx = Number(idxAttr);
      const file = e.target.files && e.target.files[0];
      if (!file || !adminState.extraColors[idx]) return;

      const rawUrl = await StudioPhotoEngine.readFileAsDataURL(file);
      const std = await StudioPhotoEngine.standardizeImage(rawUrl, {
        mode: "cutout",
        tolerance: adminState.studioTolerance
      });
      adminState.extraColors[idx].image = std.dataUrl;
      if (std.dominantHex) {
        adminState.extraColors[idx].hex = sanitizeHex(std.dominantHex);
      }
      renderExtraColorsEditor();
      showAdminToast("Foto da cor extra padronizada no estúdio!");
    });
  }

  // Submit Form (Create or Update Product on Server)
  const form = document.getElementById("admin-product-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (adminState.busySaving) return;

      const name = document.getElementById("prod-name").value.trim();
      const brand = document.getElementById("prod-brand").value.trim() || "Francinez";
      const category = document.getElementById("prod-category").value;
      const tier = document.getElementById("prod-tier").value;
      const colorName = document.getElementById("prod-color-name").value.trim() || "Cor Padrão";
      const colorHex = sanitizeHex(document.getElementById("prod-color-hex").value);
      const pixPrice = parseFloat(document.getElementById("prod-pix-price").value);
      const rawCard = document.getElementById("prod-card-price").value.trim();
      const cardPrice = rawCard !== "" ? parseFloat(rawCard) : null;

      if (!name || Number.isNaN(pixPrice) || pixPrice <= 0) {
        showAdminToast("Preencha o nome do calçado e o valor no Pix.");
        return;
      }

      const submitBtn = document.getElementById("btn-submit-product");
      const originalBtnLabel = submitBtn ? submitBtn.textContent : "";
      adminState.busySaving = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "ENVIANDO FOTO E SALVANDO NO SERVIDOR...";
      }

      try {
        const sizes = getSelectedFormSizes();
        const sizeLabel = `${sizes[0]}–${sizes[sizes.length - 1]}`;

        let installments = document.getElementById("prod-installments").value.trim();
        if (!installments) {
          if (cardPrice && cardPrice > 0) {
            const p3 = (cardPrice / 3).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
            installments = `em até 3x de R$ ${p3}`;
          } else {
            installments = "Consultar taxa da maquininha";
          }
        }

        const description =
          document.getElementById("prod-desc").value.trim() ||
          `Calçado ${tier.toLowerCase()} a pronta entrega com ótimo acabamento e conforto.`;

        // Upload main studio photo if new base64 image
        const mainServerImage = await ensureServerImageUploaded(adminState.standardizedDataUrl);

        // Upload any extra color photos
        const extraColorsFiltered = adminState.extraColors.filter(
          (c) => (c.name && c.name.trim() !== "") || c.image
        );
        const uploadedExtraColors = [];
        for (let i = 0; i < extraColorsFiltered.length; i++) {
          const ec = extraColorsFiltered[i];
          const ecImgPath = await ensureServerImageUploaded(ec.image || mainServerImage);
          uploadedExtraColors.push({
            name: (ec.name && ec.name.trim()) || `Opção ${i + 2}`,
            hex: sanitizeHex(ec.hex || "#232220"),
            image: ecImgPath,
            sizes: [...sizes]
          });
        }

        const colors = [
          {
            name: colorName,
            hex: colorHex,
            image: mainServerImage,
            sizes: [...sizes]
          },
          ...uploadedExtraColors
        ];

        const all = JSON.parse(JSON.stringify(adminState.products));

        if (adminState.editingProductId) {
          const idx = all.findIndex((p) => p.id === adminState.editingProductId);
          if (idx !== -1) {
            all[idx] = {
              ...all[idx],
              name,
              brand,
              category,
              tier,
              description,
              pixPrice,
              cardPrice: cardPrice && !Number.isNaN(cardPrice) ? cardPrice : null,
              installments,
              sizes,
              sizeLabel,
              colors
            };
          }
          await persistProductsToServer(all, `"${name}" atualizado com sucesso no catálogo!`);
        } else {
          const slug =
            name
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "")
              .slice(0, 48) +
            "-" +
            Date.now().toString().slice(-4);

          const newProduct = {
            id: slug,
            name,
            brand,
            category,
            tier,
            description,
            pixPrice,
            cardPrice: cardPrice && !Number.isNaN(cardPrice) ? cardPrice : null,
            installments,
            sizes,
            sizeLabel,
            colors,
            hidden: false
          };

          all.unshift(newProduct);
          await persistProductsToServer(
            all,
            `"${name}" publicado no topo da vitrine com foto padronizada!`
          );
        }

        adminState.editingProductId = null;
        switchAdminTab("list");
      } catch (err) {
        showAdminToast(err.message);
      } finally {
        adminState.busySaving = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnLabel;
        }
      }
    });
  }

  // Change Password Form
  const pwForm = document.getElementById("admin-password-form");
  if (pwForm) {
    pwForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const curEl = document.getElementById("pw-current");
      const newEl = document.getElementById("pw-new");
      const cfmEl = document.getElementById("pw-confirm");
      const btn = document.getElementById("btn-change-password");

      const currentPassword = curEl ? curEl.value : "";
      const newPassword = newEl ? newEl.value : "";
      const confirmPassword = cfmEl ? cfmEl.value : "";

      if (!currentPassword || !newPassword) {
        showAdminToast("Preencha a senha atual e a nova senha.");
        return;
      }
      if (newPassword.length < 8) {
        showAdminToast("A nova senha deve ter pelo menos 8 caracteres.");
        return;
      }
      if (newPassword !== confirmPassword) {
        showAdminToast("A confirmação da nova senha não confere.");
        return;
      }

      if (btn) btn.disabled = true;
      try {
        const res = await adminApiFetch("/api/admin/password", "POST", {
          currentPassword,
          newPassword
        });
        if (res.csrfToken) {
          adminState.csrfToken = res.csrfToken;
        }
        if (curEl) curEl.value = "";
        if (newEl) newEl.value = "";
        if (cfmEl) cfmEl.value = "";
        showAdminToast("Senha do painel alterada com sucesso!");
      } catch (err) {
        showAdminToast(err.message);
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  }

  // Backup Export / Import
  const btnExport = document.getElementById("btn-export-json");
  if (btnExport) {
    btnExport.addEventListener("click", () => {
      const dataStr = JSON.stringify(adminState.products, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "backup-catalogo-francinez.json";
      a.click();
      URL.revokeObjectURL(url);
      showAdminToast("Backup do catálogo baixado!");
    });
  }

  const inputImport = document.getElementById("input-import-json");
  if (inputImport) {
    inputImport.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          const list = Array.isArray(parsed)
            ? parsed
            : parsed && Array.isArray(parsed.products)
            ? parsed.products
            : null;
          if (!list || list.length === 0) {
            showAdminToast("Arquivo de backup inválido.");
            return;
          }
          await persistProductsToServer(list, `Backup importado com ${list.length} calçados!`);
          switchAdminTab("list");
        } catch (err) {
          showAdminToast(err.message || "Falha ao importar backup.");
        }
      };
      reader.readAsText(file);
    });
  }
}

async function initAuthenticatedAdmin() {
  try {
    const data = await adminApiFetch("/api/admin/catalog", "GET");
    adminState.csrfToken = data.csrfToken || "";
    adminState.whatsAppPhone = data.whatsAppPhone || "5511981264344";
    adminState.products = Array.isArray(data.products) ? data.products : [];

    const waInput = document.getElementById("admin-wa-input");
    if (waInput) {
      waInput.value = adminState.whatsAppPhone;
    }

    renderAdminProductsList();
  } catch (err) {
    showAdminToast(err.message || "Falha ao carregar dados do servidor.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupAdminEvents();
  initAuthenticatedAdmin();
});
