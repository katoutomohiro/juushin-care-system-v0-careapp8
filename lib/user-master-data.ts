/**
 * 統一されたユーザーマスターデータ
 * 両ファイルの情報を統合し、一元管理する
 */

import { UserDetail, updateAllUserServices } from "./user-service-allocation";

// 統合されたユーザーデータ（年齢ベースでサービス自動配置）
const rawUserDetails: Record<string, Omit<UserDetail, 'service'> & { originalService?: string[] }> = {
  "A・T": {
    name: "A・T",
    age: 36,
    gender: "男性", 
    careLevel: "全介助",
    condition: "脳性麻痺、てんかん、遠視性弱視、側湾症、両上下肢機能障害",
    medicalCare: "なし",
    originalService: ["life-care"]
  },
  "I・K": {
    name: "I・K",
    age: 47,
    gender: "女性",
    careLevel: "全介助", 
    condition: "脳性麻痺、側湾症、体幹四肢機能障害",
    medicalCare: "なし",
    originalService: ["life-care"]
  },
  "O・S": {
    name: "O・S",
    age: 42, // ユーザー詳細ページから統一
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", 
    medicalCare: "なし",
    originalService: ["life-care"]
  },
  "S・M": {
    name: "S・M",
    age: 38, // ユーザー詳細ページから統一
    gender: "女性", // ユーザー詳細ページから統一
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  "N・M": {
    name: "N・M", 
    age: 45, // ユーザー詳細ページから統一
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  "W・M": {
    name: "W・M",
    age: 51, // ユーザー詳細ページから統一
    gender: "男性", // ユーザー詳細ページから統一
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  "S・Y": {
    name: "S・Y",
    age: 39, // ユーザー詳細ページから統一
    gender: "女性",
    careLevel: "全介助", 
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  "Y・K": {
    name: "Y・K",
    age: 44, // ユーザー詳細ページから統一（サービスページでは22歳）
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  "I・K2": {
    name: "I・K",
    age: 35, // ユーザー詳細ページから統一（サービスページでは40歳）
    gender: "女性", // ユーザー詳細ページから統一
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  "O・M": {
    name: "O・M",
    age: 48, // ユーザー詳細ページから統一（サービスページでは23歳）
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一 
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  "U・S": {
    name: "U・S", 
    age: 41, // ユーザー詳細ページから統一（サービスページでは19歳）
    gender: "女性", // ユーザー詳細ページから統一
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  "I・T": {
    name: "I・T",
    age: 37, // ユーザー詳細ページから統一（サービスページでは24歳）
    gender: "男性",
    careLevel: "全介助",
    condition: "脳性麻痺、知的障害、てんかん、両上下肢機能障害", // ユーザー詳細ページから統一
    medicalCare: "なし", // ユーザー詳細ページから統一
    originalService: ["life-care"]
  },
  // サービスページにのみ存在する追加ユーザー（18歳未満も含む）
  "M・S": {
    name: "M・S",
    age: 18,
    gender: "男性",
    careLevel: "全介助",
    condition: "水頭症、脳原生上肢機能障害、脳原生上肢移動障害、側湾症",
    medicalCare: "なし",
    originalService: ["life-care"]
  },
  "M・O": {
    name: "M・O",
    age: 18,
    gender: "女性", 
    careLevel: "全介助",
    condition: "脳原生上肢機能障害、脳原生上肢移動障害",
    medicalCare: "胃ろう注入、吸引、IVH埋め込み",
    originalService: ["life-care"]
  },
  "M・I": {
    name: "M・I",
    age: 17, // 18歳未満 → after-school に自動配置
    gender: "男児",
    careLevel: "全介助",
    condition: "慢性肺疾患、先天性性疾患、染色体異常、脳の形成不全、抗てんかん",
    medicalCare: "鼻腔注入",
    originalService: ["life-care"]
  },
  "T・Y": {
    name: "T・Y", 
    age: 17, // 18歳未満 → after-school に自動配置
    gender: "男児",
    careLevel: "全介助", 
    condition: "脳原生上肢機能障害、脳原生上肢移動障害",
    medicalCare: "なし",
    originalService: ["life-care"]
  },
  // Group homeやhome-care のサンプルユーザーも追加（18歳以上）
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
    service: [], // 後で計算
  };
}

// 年齢ベースの配置を適用
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