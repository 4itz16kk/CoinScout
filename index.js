require('dotenv').config()
const { Client, GatewayIntentBits } = require('discord.js')
const fetch = require('node-fetch')
const fs = require('fs')

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const portfolioFile = './portfolio.json'
const settingsFile = './settings.json'

const coinMap = {
  btc: 'bitcoin', eth: 'ethereum', ada: 'cardano', doge: 'dogecoin', bnb: 'binancecoin',
  usdc: 'usd-coin', usdt: 'tether', wld: 'worldcoin', xrp: 'ripple', sol: 'solana', sui: 'sui'
}

function getCurrency() {
  try {
    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf-8'))
    return settings.currency?.toLowerCase() || 'usd'
  } catch {
    return 'usd'
  }
}

client.once('ready', () => {
  console.log(`✅ Bot 已上線：${client.user.tag}`)
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return

  const name = interaction.options.getString('name')?.toLowerCase()
  const coin = interaction.options.getString('coin')?.toLowerCase()
  const amount = interaction.options.getNumber('amount')
  const newCurrency = interaction.options.getString('currency')?.toLowerCase()
  const currency = getCurrency()

  if (interaction.commandName === 'money') {
    const coinId = coinMap[coin]
    if (!coinId) {
      return interaction.reply({ embeds: [{
        title: '錯誤',
        description: `❌ 不支援的幣種：${coin}\n可查詢：${Object.keys(coinMap).join(', ')}`,
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }] })
    }
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${currency}`)
      const data = await res.json()
      const price = data[coinId]?.[currency]
      if (!price) throw new Error()
      await interaction.reply({ embeds: [{
        title: `💱 ${coin.toUpperCase()} 價格`,
        description: `目前價格為：**${price.toLocaleString()} ${currency.toUpperCase()}**`,
        color: 0x00ff00,
        timestamp: new Date().toISOString()
      }] })
    } catch (e) {
      console.error(e)
      await interaction.reply({ embeds: [{
        title: '查詢錯誤',
        description: '❌ 查詢失敗，請稍後再試',
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }] })
    }
  }

  else if (interaction.commandName === 'total') {
    try {
      if (!fs.existsSync(portfolioFile)) return interaction.reply({ embeds: [{
        title: '錯誤',
        description: '❌ 找不到資產資料檔案',
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }] })

      const portfolio = JSON.parse(fs.readFileSync(portfolioFile, 'utf-8'))
      const userData = portfolio[name]

      if (!userData) return interaction.reply({ embeds: [{
        title: '錯誤',
        description: `⚠️ 找不到使用者 ${name} 的資產資料`,
        color: 0xff9900,
        timestamp: new Date().toISOString()
      }] })

      const ids = Object.keys(userData).map(key => coinMap[key]).filter(Boolean).join(',')
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${currency}`)
      const data = await res.json()

      let total = 0
      const lines = []

      for (const [symbol, amt] of Object.entries(userData)) {
        const id = coinMap[symbol]
        const price = data[id]?.[currency]
        if (price) {
          const value = price * amt
          total += value
          lines.push(`${symbol.toUpperCase()}: ${amt} × ${price.toLocaleString()} = ${value.toLocaleString()} ${currency.toUpperCase()}`)
        } else {
          lines.push(`${symbol.toUpperCase()}: ❌ 查無價格`)
        }
      }

      lines.push(`\n💰 ${name} 的總資產價值：**${total.toLocaleString()} ${currency.toUpperCase()}**`)
      await interaction.reply({ embeds: [{
        title: `📊 ${name} 的資產總價值`,
        description: lines.join('\n'),
        color: 0x0099ff,
        timestamp: new Date().toISOString()
      }] })
    } catch (e) {
      console.error(e)
      await interaction.reply({ embeds: [{
        title: '錯誤',
        description: '❌ 查詢過程中發生錯誤',
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }] })
    }
  }

  else if (interaction.commandName === 'set') {
    if (!coinMap[coin]) {
      return interaction.reply({ embeds: [{
        title: '錯誤',
        description: `❌ 不支援的幣種：${coin}`,
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }] })
    }
    try {
      let data = {}
      if (fs.existsSync(portfolioFile)) {
        data = JSON.parse(fs.readFileSync(portfolioFile, 'utf-8'))
      }
      if (!data[name]) data[name] = {}
      data[name][coin] = amount

      fs.writeFileSync(portfolioFile, JSON.stringify(data, null, 2))
      await interaction.reply({ embeds: [{
        title: '✅ 設定成功',
        description: `已設定 ${name} 的 ${coin.toUpperCase()} 為 ${amount}`,
        color: 0x00cc99,
        timestamp: new Date().toISOString()
      }] })
    } catch (e) {
      console.error(e)
      await interaction.reply({ embeds: [{
        title: '錯誤',
        description: '❌ 寫入資料時發生錯誤',
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }] })
    }
  }

  else if (interaction.commandName === 'remove') {
    try {
      if (!fs.existsSync(portfolioFile)) {
        return interaction.reply({ embeds: [{
          title: '錯誤',
          description: '❌ 找不到資料檔案',
          color: 0xff0000,
          timestamp: new Date().toISOString()
        }] })
      }
      const data = JSON.parse(fs.readFileSync(portfolioFile, 'utf-8'))
      if (!data[name]) {
        return interaction.reply({ embeds: [{
          title: '錯誤',
          description: `⚠️ 使用者 ${name} 不存在，無法刪除`,
          color: 0xff9900,
          timestamp: new Date().toISOString()
        }] })
      }
      delete data[name]
      fs.writeFileSync(portfolioFile, JSON.stringify(data, null, 2))
      await interaction.reply({ embeds: [{
        title: '🗑️ 刪除成功',
        description: `已刪除 ${name} 的資產資料`,
        color: 0xcc0000,
        timestamp: new Date().toISOString()
      }] })
    } catch (e) {
      console.error(e)
      await interaction.reply({ embeds: [{
        title: '錯誤',
        description: '❌ 刪除過程中發生錯誤',
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }] })
    }
  }

  else if (interaction.commandName === 'setcurrency') {
    try {
      const settings = { currency: newCurrency }
      fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2))
      await interaction.reply({ embeds: [{
        title: '✅ 幣別設定成功',
        description: `查詢幣別已設定為：${newCurrency.toUpperCase()}`,
        color: 0x33cc33,
        timestamp: new Date().toISOString()
      }] })
    } catch (e) {
      console.error(e)
      await interaction.reply({ embeds: [{
        title: '錯誤',
        description: '❌ 設定幣別時發生錯誤',
        color: 0xff0000,
        timestamp: new Date().toISOString()
      }] })
    }
  }
})

client.login(process.env.DISCORD_TOKEN)
