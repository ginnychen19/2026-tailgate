const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 讀取用戶資料
function readUsersFromJson() {
  const usersFilePath = path.join(__dirname, '..', 'config', 'users.json');
  
  if (!fs.existsSync(usersFilePath)) {
    console.error('❌ 找不到 users.json 檔案');
    return [];
  }

  const usersFileContent = fs.readFileSync(usersFilePath, 'utf8');
  return JSON.parse(usersFileContent);
}

// 寫入用戶資料到 JSON 檔案
function writeUsersToJson(users) {
  const usersFilePath = path.join(__dirname, '..', 'config', 'users.json');
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  console.log('✅ 已更新 users.json 檔案');
}

// 顯示所有用戶
async function listUsers() {
  console.log('\n📊 目前資料庫中的用戶:');
  const dbUsers = await prisma.allowlistUser.findMany();
  
  if (dbUsers.length === 0) {
    console.log('❌ 資料庫中沒有用戶');
    return;
  }

  dbUsers.forEach(user => {
    const roleIcon = user.role === 'admin' ? '👑' : '👤';
    console.log(`${roleIcon} ${user.email} (${user.name}) - ${user.role}`);
  });

  console.log('\n📋 JSON 檔案中的用戶:');
  const jsonUsers = readUsersFromJson();
  
  if (jsonUsers.length === 0) {
    console.log('❌ JSON 檔案中沒有用戶');
    return;
  }

  jsonUsers.forEach(user => {
    const roleIcon = user.role === 'admin' ? '👑' : '👤';
    console.log(`${roleIcon} ${user.email} (${user.name}) - ${user.role}`);
  });
}

// 添加用戶
async function addUser(email, name, nickname, role = 'audience') {
  try {
    // 檢查用戶是否已存在
    const existingUser = await prisma.allowlistUser.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`❌ 用戶 ${email} 已存在`);
      return;
    }

    // 添加到資料庫
    await prisma.allowlistUser.create({
      data: { email, name, nickname, role }
    });

    // 添加到 JSON 檔案
    const users = readUsersFromJson();
    users.push({ email, name, nickname, role });
    writeUsersToJson(users);

    console.log(`✅ 已添加用戶 ${email} (${name})`);
  } catch (error) {
    console.error('❌ 添加用戶時發生錯誤:', error.message);
  }
}

// 刪除用戶
async function removeUser(email) {
  try {
    // 從資料庫刪除
    await prisma.allowlistUser.delete({
      where: { email }
    });

    // 從 JSON 檔案刪除
    const users = readUsersFromJson();
    const filteredUsers = users.filter(user => user.email !== email);
    writeUsersToJson(filteredUsers);

    console.log(`✅ 已刪除用戶 ${email}`);
  } catch (error) {
    console.error('❌ 刪除用戶時發生錯誤:', error.message);
  }
}

// 主函數
async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'list':
      await listUsers();
      break;
    
    case 'add':
      if (args.length < 2) {
        console.log('用法: node manage-users.js add <email> <name> [nickname] [role]');
        console.log('範例: node manage-users.js add "user@example.com" "用戶名" "暱稱" "audience"');
        return;
      }
      const [email, name, nickname, role] = args;
      await addUser(email, name, nickname, role);
      break;
    
    case 'remove':
      if (args.length < 1) {
        console.log('用法: node manage-users.js remove <email>');
        console.log('範例: node manage-users.js remove "user@example.com"');
        return;
      }
      await removeUser(args[0]);
      break;
    
    default:
      console.log('📋 用戶管理工具');
      console.log('');
      console.log('用法:');
      console.log('  node manage-users.js list                    # 顯示所有用戶');
      console.log('  node manage-users.js add <email> <name> [nickname] [role]  # 添加用戶');
      console.log('  node manage-users.js remove <email>          # 刪除用戶');
      console.log('');
      console.log('範例:');
      console.log('  node manage-users.js list');
      console.log('  node manage-users.js add "user@example.com" "用戶名" "暱稱" "audience"');
      console.log('  node manage-users.js remove "user@example.com"');
  }

  await prisma.$disconnect();
}

main();
