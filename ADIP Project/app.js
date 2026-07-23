const BLOCK = 8;
const SQRT2 = Math.sqrt(2);
const COS = Array.from({ length: BLOCK }, (_, u) =>
  Array.from({ length: BLOCK }, (_, x) => Math.cos(((2 * x + 1) * u * Math.PI) / 16))
);

const state = {
  coverFile: null,
  watermarkFile: null,
};

const els = {
  coverInput: document.getElementById("coverInput"),
  watermarkInput: document.getElementById("watermarkInput"),
  levelInput: document.getElementById("levelInput"),
  alphaInput: document.getElementById("alphaInput"),
  thresholdInput: document.getElementById("thresholdInput"),
  maxSideInput: document.getElementById("maxSideInput"),
  dctYInput: document.getElementById("dctYInput"),
  dctXInput: document.getElementById("dctXInput"),
  levelValue: document.getElementById("levelValue"),
  alphaValue: document.getElementById("alphaValue"),
  thresholdValue: document.getElementById("thresholdValue"),
  maxSideValue: document.getElementById("maxSideValue"),
  runButton: document.getElementById("runButton"),
  clearButton: document.getElementById("clearButton"),
  status: document.getElementById("status"),
  statsGrid: document.getElementById("statsGrid"),
  subbandsGrid: document.getElementById("subbandsGrid"),
  downloads: {
    watermarked: document.getElementById("downloadWatermarked"),
    extracted: document.getElementById("downloadExtracted"),
    bits: document.getElementById("downloadBits"),
  },
  canvases: {
    cover: document.getElementById("coverCanvas"),
    watermark: document.getElementById("watermarkCanvas"),
    binary: document.getElementById("binaryCanvas"),
    watermarked: document.getElementById("watermarkedCanvas"),
    extracted: document.getElementById("extractedCanvas"),
  },
};

function updateOutputs() {
  els.levelValue.textContent = els.levelInput.value;
  els.alphaValue.textContent = els.alphaInput.value;
  els.thresholdValue.textContent = els.thresholdInput.value;
  els.maxSideValue.textContent = `${els.maxSideInput.value} px`;
}

["levelInput", "alphaInput", "thresholdInput", "maxSideInput"].forEach((id) => {
  els[id].addEventListener("input", updateOutputs);
});
updateOutputs();

els.coverInput.addEventListener("change", (event) => {
  state.coverFile = event.target.files[0] || null;
});

els.watermarkInput.addEventListener("change", (event) => {
  state.watermarkFile = event.target.files[0] || null;
});

els.runButton.addEventListener("click", async () => {
  if (!state.coverFile || !state.watermarkFile) {
    setStatus("Please choose both a cover image and a watermark image.", true);
    return;
  }

  try {
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const level = Number(els.levelInput.value);
    const alpha = Number(els.alphaInput.value);
    const threshold = Number(els.thresholdInput.value);
    const maxSide = Number(els.maxSideInput.value);
    const dctY = clamp(Number(els.dctYInput.value), 1, 6);
    const dctX = clamp(Number(els.dctXInput.value), 1, 6);

    const cover = await fileToGray(state.coverFile, maxSide);
    const watermark = await fileToGray(state.watermarkFile, maxSide);
    const padded = padForEmbedding(cover, level);
    const coeffs = haarDwt2Levels(padded.data, padded.width, padded.height, level);
    const highest = coeffs.details[level - 1];
    const bitWidth = Math.floor(highest.width / BLOCK);
    const bitHeight = Math.floor(highest.height / BLOCK);
    const wmResized = resizeGray(watermark, bitWidth, bitHeight);
    const wmBits = binarize(wmResized, threshold);
    const embeddedCoeffs = cloneCoeffs(coeffs);

    embedBitsInHL(embeddedCoeffs.details[level - 1].h, highest.width, highest.height, wmBits, bitWidth, bitHeight, alpha, dctY, dctX);
    const reconstructed = haarIdwt2Levels(embeddedCoeffs, level);
    const clipped = reconstructed.map((value) => clamp(Math.round(value), 0, 255));
    const cropped = cropGray({ data: clipped, width: padded.width, height: padded.height }, cover.width, cover.height);
    const extracted = extractBitsFromHL(clipped, padded.width, padded.height, level, bitWidth, bitHeight, dctY, dctX);
    const extractionAccuracy = watermarkAccuracy(wmBits, extracted.bits);

    drawGray(els.canvases.cover, cover);
    drawGray(els.canvases.watermark, wmResized);
    drawGray(els.canvases.binary, bitsToGray(wmBits, bitWidth, bitHeight));
    drawGray(els.canvases.watermarked, cropped);
    drawGray(els.canvases.extracted, extracted.image);
    renderStats(makeStats(cover, cropped, padded, bitWidth, bitHeight, wmBits, extracted.bits, extractionAccuracy, level, alpha, threshold, dctY, dctX));
    renderSubbands(coeffs, level);
    wireDownload(els.downloads.watermarked, els.canvases.watermarked, "watermarked_image.png");
    wireDownload(els.downloads.extracted, els.canvases.extracted, "extracted_watermark.png");
    wireDownload(els.downloads.bits, els.canvases.binary, "embedded_watermark_bits.png");
    setStatus("Done. The result is computed in your browser.");
  } catch (error) {
    console.error(error);
    setStatus(error.message || "Something went wrong while processing the images.", true);
  } finally {
    setBusy(false);
  }
});

