/*
=========================================================
 OLYMPIC HSG ONLINE
 QUESTION ENGINE v3
 GIAI ĐOẠN 1
=========================================================

 Hỗ trợ:
 MCQ       : Trắc nghiệm 1 đáp án
 MULTI     : Nhiều đáp án
 TRUEFALSE : Đúng / Sai
 FILL      : Điền từ
 MATCH     : Ghép nối
 SORT      : Sắp xếp
 SHORT     : Trả lời ngắn
 IMAGE     : Hình ảnh
 READING   : Đọc hiểu
 AUDIO     : Nghe hiểu
 ESSAY     : Tự luận
 CODE      : Code / Tin học

 TƯƠNG THÍCH ĐỀ CŨ:
 Nếu câu hỏi không có "loai"
 => mặc định là MCQ
=========================================================
*/


/* =====================================================
   1. KIỂM TRA NGÂN HÀNG CÂU HỎI
===================================================== */

if (typeof cauHoi === "undefined") {

    alert("Không tìm thấy file đề!");

    window.location.href = "chonkithi.html";

    throw new Error("Không tìm thấy biến cauHoi");
}


/* =====================================================
   2. DANH SÁCH LOẠI CÂU HỎI
===================================================== */

const QUESTION_TYPES = {

    MCQ: "MCQ",

    MULTI: "MULTI",

    TRUEFALSE: "TRUEFALSE",

    FILL: "FILL",

    MATCH: "MATCH",

    SORT: "SORT",

    SHORT: "SHORT",

    IMAGE: "IMAGE",

    READING: "READING",

    AUDIO: "AUDIO",

    ESSAY: "ESSAY",

    CODE: "CODE"

};


/* =====================================================
   3. BIẾN HỆ THỐNG
===================================================== */

const soCau =
    parseInt(localStorage.getItem("soCau")) ||
    cauHoi.length;


/* =====================================================
   3A. TỶ LỆ LOẠI CÂU HỎI
   -----------------------------------------------------
   Có thể cấu hình theo kỳ thi bằng localStorage:
   localStorage.setItem("tyLeLoaiCau", JSON.stringify({
       MCQ: 40,
       TRUEFALSE: 20,
       MULTI: 13,
       FILL: 10,
       MATCH: 10,
       SORT: 7
   }));

   Tổng không bắt buộc đúng 100; hệ thống sẽ tự chuẩn hóa.
   Nếu ngân hàng thiếu một loại, phần thiếu sẽ tự phân bổ
   sang các loại còn lại theo tỷ lệ.
===================================================== */

const TY_LE_LOAI_CAU_MAC_DINH = {
    MCQ: 40,
    TRUEFALSE: 20,
    MULTI: 13,
    FILL: 10,
    MATCH: 10,
    SORT: 7
};

function docTyLeLoaiCau() {

    try {

        const raw =
            localStorage.getItem("tyLeLoaiCau");

        if (!raw) {
            return { ...TY_LE_LOAI_CAU_MAC_DINH };
        }

        const cfg =
            JSON.parse(raw);

        const result = {};

        Object.keys(TY_LE_LOAI_CAU_MAC_DINH)
            .forEach(type => {

                const value =
                    Number(cfg[type]);

                result[type] =
                    Number.isFinite(value) && value >= 0
                        ? value
                        : TY_LE_LOAI_CAU_MAC_DINH[type];

            });

        const tong =
            Object.values(result)
                .reduce((a, b) => a + b, 0);

        return tong > 0
            ? result
            : { ...TY_LE_LOAI_CAU_MAC_DINH };

    }
    catch (e) {

        console.warn(
            "Không đọc được tyLeLoaiCau, dùng tỷ lệ mặc định.",
            e
        );

        return { ...TY_LE_LOAI_CAU_MAC_DINH };

    }

}


/* Lấy loại câu thống nhất với toàn bộ Question Engine. */
function layLoaiCauThongNhat(cau) {

    const raw =
        String(
            cau?.loai ||
            cau?.type ||
            "MCQ"
        )
        .trim()
        .toUpperCase();

    const alias = {

        "SINGLE_SELECT": "MCQ",
        "SINGLE-SELECT": "MCQ",
        "MCQ": "MCQ",

        "TRUE_FALSE": "TRUEFALSE",
        "TRUE-FALSE": "TRUEFALSE",
        "TRUEFALSE": "TRUEFALSE",

        "MULTI_SELECT": "MULTI",
        "MULTI-SELECT": "MULTI",
        "MULTI": "MULTI",

        "FILL_BLANK": "FILL",
        "FILL-BLANK": "FILL",
        "FILL": "FILL",

        "MATCHING": "MATCH",
        "MATCH": "MATCH",

        "ORDERING": "SORT",
        "ORDER": "SORT",
        "SORT": "SORT"

    };

    return alias[raw] || raw;

}


/* Trộn mảng nhưng không làm thay đổi ngân hàng gốc. */
function tronMang(arr) {

    const result = [...arr];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];

    }

    return result;

}


/*
 * Chia số câu theo tỷ lệ bằng phương pháp
 * "largest remainder", sau đó tự bù phần thiếu.
 */
function tinhSoLuongTheoTyLe(soLuong, groups, tyLe) {

    const types =
        Object.keys(tyLe)
            .filter(type => groups[type]?.length);

    if (!types.length) {
        return {};
    }

    const tongTyLe =
        types.reduce(
            (sum, type) => sum + Number(tyLe[type] || 0),
            0
        );

    if (tongTyLe <= 0) {
        return {};
    }

    const raw = {};
    const counts = {};
    const fractions = [];

    types.forEach(type => {

        const exact =
            soLuong *
            (Number(tyLe[type] || 0) / tongTyLe);

        const floorValue =
            Math.floor(exact);

        raw[type] = exact;
        counts[type] = floorValue;

        fractions.push({
            type,
            fraction: exact - floorValue
        });

    });

    /*
     * Không được lấy quá số câu thực tế của từng loại.
     */
    types.forEach(type => {

        counts[type] =
            Math.min(
                counts[type],
                groups[type].length
            );

    });

    let used =
        Object.values(counts)
            .reduce((a, b) => a + b, 0);

    /*
     * Phân bổ từng câu còn thiếu theo:
     * 1. còn sức chứa;
     * 2. tỷ lệ còn thiếu lớn hơn.
     */
    while (used < soLuong) {

        const candidates =
            types
                .filter(type =>
                    counts[type] <
                    groups[type].length
                )
                .map(type => {

                    const deficiency =
                        raw[type] -
                        counts[type];

                    return {
                        type,
                        deficiency
                    };

                })
                .sort(
                    (a, b) =>
                        b.deficiency -
                        a.deficiency
                );

        if (!candidates.length) {
            break;
        }

        counts[candidates[0].type]++;
        used++;

    }

    return counts;

}


