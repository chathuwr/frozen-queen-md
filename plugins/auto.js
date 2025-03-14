const fs = require('fs');
const path = require('path');
const config = require('../config')
const {cmd , commands} = require('../command')

//auto_voice
cmd({
  on: "body"
},    
async (robin, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../data/autovoice.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
       
            if (config.AUTO_VOICE === 'true') {
                //if (isOwner) return;        
                await robin.sendPresenceUpdate('recording', from);
                await robin.sendMessage(from, { audio: { url: data[text] }, mimetype: 'audio/mpeg', ptt: true }, { quoted: mek });
            }
        }
    }                
});

//auto sticker 
cmd({
  on: "body"
},    
async (robin, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../data/autosticker.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
           
            if (config.AUTO_STICKER === 'true') {
                //if (isOwner) return;        
                await robin.sendMessage(from,{sticker: { url : data[text]},package: '❄️Frozen Queen❄️'},{ quoted: mek })   
            
            }
        }
    }                
});

//auto reply 
cmd({
  on: "body"
},    
async (robin, mek, m, { from, body, isOwner }) => {
    const filePath = path.join(__dirname, '../data/autoreply.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
   
            if (config.AUTO_REPLY === 'true') {
                //if (isOwner) return;        
                await m.reply(data[text])
            
            }
        }
    }                
});                  

//auto status 

cmd({
  on: "statusUpdate"
},    
async (robin, mek, m, { from, isOwner, body }) => {
    console.log("Status update event triggered");

    if (config.AUTO_REPLY_STATUS === 'true') {
        console.log(`Status update from: ${from}`);

        // Check if status content is available
        if (body) {
            console.log(`Status content: ${body}`);
        } else {
            console.log("No status content received.");
        }
        
        const voiceMessageUrl = 'https://github.com/chathurahansaka1/help/raw/refs/heads/main/audio/WhatsApp%20Audio%202025-03-12%20at%2010.47.06%20AM.mpeg';

        await robin.sendPresenceUpdate('recording', from);

        await robin.sendMessage(from, { 
            audio: { url: voiceMessageUrl }, 
            mimetype: 'audio/mpeg', 
            ptt: true 
        });

        console.log("Voice message sent");
    } else {
        console.log("Auto-reply status is false");
    }
});
