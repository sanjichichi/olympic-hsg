
const maKyThi =
    localStorage.getItem("maKyThi");

const monRaw =
    String(
        localStorage.getItem("mon") || ""
    )
    .trim()
    .toLowerCase();

let mon = monRaw;

if (
    monRaw === "toán" ||
    monRaw === "toan"
) {
    mon = "toan";
}

else if (
    monRaw === "ngữ văn" ||
    monRaw === "ngu van" ||
    monRaw === "văn" ||
    monRaw === "van"
) {
    mon = "van";
}

else if (
    monRaw === "tiếng anh" ||
    monRaw === "tieng anh" ||
    monRaw === "anh"
) {
    mon = "tienganh";
}

const soCau =
    Number(
        localStorage.getItem("soCau")
    ) || 20;


/* =========================================================
   LẤY NGÂN HÀNG ĐỀ ĐÃ ĐƯỢC THITHU.HTML NẠP
========================================================= */

if (
    typeof cauHoi === "undefined" ||
    !Array.isArray(cauHoi)
) {

    alert(
        "❌ Không tìm thấy ngân hàng câu hỏi."
    );

    console.error(
        "❌ File đề không tạo biến cauHoi."
    );

    window.location.href =
        "chonkithi.html";

    throw new Error(
        "Biến cauHoi không tồn tại."
    );
}


/* =========================================================
   TẠO ĐỀ NGẪU NHIÊN
========================================================= */

let deThi = [...cauHoi];

deThi.sort(
    () => Math.random() - 0.5
);

deThi =
    deThi.slice(
        0,
        soCau
    );

console.log(
    "📚 Tổng ngân hàng:",
    cauHoi.length
);

console.log(
    "📝 Số câu thi:",
    deThi.length
);
function hienThiCauHoi(){

    let html = "";

    deThi.forEach(function(cau,index){

        html += `
        <div class="question" id="cau${index+1}">

            <h3>Câu ${index+1}</h3>

            <p>${cau.cauHoi}</p>

            <label>
            <input type="radio"
            name="cau${index+1}"
            value="A">
            ${cau.A}
            </label>

            <label>
            <input type="radio"
            name="cau${index+1}"
            value="B">
            ${cau.B}
            </label>

            <label>
            <input type="radio"
            name="cau${index+1}"
            value="C">
            ${cau.C}
            </label>

            <label>
            <input type="radio"
            name="cau${index+1}"
            value="D">
            ${cau.D}
            </label>

        </div>
        `;
    });

    document.getElementById(
        "khuVucCauHoi"
    ).innerHTML = html;

}
function taoThanhDieuHuong(){

    let html = "";

    deThi.forEach(function(cau,index){

        html += `
        <button
            type="button"
            id="nav${index+1}"
            class="nav-btn"
            onclick="diDenCau(${index+1})">
            ${index+1}
        </button>
        `;

    });

    document.getElementById("questionNavContainer").innerHTML = html;

}

function diDenCau(so){

    document.getElementById("cau"+so).scrollIntoView({
        behavior:"smooth",
        block:"start"
    });

}

function khoiTaoSuKien(){

    deThi.forEach(function(cau,index){

        document
        .querySelectorAll(
            `input[name="cau${index+1}"]`
        )
        .forEach(function(input){

            input.addEventListener(
                "change",
                function(){

                    document
                    .getElementById(
                        `nav${index+1}`
                    )
                    .classList.add(
                        "done-question"
                    );

                    capNhatTienDo();

                }
            );

        });

    });

}
// Lấy thời gian của kỳ thi (phút -> giây)
let time = 20 * 60;

// Nếu có thời gian lưu lại thì tiếp tục từ đó
if(localStorage.getItem("thoiGianConLai")){

    time = parseInt(
        localStorage.getItem("thoiGianConLai")
    );

}