/*
 * Chọn đề theo tỷ lệ loại câu.
 *
 * Nếu Toán hiện chỉ có MCQ:
 * → hệ thống tự lấy MCQ.
 *
 * Khi ngân hàng được bổ sung TRUEFALSE/MULTI/FILL/MATCH/SORT:
 * → thuật toán tự phân bổ theo tỷ lệ cấu hình.
 */
function taoDeTheoTyLeLoaiCau(nganHang, soLuong) {

    const groups = {};

    nganHang.forEach(cau => {

        const type =
            layLoaiCauThongNhat(cau);

        if (!groups[type]) {
            groups[type] = [];
        }

        groups[type].push(cau);

    });

    const tyLe =
        docTyLeLoaiCau();

    const soLuongTheoLoai =
        tinhSoLuongTheoTyLe(
            Math.min(
                soLuong,
                nganHang.length
            ),
            groups,
            tyLe
        );

    const ketQua = [];

    Object.keys(soLuongTheoLoai)
        .forEach(type => {

            const soLuongCanLay =
                soLuongTheoLoai[type];

            if (soLuongCanLay <= 0) {
                return;
            }

            const pool =
                tronMang(groups[type]);

            ketQua.push(
                ...pool.slice(
                    0,
                    soLuongCanLay
                )
            );

        });

    /*
     * Nếu vì ngân hàng quá nhỏ hoặc thiếu loại câu
     * mà vẫn chưa đủ số câu, lấy bổ sung từ toàn bộ
     * ngân hàng nhưng ưu tiên câu chưa được chọn.
     */
    if (ketQua.length < soLuong) {

        const daChon =
            new Set(
                ketQua.map(cau => cau.id)
            );

        const conLai =
            tronMang(
                nganHang.filter(
                    cau => !daChon.has(cau.id)
                )
            );

        ketQua.push(
            ...conLai.slice(
                0,
                soLuong - ketQua.length
            )
        );

    }

    /*
     * Trộn lần cuối để các loại câu không xuất hiện
     * thành từng cụm MCQ → TRUEFALSE → FILL...
     */
    return tronMang(
        ketQua.slice(
            0,
            soLuong
        )
    );

}


/*
 * =====================================================
 * PHIÊN THI - GIỮ NGUYÊN ĐỀ, ĐÁP ÁN VÀ THỜI GIAN KHI F5
 * =====================================================
 */
const examSessionKey =
    "baiThiDangLam_v2_" +
    String(localStorage.getItem("maThiSinh") || "unknown") +
    "_" +
    String(localStorage.getItem("fileDe") || localStorage.getItem("tenKyThi") || "de");

let examSavedState = null;

try {
    examSavedState = JSON.parse(
        localStorage.getItem(examSessionKey) || "null"
    );
} catch (e) {
    examSavedState = null;
}

/* Chọn đề mới nếu chưa có phiên; nếu F5 thì khôi phục đúng đề cũ */
let deThi;

if (
    examSavedState &&
    Array.isArray(examSavedState.questionIds)
) {
    const byId = new Map(
        cauHoi.map(cau => [String(cau.id), cau])
    );

    const restoredDe = examSavedState.questionIds
        .map(id => byId.get(String(id)))
        .filter(Boolean);

    if (restoredDe.length === examSavedState.questionIds.length) {
        deThi = restoredDe;
    }
}

if (!Array.isArray(deThi) || deThi.length === 0) {
    deThi = taoDeTheoTyLeLoaiCau(
        cauHoi,
        Math.min(soCau, cauHoi.length)
    );
}


/*
 * Lưu thống kê loại câu của đề vừa sinh.
 * Dùng cho trang kết quả/phân tích giáo viên sau này.
 */
const thongKeLoaiCauDeThi = {};

deThi.forEach(cau => {

    const type =
        layLoaiCauThongNhat(cau);

    thongKeLoaiCauDeThi[type] =
        (thongKeLoaiCauDeThi[type] || 0) + 1;

});

localStorage.setItem(
    "tyLeLoaiCauDeThi",
    JSON.stringify(thongKeLoaiCauDeThi)
);


/*
   Lưu câu trả lời của học sinh
*/

const cauTraLoi =
    examSavedState &&
    examSavedState.answers &&
    typeof examSavedState.answers === "object"
        ? { ...examSavedState.answers }
        : {};


/*
   Trạng thái
*/

let daNopBai = false;
let soLanRoiTab = 0;
let soLanBack = 0;
let timer = null;

// Thời gian còn lại của đồng hồ, tính bằng giây
let timeValue = 0;
let examEndTime =
    examSavedState && Number(examSavedState.endTime)
        ? Number(examSavedState.endTime)
        : null;


/* =====================================================
   LƯU / KHÔI PHỤC PHIÊN THI
===================================================== */
function luuTrangThaiThi() {
    if (daNopBai) return;

    try {
        localStorage.setItem(
            examSessionKey,
            JSON.stringify({
                questionIds: deThi.map(cau => String(cau.id)),
                answers: cauTraLoi,
                endTime: examEndTime || null,
                savedAt: Date.now()
            })
        );
    } catch (e) {
        console.warn("Không thể lưu phiên thi:", e);
    }
}

function khoiPhucCauTraLoi() {
    deThi.forEach(function (_, index) {
        const answer = cauTraLoi[index];
        if (answer === undefined) return;

        const question = document.getElementById(`cau${index + 1}`);
        if (!question) return;

        /* Radio / checkbox */
        question.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(function (input) {
            const value = String(input.value);
            if (Array.isArray(answer)) {
                input.checked = answer.map(String).includes(value);
            } else {
                input.checked = String(answer) === value;
            }
        });

        /* Input / textarea */
        question.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea').forEach(function (input) {
            if (typeof answer === "string" || typeof answer === "number") {
                input.value = answer;
            }
        });

        /* Ghép nối */
        if (answer && typeof answer === "object" && !Array.isArray(answer)) {
            question.querySelectorAll('select[data-qe-match]').forEach(function (select) {
                const left = select.dataset.left;
                select.value = answer[left] != null ? answer[left] : "";
            });
        }

        /* Các select thông thường */
        if (Array.isArray(answer)) {
            question.querySelectorAll('select:not([data-qe-match])').forEach(function (select, i) {
                select.value = answer[i] != null ? answer[i] : "";
            });
        }

        /* Khôi phục thứ tự kéo-thả */
        if (Array.isArray(answer) && answer.length) {
            const list = question.querySelector('.qe-sort-list');
            if (list) {
                const items = [...list.querySelectorAll('.qe-sort-item')];
                answer.forEach(function (value) {
                    const item = items.find(function (el) {
                        return String(el.dataset.sortValue) === String(value);
                    });
                    if (item) list.appendChild(item);
                });
            }
        }
    });

    capNhatTienDo();
}

/* =====================================================
   4. CSS CHO QUESTION ENGINE
===================================================== */

