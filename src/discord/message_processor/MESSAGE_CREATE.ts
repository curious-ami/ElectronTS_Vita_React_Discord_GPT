import {config} from "./../config.js";
import {T_MESSAGE_CREATE} from "./types/T_MESSAGE_CREATE.js";
//import {get_random_anime_3_G} from './../functions/send_apn.js';

//import {push_html_message} from "./form_html_message.js";
//import {save_message} from "./IndexedDB.js";



export function MESSAGE_CREATE (message: T_MESSAGE_CREATE){
    console.log(message);
    if(message.author?.bot == true) return;
    //push_html_message(message);
    let co = compress_message(message)
    //if( message.guild_id == "771426188408520704"||message.guild_id == "796466036588150815") save_message(message);
    //if( message.d.guild_id == "771426188408520704") await globalThis.storage.w_storage({method: "write", path: `message_storage/${new Date(Number((BigInt(message.d.id) >> 22n) + 1420070400000n)).toLocaleDateString('ru')}/${message.d.id}.json`, data: message.d});

    if (message.content.match(/^!бот аниме\s?$/)!=null){
        //get_random_anime_3_G (message.channel_id)
    }
    if (message.content.match(/^!хай\s?$/)!=null){
        console.log(document.body);
        
        fetch(`https://discord.com/api/v9/channels/${message.channel_id}/messages`, {
        "headers": {
            "authorization": config.my_token,
            "content-type": "application/json"
        },
        "body": JSON.stringify({content: "хай"}),
        "method": "POST"
        });
    }
    
}
export function compress_message(message : T_MESSAGE_CREATE){
    let c_message = {
      type: message.type,
      id: message.id,
      channel_id: message.channel_id,
      guild_id: message.guild_id,
      content: message.content,
      author: {
        id: message.author.id,
        username: (message.member.nick == null)?(message.author.global_name == null)?message.author.username:message.author.global_name:message.member.nick,
        avatar: (message.member.avatar == null)?message.author.avatar:message.member.avatar,
      },
      attachments: message.attachments,
      message_reference: (message.referenced_message != null)?{message_id: message.message_reference?.message_id}:null,
      referenced_message: (message.referenced_message != null)?{
        content: message.referenced_message.content.slice(0,100),
        author: {id: message.referenced_message.author.id}
      }:null
    };
    
    return c_message;
  }