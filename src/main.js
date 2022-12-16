import plugin from '../plugin.json';
const multiPrompt = acode.require('multiPrompt');  
const select = acode.require('select');
import axios from "axios"
class restapi {

    async init() {
        let command = {
            name:"api tester",
            description: "restapi",
            exec: this.run.bind(this),
        }
        editorManager.editor.commands.addCommand(command);
    }
    
    async run() {
const apiUrl = await multiPrompt('enter url'            ,[ {
                id: "url",
                type: "text",
                required: true
            },
              ] );
           
          const reqMode = await select('Mode',[
            "Get",
            "Post",
            "Put",
            "Delete"
            ]);
            
            if(reqMode == "Get"){

axios.get(apiUrl["url"])
  .then(function (response) {
    // handle success
    
    window.alert(JSON.stringify(response.data));
  })
  .catch(function (error) {
    // handle error
    window.alert(error);
  })
  .finally(function () {
    // always executed
  });
     
         }else if(reqMode == "Post"){
           
           
const body = await multiPrompt('Body'            ,[ {
                id: "data",
                type: "text",
                required: true
            },
              ] );
              
          axios.post(apiUrl["url"], body["data"])
  .then(function (response) {
    
    window.alert(JSON.stringify(response.data));
  })
  .catch(function (error) {
   window.alert(error);
  });

         }        
else if(reqMode == "Put"){
           
           
const body = await multiPrompt('Body'            ,[ {
                id: "data",
                type: "text",
                required: true
            },
              ] );
          
              
          axios.put(apiUrl["url"], body["data"])
  .then(function (response) {

    window.alert(JSON.stringify(response.data));
  })
  .catch(function (error) {
   window.alert(error);
  });
          
         }else if(reqMode == "Delete"){
axios.delete(apiUrl["url"])
 .then(function (response) {
   if(response){

    window.alert(JSON.stringify(response.data));
   }else{
     window.alert("delete successfully")
   }
     
   })
  .catch(function (error) {
   window.alert(error);
  });
         }
            
            
    }
    
    async destroy() {
        let command = {
            name: "api tester",
            description: "restapi",
            exec: this.run.bind(this),
        }
        editorManager.editor.commands.removeCommand(command)
    }
}


if (window.acode) {
  const acodePlugin = new restapi();
  acode.setPluginInit(plugin.id, (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }
    acodePlugin.baseUrl = baseUrl;
    acodePlugin.init($page, cacheFile, cacheFileUrl);
  });
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}




