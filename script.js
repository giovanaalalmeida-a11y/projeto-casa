const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const sections = ["story","letter","crossword","gifts","final"];
let current = 0;
const navNames = ["nossa história","uma carta","jogo","presentes","casa"];

function showSection(id){
  const index = sections.indexOf(id);
  if(index < 0) return;
  // Sai da tela inicial e revela o aplicativo antes de mostrar a seção escolhida.
  $("#intro").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $$(".section").forEach(s => s.classList.remove("active"));
  $("#" + id).classList.add("active");
  current = index;
  $("#progressBar").style.width = `${20 + index*20}%`;
  $("#navLabel").textContent = navNames[index];
  window.scrollTo({top:0,behavior:"smooth"});
  if(id === "final") setTimeout(()=>$(".worm-stage").classList.add("hug"), 700);
  setTimeout(()=>spawnDuckForCurrentPage(), 350);
}

$$("[data-go]").forEach(btn => btn.addEventListener("click", ()=>showSection(btn.dataset.go)));
$$("[data-next]").forEach(btn => btn.addEventListener("click", ()=>showSection(btn.dataset.next)));

function updateCounter(){
  const start = new Date(2026,2,17,20,54,0);
  const diff = Math.max(0, Date.now() - start.getTime());
  const sec = Math.floor(diff/1000);
  $("#days").textContent = Math.floor(sec/86400);
  $("#hours").textContent = String(Math.floor(sec%86400/3600)).padStart(2,"0");
  $("#minutes").textContent = String(Math.floor(sec%3600/60)).padStart(2,"0");
  $("#seconds").textContent = String(sec%60).padStart(2,"0");
}
updateCounter(); setInterval(updateCounter,1000);

const letter = `Giu,

3 meses de namoro e 6 meses da nossa história.

Não tenho recordação de um dia que não tenha te escolhido desde que os meus olhos encontraram os teus pela primeira vez.

Eu amo tudo o que construímos, amo o que vamos construir no futuro, pois sei que será lindo, é nosso.

Sigo tendo autoestima "delirante" (entre aspas, pois é algo real) de que temos a melhor relação do mundo.

Amo cada pedacinho teu, cada pedacinho nosso e como nossos pedacinhos se encontram e se encaixam com tanta facilidade, com a facilidade de quem está em casa.

Estamos em casa e eu tenho certeza de que podemos e estamos construindo a casa mais funcional, saudável, amorosa, carinhosa e respeitosa que nossos pés já pisaram.

Te amo.

— Gio`;

let typed = false;
function typeLetter(){
  if(typed) return; typed = true;
  const target = $("#letterText");
  let i=0;
  const timer = setInterval(()=>{
    target.textContent = letter.slice(0,i++);
    if(i > letter.length){
      clearInterval(timer);
      $(".cursor").classList.add("hidden");
      $("#letterContinue").classList.remove("hidden");
    }
  }, 18);
}
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting && e.target.id==="letter") typeLetter(); });
},{threshold:.35});
observer.observe($("#letter"));

$("#checkCrossword").addEventListener("click",()=>{
  let correct=0;
  $$("[data-answer]").forEach(input=>{
    const ok = input.value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase() === input.dataset.answer;
    input.classList.toggle("correct",ok); input.classList.toggle("wrong",!ok);
    if(ok) correct++;
  });
  const msg=$("#crosswordMessage");
  if(correct===4){
    msg.textContent="Claro que você acertaria. Nossa história mora em cada detalhe. ❤️";
    confetti();
    $("#crosswordContinue").classList.remove("hidden");
  }else msg.textContent=`Quase! Você acertou ${correct} de 4. Tenta mais uma vez, Mozito.`;
});

const hints=[
  "Estão em algum lugar das minhas prateleiras do quarto.",
  "Estão em algum lugar das minhas prateleiras do quarto."
];
let opened = new Set();
$$(".gift").forEach(g=>{
  g.addEventListener("click",()=>{
    const i=Number(g.dataset.gift);
    opened.add(i);
    $("#giftNumber").textContent=`PRESENTE ${i+1}`;
    $("#giftHint").textContent=hints[i];
    $("#giftModal").classList.remove("hidden");
    burstHearts(18);
    if(opened.size===2){
      $("#giftsDone").textContent="Todos os presentes foram descobertos. Agora falta só uma coisa...";
      $("#giftsContinue").classList.remove("hidden");
    }
  });
});
$("#closeGift").addEventListener("click",()=>$("#giftModal").classList.add("hidden"));
$("#giftModal").addEventListener("click",e=>{if(e.target.id==="giftModal") $("#giftModal").classList.add("hidden")});

function burstHearts(n=12){
  for(let i=0;i<n;i++){
    const h=document.createElement("span"); h.className="heart";
    h.textContent=["♥","♡","✦","•"][Math.floor(Math.random()*4)];
    h.style.left=(35+Math.random()*30)+"vw"; h.style.top=(45+Math.random()*20)+"vh";
    h.style.setProperty("--dx",(Math.random()*180-90)+"px");
    h.style.color=["#2f68b2","#3b8c69","#d94a4a","#f3c85b"][Math.floor(Math.random()*4)];
    document.body.appendChild(h); setTimeout(()=>h.remove(),1400);
  }
}
function confetti(){ burstHearts(35); }

$(".icecream").addEventListener("click",()=>{
  showToast("🍦 Vale outro date na Baixinha?");
  burstHearts(8);
});

function showToast(text){
  const t=$("#toast"); t.textContent=text; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2800);
}

const duckMessages=["Eu te amo","Potege","Tão especial"];
let duckShownOnSection=-1;
let activeDuck=null;

function removeDuck(){
  if(activeDuck){
    activeDuck.remove();
    activeDuck=null;
  }
  const layer=$("#duckLayer");
  if(layer) layer.innerHTML="";
}

function spawnDuckForCurrentPage(){
  // Página 1: nenhum pato.
  // Página 2: pato 1 + "Eu te amo".
  // Página 3: pato 2 + "Potege".
  // Página 4: pato 3 + "Tão especial".
  // Página 5: nenhum pato.
  if(current < 1 || current > 3) {
    removeDuck();
    duckShownOnSection=-1;
    return;
  }

  // Se já estamos nessa página, não cria outro.
  if(duckShownOnSection === current && activeDuck) return;

  // Ao trocar de página, o pato anterior desaparece.
  removeDuck();
  duckShownOnSection=current;

  const messageIndex=current-1;
  const positions=[
    {top:"18vh",left:"7vw"},
    {top:"70vh",left:"82vw"},
    {top:"22vh",left:"84vw"}
  ];

  const d=document.createElement("div");
  d.className="duck duck-still";
  d.textContent="🦆";
  d.dataset.msg=duckMessages[messageIndex];
  d.style.top=positions[messageIndex].top;
  d.style.left=positions[messageIndex].left;

  const b=document.createElement("div");
  b.className="duck-bubble";
  b.textContent=duckMessages[messageIndex];
  b.style.display="none";
  d.appendChild(b);

  d.addEventListener("click",()=>{
    b.style.display="block";
    burstHearts(12);
  });

  $("#duckLayer").appendChild(d);
  activeDuck=d;
}

// Nenhum pato é criado automaticamente fora das páginas 2, 3 e 4.
// A navegação é quem controla qual dos três aparece.

$("#psButton").addEventListener("click",()=>{
  $("#ps").classList.remove("hidden"); burstHearts(20);
});

document.addEventListener("click",e=>{
  if(e.target.closest("button")) return;
  if(Math.random()<.08) burstHearts(2);
});
