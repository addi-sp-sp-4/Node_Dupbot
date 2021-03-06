const { ShardingManager } = require('discord.js');
const {token, dev_token} = require('./serverSettings.json');

let login_token;
let args = [];

if(!process.argv.includes("--dev")){
    login_token = token;
} else {
    login_token = dev_token;
    args.push("--dev");
}

const map = new Map();

const manager = new ShardingManager('./src/client.js', {
    token: login_token,
    shardArgs: args,
});

manager.spawn();
manager.on('launch', shard => console.log(`Shard[X] : [+]Launched Shard[${shard.id}]`));

manager.on('message', (shard, message) => {
    if(message.type === "log"){
        return log(shard, message);
    } else if(message.type === "reload"){
        map.set(shard.id, message.msg);
    } else if(message.type === "connected"){
        if(map.has(shard.id)){
            shard.eval(`this.channels.get('${map.get(shard.id).channel}').fetchMessage('${map.get(shard.id).id}').then(message => {message.edit({embed:{color:4193355, description:"<:check:314349398811475968>"}})})`);
            map.delete(shard.id);
        }
    }
});

function log(shard, message){
    if(message.error) return console.log(`Shard[${shard.id}]:${message.error.file}:${message.error.line} ${message.error.reason}`);
    if(message.info) return console.log(`Shard[${shard.id}]:${message.info}`);
}
