/*=========================================================
        TRANG CÁ NHÂN - OLYMPIC HSG
=========================================================*/

const KETQUA_CSV_URL =
    localStorage.getItem("KETQUA_CSV_URL") ||
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRULO6RaaXqNERaYMuLx9cpHLp3hxqL3i2PHuccrdbSvFaQgpsrPvRk-fhgzlOxamLUYCe1sLQMQvPL/pub?output=csv";
//=======================
// LOCAL STORAGE
//=======================

const maHS =
localStorage.getItem("maThiSinh") || "";

const hoTen =
localStorage.getItem("hoTen") ||
localStorage.getItem("tenThiSinh") || "";

const lop =
localStorage.getItem("lopThiSinh") || "";

const ngaySinh =
localStorage.getItem("ngaySinh") || "";

const truong =
localStorage.getItem("truong") || "";

//=========================================================
// API TÀI KHOẢN HỌC SINH
//=========================================================

const API_TAI_KHOAN_HS =
    "https://script.google.com/macros/s/AKfycbzXRtrvbS2YpKDAZLwoV0cR1mFWHxlXljvNJzryHhFmnfOXZ3LzR0ai1cyltOF7l62hVQ/exec";


//=========================================================
// GỌI API
//=========================================================

async function goiAPITaiKhoan(action, data = {}) {

    try {

        console.log(
            "📡 Gọi API:",
            action,
            data
        );


        const response =
            await fetch(
                API_TAI_KHOAN_HS,
                {
                    method: "POST",

                    /*
                       Rất quan trọng với
                       Google Apps Script Web App
                    */
                    redirect: "follow",

                    /*
                       text/plain để tránh
                       preflight OPTIONS
                    */
                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify({

                            action:
                                action,

                            data:
                                data

                        })
                }
            );


        console.log(
            "🌐 HTTP status:",
            response.status
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
            "📥 API trả về:",
            text
        );


        let result;


        try {

            result =
                JSON.parse(text);

        }
        catch (e) {

            console.error(
                "❌ API không trả JSON:",
                text
            );

            throw new Error(
                "API trả về dữ liệu không hợp lệ."
            );

        }


        return result;

    }

    catch (error) {

        console.error(
            "❌ Lỗi API tài khoản:",
            error
        );


        return {

            success: false,

            message:
                "Không thể kết nối máy chủ."

        };

    }

}

//=======================
// KIỂM TRA ĐĂNG NHẬP
//=======================

if(maHS===""){

    alert("Bạn chưa đăng nhập!");

    window.location="login.html";

}


//=======================
// HIỂN THỊ THÔNG TIN
//=======================

document.getElementById("hoTen").innerText=hoTen;

document.getElementById("maHS").innerText=maHS;

document.getElementById("lop").innerText=lop;

document.getElementById("ngaySinh").innerText=ngaySinh;

document.getElementById("gioiTinh").innerText =
    localStorage.getItem("gioiTinh") || "";

document.getElementById("theHoTen").innerText=hoTen;

document.getElementById("theMaHS").innerText=maHS;

document.getElementById("theLop").innerText=lop;


//=======================
// TRƯỜNG
//=======================

const truongElement =
document.querySelector(".profile-item p");

if(truongElement){

    truongElement.innerText=truong;

}


//=======================
// DỮ LIỆU
//=======================

let tatCaKetQua=[];


//=======================
// CSV PARSER
// GIỮ NGUYÊN Ô TRỐNG
//=======================

