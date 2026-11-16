const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const views = ["dashboard","hooks","captions","thumbnail","planner","hashtags"];
let toastTimer;

function showToast(message){
  const toast=$("#toast"); toast.textContent=message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove("show"),2200);
}
function navigate(view){
  if(!views.includes(view)) return;
  $$(".view").forEach(el=>el.classList.toggle("active-view",el.id===`view-${view}`));
  $$(".nav-item[data-view]").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
  $("#currentSection").textContent=view==="dashboard"?"Dashboard":view.charAt(0).toUpperCase()+view.slice(1);
  $("#sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
$$("[data-view]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.view)));
$$("[data-go]").forEach(btn=>btn.addEventListener("click",()=>navigate(btn.dataset.go)));
$("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#themeToggle").addEventListener("click",()=>{
  document.body.classList.toggle("light");
  localStorage.setItem("pixora-theme",document.body.classList.contains("light")?"light":"dark");
});
if(localStorage.getItem("pixora-theme")==="light") document.body.classList.add("light");
$("#todayDate").textContent=new Intl.DateTimeFormat(undefined,{weekday:"short",month:"short",day:"numeric"}).format(new Date());

function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function resultCard(text){
  return `<div class="result-item"><p>${escapeHTML(text)}</p><div class="result-actions"><button class="copy-btn" data-copy="${encodeURIComponent(text)}">Copy text</button></div></div>`;
}
function renderResults(target,items){
  target.innerHTML=items.map(resultCard).join("");
  target.querySelectorAll("[data-copy]").forEach(btn=>btn.addEventListener("click",async()=>{
    const text=decodeURIComponent(btn.dataset.copy);
    try{await navigator.clipboard.writeText(text);showToast("Copied to clipboard");}
    catch{showToast("Clipboard access isn't available in this browser");}
  }));
}
const cleanTopic = value => value.trim().replace(/\s+/g," ");
$("#makeHooks").addEventListener("click",()=>{
  const topic=cleanTopic($("#hookTopic").value); if(!topic){showToast("Enter a video topic first");return;}
  const style=$("#hookStyle").value;
  const templates={
    curiosity:[`Most people overlook this about ${topic.toLowerCase()}…`,`I tested what happens when you focus on ${topic.toLowerCase()}.`,`Here’s something I wish I knew earlier about ${topic.toLowerCase()}.`],
    educational:[`3 things to understand about ${topic.toLowerCase()}.`,`A simple beginner’s guide to ${topic.toLowerCase()}.`,`Let’s break ${topic.toLowerCase()} down, step by step.`],
    story:[`I used to struggle with ${topic.toLowerCase()} — here's what changed.`,`This small experience taught me a lot about ${topic.toLowerCase()}.`,`Come along as I explore ${topic.toLowerCase()}.`],
    list:[`5 useful ideas to help you with ${topic.toLowerCase()}.`,`3 mistakes to avoid when learning about ${topic.toLowerCase()}.`,`Start with these simple tips for ${topic.toLowerCase()}.`]
  };
  renderResults($("#hookResults"),templates[style]); 
});
$("#makeCaption").addEventListener("click",()=>{
  const topic=cleanTopic($("#captionTopic").value);if(!topic){showToast("Describe your post first");return;}
  const tone=$("#captionTone").value;
  const starts={friendly:"A little something about",educational:"Let’s learn more about",excited:"Today’s topic:",professional:"A quick look at"};
  const endings={friendly:"What do you think? Share your thoughts below.",educational:"Save this post if you found it useful.",excited:"Which part would you try first? Let me know below!",professional:"Follow along for more practical insights."};
  renderResults($("#captionResults"),[`${starts[tone]} ${topic}.\n\n${endings[tone]}\n\nAdd your own experience or a question to make this caption feel personal.`]);
});
$("#makeThumb").addEventListener("click",()=>{
  const topic=cleanTopic($("#thumbTopic").value);if(!topic){showToast("Enter your video topic first");return;}
  const mood=$("#thumbMood").value;
  renderResults($("#thumbResults"),[
    `THUMBNAIL BRIEF\nTopic: ${topic}\nVisual direction: ${mood}.\nComposition: one clear focal subject, strong separation from the background, and a simple visual story.\nText: use 2–5 short words that add curiosity without repeating the full title.\nColours: choose 2–3 high-contrast colours that fit the mood.\nKeep it readable at small size and avoid clutter.`
  ]);
});
const tagBank=["creator","content","tips","learn","howto","inspiration","ideas","tutorial","creative","shorts","video","daily"];
$("#makeHashtags").addEventListener("click",()=>{
  const topic=cleanTopic($("#hashTopic").value);if(!topic){showToast("Enter a topic first");return;}
  const words=topic.toLowerCase().normalize("NFKD").replace(/[^\w\s]/g," ").split(/\s+/).filter(Boolean).slice(0,4);
  const topicTags=words.map(word=>"#"+word);
  const tags=[...new Set([...topicTags,...tagBank.slice(0,8).map(x=>"#"+x)])];
  renderResults($("#hashResults"),[tags.join(" ")+"\n\nStarter suggestions only. Check each platform’s current hashtag guidance and choose tags that genuinely match your post."]);
});

const STORAGE_KEY="pixora-planner-v1";
let plans=[];
try{plans=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");if(!Array.isArray(plans))plans=[];}catch{plans=[];}
function savePlans(){localStorage.setItem(STORAGE_KEY,JSON.stringify(plans));renderPlans();}
function renderPlans(){
  $("#savedCount").textContent=plans.length;
  $("#plannerCount").textContent=`${plans.length} ${plans.length===1?"idea":"ideas"}`;
  if(!plans.length){$("#plannerList").innerHTML='<div class="empty-state"><span>▦</span><strong>Your content plan is empty</strong><small>Add an idea above to start planning.</small></div>';return;}
  $("#plannerList").innerHTML=plans.map(plan=>`<div class="plan-item"><input class="plan-check" type="checkbox" data-done="${plan.id}" ${plan.done?"checked":""} aria-label="Mark ${escapeHTML(plan.title)} complete"><div class="plan-details"><strong>${escapeHTML(plan.title)}</strong><small>${escapeHTML(plan.platform)} · ${plan.date?escapeHTML(plan.date):"No date"} · ${plan.done?"Completed":"Planned"}</small></div><span class="platform-tag">${escapeHTML(plan.platform)}</span><button class="delete-btn" data-delete="${plan.id}" aria-label="Delete idea">Delete</button></div>`).join("");
  $("#plannerList").querySelectorAll("[data-done]").forEach(el=>el.addEventListener("change",()=>{const item=plans.find(p=>p.id===el.dataset.done);if(item){item.done=el.checked;savePlans();}}));
  $("#plannerList").querySelectorAll("[data-delete]").forEach(el=>el.addEventListener("click",()=>{plans=plans.filter(p=>p.id!==el.dataset.delete);savePlans();showToast("Idea deleted");}));
}
$("#addPlan").addEventListener("click",()=>{
  const title=cleanTopic($("#planTitle").value);if(!title){showToast("Give your idea a title first");return;}
  plans.unshift({id:Date.now().toString(),title,platform:$("#planPlatform").value,date:$("#planDate").value,done:false});
  $("#planTitle").value="";$("#planDate").value="";savePlans();showToast("Idea added to your planner");
});
renderPlans();
