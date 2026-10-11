const SOURCE="nevzora-accessibility";
const featureButtons=[...document.querySelectorAll(".feature")];

const cycles={
  "smart-contrast":[
    {label:"Smart Contrast",value:"off"},
    {label:"Smart Contrast",value:"on"}
  ],
  "pause-animations":[
    {label:"Pause Animations",value:"off"},
    {label:"Play Animations",value:"paused"}
  ],
  "screen-reader":[
    {label:"Screen Reader",value:"off"},
    {label:"Read Normal",value:"normal"},
    {label:"Read Fast",value:"fast"},
    {label:"Read Slow",value:"slow"}
  ],
  "voice-navigation":[
    {label:"Voice Navigation",value:"off"},
    {label:"Voice Navigation On",value:"on"}
  ],
  "contrast-plus":[
    {label:"Contrast +",value:"off"},
    {label:"Invert Colors",value:"invert"},
    {label:"Dark Contrast",value:"dark"},
    {label:"Light Contrast",value:"light"}
  ],
  "highlight-links":[
    {label:"Highlight Links",value:"off"},
    {label:"Highlight Links On",value:"on"}
  ],
  "bigger-text":[
    {label:"Bigger Text",value:"off"},
    {label:"Bigger Text",value:"110"},
    {label:"Bigger Text",value:"120"},
    {label:"Bigger Text",value:"130"},
    {label:"Bigger Text",value:"140"}
  ],
  "text-spacing":[
    {label:"Text Spacing",value:"off"},
    {label:"Light Spacing",value:"light"},
    {label:"Moderate Spacing",value:"moderate"},
    {label:"Heavy Spacing",value:"heavy"}
  ],
  "hide-images":[
    {label:"Hide Images",value:"off"},
    {label:"Show Images",value:"hidden"}
  ],
  "dyslexia-friendly":[
    {label:"Dyslexia Friendly",value:"off"},
    {label:"Dyslexia Friendly",value:"dyslexia"},
    {label:"Legible Fonts",value:"legible"}
  ],
  "cursor":[
    {label:"Cursor",value:"off"},
    {label:"Big Cursor",value:"big"},
    {label:"Reading Mask",value:"mask"},
    {label:"Reading Guide",value:"guide"}
  ],
  "tooltips":[
    {label:"Tooltips",value:"off"},
    {label:"Tooltips On",value:"on"}
  ],
  "page-structure":[
    {label:"Page Structure",value:"off"},
    {label:"Page Structure On",value:"on"}
  ],
  "line-height":[
    {label:"Line Height",value:"off"},
    {label:"Line Height (1.5x)",value:"1.5"},
    {label:"Line Height (1.75x)",value:"1.75"},
    {label:"Line Height (2x)",value:"2"}
  ],
  "text-align":[
    {label:"Text Align",value:"off"},
    {label:"Align Left",value:"left"},
    {label:"Align Right",value:"right"},
    {label:"Align Center",value:"center"},
    {label:"Justify",value:"justify"}
  ],
  "dictionary":[
    {label:"Dictionary",value:"off"},
    {label:"Open Dictionary",value:"open"}
  ],
  "saturation":[
    {label:"Saturation",value:"off"},
    {label:"Low Saturation",value:"low"},
    {label:"High Saturation",value:"high"},
    {label:"Desaturate",value:"desaturate"}
  ]
};

const states={};

function send(action,value=null){
  window.parent.postMessage({source:SOURCE,action,value},"*");
}

function ensureIndicators(btn, count){
  let wrap=btn.querySelector(".state-indicators");
  if(!wrap){
    wrap=document.createElement("div");
    wrap.className="state-indicators";
    btn.appendChild(wrap);
  }
  wrap.innerHTML="";
  for(let i=1;i<count;i++){
    const line=document.createElement("span");
    line.className="state-indicator";
    line.setAttribute("aria-hidden","true");
    wrap.appendChild(line);
  }
}

function updateButtonVisual(btn, action){
  const options=cycles[action];
  const index=states[action]||0;
  const current=options[index];
  const label=btn.querySelector(".feature-label");

  if(label) label.textContent=current.label;
  btn.classList.toggle("active",index!==0);
  btn.setAttribute("aria-pressed",String(index!==0));
  btn.setAttribute("data-state-index",String(index));

  const indicators=[...btn.querySelectorAll(".state-indicator")];
  indicators.forEach((line,i)=>{
    line.classList.toggle("current",index===i+1);
    line.classList.toggle("completed",index>i+1);
  });

  let check=btn.querySelector(".feature-check");
  if(index!==0){
    if(!check){
      check=document.createElement("span");
      check.className="feature-check";
      check.textContent="✓";
      btn.appendChild(check);
    }
  }else{
    check?.remove();
  }
}

featureButtons.forEach(btn=>{
  const action=btn.dataset.action;
  states[action]=0;
  ensureIndicators(btn,cycles[action].length);
  updateButtonVisual(btn,action);

  btn.addEventListener("click",()=>{
    const options=cycles[action];
    states[action]=(states[action]+1)%options.length;
    updateButtonVisual(btn,action);
    send(action,options[states[action]].value);
  });
});

document.getElementById("closeBtn").addEventListener("click",()=>send("close"));

document.getElementById("resetBtn").addEventListener("click",()=>{
  Object.keys(states).forEach(action=>{
    states[action]=0;
    const btn=document.querySelector(`.feature[data-action="${action}"]`);
    if(btn) updateButtonVisual(btn,action);
  });
  send("reset");
});

document.getElementById("oversizedToggle").addEventListener("change",e=>{
  document.body.classList.toggle("oversized",e.target.checked);
  send("oversized",e.target.checked);
});

document.querySelectorAll('input[name="position"]').forEach(r=>{
  r.addEventListener("change",e=>send("move-widget",e.target.value));
});

const languages=[
  ["US","English (USA)"],["AZ","Azerbaijani (Azeri)"],["ID","Bahasa Indonesia (Indonesian)"],
  ["EU","Basque (Basque)"],["CA","Català (Catalan)"],["CE","Cebuano (Filipino)"],
  ["DE","Deutsch (German)"],["ES","Español (Spanish)"],["FR","Français (French)"],
  ["IT","Italiano (Italian)"],["PK","Urdu"],["SA","العربية (Arabic)"]
];

const languagePanel=document.getElementById("languagePanel");
const languageList=document.getElementById("languageList");
const currentLanguage=document.getElementById("currentLanguage");

function renderLanguages(filter=""){
  languageList.innerHTML="";
  languages
    .filter(item=>item[1].toLowerCase().includes(filter.toLowerCase()))
    .forEach(item=>{
      const button=document.createElement("button");
      button.className="language-item"+(currentLanguage.textContent===item[1]?" active":"");
      button.innerHTML=`<span class="lang-code">${item[0]}</span><span>${item[1]}</span>`;
      button.addEventListener("click",()=>{
        currentLanguage.textContent=item[1];
        renderLanguages(document.getElementById("languageSearch").value);
        send("language",item[1]);
      });
      languageList.appendChild(button);
    });
}

renderLanguages();

document.getElementById("languageToggle").addEventListener("click",()=>{
  languagePanel.hidden=!languagePanel.hidden;
});

document.getElementById("languageSearch").addEventListener("input",e=>{
  renderLanguages(e.target.value);
});
