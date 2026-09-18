
function taoBoLoc() {

    const cboNamHoc =
        document.getElementById("locNamHoc");

    const cboDotThi =
        document.getElementById("locDotThi");

    const cboKyThi =
        document.getElementById("filterExam");


    // Xóa option cũ
    cboNamHoc.innerHTML =
        '<option value="ALL">Tất cả</option>';

    cboDotThi.innerHTML =
        '<option value="ALL">Tất cả</option>';

    cboKyThi.innerHTML =
        '<option value="ALL">Tất cả</option>';


    // Lấy danh sách kỳ thi
    const dsKyThi =
        Object.values(EXAMS);


    // =========================
    // NĂM HỌC
    // =========================

    const dsNamHoc = [
        ...new Set(
            dsKyThi.map(exam => exam.namHoc)
        )
    ];

    dsNamHoc.forEach(namHoc => {

        if (!namHoc) return;

        const option =
            document.createElement("option");

        option.value = namHoc;
        option.textContent = namHoc;

        cboNamHoc.appendChild(option);

    });


    // =========================
    // ĐỢT THI
    // =========================

    const dsDotThi = [
        ...new Set(
            dsKyThi.map(exam => exam.dotThi)
        )
    ];

    dsDotThi.forEach(dotThi => {

        if (!dotThi) return;

        const option =
            document.createElement("option");

        option.value = dotThi;
        option.textContent = dotThi;

        cboDotThi.appendChild(option);

    });


    // =========================
    // KỲ THI
    // =========================

    dsKyThi.forEach(exam => {

        if (!exam.tenKyThi) return;

        const option =
            document.createElement("option");

        option.value = exam.tenKyThi;
        option.textContent = exam.tenKyThi;

        cboKyThi.appendChild(option);

    });

}
async function docCSV(url){

const response = await fetch(url);
const text = await response.text();

const rows = text.trim().split("\n");

return rows.slice(1).map(row => {

    const cols = row.split(",");

    return {

    timestamp: cols[0] || "",
    maHS: cols[1] || "",
    hoTen: cols[2] || "",
    lop: cols[3] || "",
    kyThi: cols[4] || "",
    diem: Number(cols[5] || 0),
    dung: Number(cols[6] || 0),
    sai: Number(cols[7] || 0),
    thoiGian: cols[8] || "",
    roiTab: Number(cols[9] || 0),
    ngayThi: cols[10] || "",
    namHoc: cols[11] || "",
    dotThi: cols[12] || ""

    };

});

}

async function taiDuLieu() {

    let tatCa = [];

    for (const exam of Object.values(EXAMS)) {

        let configForm = null;

        // Xác định Form theo môn
        if (exam.mon === "Toán") {
            configForm = FORM_CONFIG.toan;
        }

        else if (exam.mon === "Ngữ Văn") {
            configForm = FORM_CONFIG.van;
        }

        else if (exam.mon === "Tiếng Anh") {
            configForm = FORM_CONFIG.anh;
        }

        else if (exam.mon === "Tổng hợp") {
            configForm = FORM_CONFIG.tonghop;
        }


        if (!configForm) {

            console.error(
                "❌ Không tìm thấy FORM_CONFIG cho:",
                exam.mon
            );

            continue;
        }


        if (!configForm.csv) {

            console.error(
                "❌ Chưa có CSV cho:",
                exam.mon
            );

            continue;
        }


        console.log(
            "📥 Đang tải:",
            exam.tenKyThi,
            "→",
            configForm.csv
        );


        const data =
            await docCSV(configForm.csv);


        // Gắn thông tin kỳ thi vào kết quả
        data.forEach(hs => {

            hs.maKyThi =
                exam.maKyThi;

            hs.namHoc =
                exam.namHoc;

            hs.dotThi =
                exam.dotThi;

            hs.suKien =
                exam.suKien;

            hs.mon =
                exam.mon;

            hs.tenKyThi =
                exam.tenKyThi;

        });


        tatCa =
            tatCa.concat(data);

    }


    return tatCa;

}

function layKetQuaCaoNhat(data){

const ketQua = {};

data.forEach(hs => {

    const key =
    hs.maHS + "_" + hs.kyThi;

    if(!ketQua[key]){

        ketQua[key] = hs;

    }
    else{

        if(hs.diem >
           ketQua[key].diem){

            ketQua[key] = hs;

        }

    }

});

return Object.values(ketQua);

}

function parseThoiGian(tg){

    if(!tg) return 999999;

    const parts = tg.split(":");

    if(parts.length === 3){

        const gio = Number(parts[0]);
        const phut = Number(parts[1]);
        const giay = Number(parts[2]);

        return gio * 3600 +
               phut * 60 +
               giay;

    }

    return 999999;

}

