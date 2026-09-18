/*
=========================================================
 OLYMPIC HSG ONLINE
 QUESTION ENGINE v1
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


/*
   Sao chép ngân hàng đề
   để không làm thay đổi cauHoi gốc
*/

let deThi = [...cauHoi];


/*
   Trộn câu hỏi
*/

deThi.sort(() => Math.random() - 0.5);


/*
   Lấy số câu cần thi
*/

deThi = deThi.slice(
    0,
    Math.min(soCau, deThi.length)
);


/*
   Lưu câu trả lời của học sinh
*/

const cauTraLoi = {};


/*
   Trạng thái
*/

let daNopBai = false;
let soLanRoiTab = 0;
let soLanBack = 0;
let timer = null;

// Thời gian còn lại của đồng hồ, tính bằng giây
let timeValue = 0;


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
                    item.text ||
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
                                        right.text ||
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
                        item.text ||
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


    switch(loai) {

        case "MCQ":

            return renderMCQ(
                cau,
                index
            );


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


        case "MATCH":

            return renderMATCH(
                cau,
                index
            );


        case "SORT":

            return renderSORT(
                cau,
                index
            );


        case "SHORT":

            return renderSHORT(
                cau,
                index
            );


        case "IMAGE":

            return renderIMAGE(
                cau,
                index
            );


        case "READING":

            return renderREADING(
                cau,
                index
            );


        case "AUDIO":

            return renderAUDIO(
                cau,
                index
            );


        case "ESSAY":

            return renderESSAY(
                cau,
                index
            );


        case "CODE":

            return renderCODE(
                cau,
                index
            );


        default:

            /*
               Quan trọng:
               loại mới chưa được hỗ trợ
               vẫn chạy bằng MCQ
            */

            return renderMCQ(
                cau,
                index
            );

    }

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


    return {

        diem,

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

    const tyLe =
        tongSoCau > 0
        ?
        Math.round(
            ketQua.soCauDung /
            tongSoCau *
            100
        )
        :
        0;

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

    localStorage.setItem(
        "questionEngineVersion",
        "1"
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

        timeValue =

        parseInt(
            localStorage.getItem(
                "thoiGian"
            )
        ) * 60;


    if (
        !Number.isFinite(timeValue) ||
        timeValue < 0
    ) {

        timeValue =
            45 * 60;

    }


    timer =
        setInterval(
            function() {

                if (daNopBai)
                    return;


                const minutes =
                    Math.floor(
                        timeValue / 60
                    );


                const seconds =
                    timeValue % 60;


                const timerEl =
                    document.getElementById(
                        "timer"
                    );


                if (timerEl) {

                    timerEl.innerHTML =

                        minutes +

                        ":" +

                        String(
                            seconds
                        ).padStart(
                            2,
                            "0"
                        );

                }


                timeValue--;


                if (
                    timeValue < 0
                ) {

                    clearInterval(
                        timer
                    );


                    alert(
                        "Đã hết thời gian làm bài. Hệ thống sẽ tự động nộp bài."
                    );


                    nopBaiChinhThuc();

                }

            },

            1000

        );

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

            soLanBack++;


            if (
                soLanBack === 1
            ) {

                alert(
                    "⚠️ Bạn đã nhấn nút Quay lại.\n" +
                    "Nếu nhấn thêm lần nữa, bài thi sẽ được nộp tự động."
                );


                history.pushState(
                    null,
                    "",
                    location.href
                );

            }

            else {

                alert(
                    "❌ Bạn đã nhấn Quay lại 2 lần.\n" +
                    "Hệ thống sẽ tự động nộp bài."
                );


                nopBaiChinhThuc();

            }

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