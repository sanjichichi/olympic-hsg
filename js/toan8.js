/*
========================================================
 NGÂN HÀNG CÂU HỎI TOÁN 8
 Olympic HSG Online
========================================================
*/

const nganHangDe = {

    thongTin: {
        mon: "Toán",
        khoi: "8",
        ten: "Ngân hàng câu hỏi Toán 8",
        phienBan: "1.0"
    },

    cauHoi: [

        {
            maCau: "TOAN8-0001",
            loai: "MCQ",

            cauHoi: "Giá trị của 2³ là:",

            A: "6",
            B: "8",
            C: "9",
            D: "12",

            dapAn: "B",

            diem: 1,

            chuDe: "Số học",
            doKho: "Nhận biết"
        },


        {
            maCau: "TOAN8-0002",
            loai: "MCQ",

            cauHoi: "Ước chung lớn nhất của 24 và 36 là:",

            A: "6",
            B: "8",
            C: "12",
            D: "18",

            dapAn: "C",

            diem: 1,

            chuDe: "Số học",
            doKho: "Nhận biết"
        }

        // Các câu còn lại của file hiện tại
        // sẽ được chuyển dần sang cấu trúc này.

    ]

};


/*
========================================================
 TƯƠNG THÍCH VỚI HỆ THỐNG CŨ
========================================================

 Nếu thi.js hiện tại đang đọc:

    cauHoi

 thì cung cấp lại biến cauHoi từ ngân hàng mới.
========================================================
*/

const cauHoi = nganHangDe.cauHoi;