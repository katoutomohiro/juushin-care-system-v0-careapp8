/**
 * 統一されたユーザーマスターデータ
 * 両ファイルの情報を統合し、一元管理する
 */

import { UserDetail, updateAllUserServices, ServiceType } from "./user-service-allocation";

// プロフィール抽出用（ケース記録で利用）
export type UserProfileFields = Pick<UserDetail, 'age' | 'gender' | 'disabilityType' | 'condition' | 'medicalCare' | 'handbook' | 'assist'>

// 統合されたユーザーデータ（年齢ベースでサービス自動配置）
const rawUserDetails: Record<string, Omit<UserDetail, 'service'> & { originalService?: ServiceType[] }> = {
  // 生活介護 14名
  "A・T": {
    name: "A・T",
    age: 36,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、遠視性弱視、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "I・K1": {
    name: "I・K1",
    age: 47,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、側湾症、体幹四肢機能障害",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "I・K2": {
    name: "I・K2",
    age: 40,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、体幹四肢機能障害",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "O・S": {
    name: "O・S",
    age: 40,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、体幹四肢機能障害",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "S・M": {
    name: "S・M",
    age: 43,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、脳炎後遺症、てんかん（服薬中）、精神遅滞、側湾症、両上下肢機能障害",
    medicalCare: "吸引、腸瘻（トラブル多く抜去など頻回）",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "N・M": {
    name: "N・M",
    age: 32,
    gender: "男性",
    careLevel: "全介助",
    condition: "痙性四肢麻痺、重度知的障害、てんかん（強直間代発作がほぼ毎日1〜5回）",
    medicalCare: "胃ろう注入、エアウェイ装着、カフアシスト、グリセリン浣腸（火・木）、吸引、吸入",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "W・M": {
    name: "W・M",
    age: 32,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害、上下肢機能障害",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "S・Y": {
    name: "S・Y",
    age: 41,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害",
    medicalCare: "鼻腔栄養注入",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "Y・K": {
    name: "Y・K",
    age: 22,
    gender: "男性",
    careLevel: "全介助",
    condition: "二分脊椎症、水頭症（シャント内蔵）、急性脳症後遺症、膀胱機能障害、両上下肢機能障害、体幹機能障害、自閉症スペクトラム障害",
    medicalCare: "鼻腔チューブ（内服時のみ）、導尿",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "O・M": {
    name: "O・M",
    age: 23,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、視覚障害（全盲）、難聴、網膜症、脳原生移動障害",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "U・S": {
    name: "U・S",
    age: 19,
    gender: "男性",
    careLevel: "全介助",
    condition: "クリッペファイル症候群、高度難聴、気管狭窄症、両下肢機能障害",
    medicalCare: "気管切開、気管内吸引、吸入、浣腸あり",
    handbook: "身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "障がい程度区分6",
    originalService: ["life-care"]
  },
  "I・T": {
    name: "I・T",
    age: 24,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺",
    medicalCare: "胃ろう注入",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "M・S": {
    name: "M・S",
    age: 18,
    gender: "男性",
    careLevel: "全介助",
    condition: "水頭症、脳原生上肢機能障害、脳原生上肢移動障害、側湾症、発作（5分以上続く場合は救急搬送）",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  "M・O": {
    name: "M・O",
    age: 18,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害、発作（四肢・顔面のミオクローヌスあり）",
    medicalCare: "胃ろう注入、吸引、IVH埋め込み",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害者・区分6",
    originalService: ["life-care"]
  },
  // 放課後等デイサービス 10名
  "M・I": {
    name: "M・I",
    age: 17,
    gender: "男児",
    careLevel: "全介助",
    condition: "慢性肺疾患、先天性疾患、染色体異常、脳の形成不全、抗てんかん（ミオクロニー発作あり）",
    medicalCare: "鼻腔注入",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "S・K1": {
    name: "S・K1",
    age: 15,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳腫瘍手術後遺症、脳原生上肢機能障害、脳原生移動機能障害、アレルギー性鼻炎、食物アレルギー",
    medicalCare: "シャント内蔵",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "M・M": {
    name: "M・M",
    age: 15,
    gender: "女児",
    careLevel: "一部介助",
    condition: "記載なし",
    medicalCare: "なし",
    handbook: "療育手帳1級",
    assist: "一部介助",
    disabilityType: "知的障がい児（発作あり）",
    originalService: ["after-school"]
  },
  "K・S": {
    name: "K・S",
    age: 7,
    gender: "女児",
    careLevel: "全介助",
    condition: "発達遅延、肢体不自由、けいれん発作（5分以上は救急搬送）",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "Y・S": {
    name: "Y・S",
    age: 6,
    gender: "女児",
    careLevel: "全介助",
    condition: "症候性てんかん、脳原生上肢機能障害、脳原生移動機能障害",
    medicalCare: "筋緊張（ITB療法中）",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "F・M": {
    name: "F・M",
    age: 13,
    gender: "女児",
    careLevel: "全介助",
    condition: "症候性てんかん、股関節亜脱臼、脳原生上肢機能障害、脳原生移動機能障害、側湾症",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "N・T": {
    name: "N・T",
    age: 9,
    gender: "男児",
    careLevel: "全介助",
    condition: "発達遅滞、神経セロイドリポフスチン8型、両上肢・体幹機能障害、てんかん（ミオクローヌス等）",
    medicalCare: "胃ろう注入",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "I・K3": {
    name: "I・K3",
    age: 9,
    gender: "不明",
    careLevel: "全介助",
    condition: "脳性麻痺、側弯、吸引頻回（呼吸筋が脆弱）、高熱時に嘔吐リスクあり",
    medicalCare: "胃ろう注入",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "K・Y": {
    name: "K・Y",
    age: 9,
    gender: "女児",
    careLevel: "全介助",
    condition: "脳性麻痺、脳原生上肢機能障害、脳原生移動機能障害、側湾症",
    medicalCare: "なし",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "S・K2": {
    name: "S・K2",
    age: 14,
    gender: "女児",
    careLevel: "全介助",
    condition: "滑脳症（TUBA1A遺伝子異常）、小脳底形成、上腸間膜症候群、症候性てんかん、重度精神運動発達遅滞",
    medicalCare: "経胃ろう十二指腸チューブからの経管栄養＋ポートからのCV栄養注入",
    handbook: "療育手帳A / 身体障害者手帳1級",
    assist: "全介助",
    disabilityType: "重症心身障害児",
    originalService: ["after-school"]
  },
  "T・Y": {
    name: "T・Y", 
    age: 17, // 18歳未満 → after-school に自動配置
    gender: "男児",
    careLevel: "全介助", 
    condition: "脳原生上肢機能障害、脳原生上肢移動障害",
    medicalCare: "なし",
    originalService: ["after-school"]
  },
  // 18歳未満のユーザーを追加（放課後等デイサービス用）
  "K・M": {
    name: "K・M",
    age: 16,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    originalService: ["after-school"]
  },
  "S・H": {
    name: "S・H",
    age: 16,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    originalService: ["after-school"]
  },
  "R・N": {
    name: "R・N",
    age: 15,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    originalService: ["after-school"]
  },
  "Y・T": {
    name: "Y・T",
    age: 14,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    originalService: ["after-school"]
  },
  "H・K": {
    name: "H・K",
    age: 13,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    originalService: ["after-school"]
  },
  "N・S": {
    name: "N・S",
    age: 12,
    gender: "男児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    originalService: ["after-school"]
  },
  "A・M": {
    name: "A・M",
    age: 11,
    gender: "女児",
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    originalService: ["after-school"]
  },
  // Group homeやhome-care のサンプルユーザーも追加（18歳以上）
  // グループホーム 5名
  "G・H1": {
    name: "G・H1",
    age: 25,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害",
    medicalCare: "なし",
    originalService: ["group-home"]
  },
  "G・H2": {
    name: "G・H2",
    age: 28,
    gender: "女性", 
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害",
    medicalCare: "なし",
    originalService: ["group-home"]
  },
  "G・H3": {
    name: "G・H3",
    age: 30,
    gender: "男性",
    careLevel: "全介助", 
    condition: "脳性麻痺、知的障害",
    medicalCare: "なし",
    originalService: ["group-home"]
  },
  "G・H4": {
    name: "G・H4",
    age: 26,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害", 
    medicalCare: "なし",
    originalService: ["group-home"]
  },
  "G・H5": {
    name: "G・H5",
    age: 29,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害",
    medicalCare: "なし", 
    originalService: ["group-home"]
  },
  // 重度訪問介護のユーザーを追加（18歳以上）
  // 重度訪問介護 5名
  "H・C1": {
    name: "H・C1",
    age: 27,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、重度知的障害、てんかん",
    medicalCare: "気管切開、人工呼吸器、吸引",
    originalService: ["home-care"]
  },
  "H・C2": {
    name: "H・C2",
    age: 31,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、重度知的障害",
    medicalCare: "胃ろう注入、吸引",
    originalService: ["home-care"]
  },
  "H・C3": {
    name: "H・C3",
    age: 24,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、重度知的障害、てんかん",
    medicalCare: "人工呼吸器、吸引、吸入",
    originalService: ["home-care"]
  },
  "H・C4": {
    name: "H・C4",
    age: 28,
    gender: "女性",
    careLevel: "全介助",
    condition: "脳性麻痺、重度知的障害",
    medicalCare: "気管切開、吸引",
    originalService: ["home-care"]
  },
  "H・C5": {
    name: "H・C5",
    age: 33,
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、重度知的障害、てんかん",
    medicalCare: "胃ろう注入、人工呼吸器、吸引",
    originalService: ["home-care"]
  }
};

// 年齢ベースでサービスを自動配置したユーザーデータ
const processedUserDetails: Record<string, UserDetail> = {};
for (const [userId, rawUser] of Object.entries(rawUserDetails)) {
  processedUserDetails[userId] = {
    name: rawUser.name,
    age: rawUser.age,
    gender: rawUser.gender,
    careLevel: rawUser.careLevel,
    condition: rawUser.condition,
    medicalCare: rawUser.medicalCare,
    service: rawUser.originalService ?? [], // originalServiceを保持
  };
}

// 年齢ベースの配置を適用（既存サービスを考慮）
export const userDetails = updateAllUserServices(processedUserDetails);

// 後方互換性のためのヘルパー
export function getUsersForService(serviceId: string): Record<string, UserDetail> {
  const result: Record<string, UserDetail> = {};
  for (const [userId, user] of Object.entries(userDetails)) {
    if (user.service.includes(serviceId as any)) {
      result[userId] = user;
    }
  }
  return result;
}