function themCSSQuestionEngine() {

    if (
        document.getElementById(
            "question-engine-style"
        )
    ) {
        return;
    }


    const style =
        document.createElement("style");


    style.id =
        "question-engine-style";


    style.textContent = `

        .qe-question {

            background:#ffffff;

            border-radius:18px;

            padding:20px;

            margin:18px 0;

            border:1px solid #e5e7eb;

            box-shadow:
                0 5px 18px
                rgba(0,0,0,.07);

        }


        .qe-question-header {

            display:flex;

            align-items:center;

            gap:10px;

            margin-bottom:15px;

        }


        .qe-question-number {

            width:38px;

            height:38px;

            border-radius:50%;

            display:flex;

            align-items:center;

            justify-content:center;

            background:#eef4ff;

            color:#2563eb;

            font-weight:bold;

            flex-shrink:0;

        }


        .qe-type-badge {

            padding:5px 10px;

            border-radius:20px;

            font-size:12px;

            background:#f1f5f9;

            color:#475569;

        }


        .qe-question-content {

            font-size:16px;

            line-height:1.65;

        }


        .qe-option {

            display:block;

            padding:12px 14px;

            margin:9px 0;

            border:1px solid #dbe3ee;

            border-radius:12px;

            cursor:pointer;

            background:#fff;

            transition:.2s;

        }


        .qe-option:hover {

            background:#f8fbff;

            border-color:#60a5fa;

        }


        .qe-option input {

            margin-right:8px;

        }


        .qe-input {

            width:100%;

            box-sizing:border-box;

            padding:11px 13px;

            border:1px solid #cbd5e1;

            border-radius:10px;

            font-size:16px;

            margin-top:10px;

        }


        .qe-input:focus {

            outline:none;

            border-color:#3b82f6;

            box-shadow:
                0 0 0 3px
                rgba(59,130,246,.12);

        }


        .qe-match-grid {

            display:grid;

            grid-template-columns:
                1fr 1fr;

            gap:12px;

            margin-top:15px;

        }


        .qe-match-item {

            padding:13px;

            border:1px solid #dbe3ee;

            border-radius:10px;

            background:#f8fafc;

        }


        .qe-match-item select {

            width:100%;

            margin-top:8px;

            padding:9px;

            border:1px solid #cbd5e1;

            border-radius:8px;

        }


        .qe-sort-list {

            list-style:none;

            padding:0;

            margin:15px 0;

        }


        .qe-sort-item {

            padding:13px;

            margin:7px 0;

            border:1px solid #dbe3ee;

            border-radius:10px;

            background:#f8fafc;

            cursor:grab;

        }


        .qe-sort-item.dragging {

            opacity:.5;

        }


        .qe-media {

            max-width:100%;

            display:block;

            margin:12px auto;

            border-radius:12px;

        }


        .qe-question-image {

            width:100%;

            display:flex;

            justify-content:center;

            align-items:center;

            margin:12px 0 18px;

        }


        .qe-question-image .qe-media {

            max-width:100%;

            max-height:420px;

            width:auto;

            height:auto;

            object-fit:contain;

        }


        .qe-reading {

            padding:18px;

            background:#f8fafc;

            border-left:5px solid #3b82f6;

            border-radius:10px;

            margin-bottom:18px;

            white-space:pre-wrap;

            line-height:1.8;

        }


        .qe-audio {

            width:100%;

            margin:10px 0 15px;

        }


        .qe-essay {

            min-height:150px;

            resize:vertical;

        }


        .qe-help {

            margin-top:8px;

            font-size:13px;

            color:#64748b;

        }


        .done-question {

            background:#22c55e !important;

            color:white !important;

        }


        @media(max-width:700px) {

            .qe-match-grid {

                grid-template-columns:1fr;

            }

        }

    `;


    document.head.appendChild(style);
}


/* =====================================================
   5. LẤY LOẠI CÂU HỎI
===================================================== */

function getLoaiCau(cau) {

    return String(

        cau.loai ||

        cau.type ||

        "MCQ"

    )
    .trim()
    .toUpperCase();

}


/* =====================================================
   6. ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");
}


/* =====================================================
   7. TÊN HIỂN THỊ LOẠI CÂU
===================================================== */

function tenLoaiCau(loai) {

    const names = {

        MCQ:
            "Trắc nghiệm",

        MULTI:
            "Nhiều đáp án",

        TRUEFALSE:
            "Đúng / Sai",

        FILL:
            "Điền từ",

        MATCH:
            "Ghép nối",

        SORT:
            "Sắp xếp",

        SHORT:
            "Trả lời ngắn",

        IMAGE:
            "Hình ảnh",

        READING:
            "Đọc hiểu",

        AUDIO:
            "Nghe hiểu",

        ESSAY:
            "Tự luận",

        CODE:
            "Tin học / Code"

    };


    return names[loai] || loai;
}


/* =====================================================
   8. BADGE
===================================================== */

function taoBadge(loai) {

    return `

        <span class="qe-type-badge">

            ${tenLoaiCau(loai)}

        </span>

    `;

}


/* =====================================================
   9. TRẮC NGHIỆM
===================================================== */

function renderMCQ(cau, index) {

    const options =
        ["A", "B", "C", "D"];


    return options

        .filter(key =>
            cau[key] !== undefined &&
            cau[key] !== ""
        )

        .map(key => `

            <label class="qe-option">

                <input

                    type="radio"

                    name="cau${index + 1}"

                    value="${escapeHTML(key)}"

                >

                <strong>${key}.</strong>

                ${escapeHTML(cau[key])}

            </label>

        `)

        .join("");

}


/* =====================================================
   10. NHIỀU ĐÁP ÁN
===================================================== */

function renderMULTI(cau, index) {

    const options =
        ["A", "B", "C", "D"];


    return options

        .filter(key =>
            cau[key] !== undefined &&
            cau[key] !== ""
        )

        .map(key => `

            <label class="qe-option">

                <input

                    type="checkbox"

                    name="cau${index + 1}"

                    value="${escapeHTML(key)}"

                >

                <strong>${key}.</strong>

                ${escapeHTML(cau[key])}

            </label>

        `)

        .join("");

}


/* =====================================================
   11. ĐÚNG / SAI
===================================================== */

function renderTRUEFALSE(cau, index) {

    return `

        <label class="qe-option">

            <input

                type="radio"

                name="cau${index + 1}"

                value="D"

            >

            Đúng

        </label>


        <label class="qe-option">

            <input

                type="radio"

                name="cau${index + 1}"

                value="S"

            >

            Sai

        </label>

    `;

}


/* =====================================================
   12. ĐIỀN TỪ
===================================================== */

function renderFILL(cau, index) {

    return `

        <input

            class="qe-input"

            type="text"

            id="answer${index + 1}"

            placeholder="${
                escapeHTML(
                    cau.placeholder ||
                    "Nhập câu trả lời..."
                )
            }"

            autocomplete="off"

        >

    `;

}


