/* =========================================================
   THITHU.JS – ENGINE THI THỬ CẤU TRÚC MỚI
   ---------------------------------------------------------
   Hỗ trợ ngân hàng mới:
   - single_select
   - multi_select
   - true_false
   - fill_blank
   - matching
   - ordering

   Nguyên tắc:
   - Dùng localStorage để nhận cấu hình kỳ thi.
   - Ưu tiên cấu hình chi tiết nếu có.
   - Nếu chưa có cấu hình chi tiết thì dùng soCau/thoiGian.
   - Không khóa lượt thi như thi chính thức.
   - Có lưu phiên tạm để F5 không mất bài.
   - Chấm theo correctValues/dapAn của ngân hàng mới.
   - Tự gọi MathJax sau khi render.
========================================================= */

(function () {
    "use strict";

    /* =====================================================
       1. TIỆN ÍCH
    ===================================================== */

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

    function esc(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function html(value) {
        // Nội dung ngân hàng có thể chứa LaTeX, HTML và entity.
        // Giữ nguyên để MathJax có thể xử lý $$...$$, \\(...\\), etc.
        return String(value ?? "");
    }

    function normalizeType(q) {
        const raw = String(q?.type || q?.loai || "single_select")
            .trim()
            .toLowerCase();

        if (["single_select", "single-select", "single", "mcq", "trac_nghiem", "mcq_single"].includes(raw)) return "single_select";
        if (["multi_select", "multi-select", "multi", "multiple", "trac_nghiem_nhieu"].includes(raw)) return "multi_select";
        if (["true_false", "truefalse", "true-false", "tf", "dungsai", "true_false_single"].includes(raw)) return "true_false";
        if (["fill_blank", "fill", "fill_blank_text", "fillblank", "dien_khuyet"].includes(raw)) return "fill_blank";
        if (["matching", "match", "ghép", "ghep_doi"].includes(raw)) return "matching";
        if (["ordering", "order", "sort", "sap_xep"].includes(raw)) return "ordering";
        return raw || "single_select";
    }

    function getCorrectValues(q) {
        if (Array.isArray(q?.correctValues)) return q.correctValues;
        if (q?.correctValue !== undefined && q?.correctValue !== null) return [q.correctValue];
        if (Array.isArray(q?.dapAn)) return q.dapAn;
        if (q?.dapAn !== undefined && q?.dapAn !== null) return [q.dapAn];
        return [];
    }

    function valueKey(v) {
        if (v && typeof v === "object") {
            return JSON.stringify(v);
        }
        return String(v ?? "").trim();
    }

    function sameValue(a, b) {
        return valueKey(a).toLowerCase() === valueKey(b).toLowerCase();
    }

    function arraySameUnordered(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
        const aa = a.map(valueKey).sort();
        const bb = b.map(valueKey).sort();
        return aa.every((v, i) => v === bb[i]);
    }

    function getOptions(q) {
        if (Array.isArray(q?.options)) {
            return q.options.map((o, i) => ({
                value: String(o?.value ?? String.fromCharCode(65 + i)),
                label: chuanHoaCongThucToan(
    html(o?.label ?? o?.text ?? o?.value ?? "")
)
            }));
        }

        const result = [];
        ["A", "B", "C", "D", "E", "F"].forEach(letter => {
            if (q && q[letter] !== undefined) {
                result.push({
    value: letter,
    label: chuanHoaCongThucToan(
        html(q[letter])
    )
});
            }
        });
        return result;
    }

    function getConfigObject() {
        const keys = [
            "cauHinhThiThu",
            "cauHinhThi",
            "examConfig",
            "thiThuConfig",
            "cauHinh"
        ];

        for (const key of keys) {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            try {
                const obj = JSON.parse(raw);
                if (obj && typeof obj === "object") return obj;
            } catch (_) {
                console.warn("⚠️ Không đọc được cấu hình:", key);
            }
        }
        return {};
    }

    function numberFromStorage(keys, fallback) {
        for (const key of keys) {
            const n = Number(localStorage.getItem(key));
            if (Number.isFinite(n) && n > 0) return n;
        }
        return fallback;
    }

    function readExamConfig(bankLength) {
        const cfg = getConfigObject();

        const soCau = Number(
            cfg.soCau ?? cfg.numberOfQuestions ?? cfg.totalQuestions ??
            localStorage.getItem("soCau") ?? bankLength
        );

        const thoiGian = Number(
            cfg.thoiGian ?? cfg.thoiGianThi ?? cfg.duration ?? cfg.durationMinutes ??
            localStorage.getItem("thoiGian") ?? localStorage.getItem("thoiGianThi") ?? 20
        );

        const cauTruc = cfg.cauTruc || cfg.structure || cfg.blueprint || cfg.maTran || null;

        return {
            ...cfg,
            soCau: Number.isFinite(soCau) && soCau > 0 ? Math.floor(soCau) : bankLength,
            thoiGian: Number.isFinite(thoiGian) && thoiGian > 0 ? thoiGian : 20,
            cauTruc
        };
    }

    /* =====================================================
       2. BIẾN PHIÊN THI
    ===================================================== */

    const maKyThi = String(localStorage.getItem("maKyThi") || "thi-thu").trim();
    const maThiSinh = String(localStorage.getItem("maThiSinh") || "unknown").trim();
    const mon = String(
        localStorage.getItem("mon") ||
        localStorage.getItem("monThi") ||
        ""
    ).trim();

    const bank = Array.isArray(window.cauHoi) ? window.cauHoi : [];

    if (!bank.length) {
        alert("❌ Không tìm thấy ngân hàng câu hỏi cho bài thi thử.");
        console.error("thithu.js: window.cauHoi không tồn tại hoặc rỗng.");
        return;
    }

    const config = readExamConfig(bank.length);
    const sessionKey = "thiThu_v3_" + maThiSinh + "_" + maKyThi + "_" + (mon || "mon");

    let deThi = [];
    let currentIndex = 0;
    let submitted = false;
    let remainingSeconds = config.thoiGian * 60;
    let timerId = null;
    let answers = {};

    /* =====================================================
   GIỚI HẠN LUYỆN TẬP + THƯỞNG XU
   - Mỗi đợt tối đa 5 lượt
   - Mỗi lượt nhận 10–20 Xu
===================================================== */

const MAX_LUOT_LUYEN_TAP = 5;

const maDotLuyenTap =
    String(
        localStorage.getItem("maDotLuyenTap") ||
        maKyThi ||
        "dot-thi-thu"
    ).trim();

const KEY_LUOT_LUYEN_TAP =
    "luotLuyenTap_" +
    maThiSinh +
    "_" +
    maDotLuyenTap;

const KEY_XU =
    "xu_" + maThiSinh;


/* =========================
   LẤY SỐ LƯỢT ĐÃ LUYỆN
========================= */

function getSoLuotLuyenTap() {

    return Number(
        localStorage.getItem(
            KEY_LUOT_LUYEN_TAP
        ) || "0"
    );

}


/* =========================
   LẤY SỐ XU HIỆN TẠI
========================= */

function getSoXu() {

    return Number(
        localStorage.getItem(KEY_XU) || "0"
    );

}


/* =========================
   CỘNG XU
========================= */

function congXu(soXu) {

    const hienTai = getSoXu();

    const moi =
        hienTai +
        Number(soXu || 0);

    localStorage.setItem(
        KEY_XU,
        String(moi)
    );

    return moi;

}


/* =========================
   TẠO THƯỞNG 10–20 XU
========================= */

function taoThuongXu() {

    return Math.floor(
        Math.random() * 11
    ) + 10;

}


/* =========================
   CÒN LƯỢT KHÔNG?
========================= */

function conLuotLuyenTap() {

    return (
        getSoLuotLuyenTap() <
        MAX_LUOT_LUYEN_TAP
    );

}


/* =========================
   GHI NHẬN 1 LƯỢT + CỘNG XU
========================= */

function ghiNhanLuotLuyenTap() {

    let soLuot =
        getSoLuotLuyenTap();

    /* Đã đủ 5 lượt */

    if (
        soLuot >=
        MAX_LUOT_LUYEN_TAP
    ) {

        return {
            ok: false,
            reason: "MAX",
            soLuot,
            xuThuong: 0,
            tongXu: getSoXu()
        };

    }


    /* Tăng lượt */

    soLuot++;

    localStorage.setItem(
        KEY_LUOT_LUYEN_TAP,
        String(soLuot)
    );


    /* Tạo Xu */

    const xuThuong =
        taoThuongXu();


    const tongXu =
        congXu(xuThuong);


    return {
        ok: true,
        soLuot,
        xuThuong,
        tongXu
    };

}

    /* =====================================================
       3. CHỌN ĐỀ THEO CẤU HÌNH
    ===================================================== */

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function matchesRule(q, rule) {
        if (!rule || typeof rule !== "object") return false;

        const get = (names) => {
            for (const n of names) {
                if (rule[n] !== undefined && rule[n] !== null && String(rule[n]).trim() !== "") return rule[n];
            }
            return undefined;
        };

        const type = get(["type", "loai"]);
        const mucDo = get(["mucDo", "mucDoPhanHoa", "level"]);
        const chuDe = get(["chuDe", "topic"]);
        const nhom = get(["nhomKienThuc", "group", "nhom"]);
        const phamVi = get(["phamVi", "scope"]);

        if (type !== undefined && normalizeType(q) !== normalizeType({ type })) return false;
        if (mucDo !== undefined && String(q.mucDo || q.mucDoPhanHoa || "").toLowerCase() !== String(mucDo).toLowerCase()) return false;
        if (chuDe !== undefined && String(q.chuDe || "").toLowerCase() !== String(chuDe).toLowerCase()) return false;
        if (nhom !== undefined && String(q.nhomKienThuc || "").toLowerCase() !== String(nhom).toLowerCase()) return false;
        if (phamVi !== undefined && String(q.phamVi || "").toLowerCase() !== String(phamVi).toLowerCase()) return false;

        return true;
    }

    function selectByBlueprint(bankList, blueprint) {
        if (!Array.isArray(blueprint) || !blueprint.length) return null;

        const remaining = [...bankList];
        const picked = [];

        for (const rule of blueprint) {
            const count = Math.max(0, Number(rule.soCau ?? rule.count ?? rule.number ?? 0));
            if (!count) continue;

            const pool = shuffle(remaining.filter(q => matchesRule(q, rule)));
            const chosen = pool.slice(0, count);

            chosen.forEach(q => {
                const idx = remaining.indexOf(q);
                if (idx >= 0) remaining.splice(idx, 1);
                picked.push(q);
            });
        }

        return picked.length ? picked : null;
    }

    function buildExam() {
        const blueprint = config.cauTruc;

        let selected = null;

        if (Array.isArray(blueprint)) {
            selected = selectByBlueprint(bank, blueprint);
        } else if (blueprint && typeof blueprint === "object") {
            const rules = blueprint.sections || blueprint.parts || blueprint.items || blueprint.rules;
            if (Array.isArray(rules)) selected = selectByBlueprint(bank, rules);
        }

        // Hỗ trợ cấu trúc dạng {single_select: 10, multi_select: 2, ...}
        if (!selected && blueprint && typeof blueprint === "object" && !Array.isArray(blueprint)) {
            const rules = [];
            Object.entries(blueprint).forEach(([key, val]) => {
                if (typeof val === "number") rules.push({ type: key, soCau: val });
            });
            if (rules.length) selected = selectByBlueprint(bank, rules);
        }

        if (!selected || selected.length < config.soCau) {
            const already = selected || [];
            const used = new Set(already.map(q => q.id || JSON.stringify(q)));
            const rest = shuffle(bank.filter(q => !used.has(q.id || JSON.stringify(q))));
            selected = [...already, ...rest].slice(0, Math.min(config.soCau, bank.length));
        }

        return shuffle(selected);
    }

    /* =====================================================
       4. PHIÊN LÀM BÀI – F5 KHÔNG MẤT
    ===================================================== */

    function loadSession() {
        try {
            const raw = localStorage.getItem(sessionKey);
            if (!raw) return false;

            const data = JSON.parse(raw);
            if (!data || !Array.isArray(data.questionIds)) return false;

            const map = new Map(bank.map(q => [String(q.id || ""), q]));
            const restored = data.questionIds.map(id => map.get(String(id))).filter(Boolean);
            if (!restored.length) return false;

            deThi = restored;
            answers = data.answers || {};
            remainingSeconds = Number(data.remainingSeconds);
            if (!Number.isFinite(remainingSeconds) || remainingSeconds < 0) remainingSeconds = config.thoiGian * 60;
            currentIndex = Math.max(0, Math.min(Number(data.currentIndex) || 0, deThi.length - 1));
            submitted = false;
            return true;
        } catch (e) {
            console.warn("⚠️ Không khôi phục được phiên thi thử:", e);
            return false;
        }
    }

    function saveSession() {
        if (submitted || !deThi.length) return;
        try {
            localStorage.setItem(sessionKey, JSON.stringify({
                version: 3,
                questionIds: deThi.map(q => q.id || JSON.stringify(q)),
                answers,
                remainingSeconds,
                currentIndex,
                updatedAt: Date.now()
            }));
        } catch (e) {
            console.warn("Không lưu được phiên thi thử:", e);
        }
    }

    function clearSession() {
        localStorage.removeItem(sessionKey);
    }

    // =========================================================
// CHUẨN HÓA CÔNG THỨC TOÁN
// =========================================================
function chuanHoaCongThucToan(text) {

    if (text === null || text === undefined) {
        return "";
    }

    let s = String(text);

    // -----------------------------------------------------
    // \rac34  ->  \frac{3}{4}
    // \rac24  ->  \frac{2}{4}
    // \rac48  ->  \frac{4}{8}
    // -----------------------------------------------------
    s = s.replace(
        /\\rac\s*([0-9]+)\s*([0-9]+)/g,
        "\\frac{$1}{$2}"
    );

    // -----------------------------------------------------
    // \frac34 -> \frac{3}{4}
    // -----------------------------------------------------
    s = s.replace(
        /\\frac\s*([0-9]+)\s*([0-9]+)/g,
        "\\frac{$1}{$2}"
    );

    // -----------------------------------------------------
    // \sqrt16 -> \sqrt{16}
    // \sqrt9 -> \sqrt{9}
    // -----------------------------------------------------
    s = s.replace(
        /\\sqrt\s*([0-9]+)/g,
        "\\sqrt{$1}"
    );

    // -----------------------------------------------------
    // Một số lỗi gõ nhầm
    // -----------------------------------------------------
    s = s.replace(/\\sqtrt/g, "\\sqrt");
    s = s.replace(/\\sqr/g, "\\sqrt");

    return s;
}
    /* =====================================================
       5. RENDER CÂU HỎI
    ===================================================== */

    function renderSingle(q, index) {
        const type = normalizeType(q);
        const correct = getCorrectValues(q);
        const saved = answers[String(index)];
        const number = index + 1;

        let body = "";

        if (type === "single_select") {
            body = getOptions(q).map(opt => `
                <label class="qe-option">
                    <input type="radio" name="q_${index}" value="${esc(opt.value)}" ${saved === opt.value ? "checked" : ""}>
                    <span>${opt.label}</span>
                </label>
            `).join("");
        }

        else if (type === "multi_select") {
            const savedArr = Array.isArray(saved) ? saved : [];
            body = getOptions(q).map(opt => `
                <label class="qe-option">
                    <input type="checkbox" name="q_${index}" value="${esc(opt.value)}" ${savedArr.includes(opt.value) ? "checked" : ""}>
                    <span>${opt.label}</span>
                </label>
            `).join("");
        }

        else if (type === "true_false") {
            let trueLabel = "Đúng";
            let falseLabel = "Sai";
            if (Array.isArray(q.options) && q.options.length >= 2) {
                trueLabel = q.options[0]?.label || trueLabel;
                falseLabel = q.options[1]?.label || falseLabel;
            }
            const savedTF = saved == null ? "" : String(saved);
            body = `
                <label class="qe-option">
                    <input type="radio" name="q_${index}" value="D" ${savedTF === "D" || savedTF === "true" ? "checked" : ""}>
                    <span>Đúng — ${html(trueLabel)}</span>
                </label>
                <label class="qe-option">
                    <input type="radio" name="q_${index}" value="S" ${savedTF === "S" || savedTF === "false" ? "checked" : ""}>
                    <span>Sai — ${html(falseLabel)}</span>
                </label>
            `;
        }

        else if (type === "fill_blank") {
            const value = saved == null ? "" : String(saved);
            body = `
                <div class="qe-fill-wrap">
                    <input class="qe-fill-input" type="text" name="q_${index}" value="${esc(value)}" placeholder="${esc(q.placeholder || "Nhập đáp án")}" autocomplete="off">
                </div>
            `;
        }

        else if (type === "matching") {
            body = renderMatching(q, index, saved);
        }

        else if (type === "ordering") {
            body = renderOrdering(q, index, saved);
        }

        else {
            body = getOptions(q).map(opt => `
                <label class="qe-option">
                    <input type="radio" name="q_${index}" value="${esc(opt.value)}" ${saved === opt.value ? "checked" : ""}>
                    <span>${opt.label}</span>
                </label>
            `).join("");
        }

        const meta = [q.chuDe, q.mucDo || q.mucDoPhanHoa].filter(Boolean).map(esc).join(" • ");

        return `
            <section class="qe-question" data-question-index="${index}" data-type="${esc(type)}" id="cau${number}">
                <div class="qe-question-header">
                    <div class="qe-question-number">${number}</div>
                    <div style="flex:1">
                        <div style="font-weight:900">Câu ${number}</div>
                        ${meta ? `<small style="opacity:.75">${meta}</small>` : ""}
                    </div>
                </div>
                <div class="qe-question-content">
                    <p>${chuanHoaCongThucToan(
    html(q.question || q.cauHoi || "")
)}</p>
                    ${body}
                    ${q.hint && !submitted
    ? `<div class="qe-hint">
        💡 Gợi ý:
        ${chuanHoaCongThucToan(html(q.hint))}
       </div>`
    : ""
}
                </div>
            </section>
        `;
    }

    function renderMatching(q, index, saved) {
        const left = Array.isArray(q.cotA) ? q.cotA : [];
        const right = Array.isArray(q.cotB) ? q.cotB : [];
        const pairs = saved && typeof saved === "object" ? saved : {};

        return `
            <div class="qe-matching">
                ${left.map(item => {
                    const id = String(item?.id ?? "");
                    return `
                        <div class="qe-match-row">
                            <div class="qe-match-left">
    <strong>${esc(id)}</strong>
    ${chuanHoaCongThucToan(
        html(item?.text || "")
    )}
</div>
                            <select class="qe-match-select" data-match-left="${esc(id)}">
                                <option value="">-- Chọn --</option>
                                ${right.map(r => {
                                    const rid = String(r?.id ?? "");
                                    const selected = String(pairs[id] ?? "") === rid ? "selected" : "";
                                    return `<option value="${esc(rid)}" ${selected}>${esc(rid)}. ${chuanHoaCongThucToan(html(r?.text || ""))}</option>`;
                                }).join("")}
                            </select>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function renderOrdering(q, index, saved) {
        const items = Array.isArray(q.items) ? q.items : [];
        const order = Array.isArray(saved) && saved.length ? saved : items.map(x => String(x?.id ?? ""));
        const map = new Map(items.map(x => [String(x?.id ?? ""), x]));

        return `
            <div class="qe-ordering" data-order-question="${index}">
                <p class="qe-order-note">↕ Chọn thứ tự bằng các nút lên/xuống:</p>
                <div class="qe-sort-list">
                    ${order.map((id, pos) => {
                        const item = map.get(String(id));
                        return `
                            <div class="qe-sort-item" data-sort-id="${esc(id)}">
                                <span class="qe-sort-pos">${pos + 1}</span>
                                <span class="qe-sort-text">
    ${chuanHoaCongThucToan(
        html(item?.text || id)
    )}
</span>
                                <button type="button" class="qe-sort-up" data-sort-action="up" data-sort-id="${esc(id)}" ${pos === 0 ? "disabled" : ""}>↑</button>
                                <button type="button" class="qe-sort-down" data-sort-action="down" data-sort-id="${esc(id)}" ${pos === order.length - 1 ? "disabled" : ""}>↓</button>
                            </div>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }

    function renderAll() {
        const box = $("#khuVucCauHoi");
        if (!box) return;

        box.innerHTML = deThi.map(renderSingle).join("");
        box.classList.add("single-question-mode");

        renderNav();
        bindQuestionEvents();
        showQuestion(currentIndex);
        typesetMath();
    }

    function renderNav() {
        const nav = $("#questionNavContainer");
        if (!nav) return;

        nav.innerHTML = deThi.map((q, i) => `
            <button type="button" id="nav${i + 1}" class="nav-btn" data-index="${i}">${i + 1}</button>
        `).join("");

        nav.querySelectorAll(".nav-btn").forEach(btn => {
            btn.addEventListener("click", () => showQuestion(Number(btn.dataset.index)));
        });
        updateNavState();
    }

    function bindQuestionEvents() {
        const box = $("#khuVucCauHoi");
        if (!box) return;

        box.addEventListener("change", e => {
            const el = e.target;
            const question = el.closest(".qe-question");
            if (!question) return;
            const index = Number(question.dataset.questionIndex);
            captureAnswer(index);
            updateNavState();
            saveSession();
        });

        box.addEventListener("input", e => {
            const el = e.target;
            if (!el.matches("input[type=text]")) return;
            const question = el.closest(".qe-question");
            if (!question) return;
            const index = Number(question.dataset.questionIndex);
            captureAnswer(index);
            updateNavState();
            saveSession();
        });

        box.addEventListener("click", e => {
            const btn = e.target.closest("[data-sort-action]");
            if (!btn) return;
            const question = btn.closest(".qe-question");
            if (!question) return;
            const index = Number(question.dataset.questionIndex);
            const action = btn.dataset.sortAction;
            moveOrderingItem(index, btn.dataset.sortId, action);
            e.preventDefault();
        });
    }

    function captureAnswer(index) {
        const q = deThi[index];
        const type = normalizeType(q);
        const root = $("#cau" + (index + 1));
        if (!root) return;

        if (type === "single_select" || type === "true_false") {
            const checked = root.querySelector("input[type=radio]:checked");
            answers[String(index)] = checked ? checked.value : "";
        }
        else if (type === "multi_select") {
            answers[String(index)] = [...root.querySelectorAll("input[type=checkbox]:checked")].map(x => x.value);
        }
        else if (type === "fill_blank") {
            const input = root.querySelector("input[type=text]");
            answers[String(index)] = input ? input.value.trim() : "";
        }
        else if (type === "matching") {
            const obj = {};
            root.querySelectorAll(".qe-match-select").forEach(select => {
                const left = select.dataset.matchLeft;
                obj[left] = select.value;
            });
            answers[String(index)] = obj;
        }
        else if (type === "ordering") {
            answers[String(index)] = [...root.querySelectorAll(".qe-sort-item")].map(x => x.dataset.sortId);
        }
    }

    function moveOrderingItem(index, id, direction) {
        const root = $("#cau" + (index + 1));
        if (!root) return;

        const list = root.querySelector(".qe-sort-list");
        const item = root.querySelector(`.qe-sort-item[data-sort-id="${CSS.escape(id)}"]`);
        if (!list || !item) return;

        if (direction === "up" && item.previousElementSibling) {
            list.insertBefore(item, item.previousElementSibling);
        }
        if (direction === "down" && item.nextElementSibling) {
            list.insertBefore(item.nextElementSibling, item);
        }

        captureAnswer(index);
        refreshOrderingPositions(root);
        updateNavState();
        saveSession();
    }

    function refreshOrderingPositions(root) {
        [...root.querySelectorAll(".qe-sort-item")].forEach((item, i, arr) => {
            const pos = item.querySelector(".qe-sort-pos");
            if (pos) pos.textContent = String(i + 1);
            const up = item.querySelector('[data-sort-action="up"]');
            const down = item.querySelector('[data-sort-action="down"]');
            if (up) up.disabled = i === 0;
            if (down) down.disabled = i === arr.length - 1;
        });
    }

    function hasAnswer(index) {
        const value = answers[String(index)];
        const type = normalizeType(deThi[index]);
        if (type === "multi_select") return Array.isArray(value) && value.length > 0;
        if (type === "matching") return value && typeof value === "object" && Object.values(value).some(Boolean);
        if (type === "ordering") return Array.isArray(value) && value.length > 0;
        return value !== undefined && value !== null && String(value).trim() !== "";
    }

    function updateNavState() {
        deThi.forEach((_, i) => {
            const btn = $("#nav" + (i + 1));
            if (!btn) return;
            btn.classList.toggle("done-question", hasAnswer(i));
            btn.classList.toggle("active", i === currentIndex);
            btn.setAttribute("aria-current", i === currentIndex ? "true" : "false");
        });

        const done = deThi.filter((_, i) => hasAnswer(i)).length;
        const doneEl = $("#soCauDaLam");
        const totalEl = $("#tongSoCau");
        if (doneEl) doneEl.textContent = done;
        if (totalEl) totalEl.textContent = deThi.length;

        updateBottomBar();
    }

    function showQuestion(index) {
        if (!deThi.length) return;
        currentIndex = Math.max(0, Math.min(index, deThi.length - 1));

        $$("#khuVucCauHoi .qe-question").forEach((q, i) => {
            q.classList.toggle("active-question", i === currentIndex);
        });

        updateNavState();

        const btn = $("#nav" + (currentIndex + 1));
        if (btn) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

        const active = $("#cau" + (currentIndex + 1));
        if (active) active.scrollIntoView({ behavior: "smooth", block: "nearest" });

        typesetMath(active);
        saveSession();
    }

    function updateBottomBar() {
        const label = $("#cauDangLamGiaoDien");
        const prev = $("#btnCauTruoc");
        const next = $("#btnCauTiep");
        if (label) label.textContent = `Câu đang làm: ${currentIndex + 1} / ${deThi.length}`;
        if (prev) prev.disabled = currentIndex <= 0 || submitted;
        if (next) next.disabled = currentIndex >= deThi.length - 1 || submitted;
    }

    /* =====================================================
       6. CHẤM ĐIỂM
    ===================================================== */

    function normalizeTF(v) {
        const s = String(v ?? "").trim().toLowerCase();
        if (["d", "đúng", "true", "a", "1"].includes(s)) return "D";
        if (["s", "sai", "false", "b", "0"].includes(s)) return "S";
        return s.toUpperCase();
    }

    function normalizeTextAnswer(v) {
        return String(v ?? "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();
    }

    function isCorrect(q, answer) {
        const type = normalizeType(q);
        const correct = getCorrectValues(q);

        if (type === "single_select") {
            return correct.some(c => sameValue(c, answer));
        }

        if (type === "true_false") {
            const expected = normalizeTF(correct[0]);
            return normalizeTF(answer) === expected;
        }

        if (type === "multi_select") {
            return arraySameUnordered(correct.map(String), (Array.isArray(answer) ? answer : []).map(String));
        }

        if (type === "fill_blank") {
            if (!correct.length) return false;
            const ans = normalizeTextAnswer(answer);
            return correct.some(c => normalizeTextAnswer(c) === ans);
        }

        if (type === "matching") {
            if (!answer || typeof answer !== "object") return false;
            const expected = Array.isArray(correct)
                ? correct.reduce((obj, pair) => {
                    if (pair && typeof pair === "object") obj[String(pair.A)] = String(pair.B);
                    return obj;
                }, {})
                : (correct && typeof correct === "object" ? correct : {});

            const keys = Object.keys(expected);
            if (!keys.length) return false;
            return keys.every(k => String(answer[k] ?? "") === String(expected[k] ?? ""));
        }

        if (type === "ordering") {
            const expected = correct.map(String);
            const actual = Array.isArray(answer) ? answer.map(String) : [];
            return expected.length === actual.length && expected.every((v, i) => v === actual[i]);
        }

        return false;
    }

    function scoreExam() {
        let correctCount = 0;
        let totalPoints = 0;
        let earnedPoints = 0;

        const details = deThi.map((q, index) => {
            const answer = answers[String(index)];
            const correct = isCorrect(q, answer);
            const point = Number(q.diem) > 0 ? Number(q.diem) : 1;
            totalPoints += point;
            if (correct) {
                correctCount++;
                earnedPoints += point;
            }
            return { q, index, answer, correct, point };
        });

        const percent = totalPoints > 0 ? Math.round(earnedPoints / totalPoints * 100) : 0;
        return { correctCount, totalPoints, earnedPoints, percent, details };
    }

    /* =====================================================
       7. HIỂN THỊ KẾT QUẢ
    ===================================================== */

    function getRank(percent) {
        if (percent >= 90) return "Xuất sắc";
        if (percent >= 80) return "Tốt";
        if (percent >= 70) return "Khá";
        if (percent >= 50) return "Đạt";
        return "Cần cố gắng";
    }

    function markResults(result) {
        result.details.forEach(({ index, correct }) => {
            const root = $("#cau" + (index + 1));
            const nav = $("#nav" + (index + 1));
            if (!root) return;

            root.classList.toggle("result-correct", correct);
            root.classList.toggle("result-wrong", !correct);
            if (nav) {
                nav.classList.remove("done-question", "dung-question", "sai-question");
                nav.classList.add(correct ? "dung-question" : "sai-question");
            }

            const type = normalizeType(deThi[index]);
            if (type === "single_select" || type === "true_false" || type === "multi_select") {
                root.querySelectorAll("input").forEach(input => {
                    input.disabled = true;
                });
            }
            root.querySelectorAll("select,input[type=text],button[data-sort-action]").forEach(el => {
                el.disabled = true;
            });

            const q = deThi[index];
            const correctValues = getCorrectValues(q);
            const note = document.createElement("div");
            note.className = correct ? "qe-result-note correct" : "qe-result-note wrong";
            note.innerHTML = correct
                ? "✅ Chính xác"
                : `❌ Chưa chính xác${correctValues.length ? " — đáp án chuẩn: " + esc(formatCorrectAnswer(q)) : ""}`;
            root.querySelector(".qe-question-content")?.appendChild(note);
        });
    }

    function formatCorrectAnswer(q) {
        const type = normalizeType(q);
        const correct = getCorrectValues(q);
        if (type === "matching") {
            return correct.map(x => `${x.A} → ${x.B}`).join(", ");
        }
        if (type === "ordering") return correct.join(" → ");
        return correct.join(", ");
    }

    function showResult(result, thuong) {
        let box = $("#ketQuaThiThu");
        if (!box) {
            box = document.createElement("section");
            box.id = "ketQuaThiThu";
            box.className = "ketqua-thithu";
            document.querySelector(".exam-container")?.appendChild(box);
        }

        box.innerHTML = `
            <h2>🎉 HOÀN THÀNH BÀI THI THỬ</h2>
            <div class="result-grid">
                <div><span>Đúng</span><strong>${result.correctCount}/${deThi.length}</strong></div>
                <div><span>Điểm</span><strong>${formatScore(result.earnedPoints, result.totalPoints)}</strong></div>
                <div><span>Tỷ lệ</span><strong>${result.percent}%</strong></div>
                <div><span>Xếp loại</span><strong>${esc(getRank(result.percent))}</strong></div>
            </div>
            ${thuong.ok ? `
    <div class="reward-xu-box">

        <div>
            🎉 <strong>THƯỞNG LUYỆN TẬP</strong>
        </div>

        <div class="reward-xu">
            💰 +${thuong.xuThuong} Xu
        </div>

        <div>
            🎯 Lượt luyện tập:
            <strong>
                ${thuong.soLuot}/${MAX_LUOT_LUYEN_TAP}
            </strong>
        </div>

        <div>
            🪙 Tổng Xu:
            <strong>
                ${thuong.tongXu}
            </strong>
        </div>

    </div>
` : `

    <div class="reward-xu-box max">

        🎯 Bạn đã sử dụng đủ

        <strong>
            ${MAX_LUOT_LUYEN_TAP} lượt
        </strong>

        luyện tập trong đợt này.

        <br><br>

        Không được cộng thêm Xu.

    </div>

`}
            <p class="result-note">Đây là bài thi thử. Kết quả dùng để luyện tập và thống kê lượt luyện tập.</p>
            <div class="result-buttons">
                <button type="button" id="btnLuyenLai">🔄 Luyện tập lại</button>
                <button type="button" id="btnTrangChu">🏠 Trang chủ</button>
            </div>
        `;

        box.style.display = "block";
        $("#btnLuyenLai", box)?.addEventListener("click", () => {
            clearSession();
            window.location.reload();
        });
        $("#btnTrangChu", box)?.addEventListener("click", () => {
            window.location.href = "index.html";
        });

        box.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function formatScore(earned, total) {
        if (!Number.isFinite(earned) || !Number.isFinite(total)) return "0";
        if (Math.abs(earned - Math.round(earned)) < 1e-9) return String(Math.round(earned));
        return earned.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
    }

    /* =====================================================
       8. NỘP BÀI
    ===================================================== */

    window.nopBaiThiThu = function (auto = false) {
        if (submitted) return;

        // Chốt câu đang làm trước khi chấm.
        captureAnswer(currentIndex);

        if (!auto) {
            const unanswered = deThi.filter((_, i) => !hasAnswer(i)).length;
            const msg = unanswered
                ? `Bạn còn ${unanswered} câu chưa trả lời.\n\nBạn có chắc chắn muốn nộp bài?`
                : "Bạn có chắc chắn muốn nộp bài?";
            if (!confirm(msg)) return;
        }

        submitted = true;
        clearInterval(timerId);
        saveSession();

        const result = scoreExam();

// Cộng lượt + Xu trước
const thuong = ghiNhanLuotLuyenTap();

markResults(result);
showResult(result, thuong);

        const submit = $(".submit-btn");
        if (submit) {
            submit.textContent = "ĐÃ NỘP BÀI";
            submit.disabled = true;
        }

        localStorage.setItem("thiThu_lastResult_" + maThiSinh, JSON.stringify({
            maKyThi,
            mon,
            correctCount: result.correctCount,
            totalQuestions: deThi.length,
            earnedPoints: result.earnedPoints,
            totalPoints: result.totalPoints,
            percent: result.percent,
            submittedAt: new Date().toISOString()
        }));

        guiLuotLuyenTap();
        typesetMath();
    };

    // Tương thích nút onclick cũ.
    window.nopBai = function () {
        window.nopBaiThiThu(false);
    };

    /* =====================================================
       9. ĐỒNG HỒ
    ===================================================== */

    function updateTimer() {
        const el = $("#timer");
        if (!el) return;

        const minutes = Math.floor(Math.max(0, remainingSeconds) / 60);
        const seconds = Math.max(0, remainingSeconds) % 60;
        el.textContent = `${minutes}:${String(seconds).padStart(2, "0")}`;

        if (remainingSeconds <= 60) {
            el.classList.add("timer-danger");
        } else if (remainingSeconds <= 300) {
            el.classList.add("timer-warning");
        }
    }

    function startTimer() {
        clearInterval(timerId);
        updateTimer();
        timerId = setInterval(() => {
            if (submitted) return;
            remainingSeconds--;
            updateTimer();
            if (remainingSeconds <= 0) {
                remainingSeconds = 0;
                clearInterval(timerId);
                alert("⏰ Đã hết thời gian làm bài. Hệ thống sẽ tự động nộp bài.");
                window.nopBaiThiThu(true);
            }
            if (remainingSeconds % 5 === 0) saveSession();
        }, 1000);
    }

    /* =====================================================
       10. MATHJAX
    ===================================================== */

    function typesetMath(root) {
        if (!window.MathJax || typeof window.MathJax.typesetPromise !== "function") return;
        const target = root || $("#khuVucCauHoi");
        if (!target) return;
        window.MathJax.typesetPromise([target]).catch(err => {
            console.warn("⚠️ MathJax typeset lỗi:", err);
        });
    }

    /* =====================================================
       11. THÔNG TIN THÍ SINH / KỲ THI
    ===================================================== */

    function fillCandidateInfo() {
        const map = {
            "#tenThiSinh": localStorage.getItem("tenThiSinh") || localStorage.getItem("hoTen") || "",
            "#ngaySinh": localStorage.getItem("ngaySinh") || "",
            "#lopThiSinh": localStorage.getItem("lopThiSinh") || localStorage.getItem("lop") || ""
        };
        Object.entries(map).forEach(([selector, value]) => {
            const el = $(selector);
            if (el) el.textContent = value;
        });

        const banner = $("#examBanner");
        if (banner) {
            const subject = mon || "Thi thử";
            banner.innerHTML = `THI THỬ OLYMPIC HỌC SINH GIỎI <span style="display:block;font-size:.68em;color:#fff;background:#1689e8;border-radius:12px;padding:6px 18px;margin:7px auto 0;width:max-content;max-width:70%">MÔN ${esc(subject.replace(/^môn\s*/i, ""))}</span>`;
        }
    }

    /* =====================================================
       12. GỬI LƯỢT LUYỆN TẬP
       Không phụ thuộc formURL chưa khai báo.
       Hỗ trợ URL cấu hình trong localStorage.
    ===================================================== */

    async function guiLuotLuyenTap() {
        const formURL =
            localStorage.getItem("formURLThiThu") ||
            localStorage.getItem("formURL") ||
            "";

        if (!formURL) {
            console.info("ℹ️ Chưa cấu hình formURLThiThu – bỏ qua gửi lượt luyện tập.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("entry.131085548", localStorage.getItem("maThiSinh") || "");
            formData.append("entry.766043376", localStorage.getItem("tenThiSinh") || localStorage.getItem("hoTen") || "");
            formData.append("entry.1278051019", localStorage.getItem("lopThiSinh") || localStorage.getItem("lop") || "");
            formData.append("entry.145947204", "1");

            await fetch(formURL, {
                method: "POST",
                mode: "no-cors",
                body: formData
            });
            console.log("✅ Đã gửi lượt luyện tập.");
        } catch (e) {
            console.warn("⚠️ Không gửi được lượt luyện tập:", e);
        }
    }

    /* =====================================================
       13. KHỞI ĐỘNG
    ===================================================== */

    function exposeNavigation() {
        window.diDenCau = showQuestion;
        window.cauTruocGiaoDien = () => showQuestion(currentIndex - 1);
        window.cauTiepGiaoDien = () => showQuestion(currentIndex + 1);
    }

    function start() {

    // =====================================================
    // B4 - KIỂM TRA TỐI ĐA 5 LƯỢT LUYỆN TẬP
    // Nếu đang có bài làm dở thì vẫn cho phép tiếp tục.
    // =====================================================
    const sessionDangLam = !!localStorage.getItem(sessionKey);

    if (!sessionDangLam && !conLuotLuyenTap()) {

        alert(
            "🔒 Bạn đã sử dụng đủ 5 lượt luyện tập trong đợt này.\n\n" +
            "Không thể tạo lượt luyện tập mới."
        );

        const box = document.getElementById("khuVucCauHoi");

        if (box) {
            box.innerHTML = `
                <div style="
                    max-width:700px;
                    margin:40px auto;
                    padding:35px 25px;
                    text-align:center;
                    background:#fff7ed;
                    border:2px solid #fed7aa;
                    border-radius:20px;
                    color:#9a3412;
                    box-shadow:0 8px 25px rgba(0,0,0,.08);
                ">

                    <div style="font-size:52px;margin-bottom:10px;">
                        🔒
                    </div>

                    <h2 style="
                        margin:10px 0;
                        color:#c2410c;
                    ">
                        Đã hết lượt luyện tập
                    </h2>

                    <p style="
                        font-size:18px;
                        line-height:1.7;
                        margin:10px 0;
                    ">
                        Bạn đã sử dụng đủ
                        <strong>5/5 lượt luyện tập</strong>
                        trong đợt này.
                    </p>

                    <p style="
                        font-size:16px;
                        line-height:1.6;
                        color:#7c2d12;
                    ">
                        Vui lòng chờ đợt luyện tập mới để tiếp tục.
                    </p>

                </div>
            `;
        }

        return;
    }


    // =====================================================
    // PHẦN KHỞI ĐỘNG BÀI THI
    // =====================================================

    fillCandidateInfo();

    const restored = loadSession();

    if (!restored) {

        deThi = buildExam();
        answers = {};
        remainingSeconds = config.thoiGian * 60;
        currentIndex = 0;

        saveSession();
    }

    if (!deThi.length) {
        alert("❌ Không tạo được đề thi thử.");
        return;
    }

    exposeNavigation();
    renderAll();
    startTimer();

    const total = $("#tongSoCau");

    if (total) {
        total.textContent = deThi.length;
    }


    // =====================================================
    // PHÍM MŨI TÊN CHUYỂN CÂU
    // =====================================================

    document.addEventListener("keydown", e => {

        if (submitted) return;

        if (e.key === "ArrowLeft") {
            showQuestion(currentIndex - 1);
        }

        if (e.key === "ArrowRight") {
            showQuestion(currentIndex + 1);
        }

    });


    // =====================================================
    // TỰ ĐỘNG LƯU BÀI
    // =====================================================

    window.addEventListener("beforeunload", saveSession);

    document.addEventListener("visibilitychange", () => {

        if (document.visibilityState === "hidden") {
            saveSession();
        }

    });


    // =====================================================
    // DEBUG
    // =====================================================

    console.log("✅ THITHU v3 khởi động");
    console.log("📚 Ngân hàng:", bank.length);
    console.log("📝 Đề thi:", deThi.length);
    console.log("⏱️ Thời gian:", config.thoiGian, "phút");
    console.log("🎯 Lượt đã dùng:", getSoLuotLuyenTap(), "/5");
    console.log("💰 Xu hiện có:", getSoXu());
    console.log("⚙️ Cấu hình:", config);
}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        start,
        { once: true }
    );

} else {

    start();

}

})();