els.clearButton.addEventListener("click", () => {
  Object.values(els.canvases).forEach(clearCanvas);
  els.statsGrid.innerHTML = "";
  els.subbandsGrid.innerHTML = "";
  Object.values(els.downloads).forEach((link) => {
    link.removeAttribute("href");
    link.removeAttribute("download");
    link.setAttribute("aria-disabled", "true");
  });
  els.coverInput.value = "";
  els.watermarkInput.value = "";
  state.coverFile = null;
  state.watermarkFile = null;
  setStatus("Choose a cover image and watermark image.");
});

function setBusy(isBusy) {
  els.runButton.disabled = isBusy;
  els.clearButton.disabled = isBusy;
  if (isBusy) setStatus("Processing...");
}

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.style.color = isError ? "#c44536" : "";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

async function fileToGray(file, maxSide) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, width, height);
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const data = new Float32Array(width * height);
  for (let i = 0, p = 0; i < rgba.length; i += 4, p += 1) {
    data[p] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return { data, width, height };
}

function padForEmbedding(image, level) {
  const multiple = (2 ** level) * BLOCK;
  const width = Math.ceil(image.width / multiple) * multiple;
  const height = Math.ceil(image.height / multiple) * multiple;
  const data = new Float32Array(width * height);
  for (let y = 0; y < image.height; y += 1) {
    data.set(image.data.subarray(y * image.width, y * image.width + image.width), y * width);
  }
  return { data, width, height, multiple };
}

function resizeGray(image, width, height) {
  const data = new Float32Array(width * height);
  for (let y = 0; y < height; y += 1) {
    const sy = Math.min(image.height - 1, Math.floor((y + 0.5) * image.height / height));
    for (let x = 0; x < width; x += 1) {
      const sx = Math.min(image.width - 1, Math.floor((x + 0.5) * image.width / width));
      data[y * width + x] = image.data[sy * image.width + sx];
    }
  }
  return { data, width, height };
}

function binarize(image, threshold) {
  const bits = new Uint8Array(image.width * image.height);
  for (let i = 0; i < bits.length; i += 1) bits[i] = image.data[i] > threshold ? 1 : 0;
  return bits;
}

function bitsToGray(bits, width, height) {
  const data = new Uint8Array(width * height);
  for (let i = 0; i < bits.length; i += 1) data[i] = bits[i] * 255;
  return { data, width, height };
}

