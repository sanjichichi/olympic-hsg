/* =========================================================
   TAO-KY-THI.JS
   Olympic HSG Online
   Cấu trúc Sheet A:N
========================================================= */

const API_TAO_KY_THI =
    "https://script.google.com/macros/s/AKfycbwtNrOGgfBdCj0b17z43-EkGZ7-vrS5iDr5uZnzoahBSdJ7gqaSw8m7zK8uBcvCgLXx/exec";


/* =========================================================
   LẤY THÔNG TIN GIÁO VIÊN
========================================================= */

function layThongTinGV() {

    return {

        maGV:
            localStorage.getItem("maGV") ||
            localStorage.getItem("maGiaoVien") ||
            "",

        hoTen:
            localStorage.getItem("hoTenGV") ||
            localStorage.getItem("tenGiaoVien") ||
            localStorage.getItem("hoTen") ||
            ""

    };

}


/* =========================================================
   KIỂM TRA ĐĂNG NHẬP
========================================================= */

function kiemTraDangNhapGV() {

    const gv = layThongTinGV();

    if (!gv.maGV && !gv.hoTen) {

        alert(
            "⚠️ Phiên đăng nhập giáo viên đã hết.\n\n" +
            "Vui lòng đăng nhập lại."
        );

        window.location.href =
            "login-gv.html";

        return false;
    }

    return true;
}


/* =========================================================
   LẤY TRẠNG THÁI
========================================================= */

function layTrangThai() {

    const radio =
        document.querySelector(
            'input[name="trangThai"]:checked'
        );

    return radio
        ? radio.value
        : "0";
}


/* =========================================================
   ĐỌC FORM
========================================================= */

function layDuLieuForm() {

    const gv = layThongTinGV();

    return {

        MaKyThi:
            document
                .getElementById("maKyThi")
                .value
                .trim(),

        NamHoc:
            document
                .getElementById("namHoc")
                .value
                .trim(),

        DotThi:
            document
                .getElementById("dotThi")
                .value,

        SuKien:
            document
                .getElementById("suKien")
                .value
                .trim(),

        Mon:
            document
                .getElementById("mon")
                .value,

        TenKyThi:
            document
                .getElementById("tenKyThi")
                .value
                .trim(),

        Icon:
            document
                .getElementById("icon")
                .value
                .trim() || "🏆",

        SoCau:
            Number(
                document
                    .getElementById("soCau")
                    .value
            ),

        ThoiGian:
            Number(
                document
                    .getElementById("thoiGian")
                    .value
            ),

        TrangThai:
            layTrangThai(),

        ThiThu:
            document
                .getElementById("thiThu")
                .checked
                ? "1"
                : "0",

        Filede:
            document
                .getElementById("fileDe")
                .value
                .trim(),

        Khoi:
            document
                .getElementById("khoi")
                .value,

        maGV:
            gv.maGV

    };

}


/* =========================================================
   KIỂM TRA DỮ LIỆU
========================================================= */

function kiemTraDuLieu(data) {

    if (!data.MaKyThi) {

        alert("⚠️ Vui lòng nhập mã kỳ thi.");

        document
            .getElementById("maKyThi")
            .focus();

        return false;
    }


    if (
        !/^[a-zA-Z0-9_-]+$/
            .test(data.MaKyThi)
    ) {

        alert(
            "⚠️ Mã kỳ thi chỉ gồm chữ cái, số, _ hoặc -.\n\n" +
            "Ví dụ: toan6_2026"
        );

        document
            .getElementById("maKyThi")
            .focus();

        return false;
    }


    if (!data.TenKyThi) {

        alert(
            "⚠️ Vui lòng nhập tên kỳ thi."
        );

        document
            .getElementById("tenKyThi")
            .focus();

        return false;
    }


    if (!data.Mon) {

        alert(
            "⚠️ Vui lòng chọn môn thi."
        );

        document
            .getElementById("mon")
            .focus();

        return false;
    }


    if (
        !Number.isFinite(data.SoCau) ||
        data.SoCau <= 0
    ) {

        alert(
            "⚠️ Số câu không hợp lệ."
        );

        document
            .getElementById("soCau")
            .focus();

        return false;
    }


    if (
        !Number.isFinite(data.ThoiGian) ||
        data.ThoiGian <= 0
    ) {

        alert(
            "⚠️ Thời gian làm bài không hợp lệ."
        );

        document
            .getElementById("thoiGian")
            .focus();

        return false;
    }


    if (!data.Filede) {

        alert(
            "⚠️ Vui lòng nhập tên file đề."
        );

        document
            .getElementById("fileDe")
            .focus();

        return false;
    }


    if (!data.Khoi) {

        alert(
            "⚠️ Vui lòng chọn khối."
        );

        document
            .getElementById("khoi")
            .focus();

        return false;
    }


    if (!data.maGV) {

        alert(
            "⚠️ Không xác định được mã giáo viên."
        );

        return false;
    }


    return true;

}


/* =========================================================
   KIỂM TRA API
========================================================= */