function csvToArray(csv) {

    const result = [];

    // Chuẩn hóa xuống dòng
    csv = csv.replace(/\r\n/g, "\n");
    csv = csv.replace(/\r/g, "\n");

    const rows = [];
    let row = [];
    let value = "";
    let inQuotes = false;

    // Đọc CSV từng ký tự
    for (let i = 0; i < csv.length; i++) {

        const char = csv[i];
        const next = csv[i + 1];

        // Dấu "
        if (char === '"') {

            // Hai dấu "" bên trong chuỗi
            if (inQuotes && next === '"') {

                value += '"';
                i++;

            } else {

                inQuotes = !inQuotes;

            }

            continue;
        }

        // Dấu phẩy
        if (char === "," && !inQuotes) {

            row.push(value);
            value = "";

            continue;
        }

        // Xuống dòng
        if (char === "\n" && !inQuotes) {

            row.push(value);

            rows.push(row);

            row = [];
            value = "";

            continue;
        }

        value += char;
    }

    // Dòng cuối
    if (value !== "" || row.length > 0) {

        row.push(value);
        rows.push(row);

    }

    if (rows.length === 0) {
        return [];
    }

    // Hàng tiêu đề
    const header = rows[0].map(function (x) {

        return String(x)
            .replace(/^\uFEFF/, "")
            .trim();

    });

    // Dữ liệu
    for (let i = 1; i < rows.length; i++) {

        const values = rows[i];

        // Bỏ dòng hoàn toàn trống
        if (
            values.length === 1 &&
            String(values[0]).trim() === ""
        ) {
            continue;
        }

        const obj = {};

        header.forEach(function (h, index) {

            let val =
                values[index] !== undefined
                    ? values[index]
                    : "";

            val = String(val)
                .trim();

            obj[h] = val;

        });

        result.push(obj);
    }

    return result;
}



async function loadKETQUA(){

    try{

        const response =
            await fetch(
                KETQUA_CSV_URL +
                "&t=" + Date.now()
            );

        if(!response.ok){

            throw new Error(
                "Không tải được KETQUA: " +
                response.status
            );

        }

        const text =
            await response.text();

        tatCaKetQua =
            csvToArray(text);

        console.log(
            "✅ KETQUA chung:",
            tatCaKetQua.length,
            "kết quả"
        );

    }
    catch(error){

        console.error(
            "❌ Lỗi tải KETQUA:",
            error
        );

        tatCaKetQua = [];

    }

}



//=======================
// LỌC KẾT QUẢ THEO MÃ HỌC SINH
//=======================
function layKetQuaHocSinh(){

    const maDangNhap = String(maHS || "").trim();

    return tatCaKetQua.filter(item => {

        const ma =
            item["Mã học sinh"] ??
            item["maHS"] ??
            item["MaHS"] ??
            item["Mã HS"] ??
            "";

        return String(ma).trim() === maDangNhap;

    });

}
//=======================
// THỐNG KÊ LUYỆN TẬP
//=======================

function thongKeLuyenTap(){

    const ds = tatCaKetQua.filter(item => {

    return item["Mã học sinh"] === maHS;

});

    const ltToan = ds.filter(item =>
    item.sheet === "Olympic Toán 2026" &&
    item["Lượt luyện tập"] === "1"
).length;

    const ltVan = ds.filter(item =>
    item.sheet === "Olympic Ngữ văn 2026" &&
    item["Lượt luyện tập"] === "1"
).length;

const ltAnh = ds.filter(item =>
    item.sheet === "Olympic Tiếng Anh 2026" &&
    item["Lượt luyện tập"] === "1"
).length;

const ltTongHop = ds.filter(item =>
    item.sheet === "Olympic 2026" &&
    item["Lượt luyện tập"] === "1"
).length;

    document.getElementById("ltToan").innerText =
        ltToan + " lượt";

    document.getElementById("ltVan").innerText =
        ltVan + " lượt";

    document.getElementById("ltAnh").innerText =
        ltAnh + " lượt";

    document.getElementById("ltTongHop").innerText =
        ltTongHop + " lượt";

    document.getElementById("tongLuot").innerText =
        (ltToan+ltVan+ltAnh+ltTongHop)+" lượt";

}

//=======================
// ĐỊNH DẠNG ĐIỂM
//=======================

function lamTron(d){

    return Number(d||0).toFixed(2);

}



//=======================
// ĐỊNH DẠNG THỜI GIAN
//=======================

function doiTG(text){

    if(!text) return "";

    return text;

}



//=======================
// ĐỊNH DẠNG NGÀY
//=======================

function dinhDangNgay(str){

    if(!str) return "";

    return str;

}
/*=========================================================
        THỐNG KÊ - LỊCH SỬ - BIỂU ĐỒ
=========================================================*/

