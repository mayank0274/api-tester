import plugin from "../plugin.json";
import style from "./style.scss";

const alert = acode.require("alert");
const loader = acode.require("loader");


import axios from "axios"

class restapi {
  async init($page) {
    let command = {
      name: "api tester",
      description: "restapi",
      exec: this.run.bind(this),
    };
    editorManager.editor.commands.addCommand(command);

    $page.id = "acode-plugin-restapi";
    $page.settitle("Rest Api Tester");
    this.$page = $page;
    this.$page.style.backgroundColor = "#191825";
    

    this.$style = tag("style", {
      textContent: style,
    });
    document.head.append(this.$style);

    // tabs 
    const tabsContainer = tag("section", {
      className: "tabsContainer"
    });

    this.$page.append(tabsContainer);

    const requestTab = tag("div", {
      className: "requestTab",
      textContent: "Request"
    });

    const responseTab = tag("div", {
      className: "responseTab",
      textContent: "Response"
    });

    tabsContainer.append(...[requestTab, responseTab]);

    // main div 
    const main = tag("main", {
      className: "mainDiv"
    });

    this.$page.append(main);


    // request url field
    const urlContainer = tag("section", {
      className: "urlContainer"
    })

    main.append(urlContainer);

    const urlLabel = tag("label", {
      textContent: "Enter url"
    })

    const urlField = tag("input", {
      className: "url",
      type: "text",
      placeholder: "e.g. http://localhost:3000"
    });

    urlContainer.append(...[urlLabel, urlField]);

    // request mode select box 

    const reqModeContainer = tag("section", {
      className: "reqModeContainer"
    })

    main.append(reqModeContainer);

    const reqModeLabel = tag("label", {
      textContent: "Request Method"
    })

    const reqMode = tag("select", {
      className: "reqModeOptions"
    });

    reqModeContainer.append(...[reqModeLabel, reqMode]);

    // request mode options 
    const getOption = tag("option", {
      value: "GET",
      textContent: "GET"
    });
    const postOption = tag("option", {
      value: "POST",
      textContent: "POST"
    });
    const putOption = tag("option", {
      value: "PUT",
      textContent: "PUT"
    });
    const deleteOption = tag("option", {
      value: "DELETE",
      textContent: "DELETE"
    });

    reqMode.append(...[getOption, postOption, putOption, deleteOption]);

    // headers section

    const headerSection = tag("section", {
      className: "headerSection"
    })

    main.append(headerSection);

    const reqHeadersWrapper = tag("details", {
      className: "reqHeadersWrapper"
    })

    headerSection.append(reqHeadersWrapper);

    const requestHeaderHeading = tag("summary", {
      textContent: "Headers"
    })

    reqHeadersWrapper.append(requestHeaderHeading);

    // request headers 
    const reqHeaders = tag("textarea", {
      placeholder: "enter request headers",
      className: "reqHeaders",
      rows: 7
    })

    reqHeadersWrapper.append(reqHeaders);

    // request body in case of post and put request 
    const requestBodySection = tag("section", {
      className: "requestBodySection"
    })

    main.append(requestBodySection);

    const reqBodyLabel = tag("label", {
      textContent: "Body"
    })

    const reqBodyField = tag("textarea", {
      placeholder: "enter request body",
      className: "reqBody",
      rows: 7
    })

    requestBodySection.append(...[reqBodyLabel, reqBodyField]);

    // send request 
    const sendRequestBtn = tag("button", {
      className: "sendRequestBtn",
      textContent: "Send",
    });

    main.append(sendRequestBtn);

    // response display area 
    const responseDiv = tag("div", {
      className: "responseDiv",
    });

    this.$page.append(responseDiv);

    const statusCode = tag("h2", {
      className: "status",
      textContent: "Status code",
    });

    const statusCodeVal = tag("h3", {
      className: "statusVal",
      textContent: "Not available",
    });

    responseDiv.append(statusCode);
    responseDiv.append(statusCodeVal);

    const resHeading = tag("h2", {
      className: "resHead",
      textContent: "Response",
    });

    const res = tag("pre", {
      className: "response",
      textContent: "Not available",
    });

    responseDiv.append(resHeading);
    responseDiv.append(res);
  }



