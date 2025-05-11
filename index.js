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

// Improved URL detection regex
const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

// Stats counter
let statsCounter = {
  messagesChecked: 0,
  messagesDeleted: 0,
  lastReset: new Date()
};

// Debug mode for troubleshooting (set to true to enable console logs)
const DEBUG_MODE = true;

// Function to log debug messages
function debugLog(message) {
  if (DEBUG_MODE) {
    console.log(`[DEBUG] ${message}`);
  }
}

// Event kapag ready na ang bot
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log('Anti-spam protection is now active!');
  
  // Set bot status - updated to use the new format
  client.user.setActivity('Protecting the server', { type: 'Watching' });
});

// Helper function to check if a link is whitelisted
function isLinkWhitelisted(link) {
  return WHITELISTED_LINKS.some(whitelistedLink => 
    link.toLowerCase().includes(whitelistedLink.toLowerCase())
  );
}

// Event kapag may bagong mensahe
client.on('messageCreate', async (message) => {
  // Ignore messages from the bot itself
  if (message.author.bot) return;
  
  // Increment messages checked counter
  statsCounter.messagesChecked++;
  
  // Get the message content
  const messageContent = message.content;
  
  debugLog(`Checking message: ${messageContent}`);
  
  // Check if message contains links using regex
  const links = messageContent.match(URL_REGEX);
  
  if (links && links.length > 0) {
    debugLog(`Found ${links.length} links in the message`);
    
    // Check if any of the found links are not whitelisted
    const hasNonWhitelistedLink = links.some(link => !isLinkWhitelisted(link));
    
    if (hasNonWhitelistedLink) {
      try {
        debugLog(`Deleting message from ${message.author.tag} containing non-whitelisted link`);
        await message.delete();
        statsCounter.messagesDeleted++;
        console.log(`Deleted message from ${message.author.tag} containing prohibited link`);
        
        // Debug output all links found
        links.forEach((link, index) => {
          debugLog(`Link ${index + 1}: ${link} - Whitelisted: ${isLinkWhitelisted(link)}`);
        });
        
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
          console.log(`Could not send DM to ${message.author.tag}: ${err.message}`);
        }
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    } else {
      debugLog('Message contains only whitelisted links - not deleting');
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
        { name: '!help', value: 'Ipakita ang help message na ito' },
        { name: '!debug', value: 'I-toggle ang debug mode' }
      )
      .setFooter({ text: 'Admin commands only' });
      
    await message.channel.send({ embeds: [helpEmbed] });
  } else if (command === 'debug' && isAdmin) {
    // Toggle debug mode
    DEBUG_MODE = !DEBUG_MODE;
    await message.channel.send(`✅ Debug mode is now ${DEBUG_MODE ? 'ON' : 'OFF'}.`);
  } else if (command === 'testlinks' && isAdmin) {
    // For testing link detection
    const testLinks = [
      'https://discord.com',
      'http://example.com',
      'www.google.com',
      'https://tgreward.shop/pinaysecret.php'
    ];
    
    const testEmbed = new EmbedBuilder()
      .setColor('#ff00ff')
      .setTitle('Link Detection Test')
      .setDescription('Testing link detection with the following links:');
      
    testLinks.forEach((link, index) => {
      testEmbed.addFields({
        name: `Link #${index + 1}: ${link}`,
        value: `Detected as link: ${URL_REGEX.test(link)}\nWhitelisted: ${isLinkWhitelisted(link)}`
      });
      // Reset regex
      URL_REGEX.lastIndex = 0;
    });
    
    await message.channel.send({ embeds: [testEmbed] });
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