/* =====================================================
   13. TRẢ LỜI NGẮN
===================================================== */

function renderSHORT(cau, index) {

    return `

        <input

            class="qe-input"

            type="text"

            id="answer${index + 1}"

            placeholder="Nhập câu trả lời..."

            autocomplete="off"

        >

    `;

}


/* =====================================================
   14. GHÉP NỐI
===================================================== */

function renderMATCH(cau, index) {

    const cotA =
        Array.isArray(cau.cotA)
            ? cau.cotA
            : [];


    const cotB =
        Array.isArray(cau.cotB)
            ? cau.cotB
            : [];


    return `

        <div class="qe-match-grid">

            ${cotA.map((item, i) => {

                const id =
                    item.id ||
                    String.fromCharCode(
                        65 + i
                    );

                const text =
                    item.text ??
                    item.label ??
                    item.value ??
                    item;


                return `

                    <div
                        class="qe-match-item"
                    >

                        <strong>
                            ${escapeHTML(id)}
                        </strong>.

                        ${escapeHTML(text)}

                        <select
                            data-qe-match="${index}"
                            data-left="${escapeHTML(id)}"
                        >

                            <option value="">
                                -- Chọn --
                            </option>

                            ${cotB.map(
                                (right, j) => {

                                    const rid =
                                        right.id ||
                                        String(j + 1);

                                    const rtext =
                                        right.text ??
                                        right.label ??
                                        right.value ??
                                        right;

                                    return `

                                        <option
                                            value="${escapeHTML(rid)}"
                                        >

                                            ${escapeHTML(rtext)}

                                        </option>

                                    `;

                                }
                            ).join("")}

                        </select>

                    </div>

                `;

            }).join("")}

        </div>

    `;

}


/* =====================================================
   15. SẮP XẾP
===================================================== */

function renderSORT(cau, index) {

    const items =
        Array.isArray(cau.items)
            ? cau.items
            : [];


    return `

        <ul

            class="qe-sort-list"

            id="sort${index + 1}"

            data-qe-sort="${index}"

        >

            ${items.map(
                (item, i) => {

                    const id =
                        item.id ||
                        String(i);

                    const text =
                        item.text ??
                        item.label ??
                        item.value ??
                        item;


                    return `

                        <li

                            class="qe-sort-item"

                            draggable="true"

                            data-sort-value="${escapeHTML(id)}"

                        >

                            ☰

                            ${escapeHTML(text)}

                        </li>

                    `;

                }

            ).join("")}

        </ul>


        <div class="qe-help">

            Kéo các mục để sắp xếp.

        </div>

    `;

}


/* =====================================================
   16. CÂU CÓ HÌNH ẢNH
===================================================== */

function renderIMAGE(cau, index) {

    const src =
        cau.hinhAnh ||
        cau.image ||
        cau.anh ||
        "";


    return `

        ${
            src

            ?

            `
                <img
                    class="qe-media"
                    src="${escapeHTML(src)}"
                    alt="Hình câu hỏi"
                >
            `

            :

            ""
        }


        ${renderKieuTraLoiMedia(cau, index)}

    `;

}


/* =====================================================
   17. ĐỌC HIỂU
===================================================== */

function renderREADING(cau, index) {

    const vanBan =
        cau.vanBan ||
        cau.doanVan ||
        cau.text ||
        "";


    return `

        <div class="qe-reading">

            ${escapeHTML(vanBan)}

        </div>


        ${renderKieuTraLoiMedia(cau, index)}

    `;

}


/* =====================================================
   18. AUDIO
===================================================== */

function renderAUDIO(cau, index) {

    const src =
        cau.audio ||
        cau.amThanh ||
        "";


    return `

        ${
            src

            ?

            `
                <audio
                    class="qe-audio"
                    controls
                    src="${escapeHTML(src)}"
                ></audio>
            `

            :

            ""
        }


        ${renderKieuTraLoiMedia(cau, index)}

    `;

}


/* =====================================================
   19. KIỂU TRẢ LỜI CỦA IMAGE / AUDIO / READING
===================================================== */

function renderKieuTraLoiMedia(cau, index) {

    const kieu =
        String(
            cau.kieuTraLoi ||
            cau.answerType ||
            "MCQ"
        ).toUpperCase();


    switch(kieu) {

        case "MULTI":

            return renderMULTI(
                cau,
                index
            );


        case "TRUEFALSE":

            return renderTRUEFALSE(
                cau,
                index
            );


        case "FILL":

            return renderFILL(
                cau,
                index
            );


        case "SHORT":

            return renderSHORT(
                cau,
                index
            );


        default:

            return renderMCQ(
                cau,
                index
            );

    }

}


/* =====================================================
   20. TỰ LUẬN
===================================================== */

function renderESSAY(cau, index) {

    return `

        <textarea

            class="qe-input qe-essay"

            id="answer${index + 1}"

            placeholder="Nhập câu trả lời..."

        ></textarea>


        <div class="qe-help">

            Câu này sẽ được lưu để giáo viên chấm.

        </div>

    `;

}


/* =====================================================
   21. CODE
===================================================== */

function renderCODE(cau, index) {

    return `

        <textarea

            class="qe-input qe-essay"

            id="answer${index + 1}"

            placeholder="Nhập mã lệnh / câu trả lời..."

        ></textarea>

    `;

}


/* =====================================================
   22. RENDER THÂN CÂU HỎI
===================================================== */

function renderQuestionBody(cau, index) {

    const loai =
        getLoaiCau(cau);

    const src =
        cau.image ||
        cau.hinhAnh ||
        cau.anh ||
        "";

    let hinhHTML = "";

    if (src && loai !== "IMAGE") {
        hinhHTML = `
            <div class="qe-question-image">
                <img
                    class="qe-media"
                    src="${escapeHTML(src)}"
                    alt="Hình minh họa câu hỏi"
                >
            </div>
        `;
    }

    let noiDung = "";

    switch (loai) {

        case "MCQ":
            noiDung = renderMCQ(cau, index);
            break;

        case "MULTI":
            noiDung = renderMULTI(cau, index);
            break;

        case "TRUEFALSE":
            noiDung = renderTRUEFALSE(cau, index);
            break;

        case "FILL":
            noiDung = renderFILL(cau, index);
            break;

        case "MATCH":
            noiDung = renderMATCH(cau, index);
            break;

        case "SORT":
            noiDung = renderSORT(cau, index);
            break;

        case "SHORT":
            noiDung = renderSHORT(cau, index);
            break;

        case "IMAGE":
            return renderIMAGE(cau, index);

        case "READING":
            noiDung = renderREADING(cau, index);
            break;

        case "AUDIO":
            noiDung = renderAUDIO(cau, index);
            break;

        case "ESSAY":
            noiDung = renderESSAY(cau, index);
            break;

        case "CODE":
            noiDung = renderCODE(cau, index);
            break;

        default:
            noiDung = renderMCQ(cau, index);
            break;
    }

    return hinhHTML + noiDung;
}


