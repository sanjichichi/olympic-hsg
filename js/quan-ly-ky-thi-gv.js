/* =========================================================
   QUẢN LÝ KỲ THI - GIÁO VIÊN
   Olympic HSG Online

   - Chỉ dành cho GIÁO VIÊN
   - Không còn logic Admin
   - Giữ nguyên API và các action đang sử dụng
========================================================= */


/* =========================================================
   API GHI NHẬT KÝ
   DÙNG CÙNG URL HIỆN TẠI
========================================================= */

const API_NHAT_KY =
    "https://script.google.com/macros/s/AKfycbwDrXSUXhCxU0XvMBkvGcxJjj_-B-ujrgNeIUZDbwRBph-8or26siTEB1XVweydexIpPg/exec";


/* =========================================================
   API QUẢN LÝ KỲ THI
========================================================= */

const API_QUAN_LY_KY_THI =
    "https://script.google.com/macros/s/AKfycbwtNrOGgfBdCj0b17z43-EkGZ7-vrS5iDr5uZnzoahBSdJ7gqaSw8m7zK8uBcvCgLXx/exec";


/* =========================================================
   LẤY THÔNG TIN GIÁO VIÊN
========================================================= */

function layThongTinGV() {

    const maGV =
        localStorage.getItem("maGV") ||
        localStorage.getItem("maGiaoVien") ||
        "";

    const hoTen =
        localStorage.getItem("hoTenGV") ||
        localStorage.getItem("tenGiaoVien") ||
        localStorage.getItem("hoTen") ||
        "";

    return {
        maGV: String(maGV).trim(),
        hoTen: String(hoTen).trim()
    };
}


/* =========================================================
   HIỂN THỊ THÔNG TIN GIÁO VIÊN
========================================================= */

function hienThiThongTinGV() {

    const gv = layThongTinGV();

    const box =
        document.getElementById("teacherInfo");

    if (!box) {
        return;
    }

    box.innerHTML = `
        <strong>
            ${escapeHTML(gv.hoTen || "Giáo viên")}
        </strong>
        <br>
        Mã GV:
        ${escapeHTML(gv.maGV || "Chưa xác định")}
    `;
}


/* =========================================================
   KIỂM TRA ĐĂNG NHẬP GIÁO VIÊN
========================================================= */

function kiemTraGV() {

    const gv = layThongTinGV();

    if (!gv.maGV) {

        alert(
            "⚠️ Không xác định được mã giáo viên."
        );

        return false;
    }

    return true;
}


/* =========================================================
   HIỂN THỊ LOADING
========================================================= */

function hienLoading() {

    const loading =
        document.getElementById("loading");

    const error =
        document.getElementById("error");

    const empty =
        document.getElementById("empty");

    const table =
        document.getElementById("tableWrapper");


    if (loading) {
        loading.style.display = "block";
    }

    if (error) {
        error.style.display = "none";
    }

    if (empty) {
        empty.style.display = "none";
    }

    if (table) {
        table.style.display = "none";
    }
}


/* =========================================================
   HIỂN THỊ LỖI
========================================================= */

function hienLoi(message) {

    const loading =
        document.getElementById("loading");

    const error =
        document.getElementById("error");


    if (loading) {
        loading.style.display = "none";
    }

    if (error) {

        error.style.display = "block";

        error.innerHTML =
            "❌ " +
            escapeHTML(message);
    }
}


/* =========================================================
   TẢI DANH SÁCH KỲ THI CỦA GIÁO VIÊN
========================================================= */

