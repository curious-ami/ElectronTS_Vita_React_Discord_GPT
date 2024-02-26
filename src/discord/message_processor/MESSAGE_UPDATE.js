import {config} from "./../config.js";
import {my_fetch} from "./../Functions/sys_functions.js";
import {five_min_store, read_write_IDB, compress_message} from "./IndexedDB.js";

export async function MESSAGE_UPDATE (updeted_message){
    if(updeted_message.author?.bot == true) return;
    if(updeted_message.embeds?.length !=0) return;
    console.log("updeted_message",updeted_message);
    updeted_message = compress_message(updeted_message);

    const message_date = new Date(Number((BigInt(updeted_message.id) >> 22n) + 1420070400000n));
    const divided_day_time = Math.floor((message_date - new Date(message_date).setHours(0, 0, 0, 0))/(1000*60*1));
    const idb_name = "save_"+(new Date(message_date).toLocaleDateString('ru'));
    let save_message;
    let embed_color = 16766976;
    for (let i = 0; i < five_min_store.length; i++) {
        if(updeted_message.guild_id == five_min_store[i].id){
            if (divided_day_time !== five_min_store[i].last) break;
            for (let j = 0; j < five_min_store[i].messages.length; j++) {
                if (five_min_store[i].messages[j].id == updeted_message.id){
                    save_message = five_min_store[i].messages[j];
                    console.log("ОЗУ up", save_message);
                    if (five_min_store[i].messages[j].content === updeted_message.content&&five_min_store[i].messages[j].attachments.length == updeted_message.attachments.length) return;
                    five_min_store[i].messages[j] = updeted_message;
                    break;
                }
            }
        }
    }
    
    if (save_message === undefined){
        let IDB_save_messages = await read_write_IDB(idb_name, updeted_message.guild_id, divided_day_time, "read");
        if (IDB_save_messages != undefined){
            for (let i = 0; i < IDB_save_messages.length; i++) {
                //const IDB_save_message = IDB_save_messages[i];
                if (IDB_save_messages[i].id == updeted_message.id){
                    save_message = IDB_save_messages[i];
                    console.log("IDB up", save_message);
                    (IDB_save_messages[i].changed == undefined)?updeted_message.changed = 1:updeted_message.changed = IDB_save_messages[i].changed+1;
                    IDB_save_messages[i] = updeted_message;
                    embed_color = 16738816
                    break;
                }
            }
           
        }
        read_write_IDB(idb_name, updeted_message.guild_id, divided_day_time, "write", IDB_save_messages);
        
    }
    let form_data = new FormData();
    if (save_message !== undefined){
        let payload = { "content": ``,"attachments": []};
        payload.content = save_message.content;
        payload.allowed_mentions = { "parse": [], "replied_user": false};
        payload.username = save_message.author.username;//(save_message.member.nick == null)?(save_message.author.global_name == null)?save_message.author.username:save_message.author.global_name:save_message.member.nick;
        payload.avatar_url = `https://cdn.discordapp.com/avatars/${save_message.author.id}/${save_message.author.avatar}.webp?size=128`;
        
        payload.embeds = [{
            color: embed_color,
            title: "Информация о сообщении:",
            description: 
            `Автор: <@${save_message.author.id}>
            Канал: https://discord.com/channels/${save_message.guild_id}/${save_message.channel_id}
            Cоздано: <t:${Math.round(message_date.getTime()/1000)}:f>`
        }];
        if(save_message.referenced_message !=null){
            if(save_message.referenced_message.content === "") payload.embeds[0].description += `\nCсылается на: https://discord.com/channels/${save_message.message_reference.guild_id}/${save_message.message_reference.channel_id}/${save_message.message_reference.message_id}`;
            else payload.embeds[0].description += `\nCсылается на: <@${save_message.referenced_message.author.id}> [${save_message.referenced_message.content.slice(0,50)}](https://discord.com/channels/${save_message.guild_id}/${save_message.channel_id}/${save_message.message_reference.message_id})`;
            
        }
        form_data.append("payload_json", JSON.stringify(payload));

        for (let i = 0; i< save_message.attachments.length; i++) {
            let image_blob = await fetch(save_message.attachments[i].url).then(res => res.blob());
            form_data.append(`files[${i}]`, image_blob, `delete_attachment.${image_blob.type.slice(image_blob.type.indexOf("/")+1)}`); 
        }
        }
        else{
            let payload = { 
                "content": ``,
                "attachments": [],
                username: updeted_message.id,
                embeds: [{
                    color: 12865024,
                    title: "Информация о сообщении:",
                    description: 
                    `Изменено сообщение, которое не было сохраненно в памяти.
                    Канал: https://discord.com/channels/${updeted_message.guild_id}/${updeted_message.channel_id}
                    Cоздано: <t:${Math.round(message_date.getTime()/1000)}:f>`
                }]
            };
            form_data.append("payload_json", JSON.stringify(payload));

        }
        
        //<t:1693093740:f>
        
        let webhook_token = "https://discord.com/api/webhooks/1091758813218099201/Ci55Lp8FlV8HtUx_rgYTbyqoor8JcgN2RvYyY7d1bDfKVQUVPHsOxGOGlHpP2kAlWrFx";//"1091758813218099201/Ci55Lp8FlV8HtUx_rgYTbyqoor8JcgN2RvYyY7d1bDfKVQUVPHsOxGOGlHpP2kAlWrFx";
        let main_message = await my_fetch(`${webhook_token}?wait=true`,
        {
            method: 'post',    
            body: form_data 
        }).then(res=>res.json()); 
}