  async sendReq(url, reqMode, reqBody, reqHeaders) {
    // variables
    let statusCode;
    let options;
    options = {
      url,
      method: reqMode,
    };

    if(reqHeaders != "") {
      options["headers"] = reqHeaders;
    }

    if(reqMode == "POST" || reqMode == "PUT") {
      options["data"] = reqBody;
    }

    // loader
    loader.create("Loading", "Fetching response...");

    try {
        const res = await axios(options);
      statusCode = res.status;
      const data = res.data;
      loader.destroy();
      this.showResponse(data, statusCode);
    } catch(err) {
      loader.destroy();
     if(err.response){
       this.showResponse(err.response.data,err.response.status)
     }else{
      this.showResponse(err.message,err.status)
     }
    }
  }

  showResponse(response, statusCode) {

    const mainDiv = document.querySelector(".mainDiv");
    const responseDiv = document.querySelector(".responseDiv");
    const requestTab = document.querySelector(".requestTab");
    const responseTab = document.querySelector(".responseTab");
    
    mainDiv.style.display = "none";
    responseDiv.style.display="block";
    requestTab.style.border = "none";
    responseTab.style.borderBottom = "1.5px solid #915eff";

    const resDiv = document.querySelector(".response");
    const resStatus = document.querySelector(".statusVal");
    resDiv.innerText = JSON.stringify(response, null, 2);
    resStatus.innerText = statusCode;
  }

  async run() {
    this.$page.show();
    const url = document.querySelector(".url");
    const reqMode = document.querySelector(".reqModeOptions");
    const reqHeaders = document.querySelector(".reqHeaders");
    const requestBodySection = document.querySelector(".requestBodySection");
    const reqBody = document.querySelector(".reqBody");
    const sendRequestBtn = document.querySelector(".sendRequestBtn");
    const requestTab = document.querySelector(".requestTab");
    const responseTab = document.querySelector(".responseTab");
    const mainDiv = document.querySelector(".mainDiv");
    const responseDiv = document.querySelector(".responseDiv");
    let headersJson;
    if(reqHeaders.value!=""){
      headersJson = JSON.parse(reqHeaders.value.trim());
    }
    
    requestTab.addEventListener("click", () => {
      mainDiv.style.display = "inline-flex"
      responseDiv.style.display="none"
      responseTab.style.border = "none";
      requestTab.style.borderBottom = "1.5px solid #915eff";
    })

    responseTab.addEventListener("click", () => {
      mainDiv.style.display = "none";
      responseDiv.style.display = "block";
      requestTab.style.border = "none";
      responseTab.style.borderBottom = "1.5px solid #915eff";
    })


    // toggling request body textarea
    reqMode.addEventListener("change", () => {
      if(reqMode.value == "POST" || reqMode.value == "PUT") {
        requestBodySection.style.display = "block";
        reqHeaders.value = '{"Content-type" : "application/json"}';
      } else {
        requestBodySection.style.display = "none"
        reqHeaders.value = "";
        reqBody.value = "";
      }
    })

    // send request by clicking on button 
    sendRequestBtn.addEventListener("click", () => {

      if(url.value == "") {
        alert("Url field can't be empty");
        return;
      }

      if((reqMode.value == "POST" || reqMode.value == "PUT") && reqBody.value != "") {
        const bodyJson = JSON.parse(reqBody.value.trim());
        this.sendReq(url.value, reqMode.value,bodyJson,headersJson)
      } else {
        this.sendReq(url.value, reqMode.value, null,headersJson)
      }

    })

  }

  async destroy() {
    let command = {
      name: "api tester",
      description: "restapi",
      exec: this.run.bind(this),
    };
    editorManager.editor.commands.removeCommand(command);
  }
}

if(window.acode) {
  const acodePlugin = new restapi();
  acode.setPluginInit(
    plugin.id,
    (baseUrl, $page, { cacheFileUrl, cacheFile }) => {
      if(!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      acodePlugin.baseUrl = baseUrl;
      acodePlugin.init($page, cacheFile, cacheFileUrl);
    }
  );
  acode.setPluginUnmount(plugin.id, () => {
    acodePlugin.destroy();
  });
}
