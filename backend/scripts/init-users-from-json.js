const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function initAllowlistUsers() {
  try {
    console.log('���A1{e�(�...')
    
    // ����x��(�
    const allowlistUsersJson = process.env.ALLOWLIST_USERS_JSON
    
    if (!allowlistUsersJson) {
      console.error('*~0 ALLOWLIST_USERS_JSON ���x')
      process.exit(1)
    }

    const users = JSON.parse(allowlistUsersJson)
    console.log(`��0 ${users.length} (`)

    // z�	� allowlist_users h<
    await prisma.allowlistUser.deleteMany()
    console.log('�z�	�(�')

    // �e��(
    for (const user of users) {
      await prisma.allowlistUser.create({
        data: {
          email: user.email.toLowerCase(),
          name: user.name,
          nickname: user.nickname || null,
          role: user.role || 'audience'
        }
      })
      console.log(`�(: ${user.email} (${user.role})`)
    }

    console.log(' (���')

  } catch (error) {
    console.error('L �1W:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// �����Ld�HGKL�
if (require.main === module) {
  initAllowlistUsers()
}

module.exports = { initAllowlistUsers }