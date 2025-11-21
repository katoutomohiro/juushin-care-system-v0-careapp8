export interface UserProfileDetail {
  age: number
  gender: string
  disabilityType?: string // 障害種別 / 区分
  condition?: string // 基礎疾患
  medicalCare?: string // 医療的ケア
  handbook?: string // 手帳等
  assist?: string // 介助状況
}

export function buildUserProfileFromUserDetail(detail: any): UserProfileDetail {
  return {
    age: detail.age,
    gender: detail.gender,
    disabilityType: detail.disabilityType,
    condition: detail.condition,
    medicalCare: detail.medicalCare,
    handbook: detail.handbook,
    assist: detail.assist ?? detail.careLevel,
  }
}
