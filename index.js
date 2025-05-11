// Discord Anti-Spam Bot na may Whitelist
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Initialize new Discord client with proper intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel]
});

// Whitelist ng mga links na hindi dapat i-delete
const WHITELISTED_LINKS = [
  'https://tgreward.shop/pinaysecret.php',
  'https://t.me/vlpcontentbot?startapp=product'
];

// Stats counter
let statsCounter = {
  messagesChecked: 0,
  messagesDeleted: 0,
  lastReset: new Date()
};

// Event kapag ready na ang bot
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('Anti-spam protection is now active!');
  
  // Set bot status - updated to use the new format
  client.user.setActivity('Protecting the server', { type: 'Watching' });
});

// Event kapag may bagong mensahe
client.on('messageCreate', async (message) => {
  // Ignore messages from the bot itself
  if (message.author.bot) return;
  
  // Increment messages checked counter
  statsCounter.messagesChecked++;
  
  // Check if message contains links (basic URL check)
  const messageContent = message.content.toLowerCase();
  const containsLink = messageContent.includes('http://') || messageContent.includes('https://');
  
  if (containsLink) {
    // Check if message contains whitelisted links
    const containsWhitelistedLink = WHITELISTED_LINKS.some(link => 
      messageContent.includes(link.toLowerCase())
    );
    
    // Kung may link pero hindi whitelisted, i-delete ang message
    if (!containsWhitelistedLink) {
      try {
        await message.delete();
        statsCounter.messagesDeleted++;
        console.log(`Deleted message from ${message.author.tag} containing prohibited link`);
        
        // Mag-send ng warning sa user
        try {
          const warningEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚠️ Message Deleted')
            .setDescription('Ang iyong mensahe ay na-delete dahil naglalaman ito ng hindi pinapayagang link.')
            .addFields(
              { name: 'Bakit?', value: 'Para maprotektahan ang server mula sa spam at phishing links.' },
              { name: 'Paano maiwasan?', value: 'Huwag mag-post ng links maliban sa mga approved sources.' }
            )
            .setTimestamp();
            
          await message.author.send({ embeds: [warningEmbed] });
        } catch (err) {
          console.log(`Could not send DM to ${message.author.tag}`);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  }
});

// Command handler para sa stats at admin commands
client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!') || message.author.bot) return;
  
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  
  // Check if user has admin permissions for admin commands - updated to use new permissions format
  const isAdmin = message.member && message.member.permissions.has(PermissionFlagsBits.Administrator);
  
  if (command === 'stats' && isAdmin) {
    const uptime = Math.floor((new Date() - statsCounter.lastReset) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    
    const statsEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('Anti-Spam Bot Stats')
      .addFields(
        { name: 'Messages Checked', value: statsCounter.messagesChecked.toString() },
        { name: 'Messages Deleted', value: statsCounter.messagesDeleted.toString() },
        { name: 'Uptime', value: `${hours}h ${minutes}m ${seconds}s` }
      )
      .setTimestamp();
      
    await message.channel.send({ embeds: [statsEmbed] });
  } else if (command === 'resetstats' && isAdmin) {
    statsCounter.messagesChecked = 0;
    statsCounter.messagesDeleted = 0;
    statsCounter.lastReset = new Date();
    await message.channel.send('✅ Stats have been reset.');
  } else if (command === 'whitelist' && isAdmin) {
    const whitelistEmbed = new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('Whitelisted Links')
      .setDescription('Ang mga sumusunod na links ay pinapayagang i-post sa server:')
      .addFields(
        WHITELISTED_LINKS.map((link, index) => ({
          name: `Link #${index + 1}`,
          value: link
        }))
      )
      .setTimestamp();
      
    await message.channel.send({ embeds: [whitelistEmbed] });
  } else if (command === 'help' && isAdmin) {
    const helpEmbed = new EmbedBuilder()
      .setColor('#ffcc00')
      .setTitle('Anti-Spam Bot Commands')
      .addFields(
        { name: '!stats', value: 'Ipakita ang bot statistics' },
        { name: '!resetstats', value: 'I-reset ang bot statistics' },
        { name: '!whitelist', value: 'Ipakita ang mga whitelisted links' },
        { name: '!help', value: 'Ipakita ang help message na ito' }
      )
      .setFooter({ text: 'Admin commands only' });
      
    await message.channel.send({ embeds: [helpEmbed] });
  }
});

// Handle errors
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login sa Discord gamit ang token
client.login(process.env.DISCORD_TOKEN);
