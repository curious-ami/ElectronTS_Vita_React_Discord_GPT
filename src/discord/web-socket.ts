
//import './render.js';

import {config} from "./config.js";

import {MESSAGE_CREATE} from "./message_processor/MESSAGE_CREATE.js"
// import {MESSAGE_UPDATE} from "./discord_message_processor/MESSAGE_UPDATE.js"
// import {MESSAGE_DELETE} from "./discord_message_processor/MESSAGE_DELETE.js"
// import {get_READY} from "./discord_message_processor/get_READY.js"




let web_socket: WebSocket;
function startMyDisWebSock(){
  
  let discord_heartbeat_ms = 41250;
  web_socket = new WebSocket('wss://gateway.discord.gg/?encoding=json&v=9&compress=zlib-stream/');
  web_socket.onopen = ()=>{
    console.log('%c ВЕБ СОКЕТ ПОДКЛЮЧЕН', 'color: green;');
    web_socket.send(JSON.stringify({
        "op":2,
        "d":{
          "token": config.my_token,
          "capabilities":125,
          "properties":{"os":"Windows","browser":"Chrome","device":"","system_locale":"ru-RU","browser_user_agent":"Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4350.0 Iron Safari/537.36","browser_version":"","os_version":"7","referrer":"","referring_domain":"","referrer_current":"","referring_domain_current":"","release_channel":"stable","client_build_number":100054,"client_event_source":null},
          "presence":{
            "status":"online",
            "since":0,
            "activities":[{"name":"Custom Status","type":4,"state":"The oak tree where I met you","emoji":null}],
            "afk":false},
            "compress":false,"client_state":{"guild_hashes":{},"highest_last_message_id":"0","read_state_version":0,
            "user_guild_settings_version":-1}
          }
        }
    ));
  }

 
  web_socket.onmessage = function (message: MessageEvent) 
  {  
    //console.log(message)
    type Tdata = {
        t: string | null;
        s: number | null;
        op: number;
        d: any;
    };
   
    let data:Tdata = JSON.parse( message.data)  
    console.log("data", data);
    
    
    switch (data.t){
      case "MESSAGE_CREATE": MESSAGE_CREATE (data.d);
      break;
    //   case "MESSAGE_UPDATE": MESSAGE_UPDATE (data.d);
    //   break;
    //   case "MESSAGE_DELETE": MESSAGE_DELETE (data.d);
    //   break;
    //   case "READY": get_READY (data.d); 
    //   break;
    }  




    if(data.op === 10) {
        
        console.log(data.d.heartbeat_interval);
        discord_heartbeat_ms = data.d.heartbeat_interval;
        web_socket.send(JSON.stringify({"op":1,"d": 251}));
    }
    if(data.op === 11){
        setTimeout (()=>{
            
            web_socket.send(JSON.stringify({"op":1,"d": 251}));
        }, discord_heartbeat_ms)
    }

  }
  web_socket.onclose = function() {
    console.warn(`ВЕБ СОКЕТ ВЫРУБИЛО, дата: [${new Date()}]\nПЕРЕПОДКЛЮЧАЮСЬ....`);
    setTimeout(()=> {
      startMyDisWebSock()
    }, 2000);
    
  };

  

}
//startMyDisWebSock() 