let timer = setInterval(function(){

    let minutes =
    Math.floor(time / 60);

    let seconds =
    time % 60;

    document.getElementById("timer")
    .innerHTML =
    minutes + ":" +
    String(seconds).padStart(2,"0");

    time--;

    if(time < 0){

    clearInterval(timer);

    alert(
        "Đã hết thời gian làm bài. Hệ thống sẽ tự động nộp bài."
    );

    nopBaiThiThu();

    }

},1000);
function capNhatTienDo(){

    let dem = 0;

    deThi.forEach(function(cau,index){

        if(
            document.querySelector(
                `input[name="cau${index+1}"]:checked`
            )
        ){
            dem++;
        }

    });

    document.getElementById(
        "soCauDaLam"
    ).innerHTML = dem;

}
function nopBaiThiThu(){
clearInterval(timer);
    let diem = 0;

    deThi.forEach(function(cau,index){

    let luaChon =
    document.querySelector(
        `input[name="cau${index+1}"]:checked`
    );

    if(
        luaChon &&
        luaChon.value === cau.dapAn
    ){
        diem++;
    }

    });
const tongSoCau = deThi.length;

const cauSai = tongSoCau - diem;

const tyLe = Math.round(diem / tongSoCau * 100);

// =======================
// CỘNG LƯỢT LUYỆN TẬP
// =======================

const maKyThi = localStorage.getItem("maKyThi");

const key = "lt_" + maKyThi;

let luot = Number(
    localStorage.getItem(key)
) || 0;

luot++;

localStorage.setItem(
    key,
    luot
);
let xepLoai = "";

if (tyLe >= 90) {

    xepLoai = "Xuất sắc";

}
else if (tyLe >= 80) {

    xepLoai = "Tốt";

}
else if (tyLe >= 70) {

    xepLoai = "Khá";

}
else {

    xepLoai = "Đạt";

}
    deThi.forEach(function(cau,index){

    const luaChon = document.querySelector(
        `input[name="cau${index+1}"]:checked`
    );

    if(luaChon){

        luaChon.disabled = true;

    }
// Đổi màu thanh điều hướng sau khi chấm bài
deThi.forEach(function(cau,index){

    const luaChon = document.querySelector(
        `input[name="cau${index+1}"]:checked`
    );

    const nut = document.getElementById(`nav${index+1}`);

    if(!luaChon){
        return;
    }

    if(luaChon.value === cau.dapAn){

        nut.classList.remove("done-question");
        nut.classList.add("dung-question");

    }else{

        nut.classList.remove("done-question");
        nut.classList.add("sai-question");

    }

});
});
// Tô màu đáp án
deThi.forEach(function(cau,index){

    document
    .querySelectorAll(`input[name="cau${index+1}"]`)
    .forEach(function(input){

        const label = input.parentElement;

        // Đánh dấu đáp án đúng
        if(input.value === cau.dapAn){

            label.classList.add("dap-an-dung");

        }

    });

    // Nếu học sinh chọn sai thì tô đỏ
    const luaChon = document.querySelector(
        `input[name="cau${index+1}"]:checked`
    );

    if(luaChon && luaChon.value !== cau.dapAn){

        luaChon.parentElement.classList.add("dap-an-sai");

    }

});

document.querySelector(".submit-btn").innerHTML ="ĐÃ NỘP BÀI";
document.querySelector(".submit-btn").disabled = true;
document.getElementById("ketQuaThiThu").style.display = "block";
guiLuotLuyenTap();
document.getElementById("ketQuaThiThu").scrollIntoView({
    behavior: "smooth",
    block: "start"
});
document.getElementById("kqDung").textContent = diem;
document.getElementById("kqTong").textContent = tongSoCau;
document.getElementById("kqTyLe").textContent = tyLe + "%";
document.getElementById("kqXepLoai").textContent = xepLoai;
}

function nopBai(){

    let xacNhan = confirm(
        "Bạn có chắc chắn muốn nộp bài?"
    );

    if(!xacNhan){
        return;
    }

    nopBaiThiThu();

}
hienThiCauHoi();

taoThanhDieuHuong();

khoiTaoSuKien();

document.getElementById("tongSoCau").innerHTML =
deThi.length;
document.getElementById("btnLuyenLai").addEventListener(
    "click",
    function(){

        window.location.reload();

    }
);
document.getElementById("btnTrangChu").addEventListener(
    "click",
    function(){

        window.location.href = "index.html";

    }
);

// Tính lượt luyện tập
async function guiLuotLuyenTap(){

    const formData = new FormData();

    formData.append(
        "entry.131085548",   // Mã học sinh
        localStorage.getItem("maThiSinh")
    );

    formData.append(
        "entry.766043376",   // Họ tên
        localStorage.getItem("tenThiSinh")
    );

    formData.append(
        "entry.1278051019",   // Lớp
        localStorage.getItem("lopThiSinh")
    );

    formData.append(
        "entry.145947204",
        "1"
    );

    try{

        await fetch(formURL,{

            method:"POST",

            mode:"no-cors",

            body:formData

        });

        console.log("Đã gửi lượt luyện tập.");

    }catch(e){

        console.error(e);

    }

}