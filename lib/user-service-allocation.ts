/**
 * 年齢ベースの自動サービス配置ロジック
 */

export type ServiceType = "life-care" | "after-school" | "day-support" | "group-home" | "home-care";

export interface UserDetail {
  name: string;
  age: number;
  gender: string;
  careLevel: string; // 介護度（全介助など）
  condition: string; // 基礎疾患一覧
  medicalCare: string; // 医療ケア詳細
  handbook?: string; // 療育手帳等
  assist?: string; // 介助状況
  disabilityType?: string; // 障害種別（区分）
  defaultMainStaffId?: string | null
  defaultSubStaffId?: string | null
  defaultServiceStartTime?: string | null
  defaultServiceEndTime?: string | null
  defaultTotalServiceTimeSlot?: string | null
  defaultDaytimeSupportMorningStart?: string | null
  defaultDaytimeSupportMorningEnd?: string | null
  defaultDaytimeSupportAfternoonStart?: string | null
  defaultDaytimeSupportAfternoonEnd?: string | null
  service: ServiceType[];
}

/**
 * 年齢に基づいてサービスを自動配置する
 * ルール:
 * - 18歳未満: after-school (放課後等デイサービス)
 * - 18歳以上: life-care (生活介護)
 * - 全員: day-support (日中一時支援) に追加
 * - group-home, home-care: 18歳以上のみ
 */
export function calculateServicesForUser(age: number, existingServices: ServiceType[] = []): ServiceType[] {
  const services: ServiceType[] = [];

  // 年齢ベースの基本配置
  if (age >= 18) {
    // グループホーム / 重度訪問介護利用者は生活介護に重複させない
    if (!existingServices.includes("group-home") && !existingServices.includes("home-care")) {
      services.push("life-care");
    }
  } else {
    services.push("after-school");
  }

  // 全員が利用可能
  services.push("day-support");

  // 18歳以上のみのサービス（既存サービス継続）
  if (age >= 18) {
    if (existingServices.includes("group-home")) {
      services.push("group-home");
    }
    if (existingServices.includes("home-care")) {
      services.push("home-care");
    }
  }

  return services;
}

/**
 * 指定されたサービスタイプに適合するユーザーをフィルタする
 */
export function filterUsersByService(users: Record<string, UserDetail>, serviceId: ServiceType): Array<[string, UserDetail]> {
  return Object.entries(users).filter(([_, user]) => {
    // 年齢ベースの動的計算
    const allowedServices = calculateServicesForUser(user.age, user.service);
    return allowedServices.includes(serviceId);
  });
}

/**
 * 全ユーザーのサービス配置を年齢ベースで更新
 */
export function updateAllUserServices(users: Record<string, UserDetail>): Record<string, UserDetail> {
  const updatedUsers: Record<string, UserDetail> = {};
  
  for (const [userId, user] of Object.entries(users)) {
    updatedUsers[userId] = {
      ...user,
      service: calculateServicesForUser(user.age, user.service),
    };
  }
  
  return updatedUsers;
}

/**
 * サービス名とアイコンを取得
 */
export const serviceConfig: { [key in ServiceType]: { name: string; icon: string; color: string } } = {
  "life-care": { name: "生活介護", icon: "🏥", color: "bg-blue-50" },
  "after-school": { name: "放課後等デイサービス", icon: "🎓", color: "bg-green-50" },
  "day-support": { name: "日中一時支援", icon: "⏰", color: "bg-orange-50" },
  "group-home": { name: "グループホーム", icon: "🏠", color: "bg-purple-50" },
  "home-care": { name: "重度訪問介護", icon: "🚑", color: "bg-red-50" },
};
