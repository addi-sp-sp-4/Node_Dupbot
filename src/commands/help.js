module.exports = {
    name: "help",
    description: "!help <command>",
    defaultPermission: 1,
    usage: "<command>",
    args: 0,
    execute(self, msg){
        self.getPrefix(msg, (prefix) => {
            self.db.getPermissions(msg.guild.id, "allPermissions", (permissions) => {

                permissions = sortPermissions(permissions);

                if (msg.params.length >= 1){
            		let helpmsg = "No command";
                    let command = msg.client.commands.get(msg.params[0]);
                    if (command){
                        if(permissions.keys[command.name] == 0){
                            helpmsg = `The command \`${command.name}\` is disabled`;
                        } else if(msg.permissionLevel < permissions.keys[command.name]){
                            helpmsg = `You don't have access to \`${command.name}\``;
                        } else {
                            if(command.usage){
                                helpmsg = `\`${prefix}${command.name} ${command.usage}\``;
                            } else {
                                helpmsg = `\`${prefix}${command.name}\``;
                            }
                        }

                    }
            		message = self.createEmbed("info", helpmsg);
            		self.send(msg, message);
            	} else {
                    // const cahCommands = ["cstart", "cjoin", "cleave", "c", "cscoreboard", "creset"];
                    // const musicCommand = ["play", "skip", "queue"];

                    let box = [{
                        name: "Everyone",
                        value: permissions.everyone.join(", ")
                    },{
                        name: "Admin only",
                        value: permissions.mod.join(", ")
                    },{
                        name: "Owner only",
                        value: permissions.owner.join(", ")
                    }];

                    // [
                    //     {
                    //         name: "Music",
                    //         value: "play, skip, queue"
                    //     },{
                    //         name: "Cards Against Humanity",
                    //         value: "cstart, cjoin, cleave, c, cscoreboard, creset",
                    //     },
                    // ]

            		message = self.createEmbed("info", "All available commands, more info " + prefix + "help <command>", "Commands", box);
            		self.send(msg, message);
            	}
        	});
        });
    }
};

function sortPermissions(permissions){
    let disabled = [];
    let everyone =  [];
    let mod = [];
    let owner = [];
    let botOwner = [];

    let keys = {};

    for(let i = 0; i < permissions.length; i++){
        let command = permissions[i].command;

        keys[command] = permissions[i].value;

        switch (permissions[i].value) {
            case 0:
                disabled.push(command);
                break;
            case 1:
                everyone.push(command);
                break;
            case 2:
                mod.push(command);
                break;
            case 3:
                owner.push(command);
                break;
            case 4:
                botOwner.push(command);
                break;
            default:

        }
    }
    return {
        disabled: disabled,
        everyone: everyone,
        mod: mod,
        owner: owner,
        botOwner: botOwner,
        keys: keys
    };
}
