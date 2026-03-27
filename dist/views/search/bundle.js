(()=>{async function h(){let e=await fetch("../../shared/assets/configuration.json");if(e.ok){let r=await e.json();return sessionStorage.setItem("configuration",JSON.stringify(r)),!0}else throw console.log(`getConfigurationFromJson Error : ${JSON.stringify(e)}`),new Error("getConfigurationFromJson Error message : "+e.status+" "+e.statusText)}function a(t){let e=sessionStorage.getItem("configuration"),r=JSON.parse(e),o=Object.keys(r).indexOf(t);if(o>=0)return Object.values(r)[o];throw new Error("configuration value not found "+t)}async function S(t,e){console.log("getLogin Service start"),sessionStorage.setItem("loggedUSer","");let r=a("wsUrlformel")+"login",o=await fetch(r,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({login:t,password:e,entity:"",reset:0})});if(o.ok){let s=await o.json();return s.success.username=t,delete s.success.message,sessionStorage.setItem("loggedUSer",JSON.stringify(s.success)),!0}else return sessionStorage.setItem("loggedUSer",""),!1}function E(){return!0}function u(){return"5z7dAN7TM4psDIuAY2yzsa28HaAl856T"}function T(){sessionStorage.removeItem("loggedUSer","")}function I(){let t=sessionStorage.getItem("loggedUSer");return t?JSON.parse(t).username:""}async function L(t,e,r,o,s,n,i,b){let g=a("wsUrlformel")+`thirdparties?DOLAPIKEY=${u()}`,m=await fetch(g,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:t,client:"1",email:o,phone:s,address:n,zip:i,town:b,array_options:{options_thi_civility:e,options_thi_birthday:r}})});if(m.ok)return await m.json();throw new Error("createNewCustomer Error : "+m.status+" "+m.statusText)}async function w(t,e){t=t.replace("'","\\'");let r="";switch(e){case"name":r="(t.nom:like:%27%25"+t+"%25%27) ";break;case"email":r="(t.email:like:%27%25"+t+"%25%27)";break;case"address":r="(t.town:like:%27%25"+t+"%25%27) OR  (t.address:like:%27%25"+t+"%25%27) OR (t.zip:like:%27%25"+t+"%25%27)";break;case"phone":r="(t.phone:like:%27%25"+t+"%25%27) ";break;default:r="t.nom like%27%25"+t+"%25%27 "}let o=a("wsUrlformel"),s=`thirdparties?sqlfilters=${r}&DOLAPIKEY=${u()}&sortfield=t.nom&sortorder=ASC`,n=await fetch(o+s);if(n.ok)return n.json();if(n.status===404)return[];throw new Error("getcustomerSearch Error message : "+n.status+" "+n.statusText)}function C(t,e="",r=[]){let o="";return r.length>0&&(o=`
                    <div class="dropdown">
                        <a href="#" data-bs-toggle="dropdown" aria-expanded="false" class="text-secondary"><i class="bi bi-three-dots-vertical"></i></a>
                        <ul class="dropdown-menu" style="padding:10px">
                            ${r.map(n=>{if(n.active){let i=n.icon?`<i class="bi ${n.icon}"></i> `:"";return`<li><a class="dropdown-item" href="#" id="${n.id}">${i}${n.label}</a></li>`}}).join("")}
                        </ul>
                    </div>`),`
        <div class="card-title block-title">
            <div class="d-flex justify-content-between">
                <span class="fs-5 text-danger-emphasis block-label text-nowrap" >${e} ${t}</span>
                <div class="col-8 flex float-right text-end bloc-menu" style="cursor: pointer">
                    ${o}
                </div>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
        </div>`}function y(t,e,r,o,s=!1){let n=e===null?"":e,i="";return s?i=`<span class="text-danger-emphasis ${r}" style="cursor: pointer" entityid="${o}" id="${r}" onpointerenter="this.setAttribute('style', 'cursor: pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid rgb(159, 158, 158)')" onpointerleave="this.setAttribute('style', 'color: text-danger-emphasis;')">${n}</span>`:i=`<span class="text-danger-emphasis" style="cursor: pointer" entityid="${o}" id="${r}" onpointerenter="this.setAttribute('style', 'cursor: pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid rgb(159, 158, 158)')" onpointerleave="this.setAttribute('style', 'color: text-danger-emphasis;')">${n}</span>`,t!==""?`<div class=""><span class="fw-light" style="cursor:pointer">${t}</span> : ${i}</div>`:`<div class="">${i}</div>`}function p(t,e,r,o="",s=""){return`<div class="form-group row ">
            <label class="fw-light col-sm-2 " for="${e}">${t}</label>
            <div class="col-sm-10">
                <input type="text" class="form-control" id="${e}" aria-describedby="emailHelp" id="${e}" 
                placeholder="${s}" value="${r}" >
                    <small id="emailHelp" class="form-text text-muted">${o}</small>
            </div>
          </div>`}function k(t,e,r,o="",s=""){return`<div class="form-group row">
        <label class="fw-light col-sm-2" for="${e}">${t}</label>
        <div class="col-sm-10">
            <input type="Date" class="form-control" id="${e}" aria-describedby="emailHelp" value="${r}" placeholder="${s}">
                <small id="emailHelp" class="form-text text-muted">${o}</small>
        </div>
    </div>`}function f(t,e){return`<div class="alert ${t} alert-dismissible fade show" style="margin-top:60px" role="alert">
            ${e}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`}function X(t){let e=sessionStorage.getItem(t);return e?JSON.parse(e):null}function O(t,e,r,o){let s="";return X(t).map(n=>{o&&o===n[e]?s+=`<option value="${n[e]}" selected>${n[r]}</option>`:s+=`<option value="${n[e]}">${n[r]}</option>`}),s}async function A(){let t=sessionStorage.getItem("yearexercice");if(JSON.parse(t))return!0;let r=a("wsUrlformel")+`dybccrapi/yearexercices?DOLAPIKEY=${u()}&sortorder=ASC&limit=100&active=1`,o=await fetch(r);if(o.ok){let s=await o.json();return sessionStorage.setItem("yearexercice",JSON.stringify(s)),!0}else throw new Error("loadYearExerciceTable Error : "+o.status+" "+o.statusText)}async function N(){let t=sessionStorage.getItem("typeactivities");if(JSON.parse(t))return!0;let r=a("wsUrlformel")+`dybccrapi/typeactivities?DOLAPIKEY=${u()}&sortorder=ASC&limit=100&active=1`,o=await fetch(r);if(o.ok){let s=await o.json();return sessionStorage.setItem("typeactivities",JSON.stringify(s)),!0}else throw new Error("loadYearExerciceTable Error : "+o.status+" "+o.statusText)}async function P(){let t=sessionStorage.getItem("typedomains");if(JSON.parse(t))return!0;let r=a("wsUrlformel")+`dybccrapi/typedomains?DOLAPIKEY=${u()}&sortorder=ASC&limit=100&active=1`,o=await fetch(r);if(o.ok){let s=await o.json();return sessionStorage.setItem("typedomains",JSON.stringify(s)),!0}else throw new Error("loadYearExerciceTable Error : "+o.status+" "+o.statusText)}async function U(){let t=sessionStorage.getItem("typecivilities");if(JSON.parse(t))return!0;let r=a("wsUrlformel")+`setup/dictionary/civilities?DOLAPIKEY=${u()}&sortorder=ASC&limit=100&active=1`,o=await fetch(r);if(o.ok){let s=await o.json();return sessionStorage.setItem("typecivilities",JSON.stringify(s)),!0}else throw console.log(`getCustomerCivilitiesTable Error : ${JSON.stringify(o)}`),new Error("getCustomerCivilitiesTable Error message : "+o.status+" "+o.statusText)}async function D(){let t=sessionStorage.getItem("paymenttypes");if(JSON.parse(t))return!0;let r=a("wsUrlformel")+`setup/dictionary/payment_types?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${u()}`,o=await fetch(r);if(o.ok){let s=await o.json();return sessionStorage.setItem("paymenttypes",JSON.stringify(s)),!0}else throw console.log(`getPaymentTypes Error : ${JSON.stringify(o)}`),new Error("getPaymentTypes Error message : "+o.status+" "+o.statusText)}function c(){let t=location.pathname,e=t.indexOf("/views/");return e>=0?window.location.origin+t.substring(0,e):window.location.origin}function J(t,e){let r=document.querySelectorAll(t);for(let o=0;o<r.length;o++)r[o].addEventListener("click",e)}async function F(t){let e="createPersonModal-"+Math.random().toString(36).substring(2,9),r=O("typecivilities","rowid","label",""),o=`
    <div class="modal fade" id="${e}" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title fs-5 text-danger-emphasis">
              <i class="bi bi-person-plus me-2"></i>Cr\xE9er un adh\xE9rent
            </span>
            <button type="button" class="btn-close" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="${e}-alert"></div>
            <form>
              <div class="form-group row mb-2">
                <label class="fw-light col-sm-2">Civilit\xE9</label>
                <div class="col-sm-10">
                  <select class="form-select" id="${e}-civility">
                    ${r}
                  </select>
                </div>
              </div>
              ${p("Nom *",`${e}-name`,"","Saisir nom pr\xE9nom, s\xE9par\xE9s par un espace. Remplacer tout autre espace par un -")}
              ${p("Email *",`${e}-email`,"")}
              ${p("T\xE9l\xE9phone",`${e}-phone`,"")}
              ${k("Date de naissance",`${e}-birthday`,"")}
              ${p("Adresse",`${e}-address`,"")}
              ${p("Code postal",`${e}-zip`,"")}
              ${p("Ville",`${e}-town`,"")}
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="${e}-cancel">Annuler</button>
            <button type="button" class="btn btn-primary" id="${e}-save">
              <i class="bi bi-floppy me-1"></i>Cr\xE9er
            </button>
          </div>
        </div>
      </div>
    </div>`;return new Promise(s=>{let n=document.createElement("div");n.innerHTML=o,document.body.appendChild(n);let i=document.getElementById(e),b=new bootstrap.Modal(i),g=l=>{b.hide(),i.addEventListener("hidden.bs.modal",()=>n.remove(),{once:!0}),s(l)};i.querySelector(".btn-close").addEventListener("click",()=>g(!1)),document.getElementById(`${e}-cancel`).addEventListener("click",()=>g(!1));let m=document.getElementById(`${e}-name`);m.addEventListener("input",()=>{let l=m.value,d=l.length===0||/^\S+ \S+$/.test(l);m.classList.toggle("is-invalid",!d)});let v=document.getElementById(`${e}-email`);v.addEventListener("input",()=>{let l=v.value,d=l.length===0||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l);v.classList.toggle("is-invalid",!d)}),document.getElementById(`${e}-save`).addEventListener("click",async()=>{try{let l=document.getElementById(`${e}-name`).value.trim(),d=document.getElementById(`${e}-email`).value.trim(),K=document.getElementById(`${e}-civility`).value,z=document.getElementById(`${e}-phone`).value.trim(),R=document.getElementById(`${e}-address`).value.trim(),W=document.getElementById(`${e}-zip`).value.trim(),Z=document.getElementById(`${e}-town`).value.trim(),x=document.getElementById(`${e}-birthday`).value,G=x?Math.floor(new Date(x).getTime()/1e3):"";if(!l)throw new Error("Le nom est obligatoire");if(!/^\S+ \S+$/.test(l))throw new Error("Le nom doit contenir un pr\xE9nom et un nom s\xE9par\xE9s par un espace");if(!d)throw new Error("L'email est obligatoire");if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d))throw new Error("L'email n'est pas valide");if((await w(d,"email")).length>0)throw new Error(`L'email ${d} est d\xE9j\xE0 utilis\xE9 par un adh\xE9rent existant`);let Q=await L(l,K,G,d,z,R,W,Z);g(!0),globalThis.location.href=`${c()}/views/person?paramid=${Number(Q)}`}catch(l){document.getElementById(`${e}-alert`).innerHTML=f("alert-danger",l.message||l)}}),b.show()})}function M(){document.documentElement.getAttribute("data-bs-theme")==="dark"?(document.documentElement.setAttribute("data-bs-theme","light"),sessionStorage.setItem("theme","light")):(sessionStorage.setItem("theme","dark"),document.documentElement.setAttribute("data-bs-theme","dark"))}function H(){let t=sessionStorage.getItem("theme");t&&document.documentElement.setAttribute("data-bs-theme",t)}var ee=`
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
</div>`;async function j(){try{let t=document.createElement("div");t.innerHTML=ee,document.body.appendChild(t),E()?(document.querySelector("#modalbodyLogin").innerHTML=`
        <div id="modalmessage"></div>
        <div class="row" id="loggout">
        Vous \xEAtes authenfifi\xE9 avec le login ${I()}. 
             </div>
        </div>
            `,document.querySelector("#modalfooter").innerHTML='<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogout">Lougout</button>',document.querySelector("#btnLogout").onclick=async function(){T(),window.location.href=`${c()}/views/mainpage`}):(document.querySelector("#modalbodyLogin").innerHTML=`
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
            `,document.querySelector("#modalfooter").innerHTML='<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogin">Login</button>',$("#modalbodyLogin").on("keydown",async function(r){if(r.keyCode===13){let o=document.querySelector("#userEmailInput").value,s=document.querySelector("#userPasswordInput").value,n=await S(o,s);n?document.querySelector("#modalmessage").innerHTML=`<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Bienvenue ${n.user_pseudo}</div> `:document.querySelector("#modalmessage").innerHTML='<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Nom, password invalides</div> '}}),document.querySelector("#btnLogin").onclick=async function(){let r=document.querySelector("#userEmailInput").value,o=document.querySelector("#userPasswordInput").value;await S(r,o)?window.location.href=`${c()}/views/mainpage`:document.querySelector("#modalmessage").innerHTML='<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert" >Nom, password invalides</div> '}),document.querySelector("#myBtnCancel").onclick=function(){window.location.href=`${c()}/views/mainpage`},new bootstrap.Modal(document.querySelector("#myModalLogin")).show()}catch(t){document.querySelector("#messageSection").innerHTML=f("danger",t)}}var te=` 
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
 `,oe={login:()=>j(),theme:()=>M()};function q(t){document.querySelector("#"+t).innerHTML=te;let e=a("leftMenu"),r="";e.map(o=>{switch(o.menuItemType){case"menuitem":r+=`<div  style="margin-bottom:10px;cursor:pointer" ><span id="${o.menuItemid}" class="fs-6"> ${o.menuItemIcon} ${o.menuItemName} </span></div>`;break;case"hr":r+="<hr/>"}}),document.querySelector("#menuplace").innerHTML=r,r="",e.map(o=>{switch(o.menuItemAction){case"functionCall":r+=`<div id="${o.menuItemid}" style="margin-bottom:10px;cursor:pointer" ><span class="fs-6"> ${o.menuItemIcon} ${o.menuItemName} </span></div>`,document.querySelector(`#${o.menuItemid}`).onclick=function(){let s=oe[o.menuItemid];s&&s()};break;case"urlCall":document.querySelector(`#${o.menuItemid}`).onclick=function(){window.location.href=`${c()}/${o.menuItemLink}`};break}})}function B(t){let e=`
      <div id="menuPart">
          <nav class="navbar fixed-top bg-body-tertiary" style="border-bottom:solid 0.1rem #C0C0C0; padding:5px">
              <div class="container-fluid">
                  <div class="navbar-brand text-danger-emphasis"  id="mainNav">${a("BrandTitle")}</div>
                  <div class="d-flex">
                  <a class="btn" style="margin-left:3px;cursor:pointer"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample"><i class="bi bi-three-dots-vertical"></i></a >
  
                  </div>
              </div>
          </nav>
        </div>
      <div id="leftMenu">
      </div>
 `;document.querySelector("#"+t).innerHTML=e,q("leftMenu")}function Y(t){let e=`
    <div id="footerPart" style="margin-top:40px">
        <hr style="color:grey"></hr>
        <div class="d-flex justify-content-center" style="">
            <small>${a("version")}</small>
        </div >
        <hr style="color:grey"></hr>
    </div >
        `;document.querySelector(t).innerHTML=e}async function V(){await h(),await N(),await P(),await A(),await U(),await D(),H()}async function _(){try{await h(),B("menuSection"),await V(),await re("mainActiveSection"),Y("#footerDisplay")}catch(t){document.querySelector("#messageSection").innerHTML=f("alert-danger",t.message||t)}}async function re(t){let e=`
    <div class="page-content" style="margin-top:60px">
      ${C("Recherche adh\xE9rents","<i class='bi bi-person'></i>",[{id:"createPerson",label:"Cr\xE9er adh\xE9rent",icon:"bi-pencil",active:!0}])}
      <div class="col-6">
        <div class="input-group mb-3">
          <select class="form-select flex-grow-0 w-auto" id="searchType">
            <option value="name">Nom</option>
            <option value="email">Email</option>
            <option value="phone">T\xE9l\xE9phone</option>
            <option value="address">Adresse</option>
          </select>
          <input type="text" class="form-control" placeholder="" id="searchString" name="searchString" value="">
          <button class="btn btn-outline-secondary" id="buttonSearch">Chercher</button>
        </div>
      </div>
      <div id="resultPart"></div>
    </div>
  `;document.querySelector("#"+t).innerHTML=e;async function r(){let o=document.querySelector("#searchString").value,s=document.querySelector("#searchType").value,n=await w(o,s);document.querySelector("#resultPart").innerHTML=se(n),J(".personLink",function(i){globalThis.location.href=`${c()}/views/person?paramid=`+i.currentTarget.getAttribute("entityid")})}try{document.querySelector("#createPerson").addEventListener("click",async()=>{await F(r)}),document.querySelector("#buttonSearch").onclick=r,document.querySelector("#searchString").addEventListener("keypress",async function(o){o.keyCode===13&&await r()})}catch(o){document.querySelector("#messageSection").innerHTML=f("alert-danger",o.message||o)}}function se(t){let e=`
    <div class="col-12">${t.length} r\xE9sultats dans la liste</div>
    <div style="overflow-x: auto;">
      <table class="table table-striped">
        <thead>
          <tr>
            <th scope="col">Nom</th>
            <th scope="col">Email</th>
            <th scope="col">T\xE9l\xE9phone</th>
            <th scope="col">Ville</th>
          </tr>
        </thead>
        <tbody>`;return t.forEach(r=>{e+=`<tr>
      <td>${y("",r.name,"personLink",r.id,!0)}</td>
      <td>${y("",r.email,"personLink",r.id,!0)}</td>
      <td>${y("",r.phone,"personLink",r.id,!0)}</td>
      <td>${y("",r.town,"personLink",r.id,!0)}</td>
    </tr>`}),e+=`</tbody>
      </table>
    </div>`,e}_();})();