function haarDwt2Levels(data, width, height, levels) {
  let current = new Float32Array(data);
  let currentWidth = width;
  let currentHeight = height;
  const details = [];

  for (let i = 0; i < levels; i += 1) {
    const nextWidth = currentWidth / 2;
    const nextHeight = currentHeight / 2;
    const loRows = new Float32Array(nextWidth * currentHeight);
    const hiRows = new Float32Array(nextWidth * currentHeight);

    for (let y = 0; y < currentHeight; y += 1) {
      for (let x = 0; x < nextWidth; x += 1) {
        const a = current[y * currentWidth + x * 2];
        const b = current[y * currentWidth + x * 2 + 1];
        loRows[y * nextWidth + x] = (a + b) / SQRT2;
        hiRows[y * nextWidth + x] = (a - b) / SQRT2;
      }
    }

    const approx = new Float32Array(nextWidth * nextHeight);
    const h = new Float32Array(nextWidth * nextHeight);
    const v = new Float32Array(nextWidth * nextHeight);
    const d = new Float32Array(nextWidth * nextHeight);

    for (let y = 0; y < nextHeight; y += 1) {
      for (let x = 0; x < nextWidth; x += 1) {
        const loA = loRows[(y * 2) * nextWidth + x];
        const loB = loRows[(y * 2 + 1) * nextWidth + x];
        const hiA = hiRows[(y * 2) * nextWidth + x];
        const hiB = hiRows[(y * 2 + 1) * nextWidth + x];
        const idx = y * nextWidth + x;
        approx[idx] = (loA + loB) / SQRT2;
        h[idx] = (loA - loB) / SQRT2;
        v[idx] = (hiA + hiB) / SQRT2;
        d[idx] = (hiA - hiB) / SQRT2;
      }
    }

    details.push({ h, v, d, width: nextWidth, height: nextHeight });
    current = approx;
    currentWidth = nextWidth;
    currentHeight = nextHeight;
  }

  return { approx: current, width: currentWidth, height: currentHeight, details };
}

function haarIdwt2Levels(coeffs, levels) {
  let current = new Float32Array(coeffs.approx);
  let currentWidth = coeffs.width;
  let currentHeight = coeffs.height;

  for (let level = levels - 1; level >= 0; level -= 1) {
    const detail = coeffs.details[level];
    const outWidth = currentWidth * 2;
    const outHeight = currentHeight * 2;
    const loRows = new Float32Array(currentWidth * outHeight);
    const hiRows = new Float32Array(currentWidth * outHeight);

    for (let y = 0; y < currentHeight; y += 1) {
      for (let x = 0; x < currentWidth; x += 1) {
        const idx = y * currentWidth + x;
        loRows[(y * 2) * currentWidth + x] = (current[idx] + detail.h[idx]) / SQRT2;
        loRows[(y * 2 + 1) * currentWidth + x] = (current[idx] - detail.h[idx]) / SQRT2;
        hiRows[(y * 2) * currentWidth + x] = (detail.v[idx] + detail.d[idx]) / SQRT2;
        hiRows[(y * 2 + 1) * currentWidth + x] = (detail.v[idx] - detail.d[idx]) / SQRT2;
      }
    }

    const out = new Float32Array(outWidth * outHeight);
    for (let y = 0; y < outHeight; y += 1) {
      for (let x = 0; x < currentWidth; x += 1) {
        const lo = loRows[y * currentWidth + x];
        const hi = hiRows[y * currentWidth + x];
        out[y * outWidth + x * 2] = (lo + hi) / SQRT2;
        out[y * outWidth + x * 2 + 1] = (lo - hi) / SQRT2;
      }
    }

    current = out;
    currentWidth = outWidth;
    currentHeight = outHeight;
  }
  return current;
}

function cloneCoeffs(coeffs) {
  return {
    approx: new Float32Array(coeffs.approx),
    width: coeffs.width,
    height: coeffs.height,
    details: coeffs.details.map((detail) => ({
      h: new Float32Array(detail.h),
      v: new Float32Array(detail.v),
      d: new Float32Array(detail.d),
      width: detail.width,
      height: detail.height,
    })),
  };
}

function dct8(block) {
  const out = new Float32Array(64);
  for (let u = 0; u < BLOCK; u += 1) {
    const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
    for (let v = 0; v < BLOCK; v += 1) {
      const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
      let sum = 0;
      for (let x = 0; x < BLOCK; x += 1) {
        for (let y = 0; y < BLOCK; y += 1) {
          sum += block[x * BLOCK + y] * COS[u][x] * COS[v][y];
        }
      }
      out[u * BLOCK + v] = 0.25 * cu * cv * sum;
    }
  }
  return out;
}