async function taiDanhSach() {

    if (!kiemTraGV()) {
        return;
    }

    hienLoading();

    const gv = layThongTinGV();

    console.log(
        "👨‍🏫 Giáo viên:",
        gv
    );


    try {

        const response =
            await fetch(
                API_QUAN_LY_KY_THI,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "danhSachKyThi",

                            data: {
                                maGV:
                                    gv.maGV
                            }

                        })
                }
            );


        const text =
            await response.text();


        console.log(
            "🌐 HTTP status:",
            response.status
        );

        console.log(
            "📄 Response:",
            text
        );


        let result;


        try {

            result =
                JSON.parse(text);

        }
        catch (e) {

            throw new Error(
                "Dữ liệu Apps Script trả về không phải JSON."
            );
        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Không lấy được danh sách kỳ thi."
            );
        }


        const danhSach =
            Array.isArray(result.data)
                ? result.data
                : [];


        console.log(
            "📋 Số kỳ thi:",
            danhSach.length
        );


        hienThiDanhSach(danhSach);

    }
    catch (error) {

        console.error(
            "❌ Lỗi tải danh sách:",
            error
        );

        hienLoi(
            error.message ||
            "Không thể tải danh sách kỳ thi."
        );
    }
}


/* =========================================================
   HIỂN THỊ DANH SÁCH KỲ THI
========================================================= */

