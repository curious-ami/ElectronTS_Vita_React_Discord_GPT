
//new Date(Number((BigInt("1148997689053290548") >> 22n) + 1420070400000n)).toLocaleDateString('ru');
export const saved_guilds = [{id: "771426188408520704"}, {id: "796466036588150815"}];

let divided_time_day;
export let five_min_store = [];
let timers = {};

for (const guild of saved_guilds) {
  let last_saved_period = await getLastItemFromObjectStore("save_"+(new Date().toLocaleDateString('ru')), guild.id);
  //console.log(last_saved_period);
  if (last_saved_period == null) last_saved_period = {key: null, value: []};
  five_min_store.push({id: guild.id, last: last_saved_period.key, messages: last_saved_period.value});

}

export async function save_message (message){
  message = compress_message(message);


  let message_date = new Date(Number((BigInt(message.id) >> 22n) + 1420070400000n));
  let divided_day_time = Math.floor((message_date - new Date(message_date).setHours(0, 0, 0, 0))/(1000*60*1));
  
  for (let i = 0; i < five_min_store.length; i++) {
    const store_guild = five_min_store[i];
    if(message.guild_id == store_guild.id){
      if (divided_day_time !== store_guild.last){
        if(store_guild.messages.length!=0){
          await read_write_IDB("save_"+(new Date(message_date).toLocaleDateString('ru')), message.guild_id, store_guild.last, "write", store_guild.messages)
        }
        store_guild.last = divided_day_time;
        store_guild.messages = []; 
      }
      store_guild.messages.push(message);
      //store_guild.messages[`id_${message.id}`]=message;
      //console.log(store_guild);
      clearTimeout(timers[`guild_${message.guild_id}`]);
      timers[`guild_${message.guild_id}`] = setTimeout(read_write_IDB, 1000*60*1.5, "save_"+(new Date(message_date).toLocaleDateString('ru')), message.guild_id, store_guild.last, "write", store_guild.messages);
      //console.log(timers);
    }
    
  }


}

export async function read_write_IDB(databaseName, objectStoreName, id, method, data) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);

    request.onerror = (event) => {
      reject(new Error("Database error: " + event.target.error));
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(objectStoreName, method === 'write' ? 'readwrite' : 'readonly');
      const objectStore = transaction.objectStore(objectStoreName);

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };

      transaction.onerror = (event) => {
        reject(new Error("Transaction error: " + event.target.error));
      };

      if (method === 'read') {
        const getRequest = objectStore.get(id);
        getRequest.onsuccess = (event) => {
          const result = event.target.result;
          resolve(result);
        };
        getRequest.onerror = (event) => {
          reject(new Error("Error reading data: " + event.target.error));
        };
      } else if (method === 'write') {
        const putRequest = objectStore.put(data, id);
        putRequest.onsuccess = () => {
          resolve('Data written successfully');
        };
        putRequest.onerror = (event) => {
          reject(new Error("Error writing data: " + event.target.error));
        };
      } else {
        reject(new Error("Invalid method: " + method));
      }
    };

    request.onupgradeneeded = (event) => {
        //event.target.result.createObjectStore(objectStoreName, {});
        for (const guild of saved_guilds) {
          event.target.result.createObjectStore(guild.id, {});
        }
        console.log('Database setup complete ');
    };
  });
}

function getLastItemFromObjectStore(databaseName, objectStoreName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);

    request.onerror = (event) => {
      reject(new Error("Database error: " + event.target.error));
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(objectStoreName, 'readonly');
      const objectStore = transaction.objectStore(objectStoreName);

      const openCursorRequest = objectStore.openCursor(null, 'prev');

      openCursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Перемещаемся к последнему элементу (последнему добавленному объекту)
          resolve({key: cursor.key, value: cursor.value});
        } else {
          // Все элементы пройдены
          resolve(null); // Возвращаем null, если объектов в хранилище нет
        }
      };

      openCursorRequest.onerror = (event) => {
        reject(new Error("Error opening cursor: " + event.target.error));
      };
    };

    request.onupgradeneeded = (event) => {
      for (const guild of saved_guilds) {
        event.target.result.createObjectStore(guild.id, {});
      }
    };
  });
}

export function compress_message(message){
  message = {
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
    message_reference: (message.referenced_message != null)?{message_id: message.message_reference.message_id}:null,
    referenced_message: (message.referenced_message != null)?{
      content: message.referenced_message.content.slice(0,100),
      author: {id: message.referenced_message.author.id}
    }:null
  };
  return message;
}