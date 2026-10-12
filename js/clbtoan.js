const dsHoatDong = [

{
    ngay:"04/12/2026",
    tieuDe:"Sinh hoạt Câu lạc bộ tháng 12",
    moTa:"Đánh giá kết quả hoạt động học kỳ I, tổ chức sinh hoạt theo chủ đề.",
    thuMuc:"2026-12",
    soAnh:6
},

{
    ngay:"06/11/2026",
    tieuDe:"Sinh hoạt Câu lạc bộ tháng 11",
    moTa:"Các câu lạc bộ tiếp tục duy trì các hoạt động trải nghiệm và rèn luyện kỹ năng.",
    thuMuc:"2026-11",
    soAnh:5
},

{
    ngay:"02/10/2026",
    tieuDe:"Sinh hoạt Câu lạc bộ tháng 10",
    moTa:"Các thành viên tham gia sinh hoạt định kỳ theo nội dung của từng câu lạc bộ.",
    thuMuc:"2026-10",
    soAnh:6
},

{
    ngay:"04/09/2026",
    tieuDe:"Khai mạc Câu lạc bộ năm học 2026-2027",
    moTa:"Tổ chức khai mạc, phổ biến kế hoạch hoạt động năm học mới.",
    thuMuc:"2026-09-khai-mac",
    soAnh:6
}

];
function toggleActivity(i){

const content=document.getElementById("content"+i);

const icon=document.getElementById("icon"+i);

if(content.classList.contains("show")){

content.classList.remove("show");

icon.innerHTML="▼";

}else{

document.querySelectorAll(".activity-content").forEach(e=>{

e.classList.remove("show");

});

document.querySelectorAll("[id^='icon']").forEach(e=>{

e.innerHTML="▼";

});

content.classList.add("show");

icon.innerHTML="▲";

}

}