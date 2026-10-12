/* =========================================================
   LOGIN HỌC SINH - OLYMPIC HSG ONLINE
   Phiên đăng nhập dùng chung toàn hệ thống
   ========================================================= */

const CSV_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vS6_WjXUhmCkG93WRhKP_qMr6WDeIiescm629RTfyGwEBCO1hZKSEFD1rpZWccc65CfA9I-230Ab_pn/pub?output=csv";

let danhSachHocSinh = [];
let daTaiDuLieu = false;


/* =========================================================
   TẢI DANH SÁCH HỌC SINH
   ========================================================= */

fetch(CSV_URL)
.then(response => {

    if (!response.ok) {
        throw new Error(
            "Không tải được dữ liệu học sinh. HTTP " +
            response.status
        );
    }

    return response.text();
})
.then(csv => {

    const dong = csv
        .trim()
        .split(/\r?\n/);

    // Bỏ dòng tiêu đề
    dong.shift();

    danhSachHocSinh = dong
        .filter(line => line.trim() !== "")
        .map(line => {

            const cot = line.split(",");

            return {

                mahs: (cot[0] || "").trim(),

                matkhau: (cot[1] || "").trim(),

                hoten: (cot[2] || "").trim(),

                ngaysinh: (cot[3] || "").trim(),

                gioitinh: (cot[4] || "").trim(),

                lop: (cot[5] || "").trim(),

                truong: (cot[6] || "").trim(),

                quyen: (cot[7] || "").trim(),

                trangThai: (cot[8] || "").trim()

            };

        });

    daTaiDuLieu = true;

    console.log(
        "✅ Đã tải danh sách học sinh:",
        danhSachHocSinh.length
    );

})
.catch(error => {

    console.error(
        "❌ Lỗi tải danh sách học sinh:",
        error
    );

    daTaiDuLieu = false;

});


/* =========================================================
   HÀM ĐĂNG NHẬP
   ========================================================= */