function sapXep(data){

    return data.sort((a,b)=>{

        // Ưu tiên điểm

        if(b.diem !== a.diem){

            return b.diem - a.diem;

        }

        // Ưu tiên ít rời tab hơn

        if(a.roiTab !== b.roiTab){

            return a.roiTab - b.roiTab;

        }

        // Ưu tiên hoàn thành nhanh hơn

        const tgA =
        parseThoiGian(a.thoiGian);

        const tgB =
        parseThoiGian(b.thoiGian);

        return tgA - tgB;

    });

}

function hienThiBang(data){

const tbody =
document.getElementById("rankingBody");

document.getElementById("tongThiSinh")
.innerText = "Tổng số thí sinh: " + data.length;

tbody.innerHTML = "";

data.forEach((hs,index)=>{

    let css = "";

    if(index === 0){
        css = "hang1";
    }
    else if(index === 1){
        css = "hang2";
    }
    else if(index === 2){
        css = "hang3";
    }

    tbody.innerHTML += `
    <tr class="${css}">
        <td>${index+1}</td>
        <td>${hs.maHS}</td>
        <td>${hs.hoTen}</td>
        <td>${hs.lop}</td>
        <td>${hs.dotThi}</td>
        <td>${hs.kyThi}</td>
        <td>${hs.diem}</td>
        <td>${hs.roiTab}</td>
        <td>${hs.thoiGian}</td>
    </tr>
    `;

});

}


async function khoiTao() {

    // =====================================
    // 1. TẢI CẤU HÌNH KỲ THI TỪ GOOGLE SHEET
    // =====================================

    await loadExamConfig();

    console.log("📚 EXAMS sau khi tải:", EXAMS);

    if (Object.keys(EXAMS).length === 0) {

        console.error("❌ Không có cấu hình kỳ thi!");

        document.getElementById("rankingBody").innerHTML = `
            <tr>
                <td colspan="9">
                    ❌ Không tải được cấu hình kỳ thi.
                </td>
            </tr>
        `;

        return;
    }


    // =====================================
    // 2. TẠO 3 BỘ LỌC
    // =====================================

    taoBoLoc();


    // =====================================
    // 3. TẢI TOÀN BỘ KẾT QUẢ
    // =====================================

    let data = await taiDuLieu();

    console.log("📊 Tổng dữ liệu:", data.length);


    // =====================================
    // 4. LẤY KẾT QUẢ CAO NHẤT
    // =====================================

    data = layKetQuaCaoNhat(data);


    // =====================================
    // 5. LẤY CÁC COMBOBOX
    // =====================================

    const cboNamHoc =
        document.getElementById("locNamHoc");

    const cboDotThi =
        document.getElementById("locDotThi");

    const cboKyThi =
        document.getElementById("filterExam");


    // =====================================
    // 6. CẬP NHẬT BẢNG
    // =====================================

    function capNhatBang() {

        let ds = [...data];


        // -----------------------------
        // LỌC NĂM HỌC
        // -----------------------------

        if (cboNamHoc.value !== "ALL") {

            ds = ds.filter(x => {

                const exam =
                    Object.values(EXAMS)
                    .find(e =>
                        e.tenKyThi === x.kyThi
                    );

                return exam &&
                       exam.namHoc === cboNamHoc.value;
            });
        }


        // -----------------------------
        // LỌC ĐỢT THI
        // -----------------------------

        if (cboDotThi.value !== "ALL") {

            ds = ds.filter(x => {

                const exam =
                    Object.values(EXAMS)
                    .find(e =>
                        e.tenKyThi === x.kyThi
                    );

                return exam &&
                       exam.dotThi === cboDotThi.value;
            });
        }


        // -----------------------------
        // LỌC KỲ THI
        // -----------------------------

        if (cboKyThi.value !== "ALL") {

            ds = ds.filter(x =>
                x.kyThi === cboKyThi.value
            );
        }


        // -----------------------------
        // XẾP HẠNG
        // -----------------------------

        ds = sapXep(ds);

        hienThiBang(ds);
    }


    // =====================================
    // 7. BẮT SỰ KIỆN BỘ LỌC
    // =====================================

    cboNamHoc.addEventListener(
        "change",
        capNhatBang
    );

    cboDotThi.addEventListener(
        "change",
        capNhatBang
    );

    cboKyThi.addEventListener(
        "change",
        capNhatBang
    );


    // =====================================
    // 8. HIỂN THỊ LẦN ĐẦU
    // =====================================

    capNhatBang();

}


// =====================================
// KHỞI ĐỘNG
// =====================================

khoiTao();
