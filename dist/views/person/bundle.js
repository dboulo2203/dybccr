(()=>{function X(o){return o.split("-").reverse().join("-")}async function H(){let e=await fetch("../../shared/assets/configuration.json");if(e.ok){let t=await e.json();return sessionStorage.setItem("configuration",JSON.stringify(t)),!0}else throw console.log(`getConfigurationFromJson Error : ${JSON.stringify(e)}`),new Error("getConfigurationFromJson Error message : "+e.status+" "+e.statusText)}function l(o){let e=sessionStorage.getItem("configuration"),t=JSON.parse(e),s=Object.keys(t).indexOf(o);if(s>=0)return Object.values(t)[s];throw new Error("configuration value not found "+o)}function ot(o,e){let t;return!e||e&&e.length===0?t="":t=`<i class="bi ${e}"></i>`,`        
            <div class="d-flex  justify-content-between" style="margin-top:0px" >
                <span class="fs-4 text-danger-emphasis"  >${t} ${o}</span>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
                `}function tt(o,e="",t=[]){let s="";return t.length>0&&(s=`
                    <div class="dropdown">
                        <a href="#" data-bs-toggle="dropdown" aria-expanded="false" class="text-secondary"><i class="bi bi-three-dots-vertical"></i></a>
                        <ul class="dropdown-menu" style="padding:10px">
                            ${t.map(r=>{if(r.active){let S=r.icon?`<i class="bi ${r.icon}"></i> `:"";return`<li><a class="dropdown-item" href="#" id="${r.id}">${S}${r.label}</a></li>`}}).join("")}
                        </ul>
                    </div>`),`
        <div class="card-title block-title">
            <div class="d-flex justify-content-between">
                <span class="fs-5 text-danger-emphasis block-label text-nowrap" >${e} ${o}</span>
                <div class="col-8 flex float-right text-end bloc-menu" style="cursor: pointer">
                    ${s}
                </div>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
        </div>`}function nt(o=[]){return`
    <div class="dropdown d-inline-block">
        <a href="#" data-bs-toggle="dropdown" aria-expanded="false" class="text-secondary"><i class="bi bi-three-dots-vertical"></i></a>
        <ul class="dropdown-menu" style="padding:10px">
            ${o.map(t=>{if(t.active){let s=t.icon?`<i class="bi ${t.icon}"></i> `:"";return`<li><a class="dropdown-item" href="#" id="${t.id}">${s}${t.label}</a></li>`}}).join("")}
        </ul>
    </div>`}function O(o,e){return e!==null&&e!==""?`<div class=""  > <span class="fw-light" >${o}</span> : ${e}</div>`:`<div class="" > <span class="fw-light" >${o}</span> : </div > `}function j(o,e,t,s="",n=""){return`<div class="form-group row ">
            <label class="fw-light col-sm-2 " for="${e}">${o}</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="${e}" aria-describedby="emailHelp" id="${e}" 
                placeholder="${n}" value="${t}" >
                    <small id="emailHelp" class="form-text text-muted">${s}</small>
            </div>
          </div>`}function rt(o,e,t,s="",n=""){return`<div class="form-group row">
        <label class="fw-light col-sm-2" for="${e}">${o}</label>
        <div class="col-sm-10">
            <input type="Date" class="form-control" id="${e}" aria-describedby="emailHelp" value="${t}" placeholder="${n}">
                <small id="emailHelp" class="form-text text-muted">${s}</small>
        </div>
    </div>`}function C(o,e){return`<div class="alert ${o} alert-dismissible fade show" style="margin-top:60px" role="alert">
            ${e}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`}function k(){let o=location.pathname,e=o.indexOf("/views/");return e>=0?window.location.origin+o.substring(0,e):window.location.origin}function _(o){if(!o)return"";let e=new Date(o*1e3);return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function f(o){return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2,minimumFractionDigits:2}).format(parseFloat(o))}async function et(o,e){console.log("getLogin Service start"),sessionStorage.setItem("loggedUSer","");let t=l("wsUrlformel")+"login",s=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({login:o,password:e,entity:"",reset:0})});if(s.ok){let n=await s.json();return n.success.username=o,delete n.success.message,sessionStorage.setItem("loggedUSer",JSON.stringify(n.success)),!0}else return sessionStorage.setItem("loggedUSer",""),!1}function at(){return!0}function m(){return"5z7dAN7TM4psDIuAY2yzsa28HaAl856T"}function it(){sessionStorage.removeItem("loggedUSer","")}function lt(){let o=sessionStorage.getItem("loggedUSer");return o?JSON.parse(o).username:""}async function q(o){let e=l("wsUrlformel")+`thirdparties/${o}?DOLAPIKEY=${m()}`,s=await fetch(e+"",{method:"GET",headers:{"Content-Type":"application/json"},params:{sortfield:"name",limit:500}});if(s.ok){let n=await s.json();return sessionStorage.setItem("customer",JSON.stringify(n)),n}else throw console.log(`getCustomer Error : ${JSON.stringify(s)}`),new Error("getCustomer Error message : "+s.status+" "+s.statusText)}async function ct(o,e){if(!e.name)throw Error("Veuillez saisir les nom pr\xE9nom");if(e.email&&e.email.length>0&&!/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e.email))throw Error("email invalide");if(!e.civility)throw Error("Veuillez saisir votre la civilit\xE9");let t=l("wsUrlformel")+`thirdparties/${o.id}?DOLAPIKEY=${m()}`,s=await fetch(t,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:e.phone,name:e.name,address:e.address,zip:e.zip,town:e.town,email:e.email,country_id:e.country_id,array_options:{options_thi_civility:e.civility,options_thi_birthday:e.birthday}})});if(s.ok){let n=await s.json();sessionStorage.setItem("customer",JSON.stringify(n))}else throw console.log(`putCustomerUpdate Error: ${JSON.stringify(s)} `),new Error("putCustomerUpdate Error : "+s.status+" "+s.statusText)}async function dt(o){let e=l("wsUrlformel")+`thirdparties/${o}?DOLAPIKEY=${m()}`,s=await fetch(e+"",{method:"DELETE",headers:{"Content-Type":"application/json"}});if(s.ok)return await s.json();throw console.log(`getCustomer Error : ${JSON.stringify(s)}`),new Error("getCustomer Error message : "+s.status+" "+s.statusText)}async function Y(o){let e=l("wsUrlformel")+`invoices?thirdparty_ids=${o}&DOLAPIKEY=${m()}&sortfield=datec&sortorder=DESC
`,t=await fetch(e,{method:"GET",headers:{"Content-Type":"application/json"}});if(t.status===404||t.ok===!1&&t.status==="404")return null;if(t.ok){if(t.status==="404")return null;let s=t.json();return sessionStorage.setItem("customerInvoices",JSON.stringify(s)),s}else throw console.log(`getCustomerOrders Error: ${JSON.stringify(t)} `),new Error("getCustomerOrders Error message : "+t.status+" "+t.statusText)}function st(o){let e=sessionStorage.getItem(o);return e?JSON.parse(e):null}function B(o,e,t,s){let n="";return st(o).map(r=>{s&&s===r[e]?n+=`<option value="${r[e]}" selected>${r[t]}</option>`:n+=`<option value="${r[e]}">${r[t]}</option>`}),n}function ut(o,e,t){let s=st(o);return s&&s.find(r=>r[e]===t)||null}async function mt(){let o=sessionStorage.getItem("yearexercice");if(JSON.parse(o))return!0;let t=l("wsUrlformel")+`dybccrapi/yearexercices?DOLAPIKEY=${m()}&sortorder=ASC&limit=100&active=1`,s=await fetch(t);if(s.ok){let n=await s.json();return sessionStorage.setItem("yearexercice",JSON.stringify(n)),!0}else throw new Error("loadYearExerciceTable Error : "+s.status+" "+s.statusText)}async function pt(){let o=sessionStorage.getItem("typeactivities");if(JSON.parse(o))return!0;let t=l("wsUrlformel")+`dybccrapi/typeactivities?DOLAPIKEY=${m()}&sortorder=ASC&limit=100&active=1`,s=await fetch(t);if(s.ok){let n=await s.json();return sessionStorage.setItem("typeactivities",JSON.stringify(n)),!0}else throw new Error("loadYearExerciceTable Error : "+s.status+" "+s.statusText)}async function ft(){let o=sessionStorage.getItem("typedomains");if(JSON.parse(o))return!0;let t=l("wsUrlformel")+`dybccrapi/typedomains?DOLAPIKEY=${m()}&sortorder=ASC&limit=100&active=1`,s=await fetch(t);if(s.ok){let n=await s.json();return sessionStorage.setItem("typedomains",JSON.stringify(n)),!0}else throw new Error("loadYearExerciceTable Error : "+s.status+" "+s.statusText)}function gt(o){let e=st("yearexercice");return e?e.find(s=>String(s.rowid)===String(o))?.label??o??"":o??""}async function yt(){let o=sessionStorage.getItem("typecivilities");if(JSON.parse(o))return!0;let t=l("wsUrlformel")+`setup/dictionary/civilities?DOLAPIKEY=${m()}&sortorder=ASC&limit=100&active=1`,s=await fetch(t);if(s.ok){let n=await s.json();return sessionStorage.setItem("typecivilities",JSON.stringify(n)),!0}else throw console.log(`getCustomerCivilitiesTable Error : ${JSON.stringify(s)}`),new Error("getCustomerCivilitiesTable Error message : "+s.status+" "+s.statusText)}async function ht(){let o=sessionStorage.getItem("paymenttypes");if(JSON.parse(o))return!0;let t=l("wsUrlformel")+`setup/dictionary/payment_types?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${m()}`,s=await fetch(t);if(s.ok){let n=await s.json();return sessionStorage.setItem("paymenttypes",JSON.stringify(n)),!0}else throw console.log(`getPaymentTypes Error : ${JSON.stringify(s)}`),new Error("getPaymentTypes Error message : "+s.status+" "+s.statusText)}function U(){let o=sessionStorage.getItem("paymenttypes");return JSON.parse(o)}async function bt(o,e){let t="editPersonModal-"+Math.random().toString(36).substring(2,9),s=o.array_options?.options_thi_civility??"",n=B("typecivilities","rowid","label",s),r=`
    <div class="modal fade" id="${t}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5 text-danger-emphasis">
              <i class="bi bi-pencil me-2"></i>Modifier adh\xE9rent
            </span>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="${t}-alert"></div>
            <form>
              <div class="form-group row mb-2">
                <label class="fw-light col-sm-2">Civilit\xE9</label>
                <div class="col-sm-10">
                  <select class="form-select" id="${t}-civility">
                    ${n}
                  </select>
                </div>
              </div>
              ${j("Nom",`${t}-name`,o.name??"")}
              <div class="form-group row mb-2">
                <label class="fw-light col-sm-2">Email</label>
                <div class="col-sm-10">
                  <input type="text" class="form-control" value="${o.email??""}" disabled>
                </div>
              </div>
              ${j("T\xE9l\xE9phone",`${t}-phone`,o.phone??"")}
              ${j("Adresse",`${t}-address`,o.address??"")}
              ${j("Code postal",`${t}-zip`,o.zip??"")}
              ${j("Ville",`${t}-town`,o.town??"")}
              ${rt("Date de naissance",`${t}-birthday`,_(o.array_options?.options_thi_birthday))}
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="${t}-cancel">Annuler</button>
            <button type="button" class="btn btn-primary" id="${t}-save">
              <i class="bi bi-floppy me-1"></i>Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>`;return new Promise(S=>{let u=document.createElement("div");u.innerHTML=r,document.body.appendChild(u);let I=document.getElementById(t),g=new bootstrap.Modal(I),p=E=>{g.hide(),I.addEventListener("hidden.bs.modal",()=>u.remove(),{once:!0}),S(E)};I.querySelector(".btn-close").addEventListener("click",()=>p(!1)),document.getElementById(`${t}-cancel`).addEventListener("click",()=>p(!1)),document.getElementById(`${t}-save`).addEventListener("click",async()=>{try{let E={name:document.getElementById(`${t}-name`).value,phone:document.getElementById(`${t}-phone`).value,address:document.getElementById(`${t}-address`).value,zip:document.getElementById(`${t}-zip`).value,town:document.getElementById(`${t}-town`).value,civility:document.getElementById(`${t}-civility`).value,birthday:document.getElementById(`${t}-birthday`).value?Math.floor(new Date(document.getElementById(`${t}-birthday`).value).getTime()/1e3):""};await ct(o,E),p(!0),e&&await e()}catch(E){document.getElementById(`${t}-alert`).innerHTML=C("alert-danger",E.message||E)}}),g.show()})}var N=class{constructor(e,t={}){if(typeof e=="string"?this.container=document.querySelector(e):this.container=e,!this.container)throw new Error("Container element not found");this.items=[],this.filteredItems=[],this.selectedItem=null,this.uniqueId="autocomplete-"+Math.random().toString(36).substr(2,9),this.options={apiUrl:t.apiUrl||null,apiKey:t.apiKey||null,selectedId:t.selectedId||null,labelField:t.labelField||"label",valueField:t.valueField||"id",placeholder:t.placeholder||"Tapez pour rechercher...",minChars:t.minChars||1,onChange:t.onChange||null,onInput:t.onInput||null,onLoad:t.onLoad||null},this.render(),this.setupEventListeners(),this.options.apiUrl&&this.loadData()}render(){this.container.innerHTML=`
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
        `,this.input=this.container.querySelector("input"),this.menu=this.container.querySelector(".dropdown-menu"),this.clearIcon=this.container.querySelector(".bi-x-circle"),this.toggleIcon=this.container.querySelector(".bi-chevron-down")}setupEventListeners(){!this.input||!this.menu||(this.input.addEventListener("input",e=>{let t=e.target.value.trim();t.length>=this.options.minChars?(this.filterItems(t),this.showDropdown()):this.hideDropdown(),typeof this.options.onInput=="function"&&this.options.onInput(t)}),this.input.addEventListener("focus",()=>{let e=this.input.value.trim();e.length>=this.options.minChars&&(this.filterItems(e),this.showDropdown())}),document.addEventListener("click",e=>{this.container.contains(e.target)||this.hideDropdown()}),this.menu.addEventListener("click",e=>{e.stopPropagation()}),this.clearIcon&&this.clearIcon.addEventListener("click",e=>{e.stopPropagation(),this.clear(),this.input.focus()}),this.toggleIcon&&this.toggleIcon.addEventListener("click",e=>{e.stopPropagation(),this.menu.style.display==="block"?this.hideDropdown():(this.showAllItems(),this.showDropdown()),this.input.focus()}))}async loadData(){try{let e=this.options.apiUrl;if(this.options.apiKey){let n=e.includes("?")?"&":"?";e+=`${n}DOLAPIKEY=${this.options.apiKey}`}let t=await fetch(e);if(!t.ok)throw new Error(`HTTP error! status: ${t.status}`);let s=await t.json();this.items=Array.isArray(s)?s:[],this.options.selectedId&&this.selectById(this.options.selectedId),typeof this.options.onLoad=="function"&&this.options.onLoad(this.items)}catch(e){console.error("Error loading data:",e),this.showError("Erreur de chargement des donn\xE9es")}}showError(e){this.menu&&(this.menu.innerHTML=`
                <div class="dropdown-item text-center text-danger">${e}</div>
            `)}filterItems(e){if(!e||e.length<this.options.minChars){this.filteredItems=[];return}let t=e.toLowerCase();this.filteredItems=this.items.filter(s=>{let n=(s[this.options.labelField]||"").toLowerCase(),r=(s.ref||"").toLowerCase();return n.includes(t)||r.includes(t)}),this.renderFilteredItems()}renderFilteredItems(){if(!this.menu)return;if(this.filteredItems.length===0){this.menu.innerHTML=`
                <div class="dropdown-item text-center text-muted">Aucun r\xE9sultat trouv\xE9</div>
            `;return}let e=this.filteredItems.map(t=>{let s=t[this.options.valueField],n=t[this.options.labelField]||"Sans titre",r=t.ref?`<small class="text-muted me-2">${t.ref}</small>`:"";return`
                <a class="dropdown-item" href="#" data-value="${s}">
                    ${r!==""?r+" -"+n:n}
                </a>
            `}).join("");this.menu.innerHTML=e,this.menu.querySelectorAll("a.dropdown-item[data-value]").forEach(t=>{t.addEventListener("click",s=>{s.preventDefault();let n=t.getAttribute("data-value");this.selectByValue(n),this.hideDropdown()})})}showAllItems(){this.filteredItems=[...this.items],this.renderFilteredItems()}showDropdown(){this.menu&&(this.menu.style.display="block")}hideDropdown(){this.menu&&(this.menu.style.display="none")}selectByValue(e){let t=this.items.find(s=>String(s[this.options.valueField])===String(e));return t?(this.selectedItem=t,this.updateInputValue(),typeof this.options.onChange=="function"&&this.options.onChange(this.getValue(),this.getSelectedItem()),!0):!1}selectById(e){return this.selectByValue(e)}updateInputValue(){if(this.input&&this.selectedItem){let e=this.selectedItem[this.options.labelField]||"Sans titre",t=this.selectedItem.ref?`${this.selectedItem.ref} - `:"";this.input.value=t+e}this.updateClearIcon()}updateClearIcon(){this.clearIcon&&(this.clearIcon.style.display=this.selectedItem?"block":"none")}getValue(){return this.selectedItem?this.selectedItem[this.options.valueField]:null}getSelectedItem(){return this.selectedItem}setValue(e){return this.selectByValue(e)}clear(){this.selectedItem=null,this.input&&(this.input.value=""),this.hideDropdown(),this.updateClearIcon(),typeof this.options.onChange=="function"&&this.options.onChange(null,null)}setItems(e){this.items=Array.isArray(e)?e:[]}setPlaceholder(e){this.options.placeholder=e,this.input&&(this.input.placeholder=e)}destroy(){this.container&&(this.container.innerHTML="")}};async function K(){let o=sessionStorage.getItem("products");if(JSON.parse(o))return!0;let t=l("wsUrlformel")+`products?DOLAPIKEY=${m()}&limit=5000`,n=await fetch(t+"");if(n.ok){let r=await n.json();return sessionStorage.setItem("products",JSON.stringify(r)),r}else throw console.log(`getProducts Error : ${JSON.stringify(n)}`),new Error("getProducts Error message : "+n.status+" "+n.statusText)}function V(){let o=sessionStorage.getItem("products");return JSON.parse(o).filter(t=>t.status==="1")}async function vt(o,e,t={}){let s=l("wsUrlformel")+`invoices?DOLAPIKEY=${m()}`,n=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({socid:Number(o),array_options:{options_inv_culturalseason:t.culturalseason??""},lines:e.map(r=>({fk_product:r.fk_product,desc:r.desc,qty:r.qty,subprice:r.subprice}))})});if(n.ok)return await n.json();throw new Error("createInvoice Error : "+n.status+" "+n.statusText)}async function R(o){let e=l("wsUrlformel")+`invoices/${o.id}/validate?DOLAPIKEY=${m()}`,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idwarehouse:0})});if(t.ok)return!0;throw new Error("validateInvoice Error : "+t.status+" "+t.statusText)}async function wt(o){let e=l("wsUrlformel")+`dklaccueil/${o.id}/setinvoicetocancelled?DOLAPIKEY=${m()}`,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"}});if(t.ok)return await t.json();throw new Error("cancelInvoice Error : "+t.status+" "+t.statusText)}async function $t(o){let e=l("wsUrlformel")+`invoices/${o.id}/settodraft?DOLAPIKEY=${m()}`,t=await fetch(e,{method:"POST",headers:{"Content-Type":"application/json"}});if(t.ok)return await t.json();throw new Error("validateOrder Error : "+t.status+" "+t.statusText)}async function z(o,e,t,s,n){let r=n===null?{[o.id]:{amount:t,multicurrency_amount:""}}:n,S=l("wsUrlformel")+`invoices/paymentsdistributed/?DOLAPIKEY=${m()}`,u=await fetch(S,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({arrayofamounts:r,datepaye:Math.floor(Date.now()/1e3),paymentid:e.id,closepaidinvoices:"yes",accountid:1,num_paiement:"",chqemetteur:s,fk_paiement:e.id,accepthigherpayment:!0})});if(u.ok)return await u.json();throw new Error("createInvoicePayment Error : "+u.status+" "+u.statusText)}async function Et(o){let e=l("wsUrlformel")+`invoices/${o}/payments?DOLAPIKEY=${m()}`,t=await fetch(e,{method:"GET",headers:{"Content-Type":"application/json"}});if(t.ok){let s=await t.json();return sessionStorage.setItem("invoice",JSON.stringify(s)),s}else throw console.log(`getInvoice Error : ${JSON.stringify(t)}`),new Error("getInvoice Error message : "+t.status+" "+t.statusText)}async function xt(o,e){let t=l("wsUrlformel")+`invoices/${o}?DOLAPIKEY=${m()}`,s=await fetch(t,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)});if(s.ok)return await s.json();throw new Error("updateInvoiceHeader Error : "+s.status+" "+s.statusText)}async function It(o,e){let t=l("wsUrlformel")+`invoices/${o}/lines?DOLAPIKEY=${m()}`,s=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fk_product:e.fk_product,desc:e.desc,qty:e.qty,subprice:e.subprice})});if(s.ok)return await s.json();throw new Error("addInvoiceLine Error : "+s.status+" "+s.statusText)}async function St(o,e){let t=l("wsUrlformel")+`invoices/${o}/lines/${e}?DOLAPIKEY=${m()}`,s=await fetch(t,{method:"DELETE",headers:{"Content-Type":"application/json"}});if(s.ok)return!0;throw new Error("deleteInvoiceLine Error : "+s.status+" "+s.statusText)}async function Tt(o,e){let t="createInvoiceModal-"+Math.random().toString(36).substring(2,9),s=`
    <div class="modal fade" id="${t}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5">
              <i class="bi bi-receipt me-2"></i>Cr\xE9er une facture \u2014 ${o.name}
            </span>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="${t}-alert"></div>
            <div class="mb-3 col-6">
              <label class="fw-light mb-1 ">Saison culturelle</label>
              <select class="form-select" id="${t}-culturalseason" required>
                <option value="">\u2014</option>
                ${B("yearexercice","rowid","label",null)}
              </select>
            </div>
            <div class="mb-3">
              <label class="fw-light mb-1">Ajouter un produit</label>
              <div id="${t}-autocomplete"></div>
            </div>
            <div id="${t}-lines">
              <p class="text-muted small">Aucun produit ajout\xE9.</p>
            </div>
            <div class="text-end fw-semibold fs-5 mt-2 border-top pt-2">
              Total : <span id="${t}-total">0,00 \u20AC</span>
            </div>
            <div class="border-top mt-3 pt-2">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-semibold">Paiements</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="${t}-add-payment">
                  <i class="bi bi-plus"></i> Ajouter
                </button>
              </div>
              <div id="${t}-payments"><p class="text-muted small">Aucun paiement.</p></div>
              <div class="text-end small text-muted mt-1">
                Reste \xE0 payer : <span id="${t}-remaining">0,00 \u20AC</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="${t}-cancel">Annuler</button>
            <button type="button" class="btn btn-primary" id="${t}-save">
              <i class="bi bi-floppy me-1"></i>Sauver
            </button>
          </div>
        </div>
      </div>
    </div>`;await K();let n=V().map(r=>({...r,display:` ${r.label}`}));return new Promise(r=>{let S=document.createElement("div");S.innerHTML=s,document.body.appendChild(S);let u=document.getElementById(t),I=new bootstrap.Modal(u),g=[],p=[],E=c=>{I.hide(),u.addEventListener("hidden.bs.modal",()=>S.remove(),{once:!0}),r(c)},h=()=>g.reduce((c,d)=>c+d.qty*d.subprice,0),x=()=>p.reduce((c,d)=>c+d.amount,0),D=()=>{document.getElementById(`${t}-total`).textContent=f(h()),document.getElementById(`${t}-remaining`).textContent=f(h()-x())},F=()=>{let c=U()||[],d=document.getElementById(`${t}-payments`);if(p.length===0){d.innerHTML='<p class="text-muted small">Aucun paiement.</p>';return}let y=T=>c.map(L=>`<option value="${L.id}" ${String(L.id)===String(T)?"selected":""}>${L.code}</option>`).join(""),b='<div class="d-flex flex-column gap-2">';p.forEach((T,L)=>{b+=`<div class="d-flex gap-2 align-items-center">
          <select class="form-select form-select-sm" style="width:110px" id="${t}-ptype-${L}">${y(T.type?.id)}</select>
          <input type="number" class="form-control form-control-sm" style="width:120px" id="${t}-pamount-${L}" value="${T.amount}" min="0" step="0.01">
          <button type="button" class="btn btn-sm btn-outline-danger" id="${t}-pdel-${L}"><i class="bi bi-trash"></i></button>
        </div>`}),b+="</div>",d.innerHTML=b,p.forEach((T,L)=>{document.getElementById(`${t}-ptype-${L}`).addEventListener("change",a=>{T.type=c.find(i=>String(i.id)===a.target.value)||c[0]}),document.getElementById(`${t}-pamount-${L}`).addEventListener("input",a=>{T.amount=Number.parseFloat(a.target.value)||0,document.getElementById(`${t}-remaining`).textContent=f(h()-x())}),document.getElementById(`${t}-pdel-${L}`).addEventListener("click",()=>{p.splice(L,1),F(),document.getElementById(`${t}-remaining`).textContent=f(h()-x())})})},J=()=>{let c=document.getElementById(`${t}-lines`);if(g.length===0){c.innerHTML='<p class="text-muted small">Aucun produit ajout\xE9.</p>';return}let d=`<div style="overflow-x: auto;"><table class="table table-sm align-middle">
        <thead><tr>
          <th class="fw-semibold">Produit</th>
          <th class="fw-semibold" style="width:90px">Qt\xE9</th>
          <th class="fw-semibold" style="width:110px">Prix unit.</th>
          <th class="fw-semibold" style="width:110px" class="text-end">Sous-total</th>
          <th class="fw-semibold" style="width:40px"></th>
        </tr></thead><tbody>`;g.forEach((y,b)=>{d+=`<tr>
          <td>${y.desc}</td>
          <td><input type="number" class="form-control form-control-sm" id="${t}-qty-${b}" value="${y.qty}" min="1" step="1"></td>
          <td><input type="number" class="form-control form-control-sm" id="${t}-price-${b}" value="${y.subprice}" step="0.01"></td>
          <td class="text-end" id="${t}-sub-${b}">${f(y.qty*y.subprice)}</td>
          <td><button type="button" class="btn btn-sm btn-outline-danger" id="${t}-del-${b}"><i class="bi bi-trash"></i></button></td>
        </tr>`}),d+="</tbody></table></div>",c.innerHTML=d,g.forEach((y,b)=>{document.getElementById(`${t}-qty-${b}`).addEventListener("input",T=>{y.qty=Number.parseFloat(T.target.value)||0,document.getElementById(`${t}-sub-${b}`).textContent=f(y.qty*y.subprice),D()}),document.getElementById(`${t}-price-${b}`).addEventListener("input",T=>{y.subprice=Number.parseFloat(T.target.value)||0,document.getElementById(`${t}-sub-${b}`).textContent=f(y.qty*y.subprice),D()}),document.getElementById(`${t}-del-${b}`).addEventListener("click",()=>{g.splice(b,1),J(),D()})})},M=new N(`#${t}-autocomplete`,{labelField:"display",valueField:"id",placeholder:"Rechercher un produit...",onChange:(c,d)=>{d&&(g.push({fk_product:d.id,desc:d.display,qty:1,subprice:Number.parseFloat(d.price)||Number.parseFloat(d.price_ttc)||0}),J(),D(),M.clear())}});M.setItems(n),u.querySelector(".btn-close").addEventListener("click",()=>E(!1)),document.getElementById(`${t}-cancel`).addEventListener("click",()=>E(!1)),document.getElementById(`${t}-add-payment`).addEventListener("click",()=>{let c=U()||[];if(c.length===0)return;let d=Math.max(h()-x(),0);p.push({type:c[0],amount:d}),F(),document.getElementById(`${t}-remaining`).textContent=f(h()-x())}),document.getElementById(`${t}-save`).addEventListener("click",async()=>{try{let c=document.getElementById(`${t}-culturalseason`).value;if(!c)throw new Error("Veuillez choisir une saison culturelle");if(g.length===0)throw new Error("Veuillez ajouter au moins un produit");if(x()>h())throw new Error("Le total des paiements d\xE9passe le montant de la facture");let d=await vt(o.id,g,{culturalseason:c});await R({id:d});for(let y of p)y.amount>0&&await z({id:d},y.type,y.amount,"",null);E(!0),e&&await e()}catch(c){document.getElementById(`${t}-alert`).innerHTML=C("alert-danger",c.message||c)}}),I.show()})}async function Lt(o,e,t){let s="editInvoiceModal-"+Math.random().toString(36).substring(2,9),n=o.array_options?.options_inv_culturalseason??"",r=`
    <div class="modal fade" id="${s}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5">
              <i class="bi bi-receipt me-2"></i>Modifier facture ${o.ref} \u2014 ${e.name}
            </span>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="${s}-alert"></div>
            <div class="mb-3 col-6">
              <label class="fw-light mb-1">Saison culturelle</label>
              <select class="form-select" id="${s}-culturalseason" required>
                <option value="">\u2014</option>
                ${B("yearexercice","rowid","label",n)}
              </select>
            </div>
            <div class="mb-3">
              <label class="fw-light mb-1">Ajouter un produit</label>
              <div id="${s}-autocomplete"></div>
            </div>
            <div id="${s}-lines">
              <p class="text-muted small">Aucun produit ajout\xE9.</p>
            </div>
            <div class="text-end fw-semibold fs-5 mt-2 border-top pt-2">
              Total : <span id="${s}-total">0,00 \u20AC</span>
            </div>
            <div class="border-top mt-3 pt-2">
              <span class="fw-semibold">Paiements</span>
              <div id="${s}-existing-payments" class="mt-2"></div>
              <div class="d-flex justify-content-between align-items-center mb-2 mt-2">
                <span class="text-muted small">Nouveaux paiements</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" id="${s}-add-payment">
                  <i class="bi bi-plus"></i> Ajouter
                </button>
              </div>
              <div id="${s}-payments"><p class="text-muted small">Aucun nouveau paiement.</p></div>
              <div class="text-end small text-muted mt-1">
                Reste \xE0 payer : <span id="${s}-remaining">0,00 \u20AC</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="${s}-cancel">Annuler</button>
            <button type="button" class="btn btn-primary" id="${s}-save">
              <i class="bi bi-floppy me-1"></i>Sauver
            </button>
          </div>
        </div>
      </div>
    </div>`;await K();let[S,u]=await Promise.all([Promise.resolve(V().map(I=>({...I,display:` ${I.label}`}))),Et(o.id).catch(()=>[])]);return new Promise(I=>{let g=document.createElement("div");g.innerHTML=r,document.body.appendChild(g);let p=document.getElementById(s),E=new bootstrap.Modal(p);if(n){let a=document.getElementById(`${s}-culturalseason`);a&&(a.value=String(n))}let h=(o.lines||[]).map(a=>({id:a.id,fk_product:a.fk_product,desc:a.desc??a.product_label??"",qty:Number(a.qty)||1,subprice:Number(a.subprice)||0})),x=[],D=u.reduce((a,i)=>a+Number(i.amount??0),0),F=a=>{E.hide(),p.addEventListener("hidden.bs.modal",()=>g.rproduitsemove(),{once:!0}),I(a)},J=()=>h.reduce((a,i)=>a+i.qty*i.subprice,0),M=()=>x.reduce((a,i)=>a+i.amount,0),c=()=>J()-D-M(),d=()=>{document.getElementById(`${s}-total`).textContent=f(J()),document.getElementById(`${s}-remaining`).textContent=f(c())},y=()=>{let a=U()||[],i=document.getElementById(`${s}-existing-payments`);if(!u.length){i.innerHTML="";return}let v='<div class="d-flex flex-column gap-1">';u.forEach(w=>{let A=a.find(P=>String(P.id)===String(w.fk_typepaiement))?.code??"";v+=`<div class="d-flex gap-3 small text-muted border rounded px-2 py-1 bg-light">
          <span class="fw-semibold">${A}</span>
          <span class="flex-grow-1">${f(Number(w.amount??0))}</span>
          <span class="fst-italic">existant</span>
        </div>`}),v+="</div>",i.innerHTML=v},b=()=>{let a=U()||[],i=document.getElementById(`${s}-payments`);if(x.length===0){i.innerHTML='<p class="text-muted small">Aucun paiement.</p>';return}let v=A=>a.map(P=>`<option value="${P.id}" ${String(P.id)===String(A)?"selected":""}>${P.code}</option>`).join(""),w='<div class="d-flex flex-column gap-2">';x.forEach((A,P)=>{w+=`<div class="d-flex gap-2 align-items-center">
          <select class="form-select form-select-sm" style="width:110px" id="${s}-ptype-${P}">${v(A.type?.id)}</select>
          <input type="number" class="form-control form-control-sm" style="width:120px" id="${s}-pamount-${P}" value="${A.amount}" min="0" step="0.01">
          <button type="button" class="btn btn-sm btn-outline-danger" id="${s}-pdel-${P}"><i class="bi bi-trash"></i></button>
        </div>`}),w+="</div>",i.innerHTML=w,x.forEach((A,P)=>{document.getElementById(`${s}-ptype-${P}`).addEventListener("change",Q=>{A.type=a.find(Mt=>String(Mt.id)===Q.target.value)||a[0]}),document.getElementById(`${s}-pamount-${P}`).addEventListener("input",Q=>{A.amount=Number.parseFloat(Q.target.value)||0,document.getElementById(`${s}-remaining`).textContent=f(c())}),document.getElementById(`${s}-pdel-${P}`).addEventListener("click",()=>{x.splice(P,1),b(),document.getElementById(`${s}-remaining`).textContent=f(c())})})},T=()=>{let a=document.getElementById(`${s}-lines`);if(h.length===0){a.innerHTML='<p class="text-muted small">Aucun produit ajout\xE9.</p>',d();return}let i=`<div style="overflow-x: auto;"><table class="table table-sm align-middle">
        <thead><tr>
          <th class="fw-semibold">Produit</th>
          <th class="fw-semibold" style="width:90px">Qt\xE9</th>
          <th class="fw-semibold" style="width:110px">Prix unit.</th>
          <th class="fw-semibold" style="width:110px">Sous-total</th>
          <th style="width:40px"></th>
        </tr></thead><tbody>`;h.forEach((v,w)=>{i+=`<tr>
          <td>${v.desc}</td>
          <td><input type="number" class="form-control form-control-sm" id="${s}-qty-${w}" value="${v.qty}" min="1" step="1"></td>
          <td><input type="number" class="form-control form-control-sm" id="${s}-price-${w}" value="${v.subprice}" step="0.01"></td>
          <td class="text-end" id="${s}-sub-${w}">${f(v.qty*v.subprice)}</td>
          <td><button type="button" class="btn btn-sm btn-outline-danger" id="${s}-del-${w}"><i class="bi bi-trash"></i></button></td>
        </tr>`}),i+="</tbody></table></div>",a.innerHTML=i,h.forEach((v,w)=>{document.getElementById(`${s}-qty-${w}`).addEventListener("input",A=>{v.qty=Number.parseFloat(A.target.value)||0,document.getElementById(`${s}-sub-${w}`).textContent=f(v.qty*v.subprice),d()}),document.getElementById(`${s}-price-${w}`).addEventListener("input",A=>{v.subprice=Number.parseFloat(A.target.value)||0,document.getElementById(`${s}-sub-${w}`).textContent=f(v.qty*v.subprice),d()}),document.getElementById(`${s}-del-${w}`).addEventListener("click",()=>{h.splice(w,1),T(),d()})}),d()},L=new N(`#${s}-autocomplete`,{labelField:"display",valueField:"id",placeholder:"Rechercher un produit...",onChange:(a,i)=>{i&&(h.push({fk_product:i.id,desc:i.display,qty:1,subprice:Number.parseFloat(i.price)||Number.parseFloat(i.price_ttc)||0}),T(),L.clear())}});L.setItems(S),T(),y(),p.querySelector(".btn-close").addEventListener("click",()=>F(!1)),document.getElementById(`${s}-cancel`).addEventListener("click",()=>F(!1)),document.getElementById(`${s}-add-payment`).addEventListener("click",()=>{let a=U()||[];if(a.length===0)return;let i=Math.max(c(),0);x.push({type:a[0],amount:i}),b(),document.getElementById(`${s}-remaining`).textContent=f(c())}),document.getElementById(`${s}-save`).addEventListener("click",async()=>{try{let a=document.getElementById(`${s}-culturalseason`).value;if(!a)throw new Error("Veuillez choisir une saison culturelle");if(h.length===0)throw new Error("Veuillez ajouter au moins un produit");if(D+M()>J())throw new Error("Le total des paiements d\xE9passe le montant de la facture");o.status==="1"&&await $t({id:o.id});for(let i of o.lines||[])await St(o.id,i.id);await xt(o.id,{array_options:{options_inv_culturalseason:a}});for(let i of h)await It(o.id,i);await R({id:o.id});for(let i of x)i.amount>0&&await z({id:o.id},i.type,i.amount,"",null);F(!0),t&&await t()}catch(a){document.getElementById(`${s}-alert`).innerHTML=C("alert-danger",a.message||a)}}),E.show()})}function W(o,e="Confirmation",t={}){let{confirmLabel:s="Confirmer",cancelLabel:n="Annuler",confirmClass:r="btn-secondary",icon:S="bi-exclamation-triangle"}=t,u="confirmActionModal-"+Math.random().toString(36).substr(2,9),I=`
    <div class="modal fade" id="${u}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5 text-danger-emphasis">
              <i class="bi ${S} me-2"></i>${e}
            </span>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-0">${o}</p>
          </div>
          <div class="modal-footer">
            <!-- <button type="button" class="btn btn-secondary" id="${u}-cancel" data-bs-dismiss="modal">${n}</button>
            -->
            <button type="button" class="btn ${r}" id="${u}-confirm">${s}</button>
          </div>
        </div>
      </div>
    </div>`;return new Promise(g=>{let p=document.createElement("div");p.innerHTML=I,document.body.appendChild(p);let E=document.getElementById(u),h=new bootstrap.Modal(E),x=()=>{h.hide(),E.addEventListener("hidden.bs.modal",()=>{p.remove()},{once:!0})};document.getElementById(`${u}-confirm`).addEventListener("click",()=>{x(),g(!0)}),E.querySelector(".btn-close").addEventListener("click",()=>{x(),g(!1)}),h.show()})}async function Ct(o,e){try{if(!await W(`Abandonner la facture ${o.ref} ?`,"Abandonner la facture",{confirmLabel:"Abandonner",confirmClass:"btn-danger"}))return;await wt(o),e&&await e()}catch(t){document.querySelector("#messageSection").innerHTML=C("alert-danger",t.message||t)}}async function Pt(o,e){try{let t=await Y(o.id);if(t&&t.length>0)throw new Error("Un adh\xE9rent ayant des factures ne peut \xEAtre supprim\xE9");if(!await W(`Supprimer l'adh\xE9rent ${o.name} ? Cette action est irr\xE9versible.`,"Supprimer adh\xE9rent",{confirmLabel:"Supprimer",confirmClass:"btn-danger",icon:"bi-trash"}))return;await dt(o.id),e&&await e()}catch(t){document.querySelector("#messageSection").innerHTML=C("alert-danger",t.message||t)}}function At(){document.documentElement.getAttribute("data-bs-theme")==="dark"?(document.documentElement.setAttribute("data-bs-theme","light"),sessionStorage.setItem("theme","light")):(sessionStorage.setItem("theme","dark"),document.documentElement.setAttribute("data-bs-theme","dark"))}function Ot(){let o=sessionStorage.getItem("theme");o&&document.documentElement.setAttribute("data-bs-theme",o)}async function kt(){await H(),await pt(),await ft(),await mt(),await yt(),await ht(),Ot()}var qt=`
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
</div>`;async function Dt(){try{let o=document.createElement("div");o.innerHTML=qt,document.body.appendChild(o),at()?(document.querySelector("#modalbodyLogin").innerHTML=`
        <div id="modalmessage"></div>
        <div class="row" id="loggout">
        Vous \xEAtes authenfifi\xE9 avec le login ${lt()}. 
             </div>
        </div>
            `,document.querySelector("#modalfooter").innerHTML='<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogout">Lougout</button>',document.querySelector("#btnLogout").onclick=async function(){it(),window.location.href=`${k()}/views/mainpage`}):(document.querySelector("#modalbodyLogin").innerHTML=`
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
            `,document.querySelector("#modalfooter").innerHTML='<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogin">Login</button>',$("#modalbodyLogin").on("keydown",async function(t){if(t.keyCode===13){let s=document.querySelector("#userEmailInput").value,n=document.querySelector("#userPasswordInput").value,r=await et(s,n);r?document.querySelector("#modalmessage").innerHTML=`<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Bienvenue ${r.user_pseudo}</div> `:document.querySelector("#modalmessage").innerHTML='<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Nom, password invalides</div> '}}),document.querySelector("#btnLogin").onclick=async function(){let t=document.querySelector("#userEmailInput").value,s=document.querySelector("#userPasswordInput").value;await et(t,s)?window.location.href=`${k()}/views/mainpage`:document.querySelector("#modalmessage").innerHTML='<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert" >Nom, password invalides</div> '}),document.querySelector("#myBtnCancel").onclick=function(){window.location.href=`${k()}/views/mainpage`},new bootstrap.Modal(document.querySelector("#myModalLogin")).show()}catch(o){document.querySelector("#messageSection").innerHTML=C("danger",o)}}var Ht=` 
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
 `,_t={login:()=>Dt(),theme:()=>At()};function Ut(o){document.querySelector("#"+o).innerHTML=Ht;let e=l("leftMenu"),t="";e.map(s=>{switch(s.menuItemType){case"menuitem":t+=`<div  style="margin-bottom:10px;cursor:pointer" ><span id="${s.menuItemid}" class="fs-6"> ${s.menuItemIcon} ${s.menuItemName} </span></div>`;break;case"hr":t+="<hr/>"}}),document.querySelector("#menuplace").innerHTML=t,t="",e.map(s=>{switch(s.menuItemAction){case"functionCall":t+=`<div id="${s.menuItemid}" style="margin-bottom:10px;cursor:pointer" ><span class="fs-6"> ${s.menuItemIcon} ${s.menuItemName} </span></div>`,document.querySelector(`#${s.menuItemid}`).onclick=function(){let n=_t[s.menuItemid];n&&n()};break;case"urlCall":document.querySelector(`#${s.menuItemid}`).onclick=function(){window.location.href=`${k()}/${s.menuItemLink}`};break}})}function Nt(o){let e=`
      <div id="menuPart">
          <nav class="navbar fixed-top bg-body-tertiary" style="border-bottom:solid 0.1rem #C0C0C0; padding:5px">
              <div class="container-fluid">
                  <div class="navbar-brand text-danger-emphasis"  id="mainNav">${l("BrandTitle")}</div>
                  <div class="d-flex">
                  <a class="btn" style="margin-left:3px;cursor:pointer"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample"><i class="bi bi-three-dots-vertical"></i></a >
  
                  </div>
              </div>
          </nav>
        </div>
      <div id="leftMenu">
      </div>
 `;document.querySelector("#"+o).innerHTML=e,Ut("leftMenu")}function Ft(o){let e=`
    <div id="footerPart" style="margin-top:40px">
        <hr style="color:grey"></hr>
        <div class="d-flex justify-content-center" style="">
            <small>${l("version")}</small>
        </div >
        <hr style="color:grey"></hr>
    </div >
        `;document.querySelector(o).innerHTML=e}async function Jt(){try{await H(),Nt("menuSection"),await kt();let o=new URLSearchParams(globalThis.location.search);if(o.has("paramid"))await Yt("mainActiveSection",o.get("paramid"));else throw new Error("Veuillez pr\xE9ciser un id de personne");Ft("#footerDisplay")}catch(o){document.querySelector("#messageSection").innerHTML=C("alert-danger",o.message||o)}}async function Yt(o,e){let t=`
    <div class="page-content" style="margin-top:60px">
      ${ot("Adh\xE9rent","<i class='bi bi-person'></i>")}
      <div id="personIdentity"></div>
      <div id="personPayments"></div>
      <div id="personSubscriptions"></div>
      <div id="personPurchases"></div>
    </div>
  `;document.querySelector("#"+o).innerHTML=t;try{let s=await q(e);Bt("personIdentity",s);let n=await Z("personPayments",e);jt(e),G(e,s,n)}catch(s){document.querySelector("#messageSection").innerHTML=C("alert-danger",s.message||s)}}function G(o,e,t=[]){document.querySelector("#addInvoice").addEventListener("click",async()=>{await Tt(e,async()=>{let s=await Z("personPayments",o);G(o,e,s)})}),t.filter(s=>s.status<2).forEach(s=>{let n=document.getElementById(`editInvoice-${s.id}`);n&&n.addEventListener("click",async()=>{await Lt(s,e,async()=>{let r=await Z("personPayments",o);G(o,e,r)})})}),t.forEach(s=>{let n=document.getElementById(`cancelInvoice-${s.id}`);n&&n.addEventListener("click",async()=>{await Ct(s,async()=>{let r=await Z("personPayments",o);G(o,e,r)})})})}function jt(o){document.querySelector("#deletePerson").addEventListener("click",async()=>{let e=await q(o);await Pt(e,()=>{globalThis.location.href=`${k()}/views/search`})}),document.querySelector("#editPerson").addEventListener("click",async()=>{let e=await q(o);await bt(e,async()=>{let t=await q(o);Bt("personIdentity",t),jt(o)})})}function Bt(o,e){let t=`
    ${tt("Identit\xE9","<i class='bi bi-person'></i>",[{id:"editPerson",label:"Modifier adh\xE9rent",icon:"bi-pencil",active:!0},{id:"deletePerson",label:"Supprimer adh\xE9rent",icon:"bi-trash",active:!0}])}
    <div class="row">
      <div class="col-6">
        ${O("Civilit\xE9",ut("typecivilities","rowid",e.array_options?.options_thi_civility)?.label??"")}
        ${O("Nom",e.name)}
        ${O("Email",e.email)}
        ${O("T\xE9l\xE9phone",e.phone)}
      </div>
      <div class="col-6">
        ${O("Date naissance",e.array_options?.options_thi_birthday?X(_(e.array_options.options_thi_birthday)):"")}
        ${O("Adresse",e.address)}
        ${O("Code postal",e.zip)}
        ${O("Ville",e.town)}
      </div>
    </div>
  `;document.querySelector("#"+o).innerHTML=t}async function Z(o,e){let t=await Y(e),s={0:"Brouillon",1:"Valid\xE9e",2:"Pay\xE9e",3:"Abandonn\xE9e"},n="";return t&&t.length>0?t.forEach(r=>{let S=r.date?X(new Date(r.date*1e3).toISOString().slice(0,10)):"",u=Number(r.total_ttc)-Number(r.remaintopay??r.total_ttc),I=(s[r.status]??r.status)+(u>0&&r.status<2?` (pay\xE9 ${f(u)})`:""),g="";r.lines&&r.lines.length>0&&r.lines.forEach(p=>{g+=`
            <div class="row  "> 
            <span class="col-2 "></span>
            <span class="col-1 ">${p.ref??""}</span>
              <span class="col-4 ">${p.desc??""}</span>
              
              <span class="col-3 ">${f(p.subprice)}</span>
            </div>`}),n+=`
        <li class="list-group-item ">
          <div class="row bg-light bg-gradient" style="padding:5px" >
            <span class="col-3 fw-semibold">${gt(r.array_options?.options_inv_culturalseason)??""}</span>
            
            <span class="col-3 ">${S}</span>
            <span class="col-2 fw-semibold">${f(r.total_ttc)}</span>
            <span class="col-3 fw-semibold">${I}</span>
            <span class="col-1 ">
                    ${nt([{id:`editInvoice-${r.id}`,label:"Modifier",icon:"bi-pencil",active:r.status<2},{id:`cancelInvoice-${r.id}`,label:"Abandonner",icon:"bi-trash",active:r.status<2&&u===0}])}
            </span >

          </div >
    ${g}
        </li > `}):n='<li class="list-group-item px-0 text-muted" > Pas de facture pour cette personne</li > ',document.querySelector("#"+o).innerHTML=`
    <div style = "margin-top:20px" ></div >
      ${tt("Factures d'inscription","<i class='bi bi-receipt'></i>",[{id:"addInvoice",label:"Ajouter facture",icon:"bi-plus",active:!0}])}
  <ul class="list-group ">
    ${n}
  </ul>
  `,t}Jt();})();