function idct8(block) {
  const out = new Float32Array(64);
  for (let x = 0; x < BLOCK; x += 1) {
    for (let y = 0; y < BLOCK; y += 1) {
      let sum = 0;
      for (let u = 0; u < BLOCK; u += 1) {
        const cu = u === 0 ? 1 / Math.sqrt(2) : 1;
        for (let v = 0; v < BLOCK; v += 1) {
          const cv = v === 0 ? 1 / Math.sqrt(2) : 1;
          sum += cu * cv * block[u * BLOCK + v] * COS[u][x] * COS[v][y];
        }
      }
      out[x * BLOCK + y] = 0.25 * sum;
    }
  }
  return out;
}

function embedBitsInHL(hl, width, height, bits, bitWidth, bitHeight, alpha, dctY, dctX) {
  for (let by = 0; by < bitHeight; by += 1) {
    for (let bx = 0; bx < bitWidth; bx += 1) {
      const block = readBlock(hl, width, by * BLOCK, bx * BLOCK);
      const freq = dct8(block);
      freq[dctY * BLOCK + dctX] = bits[by * bitWidth + bx] ? alpha : -alpha;
      writeBlock(hl, width, by * BLOCK, bx * BLOCK, idct8(freq));
    }
  }
}

function extractBitsFromHL(data, width, height, level, bitWidth, bitHeight, dctY, dctX) {
  const coeffs = haarDwt2Levels(data, width, height, level);
  const hl = coeffs.details[level - 1].h;
  const hlWidth = coeffs.details[level - 1].width;
  const bits = new Uint8Array(bitWidth * bitHeight);
  for (let by = 0; by < bitHeight; by += 1) {
    for (let bx = 0; bx < bitWidth; bx += 1) {
      const freq = dct8(readBlock(hl, hlWidth, by * BLOCK, bx * BLOCK));
      bits[by * bitWidth + bx] = freq[dctY * BLOCK + dctX] >= 0 ? 1 : 0;
    }
  }
  return {
    bits,
    image: bitsToGray(bits, bitWidth, bitHeight),
  };
}

function readBlock(data, width, y0, x0) {
  const block = new Float32Array(64);
  for (let y = 0; y < BLOCK; y += 1) {
    for (let x = 0; x < BLOCK; x += 1) {
      block[y * BLOCK + x] = data[(y0 + y) * width + x0 + x];
    }
  }
  return block;
}

function writeBlock(data, width, y0, x0, block) {
  for (let y = 0; y < BLOCK; y += 1) {
    for (let x = 0; x < BLOCK; x += 1) {
      data[(y0 + y) * width + x0 + x] = block[y * BLOCK + x];
    }
  }
}

function cropGray(image, width, height) {
  const data = new Uint8Array(width * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      data[y * width + x] = image.data[y * image.width + x];
    }
  }
  return { data, width, height };
}

