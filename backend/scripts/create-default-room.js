const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function createDefaultRoom() {
  try {
    console.log('創建預設房間...');

    // 檢查是否已存在預設房間
    const existingRoom = await prisma.room.findFirst({
      where: { name: '預設房間' }
    });

    if (existingRoom) {
      console.log(`✓ 預設房間已存在: ${existingRoom.id}`);
      return existingRoom.id;
    }

    // 創建預設房間
    const room = await prisma.room.create({
      data: {
        name: '預設房間',
        status: 'active',
        theme: {
          textColor: '#ffffff',
          speed: 'normal',
          lanes: 5,
          fontFamily: 'Arial'
        }
      }
    });

    console.log(`✓ 已創建預設房間: ${room.id}`);
    console.log(`房間名稱: ${room.name}`);
    console.log(`狀態: ${room.status}`);

    return room.id;

  } catch (error) {
    console.error('創建預設房間時發生錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultRoom();