function dangNhap() {

    const oMaHS =
        document.getElementById("mahs");

    const oMatKhau =
        document.getElementById("matkhau");

    const thongBao =
        document.getElementById("thongbao");


    if (!oMaHS || !oMatKhau) {

        console.error(
            "Không tìm thấy ô mã học sinh hoặc mật khẩu."
        );

        return;
    }


    const mahs =
        oMaHS.value.trim();

    const matkhau =
        oMatKhau.value.trim();


    /* -----------------------------------------------------
       KIỂM TRA DỮ LIỆU NHẬP
       ----------------------------------------------------- */

    if (mahs === "" || matkhau === "") {

        if (thongBao) {

            thongBao.innerHTML =
                "⚠️ Vui lòng nhập đầy đủ mã học sinh và mật khẩu";

        }

        return;
    }


    /* -----------------------------------------------------
       KIỂM TRA ĐÃ TẢI CSV CHƯA
       ----------------------------------------------------- */

    if (!daTaiDuLieu) {

        if (thongBao) {

            thongBao.innerHTML =
                "⏳ Dữ liệu học sinh chưa tải xong. Vui lòng thử lại.";

        }

        return;
    }


    /* -----------------------------------------------------
       TÌM HỌC SINH
       ----------------------------------------------------- */

    const hocSinh =
        danhSachHocSinh.find(function(hs) {

            return (
                hs.mahs === mahs &&
                hs.matkhau === matkhau
            );

        });


    /* -----------------------------------------------------
       SAI TÀI KHOẢN
       ----------------------------------------------------- */

    if (!hocSinh) {

        if (thongBao) {

            thongBao.innerHTML =
                "❌ Sai mã học sinh hoặc mật khẩu";

        }

        return;
    }


    /* -----------------------------------------------------
       KIỂM TRA TÀI KHOẢN BỊ KHÓA
       ----------------------------------------------------- */

    if (
        hocSinh.trangThai === "0" ||
        hocSinh.trangThai.toLowerCase() === "khóa"
    ) {

        if (thongBao) {

            thongBao.innerHTML =
                "🔒 Tài khoản học sinh đã bị khóa";

        }

        return;
    }


    /* =====================================================
   XÓA CÁC PHIÊN ĐĂNG NHẬP CŨ
   ===================================================== */

// Xóa phiên GIÁO VIÊN
localStorage.removeItem("dangNhapGV");
localStorage.removeItem("maGV");
localStorage.removeItem("hoTenGV");
localStorage.removeItem("clbGV");
localStorage.removeItem("monGV");
localStorage.removeItem("quyenGV");
localStorage.removeItem("giaoVien");

// Xóa phiên ADMIN
localStorage.removeItem("dangNhapAdmin");
localStorage.removeItem("maAdmin");
localStorage.removeItem("hoTenAdmin");
localStorage.removeItem("quyenAdmin");
localStorage.removeItem("admin");

// Xóa phiên dùng chung cũ
localStorage.removeItem("currentUser");
localStorage.removeItem("user");
localStorage.removeItem("olympicUser");
localStorage.removeItem("role");

/* =====================================================
   ĐỒNG BỘ MÃ HỌC SINH CHO TOÀN BỘ HỆ THỐNG
   ===================================================== */

const maHSPhien = String(hocSinh.mahs || "").trim();

if (!maHSPhien) {
    if (thongBao) {
        thongBao.textContent = "Không xác định được mã học sinh.";
    }
    return;
}

// Ghi đè mã cũ bằng mã của tài khoản vừa đăng nhập
localStorage.setItem("maHS", maHSPhien);
localStorage.setItem("MaHS", maHSPhien);
localStorage.setItem("studentCode", maHSPhien);
localStorage.setItem("userId", maHSPhien);
localStorage.setItem("maThiSinh", maHSPhien);

// Đồng bộ thông tin cơ bản của phiên hiện tại
localStorage.setItem("hoTen", hocSinh.hoten || "");
localStorage.setItem("hoTenDangNhap", hocSinh.hoten || "");
localStorage.setItem("lop", hocSinh.lop || "");

// Đánh dấu loại tài khoản đang đăng nhập
localStorage.setItem("role", "hocsinh");
localStorage.setItem("loaiTaiKhoan", "hocSinh");

console.log("✅ Đã đồng bộ phiên học sinh:", {
    maHS: maHSPhien,
    hoTen: hocSinh.hoten,
    lop: hocSinh.lop
});
/* =====================================================
   LƯU THÔNG TIN HỌC SINH
   ===================================================== */

localStorage.setItem(
    "maThiSinh",
    hocSinh.mahs
);

localStorage.setItem(
    "tenThiSinh",
    hocSinh.hoten
);

localStorage.setItem(
    "hoTen",
    hocSinh.hoten
);

localStorage.setItem(
    "ngaySinh",
    hocSinh.ngaysinh
);

localStorage.setItem(
    "gioiTinh",
    hocSinh.gioitinh
);

localStorage.setItem(
    "lopThiSinh",
    hocSinh.lop
);

localStorage.setItem(
    "truong",
    hocSinh.truong
);

localStorage.setItem(
    "quyen",
    hocSinh.quyen
);


/* =====================================================
   TRẠNG THÁI ĐĂNG NHẬP
   ===================================================== */

localStorage.setItem(
    "dangNhap",
    "true"
);


/* =====================================================
   PHÂN QUYỀN CHÍNH
   ===================================================== */

// ⭐ Đây là dòng QUAN TRỌNG NHẤT
localStorage.setItem(
    "role",
    "hocsinh"
);

localStorage.setItem(
    "loaiTaiKhoan",
    "hocSinh"
);


/* =====================================================
   LƯU OBJECT HỌC SINH
   ===================================================== */

const thongTinHocSinh = {

    maHS: hocSinh.mahs,

    hoTen: hocSinh.hoten,

    lop: hocSinh.lop,

    ngaySinh: hocSinh.ngaysinh,

    gioiTinh: hocSinh.gioitinh,

    truong: hocSinh.truong,

    quyen: hocSinh.quyen,

    // ⭐ Quyền của tài khoản
    role: "hocsinh"

};


localStorage.setItem(
    "hocSinh",
    JSON.stringify(thongTinHocSinh)
);


/* =====================================================
   LƯU CURRENT USER DÙNG CHUNG
   ===================================================== */

localStorage.setItem(
    "currentUser",
    JSON.stringify({

        maHS: hocSinh.mahs,

        hoTen: hocSinh.hoten,

        lop: hocSinh.lop,

        ngaySinh: hocSinh.ngaysinh,

        gioiTinh: hocSinh.gioitinh,

        truong: hocSinh.truong,

        quyen: hocSinh.quyen,

        // ⭐ Quyền của tài khoản
        role: "hocsinh"

    })
);
    /* =====================================================
       THÔNG BÁO ĐĂNG NHẬP THÀNH CÔNG
       ===================================================== */

    console.log(
        "✅ Học sinh đăng nhập:",
        hocSinh.hoten
    );

    console.log(
        "Mã học sinh:",
        hocSinh.mahs
    );

    console.log(
        "Lớp:",
        hocSinh.lop
    );


    /* =====================================================
       CHUYỂN VÀO TRANG CÁ NHÂN
       ===================================================== */

    window.location.href =
        "trangcanhan.html";

}