function hienThiDanhSach(danhSach) {

    const loading =
        document.getElementById("loading");

    const empty =
        document.getElementById("empty");

    const table =
        document.getElementById("tableWrapper");

    const tbody =
        document.getElementById("examBody");


    if (loading) {
        loading.style.display = "none";
    }


    if (!tbody) {

        console.error(
            "❌ Không tìm thấy #examBody"
        );

        return;
    }


    tbody.innerHTML = "";


    if (!Array.isArray(danhSach) || !danhSach.length) {

        if (empty) {
            empty.style.display = "block";
        }

        if (table) {
            table.style.display = "none";
        }

        return;
    }


    if (empty) {
        empty.style.display = "none";
    }


    danhSach.forEach(
        function(item, index) {

            const tr =
                document.createElement("tr");


            const icon =
                item.Icon ||
                item.icon ||
                "🏆";


            const tenKyThi =
                item.TenKyThi ||
                item.tenKyThi ||
                "";


            const maKyThi =
                item.MaKyThi ||
                item.maKyThi ||
                "";


            const mon =
                item.Mon ||
                item.mon ||
                "";


            const khoi =
                item.Khoi ||
                item.khoi ||
                "";


            const soCau =
                item.SoCau ??
                item.soCau ??
                "";


            const thoiGian =
                item.ThoiGian ??
                item.thoiGian ??
                "";


            const trangThai =
                item.TrangThai ||
                item.trangThai ||
                "0";


            tr.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td class="ten-ky-thi">

                    ${escapeHTML(icon)}

                    ${escapeHTML(tenKyThi)}

                    <small>
                        Mã:
                        ${escapeHTML(maKyThi)}
                    </small>

                </td>


                <td>
                    ${escapeHTML(mon)}
                </td>


                <td>
                    ${
                        khoi
                            ? escapeHTML(khoi)
                            : "Chung"
                    }
                </td>


                <td>
                    ${escapeHTML(soCau)}
                </td>


                <td>
                    ${escapeHTML(thoiGian)}
                    phút
                </td>


                <td>
                    ${taoTrangThai(trangThai)}
                </td>


                <td>

                    <div class="actions">

                        <button
                            class="btn-small btn-edit"
                            type="button"
                            onclick='suaKyThi(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                        >
                            ✏️ Sửa
                        </button>


                        <button
                            class="btn-small"
                            type="button"
                            onclick='moDoiTrangThai(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                        >
                            🔄 Trạng thái
                        </button>


                        <button
                            class="btn-small btn-delete"
                            type="button"
                            onclick='xoaKyThi(${JSON.stringify(item).replace(/'/g, "&#39;")})'
                        >
                            🗑️ Xóa
                        </button>

                    </div>

                </td>

            `;


            tbody.appendChild(tr);
        }
    );


    if (table) {
        table.style.display = "block";
    }
}


/* =========================================================
   TẠO NHÃN TRẠNG THÁI
========================================================= */

function taoTrangThai(trangThai) {

    const tt =
        String(
            trangThai || "0"
        )
        .trim()
        .toUpperCase();


    if (tt === "1A") {

        return `
            <span class="status status-luyen">
                🟢 Luyện tập
            </span>
        `;
    }


    if (tt === "1B") {

        return `
            <span class="status status-thi">
                🔵 Thi thật
            </span>
        `;
    }


    return `
        <span class="status status-dong">
            ⚪ Đóng
        </span>
    `;
}


/* =========================================================
   SỬA KỲ THI
========================================================= */

function suaKyThi(item) {

    if (!item) {
        return;
    }


    const maKyThi =
        item.MaKyThi ||
        item.maKyThi ||
        "";


    console.log(
        "✏️ Sửa kỳ thi:",
        item
    );


    localStorage.setItem(
        "kyThiDangSua",
        JSON.stringify(item)
    );


    window.location.href =
        "tao-ky-thi.html?edit=" +
        encodeURIComponent(maKyThi);
}


/* =========================================================
   MỞ MENU ĐỔI TRẠNG THÁI
========================================================= */

function moDoiTrangThai(item) {

    if (!item) {
        return;
    }


    const hienTai =
        String(
            item.TrangThai ||
            item.trangThai ||
            "0"
        )
        .trim()
        .toUpperCase();


    const ten =
        item.TenKyThi ||
        item.tenKyThi ||
        item.MaKyThi ||
        item.maKyThi ||
        "";


    const luaChon =
        prompt(
            "QUẢN LÝ TRẠNG THÁI KỲ THI\n\n" +

            "Kỳ thi: " +
            ten +

            "\n\n" +

            "Trạng thái hiện tại: " +
            hienTai +

            "\n\n" +

            "Nhập:\n" +
            "1 = Mở luyện tập\n" +
            "2 = Mở thi thật\n" +
            "0 = Đóng kỳ thi\n\n" +

            "Lựa chọn:"
        );


    if (luaChon === null) {
        return;
    }


    const luaChonClean =
        String(luaChon).trim();


    let trangThaiMoi = "";


    if (luaChonClean === "1") {

        trangThaiMoi = "1A";

    }
    else if (luaChonClean === "2") {

        trangThaiMoi = "1B";

    }
    else if (luaChonClean === "0") {

        trangThaiMoi = "0";

    }
    else {

        alert(
            "❌ Lựa chọn không hợp lệ.\n\n" +
            "1 = Mở luyện tập\n" +
            "2 = Mở thi thật\n" +
            "0 = Đóng kỳ thi"
        );

        return;
    }


    if (hienTai === trangThaiMoi) {

        alert(
            "ℹ️ Kỳ thi đã ở trạng thái này."
        );

        return;
    }


    const xacNhan =
        confirm(

            "Kỳ thi: " +
            ten +

            "\n\n" +

            "Trạng thái hiện tại: " +
            hienTai +

            "\n" +

            "Trạng thái mới: " +
            trangThaiMoi +

            "\n\n" +

            "Bạn có chắc muốn thay đổi?"

        );


    if (!xacNhan) {
        return;
    }


    capNhatTrangThai(
        item,
        trangThaiMoi
    );
}


/* =========================================================
   ĐỔI TRẠNG THÁI KỲ THI
========================================================= */

async function capNhatTrangThai(
    item,
    trangThaiMoi
) {

    if (!item) {
        return;
    }


    const gv =
        layThongTinGV();


    if (!gv.maGV) {

        alert(
            "⚠️ Không xác định được mã giáo viên."
        );

        return;
    }


    const maKyThi =
        item.MaKyThi ||
        item.maKyThi ||
        "";


    if (!maKyThi) {

        alert(
            "❌ Không xác định được mã kỳ thi."
        );

        return;
    }


    try {

        console.log(
            "🔄 Đổi trạng thái:",
            maKyThi,
            trangThaiMoi
        );


        const trangThaiCu =
            String(
                item.TrangThai ||
                item.trangThai ||
                "0"
            )
            .trim()
            .toUpperCase();


        /* =================================================
           GỌI API ĐỔI TRẠNG THÁI
        ================================================= */

        const response =
            await fetch(
                API_QUAN_LY_KY_THI,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "doiTrangThai",

                            data: {

                                MaKyThi:
                                    maKyThi,

                                maGV:
                                    gv.maGV,

                                TrangThai:
                                    trangThaiMoi

                            }

                        })
                }
            );


        const text =
            await response.text();


        console.log(
            "📥 Kết quả đổi trạng thái:",
            text
        );


        let result;


        try {

            result =
                JSON.parse(text);

        }
        catch (e) {

            throw new Error(
                "Dữ liệu API trả về không phải JSON."
            );
        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Không thể đổi trạng thái."
            );
        }


        /* =================================================
           XÁC ĐỊNH HÀNH ĐỘNG
        ================================================= */

        let hanhDong =
            "Thay đổi trạng thái";


        if (trangThaiMoi === "1A") {

            hanhDong =
                "Mở luyện tập";

        }
        else if (trangThaiMoi === "1B") {

            hanhDong =
                "Mở thi thật";

        }
        else if (trangThaiMoi === "0") {

            hanhDong =
                "Đóng kỳ thi";
        }


        /* =================================================
           GHI NHẬT KÝ GIÁO VIÊN

           Không còn Admin.
        ================================================= */

        await ghiNhatKyGV(
            hanhDong,
            item,
            trangThaiCu,
            trangThaiMoi
        );


        alert(
            "✅ " +
            hanhDong +
            " thành công!"
        );


        await taiDanhSach();

    }
    catch (error) {

        console.error(
            "❌ Lỗi đổi trạng thái:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Không thể đổi trạng thái."
            )
        );
    }
}


/* =========================================================
   XÓA KỲ THI
========================================================= */

async function xoaKyThi(item) {

    if (!item) {
        return;
    }


    const maKyThi =
        item.MaKyThi ||
        item.maKyThi ||
        "";


    const ten =
        item.TenKyThi ||
        item.tenKyThi ||
        maKyThi;


    if (!maKyThi) {

        alert(
            "❌ Không xác định được mã kỳ thi."
        );

        return;
    }


    const xacNhan =
        confirm(

            "⚠️ XÓA KỲ THI\n\n" +

            "Kỳ thi:\n" +
            ten +

            "\n\n" +

            "Mã kỳ thi:\n" +
            maKyThi +

            "\n\n" +

            "Dữ liệu của kỳ thi sẽ bị xóa khỏi Sheet.\n\n" +

            "Bạn có chắc chắn muốn xóa?"

        );


    if (!xacNhan) {
        return;
    }


    const xacNhanLan2 =
        confirm(

            "⚠️ XÁC NHẬN LẦN CUỐI\n\n" +

            "Bạn thực sự muốn xóa kỳ thi:\n\n" +

            ten +

            "\n\nBạn có chắc chắn không?"

        );


    if (!xacNhanLan2) {
        return;
    }


    const gv =
        layThongTinGV();


    if (!gv.maGV) {

        alert(
            "⚠️ Không xác định được mã giáo viên."
        );

        return;
    }


    try {

        const response =
            await fetch(
                API_QUAN_LY_KY_THI,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "xoaKyThi",

                            data: {

                                MaKyThi:
                                    maKyThi,

                                maGV:
                                    gv.maGV

                            }

                        })
                }
            );


        const text =
            await response.text();


        console.log(
            "📥 Kết quả xóa:",
            text
        );


        let result;


        try {

            result =
                JSON.parse(text);

        }
        catch (e) {

            throw new Error(
                "Dữ liệu API trả về không phải JSON."
            );
        }


        if (!result.success) {

            throw new Error(
                result.message ||
                "Không thể xóa kỳ thi."
            );
        }


        /* =================================================
           GHI NHẬT KÝ XÓA
        ================================================= */

        await ghiNhatKyGV(
            "Xóa kỳ thi",
            item,
            item.TrangThai ||
            item.trangThai ||
            "",
            ""
        );


        alert(
            "✅ Đã xóa kỳ thi thành công."
        );


        await taiDanhSach();

    }
    catch (error) {

        console.error(
            "❌ Lỗi xóa kỳ thi:",
            error
        );


        alert(
            "❌ " +
            (
                error.message ||
                "Không thể xóa kỳ thi."
            )
        );
    }
}


/* =========================================================
   GHI NHẬT KÝ GIÁO VIÊN

   Giữ nguyên API ghi nhật ký.
   Chỉ thay trường người thực hiện:
   Admin → Giáo viên.
========================================================= */

async function ghiNhatKyGV(
    hanhDong,
    item,
    trangThaiCu,
    trangThaiMoi
) {

    if (!item) {
        return false;
    }


    try {

        const gv =
            layThongTinGV();


        const maKyThi =
            item.MaKyThi ||
            item.maKyThi ||
            "";


        const tenKyThi =
            item.TenKyThi ||
            item.tenKyThi ||
            "";


        const response =
            await fetch(
                API_NHAT_KY,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "text/plain;charset=utf-8"

                    },

                    body:
                        JSON.stringify({

                            action:
                                "ghiNhatKy",

                            data: {

                                thoiGian:
                                    new Date().toLocaleString(
                                        "vi-VN"
                                    ),

                                /* Người thực hiện */
                                admin:
                                    gv.maGV ||
                                    gv.hoTen ||
                                    "Giáo viên",

                                /* Thông tin giáo viên */
                                maGV:
                                    gv.maGV ||
                                    "",

                                hoTenGV:
                                    gv.hoTen ||
                                    "",

                                hanhDong:
                                    hanhDong,

                                maKyThi:
                                    maKyThi,

                                tenKyThi:
                                    tenKyThi,

                                trangThaiCu:
                                    trangThaiCu ||
                                    "",

                                trangThaiMoi:
                                    trangThaiMoi ||
                                    ""

                            }

                        })

                }
            );


        const text =
            await response.text();


        console.log(
            "📜 Kết quả ghi nhật ký giáo viên:",
            text
        );


        let result;


        try {

            result =
                JSON.parse(text);

        }
        catch (e) {

            console.error(
                "❌ Nhật ký trả về không phải JSON:",
                text
            );

            return false;
        }


        if (!result.success) {

            console.error(
                "❌ Ghi nhật ký thất bại:",
                result.message
            );

            return false;
        }


        console.log(
            "✅ Đã ghi nhật ký thao tác giáo viên."
        );


        return true;

    }
    catch (error) {

        /*
         * Không làm hỏng thao tác chính
         * nếu API nhật ký gặp lỗi.
         */

        console.error(
            "❌ Lỗi ghi nhật ký giáo viên:",
            error
        );

        return false;
    }
}


/* =========================================================
   QUAY LẠI TRANG GIÁO VIÊN
========================================================= */

function quayLaiTrangGV() {

    window.location.href =
        "trang-gv.html";
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );
}


/* =========================================================
   KHỞI ĐỘNG TRANG
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "🚀 QUẢN LÝ KỲ THI - GIÁO VIÊN KHỞI ĐỘNG"
        );


        /* -----------------------------------------------
           Kiểm tra giáo viên
        ----------------------------------------------- */

        if (!kiemTraGV()) {
            return;
        }


        /* -----------------------------------------------
           Hiển thị thông tin giáo viên
        ----------------------------------------------- */

        hienThiThongTinGV();


        /* -----------------------------------------------
           Tải danh sách kỳ thi
        ----------------------------------------------- */

        taiDanhSach();

    }
);