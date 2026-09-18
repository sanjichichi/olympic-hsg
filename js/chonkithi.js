/* =========================================================
   CHON-KY-THI.JS
   Olympic HSG Online

   LOGIC:
   - 1A = Luyện tập / Thi thử: được thi nhiều lần
   - 1B = Thi thật: mỗi MaHS chỉ được thi 1 lần / MaKyThi
   - Kiểm tra lịch sử bằng:
       maKyThi + maHS
     trong Sheet KETQUA
========================================================= */


/* =========================================================
   1. URL CẤU HÌNH KỲ THI
========================================================= */

const CONFIG_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSf3WztJkMT3aBk2_o_xvGu1HNxCRCIFQtDbOsyP6G6ujBB7SjlAlDbCFjoHbjSYTkfYTbYfLwG3lFN/pub?output=csv";


/* =========================================================
   2. URL SHEET KẾT QUẢ

   ANH THAY URL KETQUA CỦA MÌNH VÀO ĐÂY

   Ví dụ:
   https://docs.google.com/spreadsheets/d/e/...../pub?output=csv
========================================================= */

const KETQUA_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRULO6RaaXqNERaYMuLx9cpHLp3hxqL3i2PHuccrdbSvFaQgpsrPvRk-fhgzlOxamLUYCe1sLQMQvPL/pub?output=csv";


/* =========================================================
   3. BIẾN DỮ LIỆU
========================================================= */

let dsKyThi = [];

let dsKetQua = [];

let daTaiKetQua = false;


/* =========================================================
   MÃ HỌC SINH
   Hệ thống đăng nhập đang lưu bằng maThiSinh
========================================================= */

const maHS =
    localStorage.getItem("maThiSinh") || "";

console.log(
    "👨‍🎓 Mã học sinh:",
    maHS
);


/* =========================================================
   5. HÀM CHUẨN HÓA CHUỖI
========================================================= */

function chuanHoa(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase();

}

/* =========================================================
   CHUẨN HÓA ĐƯỜNG DẪN FILE ĐỀ
========================================================= */

const THU_MUC_NGAN_HANG = {
    "toán": "toan",
    "toan": "toan",

    "ngữ văn": "van",
    "ngu van": "van",
    "văn": "van",
    "van": "van",

    "tiếng anh": "tienganh",
    "tieng anh": "tienganh",
    "anh": "tienganh",
    "tienganh": "tienganh",

    "khoa học tự nhiên": "khtn",
    "khtn": "khtn",

    "lịch sử và địa lí": "lichsu-dia-li",
    "lich su va dia li": "lichsu-dia-li"
};


function chuanHoaFileDe(fileDe, mon) {

    let file =
        String(fileDe || "")
            .trim()
            .replace(/\\/g, "/");

    if (!file) {
        return "";
    }

    /*
     * Nếu Sheet đã lưu sẵn đường dẫn đầy đủ
     * thì giữ nguyên.
     */
    if (
        file.startsWith("nganhang/") ||
        file.startsWith("/") ||
        file.startsWith("http://") ||
        file.startsWith("https://")
    ) {
        return file;
    }

    /*
     * Nếu chỉ có tên file thì tự thêm .js
     */
    if (!/\.js$/i.test(file)) {
        file += ".js";
    }

    const monChuan =
        String(mon || "")
            .trim()
            .toLowerCase();

    const thuMuc =
        THU_MUC_NGAN_HANG[monChuan];

    /*
     * Không xác định được môn:
     * trả lại tên file để tránh làm hỏng dữ liệu.
     */
    if (!thuMuc) {
        console.warn(
            "⚠️ Không xác định được thư mục ngân hàng cho môn:",
            mon
        );

        return file;
    }

    return "nganhang/" + thuMuc + "/" + file;
}
/* =========================================================
   6. ĐỌC CSV
========================================================= */

function docCSV(text) {

    const lines =
        text
            .trim()
            .split(/\r?\n/);

    if (lines.length <= 1) {

        return [];

    }

    lines.shift();

    return lines.map(function(line) {

        /*
         * Tạm giữ cách đọc CSV giống hệ thống cũ.
         * Không thay đổi cấu trúc dữ liệu hiện tại.
         */

        return line
            .split(",")
            .map(function(cot) {

                return cot
                    .trim()
                    .replace(/^"|"$/g, "");

            });

    });

}


