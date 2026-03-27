(()=>{async function f(){let e=await fetch("../../shared/assets/configuration.json");if(e.ok){let t=await e.json();return sessionStorage.setItem("configuration",JSON.stringify(t)),!0}else throw console.log(`getConfigurationFromJson Error : ${JSON.stringify(e)}`),new Error("getConfigurationFromJson Error message : "+e.status+" "+e.statusText)}function i(s){let e=sessionStorage.getItem("configuration"),t=JSON.parse(e),o=Object.keys(t).indexOf(s);if(o>=0)return Object.values(t)[o];throw new Error("configuration value not found "+s)}function l(){let s=location.pathname,e=s.indexOf("/views/");return e>=0?window.location.origin+s.substring(0,e):window.location.origin}function C(s,e){let t=document.querySelectorAll(s);for(let o=0;o<t.length;o++)t[o].addEventListener("click",e)}function E(){document.documentElement.getAttribute("data-bs-theme")==="dark"?(document.documentElement.setAttribute("data-bs-theme","light"),sessionStorage.setItem("theme","light")):(sessionStorage.setItem("theme","dark"),document.documentElement.setAttribute("data-bs-theme","dark"))}function k(){let s=sessionStorage.getItem("theme");s&&document.documentElement.setAttribute("data-bs-theme",s)}async function v(s,e){console.log("getLogin Service start"),sessionStorage.setItem("loggedUSer","");let t=i("wsUrlformel")+"login",o=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({login:s,password:e,entity:"",reset:0})});if(o.ok){let r=await o.json();return r.success.username=s,delete r.success.message,sessionStorage.setItem("loggedUSer",JSON.stringify(r.success)),!0}else return sessionStorage.setItem("loggedUSer",""),!1}function g(){return!0}function c(){return"5z7dAN7TM4psDIuAY2yzsa28HaAl856T"}function A(){sessionStorage.removeItem("loggedUSer","")}function M(){let s=sessionStorage.getItem("loggedUSer");return s?JSON.parse(s).username:""}function w(s,e){let t;return!e||e&&e.length===0?t="":t=`<i class="bi ${e}"></i>`,`        
            <div class="d-flex  justify-content-between" style="margin-top:0px" >
                <span class="fs-4 text-danger-emphasis"  >${t} ${s}</span>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
                `}function F(s,e="",t=[]){let o="";return t.length>0&&(o=`
                    <div class="dropdown">
                        <a href="#" data-bs-toggle="dropdown" aria-expanded="false" class="text-secondary"><i class="bi bi-three-dots-vertical"></i></a>
                        <ul class="dropdown-menu" style="padding:10px">
                            ${t.map(n=>{if(n.active){let u=n.icon?`<i class="bi ${n.icon}"></i> `:"";return`<li><a class="dropdown-item" href="#" id="${n.id}">${u}${n.label}</a></li>`}}).join("")}
                        </ul>
                    </div>`),`
        <div class="card-title block-title">
            <div class="d-flex justify-content-between">
                <span class="fs-5 text-danger-emphasis block-label text-nowrap" >${e} ${s}</span>
                <div class="col-8 flex float-right text-end bloc-menu" style="cursor: pointer">
                    ${o}
                </div>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
        </div>`}function x(s,e){return e!==null&&e!==""?`<div class=""  > <span class="fw-light" >${s}</span> : ${e}</div>`:`<div class="" > <span class="fw-light" >${s}</span> : </div > `}function D(s,e,t,o="",r=""){return`<div class="form-group row ">
            <label class="fw-light col-sm-2 " for="${e}">${s}</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="${e}" aria-describedby="emailHelp" id="${e}" 
                placeholder="${r}" value="${t}" >
                    <small id="emailHelp" class="form-text text-muted">${o}</small>
            </div>
          </div>`}function S(s,e){let t=document.getElementById("loadingSection");s?t.innerHTML=`
         <nav class="navbar fixed-top bg-body-tertiary" style="border-bottom:solid 0.1rem #C0C0C0; padding:5px">
              <div class="container-fluid">
                  <div class="navbar-brand text-danger-emphasis"  id="mainNav">Dhagpo - Zopa</div>
                  <div class="d-flex">
                  <a class="btn" style="margin-left:3px;cursor:pointer"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample"><i class="bi bi-three-dots-vertical"></i></a >
  
                  </div>
              </div>
          </nav>
  <div class="alert alert-light" role="alert" style="margin-top:60px" id="loadingIndicator">
  <div class=" d-flex align-items-center gap-2 my-3">
    <div class=" spinner-border spinner-border-sm text-secondary" role="status"></div>
    <span>${e} - Chargement des donn\xE9es...</span>
  </div>
</div>`:t.innerHTML=""}function a(s,e){return`<div class="alert ${s} alert-dismissible fade show" style="margin-top:60px" role="alert">
            ${e}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`}var _=`
<div class="container">
    <div class="modal fade" id="myModalLogin" role="dialog" data-bs-backdrop="static"
            data-bs-keyboard="false" >
        <div class="modal-dialog">

            <!-- Modal content-->
            <div class="modal-content">
                <div class="modal-header">
                    <!-- <button type="button" class="close" data-dismiss="modal">&times;</button> -->
                    <h5 class="modal-title text-danger-emphasis" >Login</h5>
                           <button type="button" id="myBtnCancel" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>

                </div>
                <div class="row modal-body" id="modalbodyLogin">
                    <p>Some text in the modal.</p>

                </div>
                <div class="modal-footer" id="modalfooter">
                     <button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogin">Valider</button>
                </div>
            </div>

        </div>
    </div>
</div>`;async function H(){try{let s=document.createElement("div");s.innerHTML=_,document.body.appendChild(s),g()?(document.querySelector("#modalbodyLogin").innerHTML=`
        <div id="modalmessage"></div>
        <div class="row" id="loggout">
        Vous \xEAtes authenfifi\xE9 avec le login ${M()}. 
             </div>
        </div>
            `,document.querySelector("#modalfooter").innerHTML='<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogout">Lougout</button>',document.querySelector("#btnLogout").onclick=async function(){A(),window.location.href=`${l()}/views/mainpage`}):(document.querySelector("#modalbodyLogin").innerHTML=`
        <div id="modalmessage"></div>
        <div class="row">
            <label for="userEmailInput" class="form-label col-2">Nom </label>
            <div class="col" style="margin:2px">
                <input type="text" class="form-control  col-sm-10 " name="userEmailInput" id="userEmailInput" placeholder=""
                    value=""/> 
            </div>
        </div>
        <div class="row">
            <label for="userPasswordInput" class="form-label col-2">Password </label>
            <div class="col" style="margin:2px">
                <input type="password" class="form-control  col-sm-10 " name="userPasswordInput" id="userPasswordInput" placeholder=""
                    value=""/>
            </div>
        </div>
            `,document.querySelector("#modalfooter").innerHTML='<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogin">Login</button>',$("#modalbodyLogin").on("keydown",async function(t){if(t.keyCode===13){let o=document.querySelector("#userEmailInput").value,r=document.querySelector("#userPasswordInput").value,n=await v(o,r);n?document.querySelector("#modalmessage").innerHTML=`<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Bienvenue ${n.user_pseudo}</div> `:document.querySelector("#modalmessage").innerHTML='<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Nom, password invalides</div> '}}),document.querySelector("#btnLogin").onclick=async function(){let t=document.querySelector("#userEmailInput").value,o=document.querySelector("#userPasswordInput").value;await v(t,o)?window.location.href=`${l()}/views/mainpage`:document.querySelector("#modalmessage").innerHTML='<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert" >Nom, password invalides</div> '}),document.querySelector("#myBtnCancel").onclick=function(){window.location.href=`${l()}/views/mainpage`},new bootstrap.Modal(document.querySelector("#myModalLogin")).show()}catch(s){document.querySelector("#messageSection").innerHTML=a("danger",s)}}var Z=` 
    <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
       <div class="offcanvas-header">
            <h5 class="offcanvas-title text-danger-emphasis" id="offcanvasExampleLabel" >Zopa V3 JS</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div> 
        <div class="offcanvas-body">
            <!--     <div>
                    Pr\xE9sentation du menu principal de l'application        
                </div>-->
            <hr/>
           <div id="menuplace"/>
           </div>
    </div>
 `,G={login:()=>H(),theme:()=>E()};function U(s){document.querySelector("#"+s).innerHTML=Z;let e=i("leftMenu"),t="";e.map(o=>{switch(o.menuItemType){case"menuitem":t+=`<div  style="margin-bottom:10px;cursor:pointer" ><span id="${o.menuItemid}" class="fs-6"> ${o.menuItemIcon} ${o.menuItemName} </span></div>`;break;case"hr":t+="<hr/>"}}),document.querySelector("#menuplace").innerHTML=t,t="",e.map(o=>{switch(o.menuItemAction){case"functionCall":t+=`<div id="${o.menuItemid}" style="margin-bottom:10px;cursor:pointer" ><span class="fs-6"> ${o.menuItemIcon} ${o.menuItemName} </span></div>`,document.querySelector(`#${o.menuItemid}`).onclick=function(){let r=G[o.menuItemid];r&&r()};break;case"urlCall":document.querySelector(`#${o.menuItemid}`).onclick=function(){window.location.href=`${l()}/${o.menuItemLink}`};break}})}function q(s){let e=`
      <div id="menuPart">
          <nav class="navbar fixed-top bg-body-tertiary" style="border-bottom:solid 0.1rem #C0C0C0; padding:5px">
              <div class="container-fluid">
                  <div class="navbar-brand text-danger-emphasis"  id="mainNav">${i("BrandTitle")}</div>
                  <div class="d-flex">
                  <a class="btn" style="margin-left:3px;cursor:pointer"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample"><i class="bi bi-three-dots-vertical"></i></a >
  
                  </div>
              </div>
          </nav>
        </div>
      <div id="leftMenu">
      </div>
 `;document.querySelector("#"+s).innerHTML=e,U("leftMenu")}async function O(){let s=sessionStorage.getItem("yearexercice");if(JSON.parse(s))return!0;let t=i("wsUrlformel")+`dybccrapi/yearexercices?DOLAPIKEY=${c()}&sortorder=ASC&limit=100&active=1`,o=await fetch(t);if(o.ok){let r=await o.json();return sessionStorage.setItem("yearexercice",JSON.stringify(r)),!0}else throw new Error("loadYearExerciceTable Error : "+o.status+" "+o.statusText)}async function P(){let s=sessionStorage.getItem("typeactivities");if(JSON.parse(s))return!0;let t=i("wsUrlformel")+`dybccrapi/typeactivities?DOLAPIKEY=${c()}&sortorder=ASC&limit=100&active=1`,o=await fetch(t);if(o.ok){let r=await o.json();return sessionStorage.setItem("typeactivities",JSON.stringify(r)),!0}else throw new Error("loadYearExerciceTable Error : "+o.status+" "+o.statusText)}async function N(){let s=sessionStorage.getItem("typedomains");if(JSON.parse(s))return!0;let t=i("wsUrlformel")+`dybccrapi/typedomains?DOLAPIKEY=${c()}&sortorder=ASC&limit=100&active=1`,o=await fetch(t);if(o.ok){let r=await o.json();return sessionStorage.setItem("typedomains",JSON.stringify(r)),!0}else throw new Error("loadYearExerciceTable Error : "+o.status+" "+o.statusText)}async function J(){let s=sessionStorage.getItem("typecivilities");if(JSON.parse(s))return!0;let t=i("wsUrlformel")+`setup/dictionary/civilities?DOLAPIKEY=${c()}&sortorder=ASC&limit=100&active=1`,o=await fetch(t);if(o.ok){let r=await o.json();return sessionStorage.setItem("typecivilities",JSON.stringify(r)),!0}else throw console.log(`getCustomerCivilitiesTable Error : ${JSON.stringify(o)}`),new Error("getCustomerCivilitiesTable Error message : "+o.status+" "+o.statusText)}async function B(){let s=sessionStorage.getItem("paymenttypes");if(JSON.parse(s))return!0;let t=i("wsUrlformel")+`setup/dictionary/payment_types?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${c()}`,o=await fetch(t);if(o.ok){let r=await o.json();return sessionStorage.setItem("paymenttypes",JSON.stringify(r)),!0}else throw console.log(`getPaymentTypes Error : ${JSON.stringify(o)}`),new Error("getPaymentTypes Error message : "+o.status+" "+o.statusText)}async function V(){await f(),await P(),await N(),await O(),await J(),await B(),k()}function j(s){let e=`
    <div id="footerPart" style="margin-top:40px">
        <hr style="color:grey"></hr>
        <div class="d-flex justify-content-center" style="">
            <small>${i("version")}</small>
        </div >
        <hr style="color:grey"></hr>
    </div >
        `;document.querySelector(s).innerHTML=e}var m=class{constructor(e,t={}){if(typeof e=="string"?this.container=document.querySelector(e):this.container=e,!this.container)throw new Error("Container element not found");this.items=[],this.filteredItems=[],this.selectedItem=null,this.uniqueId="autocomplete-"+Math.random().toString(36).substr(2,9),this.options={apiUrl:t.apiUrl||null,apiKey:t.apiKey||null,selectedId:t.selectedId||null,labelField:t.labelField||"label",valueField:t.valueField||"id",placeholder:t.placeholder||"Tapez pour rechercher...",minChars:t.minChars||1,onChange:t.onChange||null,onInput:t.onInput||null,onLoad:t.onLoad||null},this.render(),this.setupEventListeners(),this.options.apiUrl&&this.loadData()}render(){this.container.innerHTML=`
            <div class="autocomplete-wrapper position-relative">
                <input
                    type="text"
                    class="form-control"
                    placeholder="${this.options.placeholder}"
                    autocomplete="off"
                    id="${this.uniqueId}"
                    style="padding-right: 55px;"
                >
                <i class="bi bi-x-circle position-absolute text-secondary"
                   role="button"
                   title="Effacer la s\xE9lection"
                   style="right: 30px; top: 50%; transform: translateY(-50%); display: none; cursor: pointer; z-index: 3;"></i>
                <i class="bi bi-chevron-down position-absolute text-secondary"
                   role="button"
                   title="Afficher la liste"
                   style="right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer; z-index: 3;"></i>
                <div class="dropdown-menu w-100  " style="max-height: 300px; overflow-y: auto; display: none;var(--bs-blue)">
                    <div class="dropdown-item text-center text-muted">
                        Tapez au moins ${this.options.minChars} caract\xE8re${this.options.minChars>1?"s":""} pour rechercher...
                    </div>
                </div>
            </div>
        `,this.input=this.container.querySelector("input"),this.menu=this.container.querySelector(".dropdown-menu"),this.clearIcon=this.container.querySelector(".bi-x-circle"),this.toggleIcon=this.container.querySelector(".bi-chevron-down")}setupEventListeners(){!this.input||!this.menu||(this.input.addEventListener("input",e=>{let t=e.target.value.trim();t.length>=this.options.minChars?(this.filterItems(t),this.showDropdown()):this.hideDropdown(),typeof this.options.onInput=="function"&&this.options.onInput(t)}),this.input.addEventListener("focus",()=>{let e=this.input.value.trim();e.length>=this.options.minChars&&(this.filterItems(e),this.showDropdown())}),document.addEventListener("click",e=>{this.container.contains(e.target)||this.hideDropdown()}),this.menu.addEventListener("click",e=>{e.stopPropagation()}),this.clearIcon&&this.clearIcon.addEventListener("click",e=>{e.stopPropagation(),this.clear(),this.input.focus()}),this.toggleIcon&&this.toggleIcon.addEventListener("click",e=>{e.stopPropagation(),this.menu.style.display==="block"?this.hideDropdown():(this.showAllItems(),this.showDropdown()),this.input.focus()}))}async loadData(){try{let e=this.options.apiUrl;if(this.options.apiKey){let r=e.includes("?")?"&":"?";e+=`${r}DOLAPIKEY=${this.options.apiKey}`}let t=await fetch(e);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);let o=await t.json();this.items=Array.isArray(o)?o:[],this.options.selectedId&&this.selectById(this.options.selectedId),typeof this.options.onLoad=="function"&&this.options.onLoad(this.items)}catch(e){console.error("Error loading data:",e),this.showError("Erreur de chargement des donn\xE9es")}}showError(e){this.menu&&(this.menu.innerHTML=`
                <div class="dropdown-item text-center text-danger">${e}</div>
            `)}filterItems(e){if(!e||e.length<this.options.minChars){this.filteredItems=[];return}let t=e.toLowerCase();this.filteredItems=this.items.filter(o=>{let r=(o[this.options.labelField]||"").toLowerCase(),n=(o.ref||"").toLowerCase();return r.includes(t)||n.includes(t)}),this.renderFilteredItems()}renderFilteredItems(){if(!this.menu)return;if(this.filteredItems.length===0){this.menu.innerHTML=`
                <div class="dropdown-item text-center text-muted">Aucun r\xE9sultat trouv\xE9</div>
            `;return}let e=this.filteredItems.map(t=>{let o=t[this.options.valueField],r=t[this.options.labelField]||"Sans titre",n=t.ref?`<small class="text-muted me-2">${t.ref}</small>`:"";return`
                <a class="dropdown-item" href="#" data-value="${o}">
                    ${n!==""?n+" -"+r:r}
                </a>
            `}).join("");this.menu.innerHTML=e,this.menu.querySelectorAll("a.dropdown-item[data-value]").forEach(t=>{t.addEventListener("click",o=>{o.preventDefault();let r=t.getAttribute("data-value");this.selectByValue(r),this.hideDropdown()})})}showAllItems(){this.filteredItems=[...this.items],this.renderFilteredItems()}showDropdown(){this.menu&&(this.menu.style.display="block")}hideDropdown(){this.menu&&(this.menu.style.display="none")}selectByValue(e){let t=this.items.find(o=>String(o[this.options.valueField])===String(e));return t?(this.selectedItem=t,this.updateInputValue(),typeof this.options.onChange=="function"&&this.options.onChange(this.getValue(),this.getSelectedItem()),!0):!1}selectById(e){return this.selectByValue(e)}updateInputValue(){if(this.input&&this.selectedItem){let e=this.selectedItem[this.options.labelField]||"Sans titre",t=this.selectedItem.ref?`${this.selectedItem.ref} - `:"";this.input.value=t+e}this.updateClearIcon()}updateClearIcon(){this.clearIcon&&(this.clearIcon.style.display=this.selectedItem?"block":"none")}getValue(){return this.selectedItem?this.selectedItem[this.options.valueField]:null}getSelectedItem(){return this.selectedItem}setValue(e){return this.selectByValue(e)}clear(){this.selectedItem=null,this.input&&(this.input.value=""),this.hideDropdown(),this.updateClearIcon(),typeof this.options.onChange=="function"&&this.options.onChange(null,null)}setItems(e){this.items=Array.isArray(e)?e:[]}setPlaceholder(e){this.options.placeholder=e,this.input&&(this.input.placeholder=e)}destroy(){this.container&&(this.container.innerHTML="")}};function Y(s,e="Confirmation",t={}){let{confirmLabel:o="Confirmer",cancelLabel:r="Annuler",confirmClass:n="btn-secondary",icon:u="bi-exclamation-triangle"}=t,d="confirmActionModal-"+Math.random().toString(36).substr(2,9),h=`
    <div class="modal fade" id="${d}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5 text-danger-emphasis">
              <i class="bi ${u} me-2"></i>${e}
            </span>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">${s}</p>
          </div>
          <div class="modal-footer">
            <!-- <button type="button" class="btn btn-secondary" id="${d}-cancel" data-bs-dismiss="modal">${r}</button>
            -->
            <button type="button" class="btn ${n}" id="${d}-confirm">${o}</button>
          </div>
        </div>
      </div>
    </div>`;return new Promise(p=>{let b=document.createElement("div");b.innerHTML=h,document.body.appendChild(b);let y=document.getElementById(d),L=new bootstrap.Modal(y),T=()=>{L.hide(),y.addEventListener("hidden.bs.modal",()=>{b.remove()},{once:!0})};document.getElementById(`${d}-confirm`).addEventListener("click",()=>{T(),p(!0)}),y.querySelector(".btn-close").addEventListener("click",()=>{T(),p(!1)}),L.show()})}async function K(s,e){try{await Y("Confirmer la cr\xE9ation d'une nouvelle commande pour cet adh\xE9rent ?","Nouvelle commande",{confirmLabel:"Cr\xE9er",confirmClass:"btn-success",icon:"bi-cart-plus"})&&e&&await e()}catch(t){document.querySelector("#messageSection").innerHTML=a("alert-danger",t.message)}}function I(s,e,t){let o=`
    
<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="liveToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-header">
      <!-- <img src="..." class="rounded me-2" alt="..."> -->
      <strong class="me-auto">${e}</strong>
      <small></small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${t}
    </div>
  </div>
</div>`;document.querySelector("#"+s).innerHTML=o;let r=document.getElementById("liveToast");bootstrap.Toast.getOrCreateInstance(r).show()}async function z(s,e){try{e&&await e()}catch(t){document.querySelector("#messageSection").innerHTML=a("alert-danger",t.message||t)}}async function R(){try{if(await f(),q("#menuSection"),!g())throw new Error("Veuillez vous authentifier");S(!0),await V();let s=new URLSearchParams(window.location.search);if(s.has("paramid"))await Q("mainActiveSection",s.get("paramid"));else throw new Error("Pas de paramid");S(!1),j("#footerDisplay")}catch(s){document.querySelector("#messageSection").innerHTML=a("alert-danger",s.message||s)}}async function Q(s,e){let t="test",o={},r=`
        <div class="page-content" style="margin-top:60px" >
            ${w("page de test","bi-people")}
            <div class="page-body">
                <div id ="blockName1"></div>
                <div id ="blockName2"></div>

            </div>
        </div >
        `;document.querySelector("#"+s).innerHTML=r,X("blockName1",o),ee("blockName2",t)}function X(s,e){let n=`<div class="card shadow-sm  border border-1 component-block" >
        <div class="card-body p-2 mb-4 " >
                ${F("Bloc test",'<i class="bi bi-person"></i>',[{id:"editBtn",label:"Modifier",icon:"bi-pencil"},{id:"deleteBtn",label:"Supprimer",icon:"bi-trash"}])}
                <div class="card-title block-bodycontent" id="customerBloc">
                    <!-- example of a block-bodycontent -->
                
                </div>
            </div >
        </div>`;document.querySelector("#"+s).innerHTML=n;let u=`
     <form class="row ">
        ${x("Name",e.name)}
         ${x("adresse",e.address)}       
         </br><hr/>

         ${D("Ville","townid","","Veuillez saisir la ville","saisir la ville")}
       </br>
       <hr/>
        <div id="selector1"></div>
        </br>
        <hr/>
        </br>
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label">Choisir un produitauto</label>
          <div id="autocomplete1"></div>
      </div>
        

        
    </form>
     </br><hr/>
    <div class="col-2">
    <button class="btn btn-secondary" id="testbutton1"> bouton de test </button>
    </div>
      <div class="col-2">
    <button class="btn btn-secondary" id="testbutton2"> bouton de test </button>
    </div>
  
    `;document.querySelector("#customerBloc").innerHTML=u;let d=new m("#autocomplete1",{apiUrl:i("wsUrlformel"),apiKey:c(),placeholder:"Tapez pour rechercher un produit (autocomplete)..."});function h(){K({data:1234},async()=>{I("modalSection","Nouvelle commande","Commande cr\xE9\xE9e avec succ\xE8s")})}document.querySelector("#testbutton1").addEventListener("click",h);function p(){z({data:1234},async()=>{I("modalSection","Nouvelle commande","Commande cr\xE9\xE9e avec succ\xE8s")})}document.querySelector("#testbutton2").addEventListener("click",p)}async function ee(s){try{let e="";e+=`
        <div style="margin-top:60px">
  
            ${w("Search customer","bi-person")}
             <div id='componentMessage'></div>
            <div class="col-6">
                <div class="row">  
                    <div class="col-8" style="margin:2px">
                        <input type="text" class="form-control " name="searchString" id="searchString" placeholder="" value=""/>
                    </div>
                    <div class="col-2" style="margin:2px">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal" id="myBtnCompute">Chercher</button>
                    </div>
                </div>
            </div>

        </div> 
   
        <div class="col-md-12 main" style="padding:10px" id="resultDisplay">
        </div >
        <div class="col-md-12 main" style="padding:10px" id="footerDisplay">
        </div >`,document.querySelector("#"+s).innerHTML=e,document.querySelector("#searchString").addEventListener("keypress",async function(t){try{t.keyCode===13&&await W()}catch(o){document.querySelector("#messageSection").innerHTML=a("alert-danger",o.message||o)}}),document.querySelector("#myBtnCompute").onclick=async function(){try{await W()}catch(t){document.querySelector("#messageSection").innerHTML=a("alert-danger",t.message||t)}}}catch(e){document.querySelector("#messageSection").innerHTML=a("alert-danger",e.message||e)}}async function W(){let s=[],e="";s.map(t=>{e+=`
        <div class="row" >
            <div class="col-3" > 
                <span class="customerLink" customerid="${t.id}" style="cursor: pointer">${t.name}</span>
            </div> 
            <div class="col-3  "> 
                ${t.email}
            </div> 
            <div class="col-6 ">   
                ${t.address}, ${t.zip}, ${t.town}      
            </div>
        </div >
         <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />`}),document.querySelector("#resultDisplay").innerHTML=e,C(".customerLink",function(t){window.location.href=`${l()}/views/manageCustomer/customer?customerID=`+t.currentTarget.getAttribute("customerid")})}R();})();
