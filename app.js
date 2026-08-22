const cameras={
"Canon EOS 850D":{sensor:"APS-C", crop:1.6, modes:["Av","Tv","M","P"], afStill:"One Shot",afMove:"AI Servo"},
"Canon EOS R":{sensor:"Full Frame", crop:1.0, modes:["Av","Tv","M","P"], afStill:"One Shot",afMove:"Servo AF"}
};

const lenses=[
"18–55 mm","18–135 mm","18–200 mm","18–300 mm",
"24–70 mm","24–105 mm","24–240 mm","24–105 mm f/4",
"50 mm f/1.8","85 mm f/1.8","55–250 mm","55–300 mm",
"70–200 mm","70–300 mm","75–300 mm","100–400 mm"
];

const opts={
subject:["Calle","Retrato","Paisaje","Arquitectura","Movimiento","Noche"],
light:["Sol directo","Sol + sombras","Nublado","Hora dorada","Noche"],
scene:["Luz frontal","Luz lateral","Contraluz","Alto contraste","Luz uniforme"],
movement:["Nada","Personas","Movimiento rápido"],
priority:["Equilibrio","Control de profundidad"]
};

const state={camera:"Canon EOS 850D",lens:"18–55 mm",subject:"Calle",light:"Sol + sombras",scene:"Luz frontal",movement:"Personas",priority:"Equilibrio"};

function renderChips(id,values){
 const el=document.getElementById(id); el.innerHTML="";
 values.forEach(v=>{
  const b=document.createElement("button");
  b.className="chip"+(v===state[id]?" sel":""); b.textContent=v;
  b.onclick=()=>{state[id]=v;el.querySelectorAll(".chip").forEach(x=>x.classList.remove("sel"));b.classList.add("sel"); if(id==="camera") refreshLens();};
  el.appendChild(b);
 });
}

function refreshLens(){renderChips("lens",lenses);}

renderChips("camera",Object.keys(cameras));
refreshLens();
for(const [key,values] of Object.entries(opts)) renderChips(key,values);

function recommend(s){
 const cam=cameras[s.camera];
 let iso={"Sol directo":"100–200","Sol + sombras":"100–400","Nublado":"200–800","Hora dorada":"200–800","Noche":"800–3200"}[s.light];
 let speed={"Nada":"1/125 s+","Personas":"1/320–1/500 s","Movimiento rápido":"1/1000 s+"}[s.movement];

 let aperture;
 if(s.subject==="Retrato"){
   aperture=s.lens.includes("50")?"f/1.8–f/2.8":s.lens.includes("85")?"f/1.8–f/2.8":"f/4";
 } else if(["Paisaje","Arquitectura"].includes(s.subject)){
   aperture="f/5.6–f/8";
 } else if(s.lens.includes("70–200")||s.lens.includes("70–300")||s.lens.includes("75–300")||s.lens.includes("100–400")){
   aperture="f/5.6–f/8";
 } else {
   aperture=s.lens.includes("50")?"f/2.8–f/4":"f/4–f/5.6";
 }

 let ev=s.scene==="Contraluz"?"−2/3 EV":s.scene==="Alto contraste"?"−1/3 EV":"0 EV";
 let af=s.movement==="Nada"?cam.afStill:cam.afMove;
 let mode="Av";

 let why=s.scene==="Contraluz"?"Protege las altas luces del fondo y revisa el sujeto.":
 s.scene==="Alto contraste"?"Con contraste fuerte, vigila las altas luces y corrige si se queman.":
 s.scene==="Luz frontal"?"La luz frontal es estable; puedes mantener ISO bajo.":
 s.scene==="Luz lateral"?"La luz lateral dará volumen; controla las sombras.":
 "Busca equilibrio entre nitidez, movimiento y ruido.";

 let warn=s.movement==="Personas"&&s.light==="Noche"?"De noche, sube ISO antes que aceptar fotos movidas.":
 s.scene==="Contraluz"?"Si el fondo queda demasiado brillante, prueba −1 EV.":
 s.light==="Sol + sombras"?"Al entrar en sombra, permite ISO 800 antes de bajar de 1/320 s.":
 "Revisa la velocidad que muestra la cámara antes de disparar.";

 let lensNote="";
 if(s.lens.includes("75–300")||s.lens.includes("70–300")) lensNote="Teleobjetivo: evita velocidades bajas; a 300 mm intenta mantener al menos 1/500 s a pulso.";
 if(s.lens.includes("70–200")) lensNote="Teleobjetivo luminoso: ideal para separar sujeto y fondo; vigila la velocidad.";
 if(s.lens.includes("50")) lensNote="El 50 mm es muy versátil para calle y retrato.";
 if(s.lens.includes("100–400")) lensNote="Tele largo: prioriza velocidad alta y estabilización si tu conjunto la ofrece.";

 return{camera:s.camera,sensor:cam.sensor,lens:s.lens,mode,aperture,iso,speed,af,metering:"Evaluativa",wb:"AWB",ev,why,warn,lensNote};
}

document.getElementById("go").onclick=()=>{
 const r=recommend(state),el=document.getElementById("result");
 el.classList.remove("hidden");
 el.innerHTML=`<h2>🎯 Configuración</h2>
 <div class="small">${r.camera} · ${r.sensor} · ${r.lens}</div>
 ${[["Modo",r.mode],["Apertura",r.aperture],["ISO",r.iso],["Velocidad",r.speed],["AF",r.af],["Medición",r.metering],["WB",r.wb],["Compensación",r.ev]].map(x=>`<div class="setting"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}
 <div class="advice"><b>CADDY</b><br>${r.why}</div>
 ${r.lensNote?`<div class="advice">📌 ${r.lensNote}</div>`:""}
 <div class="warning">⚠️ ${r.warn}</div>`;
 el.scrollIntoView({behavior:"smooth"});
};

let deferred;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;document.getElementById("install").classList.remove("hidden")});
document.getElementById("install").onclick=async()=>{if(deferred){deferred.prompt();deferred=null}};
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js");