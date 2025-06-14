const { REST, Routes, SlashCommandBuilder } = require('discord.js')
require('dotenv').config()

const commands = [
  // /money 指令
  new SlashCommandBuilder()
    .setName('money')
    .setDescription('查詢幣價')
    .addStringOption(option =>
      option.setName('coin')
        .setDescription('幣種縮寫（如 btc, eth, doge）')
        .setRequired(true)
    ),

  // /total 指令
  new SlashCommandBuilder()
    .setName('total')
    .setDescription('查詢使用者的資產總價值')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('使用者名稱（如 lin, andy）')
        .setRequired(true)
    ),

  // /set 指令
  new SlashCommandBuilder()
    .setName('set')
    .setDescription('設定某使用者的某幣種持有數量')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('使用者名稱')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('coin')
        .setDescription('幣種縮寫（如 btc, eth）')
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName('amount')
        .setDescription('持有數量')
        .setRequired(true)
    ),

  // /remove 指令
  new SlashCommandBuilder()
    .setName('remove')
    .setDescription('刪除某位使用者的全部資產紀錄')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('使用者名稱（如 lin, andy）')
        .setRequired(true)
    ),

  // /setcurrency 指令
  new SlashCommandBuilder()
    .setName('setcurrency')
    .setDescription('設定顯示幣價的幣別（如 usd, twd, jpy）')
    .addStringOption(option =>
      option.setName('currency')
        .setDescription('幣別代碼（CoinGecko 支援的代碼）')
        .setRequired(true)
    )
].map(command => command.toJSON())

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

;(async () => {
  try {
    console.log('⌛ 開始註冊 Slash 指令...')
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    )
    console.log('✅ 指令註冊完成（全域，約需 1 小時才會出現在指令列表）')
  } catch (error) {
    console.error('❌ 註冊失敗：', error)
  }
})()
