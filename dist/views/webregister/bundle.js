(()=>{function p(e){return new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:2,minimumFractionDigits:2}).format(parseFloat(e))}async function m(){let t=await fetch("../../shared/assets/configuration.json");if(t.ok){let r=await t.json();return sessionStorage.setItem("configuration",JSON.stringify(r)),!0}else throw console.log(`getConfigurationFromJson Error : ${JSON.stringify(t)}`),new Error("getConfigurationFromJson Error message : "+t.status+" "+t.statusText)}function a(e){let t=sessionStorage.getItem("configuration"),r=JSON.parse(t),s=Object.keys(r).indexOf(e);if(s>=0)return Object.values(r)[s];throw new Error("configuration value not found "+e)}function v(){let e=sessionStorage.getItem("theme");e&&document.documentElement.setAttribute("data-bs-theme",e)}function l(){return"5z7dAN7TM4psDIuAY2yzsa28HaAl856T"}function u(e,t="",r=[]){let s="";return r.length>0&&(s=`
                    <div class="dropdown">
                        <a href="#" data-bs-toggle="dropdown" aria-expanded="false" class="text-secondary"><i class="bi bi-three-dots-vertical"></i></a>
                        <ul class="dropdown-menu" style="padding:10px">
                            ${r.map(n=>{if(n.active){let i=n.icon?`<i class="bi ${n.icon}"></i> `:"";return`<li><a class="dropdown-item" href="#" id="${n.id}">${i}${n.label}</a></li>`}}).join("")}
                        </ul>
                    </div>`),`
        <div class="card-title block-title">
            <div class="d-flex justify-content-between">
                <span class="fs-5 text-danger-emphasis block-label text-nowrap" >${t} ${e}</span>
                <div class="col-8 flex float-right text-end bloc-menu" style="cursor: pointer">
                    ${s}
                </div>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
        </div>`}function d(e,t,r,s="",o=""){return`<div class="form-group row ">
            <label class="fw-light col-sm-2 " for="${t}">${e}</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="${t}" aria-describedby="emailHelp" id="${t}" 
                placeholder="${o}" value="${r}" >
                    <small id="emailHelp" class="form-text text-muted">${s}</small>
            </div>
          </div>`}function b(e,t,r,s="",o=""){return`<div class="form-group row">
        <label class="fw-light col-sm-2" for="${t}">${e}</label>
        <div class="col-sm-10">
            <input type="Date" class="form-control" id="${t}" aria-describedby="emailHelp" value="${r}" placeholder="${o}">
                <small id="emailHelp" class="form-text text-muted">${s}</small>
        </div>
    </div>`}function f(e,t){return`<div class="alert ${e} alert-dismissible fade show" style="margin-top:60px" role="alert">
            ${t}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`}function y(e){let t=`
    <div id="footerPart" style="margin-top:40px">
        <hr style="color:grey"></hr>
        <div class="d-flex justify-content-center" style="">
            <small>${a("version")}</small>
        </div >
        <hr style="color:grey"></hr>
    </div >
        `;document.querySelector(e).innerHTML=t}function O(e){let t=sessionStorage.getItem(e);return t?JSON.parse(t):null}function h(e,t,r,s){let o="";return O(e).map(n=>{s&&s===n[t]?o+=`<option value="${n[t]}" selected>${n[r]}</option>`:o+=`<option value="${n[t]}">${n[r]}</option>`}),o}async function S(){let e=sessionStorage.getItem("yearexercice");if(JSON.parse(e))return!0;let r=a("wsUrlformel")+`dybccrapi/yearexercices?DOLAPIKEY=${l()}&sortorder=ASC&limit=100&active=1`,s=await fetch(r);if(s.ok){let o=await s.json();return sessionStorage.setItem("yearexercice",JSON.stringify(o)),!0}else throw new Error("loadYearExerciceTable Error : "+s.status+" "+s.statusText)}async function w(){let e=sessionStorage.getItem("typeactivities");if(JSON.parse(e))return!0;let r=a("wsUrlformel")+`dybccrapi/typeactivities?DOLAPIKEY=${l()}&sortorder=ASC&limit=100&active=1`,s=await fetch(r);if(s.ok){let o=await s.json();return sessionStorage.setItem("typeactivities",JSON.stringify(o)),!0}else throw new Error("loadYearExerciceTable Error : "+s.status+" "+s.statusText)}async function x(){let e=sessionStorage.getItem("typedomains");if(JSON.parse(e))return!0;let r=a("wsUrlformel")+`dybccrapi/typedomains?DOLAPIKEY=${l()}&sortorder=ASC&limit=100&active=1`,s=await fetch(r);if(s.ok){let o=await s.json();return sessionStorage.setItem("typedomains",JSON.stringify(o)),!0}else throw new Error("loadYearExerciceTable Error : "+s.status+" "+s.statusText)}async function I(){let e=sessionStorage.getItem("typecivilities");if(JSON.parse(e))return!0;let r=a("wsUrlformel")+`setup/dictionary/civilities?DOLAPIKEY=${l()}&sortorder=ASC&limit=100&active=1`,s=await fetch(r);if(s.ok){let o=await s.json();return sessionStorage.setItem("typecivilities",JSON.stringify(o)),!0}else throw console.log(`getCustomerCivilitiesTable Error : ${JSON.stringify(s)}`),new Error("getCustomerCivilitiesTable Error message : "+s.status+" "+s.statusText)}async function E(){let e=sessionStorage.getItem("paymenttypes");if(JSON.parse(e))return!0;let r=a("wsUrlformel")+`setup/dictionary/payment_types?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${l()}`,s=await fetch(r);if(s.ok){let o=await s.json();return sessionStorage.setItem("paymenttypes",JSON.stringify(o)),!0}else throw console.log(`getPaymentTypes Error : ${JSON.stringify(s)}`),new Error("getPaymentTypes Error message : "+s.status+" "+s.statusText)}async function T(){await m(),await w(),await x(),await S(),await I(),await E(),v()}async function L(){let e=sessionStorage.getItem("products");if(JSON.parse(e))return!0;let r=a("wsUrlformel")+`products?DOLAPIKEY=${l()}&limit=5000`,o=await fetch(r+"");if(o.ok){let n=await o.json();return sessionStorage.setItem("products",JSON.stringify(n)),n}else throw console.log(`getProducts Error : ${JSON.stringify(o)}`),new Error("getProducts Error message : "+o.status+" "+o.statusText)}function g(){let e=sessionStorage.getItem("products");return JSON.parse(e).filter(r=>r.status==="1")}async function J(){try{await m(),await T(),await P("mainActiveSection"),y("#footerDisplay")}catch(e){document.querySelector("#messageSection").innerHTML=f("alert-danger",e.message||e)}}async function P(e){let t=`
    
    <div class="page-content" style="margin-top:20px; margin-bottom:50px">
      <div class="fs-3 text-center">Inscription en ligne aux activit\xE9s du CCR
  </div>
  <hr/>
<p class="text-start">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum..</p>
      <div id="identitypart"></div>
    </div>

        <div id="membershippart"></div>
    </div>

        <div id="activitypart"></div>
    </div>

           <div id="invoicepart"></div>
    </div>

       <div id="paymentpart"></div>
    </div>
  </div>

  `;document.querySelector("#"+e).innerHTML=t,q("identitypart"),k("membershippart"),await D("activitypart"),U("invoicepart"),F("paymentpart"),N()}function q(e){let t=h("typecivilities","rowid","label",""),r=`
    ${u("Indiquez-nous votre identit\xE9","<i class='bi bi-person'></i>")}
    <div class="p-3">
      <form id="identityForm">
        <div class="row">
          <div class="col-6">
              <div class="form-group row mb-2">
                <label class="fw-light col-sm-2">Civilit\xE9</label>
                <div class="col-sm-10">
                  <select class="form-select" id="identity-civility">
                    ${t}
                  </select>
                </div>
              </div>
              ${d("Nom","identity-firstname","")}
              ${d("Pr\xE9nom","identity-lastname","")}
              ${d("Email","identity-email","")}
              <div class="row mb-2">
                <div class="col-sm-10 offset-sm-2">
                  <div class="invalid-feedback d-block" id="identity-email-error"></div>
                </div>
              </div>
            </div>
            <div class="col-6">
              ${d("T\xE9l\xE9phone","identity-phone","")}
              ${d("Adresse","identity-address","")}
              ${d("Code postal","identity-zip","")}
              ${d("Ville","identity-town","")}
              ${b("Date de naissance","identity-birthday","")}
          
            </div>
          </div>
        </form>
    </div>`;document.querySelector("#"+e).innerHTML=r,document.getElementById("identity-lastname").addEventListener("input",()=>{let i=nameInput.value,c=i.length===0||/^\S+ \S+$/.test(i);nameInput.classList.toggle("is-invalid",!c),document.getElementById("identity-name-error").textContent=c?"":"Le nom doit contenir un pr\xE9nom et un nom s\xE9par\xE9s par un espace"}),document.getElementById("identity-firstname").addEventListener("input",()=>{let i=nameInput.value,c=i.length===0||/^\S+ \S+$/.test(i);nameInput.classList.toggle("is-invalid",!c),document.getElementById("identity-name-error").textContent=c?"":"Le nom doit contenir un pr\xE9nom et un nom s\xE9par\xE9s par un espace"});let n=document.getElementById("identity-email");n.addEventListener("input",()=>{let i=n.value,c=i.length===0||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i);n.classList.toggle("is-invalid",!c),document.getElementById("identity-email-error").textContent=c?"":"L'email n'est pas valide"})}function k(e){let t=`${u("Souhaitez-vous adh\xE9rer \xE0 l'association","<i class='bi bi-person'></i>")} `;document.querySelector("#"+e).innerHTML=t}async function D(e){await L();let t=g().filter(o=>o.array_options?.options_type_activite==="1"),r=t.map(o=>`
    <div class="col-6">
      <div class="d-flex align-items-center mb-2">
        <input class="form-check-input me-2" type="checkbox" id="activity-${o.id}" value="${o.id}">
        <label class="form-check-label flex-grow-1" for="activity-${o.id}">${o.label}</label>
        <span class="ms-3 text-nowrap">${p(o.price)}</span>
      </div>
    </div>`).join(""),s=`
    ${u("Quelles activit\xE9s vous int\xE9ressent-elles ?","<i class='bi bi-activity'></i>")}
    <div class="p-3">
      ${t.length===0?'<p class="text-muted">Aucune activit\xE9 disponible.</p>':`<div class="row">${r}</div>`}
    </div>`;document.querySelector("#"+e).innerHTML=s}function A(){let e=[...document.querySelectorAll('[id^="activity-"]:checked')],t=g(),r=e.map(o=>t.find(n=>n.id===o.value)).filter(Boolean),s="";if(r.length===0)s='<p class="text-muted small">Aucune activit\xE9 s\xE9lectionn\xE9e.</p>';else{let o=r.map(i=>`
      <tr>
        <td>${i.ref}</td>
        <td>${i.label}</td>
        <td class="text-end">${p(i.price)}</td>
      </tr>`).join(""),n=r.reduce((i,c)=>i+Number.parseFloat(c.price??0),0);s=`
      <div style="overflow-x:auto">
        <table class="table table-sm mb-1">
          <thead>
            <tr>
              <th>Code</th>
              <th>Activit\xE9</th>
              <th class="text-end">Montant</th>
            </tr>
          </thead>
          <tbody>${o}</tbody>
          <tfoot>
            <tr class="fw-semibold">
              <td colspan="2">Total</td>
              <td class="text-end">${p(n)}</td>
            </tr>
          </tfoot>
        </table>
      </div>`}document.getElementById("activity-summary").innerHTML=s}function N(){document.querySelectorAll('[id^="activity-"]').forEach(e=>{e.addEventListener("change",A)}),A()}function U(e){let t=`
    ${u("Votre inscription","<i class='bi bi-receipt'></i>")}
    <div class="p-3">
      <div id="activity-summary"></div>
    </div>`;document.querySelector("#"+e).innerHTML=t}function F(e){let t=`
    ${u("Comment pensez-vous r\xE9gler ?","<i class='bi bi-credit-card'></i>")}
    <div class="p-3">
      <div class="accordion" id="paymentAccordion">

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#paymentHelloAsso">
              <i class="bi bi-lightning-charge me-2"></i>Je r\xE8gle imm\xE9diatement la totalit\xE9 par HelloAsso
            </button>
          </h2>
          <div id="paymentHelloAsso" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique et vous serez redirig\xE9 vers la plateforme HelloAsso pour effectuer votre paiement en ligne.</p>
              <button type="button" class="btn btn-secondary" id="btnSendHelloAsso">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#paymentSortir">
              <i class="bi bi-ticket-perforated me-2"></i>Je veux utiliser le dispositif sortir
            </button>
          </h2>
          <div id="paymentSortir" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique, vous devrez ensuite passer \xE0 l'accueil du cercle pour y faire enregistrer votre paiement par le dispositif Sortir. Il 
              vous sera alors indiqu\xE9 la somme restante.</p>
              <button type="button" class="btn btn-secondary" id="btnSendSortir">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#paymentCheque">
              <i class="bi bi-bank me-2"></i>Je r\xE8gle par ch\xE8que
            </button>
          </h2>
          <div id="paymentCheque" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique. Vous devrez ensuite pr\xE9parer  un ch\xE8que d'un montant de xxx\u20AC.
               Ch\xE8que \xE0 l'ordre de CCR, \xE0 remettre \xE0 l'accueil ou \xE0 envoyer par courrier.</p>
              <button type="button" class="btn btn-secondary" id="btnSendCheque">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#paymentVirement">
              <i class="bi bi-arrow-left-right me-2"></i>Je r\xE8gle par virement
            </button>
          </h2>
          <div id="paymentVirement" class="accordion-collapse collapse" data-bs-parent="#paymentAccordion">
            <div class="accordion-body">
              <p class="text-muted">Lorsque vous cliquerez sur 'Envoyer' votre inscription sera transmise au cercle celtique. Vous trouverez ci-dessous les coordonn\xE9es bancaires \xE0 utiliser.
            .</p>
              <button type="button" class="btn btn-secondary" id="btnSendVirement">
                <i class="bi bi-send me-2"></i>Envoyer
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>`;document.querySelector("#"+e).innerHTML=t}J();})();