//======================
// BIẾN THỐNG KÊ
//======================

let diemCaoNhat = 0;
let soLuotThi = 0;
let soKyThi = 0;
let thuHang = "--";

let dsHocSinh = [];
let ketQuaHS = [];


//======================
// XẾP LOẠI 
//======================

function xepLoai(diem, tong){

    diem = Number(diem);
    tong = Number(tong);

    let tyLe = diem / tong * 100;

    if(tyLe >= 90) return "🏆 Xuất sắc";

    if(tyLe >= 80) return "🥇 Tốt";

    if(tyLe >= 70) return "🥈 Khá";

    return "🥉 Đạt";

}

//======================
// XẾP LOẠI
//======================
function classDiem(diem, tong){

    diem = Number(diem);
    tong = Number(tong);

    const tyLe = diem / tong * 100;

    if(tyLe >= 90) return "excellent";

    if(tyLe >= 80) return "good";

    if(tyLe >= 70) return "average";

    return "poor";

}

//======================
// TÍNH THỐNG KÊ
//======================

function thongKe(){

    ketQuaHS = layKetQuaHocSinh();

    soLuotThi = ketQuaHS.length;

    let kyThi = new Set();

    diemCaoNhat = 0;

    ketQuaHS.forEach(item=>{

        const diem = Number(item["Điểm"]) || 0;

        if(diem > diemCaoNhat){

            diemCaoNhat = diem;

        }

        kyThi.add(item["Kì thi"]);

    });

    soKyThi = kyThi.size;

    document.getElementById("diemCaoNhat").innerText =
        diemCaoNhat.toFixed(2);

    document.getElementById("soLuotThi").innerText =
        soLuotThi;

    document.getElementById("soKyThi").innerText =
        soKyThi;

}


