
const app=document.getElementById("app");
const KEY="lifeos-x-profile";
const defaultProfile={name:"Adarsh",age:20,income:50000,expense:25000,savings:250000,debt:0,returnRate:0.10,inflation:0.06,retirement:60,children:0,married:false};
let P=JSON.parse(localStorage.getItem(KEY)||"null")||defaultProfile;

const money=n=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(n)||0);
const short=n=>{n=Number(n)||0;let a=Math.abs(n);if(a>=1e7)return (n/1e7).toFixed(2)+" Cr";if(a>=1e5)return (n/1e5).toFixed(2)+" L";if(a>=1e3)return (n/1e3).toFixed(1)+"K";return Math.round(n).toString()};
const val=id=>Number(document.getElementById(id)?.value)||0;
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
function save(){localStorage.setItem(KEY,JSON.stringify(P));toast("Profile saved locally");}
function toast(t){let x=document.createElement("div");x.className="toast";x.textContent=t;document.body.appendChild(x);setTimeout(()=>x.remove(),1800)}
function field(id,label,value,type="number"){return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" value="${esc(value)}"></div>`}
function nav(active){return `<div class="nav">${["Dashboard","Profile","Future","What-If","Business","Goals","Family","Stress Test","Debt","FIRE","Compare"].map(x=>`<button class="${active===x?"active":""}" onclick="go('${x}')">${x}</button>`).join("")}</div>`}
function shell(title,sub,body,active="Dashboard"){app.innerHTML=`<header class="top"><div class="brand">LIFEOS <span>X</span></div><div class="status">● SIMULATION ENGINE ONLINE</div></header><main class="wrap">${nav(active)}<div class="eyebrow">LIFEOS X / ${active.toUpperCase()}</div><h1>${title}</h1><p style="color:var(--muted)">${sub}</p>${body}<div class="footer">LIFEOS X — personal financial simulation. Estimates are illustrative, not financial advice.</div></main>`}
function go(x){({Dashboard:dashboard,Profile:profile,Future:future,["What-If"]:whatif,Business:business,Goals:goals,Family:family,["Stress Test"]:stress,Debt:debt,FIRE:fire,Compare:compare}[x]||dashboard)()}

function dashboard(){
 const monthly=P.income-P.expense, savingRate=P.income?monthly/P.income*100:0;
 shell("Simulate Your Financial Future.","A multi-scenario financial digital twin for income, spending, goals, family, business and unexpected events.",`
 <section class="hero" style="min-height:auto">
 <div><div class="eyebrow">FINANCIAL DIGITAL TWIN</div><h1>Know your <em>future</em> before you live it.</h1><p>LIFEOS X converts your assumptions into age-by-age projections and lets you test hundreds of financial decisions.</p><div class="actions"><button class="btn primary" onclick="profile()">Create / Edit Profile →</button><button class="btn" onclick="future()">Run Future Simulation</button></div></div>
 <div class="command"><h2>LIVE FINANCIAL MODEL <span class="status">● LIVE</span></h2><div class="metricgrid"><div class="metric"><small>Net Worth</small><strong>${money(P.savings-P.debt)}</strong><span class="${P.savings-P.debt>=0?"good":"bad"}">${P.debt?money(P.debt)+" debt":"Debt free"}</span></div><div class="metric"><small>Monthly Flow</small><strong>${money(monthly)}</strong><span class="${monthly>=0?"good":"bad"}">${savingRate.toFixed(0)}% saving rate</span></div><div class="metric"><small>Retirement</small><strong>Age ${P.retirement}</strong><span class="cyan">${P.retirement-P.age} years runway</span></div></div><div class="result"><small>MODEL STATUS</small><h3>${monthly>=0?"Healthy cash flow":"Cash-flow deficit"}</h3><p>Current age ${P.age} · Income ${money(P.income)} · Expense ${money(P.expense)}</p></div></div>
 </section>
 <section class="panel"><h2>Decision Command Center</h2><div class="cards">
 <div class="card"><small>Future</small><strong>Age timeline</strong><button class="btn" onclick="future()">Open →</button></div>
 <div class="card"><small>What-If</small><strong>50+ variables</strong><button class="btn" onclick="whatif()">Open →</button></div>
 <div class="card"><small>Business</small><strong>Business Lab</strong><button class="btn" onclick="business()">Open →</button></div>
 <div class="card"><small>Risk</small><strong>Stress Test</strong><button class="btn" onclick="stress()">Open →</button></div>
 </div></section>`);
}
function profile(){
shell("Build Your Financial Digital Twin.","Enter the assumptions used by every simulator.",`
<section class="panel"><div class="grid">
 ${field("pName","Name",P.name,"text")}${field("pAge","Current Age",P.age)}${field("pIncome","Monthly Income ₹",P.income)}${field("pExpense","Monthly Expense ₹",P.expense)}${field("pSavings","Current Savings ₹",P.savings)}${field("pDebt","Total Debt ₹",P.debt)}${field("pReturn","Expected Annual Return %",P.returnRate*100)}${field("pInflation","Inflation %",P.inflation*100)}${field("pRetire","Retirement Age",P.retirement)}${field("pChildren","Children",P.children)}
 <div class="field"><label>Marital Status</label><select id="pMarried"><option value="0" ${!P.married?"selected":""}>Single</option><option value="1" ${P.married?"selected":""}>Married</option></select></div></div>
 <div class="actions"><button class="btn primary" onclick="saveProfile()">SAVE DIGITAL TWIN</button><button class="btn" onclick="dashboard()">Cancel</button></div></section>`);
}
function saveProfile(){P={name:document.getElementById("pName").value,age:val("pAge"),income:val("pIncome"),expense:val("pExpense"),savings:val("pSavings"),debt:val("pDebt"),returnRate:val("pReturn")/100,inflation:val("pInflation")/100,retirement:val("pRetire"),children:val("pChildren"),married:val("pMarried")===1};save();dashboard()}

function project(monthlyExtra=0,biz=0,emergency=0){
 let wealth=P.savings-P.debt, income=P.income, expense=P.expense, rows=[];
 for(let age=P.age;age<=P.retirement;age++){wealth=wealth*(1+P.returnRate)+(income-expense+monthlyExtra)*12+biz-emergency;rows.push({age,wealth,income,expense});income*=1+0.08;expense*=1+P.inflation}
 return rows;
}
function future(){
 const rows=project(), picks=[P.age,30,40,50,P.retirement].filter((x,i,a)=>x>=P.age&&a.indexOf(x)===i).map(age=>rows.find(r=>r.age===age)||rows.at(-1));
 shell("Your Life Projection.","Age-by-age model using income growth, inflation, investment returns and current cash flow.",`
 <section class="panel"><div class="cards">${picks.map(r=>`<div class="card"><small>AGE ${r.age}</small><strong>${short(r.wealth)}</strong><span class="${r.wealth>=0?"good":"bad"}">Projected net worth</span></div>`).join("")}</div></section>
 <section class="panel"><h2>Life Timeline</h2><div class="timeline">${[{a:P.age,t:"Career & wealth building"},{a:28,t:"Possible marriage / lifestyle expansion"},{a:32,t:"Possible home / family phase"},{a:35,t:"Children & education planning"},{a:45,t:"Peak earning + wealth acceleration"},{a:P.retirement,t:"Retirement independence target"}].filter(e=>e.a>=P.age).map(e=>`<div class="event"><b>Age ${e.a}</b><span>${e.t}</span></div>`).join("")}</div></section>
 <section class="panel"><h2>Projection Table</h2><table class="table"><tr><th>Age</th><th>Income / month</th><th>Expense / month</th><th>Net worth</th></tr>${rows.filter(r=>r.age%5===0||r.age===P.age||r.age===P.retirement).map(r=>`<tr><td>${r.age}</td><td>${money(r.income)}</td><td>${money(r.expense)}</td><td>${money(r.wealth)}</td></tr>`).join("")}</table></section>`);
}

function whatif(){
shell("Change Your Future.","Test income, expenses, inflation, investments, family shocks, business and lifestyle decisions together.",`
<section class="panel"><div class="grid">
 ${field("wGrowth","Income growth %",8)}${field("wExpense","Monthly expense ₹",P.expense)}${field("wInvestment","Extra investment / month ₹",5000)}${field("wInflation","Inflation %",P.inflation*100)}${field("wBusiness","One-time business investment ₹",0)}${field("wEmergency","Emergency cost ₹",0)}${field("wRetire","Target retirement age",P.retirement)}${field("wExtra","Extra income / month ₹",0)}${field("wChildren","Future children",P.children)}${field("wEducation","Education fund / child ₹",1500000)}${field("wHome","Home purchase ₹",0)}${field("wInsurance","Annual insurance ₹",30000)}</div><button class="btn primary" onclick="runWhatif()">SIMULATE 20+ VARIABLES →</button><div id="wi"></div></section>`);
}
function runWhatif(){
 let age=P.age,end=val("wRetire",60),wealth=P.savings-P.debt-val("wBusiness")-val("wHome"),income=P.income+val("wExtra"),expense=val("wExpense"),infl=val("wInflation",6)/100,growth=val("wGrowth",8)/100,invest=val("wInvestment"),childCost=val("wChildren")*val("wEducation");
 for(;age<=end;age++){let annual=(income-expense-invest)*12-val("wInsurance")-(age===P.age?val("wEmergency")+childCost:0);wealth=wealth*(1+P.returnRate)+annual+invest*12;income*=1+growth;expense*=1+infl}
 document.getElementById("wi").innerHTML=`<div class="result"><small>PROJECTED NET WORTH</small><h3>${money(wealth)}</h3><p>Scenario ends at age ${end}. Change any assumption and run again.</p></div>`;
}

function business(){
shell("Business Lab.","Model startup capital, revenue growth, operating cost, taxes, reinvestment and business risk.",`
<section class="panel"><div class="grid">${field("bCapital","Starting capital ₹",500000)}${field("bRevenue","Monthly revenue ₹",100000)}${field("bCost","Monthly operating cost ₹",60000)}${field("bGrowth","Revenue growth % / year",12)}${field("bTax","Tax / other %",20)}${field("bYears","Business years",10)}${field("bReinvest","Reinvest profit %",30)}${field("bRisk","Failure probability %",10)}${field("bPersonal","Personal monthly withdrawal ₹",30000)}${field("bExit","Exit value multiple",4)}</div><button class="btn primary" onclick="runBusiness()">RUN BUSINESS MODEL →</button><div id="biz"></div></section>`);
}
function runBusiness(){
 let rev=val("bRevenue"),cost=val("bCost"),capital=val("bCapital"),total=-capital;
 for(let y=1;y<=val("bYears",10);y++){let profit=Math.max(0,(rev-cost)*12)*(1-val("bTax",20)/100);total+=profit*(1-val("bReinvest",30)/100)-val("bPersonal")*12;rev*=1+val("bGrowth",12)/100}
 let adjusted=total*(1-val("bRisk",10)/100),exit=Math.max(0,rev-cost)*12*val("bExit",4);
 document.getElementById("biz").innerHTML=`<div class="result"><small>RISK-ADJUSTED BUSINESS VALUE</small><h3>${money(adjusted+exit)}</h3><p>Projected operating wealth ${money(adjusted)} + estimated exit value ${money(exit)}.</p></div>`;
}

function goals(){
shell("Goal Engine.","House, education, wedding, travel, emergency fund, retirement and custom goals.",`
<section class="panel"><div class="grid">${field("gTarget","Target amount ₹",10000000)}${field("gCurrent","Already invested ₹",100000)}${field("gMonthly","Monthly contribution ₹",20000)}${field("gReturn","Expected return %",12)}${field("gYears","Target years",10)}${field("gInflation","Goal inflation %",6)}</div><button class="btn primary" onclick="runGoal()">CALCULATE GOAL →</button><div id="gr"></div></section>
<section class="panel"><h2>Goal presets</h2><div class="cards"><div class="card">🏠 Home<br><button class="btn" onclick="presetGoal(5000000)">Use</button></div><div class="card">🎓 Education<br><button class="btn" onclick="presetGoal(3000000)">Use</button></div><div class="card">💍 Wedding<br><button class="btn" onclick="presetGoal(2000000)">Use</button></div><div class="card">✈️ Travel<br><button class="btn" onclick="presetGoal(500000)">Use</button></div></div></section>`);
}
function presetGoal(x){document.getElementById("gTarget").value=x;toast("Goal preset selected")}
function runGoal(){let cur=val("gCurrent"),target=val("gTarget"),m=val("gMonthly"),r=val("gReturn",12)/100/12,n=val("gYears",10)*12;for(let i=0;i<n;i++)cur=cur*(1+r)+m;let pct=Math.min(100,cur/target*100);document.getElementById("gr").innerHTML=`<div class="result"><small>PROJECTED VALUE</small><h3>${money(cur)}</h3><div class="bar"><i style="width:${pct}%"></i></div><p>${pct.toFixed(1)}% of target after ${val("gYears")} years.</p></div>`}

function family(){
shell("Family & Life Planner.","Model children, education, healthcare, parents support, weddings and changing expenses across decades.",`
<section class="panel"><div class="grid">${field("fChildren","Number of children",2)}${field("fEdu","Education / child ₹",1500000)}${field("fWedding","Wedding / child ₹",1000000)}${field("fHealth","Healthcare / year ₹",100000)}${field("fFamily","Family monthly expense ₹",30000)}${field("fParents","Parents support / month ₹",10000)}${field("fYears","Planning horizon years",25)}${field("fInfl","Inflation %",6)}</div><button class="btn primary" onclick="runFamily()">BUILD FAMILY MODEL →</button><div id="fr"></div></section>`);
}
function runFamily(){let c=val("fChildren",2),infl=val("fInfl",6)/100,y=val("fYears",25),edu=val("fEdu"),wed=val("fWedding"),health=val("fHealth"),family=val("fFamily")*12,parents=val("fParents")*12,total=c*(edu+wed);for(let i=0;i<y;i++){total+=(health+family+parents)*Math.pow(1+infl,i)}document.getElementById("fr").innerHTML=`<div class="result"><small>ESTIMATED FAMILY LIFETIME FUND</small><h3>${money(total)}</h3><p>Includes education, weddings, healthcare, family costs and parents support with inflation.</p></div>`}

function stress(){
shell("Financial Stress Test.","Combine multiple shocks to see how resilient the current financial model is.",`
<section class="panel"><div class="grid">${field("sIncome","Income drop %",30)}${field("sExpense","Expense increase %",25)}${field("sMarket","Market fall %",30)}${field("sEmergency","Emergency cost ₹",500000)}${field("sJob","Job-loss months",6)}${field("sMedical","Medical cost ₹",300000)}${field("sDebtRate","Debt interest %",12)}${field("sMonths","Stress period months",12)}</div><button class="btn primary" onclick="runStress()">RUN STRESS TEST →</button><div id="sr"></div></section>`);
}
function runStress(){let income=P.income*(1-val("sIncome",30)/100),expense=P.expense*(1+val("sExpense",25)/100),market=P.savings*val("sMarket",30)/100,job=Math.max(0,income-expense)*val("sJob",6),loss=market+val("sEmergency")+val("sMedical")-job;let remaining=P.savings-loss;document.getElementById("sr").innerHTML=`<div class="result"><small>STRESS SURVIVAL BALANCE</small><h3 class="${remaining>=0?"good":"bad"}">${money(remaining)}</h3><p>${remaining>=0?"Current reserves cover this modeled shock.":"Modeled shock creates a funding gap."}</p></div>`}

function debt(){
shell("Debt Destroyer.","Compare repayment strategies and estimate interest saved by accelerating debt.",`
<section class="panel"><div class="grid">${field("dBalance","Debt balance ₹",500000)}${field("dRate","Interest %",12)}${field("dPayment","Monthly payment ₹",15000)}${field("dExtra","Extra payment ₹/month",5000)}${field("dMonths","Current remaining months",60)}</div><button class="btn primary" onclick="runDebt()">COMPARE DEBT PLAN →</button><div id="dr"></div></section>`);
}
function runDebt(){let bal=val("dBalance"),r=val("dRate")/100/12,pay=val("dPayment"),extra=val("dExtra"),m=0,interest=0;while(bal>0&&m<600){let i=bal*r;interest+=i;bal-=Math.max(0,pay+extra-i);m++}document.getElementById("dr").innerHTML=`<div class="result"><small>ACCELERATED PAYOFF</small><h3>${m} months</h3><p>Estimated interest: ${money(interest)} · Payment used: ${money(pay+extra)}/month.</p></div>`}

function fire(){
shell("FIRE & Retirement Lab.","Estimate the portfolio required for financial independence using spending and withdrawal assumptions.",`
<section class="panel"><div class="grid">${field("fireExpense","Desired monthly retirement expense ₹",P.expense*2)}${field("fireRate","Safe withdrawal assumption %",4)}${field("fireCurrent","Current investable assets ₹",P.savings)}${field("fireReturn","Expected return %",10)}${field("fireInfl","Inflation %",6)}${field("fireMonthly","Monthly investment ₹",20000)}</div><button class="btn primary" onclick="runFire()">CALCULATE FI NUMBER →</button><div id="fir"></div></section>`);
}
function runFire(){let annual=val("fireExpense")*12,target=annual/(val("fireRate",4)/100),cur=val("fireCurrent"),r=val("fireReturn",10)/100/12,m=0;while(cur<target&&m<1200){cur=cur*(1+r)+val("fireMonthly");m++}document.getElementById("fir").innerHTML=`<div class="result"><small>FINANCIAL INDEPENDENCE NUMBER</small><h3>${money(target)}</h3><p>At the modeled contribution and return, target reached in approximately ${(m/12).toFixed(1)} years.</p></div>`}

function compare(){
shell("Scenario Command Center.","Run two different futures side-by-side so one decision does not have to be guessed.",`
<section class="panel"><div class="grid">${field("caIncome","Scenario A income growth %",8)}${field("cbIncome","Scenario B income growth %",12)}${field("caExpense","Scenario A expense / month ₹",P.expense)}${field("cbExpense","Scenario B expense / month ₹",P.expense+10000)}${field("caInvest","Scenario A extra investment ₹",5000)}${field("cbInvest","Scenario B extra investment ₹",15000)}${field("cYears","Comparison years",20)}</div><button class="btn primary" onclick="runCompare()">COMPARE FUTURES →</button><div id="cr"></div></section>`);
}
function runCompare(){function calc(g,e,i){let w=P.savings;for(let y=0;y<val("cYears",20);y++){w=w*(1+P.returnRate)+(P.income*Math.pow(1+g/100,y)-e+i)*12}return w}let a=calc(val("caIncome"),val("caExpense"),val("caInvest")),b=calc(val("cbIncome"),val("cbExpense"),val("cbInvest"));document.getElementById("cr").innerHTML=`<div class="cards"><div class="card"><small>SCENARIO A</small><strong>${money(a)}</strong></div><div class="card"><small>SCENARIO B</small><strong>${money(b)}</strong></div><div class="card"><small>DIFFERENCE</small><strong>${money(b-a)}</strong></div><div class="card"><small>HORIZON</small><strong>${val("cYears")} years</strong></div></div>`}

function exportData(){const blob=new Blob([JSON.stringify(P,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="LIFEOS-X-profile.json";a.click();URL.revokeObjectURL(a.href)}
function resetData(){localStorage.removeItem(KEY);P={...defaultProfile};toast("Profile reset");dashboard()}

dashboard();
