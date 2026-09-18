/*=====================================================
 CẤU HÌNH GOOGLE FORM
=====================================================*/

const FORM_CONFIG = {

    toan:{

        url:"https://docs.google.com/forms/d/e/1FAIpQLSeLmo1qqAHM8awDUh_9qWJ720NZNeYvTGAzemECLWkqRyneEg/formResponse",

        csv:"https://docs.google.com/spreadsheets/d/e/2PACX-1vTpyBmphKKF3lC2YXtIAU7GZO0R7te1Orvoi8KqmHx-PbMKfl2r8iNwz5Z5PA2iUr5ol9A1-AraIMvi/pub?output=csv",
        entry:{

            maHS:"131085548",

            hoTen:"766043376",

            gioiTinh:"116346032",

            lop:"1278051019",

            matKhau:"465767204",

            soDung:"2000020160",

            soSai:"15166885",

            diem:"1463297757",

            thoiGian:"972839558",

            roiTab:"1670856791",

            ngayThi:"1112656001",

            soCau:"1092028741",

            thoiGianQD:"1867987364",

            xepLoai:"942095664",

            dotThi:"596713283"

        }

    },

    van:{

        url:"https://docs.google.com/forms/d/e/1FAIpQLSc9mxkAzPAVcTa5dXUsqBNXOk_R5pcB873ek2g7hM54CPlF7g/formResponse",

        csv:"https://docs.google.com/spreadsheets/d/e/2PACX-1vTQi1mhGw-K9xsKeYgqpe-n3XvALt-PcPb-oOkVxHJ2CLhyfy9QlzkgWnNK24zjQCWmO5q_YuMy5Sga/pub?output=csv",
        
        entry:{

            maHS:"131085548",

            hoTen:"766043376",

            gioiTinh:"2537042",

            lop:"1278051019",

            matKhau:"465767204",

            soDung:"2000020160",

            soSai:"15166885",

            diem:"1463297757",

            thoiGian:"972839558",

            roiTab:"1670856791",

            ngayThi:"1112656001",

            soCau:"1353577836",

            thoiGianQD:"37762422",

            xepLoai:"564918209",

            dotThi:"339961925"

        }

    },

    anh:{

        url:"https://docs.google.com/forms/d/e/1FAIpQLSfVEe-5XESX7UqXhjkUcnvQBM4dN3LbmZ8xzrpw6Dz1WkqLPA/formResponse",

        csv:"https://docs.google.com/spreadsheets/d/e/2PACX-1vQtvs9nZ-1ab-DR-rekNM37FXv65Xz8va5RX-98kdy6kbCRrIZIaeO5GgPDZDZdklho2Wk2OuJx-yzZ/pub?output=csv",

        entry:{

            maHS:"131085548",

            hoTen:"766043376",

            gioiTinh:"1318910267",

            lop:"1278051019",

            matKhau:"465767204",

            soDung:"2000020160",

            soSai:"15166885",

            diem:"1463297757",

            thoiGian:"972839558",

            roiTab:"1670856791",

            ngayThi:"1112656001",

            soCau:"1353674546",

            thoiGianQD:"368651273",

            xepLoai:"1716977106",

            dotThi:"1419694910"

        }

    },

    tonghop:{

        url:"https://docs.google.com/forms/d/e/1FAIpQLSeUx_Q0bJ1OKkrSbgKZYLVKKIAykiq1mgAigo1w6aobr0PX4Q/formResponse",

        csv:"https://docs.google.com/spreadsheets/d/e/2PACX-1vT1XU2cW4LBuNHihn58r7svCjjtN06q_1e6BndfbPH6yja2nHhadihWkZIBzr7CSnWO5YLeGxMneJJK/pub?output=csv",

        entry:{

            maHS:"131085548",

            hoTen:"766043376",

            gioiTinh:"2058575049",

            lop:"1278051019",

            matKhau:"465767204",

            soDung:"2000020160",

            soSai:"15166885",

            diem:"1463297757",

            thoiGian:"972839558",

            roiTab:"1670856791",

            ngayThi:"1112656001",

            soCau:"1853871376",

            thoiGianQD:"1742476776",

            xepLoai:"915290919",

            dotThi:"1170005628"

        }

    }

};
/* =====================================================
   OLYMPIC HSG ONLINE
   CẤU HÌNH KẾT QUẢ THEO MÃ KỲ THI
===================================================== */

const FORM_CONFIG_BY_EXAM = {};


/*
 * Hàm đăng ký nguồn kết quả cho một kỳ thi.
 *
 * Sau này khi giáo viên tạo kỳ thi:
 *
 * maKyThi → CSV kết quả
 *
 * sẽ được lưu vào đây.
 */

function dangKyNguonKetQua(
    maKyThi,
    csvUrl
) {

    if (!maKyThi) {

        console.warn(
            "⚠️ Chưa có maKyThi"
        );

        return;

    }


    if (!csvUrl) {

        console.warn(
            "⚠️ Chưa có CSV cho:",
            maKyThi
        );

        return;

    }


    FORM_CONFIG_BY_EXAM[maKyThi] = {

        csv: csvUrl

    };


    console.log(
        "✅ Đã đăng ký nguồn kết quả:",
        maKyThi
    );

}