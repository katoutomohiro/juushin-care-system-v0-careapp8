/**
 * ユーザーのサービス配置を検証するスクリプト
 */

import { userDetails } from '../lib/user-master-data';
import { ServiceType } from '../lib/user-service-allocation';

// サービス別のユーザー数を集計
const serviceDistribution: Record<ServiceType, string[]> = {
  "life-care": [],
  "after-school": [],
  "day-support": [],
  "group-home": [],
  "home-care": []
};

// 年齢別の統計
const ageStats = {
  under18: [] as string[],
  over18: [] as string[]
};

for (const [userId, user] of Object.entries(userDetails)) {
  // 年齢統計
  if (user.age < 18) {
    ageStats.under18.push(userId);
  } else {
    ageStats.over18.push(userId);
  }
  
  // サービス別統計
  for (const service of user.service) {
    serviceDistribution[service].push(userId);
  }
}

console.log('=== ユーザーサービス配置検証 ===\n');

console.log('📊 年齢別統計:');
console.log(`  18歳未満: ${ageStats.under18.length}人`);
console.log(`  18歳以上: ${ageStats.over18.length}人`);
console.log(`  合計: ${ageStats.under18.length + ageStats.over18.length}人\n`);

console.log('📋 サービス別ユーザー数:');
for (const [service, users] of Object.entries(serviceDistribution)) {
  console.log(`  ${service}: ${users.length}人`);
}

console.log('\n🔍 詳細チェック:');

// 生活介護: 18歳以上全員
const lifeCareExpected = ageStats.over18.length;
const lifeCareActual = serviceDistribution["life-care"].length;
console.log(`  生活介護: ${lifeCareActual}人 / 期待値: ${lifeCareExpected}人 ${lifeCareActual === lifeCareExpected ? '✅' : '❌'}`);

// 放課後等デイサービス: 18歳未満全員
const afterSchoolExpected = ageStats.under18.length;
const afterSchoolActual = serviceDistribution["after-school"].length;
console.log(`  放課後等デイサービス: ${afterSchoolActual}人 / 期待値: ${afterSchoolExpected}人 ${afterSchoolActual === afterSchoolExpected ? '✅' : '❌'}`);

// 日中一時支援: 全員
const daySupportExpected = ageStats.under18.length + ageStats.over18.length;
const daySupportActual = serviceDistribution["day-support"].length;
console.log(`  日中一時支援: ${daySupportActual}人 / 期待値: ${daySupportExpected}人 ${daySupportActual === daySupportExpected ? '✅' : '❌'}`);

// グループホーム: 18歳以上で5人
const groupHomeActual = serviceDistribution["group-home"].length;
console.log(`  グループホーム: ${groupHomeActual}人 / 期待値: 5人 ${groupHomeActual === 5 ? '✅' : '❌'}`);

// 重度訪問介護: 18歳以上で5人
const homeCareActual = serviceDistribution["home-care"].length;
console.log(`  重度訪問介護: ${homeCareActual}人 / 期待値: 5人 ${homeCareActual === 5 ? '✅' : '❌'}`);

console.log('\n📝 サービス別ユーザー一覧:\n');

for (const [service, users] of Object.entries(serviceDistribution)) {
  console.log(`${service} (${users.length}人):`);
  users.forEach(userId => {
    const user = userDetails[userId];
    console.log(`  - ${userId} (${user.age}歳, ${user.gender})`);
  });
  console.log('');
}

// 検証エラーチェック
let hasErrors = false;

// 18歳未満がlife-careに含まれていないかチェック
for (const userId of ageStats.under18) {
  if (serviceDistribution["life-care"].includes(userId)) {
    console.error(`❌ エラー: ${userId} (${userDetails[userId].age}歳) が生活介護に含まれています`);
    hasErrors = true;
  }
}

// 18歳以上がafter-schoolに含まれていないかチェック
for (const userId of ageStats.over18) {
  if (serviceDistribution["after-school"].includes(userId)) {
    console.error(`❌ エラー: ${userId} (${userDetails[userId].age}歳) が放課後等デイサービスに含まれています`);
    hasErrors = true;
  }
}

// グループホームと重度訪問介護が18歳未満を含んでいないかチェック
for (const service of ["group-home", "home-care"] as ServiceType[]) {
  for (const userId of serviceDistribution[service]) {
    if (userDetails[userId].age < 18) {
      console.error(`❌ エラー: ${userId} (${userDetails[userId].age}歳) が${service}に含まれています`);
      hasErrors = true;
    }
  }
}

if (!hasErrors) {
  console.log('\n✅ すべての検証が成功しました！');
} else {
  console.log('\n❌ 検証エラーがあります。上記を確認してください。');
  process.exit(1);
}
