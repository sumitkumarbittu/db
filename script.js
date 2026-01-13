const API_BASES = {
  A: "https://db-btl1.onrender.com",
  B: "https://db2-tle6.onrender.com",
  E: "https://db5-nhy1.onrender.com",
  F: "https://db6-c4rn.onrender.com"
};

let ACTIVE_API_KEY = "A";

function getActiveApiBase() {
  return API_BASES[ACTIVE_API_KEY] || Object.values(API_BASES)[0] || "";
}

function setActiveApiKey(key) {
  if (!key || !API_BASES[key]) return;
  ACTIVE_API_KEY = key;
  try { localStorage.setItem("active_api_key", key); } catch (_) {}
  renderApiSelector();
  checkRenderStatus();
}

function loadActiveApiKey() {
  try {
    const stored = localStorage.getItem("active_api_key");
    if (stored && API_BASES[stored]) {
      ACTIVE_API_KEY = stored;
      return;
    }
  } catch (_) {}
  const first = Object.keys(API_BASES)[0];
  if (first) ACTIVE_API_KEY = first;
}

function renderApiSelector() {
  const host = document.getElementById("api-selector");
  if (!host) return;

  const keys = Object.keys(API_BASES);
  host.innerHTML = "";
  keys.forEach((k) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "api-chip";
    btn.textContent = k;
    btn.setAttribute("aria-label", `Select API ${k}`);
    const isActive = k === ACTIVE_API_KEY;
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("inactive", !isActive);
    btn.addEventListener("click", () => setActiveApiKey(k));
    host.appendChild(btn);
  });
}

loadActiveApiKey();

const QUERY_HISTORY = [];
const MAX_HISTORY = 10;

let __lastQueryResult = null;
let __tableSortState = { colIndex: null, direction: "asc" };
let __selectedRowIds = new Set();
let __downloadMenuOpen = false;
let __exportMode = false;
let __lastQueryText = "";

function saveDB() {
  const url = document.getElementById("database_url").value;

  fetch(getActiveApiBase() + "/save-db", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ database_url: url })
  })
  .then(() => {
    document.getElementById("database_url").readOnly = true;
    document.getElementById("status").innerText = "✓ Connected";
    document.getElementById("status").className = "status-badge connected";
  });
}

function refreshConnection() {
  const input = document.getElementById("database_url");
  input.readOnly = false;
  input.focus();
  const s = document.getElementById("status");
  s.innerText = "✗ Not Connected";
  s.className = "status-badge disconnected";
}

function setDownloadEnabled(enabled) {
  const btn = document.getElementById("download-btn");
  const mode = document.getElementById("export-mode");
  if (!btn || !mode) return;

  btn.disabled = !enabled;
  if (enabled) {
    btn.classList.add("active");
  } else {
    btn.classList.remove("active");
    exitExportMode();
  }
}

function enterExportMode() {
  const btn = document.getElementById("download-btn");
  const mode = document.getElementById("export-mode");
  if (!btn || !mode || btn.disabled) return;

  __exportMode = true;
  __downloadMenuOpen = false;
  btn.style.display = "none";
  mode.classList.add("open");
  mode.setAttribute("aria-hidden", "false");
  renderSortableTable();
}

function exitExportMode() {
  const btn = document.getElementById("download-btn");
  const mode = document.getElementById("export-mode");
  if (!btn || !mode) return;

  __exportMode = false;
  __selectedRowIds = new Set();
  btn.style.display = "inline-flex";
  mode.classList.remove("open");
  mode.setAttribute("aria-hidden", "true");
  renderSortableTable();
}

function runQuery() {
  const q = document.getElementById("query").value;
  __lastQueryText = q || "";

  fetch(getActiveApiBase() + "/execute", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ query: q })
  })
  .then(r => r.json())
  .then(data => {
    if (data.error) {
      renderError(data.error);
      return;
    }
    renderResult(data.result);

    const trimmed = (q || "").trim();
    if (trimmed) {
      QUERY_HISTORY.unshift(trimmed);
      if (QUERY_HISTORY.length > MAX_HISTORY) QUERY_HISTORY.length = MAX_HISTORY;
      renderHistory(QUERY_HISTORY);
    }
  });
}

function renderError(msg) {
  document.getElementById("result").innerHTML =
    `<div class="result-box error"><strong>⚠️ Error:</strong> ${escapeHtml(msg)}</div>`;
}

