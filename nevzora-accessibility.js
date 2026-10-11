(function(){
"use strict";
const button=document.getElementById("openWidget");
if(!button){console.error('Nevzora Accessibility: #openWidget not found');return}
let frame=null,readingMask=null,readingGuide=null;
const style=document.createElement("style");
style.textContent=`
.nwa-smart-contrast{filter:contrast(1.25)}
.nwa-pause-animations *, .nwa-pause-animations *::before, .nwa-pause-animations *::after{animation-play-state:paused!important;animation:none!important;transition:none!important}
.nwa-highlight-links a{outline:3px solid #ffcc00!important;background:#111!important;color:#fff!important;text-decoration:underline!important}
.nwa-hide-images img,.nwa-hide-images picture,.nwa-hide-images svg{visibility:hidden!important}
.nwa-dyslexia *{font-family:Arial,Verdana,sans-serif!important;letter-spacing:.04em}
.nwa-legible *{font-family:Arial,Helvetica,sans-serif!important}
.nwa-big-cursor,.nwa-big-cursor *{cursor:zoom-in!important}
.nwa-tooltips [title]:hover::after{content:attr(title);position:absolute;background:#111;color:#fff;padding:6px 9px;border-radius:5px;z-index:2147483647}
.nwa-page-structure h1,.nwa-page-structure h2,.nwa-page-structure h3,.nwa-page-structure nav,.nwa-page-structure main,.nwa-page-structure footer{outline:3px dashed #0b63e6!important}
`;
document.head.appendChild(style);

function ensureFrame(){
 if(frame)return frame;
 frame=document.createElement("iframe");
 frame.src="nevzora-widget/panel.html";
 frame.title="Nevzora Accessibility Menu";
 Object.assign(frame.style,{position:"fixed",top:"0",right:"0",width:"570px",maxWidth:"100vw",height:"100vh",border:"0",background:"transparent",zIndex:"2147483001",display:"none",boxShadow:"-22px 0 60px rgba(0,0,0,.15)"});
 document.body.appendChild(frame);return frame;
}
function openFrame(){ensureFrame().style.display="block"}
function closeFrame(){if(frame)frame.style.display="none"}
button.addEventListener("click",()=>{const f=ensureFrame();f.style.display==="none"?openFrame():closeFrame()});
document.addEventListener("keydown",e=>{if(e.ctrlKey&&e.key.toLowerCase()==="u"){e.preventDefault();openFrame()}});

function clearContrast(){document.documentElement.style.filter=""}
function speak(rate){
 if(!("speechSynthesis"in window))return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(document.body.innerText.replace(/\s+/g," ").slice(0,12000));
 u.rate=rate;speechSynthesis.speak(u);
}
function removeReadingTools(){
 readingMask?.remove();readingMask=null;
 readingGuide?.remove();readingGuide=null;
 document.removeEventListener("mousemove",moveMask);
 document.removeEventListener("mousemove",moveGuide);
}
function moveMask(e){if(readingMask)readingMask.style.top=(e.clientY-70)+"px"}
function moveGuide(e){if(readingGuide)readingGuide.style.top=(e.clientY)+"px"}
function setCursor(mode){
 document.documentElement.classList.remove("nwa-big-cursor");removeReadingTools();
 if(mode==="big")document.documentElement.classList.add("nwa-big-cursor");
 if(mode==="mask"){
  readingMask=document.createElement("div");
  Object.assign(readingMask.style,{position:"fixed",left:"0",right:"0",height:"140px",top:"40%",boxShadow:"0 -9999px 0 9999px rgba(0,0,0,.65)",pointerEvents:"none",zIndex:"2147482998"});
  document.body.appendChild(readingMask);document.addEventListener("mousemove",moveMask);
 }
 if(mode==="guide"){
  readingGuide=document.createElement("div");
  Object.assign(readingGuide.style,{position:"fixed",left:"0",right:"0",height:"4px",top:"50%",background:"#ffcf00",pointerEvents:"none",zIndex:"2147482998"});
  document.body.appendChild(readingGuide);document.addEventListener("mousemove",moveGuide);
 }
}
function voiceNav(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){alert("Voice navigation is not supported in this browser.");return}
 const r=new SR();r.lang="en-US";r.onresult=e=>{
  const c=e.results[0][0].transcript.toLowerCase();
  if(c.includes("scroll down"))scrollBy({top:innerHeight*.7,behavior:"smooth"});
  else if(c.includes("scroll up"))scrollBy({top:-innerHeight*.7,behavior:"smooth"});
  else if(c.includes("top"))scrollTo({top:0,behavior:"smooth"});
  else if(c.includes("close"))closeFrame();
 };r.start();
}
function resetAll(){
 ["nwa-smart-contrast","nwa-pause-animations","nwa-highlight-links","nwa-hide-images","nwa-dyslexia","nwa-legible","nwa-big-cursor","nwa-tooltips","nwa-page-structure"].forEach(c=>document.documentElement.classList.remove(c));
 document.documentElement.removeAttribute("style");document.body.removeAttribute("style");
 document.querySelectorAll("body *").forEach(el=>{el.style.letterSpacing="";el.style.lineHeight="";el.style.textAlign=""});
 removeReadingTools();speechSynthesis?.cancel();
}

window.addEventListener("message",event=>{
 const d=event.data;if(!d||d.source!=="nevzora-accessibility")return;
 switch(d.action){
  case"close":closeFrame();break;
  case"smart-contrast":document.documentElement.classList.toggle("nwa-smart-contrast",d.value==="on");break;
  case"pause-animations":document.documentElement.classList.toggle("nwa-pause-animations",d.value==="paused");break;
  case"screen-reader":
   if(d.value==="off")speechSynthesis?.cancel();
   else speak(d.value==="fast"?1.6:d.value==="slow"?.7:1);
   break;
  case"voice-navigation":if(d.value==="on")voiceNav();break;
  case"contrast-plus":
   clearContrast();
   if(d.value==="invert")document.documentElement.style.filter="invert(1) hue-rotate(180deg)";
   if(d.value==="dark")document.documentElement.style.filter="contrast(1.35) brightness(.65)";
   if(d.value==="light")document.documentElement.style.filter="contrast(.9) brightness(1.2)";
   break;
  case"highlight-links":document.documentElement.classList.toggle("nwa-highlight-links",d.value==="on");break;
  case"bigger-text":document.documentElement.style.fontSize=d.value==="off"?"":d.value+"%";break;
  case"text-spacing":
   const spacing={off:"",light:".05em",moderate:".1em",heavy:".16em"}[d.value];
   document.querySelectorAll("body *").forEach(el=>el.style.letterSpacing=spacing);
   break;
  case"hide-images":document.documentElement.classList.toggle("nwa-hide-images",d.value==="hidden");break;
  case"dyslexia-friendly":
   document.documentElement.classList.remove("nwa-dyslexia","nwa-legible");
   if(d.value==="dyslexia")document.documentElement.classList.add("nwa-dyslexia");
   if(d.value==="legible")document.documentElement.classList.add("nwa-legible");
   break;
  case"cursor":setCursor(d.value);break;
  case"tooltips":document.documentElement.classList.toggle("nwa-tooltips",d.value==="on");break;
  case"page-structure":document.documentElement.classList.toggle("nwa-page-structure",d.value==="on");break;
  case"line-height":
   document.querySelectorAll("body *").forEach(el=>el.style.lineHeight=d.value==="off"?"":d.value);
   break;
  case"text-align":
   document.querySelectorAll("p,h1,h2,h3,h4,h5,h6,li,td,th").forEach(el=>el.style.textAlign=d.value==="off"?"":d.value);
   break;
  case"dictionary":
   if(d.value==="open"){const w=prompt("Enter a word to look up:");if(w)window.open("https://www.google.com/search?q=define+"+encodeURIComponent(w),"_blank","noopener")}
   break;
  case"saturation":
   document.body.style.filter={off:"",low:"saturate(.55)",high:"saturate(1.8)",desaturate:"grayscale(1)"}[d.value]||"";
   break;
  case"move-widget":
   button.style.left=d.value==="left"?"24px":"";button.style.right=d.value==="right"?"24px":"";
   if(frame){frame.style.left=d.value==="left"?"0":"";frame.style.right=d.value==="right"?"0":""}
   break;
  case"reset":resetAll();break;
 }
});
})();