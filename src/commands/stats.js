const Discord = require('discord.js');

module.exports = {
    name: "stats",
    description: "stats",
    defaultPermission: 2,
    args: 0,
    guildOnly: true,
    execute(self, msg){
        if(msg.params.includes("--reset") && msg.permissionLevel == 4){
            self.db.resetDatabase("stats_" + msg.guild.id);
        } else {
            new Stats(self, msg);
        }
    }
};

class Stats{
    constructor(self, msg){
        this.requests = 0;
        this.stats = {};
        this.started = Date.now();
        this.self = self;
        this.msg = msg;
        this.init();
    }

    init(){
        this.channels = this.msg.guild.channels.filter( (x) => {
            return x.type === "text";
        });
        this.getStats();
    }

    async getStats(){
        await this.self.db.getStats(this.msg.guild.id, "all", async (result) => {
            if(result.length === 0){
                await this.fetchAllMessages();
            } else {
                let embed = new Discord.RichEmbed();
                let members = "";
                let percentage = "";
                let total = 0;

                for(let i = 0; i < result.length; i++){
                    total += result[i].value;
                }
                for(let i = 0; i < result.length; i++){
                    if(i === 20) break;
                    members += `\n${i+1} - <@${result[i].id.toString()}>: ${result[i].value} messages`;
                    percentage += `\n ${((result[i].value/total)*100).toFixed(2)}%`;
                }

                embed.addField("Members with most sent messages", members,true);
                embed.addField("Percentage", percentage,true);
                embed.setTitle(`Sent messages (${total} messages)`);
                embed.setDescription("\n");
                embed.setColor(3447003);

                /*let message = "Members with most sent messages:\n";
                let total = 0;
                for(let i = 0; i <result.length; i++){
                    total += result[i].value;
                }
                for(let i = 0; i < result.length; i++){
                    if(i === 30) break;
                    message += `\n${i+1} - <@${result[i].id.toString()}>: ${result[i].value} messages (${((result[i].value/total)*100).toFixed(2)}%)`;
                }
                message = this.self.createEmbed("info", message, `Sent messages (${total} messages)`);*/
                this.self.send(this.msg, embed);
            }

            // this.self.db.getStats(this.msg.guild.id, "all", (result) => {
            //     if(result){
            //         let embed = new Discord.RichEmbed();
            //         let members = "";
            //         let percentage = "";
            //         let total = 0;
            //
            //         for(let i = 0; i < result.length; i++){
            //             total += result[i].value;
            //         }
            //         for(let i = 0; i < result.length; i++){
            //             if(i === 20) break;
            //             members += `\n${i+1} - <@${result[i].id.toString()}>: ${result[i].value} messages`;
            //             percentage += `\n ${((result[i].value/total)*100).toFixed(2)}%`;
            //         }
            //
            //         embed.addField("Members with most sent messages", members,true);
            //         embed.addField("Percentage", percentage,true);
            //         embed.setTitle(`Sent messages (${total} messages)`);
            //         embed.setDescription("\n");
            //         embed.setColor(3447003);
            //
            //         /*let message = "Members with most sent messages:\n";
            //         let total = 0;
            //         for(let i = 0; i <result.length; i++){
            //             total += result[i].value;
            //         }
            //         for(let i = 0; i < result.length; i++){
            //             if(i === 30) break;
            //             message += `\n${i+1} - <@${result[i].id.toString()}>: ${result[i].value} messages (${((result[i].value/total)*100).toFixed(2)}%)`;
            //         }
            //         message = this.self.createEmbed("info", message, `Sent messages (${total} messages)`);*/
            //         this.self.send(this.msg, embed);
            //     }
            // });
        });
    }

    async fetchAllMessages(){
        for(let channel of this.channels){
            if(!channel[1].permissionsFor(this.msg.client.user).has("VIEW_CHANNEL"))continue;
            await this.fetchAllMessagesChannel(channel[1], this.msg.guild.createdTimestamp)
        }
        this.self.send(this.msg, `Done, took ${(Date.now() - this.started) / 1000}seconds to fetch ${this.requests/10}k messages.`);

        this.updateDatabase();
    }

    async fetchAllMessagesChannel(channel, after){
        await channel.fetchMessages({after: after, limit: 100}).then( async (messages) => {
            console.log(`${channel.id}: ${this.requests}`);
            this.requests++;

            messages = messages.sort( (a, b) => {
                return a.createdTimestamp - b.createdTimestamp;
            });

            for(let message of messages){
                let author = message[1].author.id;
                if(!(author in this.stats)){
                    this.stats[author] = 0;
                }
                this.stats[author]++;
            }

            if(messages.size === 100){
                await this.fetchAllMessagesChannel(channel, messages.lastKey());
            }
        });
    }

    updateDatabase(){
        let values = [];
        for(let id in this.stats){
            values.push([id, this.stats[id], "MSG_SENT"]);
        }

        this.self.db.executeStatement("INSERT INTO stats_" + this.msg.guild.id + " (id, value, type) VALUES ?", values, (result) => {
            console.log(result);
        });
    }
}
