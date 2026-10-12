/* =====================================================
   CONFIG EXAM
   Đọc trực tiếp từ SHEET CẤU HÌNH
   ===================================================== */

const CONFIG_EXAM_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSf3WztJkMT3aBk2_o_xvGu1HNxCRCIFQtDbOsyP6G6ujBB7SjlAlDbCFjoHbjSYTkfYTbYfLwG3lFN/pub?output=csv";


let EXAMS = {};

let DS_KY_THI = [];


/* =====================================================
   ĐỌC CSV
   ===================================================== */

function csvToArray(csv) {

    const rows = csv
        .trim()
        .split(/\r?\n/);

    if (rows.length < 2) {
        return [];
    }

    const header = rows[0]
        .split(",")
        .map(x =>
            x
            .replace(/^\uFEFF/, "")
            .replace(/^"|"$/g, "")
            .trim()
        );


    return rows
        .slice(1)
        .map(row => {

            const values =
                row.match(
                    /(".*?"|[^",]+)(?=\s*,|\s*$)/g
                );

            if (!values) {
                return null;
            }

            const obj = {};

            header.forEach((name, index) => {

                obj[name] =
                    values[index]
                    ? values[index]
                        .replace(/^"|"$/g, "")
                        .trim()
                    : "";

            });

            return obj;

        })
        .filter(Boolean);

}


/* =====================================================
   TẢI CẤU HÌNH KỲ THI
===================================================== */

async function loadExamConfig() {

    try {

        const response =
            await fetch(CONFIG_EXAM_URL);


        if (!response.ok) {

            throw new Error(
                "Không thể tải Sheet cấu hình"
            );

        }


        const csv =
            await response.text();


        const rows =
            csvToArray(csv);


        /*
         * Làm mới dữ liệu
         */

        EXAMS = {};


        rows.forEach(item => {

            /*
             * Hỗ trợ cả:
             *
             * maKyThi
             * MaKyThi
             */

            const maKyThi =
                item.maKyThi ||
                item.MaKyThi ||
                "";


            if (!maKyThi) {

                return;

            }


            EXAMS[maKyThi] = {

                maKyThi:

                    maKyThi,


                tenKyThi:

                    item.tenKyThi ||
                    item.TenKyThi ||
                    "",


                maDe:

                    item.maDe ||
                    item.MaDe ||
                    "",


                namHoc:

                    item.namHoc ||
                    item.NamHoc ||
                    "",


                dotThi:

                    item.dotThi ||
                    item.DotThi ||
                    "",


                suKien:

                    item.suKien ||
                    item.SuKien ||
                    "",


                mon:

                    item.mon ||
                    item.Mon ||
                    "",


                khoi:

                    item.khoi ||
                    item.Khoi ||
                    "",


                icon:

                    item.icon ||
                    item.Icon ||
                    "",


                soCau:

                    item.soCau ||
                    item.SoCau ||
                    "",


                thoiGian:

                    item.thoiGian ||
                    item.ThoiGian ||
                    "",


                loaiThi:

                    item.loaiThi ||
                    item.LoaiThi ||
                    "",


                thiThu:

                    item.thiThu ||
                    item.ThiThu ||
                    "",


                ngayThi:

                    item.ngayThi ||
                    item.NgayThi ||
                    "",


                gioBatDau:

                    item.gioBatDau ||
                    item.GioBatDau ||
                    "",


                gioKetThuc:

                    item.gioKetThuc ||
                    item.GioKetThuc ||
                    "",


                maGV:

                    item.maGV ||
                    item.MaGV ||
                    "",


                trangThai:

                    item.trangThai ||
                    item.TrangThai ||
                    "",


                ngayTao:

                    item.ngayTao ||
                    item.NgayTao ||
                    ""

            };

        });


        /*
         * Chuyển object → array
         */

        DS_KY_THI =
            Object.values(EXAMS);


        console.log(
            "✅ Đã tải cấu hình kỳ thi:",
            DS_KY_THI
        );


        console.log(
            "📚 Số kỳ thi:",
            DS_KY_THI.length
        );


        return DS_KY_THI;

    }

    catch (error) {

        console.error(
            "❌ Lỗi tải cấu hình kỳ thi:",
            error
        );


        EXAMS = {};

        DS_KY_THI = [];


        return [];

    }

}