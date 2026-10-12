// Ngân hàng câu hỏi TRÍ ĐẤU
// Schema: id, mon, khoi, mucDo, dangCau, cauHoi, luaChon, dapAn, thoiGian, xp
// mucDo: co_ban | thong_hieu | van_dung | hsg
// dangCau: single_select

const DIA_LY_QUESTIONS = [
  {id:"DIA001",mon:"dia-ly",khoi:7,mucDo:"co_ban",dangCau:"single_select",cauHoi:"Châu lục nào có diện tích lớn nhất thế giới?",luaChon:["Châu Âu","Châu Á","Châu Phi","Châu Đại Dương"],dapAn:1,thoiGian:15,xp:10},
  {id:"DIA002",mon:"dia-ly",khoi:8,mucDo:"co_ban",dangCau:"single_select",cauHoi:"Khí hậu Việt Nam mang tính chất chủ yếu nào?",luaChon:["Nhiệt đới gió mùa","Ôn đới hải dương","Hàn đới","Hoang mạc"],dapAn:0,thoiGian:15,xp:10},
  {id:"DIA003",mon:"dia-ly",khoi:8,mucDo:"thong_hieu",dangCau:"single_select",cauHoi:"Biểu đồ cột thường phù hợp để thể hiện điều gì?",luaChon:["So sánh quy mô hoặc giá trị giữa các đối tượng","Chỉ thể hiện cơ cấu","Chỉ thể hiện sự thay đổi nhiệt độ","Chỉ thể hiện hướng gió"],dapAn:0,thoiGian:20,xp:15},
  {id:"DIA004",mon:"dia-ly",khoi:9,mucDo:"van_dung",dangCau:"single_select",cauHoi:"Khi nhận xét bảng số liệu, bước quan trọng là gì?",luaChon:["Chỉ đọc một con số","Xác định xu hướng, mức độ tăng giảm và so sánh các đối tượng","Bỏ qua đơn vị","Không cần dẫn số liệu"],dapAn:1,thoiGian:25,xp:20},
  {id:"DIA005",mon:"dia-ly",khoi:9,mucDo:"van_dung",dangCau:"single_select",cauHoi:"Địa hình có thể ảnh hưởng trực tiếp đến yếu tố nào?",luaChon:["Phân bố dân cư và hoạt động kinh tế","Tên quốc gia","Ngôn ngữ duy nhất","Múi giờ duy nhất"],dapAn:0,thoiGian:25,xp:20},
  {id:"DIA006",mon:"dia-ly",khoi:9,mucDo:"hsg",dangCau:"single_select",cauHoi:"Trong phân tích địa lí, việc kết hợp bản đồ, bảng số liệu và biểu đồ chủ yếu giúp:",luaChon:["Trang trí bài làm","Nhận diện mối quan hệ không gian và xu hướng biến đổi có cơ sở","Giảm lượng thông tin","Thay thế hoàn toàn việc giải thích"],dapAn:1,thoiGian:35,xp:40}
];
