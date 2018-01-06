module.exports = {
    name: "setrole",
    usage: "@name|userID @role|roleID",
    defaultPermission: 2,
    failPermission: "You can't set roles.",
    args: 2,
    guildOnly: true,
    execute(Client, msg){
        userID = Client.serverManager.extractID(msg, 0);
    	roleID = Client.serverManager.extractRoleID(msg, 1);
    	if(userID && roleID){
    		Client.addToRole(msg, userID, roleID);
    	}
    }
};