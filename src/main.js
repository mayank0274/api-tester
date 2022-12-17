import plugin from '../plugin.json';
const multiPrompt = acode.require('multiPrompt');  
const select = acode.require('select');
const alert = acode.require("alert")
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
    
    alert(`Status code :- ${JSON.stringify(response.status)}`);
    alert(JSON.stringify(response.data));
  })
  .catch(function (error) {
    // handle error
    alert(error);
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
alert(`Status code :- ${JSON.stringify(response.status)}`);
    alert(JSON.stringify(response.data));
  })
  .catch(function (error) {
   alert(error);
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
alert(`Status code :- ${JSON.stringify(response.status)}`);
    alert(JSON.stringify(response.data));
  })
  .catch(function (error) {
   alert(error);
  });
          
         }else if(reqMode == "Delete"){
axios.delete(apiUrl["url"])
 .then(function (response) {
   if(response){
alert(`Status code :- ${JSON.stringify(response.status)}`);
    alert(JSON.stringify(response.data));
   }else{
     alert("delete successfully")
   }
     
   })
  .catch(function (error) {
   alert(error);
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




