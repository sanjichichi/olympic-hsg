// Ngân hàng câu hỏi TRÍ ĐẤU
// Schema: id, mon, khoi, mucDo, dangCau, cauHoi, luaChon, dapAn, thoiGian, xp
// mucDo: co_ban | thong_hieu | van_dung | hsg
// dangCau: single_select

const TOAN_QUESTIONS = [
  {id:"TOAN001",mon:"toan",khoi:7,mucDo:"co_ban",dangCau:"single_select",cauHoi:"Tính $\\frac{1}{2}+\\frac{1}{3}$.",luaChon:["$\\frac{2}{5}$","$\\frac{5}{6}$","$\\frac{1}{6}$","$\\frac{3}{5}$"],dapAn:1,thoiGian:15,xp:10},
  {id:"TOAN002",mon:"toan",khoi:8,mucDo:"co_ban",dangCau:"single_select",cauHoi:"Nghiệm của phương trình $2x+3=7$ là:",luaChon:["$x=1$","$x=2$","$x=3$","$x=4$"],dapAn:1,thoiGian:15,xp:10},
  {id:"TOAN003",mon:"toan",khoi:8,mucDo:"thong_hieu",dangCau:"single_select",cauHoi:"Nếu $a=3$ thì giá trị của $a^2-2a$ là:",luaChon:["$1$","$3$","$6$","$9$"],dapAn:0,thoiGian:20,xp:15},
  {id:"TOAN004",mon:"toan",khoi:9,mucDo:"van_dung",dangCau:"single_select",cauHoi:"Cho $x+y=5$ và $xy=6$. Giá trị của $x^2+y^2$ là:",luaChon:["$11$","$13$","$19$","$25$"],dapAn:1,thoiGian:25,xp:20},
  {id:"TOAN005",mon:"toan",khoi:9,mucDo:"van_dung",dangCau:"single_select",cauHoi:"Nghiệm của $x^2-5x+6=0$ là:",luaChon:["$1,6$","$2,3$","$-2,-3$","$0,6$"],dapAn:1,thoiGian:25,xp:20},
  {id:"TOAN006",mon:"toan",khoi:9,mucDo:"hsg",dangCau:"single_select",cauHoi:"Với $a,b>0$ và $a+b=4$, giá trị lớn nhất của $ab$ là:",luaChon:["$2$","$4$","$8$","$16$"],dapAn:1,thoiGian:35,xp:40}
];

function renderMathArena(){
  if(window.MathJax && MathJax.typesetPromise){
    MathJax.typesetPromise();
  }
}
