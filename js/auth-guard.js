/* =========================================================
   OLYMPIC HSG ONLINE
   PHÂN QUYỀN: HỌC SINH - GIÁO VIÊN - ADMIN
   ========================================================= */

(function () {
    "use strict";

    /* =========================
       1. CHUẨN HÓA VAI TRÒ
    ========================= */

    function normalizeRole(value) {
        const s = String(value || "")
            .trim()
            .toLowerCase();

        if (!s) return "";

        // ADMIN
        if (
            s === "admin" ||
            s === "administrator" ||
            s === "quantri" ||
            s === "quản trị" ||
            s === "quản trị viên" ||
            s === "qtv"
        ) {
            return "admin";
        }

        // GIÁO VIÊN
        if (
            s === "gv" ||
            s === "giaovien" ||
            s === "giáo viên" ||
            s === "teacher"
        ) {
            return "giaovien";
        }

        // HỌC SINH
        if (
            s === "hs" ||
            s === "hocsinh" ||
            s === "học sinh" ||
            s === "student"
        ) {
            return "hocsinh";
        }

        return s;
    }


    /* =========================
       2. LẤY VAI TRÒ ĐĂNG NHẬP
    ========================= */

    function getRole() {

        // Cách 1:
        // localStorage.setItem("role", "hocsinh")
        const roleKeys = [
            "role",
            "quyen",
            "vaiTro",
            "vaiTroNguoiDung",
            "userRole",
            "user_type",
            "loaiTaiKhoan"
        ];

        for (const key of roleKeys) {

            const value = localStorage.getItem(key);

            const role = normalizeRole(value);

            if (role) {
                return role;
            }
        }


        // Cách 2:
        // role nằm trong object currentUser
        const objectKeys = [
            "currentUser",
            "user",
            "olympicUser",
            "studentInfo",
            "taiKhoanHS",
            "hocSinh",
            "taiKhoan",
            "account",
            "nguoiDung"
        ];

        for (const key of objectKeys) {

            try {

                const obj = JSON.parse(
                    localStorage.getItem(key) || ""
                );

                if (
                    !obj ||
                    typeof obj !== "object"
                ) {
                    continue;
                }

                const role = normalizeRole(

                    obj.role ??
                    obj.Role ??
                    obj.quyen ??
                    obj.Quyen ??
                    obj.vaiTro ??
                    obj.vaiTroNguoiDung ??
                    obj.userRole ??
                    obj.loaiTaiKhoan

                );

                if (role) {
                    return role;
                }

            } catch (e) {}

        }


        // Hệ thống cũ:
        // Nếu có mã thí sinh thì coi là học sinh
        if (
            localStorage.getItem("maThiSinh") ||
            localStorage.getItem("tenThiSinh")
        ) {
            return "hocsinh";
        }


        return "";
    }


    /* =========================
       3. KIỂM TRA QUYỀN
    ========================= */

    function isAdmin() {
        return getRole() === "admin";
    }

    function isTeacher() {
        return getRole() === "giaovien";
    }

    function isStudent() {
        return getRole() === "hocsinh";
    }


    /* =========================
       4. CHUYỂN TRANG
    ========================= */

    function go(url, message) {

        if (message) {
            alert(message);
        }

        window.location.replace(url);
    }


    /* =========================
       5. BẢO VỆ ADMIN
    ========================= */

    function protectAdmin() {

        const role = getRole();


        // ADMIN được vào
        if (role === "admin") {
            return true;
        }


        // Học sinh
        if (role === "hocsinh") {

            go(
                "index.html",
                "🔒 Khu vực quản trị chỉ dành cho tài khoản Admin."
            );

            return false;
        }


        // Giáo viên
        if (role === "giaovien") {

            go(
                "index.html",
                "🔒 Khu vực này chỉ dành cho tài khoản Admin."
            );

            return false;
        }


        // Chưa đăng nhập
        go(
            "login.html",
            "Vui lòng đăng nhập bằng tài khoản Admin."
        );

        return false;
    }


    /* =========================
       6. BẢO VỆ TRANG GIÁO VIÊN
    ========================= */

    function protectTeacher() {

        const role = getRole();


        // Giáo viên được vào
        if (role === "giaovien") {
            return true;
        }


        // Học sinh
        if (role === "hocsinh") {

            go(
                "index.html",
                "🔒 Trang Giáo viên chỉ dành cho tài khoản Giáo viên."
            );

            return false;
        }


        // Admin
        if (role === "admin") {

            go(
                "admin.html",
                "🔒 Trang này dành cho tài khoản Giáo viên."
            );

            return false;
        }


        // Chưa đăng nhập
        go(
            "login.html",
            "Vui lòng đăng nhập bằng tài khoản Giáo viên."
        );

        return false;
    }


    /* =========================
       7. BẢO VỆ HỒ SƠ HỌC SINH
    ========================= */

    function protectStudentProfile() {

        const role = getRole();


        // Học sinh được vào
        if (role === "hocsinh") {
            return true;
        }


        // Admin
        if (role === "admin") {

            go(
                "admin.html",
                "🔒 Trang cá nhân học sinh không dành cho tài khoản Admin."
            );

            return false;
        }


        // Giáo viên
        if (role === "giaovien") {

            go(
                "index.html",
                "🔒 Trang cá nhân học sinh không dành cho tài khoản Giáo viên."
            );

            return false;
        }


        go(
            "login.html",
            "Vui lòng đăng nhập."
        );

        return false;
    }


    /* =========================
       8. ẨN MENU KHÔNG CÓ QUYỀN
    ========================= */

    function hideForbiddenMenus() {

        const role = getRole();


        /* ---------- ADMIN ---------- */

        if (role !== "admin") {

            document.querySelectorAll(
                'a[href="admin.html"],' +
                'a[href*="admin"],' +
                'a[data-role="admin"],' +
                '[data-role-only="admin"]'
            ).forEach(function (el) {

                el.style.display = "none";

            });
        }


        /* ---------- GIÁO VIÊN ---------- */

        if (role !== "giaovien") {

            document.querySelectorAll(
                'a[href*="giao-vien"],' +
                'a[href*="giaovien"],' +
                'a[href*="trang-gv"],' +
                'a[href*="tranggv"],' +
                'a[data-role="giaovien"],' +
                '[data-role-only="giaovien"]'
            ).forEach(function (el) {

                el.style.display = "none";

            });
        }


        /* ---------- HỌC SINH ---------- */

        if (role !== "hocsinh") {

            document.querySelectorAll(
                'a[href="trangcanhan.html"],' +
                'a[href*="trangcanhan"],' +
                'a[href*="ho-so-hoc-sinh"],' +
                'a[data-role="hocsinh"],' +
                '[data-role-only="hocsinh"]'
            ).forEach(function (el) {

                el.style.display = "none";

            });
        }


        /* =========================
           ẨN THEO CHỮ TRÊN NÚT
        ========================= */

        document.querySelectorAll(
            "a, button"
        ).forEach(function (el) {

            const text = (
                el.textContent || ""
            )
                .trim()
                .toLowerCase();


            // Không phải Admin
            if (
                role !== "admin" &&
                (
                    text.includes("admin") ||
                    text.includes("quản trị")
                )
            ) {

                el.style.display = "none";
            }


            // Không phải Giáo viên
            if (
                role !== "giaovien" &&
                (
                    text.includes("trang giáo viên") ||
                    text.includes("trang gv")
                )
            ) {

                el.style.display = "none";
            }


            // Không phải Học sinh
            if (
                role !== "hocsinh" &&
                (
                    text.includes("hồ sơ cá nhân") ||
                    text.includes("trang cá nhân học sinh")
                )
            ) {

                el.style.display = "none";
            }

        });

    }


    /* =========================
       9. TỰ ĐỘNG BẢO VỆ THEO TÊN FILE
    ========================= */

    function autoProtectByPage() {

        const file = (
            location.pathname
                .split("/")
                .pop() ||
            "index.html"
        ).toLowerCase();


        /* ---------- ADMIN ---------- */

        if (
            file === "admin.html" ||
            file.startsWith("admin-") ||
            file.includes("quan-tri") ||
            file.includes("quantri")
        ) {

            protectAdmin();

            return;
        }


        /* ---------- GIÁO VIÊN ---------- */

        if (
            file.includes("giao-vien") ||
            file.includes("giaovien") ||
            file.includes("trang-gv") ||
            file.includes("tranggv")
        ) {

            protectTeacher();

            return;
        }


        /* ---------- HỒ SƠ HS ---------- */

        if (
            file === "trangcanhan.html" ||
            file.startsWith("trangcanhan") ||
            file.includes("ho-so-hoc-sinh")
        ) {

            protectStudentProfile();

            return;
        }

    }


    /* =========================
       10. CHẠY BẢO VỆ
    ========================= */

    autoProtectByPage();


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            hideForbiddenMenus
        );

    } else {

        hideForbiddenMenus();

    }


    /* =========================
       11. PUBLIC API
    ========================= */

    window.AuthGuard = {

        getRole,

        isAdmin,

        isTeacher,

        isStudent,

        protectAdmin,

        protectTeacher,

        protectStudentProfile,

        hideForbiddenMenus

    };

})();