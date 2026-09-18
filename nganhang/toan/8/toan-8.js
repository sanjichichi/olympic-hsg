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
        },

        {
            maCau: "TOAN8-0003",
            loai: "TRUEFALSE",

            cauHoi: "Số 0 là số nguyên dương.",

            dapAn: "B",

            diem: 1,

            chuDe: "Số nguyên",

            doKho: "Nhận biết"
        },

        {
            maCau: "TOAN8-0004",
            loai: "FILL",

            cauHoi: "Kết quả của 5 × 6 là ____.",

            dapAn: [
                "30"
            ],

            diem: 1,

            chuDe: "Số học",

            doKho: "Nhận biết"
        },

        {
            maCau: "TOAN8-0005",
            loai: "MULTI",

            cauHoi: "Những số nào sau đây là số nguyên tố?",

            A: "2",
            B: "3",
            C: "4",
            D: "5",

            dapAn: [
                "A",
                "B",
                "D"
            ],

            diem: 1,

            chuDe: "Số nguyên tố",

            doKho: "Thông hiểu"
        },
        {
            "maCau": "TOAN8-0006",
            "loai": "FILL",
            "cauHoi": "1 + 1 =",
            "diem": 1,
            "chuDe": "Đại số",
            "doKho": "Nhận biết",
            "dapAn": [
                "2"
            ]
        },
        {
        maCau: "TOAN8-001",
        loai: "MCQ",
        cauHoi: "Kết quả của 3² bằng bao nhiêu?",
        A: "6",
        B: "9",
        C: "12",
        D: "18",
        dapAn: "B",
        diem: 1,
        chuDe: "Đại số",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-002",
        loai: "MCQ",
        cauHoi: "Đơn thức nào sau đây đồng dạng với 3x²y?",
        A: "5xy²",
        B: "-2x²y",
        C: "4x²",
        D: "7xy",
        dapAn: "B",
        diem: 1,
        chuDe: "Đại số",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-003",
        loai: "MCQ",
        cauHoi: "Hằng đẳng thức nào đúng?",
        A: "(a+b)² = a²+b²",
        B: "(a+b)² = a²+2ab+b²",
        C: "(a+b)² = a²-ab+b²",
        D: "(a+b)² = a²+ab+b²",
        dapAn: "B",
        diem: 1,
        chuDe: "Hằng đẳng thức",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-004",
        loai: "MCQ",
        cauHoi: "Phân thức nào sau đây có nghĩa khi x ≠ 2?",
        A: "1/(x-2)",
        B: "1/(x+2)",
        C: "1/x",
        D: "1/(x²-4)",
        dapAn: "A",
        diem: 1,
        chuDe: "Phân thức đại số",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-005",
        loai: "MCQ",
        cauHoi: "Nếu x = 2 thì giá trị của 3x+1 là bao nhiêu?",
        A: "5",
        B: "6",
        C: "7",
        D: "8",
        dapAn: "C",
        diem: 1,
        chuDe: "Biểu thức đại số",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-006",
        loai: "MCQ",
        cauHoi: "Phương trình x+5=9 có nghiệm là:",
        A: "2",
        B: "3",
        C: "4",
        D: "5",
        dapAn: "C",
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-007",
        loai: "MCQ",
        cauHoi: "Hình chữ nhật có hai cạnh lần lượt là 5 cm và 8 cm. Diện tích bằng:",
        A: "13 cm²",
        B: "26 cm²",
        C: "40 cm²",
        D: "80 cm²",
        dapAn: "C",
        diem: 1,
        chuDe: "Hình học",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-008",
        loai: "MCQ",
        cauHoi: "Tổng ba góc của một tam giác bằng:",
        A: "90°",
        B: "180°",
        C: "270°",
        D: "360°",
        dapAn: "B",
        diem: 1,
        chuDe: "Tam giác",
        doKho: "Nhận biết"
    },

    // =========================
    // THÔNG HIỂU
    // =========================

    {
        maCau: "TOAN8-009",
        loai: "MCQ",
        cauHoi: "Rút gọn biểu thức 2x+3x-4 ta được:",
        A: "5x-4",
        B: "5x+4",
        C: "x-4",
        D: "6x-4",
        dapAn: "A",
        diem: 1,
        chuDe: "Đại số",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-010",
        loai: "MCQ",
        cauHoi: "Kết quả của (x+2)(x+3) là:",
        A: "x²+5x+6",
        B: "x²+6x+5",
        C: "x²+5",
        D: "x²+6",
        dapAn: "A",
        diem: 1,
        chuDe: "Đa thức",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-011",
        loai: "MCQ",
        cauHoi: "Phân tích x²-9 thành nhân tử:",
        A: "(x-9)(x+1)",
        B: "(x-3)(x+3)",
        C: "(x-3)²",
        D: "(x+9)(x-1)",
        dapAn: "B",
        diem: 1,
        chuDe: "Phân tích đa thức",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-012",
        loai: "MCQ",
        cauHoi: "Nghiệm của phương trình 2x-6=0 là:",
        A: "1",
        B: "2",
        C: "3",
        D: "4",
        dapAn: "C",
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-013",
        loai: "MCQ",
        cauHoi: "Nếu 3x=12 thì x bằng:",
        A: "2",
        B: "3",
        C: "4",
        D: "5",
        dapAn: "C",
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-014",
        loai: "MULTI",
        cauHoi: "Những số nào sau đây là nghiệm của x²=9?",
        A: "-3",
        B: "0",
        C: "3",
        D: "9",
        dapAn: ["A", "C"],
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-015",
        loai: "MULTI",
        cauHoi: "Những biểu thức nào là hằng đẳng thức đáng nhớ?",
        A: "(a+b)²",
        B: "a²-b²",
        C: "a²+2ab+b²",
        D: "a+b",
        dapAn: ["A", "B", "C"],
        diem: 1,
        chuDe: "Hằng đẳng thức",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-016",
        loai: "TRUEFALSE",
        cauHoi: "Phát biểu: Tổng các góc trong một tứ giác bằng 360°.",
        A: "Đúng",
        B: "Sai",
        C: "",
        D: "",
        dapAn: "A",
        diem: 1,
        chuDe: "Tứ giác",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-017",
        loai: "TRUEFALSE",
        cauHoi: "Phát biểu: Mọi hình chữ nhật đều là hình vuông.",
        A: "Đúng",
        B: "Sai",
        C: "",
        D: "",
        dapAn: "B",
        diem: 1,
        chuDe: "Tứ giác",
        doKho: "Thông hiểu"
    },

    // =========================
    // VẬN DỤNG
    // =========================

    {
        maCau: "TOAN8-018",
        loai: "MCQ",
        cauHoi: "Một hình chữ nhật có chiều dài 12 cm và chiều rộng 7 cm. Chu vi là:",
        A: "19 cm",
        B: "38 cm",
        C: "42 cm",
        D: "84 cm",
        dapAn: "B",
        diem: 1,
        chuDe: "Hình chữ nhật",
        doKho: "Vận dụng"
    },

    {
        maCau: "TOAN8-019",
        loai: "MCQ",
        cauHoi: "Một tam giác có đáy 10 cm và chiều cao 6 cm. Diện tích là:",
        A: "16 cm²",
        B: "30 cm²",
        C: "60 cm²",
        D: "120 cm²",
        dapAn: "B",
        diem: 1,
        chuDe: "Tam giác",
        doKho: "Vận dụng"
    },

    {
        maCau: "TOAN8-020",
        loai: "MCQ",
        cauHoi: "Giải phương trình 3x+2=14.",
        A: "x=2",
        B: "x=3",
        C: "x=4",
        D: "x=5",
        dapAn: "C",
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Vận dụng"
    },

    {
        maCau: "TOAN8-021",
        loai: "MCQ",
        cauHoi: "Giá trị của x²-4x+4 tại x=5 là:",
        A: "1",
        B: "4",
        C: "9",
        D: "25",
        dapAn: "A",
        diem: 1,
        chuDe: "Biểu thức đại số",
        doKho: "Vận dụng"
    },

    {
        maCau: "TOAN8-022",
        loai: "MCQ",
        cauHoi: "Một lớp có 40 học sinh, trong đó 60% là học sinh nữ. Số học sinh nữ là:",
        A: "20",
        B: "22",
        C: "24",
        D: "26",
        dapAn: "C",
        diem: 1,
        chuDe: "Thống kê",
        doKho: "Vận dụng"
    },

    {
        maCau: "TOAN8-023",
        loai: "MULTI",
        cauHoi: "Những giá trị nào làm biểu thức 1/(x-2) có nghĩa?",
        A: "0",
        B: "1",
        C: "2",
        D: "3",
        dapAn: ["A", "B", "D"],
        diem: 1,
        chuDe: "Phân thức đại số",
        doKho: "Vận dụng"
    },

    {
        maCau: "TOAN8-024",
        loai: "MULTI",
        cauHoi: "Những số nào sau đây là số nguyên?",
        A: "-3",
        B: "0",
        C: "2,5",
        D: "7",
        dapAn: ["A", "B", "D"],
        diem: 1,
        chuDe: "Số học",
        doKho: "Vận dụng"
    },

    {
        maCau: "TOAN8-025",
        loai: "TRUEFALSE",
        cauHoi: "Nếu hai tam giác bằng nhau thì các cạnh tương ứng bằng nhau.",
        A: "Đúng",
        B: "Sai",
        C: "",
        D: "",
        dapAn: "A",
        diem: 1,
        chuDe: "Tam giác",
        doKho: "Vận dụng"
    },

    {
        maCau: "TOAN8-026",
        loai: "TRUEFALSE",
        cauHoi: "Hai đường thẳng song song thì không có điểm chung.",
        A: "Đúng",
        B: "Sai",
        C: "",
        D: "",
        dapAn: "A",
        diem: 1,
        chuDe: "Hình học",
        doKho: "Vận dụng"
    },

    // =========================
    // ĐIỀN TỪ
    // =========================

    {
        maCau: "TOAN8-027",
        loai: "FILL",
        cauHoi: "Kết quả của 7 × 8 là ______.",
        A: "",
        B: "",
        C: "",
        D: "",
        dapAn: ["56"],
        diem: 1,
        chuDe: "Số học",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-028",
        loai: "FILL",
        cauHoi: "Tổng ba góc của một tam giác bằng ______ độ.",
        A: "",
        B: "",
        C: "",
        D: "",
        dapAn: ["180"],
        diem: 1,
        chuDe: "Tam giác",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-029",
        loai: "FILL",
        cauHoi: "Nghiệm của phương trình x-7=0 là ______.",
        A: "",
        B: "",
        C: "",
        D: "",
        dapAn: ["7"],
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-030",
        loai: "FILL",
        cauHoi: "Diện tích hình chữ nhật dài 8 cm, rộng 5 cm là ______ cm².",
        A: "",
        B: "",
        C: "",
        D: "",
        dapAn: ["40"],
        diem: 1,
        chuDe: "Hình chữ nhật",
        doKho: "Vận dụng"
    },

    // =========================
    // GHÉP NỐI
    // =========================

    {
        maCau: "TOAN8-031",
        loai: "MATCH",
        cauHoi: "Ghép mỗi công thức với kết quả tương ứng.",
        pairs: [
            {
                left: "2 + 3",
                right: "5"
            },
            {
                left: "4 × 2",
                right: "8"
            },
            {
                left: "10 - 6",
                right: "4"
            },
            {
                left: "12 : 3",
                right: "4"
            }
        ],
        dapAn: [0, 1, 2, 3],
        diem: 1,
        chuDe: "Số học",
        doKho: "Nhận biết"
    },

    {
        maCau: "TOAN8-032",
        loai: "MATCH",
        cauHoi: "Ghép hình với công thức tính diện tích.",
        pairs: [
            {
                left: "Hình chữ nhật",
                right: "a × b"
            },
            {
                left: "Tam giác",
                right: "a × h : 2"
            },
            {
                left: "Hình vuông",
                right: "a²"
            },
            {
                left: "Hình bình hành",
                right: "a × h"
            }
        ],
        dapAn: [0, 1, 2, 3],
        diem: 1,
        chuDe: "Hình học",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-033",
        loai: "MATCH",
        cauHoi: "Ghép phương trình với nghiệm.",
        pairs: [
            {
                left: "x + 2 = 5",
                right: "x = 3"
            },
            {
                left: "x - 4 = 2",
                right: "x = 6"
            },
            {
                left: "2x = 10",
                right: "x = 5"
            },
            {
                left: "3x = 12",
                right: "x = 4"
            }
        ],
        dapAn: [0, 1, 2, 3],
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Thông hiểu"
    },

    // =========================
    // SẮP XẾP
    // =========================

    {
        maCau: "TOAN8-034",
        loai: "SORT",
        cauHoi: "Sắp xếp các bước giải phương trình x+3=7 theo đúng trình tự.",
        items: [
            "Viết x + 3 = 7",
            "Chuyển 3 sang vế phải",
            "Tính 7 - 3",
            "Kết luận x = 4"
        ],
        dapAn: [0, 1, 2, 3],
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Thông hiểu"
    },

    {
        maCau: "TOAN8-035",
        loai: "SORT",
        cauHoi: "Sắp xếp các số theo thứ tự tăng dần.",
        items: [
            "-3",
            "0",
            "2",
            "5"
        ],
        dapAn: [0, 1, 2, 3],
        diem: 1,
        chuDe: "Số học",
        doKho: "Nhận biết"
    },

    // =========================
    // VẬN DỤNG CAO
    // =========================

    {
        maCau: "TOAN8-036",
        loai: "MCQ",
        cauHoi: "Cho x+y=10 và xy=21. Giá trị của x²+y² bằng:",
        A: "42",
        B: "58",
        C: "79",
        D: "100",
        dapAn: "B",
        diem: 1,
        chuDe: "Hằng đẳng thức",
        doKho: "Vận dụng cao"
    },

    {
        maCau: "TOAN8-037",
        loai: "MCQ",
        cauHoi: "Một hình vuông có diện tích 64 cm². Độ dài cạnh hình vuông là:",
        A: "6 cm",
        B: "7 cm",
        C: "8 cm",
        D: "16 cm",
        dapAn: "C",
        diem: 1,
        chuDe: "Hình vuông",
        doKho: "Vận dụng cao"
    },

    {
        maCau: "TOAN8-038",
        loai: "MCQ",
        cauHoi: "Cho x²=16. Tổng các nghiệm của phương trình là:",
        A: "-8",
        B: "-4",
        C: "0",
        D: "8",
        dapAn: "C",
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Vận dụng cao"
    },

    {
        maCau: "TOAN8-039",
        loai: "MULTI",
        cauHoi: "Những biểu thức nào có thể viết thành bình phương của một tổng?",
        A: "x²+2x+1",
        B: "x²+4x+4",
        C: "x²+3x+1",
        D: "x²+6x+9",
        dapAn: ["A", "B", "D"],
        diem: 1,
        chuDe: "Hằng đẳng thức",
        doKho: "Vận dụng cao"
    },

    {
        maCau: "TOAN8-040",
        loai: "FILL",
        cauHoi: "Nếu 2x+5=17 thì giá trị của x là ______.",
        A: "",
        B: "",
        C: "",
        D: "",
        dapAn: ["6"],
        diem: 1,
        chuDe: "Phương trình",
        doKho: "Vận dụng"
    }

    ]

};


/*
========================================================
 TƯƠNG THÍCH VỚI THI.JS HIỆN TẠI
========================================================
*/

const cauHoi = nganHangDe.cauHoi;