/* =========================================================
   7. ĐỌC KẾT QUẢ

   KETQUA cần có tối thiểu:
   - maKyThi
   - maHS
========================================================= */


async function taiKetQua() {

    if (!KETQUA_URL) {

        console.warn(
            "⚠️ Chưa cấu hình KETQUA_URL."
        );

        dsKetQua = [];

        daTaiKetQua = false;

        return;
    }

    try {

        const response =
            await fetch(
                KETQUA_URL,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "Không tải được KETQUA. HTTP " +
                response.status
            );

        }

        const csv =
            await response.text();

        console.log(
            "📥 Đã tải dữ liệu KETQUA"
        );

        /*
         * Tách CSV thành các dòng
         */
        const lines =
            csv
                .trim()
                .split(/\r?\n/);

        if (lines.length < 2) {

            console.warn(
                "⚠️ KETQUA chưa có dữ liệu."
            );

            dsKetQua = [];

            daTaiKetQua = true;

            return;
        }

        /*
         * Đọc tiêu đề
         */
        const headers =
            lines[0]
                .split(",")
                .map(function (item) {

                    return item
                        .trim()
                        .replace(/^"|"$/g, "")
                        .toLowerCase();

                });

        /*
         * Tìm vị trí cột
         */
        const indexMaKyThi =
            headers.indexOf(
                "makythi"
            );

        const indexMaHS =
            headers.indexOf(
                "mahs"
            );

        console.log(
            "📌 Vị trí maKyThi:",
            indexMaKyThi
        );

        console.log(
            "📌 Vị trí maHS:",
            indexMaHS
        );

        /*
         * Không tìm thấy cột
         */
        if (
            indexMaKyThi === -1 ||
            indexMaHS === -1
        ) {

            console.error(
                "❌ KETQUA không có cột maKyThi hoặc maHS."
            );

            dsKetQua = [];

            daTaiKetQua = false;

            return;
        }

        /*
         * Đọc từng dòng kết quả
         */
        dsKetQua = [];

        for (
            let i = 1;
            i < lines.length;
            i++
        ) {

            if (!lines[i].trim()) {
                continue;
            }

            const row =
                lines[i]
                    .split(",")
                    .map(function (item) {

                        return item
                            .trim()
                            .replace(/^"|"$/g, "");

                    });

            const maKyThi =
                String(
                    row[indexMaKyThi] || ""
                ).trim();

            const maHS =
                String(
                    row[indexMaHS] || ""
                ).trim();

            if (
                maKyThi &&
                maHS
            ) {

                dsKetQua.push({

                    maKyThi:
                        maKyThi,

                    maHS:
                        maHS

                });

            }

        }

        daTaiKetQua = true;

        console.log(
            "📊 Tổng số kết quả đọc được:",
            dsKetQua.length
        );

        console.log(
            "👨‍🎓 Mã HS hiện tại:",
            maHS
        );

    }

    catch (error) {

        console.error(
            "❌ Lỗi đọc KETQUA:",
            error
        );

        dsKetQua = [];

        daTaiKetQua = false;

    }

}

/* =========================================================
   8. KIỂM TRA HỌC SINH ĐÃ THI KỲ THI HAY CHƯA
========================================================= */

function daThiKyThi(maKyThi) {

    if (!maKyThi) {

        return false;

    }

    if (!maHS) {

        console.warn(
            "⚠️ Không tìm thấy mã học sinh (maHS)."
        );

        return false;

    }

    /*
     * Nếu KETQUA chưa tải được thì
     * không tự ý kết luận học sinh đã thi.
     */
    if (!daTaiKetQua) {

        console.warn(
            "⚠️ Dữ liệu KETQUA chưa sẵn sàng."
        );

        return false;

    }

    const maKyThiCanTim =
        String(maKyThi)
            .trim()
            .toLowerCase();

    const maHSCanTim =
        String(maHS)
            .trim()
            .toLowerCase();


    const ketQua =
        dsKetQua.some(function(item) {

            const maKyThiKQ =
                String(
                    item.maKyThi || ""
                )
                .trim()
                .toLowerCase();

            const maHSKQ =
                String(
                    item.maHS || ""
                )
                .trim()
                .toLowerCase();


            return (
                maKyThiKQ ===
                maKyThiCanTim
            )
            &&
            (
                maHSKQ ===
                maHSCanTim
            );

        });


    console.log(
        "🔎 Kiểm tra đã thi:",
        {
            maKyThi: maKyThi,
            maHS: maHS,
            daThi: ketQua
        }
    );


    return ketQua;

}