//======================
// HIỂN THỊ LỊCH SỬ THI
//======================
function hienThiLichSu(){

    const tbody =
        document.getElementById("historyBody");

    if(!tbody){
        console.error("❌ Không tìm thấy historyBody");
        return;
    }

    tbody.innerHTML = "";

    console.log("📚 Lịch sử của học sinh:", ketQuaHS);

    // Không có kết quả
    if(!ketQuaHS || ketQuaHS.length === 0){

        tbody.innerHTML = `
            <tr>
                <td colspan="7"
                    style="
                        text-align:center;
                        padding:25px;
                        color:#64748b;
                    ">
                    📭 Chưa có lịch sử thi
                </td>
            </tr>
        `;

        return;
    }


    ketQuaHS.forEach(function(item,index){

        //========================
        // TÊN KỲ THI
        //========================
        const tenKyThi =
            item["Kì thi"] ??
            item["Kỳ thi"] ??
            item["tenKyThi"] ??
            item["Tên kỳ thi"] ??
            "";


        //========================
        // THỜI GIAN
        //========================
        const thoiGian =
            item["Thời gian"] ??
            item["thoiGian"] ??
            "";


        //========================
        // SỐ LẦN RỜI TAB
        //========================
        const roiTab =
            item["Số lần rời tab"] ??
            item["Rời tab"] ??
            item["roiTab"] ??
            0;


        //========================
        // NGÀY THI
        //========================
        const ngayThi =
            item["Ngày thi"] ??
            item["ngayThi"] ??
            item["Thời gian nộp"] ??
            item["Timestamp"] ??
            "";


        //========================
        // SỐ CÂU ĐÚNG
        //========================
        const soDung =
            item["Số câu đúng"] ??
            item["Số đúng"] ??
            item["soDung"] ??
            "";


        //========================
        // TỔNG SỐ CÂU
        //========================
        const tongSoCau =
            item["Số câu"] ??
            item["Tổng số câu"] ??
            item["tongSoCau"] ??
            "";


        //========================
        // ĐIỂM
        //========================
        const diem =
            item["Điểm"] ??
            item["Diem"] ??
            "";


        //========================
        // XẾP LOẠI
        //========================
        let xepLoai =
            item["Xếp loại"] ??
            item["xepLoai"] ??
            "";


        // Nếu Sheet chưa có cột Xếp loại
        // thì tự động tính
        if(
            !xepLoai &&
            soDung !== "" &&
            tongSoCau !== ""
        ){

            const d = Number(soDung);
            const t = Number(tongSoCau);

            if(
                Number.isFinite(d) &&
                Number.isFinite(t) &&
                t > 0
            ){

                const tyLe =
                    d / t * 100;


                if(tyLe >= 90){

                    xepLoai = "🏆 Xuất sắc";

                }
                else if(tyLe >= 80){

                    xepLoai = "🥇 Tốt";

                }
                else if(tyLe >= 70){

                    xepLoai = "🥈 Khá";

                }
                else{

                    xepLoai = "🥉 Đạt";

                }

            }

        }


        //========================
        // TẠO DÒNG
        //========================
        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${index + 1}
            </td>

            <td>
                ${tenKyThi}
            </td>

            <td>
                ${thoiGian}
            </td>

            <td>
                ${roiTab}
            </td>

            <td>
                ${ngayThi}
            </td>

            <td>
                ${
                    diem !== ""
                    ? diem
                    : (soDung + "/" + tongSoCau)
                }
            </td>

            <td>
                ${xepLoai}
            </td>

        `;


        tbody.appendChild(tr);

    });

}
//======================
// THỐNG KÊ TOÀN BỘ
//======================

function tinhThuHang(){

    dsHocSinh = [];

    tatCaKetQua.forEach(item=>{

        const ma = item["Mã học sinh"];

        const diem = Number(item["Điểm"]) || 0;

        if(!dsHocSinh[ma]){

            dsHocSinh[ma] = diem;

        }else{

            if(diem > dsHocSinh[ma]){

                dsHocSinh[ma] = diem;

            }

        }

    });

    let arr = [];

    for(let ma in dsHocSinh){

        arr.push({

            ma,

            diem:dsHocSinh[ma]

        });

    }

    arr.sort((a,b)=>b.diem-a.diem);

    const vt =
    arr.findIndex(x=>x.ma==maHS);

    if(vt!=-1){

        thuHang = vt+1;

    }

    document.getElementById("thuHang").innerText=
    thuHang;

}



//======================
// KHỞI ĐỘNG TRANG CÁ NHÂN
//======================
async function khoiDong(){

    console.log("🚀 Bắt đầu khởi động trang cá nhân");

    // Tải dữ liệu KETQUA
    await loadKETQUA();

    console.log(
        "📊 Tổng số kết quả:",
        tatCaKetQua.length
    );

    console.log(
        "👤 Mã học sinh đăng nhập:",
        maHS
    );


    // Lọc kết quả của học sinh
    ketQuaHS =
        layKetQuaHocSinh();


    console.log(
        "📚 Kết quả của học sinh:",
        ketQuaHS
    );


    // Thống kê
    thongKe();


    // Xếp hạng
    tinhThuHang();


    // Hiển thị lịch sử
    hienThiLichSu();


    // Thống kê luyện tập
    if(
        typeof thongKeLuyenTap === "function"
    ){

        thongKeLuyenTap();

    }


    // Thành tích
    if(
        typeof hienThiThanhTich === "function"
    ){

        hienThiThanhTich();

    }


    // Huy hiệu
    if(
        typeof capNhatHuyHieu === "function"
    ){

        capNhatHuyHieu();

    }

}
/*=========================================================
        THÀNH TÍCH - HUY HIỆU - CHỨC NĂNG
=========================================================*/

//======================
// THÀNH TÍCH
//======================

function hienThiThanhTich(){

    let giaiNhat = 0;
    let giaiNhi = 0;
    let giaiBa = 0;
    let chungNhan = 0;

    ketQuaHS.forEach(item=>{

        const diem = Number(item["Điểm"]) || 0;
        const tong = Number(item["Số câu"]) || 0;

        if(tong === 0) return;

        const tyLe = diem / tong * 100;

        if(tyLe >= 90){

            giaiNhat++;

        }
        else if(tyLe >= 80){

            giaiNhi++;

        }
        else if(tyLe >= 70){

            giaiBa++;

        }

        if(tyLe >= 70){

            chungNhan++;

        }

    });

    document.getElementById("tongGiaiNhat").innerText = giaiNhat;
    document.getElementById("tongGiaiNhi").innerText = giaiNhi;
    document.getElementById("tongGiaiBa").innerText = giaiBa;
    document.getElementById("tongBangKhen").innerText = chungNhan;

}


//======================
// HUY HIỆU
//======================

function capNhatHuyHieu(){

    const badges =
    document.querySelectorAll(".badge-card");

    badges.forEach(x=>{

        x.style.opacity=".35";

    });

    // 10 điểm

    if(diemCaoNhat==10){

        badges[0].style.opacity="1";

    }

    // Top 10

    if(thuHang<=10){

        badges[1].style.opacity="1";

    }

    // Không rời tab

    let ok = ketQuaHS.some(item=>{

        return Number(item["Số lần rời tab"])===0;

    });

    if(ok){

        badges[2].style.opacity="1";

    }

    // Tham gia nhiều kỳ

    if(soKyThi>=3){

        badges[3].style.opacity="1";

    }

}

//=========================================================
// AVATAR HỌC SINH
// LƯU LOCAL + GOOGLE SHEET CỘT J
//=========================================================

function taiAvatar() {

    const key =
        "avatar_" + String(maHS).trim();

    const avatar =
        localStorage.getItem(key);

    const img =
        document.getElementById(
            "avatarHocSinh"
        );

    if (
        img &&
        avatar
    ) {
        img.src = avatar;
    }
}


//=========================================================
// NÉN ẢNH AVATAR
//=========================================================

function nenAnhAvatar(file) {

    return new Promise(function(resolve, reject) {

        const reader =
            new FileReader();

        reader.onload =
            function(e) {

                const img =
                    new Image();

                img.onload =
                    function() {

                        const canvas =
                            document.createElement(
                                "canvas"
                            );

                        const maxSize = 320;

                        let width =
                            img.width;

                        let height =
                            img.height;


                        if (
                            width >
                            height
                        ) {

                            if (
                                width >
                                maxSize
                            ) {

                                height =
                                    height *
                                    maxSize /
                                    width;

                                width =
                                    maxSize;

                            }

                        }
                        else {

                            if (
                                height >
                                maxSize
                            ) {

                                width =
                                    width *
                                    maxSize /
                                    height;

                                height =
                                    maxSize;

                            }

                        }


                        canvas.width =
                            Math.round(width);

                        canvas.height =
                            Math.round(height);


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );

                        ctx.drawImage(
                            img,
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );


                        /*
                           JPEG 75%
                           giúp giảm kích thước
                           trước khi gửi API
                        */

                        const dataURL =
                            canvas.toDataURL(
                                "image/jpeg",
                                0.75
                            );


                        resolve(
                            dataURL
                        );

                    };


                img.onerror =
                    function() {

                        reject(
                            new Error(
                                "Không đọc được ảnh."
                            )
                        );

                    };


                img.src =
                    e.target.result;

            };


        reader.onerror =
            function() {

                reject(
                    new Error(
                        "Không thể đọc file ảnh."
                    )
                );

            };


        reader.readAsDataURL(file);

    });

}


//=========================================================
// CẬP NHẬT AVATAR LÊN SERVER
//=========================================================

async function capNhatAvatarServer(
    avatarData
) {

    const result =
        await goiAPITaiKhoan(
            "doiAvatarHS",
            {
                MaHS: maHS,
                Avatar: avatarData
            }
        );


    if (!result.success) {

        throw new Error(
            result.message ||
            "Không thể cập nhật avatar."
        );

    }


    return result;

}


//=========================================================
// GẮN CHỨC NĂNG ĐỔI AVATAR
//=========================================================

function khoiTaoAvatar() {

    const avatar =
        document.getElementById(
            "avatarHocSinh"
        );

    const input =
        document.getElementById(
            "chonAvatar"
        );

    const btn =
        document.getElementById(
            "doiAvatar"
        );


    if (
        !avatar ||
        !input ||
        !btn
    ) {

        console.warn(
            "Không tìm thấy thành phần avatar."
        );

        return;

    }


    /*
       Hiển thị avatar đã lưu
    */

    taiAvatar();


    /*
       Nút đổi avatar
    */

    btn.onclick =
        function() {

            input.click();

        };


    /*
       Chọn ảnh
    */

    input.onchange =
        async function() {

            const file =
                this.files[0];


            if (!file) {

                return;

            }


            /*
               Chỉ nhận ảnh
            */

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Vui lòng chọn file ảnh."
                );

                return;

            }


            try {

                btn.disabled = true;

                btn.textContent =
                    "Đang lưu...";


                const avatarData =
                    await nenAnhAvatar(
                        file
                    );


                /*
                   Hiển thị ngay
                */

                avatar.src =
                    avatarData;


                /*
                   Lưu local
                */

                localStorage.setItem(
    "avatar_" + String(maHS).trim(),
    avatarData
);


                /*
                   Lưu Google Sheet
                */

                await capNhatAvatarServer(
                    avatarData
                );


                alert(
                    "✅ Đã cập nhật ảnh đại diện."
                );

            }
            catch(error) {

                console.error(
                    error
                );

                alert(
                    "❌ " +
                    (
                        error.message ||
                        "Không thể cập nhật avatar."
                    )
                );

            }
            finally {

                btn.disabled = false;

                btn.textContent =
                    "Đổi avatar";

                input.value = "";

            }

        };

}

//=========================================================
// ĐỔI MẬT KHẨU
//=========================================================

function taoGiaoDienDoiMatKhau() {

    if (
        document.getElementById(
            "modalDoiMatKhau"
        )
    ) {

        return;

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "modalDoiMatKhau";


    modal.innerHTML = `

        <div class="modal-overlay">

            <div class="modal-box">

                <button
                    type="button"
                    class="modal-close"
                    id="dongModalMatKhau">
                    ×
                </button>

                <h2>
                    🔑 Đổi mật khẩu
                </h2>

                <div class="modal-form">

                    <label>
                        Mật khẩu hiện tại
                    </label>

                    <input
                        type="password"
                        id="matKhauCu"
                        autocomplete="current-password"
                        placeholder="Nhập mật khẩu hiện tại"
                    >


                    <label>
                        Mật khẩu mới
                    </label>

                    <input
                        type="password"
                        id="matKhauMoi"
                        autocomplete="new-password"
                        placeholder="Ít nhất 6 ký tự"
                    >


                    <label>
                        Xác nhận mật khẩu mới
                    </label>

                    <input
                        type="password"
                        id="xacNhanMatKhau"
                        autocomplete="new-password"
                        placeholder="Nhập lại mật khẩu mới"
                    >


                    <button
                        type="button"
                        id="btnLuuMatKhau"
                        class="btn-save-password">

                        🔐 Lưu mật khẩu

                    </button>

                    <div
                        id="thongBaoMatKhau"
                        class="password-message">
                    </div>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /*
       CSS
    */

    const style =
        document.createElement(
            "style"
        );


    style.id =
        "styleDoiMatKhau";


    style.textContent = `

        #modalDoiMatKhau
        .modal-overlay {

            position: fixed;

            inset: 0;

            background:
                rgba(0,0,0,.55);

            display: flex;

            align-items: center;

            justify-content: center;

            z-index: 99999;

            padding: 20px;

        }


        #modalDoiMatKhau
        .modal-box {

            width: 100%;

            max-width: 420px;

            background: white;

            border-radius: 18px;

            padding: 28px;

            position: relative;

            box-shadow:
                0 20px 60px
                rgba(0,0,0,.25);

        }


        #modalDoiMatKhau h2 {

            margin:
                0 0 22px;

            text-align: center;

        }


        #modalDoiMatKhau
        .modal-close {

            position: absolute;

            right: 14px;

            top: 10px;

            border: none;

            background: none;

            font-size: 30px;

            cursor: pointer;

        }


        #modalDoiMatKhau
        label {

            display: block;

            margin:
                12px 0 6px;

            font-weight: 600;

        }


        #modalDoiMatKhau
        input {

            width: 100%;

            box-sizing: border-box;

            padding: 12px;

            border:
                1px solid #ddd;

            border-radius: 10px;

            font-size: 15px;

        }


        #btnLuuMatKhau {

            width: 100%;

            margin-top: 20px;

            padding: 13px;

            border: none;

            border-radius: 10px;

            cursor: pointer;

            font-weight: 700;

        }


        .password-message {

            margin-top: 12px;

            text-align: center;

            min-height: 20px;

        }

    `;


    document.head.appendChild(
        style
    );


    /*
       Đóng
    */

    document
        .getElementById(
            "dongModalMatKhau"
        )
        .onclick =
        dongModalDoiMatKhau;


    /*
       Lưu
    */

    document
        .getElementById(
            "btnLuuMatKhau"
        )
        .onclick =
        doiMatKhau;


    /*
       Click nền để đóng
    */

    modal
        .querySelector(
            ".modal-overlay"
        )
        .addEventListener(
            "click",
            function(e) {

                if (
                    e.target ===
                    this
                ) {

                    dongModalDoiMatKhau();

                }

            }
        );

}


//=========================================================
// MỞ MODAL ĐỔI MẬT KHẨU
//=========================================================

function moModalDoiMatKhau() {

    taoGiaoDienDoiMatKhau();


    const modal =
        document.getElementById(
            "modalDoiMatKhau"
        );


    modal.style.display =
        "block";


    document
        .getElementById(
            "matKhauCu"
        )
        .focus();

}


//=========================================================
// ĐÓNG MODAL
//=========================================================

function dongModalDoiMatKhau() {

    const modal =
        document.getElementById(
            "modalDoiMatKhau"
        );


    if (modal) {

        modal.remove();

    }


    const style =
        document.getElementById(
            "styleDoiMatKhau"
        );


    if (style) {

        style.remove();

    }

}


//=========================================================
// THỰC HIỆN ĐỔI MẬT KHẨU
//=========================================================

async function doiMatKhau() {

    const matKhauCu =
        document
            .getElementById(
                "matKhauCu"
            )
            .value;


    const matKhauMoi =
        document
            .getElementById(
                "matKhauMoi"
            )
            .value;


    const xacNhan =
        document
            .getElementById(
                "xacNhanMatKhau"
            )
            .value;


    const thongBao =
        document
            .getElementById(
                "thongBaoMatKhau"
            );


    const btn =
        document
            .getElementById(
                "btnLuuMatKhau"
            );


    if (!matKhauCu) {

        thongBao.innerText =
            "⚠️ Vui lòng nhập mật khẩu hiện tại.";

        return;

    }


    if (!matKhauMoi) {

        thongBao.innerText =
            "⚠️ Vui lòng nhập mật khẩu mới.";

        return;

    }


    if (
        matKhauMoi.length < 6
    ) {

        thongBao.innerText =
            "⚠️ Mật khẩu mới phải có ít nhất 6 ký tự.";

        return;

    }


    if (
        matKhauMoi !==
        xacNhan
    ) {

        thongBao.innerText =
            "⚠️ Mật khẩu xác nhận không khớp.";

        return;

    }


    try {

        btn.disabled = true;

        btn.innerText =
            "Đang cập nhật...";


        const result =
            await goiAPITaiKhoan(
                "doiMatKhauHS",
                {
                    MaHS: maHS,

                    matKhauCu:
                        matKhauCu,

                    matKhauMoi:
                        matKhauMoi,

                    xacNhanMatKhau:
                        xacNhan
                }
            );


        if (
            !result.success
        ) {

            thongBao.innerText =
                "❌ " +
                (
                    result.message ||
                    "Không thể đổi mật khẩu."
                );

            return;

        }


        thongBao.innerText =
            "✅ Đổi mật khẩu thành công.";


        /*
           Xóa ô nhập
        */

        document
            .getElementById(
                "matKhauCu"
            )
            .value = "";


        document
            .getElementById(
                "matKhauMoi"
            )
            .value = "";


        document
            .getElementById(
                "xacNhanMatKhau"
            )
            .value = "";


        setTimeout(
            function() {

                dongModalDoiMatKhau();

                alert(
                    "✅ Mật khẩu đã được thay đổi."
                );

            },
            800
        );

    }
    catch(error) {

        console.error(
            error
        );

        thongBao.innerText =
            "❌ Không thể kết nối máy chủ.";

    }
    finally {

        btn.disabled = false;

        btn.innerText =
            "🔐 Lưu mật khẩu";

    }

}
//======================
// QR
//======================

function taoQR(){

    const qr =
    document.querySelector(".qr-code");

    qr.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data="+
    encodeURIComponent(maHS);

}



//======================
// ĐĂNG XUẤT
//======================

function dangXuat(){

    if(!confirm("Bạn có chắc muốn đăng xuất?")){

        return;

    }

    localStorage.removeItem("maThiSinh");

    localStorage.removeItem("tenThiSinh");

    localStorage.removeItem("hoTen");

    localStorage.removeItem("ngaySinh");

    localStorage.removeItem("lopThiSinh");

    localStorage.removeItem("truong");

    localStorage.removeItem("dangNhap");

    localStorage.removeItem("loaiTaiKhoan");

    window.location.replace("index.html");

}



//======================
// GẮN NÚT
//======================

document.querySelector(".member-btn")
.addEventListener("click",function(){

    alert("Xin chào " + hoTen);

});



//======================
// F5
//======================

window.addEventListener("focus",()=>{

    // Có thể cập nhật lại dữ liệu khi quay lại tab

});



//======================
// THÊM VÀO KHOI DONG
//======================

const khoiDongCu = khoiDong;

khoiDong = async function(){

    await khoiDongCu();

    hienThiThanhTich();

    capNhatHuyHieu();

    taiAvatar();

    taoQR();

}

const taiKhoanBtn = document.getElementById("taiKhoanBtn");

if (taiKhoanBtn) {

    taiKhoanBtn.innerHTML =
        localStorage.getItem("hoTen") + " ▼";

    taiKhoanBtn.addEventListener("click", function (e) {

        e.preventDefault();

        const menu = document.getElementById("userDropdown");

        menu.style.display =
            menu.style.display === "block"
                ? "none"
                : "block";

    });

}
//=========================================================
// NÚT ĐỔI MẬT KHẨU
//=========================================================

function taoNutDoiMatKhau() {

    const menu =
        document.getElementById(
            "userDropdown"
        );


    if (!menu) {

        return;

    }


    if (
        document.getElementById(
            "btnDoiMatKhauHS"
        )
    ) {

        return;

    }


    const btn =
        document.createElement(
            "button"
        );


    btn.id =
        "btnDoiMatKhauHS";


    btn.type =
        "button";


    btn.innerHTML =
        "🔑 Đổi mật khẩu";


    btn.style.cssText = `
        display:block;
        width:100%;
        padding:10px 14px;
        border:none;
        background:transparent;
        text-align:left;
        cursor:pointer;
        font-size:14px;
    `;


    btn.onclick =
        function(e) {

            e.preventDefault();

            moModalDoiMatKhau();

            menu.style.display =
                "none";

        };


    menu.appendChild(
        btn
    );

}


//=========================================================
// KHỞI TẠO TÀI KHOẢN
//=========================================================

taoNutDoiMatKhau();


//=========================================================
// KHỞI TẠO AVATAR
//=========================================================

khoiTaoAvatar();
// =======================
// THỐNG KÊ LUYỆN TẬP
// =======================

const ltToan = Number(localStorage.getItem("lt_toan")) || 0;

const ltVan = Number(localStorage.getItem("lt_van")) || 0;

const ltAnh = Number(localStorage.getItem("lt_anh")) || 0;

const ltTongHop = Number(localStorage.getItem("lt_tonghop")) || 0;

document.getElementById("ltToan").textContent =
    ltToan + " lượt";

document.getElementById("ltVan").textContent =
    ltVan + " lượt";

document.getElementById("ltAnh").textContent =
    ltAnh + " lượt";

document.getElementById("ltTongHop").textContent =
    ltTongHop + " lượt";

document.getElementById("tongLuot").textContent =
    (ltToan + ltVan + ltAnh + ltTongHop) + " lượt";

    document.addEventListener(
    "DOMContentLoaded",
    khoiDong
);