function escapeHtml(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const __byteaUrlCache = new Map();

function clearByteaCache() {
  for (const url of __byteaUrlCache.values()) {
    try { URL.revokeObjectURL(url); } catch (_) {}
  }
  __byteaUrlCache.clear();
}

function getByteaUrl(base64, mime) {
  const key = mime + ":" + base64;
  const cached = __byteaUrlCache.get(key);
  if (cached) return cached;
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  __byteaUrlCache.set(key, url);
  return url;
}

let __byteaModalInitialized = false;
let __byteaModalState = null;

function ensureByteaModal() {
  if (__byteaModalInitialized) return;
  __byteaModalInitialized = true;

  const modal = document.createElement("div");
  modal.className = "bytea-modal";
  modal.id = "bytea-modal";
  modal.innerHTML = `
    <div class="bytea-modal-card" role="dialog" aria-modal="true">
      <div class="bytea-modal-toolbar">
        <div class="bytea-modal-title" id="bytea-modal-title"></div>
        <div class="bytea-modal-actions">
          <a class="bytea-download" id="bytea-modal-download" download>Download</a>
          <button class="bytea-modal-btn" id="bytea-modal-reset" type="button">Reset</button>
          <button class="bytea-modal-btn" id="bytea-modal-close" type="button">Close</button>
        </div>
      </div>
      <div class="bytea-modal-stage" id="bytea-modal-stage"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => closeByteaModal();
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  document.getElementById("bytea-modal-close").addEventListener("click", close);
  document.getElementById("bytea-modal-reset").addEventListener("click", () => {
    if (__byteaModalState && __byteaModalState.type === "image") {
      __byteaModalState.scale = 1;
      __byteaModalState.tx = 0;
      __byteaModalState.ty = 0;
      applyByteaImageTransform();
    }
  });

  document.addEventListener("keydown", (e) => {
    const m = document.getElementById("bytea-modal");
    if (!m.classList.contains("open")) return;
    if (e.key === "Escape") close();
  });
}

function openByteaModal({ url, type, title }) {
  ensureByteaModal();

  const modal = document.getElementById("bytea-modal");
  const stage = document.getElementById("bytea-modal-stage");
  const t = document.getElementById("bytea-modal-title");
  const dl = document.getElementById("bytea-modal-download");

  t.textContent = title || "Preview";
  dl.href = url;
  dl.setAttribute("download", "");

  stage.innerHTML = "";

  if (type === "pdf") {
    __byteaModalState = { type: "pdf" };
    const iframe = document.createElement("iframe");
    iframe.src = url;
    stage.appendChild(iframe);
  } else {
    __byteaModalState = {
      type: "image",
      img: null,
      scale: 1,
      tx: 0,
      ty: 0,
      pointers: new Map(),
      start: null
    };
    const img = document.createElement("img");
    img.src = url;
    img.alt = title || "image";
    stage.appendChild(img);
    __byteaModalState.img = img;

    stage.onwheel = (e) => {
      if (!__byteaModalState || __byteaModalState.type !== "image") return;
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = delta > 0 ? 1.1 : 0.9;
      __byteaModalState.scale = Math.min(10, Math.max(0.2, __byteaModalState.scale * factor));
      applyByteaImageTransform();
    };

    stage.onpointerdown = (e) => {
      if (!__byteaModalState || __byteaModalState.type !== "image") return;
      stage.setPointerCapture(e.pointerId);
      __byteaModalState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (__byteaModalState.pointers.size === 1) {
        img.classList.add("dragging");
        __byteaModalState.start = {
          tx: __byteaModalState.tx,
          ty: __byteaModalState.ty,
          x: e.clientX,
          y: e.clientY
        };
      } else if (__byteaModalState.pointers.size === 2) {
        const pts = Array.from(__byteaModalState.pointers.values());
        const dx = pts[0].x - pts[1].x;
        const dy = pts[0].y - pts[1].y;
        __byteaModalState.start = {
          mode: "pinch",
          dist: Math.hypot(dx, dy),
          scale: __byteaModalState.scale
        };
      }
    };

    stage.onpointermove = (e) => {
      if (!__byteaModalState || __byteaModalState.type !== "image") return;
      if (!__byteaModalState.pointers.has(e.pointerId)) return;
      __byteaModalState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (__byteaModalState.pointers.size === 1 && __byteaModalState.start && !__byteaModalState.start.mode) {
        const dx = e.clientX - __byteaModalState.start.x;
        const dy = e.clientY - __byteaModalState.start.y;
        __byteaModalState.tx = __byteaModalState.start.tx + dx;
        __byteaModalState.ty = __byteaModalState.start.ty + dy;
        applyByteaImageTransform();
      }

      if (__byteaModalState.pointers.size === 2 && __byteaModalState.start && __byteaModalState.start.mode === "pinch") {
        const pts = Array.from(__byteaModalState.pointers.values());
        const dx = pts[0].x - pts[1].x;
        const dy = pts[0].y - pts[1].y;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / (__byteaModalState.start.dist || dist);
        __byteaModalState.scale = Math.min(10, Math.max(0.2, __byteaModalState.start.scale * ratio));
        applyByteaImageTransform();
      }
    };

    stage.onpointerup = stage.onpointercancel = (e) => {
      if (!__byteaModalState || __byteaModalState.type !== "image") return;
      __byteaModalState.pointers.delete(e.pointerId);
      if (__byteaModalState.pointers.size === 0) {
        img.classList.remove("dragging");
        __byteaModalState.start = null;
      }
    };
  }

  modal.classList.add("open");
}

function applyByteaImageTransform() {
  if (!__byteaModalState || __byteaModalState.type !== "image") return;
  const { img, scale, tx, ty } = __byteaModalState;
  img.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`;
}

function closeByteaModal() {
  const modal = document.getElementById("bytea-modal");
  if (!modal) return;
  modal.classList.remove("open");
  const stage = document.getElementById("bytea-modal-stage");
  if (stage) {
    stage.onwheel = null;
    stage.onpointerdown = null;
    stage.onpointermove = null;
    stage.onpointerup = null;
    stage.onpointercancel = null;
    stage.innerHTML = "";
  }
  __byteaModalState = null;
}

function handleByteaThumbError(imgEl) {
  const media = imgEl.closest('.bytea-thumb-media');
  if (!media) return;
  media.innerHTML = '<div class="bytea-thumb-file">FILE</div>';
  media.style.cursor = 'default';
}

function renderBytea(base64) {
  const isPdf = base64.startsWith("JVBERi0");
  const mime = isPdf ? "application/pdf" : "application/octet-stream";
  const url = getByteaUrl(base64, mime);
  const id = "b_" + Math.random().toString(36).slice(2);

  if (isPdf) {
    return `
      <div class="bytea-thumb">
        <div class="bytea-thumb-media" onclick="openByteaModal({url:'${url}', type:'pdf', title:'PDF'})">
          <div class="bytea-thumb-file">PDF</div>
        </div>
        <a class="bytea-download" href="${url}" download>Download</a>
      </div>
    `;
  }

  return `
    <div class="bytea-thumb" id="${id}">
      <div class="bytea-thumb-media" onclick="openByteaModal({url:'${url}', type:'image', title:'Image'})">
        <img src="${url}" onerror="handleByteaThumbError(this)">
      </div>
      <a class="bytea-download" href="${url}" download>Download</a>
    </div>
  `;
}

function renderCell(cell) {
  if (cell && typeof cell === "object" && cell.__type === "bytea" && typeof cell.base64 === "string") {
    return renderBytea(cell.base64);
  }
  return escapeHtml(cell);
}

function renderResult(res) {
  if (res.columns) {
    clearByteaCache();

    __lastQueryResult = {
      columns: Array.isArray(res.columns) ? res.columns.slice() : [],
      rows: Array.isArray(res.rows) ? res.rows.slice() : []
    };
    __tableSortState = { colIndex: null, direction: "asc" };
    __selectedRowIds = new Set();
    setDownloadEnabled(true);
    renderSortableTable();
  } else {
    __lastQueryResult = null;
    __tableSortState = { colIndex: null, direction: "asc" };
    __selectedRowIds = new Set();
    setDownloadEnabled(false);
    document.getElementById("result").innerHTML =
      `<div class="result-box success">${escapeHtml(res)}</div>`;
  }
}

function tryParseDateLike(value) {
  if (value === null || value === undefined) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  if (typeof value !== "string") return null;

  const s = value.trim();
  if (!s) return null;

  const isoMs = Date.parse(s);
  if (!Number.isNaN(isoMs) && /\d{4}-\d{2}-\d{2}/.test(s)) return isoMs;

  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?/);
  if (!m) return null;

  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const hh = m[4] ? Number(m[4]) : 0;
  const mm = m[5] ? Number(m[5]) : 0;
  const ss = m[6] ? Number(m[6]) : 0;
  const ms = m[7] ? Number(m[7].padEnd(3, "0").slice(0, 3)) : 0;

  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const utc = Date.UTC(year, month - 1, day, hh, mm, ss, ms);
  if (Number.isNaN(utc)) return null;
  return utc;
}