/* =====================================================
   23. HIỂN THỊ TOÀN BỘ CÂU HỎI
===================================================== */

function hienThiCauHoi() {

    const container =
        document.getElementById(
            "khuVucCauHoi"
        );


    if (!container) {

        console.error(
            "Không tìm thấy khuVucCauHoi"
        );

        return;

    }


    let html = "";


    deThi.forEach(
        (cau, index) => {

            const loai =
                getLoaiCau(cau);


            html += `

                <div

                    class="
                        question
                        qe-question
                    "

                    id="cau${index + 1}"

                    data-question-index="${index}"

                    data-question-type="${escapeHTML(loai)}"

                >

                    <div
                        class="qe-question-header"
                    >

                        <div
                            class="qe-question-number"
                        >

                            ${index + 1}

                        </div>


                        ${taoBadge(loai)}

                    </div>


                    <div
                        class="qe-question-content"
                    >

                        ${
                            cau.cauHoi

                            ?

                            `<p>
                                ${escapeHTML(
                                    cau.cauHoi
                                )}
                            </p>`

                            :

                            ""
                        }


                        ${renderQuestionBody(
                            cau,
                            index
                        )}

                    </div>

                </div>

            `;

        }

    );


    container.innerHTML =
        html;

    /* Render MathJax sau khi toàn bộ câu hỏi đã được đưa vào DOM. */
    if (
        window.MathJax &&
        typeof MathJax.typesetPromise === "function"
    ) {
    if (window.MathJax) {
    MathJax.typesetPromise();
}
}



        try {
            MathJax.typesetPromise([container]).catch(function(error) {
                console.error("Lỗi MathJax:", error);
            });
        } catch (error) {
            console.error("Lỗi MathJax:", error);
        }
    }

/* =====================================================
   24. THANH ĐIỀU HƯỚNG CÂU HỎI
===================================================== */

function taoThanhDieuHuong() {

    const container =
        document.getElementById(
            "questionNavContainer"
        );


    if (!container) return;


    let html = "";


    deThi.forEach(
        (_, index) => {

            html += `

                <button

                    type="button"

                    id="nav${index + 1}"

                    class="nav-btn"

                    onclick="
                        diDenCau(
                            ${index + 1}
                        )
                    "

                >

                    ${index + 1}

                </button>

            `;

        }

    );


    container.innerHTML =
        html;

}


/* =====================================================
   25. ĐI ĐẾN CÂU
===================================================== */

function diDenCau(so) {

    const element =
        document.getElementById(
            "cau" + so
        );


    if (!element) return;


    element.scrollIntoView({

        behavior:"smooth",

        block:"start"

    });

}


/* =====================================================
   26. KIỂM TRA CÂU ĐÃ TRẢ LỜI
===================================================== */

function daCoGiaTri(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return false;

    }


    if (
        typeof value === "string"
    ) {

        return value.trim() !== "";

    }


    if (
        Array.isArray(value)
    ) {

        return value.length > 0;

    }


    if (
        typeof value === "object"
    ) {

        return Object.values(value)
            .some(
                v =>
                    String(v).trim() !== ""
            );

    }


    return true;

}


/* =====================================================
   27. THU CÂU TRẢ LỜI
===================================================== */

function thuThapCauTraLoi(index) {

    const cau =
        deThi[index];


    const loai =
        getLoaiCau(cau);


    const name =
        `cau${index + 1}`;


    switch(loai) {

        case "MCQ":

        case "TRUEFALSE": {

            const checked =
                document.querySelector(
                    `input[name="${name}"]:checked`
                );


            return checked
                ? checked.value
                : null;

        }


        case "MULTI": {

            return [
                ...document.querySelectorAll(
                    `input[name="${name}"]:checked`
                )
            ]

            .map(
                input =>
                    input.value
            );

        }


        case "FILL":

        case "SHORT":

        case "ESSAY":

        case "CODE": {

            const input =
                document.getElementById(
                    `answer${index + 1}`
                );


            return input
                ? input.value.trim()
                : "";

        }


        case "MATCH": {

            const result = {};


            document.querySelectorAll(
                `[data-qe-match="${index}"]`
            )

            .forEach(
                select => {

                    result[
                        select.dataset.left
                    ] =
                        select.value;

                }
            );


            return result;

        }


        case "SORT": {

            const list =
                document.getElementById(
                    `sort${index + 1}`
                );


            if (!list) return [];


            return [
                ...list.querySelectorAll(
                    ".qe-sort-item"
                )
            ]

            .map(
                item =>
                    item.dataset.sortValue
            );

        }


        case "IMAGE":

        case "READING":

        case "AUDIO": {

            const innerType =
                String(
                    cau.kieuTraLoi ||
                    cau.answerType ||
                    "MCQ"
                ).toUpperCase();


            if (
                innerType === "MULTI"
            ) {

                return [
                    ...document.querySelectorAll(
                        `input[name="${name}"]:checked`
                    )
                ]

                .map(
                    input =>
                        input.value
                );

            }


            if (
                innerType === "FILL" ||
                innerType === "SHORT"
            ) {

                const input =
                    document.getElementById(
                        `answer${index + 1}`
                    );


                return input
                    ? input.value.trim()
                    : "";

            }


            const checked =
                document.querySelector(
                    `input[name="${name}"]:checked`
                );


            return checked
                ? checked.value
                : null;

        }


        default:

            return null;

    }

}


/* =====================================================
   28. CẬP NHẬT TIẾN ĐỘ
===================================================== */

function capNhatMotCau(index) {

    cauTraLoi[index] =
        thuThapCauTraLoi(index);


    const nav =
        document.getElementById(
            `nav${index + 1}`
        );


    if (nav) {

        nav.classList.toggle(
            "done-question",
            daCoGiaTri(
                cauTraLoi[index]
            )
        );

    }


    capNhatTienDo();
    luuTrangThaiThi();

}


/* =====================================================
   29. TIẾN ĐỘ
===================================================== */

function capNhatTienDo() {

    let dem = 0;


    deThi.forEach(
        (_, index) => {

            if (
                daCoGiaTri(
                    thuThapCauTraLoi(index)
                )
            ) {

                dem++;

            }

        }
    );


    const element =
        document.getElementById(
            "soCauDaLam"
        );


    if (element) {

        element.innerHTML =
            dem;

    }

}


/* =====================================================
   30. SỰ KIỆN INPUT
===================================================== */

function khoiTaoSuKien() {

    deThi.forEach(
        (_, index) => {

            const question =
                document.getElementById(
                    `cau${index + 1}`
                );


            if (!question) return;


            question.addEventListener(
                "change",
                () => {

                    capNhatMotCau(
                        index
                    );

                }
            );


            question.addEventListener(
                "input",
                () => {

                    capNhatMotCau(
                        index
                    );

                }
            );

        }
    );


    khoiTaoKeoTha();

}


