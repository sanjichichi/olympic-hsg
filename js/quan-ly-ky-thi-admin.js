/* =========================================================
   QUẢN LÝ KỲ THI - ADMIN
   File: quan-ly-ky-thi-admin.js
========================================================= */


/* =========================================================
   API APPS SCRIPT
========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwtNrOGgfBdCj0b17z43-EkGZ7-vrS5iDr5uZnzoahBSdJ7gqaSw8m7zK8uBcvCgLXx/exec";


/* =========================================================
   API NHẬT KÝ HỆ THỐNG
========================================================= */

const API_NHAT_KY =
    "https://script.google.com/macros/s/AKfycbwDrXSUXhCxU0XvMBkvGcxJjj_-B-ujrgNeIUZDbwRBph-8or26siTEB1XVweydexIpPg/exec";


/* =========================================================
   BIẾN TOÀN CỤC
========================================================= */

let danhSachKyThi = [];

let danhSachKyThiLoc = [];


/* =========================================================
   KHI TRANG TẢI
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function(){

        console.log(
            "🚀 Trang quản lý kỳ thi Admin đã khởi động."
        );

        taiKyThi();

    }
);


/* =========================================================
   TẢI DANH SÁCH KỲ THI
========================================================= */

async function taiKyThi(){

    const box =
        document.getElementById(
            "bangKyThi"
        );


    if(!box)
        return;


    box.innerHTML = `
        <div class="loading">
            ⏳ Đang tải danh sách kỳ thi...
        </div>
    `;


    try{

        console.log(
            "📡 Đang tải danh sách kỳ thi Admin..."
        );


        const response =
            await fetch(
                API_URL,
                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "adminDanhSachKyThi",

                            data:{}

                        })

                }
            );


        const text =
            await response.text();


        console.log(
            "📥 API danh sách trả về:",
            text
        );


        let result;


        try{

            result =
                JSON.parse(
                    text
                );

        }
        catch(error){

            throw new Error(
                "Apps Script trả về dữ liệu không phải JSON."
            );

        }


        if(
            !result.success
        ){

            throw new Error(
                result.message ||
                "Không tải được danh sách kỳ thi."
            );

        }


        /*
         * Chấp nhận nhiều dạng trả về:
         *
         * result.data
         * result.danhSach
         * result.kyThi
         */

        danhSachKyThi =
            Array.isArray(
                result.data
            )
            ?
            result.data
            :
            (
                Array.isArray(
                    result.danhSach
                )
                ?
                result.danhSach
                :
                (
                    Array.isArray(
                        result.kyThi
                    )
                    ?
                    result.kyThi
                    :
                    []
                )
            );


        danhSachKyThiLoc =
            [...danhSachKyThi];


        console.log(
            "📋 Số kỳ thi:",
            danhSachKyThi.length
        );


        locKyThi();


    }
    catch(error){

        console.error(
            "❌ Lỗi tải kỳ thi:",
            error
        );


        box.innerHTML = `
            <div class="empty">
                ❌ ${escapeHTML(
                    error.message
                )}
            </div>
        `;


        hienThongBao(
            "error",
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   LỌC KỲ THI
========================================================= */

function locKyThi(){

    const input =
        document.getElementById(
            "timKiem"
        );


    const select =
        document.getElementById(
            "locTrangThai"
        );


    const tuKhoa =
        String(
            input?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const trangThaiLoc =
        String(
            select?.value ||
            ""
        )
        .trim()
        .toUpperCase();


    danhSachKyThiLoc =
        danhSachKyThi.filter(
            function(item){

                const ma =
                    String(
                        item.MaKyThi ||
                        item.maKyThi ||
                        ""
                    )
                    .toLowerCase();


                const ten =
                    String(
                        item.TenKyThi ||
                        item.tenKyThi ||
                        ""
                    )
                    .toLowerCase();


                const trangThai =
                    String(
                        item.TrangThai ||
                        item.trangThai ||
                        "0"
                    )
                    .trim()
                    .toUpperCase();


                const dungTuKhoa =
                    !tuKhoa ||
                    ma.includes(
                        tuKhoa
                    ) ||
                    ten.includes(
                        tuKhoa
                    );


                const dungTrangThai =
                    !trangThaiLoc ||
                    trangThai ===
                    trangThaiLoc;


                return (
                    dungTuKhoa &&
                    dungTrangThai
                );

            }
        );


    hienThiKyThi(
        danhSachKyThiLoc
    );

}


/* =========================================================
   HIỂN THỊ DANH SÁCH
========================================================= */

function hienThiKyThi(
    data
){

    const box =
        document.getElementById(
            "bangKyThi"
        );


    if(!box)
        return;


    const tong =
        document.getElementById(
            "tongKyThi"
        );


    if(tong){

        tong.textContent =
            danhSachKyThiLoc.length +
            " kỳ thi";

    }


    if(
        !data ||
        data.length === 0
    ){

        box.innerHTML = `
            <div class="empty">
                📭 Không tìm thấy kỳ thi.
            </div>
        `;

        return;

    }


    let html = `

        <table>

            <thead>

                <tr>

                    <th>Mã kỳ thi</th>

                    <th>Năm học</th>

                    <th>Đợt thi</th>

                    <th>Sự kiện</th>

                    <th>Môn</th>

                    <th>Tên kỳ thi</th>

                    <th>Số câu</th>

                    <th>Thời gian</th>

                    <th>Trạng thái</th>

                    <th>Khối</th>

                    <th>Mã giáo viên</th>

                    <th>Thao tác</th>

                </tr>

            </thead>

            <tbody>
    `;


    data.forEach(
        function(item){

            const maKyThi =
                item.MaKyThi ||
                item.maKyThi ||
                "";


            const namHoc =
                item.NamHoc ||
                item.namHoc ||
                "";


            const dotThi =
                item.DotThi ||
                item.dotThi ||
                "";


            const suKien =
                item.SuKien ||
                item.suKien ||
                "";


            const mon =
                item.Mon ||
                item.mon ||
                "";


            const tenKyThi =
                item.TenKyThi ||
                item.tenKyThi ||
                "";


            const soCau =
                item.SoCau ||
                item.soCau ||
                "";


            const thoiGian =
                item.ThoiGian ||
                item.thoiGian ||
                "";


            const trangThai =
                String(
                    item.TrangThai ||
                    item.trangThai ||
                    "0"
                )
                .trim()
                .toUpperCase();


            const khoi =
                item.Khoi ||
                item.khoi ||
                "";


            const maGV =
                item.maGV ||
                item.MaGV ||
                "";


            html += `

                <tr>

                    <td>
                        ${escapeHTML(
                            maKyThi
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            namHoc
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            dotThi
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            suKien
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            mon
                        )}
                    </td>

                    <td>
                        <b>
                            ${escapeHTML(
                                tenKyThi
                            )}
                        </b>
                    </td>

                    <td>
                        ${escapeHTML(
                            soCau
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            thoiGian
                        )}
                    </td>

                    <td>
                        ${renderTrangThai(
                            trangThai
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            khoi
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            maGV
                        )}
                    </td>

                    <td>

                        ${renderActions(
                            maKyThi,
                            trangThai
                        )}

                    </td>

                </tr>

            `;

        }
    );


    html += `

            </tbody>

        </table>

    `;


    box.innerHTML =
        html;

}


/* =========================================================
   HIỂN THỊ TRẠNG THÁI
========================================================= */

function renderTrangThai(
    trangThai
){

    if(
        trangThai === "1A"
    ){

        return `
            <span class="status status-1a">
                🔵 Luyện tập
            </span>
        `;

    }


    if(
        trangThai === "1B"
    ){

        return `
            <span class="status status-1b">
                🟢 Thi thật
            </span>
        `;

    }


    return `
        <span class="status status-0">
            🔴 Đóng
        </span>
    `;

}


/* =========================================================
   HIỂN THỊ NÚT THAO TÁC
========================================================= */

function renderActions(
    maKyThi,
    trangThai
){

    const ma =
        escapeHTML(
            maKyThi
        );


    /*
     * Dùng encodeURIComponent
     * để tránh lỗi khi mã có ký tự đặc biệt.
     */

    const maJS =
        JSON.stringify(
            maKyThi
        )
        .replace(
            /</g,
            "\\u003c"
        )
        .replace(
            />/g,
            "\\u003e"
        )
        .replace(
            /&/g,
            "\\u0026"
        );


    let html =
        `<div class="actions">`;


    if(
        trangThai !== "1A"
    ){

        html += `
            <button
                class="action action-1a"
                onclick='doiTrangThai(
                    ${maJS},
                    "1A"
                )'>
                🔵 Mở luyện tập
            </button>
        `;

    }


    if(
        trangThai !== "1B"
    ){

        html += `
            <button
                class="action action-1b"
                onclick='doiTrangThai(
                    ${maJS},
                    "1B"
                )'>
                🟢 Mở thi thật
            </button>
        `;

    }


    if(
        trangThai !== "0"
    ){

        html += `
            <button
                class="action action-0"
                onclick='doiTrangThai(
                    ${maJS},
                    "0"
                )'>
                🔴 Đóng
            </button>
        `;

    }


    html +=
        `</div>`;


    return html;

}


/* =========================================================
   ĐỔI TRẠNG THÁI KỲ THI - ADMIN
========================================================= */

async function doiTrangThai(
    maKyThi,
    trangThai
){

    if(!maKyThi)
        return;


    let ten;


    if(
        trangThai === "1A"
    ){

        ten =
            "MỞ LUYỆN TẬP";

    }

    else if(
        trangThai === "1B"
    ){

        ten =
            "MỞ THI THẬT";

    }

    else{

        ten =
            "ĐÓNG KỲ THI";

    }


    const ok =
        confirm(

            "Bạn có chắc muốn " +
            ten +
            "?\n\n" +

            "Mã kỳ thi: " +
            maKyThi

        );


    if(!ok)
        return;


    try{

        const admin =
            localStorage.getItem(
                "hoTenAdmin"
            ) ||
            "ADMIN";


        console.log(
            "🔄 Admin đổi trạng thái:",
            maKyThi,
            trangThai
        );


        const response =
            await fetch(
                API_URL,
                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "adminDoiTrangThaiKyThi",

                            data:{

                                maKyThi:
                                    maKyThi,

                                trangThai:
                                    trangThai,

                                admin:
                                    admin

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


        try{

            result =
                JSON.parse(
                    text
                );

        }
        catch(error){

            throw new Error(
                "Apps Script trả về dữ liệu không phải JSON."
            );

        }


        if(
            !result.success
        ){

            throw new Error(
                result.message ||
                "Không thể cập nhật kỳ thi."
            );

        }


        /*
         * Lấy thông tin kỳ thi
         * trước khi tải lại danh sách.
         */

        const item =
            danhSachKyThi.find(
                function(x){

                    return String(
                        x.MaKyThi ||
                        x.maKyThi ||
                        ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    String(
                        maKyThi
                    )
                    .trim()
                    .toLowerCase();

                }
            )
            ||
            {
                MaKyThi:
                    maKyThi,

                TenKyThi:
                    result.TenKyThi ||
                    result.tenKyThi ||
                    maKyThi
            };


        /*
         * Xác định hành động
         */

        let hanhDong =
            "Thay đổi trạng thái";


        if(
            trangThai === "1A"
        ){

            hanhDong =
                "Mở luyện tập";

        }

        else if(
            trangThai === "1B"
        ){

            hanhDong =
                "Mở thi thật";

        }

        else if(
            trangThai === "0"
        ){

            hanhDong =
                "Đóng kỳ thi";

        }


        /*
         * Ghi nhật ký
         */

        await ghiNhatKyAdmin(

            hanhDong,

            item,

            "",

            trangThai

        );


        hienThongBao(
            "success",
            "✅ " +
            (
                result.message ||
                "Cập nhật thành công."
            )
        );


        await taiKyThi();

    }
    catch(error){

        console.error(
            "❌ Lỗi đổi trạng thái:",
            error
        );


        hienThongBao(
            "error",
            "❌ " +
            error.message
        );

    }

}


/* =========================================================
   GHI NHẬT KÝ ADMIN
========================================================= */

async function ghiNhatKyAdmin(
    hanhDong,
    item,
    trangThaiCu,
    trangThaiMoi
){

    try{

        const admin =
            localStorage.getItem(
                "hoTenAdmin"
            ) ||
            "ADMIN";


        const response =
            await fetch(
                API_NHAT_KY,
                {

                    method:"POST",

                    headers:{
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                "ghiNhatKy",

                            data:{

                                thoiGian:
                                    new Date()
                                    .toLocaleString(
                                        "vi-VN"
                                    ),

                                admin:
                                    admin,

                                hanhDong:
                                    hanhDong,

                                maKyThi:
                                    item?.MaKyThi ||
                                    item?.maKyThi ||
                                    "",

                                tenKyThi:
                                    item?.TenKyThi ||
                                    item?.tenKyThi ||
                                    "",

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
            "📜 Nhật ký trả về:",
            text
        );


        let result;


        try{

            result =
                JSON.parse(
                    text
                );

        }
        catch(error){

            console.error(
                "❌ Nhật ký trả về không phải JSON:",
                text
            );

            return false;

        }


        if(
            !result.success
        ){

            console.error(
                "❌ Ghi nhật ký thất bại:",
                result.message
            );

            return false;

        }


        console.log(
            "✅ Đã ghi nhật ký Admin."
        );


        return true;

    }
    catch(error){

        /*
         * Không làm hỏng thao tác chính
         * nếu nhật ký gặp lỗi.
         */

        console.error(
            "❌ Lỗi ghi nhật ký:",
            error
        );


        return false;

    }

}


/* =========================================================
   THÔNG BÁO
========================================================= */

function hienThongBao(
    type,
    message
){

    const box =
        document.getElementById(
            "message"
        );


    if(!box)
        return;


    box.className =
        "message " +
        (
            type === "success"
            ?
            "success"
            :
            "error"
        );


    box.textContent =
        message;


    box.style.display =
        "block";


    clearTimeout(
        hienThongBao.timer
    );


    hienThongBao.timer =
        setTimeout(
            function(){

                box.style.display =
                    "none";

            },
            5000
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
){

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
   LOG
========================================================= */

console.log(
    "✅ quan-ly-ky-thi-admin.js đã được nạp."
);