function normalizeForCompare(value) {
  if (value && typeof value === "object") {
    if (value.__type === "bytea") return "";
    return JSON.stringify(value);
  }
  return value;
}

function compareValues(a, b) {
  const av = normalizeForCompare(a);
  const bv = normalizeForCompare(b);
  if (av === null || av === undefined) return bv === null || bv === undefined ? 0 : -1;
  if (bv === null || bv === undefined) return 1;

  const ad = tryParseDateLike(av);
  const bd = tryParseDateLike(bv);
  if (ad !== null && bd !== null) {
    if (ad === bd) return 0;
    return ad < bd ? -1 : 1;
  }

  const an = typeof av === "number" ? av : Number(av);
  const bn = typeof bv === "number" ? bv : Number(bv);
  if (Number.isFinite(an) && Number.isFinite(bn)) {
    if (an === bn) return 0;
    return an < bn ? -1 : 1;
  }

  const as = String(av).toLowerCase();
  const bs = String(bv).toLowerCase();
  if (as === bs) return 0;
  return as < bs ? -1 : 1;
}

function getSortedRows(rows, colIndex, direction) {
  const dir = direction === "desc" ? -1 : 1;
  return rows
    .map((row, rowId) => ({ row, rowId }))
    .sort((x, y) => {
      const cmp = compareValues(x.row?.[colIndex], y.row?.[colIndex]);
      if (cmp !== 0) return cmp * dir;
      return x.rowId - y.rowId;
    })
    .map(x => x);
}

