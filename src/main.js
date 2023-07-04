import plugin from "../plugin.json";
import style from "./style.scss";

const alert = acode.require("alert");
const loader = acode.require("loader");
const fs = acode.require('fs');
const multiPrompt = acode.require('multiPrompt');
const DialogBox = acode.require('dialogBox');
const helpers = acode.require("helpers");
import axios from "axios";

const SAVED_REQUESTS_PATH = window.DATA_STORAGE + "rest-api-tester";
let CURRENT_SESSION_FILEPATH = null;

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

    // menu buttons

    const saveRequestBtn = tag("span", {
      className: "icon save saveRequestBtn",
      dataset: {
        action: "save-request"
      }
    });

    const newRequestBtn = tag("span", {
      className: "icon add",
      dataset: {
        action: "new-request"
      }
    });

    const viewSavedRequestsBtn = tag("span", {
      className: "icon folder_open",
      dataset: {
        action: "view-saved-requests"
      }
    });

    this.$page.header.append(...[saveRequestBtn, newRequestBtn, viewSavedRequestsBtn]);

    saveRequestBtn.onclick = this.saveRequest.bind(this);
    newRequestBtn.onclick = this.newRequest.bind(this);
    viewSavedRequestsBtn.onclick = this.showSavedRequestsList.bind(this);

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
      value: "",
      textContent: "PUT"
    });
    const patchOption = tag("option", {
      value: "PATCH",
      textContent: "PATCH"
    });
    const deleteOption = tag("option", {
      value: "DELETE",
      textContent: "DELETE"
    });

    reqMode.append(...[getOption, postOption, putOption, patchOption, deleteOption]);

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

    // data for saving request
    this.$fileData = {};
  }


  // get references of page elems 

  getReferences() {
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
    const resDiv = document.querySelector(".response");
    const resStatus = document.querySelector(".statusVal");
    const saveIcon = document.querySelector(".save");

    return {
      url,
      reqMode,
      reqHeaders,
      requestBodySection,
      reqBody,
      sendRequestBtn,
      requestTab,
      responseTab,
      mainDiv,
      responseDiv,
      resDiv,
      resStatus,
      saveIcon
    };
  }

  /* new request function => set fileData value to empty and reset filepath */
  newRequest() {

    for(const key in this.$fileData) {
      delete this.$fileData[key];
    }
    CURRENT_SESSION_FILEPATH = null;

    const references = this.getReferences();
    // resetting values and toggling tabs
    references.mainDiv.style.display = "inline-flex"
    references.responseDiv.style.display = "none"
    references.responseTab.style.border = "none";
    references.requestTab.style.borderBottom = "1.5px solid #915eff";
    references.url.value = "";
    references.reqMode.value = "GET";
    references.reqBody.value = "";
    references.reqHeaders.value = "";
    references.saveIcon.style.opacity = 0;
    window.toast("New session", 2000);
  }

  // function for saving request 
  async saveRequest() {
    /*
    save chat history 
    */
    try {
      if(this.$fileData == "") {
        return;
      }

      if(CURRENT_SESSION_FILEPATH == null) {
        try {
          const requestName = await multiPrompt(
            "Enter request name",
            [{
              type: "text",
              id: "request_name",
              required: true,
              placeholder: "Enter request name "
            }],
          );

          if(!requestName["request_name"]) {
            window.toast("Request name is required", 3000);
            return;
          }

          const sanitizedRequestName = `${requestName["request_name"].trim()}-${Math.ceil((Math.random() * (new Date().getTime() - new Date().getMilliseconds() + 1)) + new Date().getMilliseconds())}.json`;

          if(!await fs(SAVED_REQUESTS_PATH).exists()) {
            await fs(window.DATA_STORAGE).createDirectory("rest-api-tester");
          }

          CURRENT_SESSION_FILEPATH = await fs(SAVED_REQUESTS_PATH).createFile(sanitizedRequestName, JSON.stringify(this.$fileData));
          window.toast("Request saved", 2000);

        } catch(err) {
          alert(err.message);
        }
      } else {
        try {

          if(!await fs(CURRENT_SESSION_FILEPATH).exists()) {
            window.toast("Some error occurred or file you trying to open has been deleted");
            return;
          }

          CURRENT_SESSION_FILEPATH = await fs(CURRENT_SESSION_FILEPATH).writeFile(this.$fileData);
          window.toast("Request data updated", 2000);
        } catch(err) {
          alert(err.message);
        }
      }
    } catch(err) {
      window.alert(err.message);
    }
  }

  // get saved requests list 
  async getSavedRequestsList() {
    /*
    get list of saved requests
    */
    if(await fs(SAVED_REQUESTS_PATH).exists()) {
      const allRequestsFilesList = await fs(SAVED_REQUESTS_PATH).lsDir();
      let list_elems = "";
      for(let i = 0; i < allRequestsFilesList.length; i++) {
        list_elems += `<li class="dialog-item" style="background: #404258;color:#f5f5f5;padding: 5px;margin-bottom: 5px;border-radius: 8px;font-size:15px;display:flex;flex-direction:row;justify-content:space-between;gap:5px;" data-path="${JSON.parse(JSON.stringify(allRequestsFilesList[i])).url}">
                  <p class="request-name-box" style="text-transform:lowercase;">${allRequestsFilesList[i].name.split("-")[0].substring(0, 25)}...</p><div><button style="height:25px;width:25px;border:none;padding:5px;outline:none;border-radius:50%;text-align:center;background-color:#404258;"><span class="icon delete delete-request-btn" style="color:red;font-size:17px;"></span></button></div>
                </li>`;
      }
      return list_elems;
    } else {
      let list_elems = "";
      list_elems = `<li style="background:orange;color:black;padding: 10px;border-radius: 8px;" data-path="#not-available">Not Available</li>`;
      return list_elems;
    }
  }

  // display saved request list in dialog box

  async showSavedRequestsList() {
    /*
    show saved requests list
    */
    try {
      const requestsList = await this.getSavedRequestsList();
      const content = `<ul>${requestsList}</ul>`;
      const requestsListDialogBox = DialogBox(
        'Saved Requests',
        content,
        'Cancel',
      );

      requestsListDialogBox.onclick(async (e) => {
        const dialogItem = e.target.closest('.dialog-item');
        const deleteButton = dialogItem.querySelector('.delete-request-btn');
        const historyItem = dialogItem.querySelector('.request-name-box');

        // if no elements in list
        if(dialogItem.getAttribute("data-path") == "#not-available") {
          return;
        }

        //if path attribute not found
        if(!dialogItem.getAttribute("data-path")) {
          return;
        }

        // handling the showing of file data after click
        if(e.target === dialogItem || e.target === historyItem) {
          const fileUrl = JSON.stringify(dialogItem.getAttribute("data-path"));
          const url = fileUrl.slice(1, fileUrl.length - 1);

          await this.displaySavedRequestData(url, requestsListDialogBox);

        } else if(e.target === deleteButton) {
          // delete file           
          const fileUrl = JSON.stringify(dialogItem.getAttribute("data-path"));
          const url = fileUrl.slice(1, fileUrl.length - 1);
          await fs(dialogItem.getAttribute("data-path")).delete();

          // reset filepath if currently opened file is deleted
          if(CURRENT_SESSION_FILEPATH == url) {
            this.newRequest();
          }

          dialogItem.remove();
          window.toast("Deleted", 3000);
          CURRENT_SESSION_FILEPATH = null;
        }
      });
    } catch(err) {
      window.alert(err.message)
    }
  }

  // display saved request data to ui 

  async displaySavedRequestData(fileUrl, requestsListDialogBox) {

    if(!await fs(fileUrl).exists()) {
      this.newRequest();
      window.toast("Some error occurred or url doesn't exist ", 2000);
      return;
    }

    CURRENT_SESSION_FILEPATH = fileUrl;
    try {
      requestsListDialogBox.hide();
      loader.create("Wait", "Fetching data....");
      const fileData = await fs(fileUrl).readFile();
      const response = JSON.parse(await helpers.decodeText(fileData));

      this.$fileData = response;
      const ref = this.getReferences();

      //toggle reqbody section in case of POST or PATCH 
      if(response.method == "POST" || response.method == "PATCH" || response.method == "PUT") {
        ref.requestBodySection.style.display = "block";
      } else {
        ref.requestBodySection.style.display = "none";
      }

      ref.url.value = response.url;
      ref.reqMode.value = response.method;
      ref.reqHeaders.value = response.headers ? JSON.stringify(response.headers, null, 2) : " ";
      ref.reqBody.value = response.data ? JSON.stringify(response.data, null, 2) : " ";
      ref.resDiv.innerText = JSON.stringify(response.response, null, 2);
      ref.resStatus.innerText = response.statusCode;

      loader.destroy()
    } catch(err) {
      alert(err.message)
    }

  }


  // send request to url 
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

    if(reqMode == "POST" || reqMode == "PUT" || reqMode == "PATCH") {
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

      // setting fields for file data 
      this.$fileData = { ...options, response: data, statusCode };

    } catch(err) {
      loader.destroy();
      if(err.response) {
        this.showResponse(err.response.data, err.response.status);
        // setting fields for file data in case of error
        this.$fileData = { ...options, response: err.response.data, statusCode: err.response.status };
      } else {
        this.showResponse(err.message, err.status);
        // setting fields for file data in case of error
        this.$fileData = { ...options, response: err.message, statusCode: err.status };
      }
    }
  }

  // display response 
  showResponse(response, statusCode) {

    const ref = this.getReferences();
    ref.saveIcon.style.opacity = 1;
    ref.mainDiv.style.display = "none";
    ref.responseDiv.style.display = "block";
    ref.requestTab.style.border = "none";
    ref.responseTab.style.borderBottom = "1.5px solid #915eff";
    ref.resDiv.innerText = JSON.stringify(response, null, 2);
    ref.resStatus.innerText = statusCode;

  }

  async run() {
    this.$page.show();

    // references to page elems 
    const references = this.getReferences();
    references.saveIcon.style.opacity = 0;

    let headersJson;


    // toggle tabs 
    references.requestTab.addEventListener("click", () => {
      references.mainDiv.style.display = "inline-flex";
      references.responseDiv.style.display = "none";
      references.responseTab.style.border = "none";
      references.requestTab.style.borderBottom = "1.5px solid #915eff";
      references.saveIcon.style.opacity = 0;
    })

    references.responseTab.addEventListener("click", () => {
      references.mainDiv.style.display = "none";
      references.responseDiv.style.display = "block";
      references.requestTab.style.border = "none";
      references.responseTab.style.borderBottom = "1.5px solid #915eff";
      references.saveIcon.style.opacity = 1;
    })


    // toggling request body textarea
    references.reqMode.addEventListener("change", () => {
      if(references.reqMode.value == "POST" || references.reqMode.value == "PUT" || references.reqMode.value == "PATCH") {
        references.requestBodySection.style.display = "block";
        references.reqHeaders.value = '{"Content-type" : "application/json"}';
      } else {
        references.requestBodySection.style.display = "none"
        references.reqHeaders.value = "";
        references.reqBody.value = "";
      }
    })



    // send request by clicking on button 
    references.sendRequestBtn.addEventListener("click", () => {

      if(references.url.value == "") {
        alert("Url field can't be empty");
        return;
      }

      if((references.reqMode.value == "POST" || references.reqMode.value == "PUT" || references.reqMode.value == "PATCH") && references.reqBody.value != "") {
        let bodyJson;
        try {
           bodyJson = JSON.parse(references.reqBody.value.trim());
        } catch(err) {
          alert("Invalid request body value!!");
          return;
        }
        
        try {
          headersJson = JSON.parse(references.reqHeaders.value.trim());
        } catch(err) {
          alert("Invalid headers value!!");
          return;
        }

        this.sendReq(references.url.value, references.reqMode.value, bodyJson, headersJson)
      } else {

        if(references.reqHeaders.value != "") {
          try {
            headersJson = JSON.parse(references.reqHeaders.value.trim());
          } catch(err) {
            alert("Invalid headers value!!");
            return;
          }
        }
        this.sendReq(references.url.value, references.reqMode.value, null, headersJson)
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
