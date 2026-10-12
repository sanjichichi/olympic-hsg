// Ngân hàng câu hỏi TRÍ ĐẤU
// Schema: id, mon, khoi, mucDo, dangCau, cauHoi, luaChon, dapAn, thoiGian, xp
// mucDo: co_ban | thong_hieu | van_dung | hsg
// dangCau: single_select

const TIENG_ANH_QUESTIONS = [
  {id:"ANH001",mon:"tieng-anh",khoi:7,mucDo:"co_ban",dangCau:"single_select",cauHoi:"Choose the correct answer: She ___ to school every day.",luaChon:["go","goes","going","went"],dapAn:1,thoiGian:15,xp:10},
  {id:"ANH002",mon:"tieng-anh",khoi:7,mucDo:"co_ban",dangCau:"single_select",cauHoi:"Choose the word closest in meaning to 'happy'.",luaChon:["sad","glad","angry","tired"],dapAn:1,thoiGian:15,xp:10},
  {id:"ANH003",mon:"tieng-anh",khoi:8,mucDo:"thong_hieu",dangCau:"single_select",cauHoi:"If it rains tomorrow, we ___ at home.",luaChon:["stay","stayed","will stay","staying"],dapAn:2,thoiGian:20,xp:15},
  {id:"ANH004",mon:"tieng-anh",khoi:8,mucDo:"van_dung",dangCau:"single_select",cauHoi:"Choose the correct passive form: People speak English in many countries.",luaChon:["English speaks in many countries.","English is spoken in many countries.","English was speaking in many countries.","English spoke in many countries."],dapAn:1,thoiGian:25,xp:20},
  {id:"ANH005",mon:"tieng-anh",khoi:9,mucDo:"van_dung",dangCau:"single_select",cauHoi:"Choose the best answer: The book ___ by my sister yesterday.",luaChon:["buys","bought","was bought","is bought"],dapAn:2,thoiGian:25,xp:20},
  {id:"ANH006",mon:"tieng-anh",khoi:9,mucDo:"hsg",dangCau:"single_select",cauHoi:"Choose the best option: Hardly ___ the room when the phone rang.",luaChon:["I had entered","had I entered","I entered","did I enter"],dapAn:1,thoiGian:35,xp:40}
];