function renderSortableTable() {
  const host = document.getElementById("result");
  if (!__lastQueryResult || !Array.isArray(__lastQueryResult.columns)) {
    host.innerHTML = "";
    return;
  }

  const { columns, rows } = __lastQueryResult;
  const activeCol = __tableSortState.colIndex;
  const activeDir = __tableSortState.direction;
  const renderRowItems = activeCol === null
    ? rows.map((row, rowId) => ({ row, rowId }))
    : getSortedRows(rows, activeCol, activeDir);
  const allSelected = renderRowItems.length > 0 && renderRowItems.every(it => __selectedRowIds.has(it.rowId));

  let html = `<div class="result-box success"><table><tr>`;
  if (__exportMode) {
    html += `<th class="row-select"><input id="select-all" type="checkbox" ${allSelected ? "checked" : ""} aria-label="Select all rows"></th>`;
  }
  columns.forEach((c, i) => {
    const isActive = activeCol === i;
    const indicator = isActive ? (activeDir === "asc" ? "▲" : "▼") : "";
    html += `<th class="sortable" data-col-index="${i}"><span class="th-wrap">${escapeHtml(c)}<span class="sort-indicator">${indicator}</span></span></th>`;
  });
  html += `</tr>`;

  renderRowItems.forEach(({ row: r, rowId }) => {
    html += "<tr>";
    if (__exportMode) {
      html += `<td class="row-select"><input class="row-check" type="checkbox" data-row-id="${rowId}" ${__selectedRowIds.has(rowId) ? "checked" : ""} aria-label="Select row"></td>`;
    }
    r.forEach(cell => (html += `<td>${renderCell(cell)}</td>`));
    html += "</tr>";
  });

  html += `</table></div>`;
  host.innerHTML = html;

  const table = host.querySelector("table");
  if (!table) return;

  if (__exportMode) {
    const selectAll = table.querySelector("#select-all");
    if (selectAll) {
      selectAll.addEventListener("change", () => {
        if (selectAll.checked) {
          renderRowItems.forEach(it => __selectedRowIds.add(it.rowId));
        } else {
          renderRowItems.forEach(it => __selectedRowIds.delete(it.rowId));
        }
        renderSortableTable();
      });
    }

    const rowChecks = table.querySelectorAll(".row-check");
    rowChecks.forEach(chk => {
      chk.addEventListener("change", () => {
        const id = Number(chk.dataset.rowId);
        if (!Number.isFinite(id)) return;
        if (chk.checked) __selectedRowIds.add(id);
        else __selectedRowIds.delete(id);
        renderSortableTable();
      });
    });
  }

  const headers = table.querySelectorAll("th.sortable");
  headers.forEach(th => {
    th.addEventListener("click", () => {
      const idx = Number(th.dataset.colIndex);
      if (!Number.isFinite(idx)) return;

      if (__tableSortState.colIndex === idx) {
        __tableSortState.direction = __tableSortState.direction === "asc" ? "desc" : "asc";
      } else {
        __tableSortState.colIndex = idx;
        __tableSortState.direction = "asc";
      }
      renderSortableTable();
    });
  });
}

