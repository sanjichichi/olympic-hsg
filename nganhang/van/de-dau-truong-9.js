// Ngân hàng câu hỏi TRÍ ĐẤU
// Schema: id, mon, khoi, mucDo, dangCau, cauHoi, luaChon, dapAn, thoiGian, xp
// mucDo: co_ban | thong_hieu | van_dung | hsg
// dangCau: single_select

const VAN_QUESTIONS = [
  {id:"VAN001",mon:"van",khoi:7,mucDo:"co_ban",dangCau:"single_select",cauHoi:"Truyện đồng thoại thường có đặc điểm nổi bật nào?",luaChon:["Nhân vật luôn là người thật","Nhân vật thường là loài vật, đồ vật được nhân hoá","Chỉ kể về các sự kiện lịch sử","Chỉ sử dụng ngôn ngữ khoa học"],dapAn:1,thoiGian:15,xp:10},
  {id:"VAN002",mon:"van",khoi:7,mucDo:"co_ban",dangCau:"single_select",cauHoi:"Từ láy là từ như thế nào?",luaChon:["Có quan hệ láy âm hoặc láy vần giữa các tiếng","Chỉ gồm một tiếng","Luôn có nghĩa trái ngược nhau","Luôn là từ Hán Việt"],dapAn:0,thoiGian:15,xp:10},
  {id:"VAN003",mon:"van",khoi:7,mucDo:"thong_hieu",dangCau:"single_select",cauHoi:"Chi tiết nghệ thuật trong truyện thường có vai trò gì?",luaChon:["Chỉ làm văn bản dài hơn","Góp phần khắc hoạ nhân vật, sự việc và chủ đề","Không liên quan đến chủ đề","Chỉ dùng để trang trí"],dapAn:1,thoiGian:20,xp:15},
  {id:"VAN004",mon:"van",khoi:8,mucDo:"thong_hieu",dangCau:"single_select",cauHoi:"Khi phân tích một hình ảnh thơ, thao tác phù hợp nhất là gì?",luaChon:["Chỉ chép lại hình ảnh","Xác định ý nghĩa, tác dụng nghệ thuật và cảm xúc được gợi ra","Bỏ qua ngữ cảnh","Chỉ đếm số tiếng"],dapAn:1,thoiGian:25,xp:15},
  {id:"VAN005",mon:"van",khoi:8,mucDo:"van_dung",dangCau:"single_select",cauHoi:"Một bài nghị luận thuyết phục cần chú trọng điều nào?",luaChon:["Luận điểm rõ, lí lẽ hợp lí và bằng chứng phù hợp","Chỉ dùng cảm xúc","Càng dài càng tốt","Không cần dẫn chứng"],dapAn:0,thoiGian:25,xp:20},
  {id:"VAN006",mon:"van",khoi:9,mucDo:"hsg",dangCau:"single_select",cauHoi:"Nhận định nào phù hợp với một tác phẩm có giá trị?",luaChon:["Chỉ cần kể lại cốt truyện","Vừa mang dấu ấn riêng của người sáng tạo vừa có khả năng khơi gợi sự đồng cảm ở người đọc","Không cần gắn với đời sống","Chỉ có giá trị khi dùng từ ngữ khó"],dapAn:1,thoiGian:35,xp:40}
];
