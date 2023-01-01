import plugin from '../plugin.json';
const multiPrompt = acode.require('multiPrompt');  
const select = acode.require('select');
const alert = acode.require("alert")
const loader = acode.require('loader');
import axios from "axios"
class restapi {

    async init($page) {
        let command = {
            name:"api tester",
            description: "restapi",
            exec: this.run.bind(this),
        }
        editorManager.editor.commands.addCommand(command);
        
   $page.id = 'acode-plugin-restapi';
        $page.settitle("Rest Api Tester");
        this.$page = $page;

        const statusCode = tag("h2",{
          className:"status",
          textContent:"Status code"
        })
        
        statusCode.style.padding="12px"
        
        const statusCodeVal = tag("h3",{
          className:"statusVal",
          textContent:""
        })
        
statusCodeVal.style.padding="10px"
statusCodeVal.style.color="green"
        
        this.$page.append(statusCode)
        this.$page.append(statusCodeVal);
        
        const resHeading =tag("h2",{
          className:"resHead",
          textContent:"Response"
        })
        
  resHeading.style.padding="12px"
        
        const res = tag("div",{
          className : "response",
          textContent : ""
        })
  res.style.padding="10px"
  res.style.color="green"
        
        this.$page.append(resHeading)
        this.$page.append(res)
    }
    
    async run() {
 const page = this.$page
 
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
    if(!response){
    loader.create("loader","fetching data")
    }
    
   // alert(`Status code :- ${JSON.stringify(response.status)}`);
   //alert(JSON.stringify(response.data));
  page.show()
 const resDiv = document.querySelector(".response")
 const resStatus = document.querySelector(".statusVal")
    resDiv.innerText = JSON.stringify(response.data,null,7);
    resStatus.innerText = JSON.stringify(response.status);
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
//alert(`Status code :- ${JSON.stringify(response.status)}`);
   // alert(JSON.stringify(response.data));
  page.show()
 const resDiv = document.querySelector(".response")
 const resStatus = document.querySelector(".statusVal")
resDiv.innerText = JSON.stringify(response.data,null,7);
    resStatus.innerText = JSON.stringify(response.status);
   
   
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
//alert(`Status code :- ${JSON.stringify(response.status)}`);
   //alert(JSON.stringify(response.data));
  page.show()
 const resDiv = document.querySelector(".response")
 const resStatus = document.querySelector(".statusVal")
resDiv.innerText = JSON.stringify(response.data,null,7);
    resStatus.innerText = JSON.stringify(response.status);
   
  })
  .catch(function (error) {
   alert(error);
  });
          
         }else if(reqMode == "Delete"){
axios.delete(apiUrl["url"])
 .then(function (response) {
   if(response){
//alert(`Status code :- ${JSON.stringify(response.status)}`);
   // alert(JSON.stringify(response.data));
  page.show()
 const resDiv = document.querySelector(".response")
 const resStatus = document.querySelector(".statusVal")
resDiv.innerText = JSON.stringify(response.data,null,7);
    resStatus.innerText = JSON.stringify(response.status);
     
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