function getExportRows() {
  if (!__lastQueryResult || !Array.isArray(__lastQueryResult.rows)) return [];
  const rows = __lastQueryResult.rows;
  if (__selectedRowIds.size === 0) return rows.map((row, rowId) => ({ row, rowId }));
  return rows
    .map((row, rowId) => ({ row, rowId }))
    .filter(it => __selectedRowIds.has(it.rowId));
}

function stringifyForExport(cell) {
  if (cell && typeof cell === "object") {
    if (cell.__type === "bytea" && typeof cell.base64 === "string") return cell.base64;
    return JSON.stringify(cell);
  }
  if (cell === null || cell === undefined) return "";
  return String(cell);
}

function inferTableOrViewName(sql) {
  const s = (sql || "").trim();
  if (!s) return "query";

  const cleaned = s
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .trim();

  const m = cleaned.match(/\bfrom\s+([a-zA-Z0-9_\.\"\-]+)(?:\s+as\s+\w+)?/i);
  if (!m) return "query";
  let name = m[1] || "query";
  name = name.replace(/"/g, "");
  name = name.split(".").pop();
  name = name.replace(/[^a-zA-Z0-9_\-]/g, "");
  return name || "query";
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => {
    try { URL.revokeObjectURL(url); } catch (_) {}
  }, 1000);
}

function toCsv(columns, rowItems) {
  const escapeCsv = (v) => {
    const s = stringifyForExport(v);
    if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const lines = [];
  lines.push(columns.map(escapeCsv).join(","));
  rowItems.forEach(({ row }) => {
    lines.push((row || []).map(escapeCsv).join(","));
  });
  return lines.join("\n");
}

function downloadResult(format) {
  if (!__lastQueryResult || !Array.isArray(__lastQueryResult.columns)) return;

  const columns = __lastQueryResult.columns;
  const rowItems = getExportRows();
  const baseName = inferTableOrViewName(__lastQueryText);

  if (format === "json") {
    const data = rowItems.map(({ row }) => {
      const obj = {};
      columns.forEach((c, i) => {
        obj[c] = row?.[i];
      });
      return obj;
    });
    downloadBlob(JSON.stringify(data, null, 2), `${baseName}.json`, "application/json;charset=utf-8");
  } else {
    const csv = toCsv(columns, rowItems);
    downloadBlob(csv, `${baseName}.csv`, "text/csv;charset=utf-8");
  }
}

function renderHistory(list) {
  const ul = document.getElementById("history");
  ul.innerHTML = "";
  list.forEach(q => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.dataset.query = q;
    const pre = document.createElement("pre");
    pre.textContent = q;
    li.appendChild(pre);
    li.style.cursor = "pointer";
    li.addEventListener("click", () => {
      const textarea = document.getElementById("query");
      textarea.value = li.dataset.query || "";
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });
    ul.appendChild(li);
  });
}

function checkRenderStatus() {
  fetch(getActiveApiBase() + "/health", { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error("Down");
      return res.json();
    })
    .then(() => {
      const badge = document.getElementById("render-status");
      badge.innerText = "🟢 Render : Connected";
      badge.className = "status-badge connected";
    })
    .catch(() => {
      const badge = document.getElementById("render-status");
      badge.innerText = "🔴 Render : Disconnected";
      badge.className = "status-badge disconnected";
    });
}

// initial check
renderApiSelector();
checkRenderStatus();

// repeat every 20 seconds
setInterval(checkRenderStatus, 20000);

// clock widget
(() => {
  /* ---------- ELEMENTS ---------- */
  const widget = document.getElementById("clock-widget");
  const dragArea = document.getElementById("dragArea");

  const hh = document.getElementById("hh");
  const mm = document.getElementById("mm");
  const ss = document.getElementById("ss");
  const ms = document.getElementById("ms");

  const colorBtn = document.getElementById("colorBtn");
  const tzBtn = document.getElementById("tzBtn");
  const lockBtn = document.getElementById("lockBtn");
  const resizeHandle = widget.querySelector(".resize-handle");

  if (!widget || !dragArea) return; // safety

  /* ---------- STATE ---------- */
  let tz = "IST";
  let themeIndex = 0;
  let locked = false;
  let scale = 0.7;                 // initial small size
  widget.style.transform = "scale(0.7)";


  /* ---------- CLOCK (STABLE) ---------- */
  function updateClock() {
    let t = Date.now();

    if (tz === "IST") {
      t += 330 * 60 * 1000;
    }

    const d = new Date(t);

    hh.textContent = String(d.getUTCHours()).padStart(2, "0");
    mm.textContent = String(d.getUTCMinutes()).padStart(2, "0");
    ss.textContent = String(d.getUTCSeconds()).padStart(2, "0");
    ms.textContent = Math.floor(d.getUTCMilliseconds() / 100);
  }

  updateClock();
  setInterval(updateClock, 100);

  /* ---------- TZ TOGGLE ---------- */
  tzBtn.onclick = () => {
    tz = tz === "IST" ? "GMT" : "IST";
    tzBtn.textContent = tz;
    updateClock();
  };

  /* ---------- COLOR TOGGLE ---------- */
  colorBtn.onclick = () => {
    widget.classList.remove(`theme-${themeIndex}`);
    themeIndex = (themeIndex + 1) % 7;
    widget.classList.add(`theme-${themeIndex}`);
  };

  /* ---------- LOCK ---------- */
  lockBtn.onclick = () => {
    locked = !locked;
    lockBtn.textContent = locked ? "🔒" : "🔓";
  };

  /* ---------- DRAG (ONLY BODY) ---------- */
  dragArea.addEventListener("pointerdown", (e) => {
    if (locked) return;

    if (e.button !== undefined && e.button !== 0) return;
    if (e.target && (e.target.closest(".resize-handle") || e.target.closest(".clock-toolbar"))) return;

    e.preventDefault();

    const rect = widget.getBoundingClientRect();
    widget.style.left = rect.left + "px";
    widget.style.top = rect.top + "px";
    widget.style.right = "auto";
    widget.style.transformOrigin = "top left";

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    dragArea.classList.add("dragging");
    widget.classList.add("dragging");
    dragArea.setPointerCapture(e.pointerId);

    const move = (ev) => {
      ev.preventDefault();
      const nextLeft = ev.clientX - offsetX;
      const nextTop = ev.clientY - offsetY;
      const maxLeft = Math.max(0, window.innerWidth - w);
      const maxTop = Math.max(0, window.innerHeight - h);
      const clampedLeft = Math.min(Math.max(0, nextLeft), maxLeft);
      const clampedTop = Math.min(Math.max(0, nextTop), maxTop);
      widget.style.left = clampedLeft + "px";
      widget.style.top = clampedTop + "px";
    };

    const up = () => {
      try { dragArea.releasePointerCapture(e.pointerId); } catch (_) {}
      dragArea.removeEventListener("pointermove", move);
      dragArea.removeEventListener("pointerup", up);
      dragArea.removeEventListener("pointercancel", up);
      dragArea.classList.remove("dragging");
      widget.classList.remove("dragging");
    };

    dragArea.addEventListener("pointermove", move);
    dragArea.addEventListener("pointerup", up);
    dragArea.addEventListener("pointercancel", up);
  });

  /* ---------- SCALE (SAFE) ---------- */
  resizeHandle.addEventListener("pointerdown", (e) => {
    if (locked) return;
    e.stopPropagation();

    const startX = e.clientX;
    const startScale = scale;

    resizeHandle.setPointerCapture(e.pointerId);

    const move = (ev) => {
      scale = Math.min(2.2, Math.max(0.6, startScale + (ev.clientX - startX) / 300));
      widget.style.transform = `scale(${scale})`;
    };

    const up = () => {
      resizeHandle.releasePointerCapture(e.pointerId);
      resizeHandle.removeEventListener("pointermove", move);
      resizeHandle.removeEventListener("pointerup", up);
    };

    resizeHandle.addEventListener("pointermove", move);
    resizeHandle.addEventListener("pointerup", up);
  });

})();