/* =====================================================
   31. KÉO THẢ SẮP XẾP
===================================================== */

function khoiTaoKeoTha() {

    document
        .querySelectorAll(
            ".qe-sort-list"
        )

        .forEach(
            list => {

                let dragged = null;


                list
                    .querySelectorAll(
                        ".qe-sort-item"
                    )

                    .forEach(
                        item => {

                            item.addEventListener(
                                "dragstart",
                                function() {

                                    dragged =
                                        this;

                                    this.classList.add(
                                        "dragging"
                                    );

                                }
                            );


                            item.addEventListener(
                                "dragend",
                                function() {

                                    this.classList.remove(
                                        "dragging"
                                    );


                                    const index =
                                        Number(
                                            list.dataset.qeSort
                                        );


                                    capNhatMotCau(
                                        index
                                    );

                                }
                            );


                            item.addEventListener(
                                "dragover",
                                function(e) {

                                    e.preventDefault();


                                    if (
                                        !dragged ||
                                        dragged === this
                                    ) {

                                        return;

                                    }


                                    const rect =
                                        this.getBoundingClientRect();


                                    const before =
                                        e.clientY <
                                        rect.top +
                                        rect.height / 2;


                                    if (before) {

                                        list.insertBefore(
                                            dragged,
                                            this
                                        );

                                    } else {

                                        list.insertBefore(
                                            dragged,
                                            this.nextSibling
                                        );

                                    }

                                }
                            );

                        }
                    );

            }
        );

}


/* =====================================================
   32. CHUẨN HÓA TEXT
===================================================== */

function normalizeText(value) {

    return String(
        value ?? ""
    )

    .trim()

    .toLowerCase()

    .normalize("NFD")

    .replace(
        /[\u0300-\u036f]/g,
        ""
    )

    .replace(
        /\s+/g,
        " "
    );

}


/* =====================================================
   33. CHUYỂN ĐÁP ÁN THÀNH ARRAY
===================================================== */

function toArrayAnswer(value) {

    if (
        Array.isArray(value)
    ) {

        return value.map(
            String
        );

    }


    if (
        typeof value === "string"
    ) {

        return value

            .split(/[;,|]/)

            .map(
                v => v.trim()
            )

            .filter(Boolean);

    }


    return [];

}


/* =====================================================
   34. SO SÁNH ARRAY
===================================================== */

function arraysEqualIgnoreOrder(
    a,
    b
) {

    const aa =
        [...a]
        .map(String)
        .sort();


    const bb =
        [...b]
        .map(String)
        .sort();


    return (

        aa.length === bb.length &&

        aa.every(
            (v, i) =>
                v === bb[i]
        )

    );

}


/* =====================================================
   35. CHẤM CÂU
===================================================== */

function chamCau(
    cau,
    answer
) {

    const loai =
        getLoaiCau(cau);


    if (
        !daCoGiaTri(answer)
    ) {

        return {

            dung:false,

            diem:0,

            coTheTuDongCham:
                loai !== "ESSAY"

        };

    }


    switch(loai) {

        /* ---------------------------------------------
           MCQ
        --------------------------------------------- */

        case "MCQ": {

            const dung =
                String(answer) ===
                String(cau.dapAn);


            return {

                dung,

                diem:
                    dung
                    ? Number(
                        cau.diem || 1
                    )
                    : 0,

                coTheTuDongCham:true

            };

        }


        /* ---------------------------------------------
           MULTI
        --------------------------------------------- */

        case "MULTI": {

            const hs =
                toArrayAnswer(
                    answer
                );


            const da =
                toArrayAnswer(
                    cau.dapAn
                );


            const dung =
                arraysEqualIgnoreOrder(
                    hs,
                    da
                );


            return {

                dung,

                diem:
                    dung
                    ? Number(
                        cau.diem || 1
                    )
                    : 0,

                coTheTuDongCham:true

            };

        }


        /* ---------------------------------------------
           TRUEFALSE
        --------------------------------------------- */

        case "TRUEFALSE": {

            const dung =
                String(answer)
                    .toUpperCase() ===
                String(cau.dapAn)
                    .toUpperCase();


            return {

                dung,

                diem:
                    dung
                    ? Number(
                        cau.diem || 1
                    )
                    : 0,

                coTheTuDongCham:true

            };

        }


        /* ---------------------------------------------
           FILL
        --------------------------------------------- */

        case "FILL":

        case "SHORT": {

            const dapAn =
                Array.isArray(
                    cau.dapAn
                )

                ? cau.dapAn

                : [
                    cau.dapAn
                ];


            const answerNorm =
                normalizeText(
                    answer
                );


            const dung =
                dapAn.some(
                    x =>
                        normalizeText(
                            x
                        ) ===
                        answerNorm
                );


            return {

                dung,

                diem:
                    dung
                    ? Number(
                        cau.diem || 1
                    )
                    : 0,

                coTheTuDongCham:true

            };

        }


        /* ---------------------------------------------
           MATCH
        --------------------------------------------- */

        case "MATCH": {

            const expected =
                cau.dapAn || {};


            const actual =
                answer || {};


            const keys =
                Object.keys(
                    expected
                );


            if (
                keys.length === 0
            ) {

                return {

                    dung:false,

                    diem:0,

                    coTheTuDongCham:true

                };

            }


            let dungSo = 0;


            keys.forEach(
                key => {

                    if (
                        String(
                            actual[key]
                        ) ===
                        String(
                            expected[key]
                        )
                    ) {

                        dungSo++;

                    }

                }
            );


            const diemToiDa =
                Number(
                    cau.diem || 1
                );


            const diem =
                diemToiDa *
                dungSo /
                keys.length;


            return {

                dung:
                    dungSo ===
                    keys.length,

                diem,

                coTheTuDongCham:true,

                chiTiet: {

                    dung:
                        dungSo,

                    tong:
                        keys.length

                }

            };

        }


        /* ---------------------------------------------
           SORT
        --------------------------------------------- */

        case "SORT": {

            const expected =
                Array.isArray(
                    cau.dapAn
                )

                ? cau.dapAn.map(
                    String
                )

                : [];


            const actual =
                Array.isArray(
                    answer
                )

                ? answer.map(
                    String
                )

                : [];


            const dung =

                expected.length ===
                actual.length &&

                expected.every(
                    (v, i) =>
                        v === actual[i]
                );


            return {

                dung,

                diem:
                    dung
                    ? Number(
                        cau.diem || 1
                    )
                    : 0,

                coTheTuDongCham:true

            };

        }


        /* ---------------------------------------------
           MEDIA
        --------------------------------------------- */

        case "IMAGE":

        case "READING":

        case "AUDIO": {

            const inner =
                String(
                    cau.kieuTraLoi ||
                    cau.answerType ||
                    "MCQ"
                ).toUpperCase();


            return chamCau(

                {
                    ...cau,

                    loai:inner

                },

                answer

            );

        }


        /* ---------------------------------------------
           ESSAY
        --------------------------------------------- */

        case "ESSAY":

            return {

                dung:false,

                diem:0,

                coTheTuDongCham:false,

                choGiaoVienCham:true

            };


        /* ---------------------------------------------
           CODE
        --------------------------------------------- */

        case "CODE":

            return {

                dung:false,

                diem:0,

                coTheTuDongCham:false,

                choGiaoVienCham:true

            };


        default:

            return {

                dung:false,

                diem:0,

                coTheTuDongCham:false

            };

    }

}