function kiemTraAPI() {

    if (
        !API_TAO_KY_THI ||
        API_TAO_KY_THI ===
        "DAN_URL_GOOGLE_APPS_SCRIPT_VAO_DAY"
    ) {

        alert(
            "⚠️ Chưa cấu hình Google Apps Script.\n\n" +
            "Hãy nhập URL Web App vào biến:\n\n" +
            "API_TAO_KY_THI"
        );

        return false;
    }

    return true;
}


/* =========================================================
   GỬI DỮ LIỆU
========================================================= */

async function guiDuLieuLenSheet(data) {

    const response =
        await fetch(
            API_TAO_KY_THI,
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body:
                    JSON.stringify({

                        action:
                            "taoKyThi",

                        data:
                            data

                    })

            }
        );


    if (!response.ok) {

        throw new Error(
            "HTTP " +
            response.status
        );
    }


    const text =
        await response.text();


    console.log(
        "📥 Apps Script:",
        text
    );


    let result;


    try {

        result =
            JSON.parse(text);

    }
    catch (error) {

        throw new Error(
            "Phản hồi từ Apps Script không hợp lệ."
        );

    }


    return result;

}


/* =========================================================
   TẠO KỲ THI
========================================================= */

async function taoKyThi() {

    if (
        !kiemTraDangNhapGV()
    ) {
        return;
    }


    const data =
        layDuLieuForm();


    console.log(
        "📋 Dữ liệu tạo kỳ thi:",
        data
    );


    if (
        !kiemTraDuLieu(data)
    ) {
        return;
    }


    if (
        !kiemTraAPI()
    ) {
        return;
    }


    const xacNhan =
        confirm(

            "XÁC NHẬN TẠO KỲ THI\n\n" +

            "Mã kỳ thi: " +
            data.MaKyThi +

            "\nTên: " +
            data.TenKyThi +

            "\nMôn: " +
            data.Mon +

            "\nKhối: " +
            data.Khoi +

            "\nSố câu: " +
            data.SoCau +

            "\nThời gian: " +
            data.ThoiGian +
            " phút" +

            "\nTrạng thái: " +
            data.TrangThai

        );


    if (!xacNhan) {
        return;
    }


    const nut =
        document.querySelector(
            'button[onclick="taoKyThi()"]'
        );


    if (nut) {

        nut.disabled =
            true;

        nut.textContent =
            "⏳ Đang tạo...";

    }


    try {

        const result =
            await guiDuLieuLenSheet(
                data
            );


        if (
            result &&
            result.success
        ) {

            alert(
                "✅ Tạo kỳ thi thành công!\n\n" +
                "Mã kỳ thi: " +
                data.MaKyThi
            );


            resetForm();


            if (
                typeof taiDanhSachKyThi ===
                "function"
            ) {

                taiDanhSachKyThi();

            }

        }
        else {

            throw new Error(

                result &&
                result.message

                    ? result.message

                    : "Không thể tạo kỳ thi."

            );

        }

    }
    catch (error) {

        console.error(
            "❌ Lỗi tạo kỳ thi:",
            error
        );


        alert(
            "❌ Tạo kỳ thi thất bại.\n\n" +
            error.message
        );

    }
    finally {

        if (nut) {

            nut.disabled =
                false;

            nut.textContent =
                "💾 Tạo kỳ thi";

        }

    }

}


/* =========================================================
   XÓA FORM SAU KHI TẠO
========================================================= */

function resetForm() {

    document
        .getElementById("maKyThi")
        .value = "";

    document
        .getElementById("tenKyThi")
        .value = "";

    document
        .getElementById("soCau")
        .value = "30";

    document
        .getElementById("thoiGian")
        .value = "45";

    document
        .getElementById("fileDe")
        .value = "";

    document
        .getElementById("icon")
        .value = "🏆";

    document
        .getElementById("iconPreview")
        .textContent = "🏆";

    document
        .getElementById("mon")
        .value = "";

    document
        .getElementById("khoi")
        .value = "6";

    const radio =
        document.querySelector(
            'input[name="trangThai"][value="1A"]'
        );

    if (radio) {

        radio.checked =
            true;

        radio.dispatchEvent(
            new Event("change")
        );

    }

}


/* =========================================================
   HIỂN THỊ GIÁO VIÊN
========================================================= */

function hienThiThongTinGV() {

    const gv =
        layThongTinGV();


    const name =
        document.getElementById(
            "teacherName"
        );

    const info =
        document.getElementById(
            "teacherInfo"
        );


    if (name) {

        name.textContent =
            gv.hoTen ||
            "Giáo viên";

    }


    if (info) {

        info.textContent =
            gv.maGV
                ? "Mã giáo viên: " +
                  gv.maGV
                : "";

    }

}


/* =========================================================
   QUAY LẠI
========================================================= */

function quayLai() {

    window.location.href =
        "trang-gv.html";

}


/* =========================================================
   KHỞI ĐỘNG
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (
            !kiemTraDangNhapGV()
        ) {
            return;
        }


        hienThiThongTinGV();


        console.log(
            "✅ tao-ky-thi.js đã khởi động."
        );

    }
);

