(()=>{
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const slides=$$('.slide'),menu=$('#menu'),prog=$('#prog'),cnt=$('#cnt');
let i=0;

/* Navegação */
slides.forEach((s,k)=>{const a=document.createElement('a');a.textContent=`${k+1}. ${s.dataset.t}`;a.onclick=()=>{go(k);menu.classList.remove('open')};menu.appendChild(a)});
function go(n){
  i=Math.max(0,Math.min(slides.length-1,n));
  slides.forEach((s,k)=>s.classList.toggle('on',k===i));
  $$('#menu a').forEach((a,k)=>a.classList.toggle('cur',k===i));
  cnt.textContent=`${i+1} / ${slides.length}`;
  prog.style.width=((i+1)/slides.length*100)+'%';
  $('#prev').disabled=i===0;$('#next').disabled=i===slides.length-1;
  slides[i].scrollTop=0;
}
$('#prev').onclick=()=>go(i-1);$('#next').onclick=()=>go(i+1);
$('#mb').onclick=()=>menu.classList.toggle('open');
$$('[data-go]').forEach(e=>e.onclick=()=>go(+e.dataset.go));
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT')return;
  if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(i+1)}
  else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(i-1)}
  else if(e.key==='Home')go(0);else if(e.key==='End')go(slides.length-1);
  else if(e.key==='Escape'){menu.classList.remove('open');pres(false)}
});

/* Modo de apresentação */
const pres=on=>{
  document.body.classList.toggle('present',on);
  $('#full').textContent=on?'✕ Sair':'▶ Apresentar';
  if(!on&&document.fullscreenElement)document.exitFullscreen();
};
$('#full').onclick=()=>{
  const on=!document.body.classList.contains('present');
  pres(on);
  if(on&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(()=>{});
};
document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)pres(false)});

/* Syntax highlighting + botão copiar */
const RE=/(\/\/.*$)|("(?:[^"\\\n]|\\.)*")|\b(public|private|protected|class|abstract|virtual|override|new|return|foreach|var|in|string|int|double|void|base|if|get|set|decimal|throw)\b|\b([A-Z]\w*)\b|(\b\d+(?:\.\d+)?\b)/gm;
const hl=src=>src.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(RE,(m,c,s,k,t)=>`<i class="${c?'c':s?'s':k?'k':t?'t':'n'}">${m}</i>`);
const copy=txt=>{
  if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(txt);
  const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();
  try{document.execCommand('copy')}catch(e){}a.remove();return Promise.resolve();
};
$$('pre').forEach(p=>{
  const code=p.textContent.trim();p.innerHTML=hl(code);
  const w=document.createElement('div');w.className='code';p.replaceWith(w);
  const b=document.createElement('button');b.textContent='Copiar';
  b.onclick=()=>copy(code).then(()=>{b.textContent='Copiado ✓';setTimeout(()=>b.textContent='Copiar',1500)});
  w.append(p,b);
});

/* Separadores */
$$('.tabwrap').forEach(w=>{
  const bs=$$('.tabs button',w),ps=$$('.pane',w);
  bs.forEach((b,k)=>b.onclick=()=>{bs.forEach((x,j)=>x.classList.toggle('on',j===k));ps.forEach((x,j)=>x.classList.toggle('on',j===k))});
});

/* Demo: objeto Carro */
let v=0;
const upd=()=>{$('#vel').textContent=v;$('#vbar').style.width=Math.min(v,200)/2+'%'};
$('#acc').onclick=()=>{v+=20;upd()};
$('#brk').onclick=()=>{v=Math.max(0,v-20);upd()};
upd();

/* Demo: encapsulamento */
let saldo=100;
$('#dep').onclick=()=>{
  const x=+$('#val').value,o=$('#eout');
  if(x>0){saldo+=x;o.className='out ok';o.textContent=`Depositar(${x}) → Saldo = ${saldo} €`}
  else{o.className='out err';o.textContent='ArgumentException: Valor inválido'}
};
$('#hack').onclick=()=>{const o=$('#eout');o.className='out err';o.textContent="error CS0122: 'Conta._saldo' está inacessível devido ao seu nível de proteção"};

/* Demo: polimorfismo */
const SONS={'Cão':'Au au!','Gato':'Miau!','Vaca':'Muuu!'};
$$('[data-a]').forEach(b=>b.onclick=()=>{$('#pout').textContent=`animal.EmitirSom() → "${SONS[b.dataset.a]}"  (${b.dataset.a})`});

/* Questionário */
const Q=[
 {q:'O que é uma classe?',o:['Uma instância concreta','Um molde para criar objetos','Um tipo de ciclo','Uma variável global'],a:1},
 {q:'Que pilar esconde o estado interno de um objeto?',o:['Herança','Polimorfismo','Encapsulamento','Abstração'],a:2},
 {q:'Que símbolo indica herança em C#?',o:[':','->','extends','::'],a:0},
 {q:'Que palavras-chave permitem redefinir um método na classe derivada?',o:['static e const','virtual e override','new e sealed','public e private'],a:1},
 {q:'Podes criar um objeto diretamente com new de uma classe abstrata?',o:['Sim, sempre','Apenas dentro de uma interface','Não','Só no Unity'],a:2}
];
let qi=0,sc=0;const qb=$('#quiz');
function rq(){
  if(qi>=Q.length){
    qb.innerHTML=`<h3>Resultado: ${sc} / ${Q.length}</h3><p>${sc>=4?'Excelente! Dominas a POO.':sc>=3?'Bom trabalho!':'Revê os slides e tenta outra vez.'}</p><div><button class="pri" id="rs">Repetir</button></div>`;
    $('#rs').onclick=()=>{qi=sc=0;rq()};return;
  }
  const q=Q[qi];
  qb.innerHTML=`<p>Pergunta ${qi+1} de ${Q.length}</p><h3>${q.q}</h3><div class="opts">${q.o.map((o,k)=>`<button data-k="${k}"></button>`).join('')}</div><p id="fb"></p>`;
  $$('.opts button',qb).forEach((b,k)=>{
    b.textContent=q.o[k];
    b.onclick=()=>{
      $$('.opts button',qb).forEach(x=>{x.disabled=true;if(+x.dataset.k===q.a)x.classList.add('ok')});
      const fb=$('#fb');
      if(k===q.a){sc++;fb.className='ok';fb.textContent='Correto! ✓'}
      else{b.classList.add('err');fb.className='err';fb.textContent=`Errado. A resposta certa é: ${q.o[q.a]}`}
      const n=document.createElement('button');n.className='pri';n.textContent=qi===Q.length-1?'Ver resultado':'Seguinte pergunta';
      n.onclick=()=>{qi++;rq()};qb.appendChild(n);
    };
  });
}
rq();
go(0);
})();