/* =========================================================
   9. TẢI DANH SÁCH KỲ THI
========================================================= */

async function taiKyThi() {

    try {

        const response =
            await fetch(
                CONFIG_URL,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const csv =
            await response.text();


        const lines =
            csv
                .trim()
                .split(/\r?\n/);


        if (lines.length <= 1) {

            dsKyThi = [];

            hienThiKyThi([]);

            return;

        }


        lines.shift();


        dsKyThi =
            lines
                .map(function(line) {

                    const cot =
                        line
                            .split(",")
                            .map(function(x) {

                                return x
                                    .trim()
                                    .replace(
                                        /^"|"$/g,
                                        ""
                                    );

                            });


                    return {

                        maKyThi:
                            cot[0] || "",

                        namHoc:
                            cot[1] || "",

                        dotThi:
                            cot[2] || "",

                        suKien:
                            cot[3] || "",

                        mon:
                            cot[4] || "",

                        tenKyThi:
                            cot[5] || "",

                        icon:
                            cot[6] || "🏆",

                        soCau:
                            cot[7] || "",

                        thoiGian:
                            cot[8] || "",

                        trangThai:
                            cot[9] || "",

                        thiThu:
                            cot[10] || "",

                        fileDe:
                            cot[11] || "",

                        khoi:
                            cot[12] || "",

                        maGV:
                            cot[13] || ""

                    };

                })
                .filter(function(item) {

                    return item.maKyThi !== "";

                });


        console.log(
            "📚 Số kỳ thi:",
            dsKyThi.length
        );


        khoiHocSinh =
            lopThiSinh.match(/^\d+/)?.[0] || "";


        const dsKyThiTheoKhoi =
    dsKyThi.filter(function(item) {

        return duocThamGiaKyThi(
            item.khoi
        );

    });


        hienThiKyThi(
            dsKyThiTheoKhoi
        );


    }
    catch(error) {

        console.error(
            "❌ Lỗi tải kỳ thi:",
            error
        );

        alert(
            "Không thể tải danh sách kỳ thi."
        );

    }

}


/* =========================================================
   10. THÔNG TIN KHỐI / LỚP
========================================================= */

const lopThiSinh =
    localStorage.getItem(
        "lopThiSinh"
    ) || "";


let khoiHocSinh =
    lopThiSinh
        .match(/^\d+/)?.[0] || "";


console.log(
    "👨‍🎓 Lớp học sinh:",
    lopThiSinh
);

console.log(
    "🎓 Khối học sinh:",
    khoiHocSinh
);


/* =========================================================
   11. COMBOBOX
========================================================= */

const cboNamHoc =
    document.getElementById(
        "locNamHoc"
    );

const cboDot =
    document.getElementById(
        "locDotThi"
    );

const examGrid =
    document.getElementById(
        "examGrid"
    );


/* =========================================================
   12. HIỂN THỊ BỘ LỌC
========================================================= */

function napBoLoc() {

    if (!cboNamHoc || !cboDot) {

        return;

    }


    const dsNamHoc =
        [
            ...new Set(
                dsKyThi.map(
                    x => x.namHoc
                )
            )
        ];


    const dsDot =
        [
            ...new Set(
                dsKyThi.map(
                    x => x.dotThi
                )
            )
        ];


    cboNamHoc.innerHTML =
        `<option value="ALL">
            Tất cả năm học
        </option>`;


    cboDot.innerHTML =
        `<option value="ALL">
            Tất cả đợt thi
        </option>`;


    dsNamHoc
        .filter(Boolean)
        .sort()
        .forEach(function(nam) {

            cboNamHoc.innerHTML += `
                <option value="${nam}">
                    ${nam}
                </option>
            `;

        });


    dsDot
        .filter(Boolean)
        .sort()
        .forEach(function(dot) {

            cboDot.innerHTML += `
                <option value="${dot}">
                    ${dot}
                </option>
            `;

        });

}
/* =========================================================
   KIỂM TRA KHỐI HỌC SINH VỚI KỲ THI
========================================================= */

function duocThamGiaKyThi(khoiKyThi) {

    const kyThi =
        String(khoiKyThi || "")
            .trim()
            .toUpperCase();

    const khoiHS =
        String(khoiHocSinh || "")
            .trim()
            .toUpperCase();

    // ==========================================
    // KỲ THI CHUNG TOÀN THCS
    // ==========================================
    if (
        kyThi === "THCS" ||
        kyThi === "TOÀN THCS" ||
        kyThi === "TOÀNTHCS"
    ) {
        return true;
    }

    // ==========================================
    // KỲ THI KHÔNG GIỚI HẠN KHỐI
    // ==========================================
    if (kyThi === "") {
        return true;
    }

    // ==========================================
    // HỌC SINH KHÔNG CÓ KHỐI
    // Chỉ được vào kỳ thi chung,
    // không được vào kỳ thi riêng khối.
    // ==========================================
    if (khoiHS === "") {
        return false;
    }

    // ==========================================
    // KỲ THI RIÊNG KHỐI
    // ==========================================
    return kyThi === khoiHS;
}

/* =========================================================
   13. LỌC KỲ THI
========================================================= */

function locKyThi() {

    let ds =
    dsKyThi.filter(function(item) {

        return duocThamGiaKyThi(
            item.khoi
        );

    });


    if (
        cboNamHoc &&
        cboNamHoc.value !== "ALL"
    ) {

        ds =
            ds.filter(function(item) {

                return (
                    item.namHoc ===
                    cboNamHoc.value
                );

            });

    }


    if (
        cboDot &&
        cboDot.value !== "ALL"
    ) {

        ds =
            ds.filter(function(item) {

                return (
                    item.dotThi ===
                    cboDot.value
                );

            });

    }


    hienThiKyThi(ds);

}


/* =========================================================
   14. KIỂM TRA TRẠNG THÁI HIỂN THỊ
========================================================= */

function trangThaiKyThi(item) {

    const trangThai =
        String(
            item.trangThai || ""
        )
        .trim()
        .toUpperCase();


    /* =========================
       1A - LUYỆN TẬP
    ========================= */

    if (trangThai === "1A") {

        return {

            text:
                "🟢 Luyện tập - Có thể thi nhiều lần",

            className:
                "dang-mo",

            locked:
                false,

            loai:
                "luyen-tap"

        };

    }

    /* =========================
       1B - THI THẬT
    ========================= */

    if (trangThai === "1B") {

        const daThi =
            daThiKyThi(
                item.maKyThi
            );
            if (daThi) {

            return {

                text:
                    "🔒 Đã thi - Không thể thi lại",

                className:
                    "da-thi",

                locked:
                    true,

                loai:
                    "thi-that-da-thi"

            };

        }


        /* -----------------------------------------------
           CHƯA THI → CHO PHÉP
        ------------------------------------------------ */

        return {

            text:
                "🟢 Thi thật - Chưa tham gia",

            className:
                "dang-mo",

            locked:
                false,

            loai:
                "thi-that"

        };

    }


    /* =====================================================
       TRẠNG THÁI KHÁC
    ===================================================== */

    return {

        text:
            "🔴 Chưa mở",

        className:
            "chua-mo",

        locked:
            true,

        loai:
            "dong"

    };

}

/* =========================================================
   XỬ LÝ NÚT THI THỬ + THI CHÍNH THỨC

   1A = LUYỆN TẬP
        → Thi nhiều lần

   1B = THI THẬT
        → Chỉ 1 lần / MaHS / MaKyThi

   KETQUA:
        maKyThi + maHS
========================================================= */


/* =========================================================
   HÀM LẤY KỲ THI ĐANG ĐƯỢC CHỌN
========================================================= */

function layKyThiDangChon() {

    const exam =
        document.querySelector(
            'input[name="exam"]:checked'
        );

    if (!exam) {

        alert(
            "⚠️ Vui lòng chọn một kỳ thi."
        );

        return null;

    }


    const item =
        dsKyThi.find(function(x) {

            return (
                String(x.maKyThi) ===
                String(exam.value)
            );

        });


    if (!item) {

        alert(
            "❌ Không tìm thấy thông tin kỳ thi."
        );

        return null;

    }


    return item;

}


/* =========================================================
   LƯU THÔNG TIN KỲ THI
========================================================= */

function luuThongTinKyThi(item) {

    const fileDe =
        chuanHoaFileDe(
            item.fileDe,
            item.mon
        );

    console.log(
        "📚 Môn:",
        item.mon
    );

    console.log(
        "📄 File đề gốc:",
        item.fileDe
    );

    console.log(
        "📂 File đề sau chuẩn hóa:",
        fileDe
    );


    localStorage.setItem(
        "namHoc",
        item.namHoc || ""
    );

    localStorage.setItem(
        "dotThi",
        item.dotThi || ""
    );

    localStorage.setItem(
        "suKien",
        item.suKien || ""
    );

    localStorage.setItem(
        "mon",
        item.mon || ""
    );

    localStorage.setItem(
        "maKyThi",
        item.maKyThi || ""
    );

    localStorage.setItem(
        "tenKyThi",
        item.tenKyThi || ""
    );

    localStorage.setItem(
        "khoi",
        item.khoi || ""
    );

    localStorage.setItem(
        "fileDe",
        fileDe
    );

    localStorage.setItem(
        "soCau",
        item.soCau || ""
    );

    localStorage.setItem(
        "thoiGian",
        item.thoiGian || ""
    );

    localStorage.setItem(
        "thiThu",
        item.thiThu || ""
    );

}


/* =========================================================
   NÚT THI THỬ / LUYỆN TẬP + THI CHÍNH THỨC
========================================================= */

const btnThiThu =
    document.getElementById("btnThiThu");

const btnThi =
    document.getElementById("btnThi");


/* =========================================================
   HÀM LẤY KỲ THI ĐANG CHỌN
========================================================= */

function layKyThiDangChon() {

    const exam =
        document.querySelector(
            'input[name="exam"]:checked'
        );

    if (!exam) {

        alert(
            "⚠️ Vui lòng chọn một kỳ thi."
        );

        return null;
    }


    const item =
        dsKyThi.find(function(x) {

            return String(x.maKyThi) ===
                   String(exam.value);

        });


    if (!item) {

        alert(
            "❌ Không tìm thấy thông tin kỳ thi."
        );

        return null;
    }


    return item;
}



/* =========================================================
   NÚT THI THỬ - 1A
========================================================= */

if (btnThiThu) {

    btnThiThu.onclick =
    async function() {

        const item =
            layKyThiDangChon();

        if (!item) {
            return;
        }


        const trangThai =
            String(
                item.trangThai || ""
            )
            .trim()
            .toUpperCase();


        // ==========================================
// LUYỆN TẬP
// 1A → được luyện tập
// 1B → cũng được luyện tập trước khi thi thật
// 1B đã thi → khóa
// ==========================================

if (
    trangThai === "1B" &&
    daThiKyThi(item.maKyThi)
) {

    alert(
        "🔒 Em đã hoàn thành kỳ thi thật này.\n\n" +
        "Kỳ thi đã được khóa."
    );

    return;
}

if (
    trangThai !== "1A" &&
    trangThai !== "1B"
) {

    alert(
        "⚠️ Kỳ thi này chưa mở luyện tập."
    );

    return;
}

luuThongTinKyThi(item);

localStorage.setItem(
    "loaiLuotThi",
    "1A"
);

window.location.href =
    "thithu.html";


        /*
         * 1A được thi nhiều lần
         * Không kiểm tra KETQUA
         */

        luuThongTinKyThi(item);

        localStorage.setItem(
            "loaiLuotThi",
            "1A"
        );


        window.location.href =
            "thithu.html";

    };

}


/* =========================================================
   NÚT THI CHÍNH THỨC - 1B
========================================================= */

if (btnThi) {

    btnThi.onclick =
    async function() {

        const item =
            layKyThiDangChon();

        if (!item) {
            return;
        }


        const trangThai =
            String(
                item.trangThai || ""
            )
            .trim()
            .toUpperCase();


        /*
         * Chỉ 1B mới được thi chính thức
         */

        if (trangThai !== "1B") {

            alert(
                "⚠️ Kỳ thi chính thức chưa được mở."
            );

            return;
        }


        /*
         * Tải lại KETQUA trước khi kiểm tra
         * để tránh dùng dữ liệu cũ.
         */

        await taiKetQua();


        /*
         * Kiểm tra:
         *
         * maKyThi + maHS
         *
         * đã tồn tại trong KETQUA hay chưa
         */

        if (
            daThiKyThi(
                item.maKyThi
            )
        ) {

            alert(
                "🔒 Em đã hoàn thành kỳ thi này.\n\n" +
                "Kỳ thi thật chỉ được tham gia một lần."
            );

            return;
        }


        /*
         * Chưa thi → cho phép vào
         */

        luuThongTinKyThi(item);

        localStorage.setItem(
            "loaiLuotThi",
            "1B"
        );


        window.location.href =
            "xacnhan.html";

    };

}

/* =========================================================
   15. HIỂN THỊ KỲ THI
========================================================= */

function hienThiKyThi(ds) {

    if (!examGrid) {

        return;

    }


    examGrid.innerHTML = "";


    if (!ds.length) {

        examGrid.innerHTML = `
            <div class="empty-exam">
                📭 Không có kỳ thi phù hợp.
            </div>
        `;

        return;

    }


    ds.forEach(function(item) {

        const status =
            trangThaiKyThi(item);


        examGrid.innerHTML += `

            <label
                class="exam-card
                ${status.locked ? "exam-locked" : ""}"
            >

                <input
                    type="radio"
                    name="exam"
                    value="${item.maKyThi}"
                    ${status.locked ? "disabled" : ""}
                >

                <div class="icon">
                    ${item.icon}
                </div>

                <h2>
                    ${item.tenKyThi}
                </h2>

                <span>
                    📅 Năm học: ${item.namHoc}
                </span>

                <span>
                    🏆 Đợt thi: ${item.dotThi}
                </span>

                <span>
                    ${item.soCau} câu hỏi
                </span>

                <span>
                    ${item.thoiGian} phút
                </span>

                <p
                    class="trang-thai ${status.className}"
                >
                    ${status.text}
                </p>

            </label>

        `;

    });

}


/* =========================================================
   19. TÀI KHOẢN
========================================================= */

const btn =
    document.getElementById(
        "taiKhoanBtn"
    );


if (btn) {

    btn.innerHTML =
        (
            localStorage.getItem(
                "hoTen"
            ) || ""
        ) +
        " ▼";


    btn.addEventListener(
        "click",
        function(e) {

            e.preventDefault();


            const menu =
                document.getElementById(
                    "userDropdown"
                );


            if (!menu) {

                return;

            }


            menu.style.display =
                menu.style.display ===
                "block"
                    ? "none"
                    : "block";

        }
    );

}


/* =========================================================
   20. ĐĂNG XUẤT
========================================================= */

function dangXuat() {

    if (
        confirm(
            "Bạn muốn đăng xuất?"
        )
    ) {

        localStorage.clear();

        window.location.href =
            "index.html";

    }

}


/* =========================================================
   21. KHỞI ĐỘNG
========================================================= */

async function khoiDongTrang() {

    console.log(
        "🚀 Khởi động trang chọn kỳ thi..."
    );


    /*
     * Tải KETQUA trước.
     *
     * Nhờ vậy khi hienThiKyThi()
     * chạy, hệ thống đã biết học sinh
     * đã thi 1B hay chưa.
     */

    await taiKetQua();


    /*
     * Tải cấu hình kỳ thi.
     */

    await taiKyThi();


    /*
     * Tạo bộ lọc sau khi có dữ liệu.
     */

    napBoLoc();


    /*
     * Gắn sự kiện bộ lọc.
     */

    if (cboNamHoc) {

        cboNamHoc.addEventListener(
            "change",
            locKyThi
        );

    }


    if (cboDot) {

        cboDot.addEventListener(
            "change",
            locKyThi
        );

    }


    console.log(
        "✅ Trang chọn kỳ thi đã sẵn sàng."
    );

}


/* =========================================================
   22. CHẠY
========================================================= */

khoiDongTrang();