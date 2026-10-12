// ===== TRÍ ĐẤU - ENGINE DÙNG CHUNG CHO 4 MÔN =====
const ARENA_LEVELS = ["co_ban","thong_hieu","van_dung","hsg"];

function getArenaBank(subject){
  const banks = {
    "van": typeof VAN_QUESTIONS !== "undefined" ? VAN_QUESTIONS : [],
    "toan": typeof TOAN_QUESTIONS !== "undefined" ? TOAN_QUESTIONS : [],
    "tieng-anh": typeof TIENG_ANH_QUESTIONS !== "undefined" ? TIENG_ANH_QUESTIONS : [],
    "dia-ly": typeof DIA_LY_QUESTIONS !== "undefined" ? DIA_LY_QUESTIONS : []
  };
  return banks[subject] || [];
}

function getArenaQuestions(subject, count=10){
  const bank = getArenaBank(subject);
  const groups = {};
  ARENA_LEVELS.forEach(level => {
    groups[level] = shuffleArena(bank.filter(q => q.mucDo === level));
  });

  const result = [];
  const plan = ["co_ban","co_ban","co_ban","thong_hieu","thong_hieu","thong_hieu","van_dung","van_dung","van_dung","hsg"];

  plan.forEach(level => {
    if(result.length >= count) return;
    if(groups[level]?.length) result.push(groups[level].shift());
  });

  if(result.length < count){
    const rest = shuffleArena(bank.filter(q => !result.some(x => x.id === q.id)));
    result.push(...rest.slice(0, count-result.length));
  }

  return shuffleArena(result);
}

function shuffleArena(arr){
  return [...arr].sort(() => Math.random() - 0.5);
}
