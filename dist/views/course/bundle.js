(()=>{function i(){let t=location.pathname,s=t.indexOf("/views/");return s>=0?window.location.origin+t.substring(0,s):window.location.origin}function f(t,s){let o=document.querySelectorAll(t);for(let e=0;e<o.length;e++)o[e].addEventListener("click",s)}async function y(t){let s=`${i()}/api/index.php/searchpersonbyactivity/${t}`,o=await fetch(s,{method:"GET",headers:{"Content-Type":"application/json"}});if(o.ok){let e=await o.json();return sessionStorage.setItem("personsSubList",JSON.stringify(e)),console.log("getPersonsforActivity  await ok "),e}else throw console.log(`getPersonsforActivity Error: ${JSON.stringify(o)} `),new Error("getPersonsforActivity Error message : "+o.status+" "+o.statusText)}async function b(){let t=`${i()}/api/index.php/activities`,s=await fetch(t,{method:"GET",headers:{"Content-Type":"application/json"}});if(s.ok){let o=await s.json();return sessionStorage.setItem("activities",JSON.stringify(o)),console.log("getActivities  await ok "),o}else throw console.log(`getActivities Error: ${JSON.stringify(s)} `),new Error("getActivities Error message : "+s.status+" "+s.statusText)}async function v(t){let s=`${i()}/api/index.php/activities/`+t,o=await fetch(s,{method:"GET",headers:{"Content-Type":"application/json"}});if(o.ok){let e=await o.json();return sessionStorage.setItem("activity",JSON.stringify(e)),console.log("getActivity  await ok "),e}else throw console.log(`getActivity Error: ${JSON.stringify(o)} `),new Error("getActivity Error message : "+o.status+" "+o.statusText)}async function w(t){let s=new Headers;s.append("Content-Type","application/x-www-form-urlencoded"),s.append("Cookie","MoodleSession=e5ec50b873d57ab29b2ce9bf1c901478");let o=new URLSearchParams;o.append("wstoken","8833c1c25621abe82528858eec7ecd2b"),o.append("wsfunction","core_enrol_get_enrolled_users"),o.append("moodlewsrestformat","json"),o.append("courseid",t);let r=await fetch("https://mooc.ccrennes.bzh/webservice/rest/server.php",{method:"POST",headers:s,body:o,redirect:"follow"});if(r.ok){let a=await r.json();return sessionStorage.setItem("moccPersons",JSON.stringify(a)),a}else throw console.log(`getMoocPersonsforActivity Error: ${JSON.stringify(r)} `),new Error("getMoocPersonsforActivity Error message : "+r.status+" "+r.statusText)}async function u(){let s=await fetch("../../shared/assets/configuration.json");if(s.ok){let o=await s.json();return sessionStorage.setItem("configuration",JSON.stringify(o)),!0}else throw console.log(`getConfigurationFromJson Error : ${JSON.stringify(s)}`),new Error("getConfigurationFromJson Error message : "+s.status+" "+s.statusText)}function n(t){let s=sessionStorage.getItem("configuration"),o=JSON.parse(s),e=Object.keys(o).indexOf(t);if(e>=0)return Object.values(o)[e];throw new Error("configuration value not found "+t)}function m(t,s="",o=[]){let e="";return o.length>0&&(e=`
                    <div class="dropdown">
                        <a href="#" data-bs-toggle="dropdown" aria-expanded="false" class="text-secondary"><i class="bi bi-three-dots-vertical"></i></a>
                        <ul class="dropdown-menu" style="padding:10px">
                            ${o.map(a=>{if(a.active){let l=a.icon?`<i class="bi ${a.icon}"></i> `:"";return`<li><a class="dropdown-item" href="#" id="${a.id}">${l}${a.label}</a></li>`}}).join("")}
                        </ul>
                    </div>`),`
        <div class="card-title block-title">
            <div class="d-flex justify-content-between">
                <span class="fs-5 text-danger-emphasis block-label text-nowrap" >${s} ${t}</span>
                <div class="col-8 flex float-right text-end bloc-menu" style="cursor: pointer">
                    ${e}
                </div>
            </div>
            <hr style="margin-block-start:0.3rem;margin-block-end:0.3rem;margin-top:0px" />
        </div>`}function h(t,s,o,e,r=!1){let a=s===null?"":s,l="";return r?l=`<span class="text-danger-emphasis ${o}" style="cursor: pointer" entityid="${e}" id="${o}" onpointerenter="this.setAttribute('style', 'cursor: pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid rgb(159, 158, 158)')" onpointerleave="this.setAttribute('style', 'color: text-danger-emphasis;')">${a}</span>`:l=`<span class="text-danger-emphasis" style="cursor: pointer" entityid="${e}" id="${o}" onpointerenter="this.setAttribute('style', 'cursor: pointer;color: rgb(159, 158, 158); border-bottom: 0.1em solid rgb(159, 158, 158)')" onpointerleave="this.setAttribute('style', 'color: text-danger-emphasis;')">${a}</span>`,t!==""?`<div class=""><span class="fw-light" style="cursor:pointer">${t}</span> : ${l}</div>`:`<div class="">${l}</div>`}function d(t,s){return`<div class="alert ${t} alert-dismissible fade show" style="margin-top:60px" role="alert">
            ${s}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>`}function x(){document.documentElement.getAttribute("data-bs-theme")==="dark"?(document.documentElement.setAttribute("data-bs-theme","light"),sessionStorage.setItem("theme","light")):(sessionStorage.setItem("theme","dark"),document.documentElement.setAttribute("data-bs-theme","dark"))}function S(){let t=sessionStorage.getItem("theme");t&&document.documentElement.setAttribute("data-bs-theme",t)}async function p(t,s){console.log("getLogin Service start"),sessionStorage.setItem("loggedUSer","");let o=n("wsUrlformel")+"login",e=await fetch(o,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({login:t,password:s,entity:"",reset:0})});if(e.ok){let r=await e.json();return r.success.username=t,delete r.success.message,sessionStorage.setItem("loggedUSer",JSON.stringify(r.success)),!0}else return sessionStorage.setItem("loggedUSer",""),!1}function T(){return!0}function c(){return"5z7dAN7TM4psDIuAY2yzsa28HaAl856T"}function E(){sessionStorage.removeItem("loggedUSer","")}function I(){let t=sessionStorage.getItem("loggedUSer");return t?JSON.parse(t).username:""}async function C(){let t=sessionStorage.getItem("yearexercice");if(JSON.parse(t))return!0;let o=n("wsUrlformel")+`dybccrapi/yearexercices?DOLAPIKEY=${c()}&sortorder=ASC&limit=100&active=1`,e=await fetch(o);if(e.ok){let r=await e.json();return sessionStorage.setItem("yearexercice",JSON.stringify(r)),!0}else throw new Error("loadYearExerciceTable Error : "+e.status+" "+e.statusText)}async function L(){let t=sessionStorage.getItem("typeactivities");if(JSON.parse(t))return!0;let o=n("wsUrlformel")+`dybccrapi/typeactivities?DOLAPIKEY=${c()}&sortorder=ASC&limit=100&active=1`,e=await fetch(o);if(e.ok){let r=await e.json();return sessionStorage.setItem("typeactivities",JSON.stringify(r)),!0}else throw new Error("loadYearExerciceTable Error : "+e.status+" "+e.statusText)}async function A(){let t=sessionStorage.getItem("typedomains");if(JSON.parse(t))return!0;let o=n("wsUrlformel")+`dybccrapi/typedomains?DOLAPIKEY=${c()}&sortorder=ASC&limit=100&active=1`,e=await fetch(o);if(e.ok){let r=await e.json();return sessionStorage.setItem("typedomains",JSON.stringify(r)),!0}else throw new Error("loadYearExerciceTable Error : "+e.status+" "+e.statusText)}async function O(){let t=sessionStorage.getItem("typecivilities");if(JSON.parse(t))return!0;let o=n("wsUrlformel")+`setup/dictionary/civilities?DOLAPIKEY=${c()}&sortorder=ASC&limit=100&active=1`,e=await fetch(o);if(e.ok){let r=await e.json();return sessionStorage.setItem("typecivilities",JSON.stringify(r)),!0}else throw console.log(`getCustomerCivilitiesTable Error : ${JSON.stringify(e)}`),new Error("getCustomerCivilitiesTable Error message : "+e.status+" "+e.statusText)}async function M(){let t=sessionStorage.getItem("paymenttypes");if(JSON.parse(t))return!0;let o=n("wsUrlformel")+`setup/dictionary/payment_types?sortfield=code&sortorder=ASC&limit=100&active=1&DOLAPIKEY=${c()}`,e=await fetch(o);if(e.ok){let r=await e.json();return sessionStorage.setItem("paymenttypes",JSON.stringify(r)),!0}else throw console.log(`getPaymentTypes Error : ${JSON.stringify(e)}`),new Error("getPaymentTypes Error message : "+e.status+" "+e.statusText)}async function k(){await u(),await L(),await A(),await C(),await O(),await M(),S()}var H=`
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
</div>`;async function P(){try{let t=document.createElement("div");t.innerHTML=H,document.body.appendChild(t),T()?(document.querySelector("#modalbodyLogin").innerHTML=`
        <div id="modalmessage"></div>
        <div class="row" id="loggout">
        Vous \xEAtes authenfifi\xE9 avec le login ${I()}. 
             </div>
        </div>
            `,document.querySelector("#modalfooter").innerHTML='<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogout">Lougout</button>',document.querySelector("#btnLogout").onclick=async function(){E(),window.location.href=`${i()}/views/mainpage`}):(document.querySelector("#modalbodyLogin").innerHTML=`
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
            `,document.querySelector("#modalfooter").innerHTML='<button type="button" class="btn btn-secondary" data-dismiss="modal" id="btnLogin">Login</button>',$("#modalbodyLogin").on("keydown",async function(o){if(o.keyCode===13){let e=document.querySelector("#userEmailInput").value,r=document.querySelector("#userPasswordInput").value,a=await p(e,r);a?document.querySelector("#modalmessage").innerHTML=`<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Bienvenue ${a.user_pseudo}</div> `:document.querySelector("#modalmessage").innerHTML='<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert">Nom, password invalides</div> '}}),document.querySelector("#btnLogin").onclick=async function(){let o=document.querySelector("#userEmailInput").value,e=document.querySelector("#userPasswordInput").value;await p(o,e)?window.location.href=`${i()}/views/mainpage`:document.querySelector("#modalmessage").innerHTML='<div  class="alert alert-danger alert-dismissible fade show" style="margin-top:60px" role="alert" >Nom, password invalides</div> '}),document.querySelector("#myBtnCancel").onclick=function(){window.location.href=`${i()}/views/mainpage`},new bootstrap.Modal(document.querySelector("#myModalLogin")).show()}catch(t){document.querySelector("#messageSection").innerHTML=d("danger",t)}}var q=` 
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
 `,j={login:()=>P(),theme:()=>x()};function U(t){document.querySelector("#"+t).innerHTML=q;let s=n("leftMenu"),o="";s.map(e=>{switch(e.menuItemType){case"menuitem":o+=`<div  style="margin-bottom:10px;cursor:pointer" ><span id="${e.menuItemid}" class="fs-6"> ${e.menuItemIcon} ${e.menuItemName} </span></div>`;break;case"hr":o+="<hr/>"}}),document.querySelector("#menuplace").innerHTML=o,o="",s.map(e=>{switch(e.menuItemAction){case"functionCall":o+=`<div id="${e.menuItemid}" style="margin-bottom:10px;cursor:pointer" ><span class="fs-6"> ${e.menuItemIcon} ${e.menuItemName} </span></div>`,document.querySelector(`#${e.menuItemid}`).onclick=function(){let r=j[e.menuItemid];r&&r()};break;case"urlCall":document.querySelector(`#${e.menuItemid}`).onclick=function(){window.location.href=`${i()}/${e.menuItemLink}`};break}})}function J(t){let s=`
      <div id="menuPart">
          <nav class="navbar fixed-top bg-body-tertiary" style="border-bottom:solid 0.1rem #C0C0C0; padding:5px">
              <div class="container-fluid">
                  <div class="navbar-brand text-danger-emphasis"  id="mainNav">${n("BrandTitle")}</div>
                  <div class="d-flex">
                  <a class="btn" style="margin-left:3px;cursor:pointer"  data-bs-toggle="offcanvas" href="#offcanvasExample" role="button" aria-controls="offcanvasExample"><i class="bi bi-three-dots-vertical"></i></a >
  
                  </div>
              </div>
          </nav>
        </div>
      <div id="leftMenu">
      </div>
 `;document.querySelector("#"+t).innerHTML=s,U("leftMenu")}function N(t){let s=`
    <div id="footerPart" style="margin-top:40px">
        <hr style="color:grey"></hr>
        <div class="d-flex justify-content-center" style="">
            <small>${n("version")}</small>
        </div >
        <hr style="color:grey"></hr>
    </div >
        `;document.querySelector(t).innerHTML=s}async function D(){try{await u(),J("menuSection"),await k(),await B("mainActiveSection"),N("#footerDisplay")}catch(t){document.querySelector("#messageSection").innerHTML=d("alert-danger",t.message||t)}}async function B(t){let s=await b(),o="";s.map(r=>{o+=`<li class="dropdown-item" id="${r.act_id}">${r.act_libelle}</li>`});let e=`
    <div class="page-content" style="margin-top:60px">
      ${m("Activit\xE9s","<i class='bi bi-list-ul'></i>")}
      <div class="col-6">
        <div class="dropdown">
          <a class="btn btn-outline-secondary dropdown-toggle" href="#" role="button" id="activiteList" data-bs-toggle="dropdown" aria-expanded="false">
            Choisir une activit\xE9
          </a>
          <ul class="dropdown-menu" aria-labelledby="activiteList" id="activityChoice">
            ${o}
          </ul>
        </div>
      </div>
      <div id="resultBloc"></div>
      <div id="resultMoocBloc"></div>
    </div>
  `;document.querySelector("#"+t).innerHTML=e;try{document.querySelector("#activityChoice").addEventListener("click",async r=>{if(r.target.tagName==="LI"){let a=await y(r.target.id),l=await v(r.target.id),g=await w(l.act_mooc_id),F=R(a,g);_("resultBloc",F),Y("resultMoocBloc",g)}})}catch(r){document.querySelector("#messageSection").innerHTML=d("alert-danger",r.message||r)}}function _(t,s){let o="";s.map(r=>{o+=`<tr>
      <td>${h("",r.per_nom+" "+r.per_prenom,"personLink",r.per_id,"true")}</td>
      <td>${r.per_email}</td>
      <td>${r.per_tel}</td>
      <td>${r.inscrptCOncat}</td>
      <td>${r.moccData?r.moccData:"pas Mooc"}</td>
    </tr>`});let e=`
    <div style="margin-top:20px">
      ${m("Personnes inscrites \xE0 l'atelier","",[])}
      <div class="col-12">${s.length} r\xE9sultats dans la liste</div>
      <div style="overflow-x: auto;">
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Nom Pr\xE9nom</th>
              <th scope="col">Email</th>
              <th scope="col">T\xE9l\xE9phone</th>
              <th scope="col">Activit\xE9s</th>
              <th scope="col">MOOC</th>
            </tr>
          </thead>
          <tbody>${o}</tbody>
        </table>
      </div>
    </div>
  `;document.querySelector("#"+t).innerHTML=e,f(".personLink",function(r){globalThis.location.href=`${i()}/views/person?paramid=`+r.currentTarget.getAttribute("entityid")})}function Y(t,s){let o="";if(s.length>0){let e="";s.map(r=>{r.id>-1&&(e+=`<tr>
          <td>${r.firstname} ${r.lastname}</td>
          <td>${r.email}</td>
          <td>${V(r)}</td>
        </tr>`)}),o=`
      <div style="overflow-x: auto;">
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Nom Pr\xE9nom</th>
              <th scope="col">Email</th>
              <th scope="col">R\xF4le</th>
            </tr>
          </thead>
          <tbody>${e}</tbody>
        </table>
      </div>
    `}else o=`<div class="col-12">Cet atelier n'est pas disponible dans le MOOC.</div>`;document.querySelector("#"+t).innerHTML=`
    ${m("Personnes pr\xE9sentes dans le MOOC et absentes de DYB","<i class='bi bi-person'></i>")}
    ${o}
  `}function V(t){return t.roles.map(s=>s.shortname).join(", ")}function R(t,s){let o=structuredClone(t);return s.length>0&&o.map(e=>{let r=s.findIndex(a=>a.email===e.per_email);r>-1&&(e.moccData=s[r].email,s[r].id=-1)}),o}D();})();