/* =====================================================
   36. CHẤM TOÀN BÀI
===================================================== */

function chamBai() {

    let diem = 0;

    let diemToiDa = 0;

    let soCauDung = 0;

    let soCauDaLam = 0;

    let soCauTuLuan = 0;


    const chiTiet = [];


    deThi.forEach(
        (cau, index) => {

            const answer =
                thuThapCauTraLoi(
                    index
                );


            cauTraLoi[index] =
                answer;


            if (
                daCoGiaTri(answer)
            ) {

                soCauDaLam++;

            }


            const ketQua =
                chamCau(
                    cau,
                    answer
                );

            // Tổng điểm tối đa của chính câu hỏi này.
            // Không dùng số câu để suy ra điểm vì câu hỏi có thể có trọng số khác nhau.
            const diemCauToiDa =
                Number(cau.diem || 1);

            diemToiDa +=
                Number.isFinite(diemCauToiDa)
                    ? diemCauToiDa
                    : 1;


            if (
                ketQua.dung
            ) {

                soCauDung++;

            }


            if (
                ketQua.choGiaoVienCham
            ) {

                soCauTuLuan++;

            }


            diem +=
                Number(
                    ketQua.diem || 0
                );


            chiTiet.push({

                index,

                loai:
                    getLoaiCau(cau),

                cauHoi:
                    cau.cauHoi || "",

                traLoi:
                    answer,

                dapAn:
                    cau.dapAn,

                dung:
                    ketQua.dung,

                diem:
                    ketQua.diem || 0,

                coTheTuDongCham:
                    ketQua.coTheTuDongCham,

                choGiaoVienCham:
                    ketQua.choGiaoVienCham ||
                    false

            });

        }
    );


    const tyLeDiem =
        diemToiDa > 0
            ? Math.round(
                (diem / diemToiDa) * 10000
            ) / 100
            : 0;


    return {

        diem,

        diemToiDa,

        tyLeDiem,

        soCauDung,

        soCauDaLam,

        soCauTuLuan,

        chiTiet

    };

}


/* =====================================================
   37. NỘP BÀI
===================================================== */

function nopBaiChinhThuc() {

    if (daNopBai) return;

    daNopBai = true;

    // ==============================
    // DỪNG ĐỒNG HỒ
    // ==============================

    if (timer) {
        clearInterval(timer);
    }

    // ==============================
    // TÍNH THỜI GIAN LÀM BÀI
    // ==============================

    const thoiGianQuyDinh =
    Number(localStorage.getItem("thoiGian") || 0) * 60;

const thoiGianConLai =
    Math.max(0, Number(timeValue || 0));

const thoiGianDaLam =
    Math.max(
        0,
        thoiGianQuyDinh - thoiGianConLai
    );

const gio =
    Math.floor(thoiGianDaLam / 3600);

const phut =
    Math.floor(
        (thoiGianDaLam % 3600) / 60
    );

const giay =
    thoiGianDaLam % 60;

const thoiGianHoanThanh =
    String(gio).padStart(2, "0") + ":" +
    String(phut).padStart(2, "0") + ":" +
    String(giay).padStart(2, "0");

localStorage.setItem(
    "thoiGianHoanThanh",
    thoiGianHoanThanh
);

    // ==============================
    // CHẤM BÀI
    // ==============================

    const ketQua =
        chamBai();

    const tongSoCau =
        deThi.length;

    const diemSo =
        ketQua.diem;

    const diemToiDa =
        ketQua.diemToiDa;

    // Tỷ lệ chính thức dựa trên điểm đạt được / điểm tối đa.
    // Vẫn giữ tyLe theo tỷ lệ câu đúng để tương thích các trang cũ.
    const tyLe =
        ketQua.tyLeDiem;

    const tyLeCauDung =
        tongSoCau > 0
            ? Math.round(
                ketQua.soCauDung /
                tongSoCau *
                10000
            ) / 100
            : 0;

    let xepLoai = "";

    if (tyLe >= 90) {

        xepLoai =
            "Xuất sắc";

    }

    else if (tyLe >= 80) {

        xepLoai =
            "Tốt";

    }

    else if (tyLe >= 70) {

        xepLoai =
            "Khá";

    }

    else {

        xepLoai =
            "Đạt";

    }

    // ==============================
    // LƯU KẾT QUẢ
    // ==============================

    localStorage.setItem(
        "diemThi",
        diemSo
    );

    localStorage.setItem(
        "tongSoCau",
        tongSoCau
    );

    localStorage.setItem(
        "diemToiDa",
        diemToiDa
    );

    localStorage.setItem(
        "tyLeCauDung",
        tyLeCauDung
    );

    localStorage.setItem(
        "soCauSai",
        tongSoCau -
        ketQua.soCauDung
    );

    localStorage.setItem(
        "tyLe",
        tyLe
    );

    localStorage.setItem(
        "xepLoai",
        xepLoai
    );

    // ==============================
    // DỮ LIỆU CHI TIẾT
    // ==============================

    localStorage.setItem(
        "chiTietBaiThi",
        JSON.stringify(
            ketQua.chiTiet
        )
    );

    localStorage.setItem(
        "cauTraLoi",
        JSON.stringify(
            cauTraLoi
        )
    );

    // Phiên bản engine để các trang kết quả/giáo viên biết cấu trúc dữ liệu.
    localStorage.setItem(
        "questionEngineVersion",
        "2"
    );

    // Gói kết quả chuẩn, dùng cho trang kết quả và phân tích giáo viên.
    localStorage.setItem(
        "ketQuaQuestionEngine",
        JSON.stringify({
            diem: diemSo,
            diemToiDa: diemToiDa,
            tyLeDiem: tyLe,
            tyLeCauDung: tyLeCauDung,
            tongSoCau: tongSoCau,
            soCauDung: ketQua.soCauDung,
            soCauDaLam: ketQua.soCauDaLam,
            soCauTuLuan: ketQua.soCauTuLuan,
            thoiGianHoanThanh: thoiGianHoanThanh,
            soLanRoiTab: soLanRoiTab,
            chiTiet: ketQua.chiTiet
        })
    );

    // ==============================
    // SỐ LẦN RỜI TAB
    // ==============================

    localStorage.setItem(
        "soLanRoiTab",
        soLanRoiTab
    );

    // ==============================
    // CHUYỂN TRANG KẾT QUẢ
    // ==============================

    window.location.href =
        "ketqua.html";
}


