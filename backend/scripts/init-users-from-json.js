const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient()

async function initAllowlistUsers() {
  try {
    console.log('‹ËËA1{e„(®...')
    
    // ž°ƒŠx€Ö(®
    const allowlistUsersJson = process.env.ALLOWLIST_USERS_JSON
    
    if (!allowlistUsersJson) {
      console.error('*~0 ALLOWLIST_USERS_JSON °ƒŠx')
      process.exit(1)
    }

    const users = JSON.parse(allowlistUsersJson)
    console.log(`€Ö0 ${users.length} (`)

    // zþ	„ allowlist_users h<
    await prisma.allowlistUser.deleteMany()
    console.log('òzþ	„(®')

    // Òe°„(
    for (const user of users) {
      await prisma.allowlistUser.create({
        data: {
          email: user.email.toLowerCase(),
          name: user.name,
          nickname: user.nickname || null,
          role: user.role || 'audience'
        }
      })
      console.log(`ò°ž(: ${user.email} (${user.role})`)
    }

    console.log(' (®ËŒ')

  } catch (error) {
    console.error('L Ë1W:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// ‚œô¥÷Ld”HGKLË
if (require.main === module) {
  initAllowlistUsers()
}

module.exports = { initAllowlistUsers }