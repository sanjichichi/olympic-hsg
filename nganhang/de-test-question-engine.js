/*
=========================================================
 OLYMPIC HSG ONLINE
 BỘ ĐỀ KIỂM THỬ QUESTION ENGINE v1
=========================================================

 Mục đích:
 - Kiểm tra các dạng câu hỏi mới
 - Không dùng cho đề thi chính thức
 - Dùng để kiểm tra thi.js / Question Engine

 Các dạng:
 1. MCQ
 2. MULTI
 3. TRUEFALSE
 4. FILL
 5. MATCH
 6. SORT
 7. SHORT
 8. IMAGE
 9. READING
10. AUDIO
11. ESSAY
12. CODE
=========================================================
*/


const cauHoi = [

    /* =================================================
       CÂU 1 - MCQ
    ================================================= */

    {
        loai: "MCQ",

        cauHoi:
            "Từ nào sau đây là từ láy?",

        A:
            "lung linh",

        B:
            "học sinh",

        C:
            "bàn ghế",

        D:
            "quê hương",

        dapAn:
            "A",

        diem:
            1
    },


    /* =================================================
       CÂU 2 - MULTI
    ================================================= */

    {
        loai: "MULTI",

        cauHoi:
            "Những từ nào dưới đây là từ chỉ hoạt động?",

        A:
            "chạy",

        B:
            "nhảy",

        C:
            "xanh",

        D:
            "đọc",

        dapAn:
            [
                "A",
                "B",
                "D"
            ],

        diem:
            1
    },


    /* =================================================
       CÂU 3 - TRUE / FALSE
    ================================================= */

    {
        loai:
            "TRUEFALSE",

        cauHoi:
            "Truyện ngắn là một thể loại văn xuôi tự sự có dung lượng tương đối nhỏ.",

        dapAn:
            "D",

        diem:
            1
    },


    /* =================================================
       CÂU 4 - FILL
    ================================================= */

    {
        loai:
            "FILL",

        cauHoi:
            "Điền từ thích hợp vào chỗ trống: Chủ tịch Hồ Chí Minh đọc bản Tuyên ngôn Độc lập tại quảng trường ______ vào ngày 2/9/1945.",

        dapAn:
            [
                "Ba Đình",
                "quảng trường Ba Đình"
            ],

        placeholder:
            "Nhập đáp án...",

        diem:
            1
    },


    /* =================================================
       CÂU 5 - MATCH
    ================================================= */

    {
        loai:
            "MATCH",

        cauHoi:
            "Ghép tác phẩm với tác giả tương ứng.",

        cotA: [

            {
                id: "A",

                text:
                    "Lão Hạc"
            },

            {
                id: "B",

                text:
                    "Tắt đèn"
            },

            {
                id: "C",

                text:
                    "Làng"
            }

        ],

        cotB: [

            {
                id: "1",

                text:
                    "Nam Cao"
            },

            {
                id: "2",

                text:
                    "Ngô Tất Tố"
            },

            {
                id: "3",

                text:
                    "Kim Lân"
            }

        ],

        dapAn: {

            A: "1",

            B: "2",

            C: "3"

        },

        diem:
            1
    },


    /* =================================================
       CÂU 6 - SORT
    ================================================= */

    {
        loai:
            "SORT",

        cauHoi:
            "Sắp xếp các bước dưới đây theo trình tự hợp lý khi viết một bài văn.",

        items: [

            {
                id: "1",

                text:
                    "Tìm hiểu đề"
            },

            {
                id: "2",

                text:
                    "Lập dàn ý"
            },

            {
                id: "3",

                text:
                    "Viết bài"
            },

            {
                id: "4",

                text:
                    "Đọc và chỉnh sửa"
            }

        ],

        dapAn: [

            "1",
            "2",
            "3",
            "4"

        ],

        diem:
            1
    },


    /* =================================================
       CÂU 7 - SHORT
    ================================================= */

    {
        loai:
            "SHORT",

        cauHoi:
            "Ai là tác giả của truyện ngắn Làng?",

        dapAn:
            [
                "Kim Lân",
                "kim lan"
            ],

        diem:
            1
    },


    /* =================================================
       CÂU 8 - IMAGE
    ================================================= */

    {
        loai:
            "IMAGE",

        cauHoi:
            "Quan sát hình ảnh và xác định đây là loại biểu đồ nào.",

        /*
          Có thể thay bằng ảnh thật của thầy.

          Ví dụ:
          ../anh/biendoth.png
        */

        hinhAnh:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Bar_chart.svg/640px-Bar_chart.svg.png",

        kieuTraLoi:
            "MCQ",

        A:
            "Biểu đồ cột",

        B:
            "Biểu đồ tròn",

        C:
            "Biểu đồ đường",

        D:
            "Bản đồ",

        dapAn:
            "A",

        diem:
            1
    },


    /* =================================================
       CÂU 9 - READING
    ================================================= */

    {
        loai:
            "READING",

        cauHoi:
            "Đọc đoạn văn sau và trả lời câu hỏi.",

        vanBan:

`Mỗi buổi sáng, con đường đến trường lại trở nên quen thuộc với tôi. Hai bên đường là những hàng cây xanh mát. Xa xa, tiếng chim hót vang lên giữa không gian yên tĩnh của làng quê. Những hình ảnh giản dị ấy đã trở thành một phần ký ức đẹp đẽ của tuổi học trò.`,

        kieuTraLoi:
            "MCQ",

        A:
            "Thiên nhiên làng quê",

        B:
            "Một chuyến du lịch",

        C:
            "Một cuộc thi",

        D:
            "Một trận đấu thể thao",

        dapAn:
            "A",

        diem:
            1
    },


    /* =================================================
       CÂU 10 - AUDIO
    ================================================= */

    {
        loai:
            "AUDIO",

        cauHoi:
            "Nghe đoạn âm thanh và chọn đáp án đúng.",

        /*
          Thầy thay đường dẫn bằng file MP3 thật.
        */

        audio:
            "media/lapdong.mp3",

        kieuTraLoi:
            "MCQ",

        A:
            "Thông tin thứ nhất",

        B:
            "Thông tin thứ hai",

        C:
            "Thông tin thứ ba",

        D:
            "Thông tin thứ tư",

        dapAn:
            "B",

        diem:
            1
    },


    /* =================================================
       CÂU 11 - ESSAY
    ================================================= */

    {
        loai:
            "ESSAY",

        cauHoi:
            "Hãy viết một đoạn văn khoảng 100 chữ trình bày suy nghĩ của em về ý nghĩa của việc đọc sách.",

        diem:
            2,

        gioiHanTu:
            150
    },


    /* =================================================
       CÂU 12 - CODE
    ================================================= */

    {
        loai:
            "CODE",

        cauHoi:
            "Viết chương trình Python tính tổng các số từ 1 đến 100.",

        diem:
            2
    }

];


/*
=========================================================
 THÔNG TIN ĐỀ
=========================================================
*/

const thongTinDe = {

    maKyThi:
        "TEST-QUESTION-ENGINE",

    tenKyThi:
        "Kiểm thử Question Engine v1",

    mon:
        "Tổng hợp",

    thoiGian:
        30,

    soCau:
        cauHoi.length,

    thiThu:
        1,

    trangThai:
        1,

    phienBan:
        "Question Engine v1"

};


console.log(
    "======================================"
);

console.log(
    "QUESTION ENGINE TEST"
);

console.log(
    "Số câu:",
    cauHoi.length
);

console.log(
    "Các dạng:",

    cauHoi.map(
        c => c.loai
    )
);

console.log(
    "======================================"
);