/* =====================================================
   38. NÚT NỘP BÀI
===================================================== */

function nopBai() {

    const xacNhan =
        confirm(
            "Bạn có chắc chắn muốn nộp bài?"
        );


    if (!xacNhan) return;


    nopBaiChinhThuc();

}


/* =====================================================
   39. ĐỒNG HỒ
===================================================== */

function khoiTaoDongHo() {

    const phutQuyDinh =
        parseInt(localStorage.getItem("thoiGian"), 10);

    const tongGiay =
        Number.isFinite(phutQuyDinh) && phutQuyDinh > 0
            ? phutQuyDinh * 60
            : 45 * 60;

    /* F5 không tạo lại thời gian: tiếp tục từ endTime cũ */
    if (!examEndTime) {
        examEndTime = Date.now() + tongGiay * 1000;
        luuTrangThaiThi();
    }

    function capNhatDongHo() {
        if (daNopBai) return;

        timeValue = Math.max(
            0,
            Math.ceil((examEndTime - Date.now()) / 1000)
        );

        const minutes = Math.floor(timeValue / 60);
        const seconds = timeValue % 60;
        const timerEl = document.getElementById("timer");

        if (timerEl) {
            timerEl.innerHTML =
                minutes + ":" + String(seconds).padStart(2, "0");
        }

        luuTrangThaiThi();

        if (timeValue <= 0) {
            clearInterval(timer);
            alert(
                "Đã hết thời gian làm bài. Hệ thống sẽ tự động nộp bài."
            );
            nopBaiChinhThuc();
        }
    }

    capNhatDongHo();
    timer = setInterval(capNhatDongHo, 1000);
}


/* =====================================================
   40. THÔNG TIN THÍ SINH
===================================================== */

function hienThiThongTinThiSinh() {

    const ten =
        document.getElementById(
            "tenThiSinh"
        );


    const lop =
        document.getElementById(
            "lopThiSinh"
        );


    const ngay =
        document.getElementById(
            "ngaySinh"
        );


    if (ten) {

        ten.innerHTML =
            localStorage.getItem(
                "tenThiSinh"
            ) || "";

    }


    if (lop) {

        lop.innerHTML =
            localStorage.getItem(
                "lopThiSinh"
            ) || "";

    }


    if (ngay) {

        ngay.innerHTML =
            localStorage.getItem(
                "ngaySinh"
            ) || "";

    }

}


/* =====================================================
   41. CHỐNG BACK
===================================================== */

function khoiTaoChanBack() {

    history.pushState(
        null,
        "",
        location.href
    );

    window.addEventListener(
        "popstate",
        function() {

            if (daNopBai) return;

            soLanBack++;

            /*
             * Chỉ cần bấm BACK một lần:
             * nộp bài ngay, không hiện confirm.
             * Dùng nopBaiChinhThuc() để bỏ qua hộp
             * xác nhận của nút NỘP BÀI.
             */
            nopBaiChinhThuc();

        }
    );
}


/* =====================================================
   42. GIÁM SÁT RỜI TAB
===================================================== */

function khoiTaoGiamSat() {

    document.addEventListener(

        "visibilitychange",

        function() {

            if (
                document.hidden &&
                !daNopBai
            ) {

                soLanRoiTab++;


                alert(

                    "Bạn đã rời khỏi màn hình thi lần " +

                    soLanRoiTab +

                    "/3"

                );


                if (
                    soLanRoiTab >= 3
                ) {

                    alert(
                        "Bạn đã vi phạm quy chế thi.\n" +
                        "Hệ thống sẽ tự động nộp bài."
                    );


                    nopBaiChinhThuc();

                }

            }

        }

    );

}


/* =====================================================
   CHỐNG F5 / CTRL+R VÀ KHÔNG MẤT BÀI KHI REFRESH
===================================================== */
function khoiTaoChanLamMoi() {
    window.addEventListener("keydown", function (event) {
        const key = String(event.key || "").toLowerCase();
        if (key === "f5" || ((event.ctrlKey || event.metaKey) && key === "r")) {
            event.preventDefault();
            alert("⚠️ Không được làm mới trang trong khi đang thi. Hệ thống đã tự lưu bài làm.");
            luuTrangThaiThi();
        }
    });

    window.addEventListener("beforeunload", function (event) {
        if (daNopBai) return;
        luuTrangThaiThi();
        event.preventDefault();
        event.returnValue = "Bài thi đang được thực hiện. Nếu tải lại, hệ thống sẽ khôi phục bài làm.";
    });

    window.addEventListener("pagehide", function () {
        if (!daNopBai) luuTrangThaiThi();
    });
}

/* =====================================================
   43. KHỞI ĐỘNG QUESTION ENGINE
===================================================== */

function khoiDongQuestionEngine() {

    /*
       Kiểm tra đăng nhập
    */

    if (
        !localStorage.getItem(
            "maThiSinh"
        )
    ) {

        alert(
            "Vui lòng đăng nhập!"
        );


        window.location.href =
            "login.html";


        return;

    }


    /*
       CSS
    */

    themCSSQuestionEngine();


    /*
       Thông tin thí sinh
    */

    hienThiThongTinThiSinh();


    /*
       Render đề
    */

    hienThiCauHoi();


    /*
       Điều hướng
    */

    taoThanhDieuHuong();


    /*
       Sự kiện
    */

    khoiTaoSuKien();

    /* Khôi phục đáp án ngay sau khi DOM và sự kiện đã sẵn sàng */
    khoiPhucCauTraLoi();


    /*
       Tổng số câu
    */

    const tong =
        document.getElementById(
            "tongSoCau"
        );


    if (tong) {

        tong.innerHTML =
            deThi.length;

    }


    /*
       Chống back
    */

    khoiTaoChanBack();


    /*
       Đồng hồ
    */

    khoiTaoDongHo();


    /*
       Giám sát
    */

    khoiTaoGiamSat();

    /* F5 / Ctrl+R: chặn phím và quan trọng hơn là đã có cơ chế khôi phục phiên */
    khoiTaoChanLamMoi();


    /*
       Debug
    */

    console.log(
        "================================="
    );

    console.log(
        "QUESTION ENGINE v1 ĐÃ KHỞI ĐỘNG"
    );

    console.log(
        "Số câu:",
        deThi.length
    );

    console.log(
        "Loại câu:",
        [
            ...new Set(
                deThi.map(
                    getLoaiCau
                )
            )
        ]
    );

    console.log(
        "================================="
    );

}


/* =====================================================
   44. CHẠY
===================================================== */

khoiDongQuestionEngine();