function makeStats(original, watermarked, padded, bitWidth, bitHeight, embeddedBits, extractedBits, extractionAccuracy, level, alpha, threshold, dctY, dctX) {
  let mse = 0;
  let changed = 0;
  let origMean = 0;
  let wmMean = 0;
  const total = original.width * original.height;
  for (let i = 0; i < total; i += 1) {
    const a = original.data[i];
    const b = watermarked.data[i];
    const diff = a - b;
    mse += diff * diff;
    origMean += a;
    wmMean += b;
    if (Math.abs(diff) >= 1) changed += 1;
  }
  mse /= total;
  origMean /= total;
  wmMean /= total;

  let origVar = 0;
  let wmVar = 0;
  let cov = 0;
  for (let i = 0; i < total; i += 1) {
    const ao = original.data[i] - origMean;
    const bw = watermarked.data[i] - wmMean;
    origVar += ao * ao;
    wmVar += bw * bw;
    cov += ao * bw;
  }
  origVar /= total - 1 || 1;
  wmVar /= total - 1 || 1;
  cov /= total - 1 || 1;
  const c1 = (0.01 * 255) ** 2;
  const c2 = (0.03 * 255) ** 2;
  const ssim = ((2 * origMean * wmMean + c1) * (2 * cov + c2)) /
    ((origMean ** 2 + wmMean ** 2 + c1) * (origVar + wmVar + c2));
  const psnr = mse === 0 ? "Infinity" : `${(10 * Math.log10((255 * 255) / mse)).toFixed(2)} dB`;
  const white = embeddedBits.reduce((sum, bit) => sum + bit, 0);
  const extractedWhite = extractedBits.reduce((sum, bit) => sum + bit, 0);

  return [
    ["Original cover size", `${original.height} x ${original.width}`],
    ["Padded processing size", `${padded.height} x ${padded.width}`],
    ["Required size multiple", padded.multiple],
    ["Watermark bit capacity", `${bitHeight} x ${bitWidth} = ${embeddedBits.length} bits`],
    ["White watermark bits", white],
    ["Black watermark bits", embeddedBits.length - white],
    ["Recovered white bits", extractedWhite],
    ["Extraction accuracy", `${extractionAccuracy.toFixed(2)}%`],
    ["Changed cover pixels", `${changed} / ${total} (${((changed / total) * 100).toFixed(2)}%)`],
    ["MSE", mse.toFixed(4)],
    ["PSNR", psnr],
    ["SSIM", ssim.toFixed(4)],
    ["DWT level", level],
    ["Alpha strength", alpha],
    ["Wavelet", "haar"],
    ["DCT coefficient", `(${dctY}, ${dctX})`],
    ["Threshold", threshold],
  ];
}

function watermarkAccuracy(embeddedBits, extractedBits) {
  let correct = 0;
  const total = Math.min(embeddedBits.length, extractedBits.length);
  for (let i = 0; i < total; i += 1) {
    if (embeddedBits[i] === extractedBits[i]) correct += 1;
  }
  return total === 0 ? 0 : (correct / total) * 100;
}

function renderStats(stats) {
  els.statsGrid.innerHTML = "";
  for (const [label, value] of stats) {
    const item = document.createElement("div");
    item.className = "stat";
    item.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
    els.statsGrid.appendChild(item);
  }
}

function renderSubbands(coeffs, level) {
  els.subbandsGrid.innerHTML = "";
  for (let i = level - 1; i >= 0; i -= 1) {
    const detail = coeffs.details[i];
    addSubband(`Level ${i + 1} Horizontal cH`, detail.h, detail.width, detail.height);
    addSubband(`Level ${i + 1} Vertical cV`, detail.v, detail.width, detail.height);
    addSubband(`Level ${i + 1} Diagonal cD`, detail.d, detail.width, detail.height);
  }
}

function addSubband(label, data, width, height) {
  const fig = document.createElement("figure");
  const canvas = document.createElement("canvas");
  const caption = document.createElement("figcaption");
  caption.textContent = `${label} - ${height} x ${width}`;
  fig.append(canvas, caption);
  els.subbandsGrid.appendChild(fig);
  drawGray(canvas, normalizeForDisplay(data, width, height));
}

function normalizeForDisplay(data, width, height) {
  let min = Infinity;
  let max = -Infinity;
  for (const value of data) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const range = max - min || 1;
  const out = new Uint8Array(width * height);
  for (let i = 0; i < out.length; i += 1) out[i] = Math.round(((data[i] - min) / range) * 255);
  return { data: out, width, height };
}

function drawGray(canvas, image) {
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(image.width, image.height);
  for (let i = 0, p = 0; i < image.data.length; i += 1, p += 4) {
    const value = clamp(Math.round(image.data[i]), 0, 255);
    img.data[p] = value;
    img.data[p + 1] = value;
    img.data[p + 2] = value;
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function clearCanvas(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function wireDownload(link, canvas, filename) {
  link.href = canvas.toDataURL("image/png");
  link.download = filename;
  link.setAttribute("aria-disabled", "false");
}
