const startButton = document.getElementById("startSimulation");

const LIFEOS = {
  profile: {},
  projection: [],
  goals: [],
  business: {}
};

function money(n) {
  return Math.round(Number(n) || 0).toLocaleString("en-IN");
}

function shortMoney(n) {
  n = Number(n) || 0;
  const a = Math.abs(n);

  if (a >= 10000000) return "₹" + (n / 10000000).toFixed(1) + " Cr";
  if (a >= 100000) return "₹" + (n / 100000).toFixed(1) + " L";
  if (a >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";

  return "₹" + Math.round(n);
}

function get(id) {
  return document.getElementById(id);
}

function val(id, fallback = 0) {
  const e = get(id);
  return e ? Number(e.value) || fallback : fallback;
}

function show(html) {
  document.body.innerHTML = `
    <div id="lifeosApp">
      <div class="lx-top">
        <b>LIFEOS X</b>
        <span>FINANCIAL DIGITAL TWIN</span>
      </div>
      <main>${html}</main>
    </div>
  `;
}

function field(label, id, value, type = "number") {
  return `
    <div class="lx-field">
      <label>${label}</label>
      <input id="${id}" type="${type}" value="${value}">
    </div>
  `;
}

function card(title, value, sub = "") {
  return `
    <div class="lx-card">
      <small>${title}</small>
      <strong>${value}</strong>
      <span>${sub}</span>
    </div>
  `;
}

function openProfile() {
  show(`
    <section class="lx-panel hero">
      <div class="eyebrow">LIFEOS X / PERSONAL DIGITAL TWIN</div>

      <h1>
        Build Your<br>
        <em>Financial Future.</em>
      </h1>

      <p>
        Model income, expenses, inflation, family, education,
        house, loans, investments, business and unexpected events.
      </p>

      <div class="lx-grid">
        ${field("Current Age", "age", 20)}
        ${field("Monthly Income ₹", "income", 50000)}
        ${field("Monthly Expense ₹", "expense", 15000)}
        ${field("Current Savings ₹", "savings", 100000)}
        ${field("Investment / Month ₹", "investment", 10000)}
        ${field("Expected Income Growth %", "growth", 8)}
        ${field("Expected Return %", "returnRate", 12)}
        ${field("Inflation %", "inflation", 6)}
        ${field("Retirement Age", "retirement", 60)}
        ${field("Emergency Fund ₹", "emergency", 100000)}
      </div>

      <h3>Life Events</h3>

      <div class="lx-grid">
        ${field("Marriage Age", "marriageAge", 28)}
        ${field("Marriage Cost ₹", "marriageCost", 800000)}
        ${field("Children", "children", 2)}
        ${field("First Child Age", "childAge", 30)}
        ${field("Education Cost / Child ₹", "educationCost", 1500000)}
        ${field("House Purchase Age", "houseAge", 32)}
        ${field("House Cost ₹", "houseCost", 6000000)}
        ${field("Car Purchase Age", "carAge", 30)}
        ${field("Car Cost ₹", "carCost", 1200000)}
        ${field("Loan EMI ₹", "emi", 0)}
      </div>

      <button class="lx-btn" onclick="createTwin()">
        CREATE DIGITAL TWIN →
      </button>
    </section>
  `);
}

function createTwin() {
  LIFEOS.profile = {
    age: val("age", 20),
    income: val("income", 50000),
    expense: val("expense", 15000),
    savings: val("savings", 100000),
    investment: val("investment", 10000),
    growth: val("growth", 8) / 100,
    returnRate: val("returnRate", 12) / 100,
    inflation: val("inflation", 6) / 100,
    retirement: val("retirement", 60),
    emergency: val("emergency", 100000),

    marriageAge: val("marriageAge", 28),
    marriageCost: val("marriageCost", 800000),

    children: val("children", 2),
    childAge: val("childAge", 30),
    educationCost: val("educationCost", 1500000),

    houseAge: val("houseAge", 32),
    houseCost: val("houseCost", 6000000),

    carAge: val("carAge", 30),
    carCost: val("carCost", 1200000),

    emi: val("emi", 0)
  };

  buildProjection();
  showDashboard();
}


/* =========================================================
   FIXED PROJECTION
   Current age = current net worth
   Future calculation starts from next age
   ========================================================= */

function buildProjection() {

  const p = LIFEOS.profile;

  let income = p.income;
  let expense = p.expense;
  let wealth = p.savings;

  LIFEOS.projection = [];


  // CURRENT YEAR
  // Example:
  // Age 20 + Savings ₹50,000
  // Dashboard will show ₹50,000

  LIFEOS.projection.push({
    age: p.age,
    income: income,
    expense: expense,
    wealth: wealth,
    eventCost: 0
  });


  // FUTURE YEARS
  // Calculation starts from Age 21

  for (let age = p.age + 1; age <= p.retirement; age++) {

    // Income and expense grow for the new year

    income *= 1 + p.growth;
    expense *= 1 + p.inflation;


    let eventCost = 0;


    // Marriage

    if (age === p.marriageAge) {
      eventCost += p.marriageCost;
    }


    // Child education

    if (age === p.childAge) {
      eventCost += p.educationCost * p.children * 0.15;
    }

    if (age === p.childAge + 5) {
      eventCost += p.educationCost * p.children * 0.25;
    }

    if (age === p.childAge + 10) {
      eventCost += p.educationCost * p.children * 0.60;
    }


    // House

    if (age === p.houseAge) {
      eventCost += p.houseCost;
    }


    // Car

    if (age === p.carAge) {
      eventCost += p.carCost;
    }


    // Annual income

    const annualIncome = income * 12;


    // Annual expense

    const annualExpense = expense * 12;


    // Annual saving / investment

    const annualInvestment = Math.max(
      0,
      annualIncome - annualExpense - p.emi * 12
    );


    // Wealth calculation

    wealth =
      wealth * (1 + p.returnRate) +
      annualInvestment -
      eventCost;


    // Save projection

    LIFEOS.projection.push({
      age: age,
      income: income,
      expense: expense,
      wealth: wealth,
      eventCost: eventCost
    });

  }
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function showDashboard() {

  const p = LIFEOS.profile;

  const now = LIFEOS.projection[0];

  const r =
    LIFEOS.projection[LIFEOS.projection.length - 1];


  show(`
    <section class="lx-panel">

      <div class="eyebrow">
        LIVE FINANCIAL COMMAND CENTER
      </div>

      <h1>
        Your Financial <em>Digital Twin</em>
      </h1>


      <div class="lx-cards">

        ${card(
          "CURRENT NET WORTH",
          shortMoney(now.wealth),
          "Starting position"
        )}

        ${card(
          "MONTHLY FLOW",
          "₹" + money(p.income),
          "Current income"
        )}

        ${card(
          "RETIREMENT WEALTH",
          shortMoney(r.wealth),
          "Age " + p.retirement
        )}

        ${card(
          "INCOME GROWTH",
          (p.growth * 100).toFixed(1) + "%",
          "Annual assumption"
        )}

      </div>


      <div class="lx-actions">

        <button onclick="showProjection()">
          📈 Future Timeline
        </button>

        <button onclick="openWhatIf()">
          🧠 What-If Engine
        </button>

        <button onclick="openBusiness()">
          💼 Business Lab
        </button>

        <button onclick="openGoals()">
          🎯 Goal Planner
        </button>

        <button onclick="openRisk()">
          ⚠️ Stress Test
        </button>

        <button onclick="openFamily()">
          👨‍👩‍👧 Family Planner
        </button>

      </div>


      <div class="lx-panel inner">

        <h2>LifeOS X Analysis</h2>

        <p>
          Your model considers income growth, inflation, investments,
          family events, education, housing, vehicles and retirement.
        </p>


        <div class="lx-feature-grid">

          <div>💰 Income Engine</div>
          <div>📊 Wealth Projection</div>
          <div>📈 Investment Model</div>
          <div>🏠 Property Planner</div>
          <div>🎓 Education Planner</div>
          <div>💍 Marriage Model</div>
          <div>🚗 Lifestyle Model</div>
          <div>💳 Debt Analyzer</div>
          <div>💼 Business Simulator</div>
          <div>⚠️ Risk Engine</div>
          <div>🎯 Goal Engine</div>
          <div>🔥 What-If Simulator</div>

        </div>

      </div>

    </section>
  `);
}


/* =========================================================
   FUTURE PROJECTION
   ========================================================= */

function showProjection() {

  const rows = LIFEOS.projection.map(x => `

    <div class="lx-row">

      <b>${x.age}</b>

      <span>
        ₹${money(x.income * 12)}
      </span>

      <span>
        ₹${money(x.expense * 12)}
      </span>

      <strong>
        ${shortMoney(x.wealth)}
      </strong>

    </div>

  `).join("");


  show(`

    <section class="lx-panel">

      <button onclick="showDashboard()">
        ← Dashboard
      </button>

      <div class="eyebrow">
        FUTURE ENGINE
      </div>

      <h1>
        Life <em>Timeline</em>
      </h1>


      <div class="lx-table">

        <div class="lx-row head">

          <b>AGE</b>

          <b>ANNUAL INCOME</b>

          <b>ANNUAL EXPENSE</b>

          <b>NET WORTH</b>

        </div>

        ${rows}

      </div>

    </section>

  `);
}


/* =========================================================
   WHAT IF
   ========================================================= */

function openWhatIf() {

  show(`

    <section class="lx-panel">

      <button onclick="showDashboard()">
        ← Dashboard
      </button>

      <div class="eyebrow">
        LIFEOS X / WHAT-IF ENGINE
      </div>

      <h1>
        Change Your <em>Future</em>
      </h1>

      <p>
        Different decisions ka long-term financial impact dekho.
      </p>


      <div class="lx-grid">

        ${field("Income Growth %", "wfGrowth", 10)}

        ${field(
          "Monthly Expense ₹",
          "wfExpense",
          LIFEOS.profile.expense
        )}

        ${field(
          "Extra Investment ₹/month",
          "wfInvestment",
          5000
        )}

        ${field(
          "Inflation %",
          "wfInflation",
          6
        )}

        ${field(
          "Business Investment ₹",
          "wfBusiness",
          0
        )}

        ${field(
          "Emergency Cost ₹",
          "wfEmergency",
          0
        )}

        ${field(
          "Retirement Age",
          "wfRetirement",
          LIFEOS.profile.retirement
        )}

        ${field(
          "Extra Income ₹/month",
          "wfExtraIncome",
          0
        )}

      </div>


      <button class="lx-btn" onclick="runWhatIf()">
        SIMULATE SCENARIO →
      </button>


      <div id="whatIfResult"></div>

    </section>

  `);
}


function runWhatIf() {

  const p = LIFEOS.profile;

  let income =
    p.income + val("wfExtraIncome");

  let expense =
    val("wfExpense", p.expense);

  let wealth =
    p.savings -
    val("wfBusiness") -
    val("wfEmergency");


  const growth =
    val("wfGrowth", 8) / 100;

  const inflation =
    val("wfInflation", 6) / 100;

  const investment =
    val("wfInvestment", 0);

  const endAge =
    val("wfRetirement", 60);


  for (
    let age = p.age;
    age <= endAge;
    age++
  ) {

    wealth =
      wealth * (1 + p.returnRate) +
      Math.max(
        0,
        (income - expense) * 12
      ) +
      investment * 12;


    income *= 1 + growth;

    expense *= 1 + inflation;

  }


  get("whatIfResult").innerHTML = `

    <div class="lx-result">

      <small>
        PROJECTED RESULT
      </small>

      <h2>
        ${shortMoney(wealth)}
      </h2>

      <p>
        Age ${p.age} se ${endAge} tak
        scenario ke according estimated wealth.
      </p>

    </div>

  `;
}


/* =========================================================
   BUSINESS
   ========================================================= */

function openBusiness() {

  show(`

    <section class="lx-panel">

      <button onclick="showDashboard()">
        ← Dashboard
      </button>

      <div class="eyebrow">
        LIFEOS X / BUSINESS LAB
      </div>

      <h1>
        Business <em>Simulator</em>
      </h1>

      <p>
        Business start karne se personal wealth par kya effect padega?
      </p>


      <div class="lx-grid">

        ${field(
          "Starting Capital ₹",
          "bizCapital",
          500000
        )}

        ${field(
          "Monthly Revenue ₹",
          "bizRevenue",
          100000
        )}

        ${field(
          "Monthly Business Cost ₹",
          "bizCost",
          60000
        )}

        ${field(
          "Revenue Growth %",
          "bizGrowth",
          10
        )}

        ${field(
          "Tax / Other %",
          "bizTax",
          20
        )}

        ${field(
          "Business Years",
          "bizYears",
          5
        )}

        ${field(
          "Personal Investment ₹",
          "bizPersonal",
          10000
        )}

        ${field(
          "Failure Probability %",
          "bizRisk",
          10
        )}

      </div>


      <button
        class="lx-btn"
        onclick="runBusiness()"
      >
        RUN BUSINESS MODEL →
      </button>


      <div id="businessResult"></div>

    </section>

  `);
}


function runBusiness() {

  let revenue =
    val("bizRevenue", 100000);

  let cost =
    val("bizCost", 60000);

  let capital =
    val("bizCapital", 500000);

  const growth =
    val("bizGrowth", 10) / 100;

  const tax =
    val("bizTax", 20) / 100;

  const years =
    val("bizYears", 5);

  const risk =
    val("bizRisk", 10);


  let totalProfit = -capital;


  for (
    let y = 1;
    y <= years;
    y++
  ) {

    const yearlyProfit =
      Math.max(
        0,
        (revenue - cost) * 12
      ) *
      (1 - tax);


    totalProfit += yearlyProfit;

    revenue *= 1 + growth;

  }


  const riskAdjusted =
    totalProfit *
    (1 - risk / 100);


  get("businessResult").innerHTML = `

    <div class="lx-result">

      <small>
        RISK-ADJUSTED BUSINESS VALUE
      </small>

      <h2>
        ${shortMoney(riskAdjusted)}
      </h2>

      <p>
        Total projected profit after
        ${years} years:
        ${shortMoney(totalProfit)}
      </p>

    </div>

  `;
}


/* =========================================================
   GOALS
   ========================================================= */

function openGoals() {

  show(`

    <section class="lx-panel">

      <button onclick="showDashboard()">
        ← Dashboard
      </button>

      <div class="eyebrow">
        LIFEOS X / GOAL ENGINE
      </div>

      <h1>
        Goal <em>Planner</em>
      </h1>


      <div class="lx-grid">

        ${field(
          "Goal Amount ₹",
          "goalAmount",
          10000000
        )}

        ${field(
          "Current Amount ₹",
          "goalCurrent",
          100000
        )}

        ${field(
          "Monthly Contribution ₹",
          "goalMonthly",
          20000
        )}

        ${field(
          "Expected Return %",
          "goalReturn",
          12
        )}

        ${field(
          "Target Years",
          "goalYears",
          10
        )}

      </div>


      <button
        class="lx-btn"
        onclick="calculateGoal()"
      >
        CALCULATE GOAL →
      </button>


      <div id="goalResult"></div>

    </section>

  `);
}


function calculateGoal() {

  let current =
    val("goalCurrent");

  const target =
    val("goalAmount");

  const monthly =
    val("goalMonthly");

  const rate =
    val("goalReturn", 12) /
    100 /
    12;

  const months =
    val("goalYears", 10) * 12;


  for (
    let i = 0;
    i < months;
    i++
  ) {

    current =
      current *
      (1 + rate) +
      monthly;

  }


  const percentage =
    Math.min(
      100,
      (current / target) * 100
    );


  get("goalResult").innerHTML = `

    <div class="lx-result">

      <small>
        PROJECTED GOAL VALUE
      </small>

      <h2>
        ${shortMoney(current)}
      </h2>

      <p>
        Target:
        ${shortMoney(target)}
      </p>


      <div class="progress">

        <div
          style="width:${percentage}%"
        ></div>

      </div>


      <p>
        ${percentage.toFixed(1)}%
        of target projected.
      </p>

    </div>

  `;
}


/* =========================================================
   STRESS TEST
   ========================================================= */

function openRisk() {

  show(`

    <section class="lx-panel">

      <button onclick="showDashboard()">
        ← Dashboard
      </button>

      <div class="eyebrow">
        LIFEOS X / STRESS TEST
      </div>

      <h1>
        Financial <em>Stress Test</em>
      </h1>


      <div class="lx-grid">

        ${field(
          "Income Drop %",
          "riskIncome",
          30
        )}

        ${field(
          "Expense Increase %",
          "riskExpense",
          25
        )}

        ${field(
          "Market Crash %",
          "riskMarket",
          30
        )}

        ${field(
          "Emergency Cost ₹",
          "riskEmergency",
          500000
        )}

        ${field(
          "Job Loss Months",
          "riskJob",
          6
        )}

        ${field(
          "Medical Cost ₹",
          "riskMedical",
          300000
        )}

      </div>


      <button
        class="lx-btn"
        onclick="runRisk()"
      >
        RUN STRESS TEST →
      </button>


      <div id="riskResult"></div>

    </section>

  `);
}


function runRisk() {

  const p =
    LIFEOS.profile;


  const incomeLoss =
    p.income *
    (val("riskIncome", 30) / 100);


  const extraExpense =
    p.expense *
    (val("riskExpense", 25) / 100);


  const marketLoss =
    p.savings *
    (val("riskMarket", 30) / 100);


  const jobLoss =
    (p.income - incomeLoss) *
    val("riskJob", 6);


  const totalEmergency =
    val("riskEmergency") +
    val("riskMedical");


  const remaining =
    p.savings -
    marketLoss -
    jobLoss -
    totalEmergency -
    extraExpense * 12;


  get("riskResult").innerHTML = `

    <div class="lx-result">

      <small>
        STRESS TEST RESULT
      </small>

      <h2>
        ${shortMoney(remaining)}
      </h2>

      <p>
        This scenario combines income reduction,
        expense inflation, market loss,
        job-loss period and emergency costs.
      </p>

    </div>

  `;
}


/* =========================================================
   FAMILY
   ========================================================= */

function openFamily() {

  show(`

    <section class="lx-panel">

      <button onclick="showDashboard()">
        ← Dashboard
      </button>

      <div class="eyebrow">
        LIFEOS X / FAMILY ENGINE
      </div>

      <h1>
        Family <em>Planner</em>
      </h1>


      <div class="lx-grid">

        ${field(
          "Number of Children",
          "famChildren",
          2
        )}

        ${field(
          "Education Cost / Child ₹",
          "famEducation",
          1500000
        )}

        ${field(
          "Healthcare / Year ₹",
          "famHealth",
          100000
        )}

        ${field(
          "Family Monthly Expense ₹",
          "famExpense",
          30000
        )}

        ${field(
          "Parents Support / Month ₹",
          "famParents",
          10000
        )}

        ${field(
          "Wedding Fund / Child ₹",
          "famWedding",
          1000000
        )}

        ${field(
          "Children Age Gap",
          "famGap",
          3
        )}

      </div>


      <button
        class="lx-btn"
        onclick="calculateFamily()"
      >
        BUILD FAMILY MODEL →
      </button>


      <div id="familyResult"></div>

    </section>

  `);
}


function calculateFamily() {

  const children =
    val("famChildren", 2);

  const education =
    val("famEducation");

  const health =
    val("famHealth");

  const expense =
    val("famExpense") * 12;

  const parents =
    val("famParents") * 12;

  const wedding =
    val("famWedding");


  const total =
    children * education +
    children * wedding +
    health * 20 +
    expense * 20 +
    parents * 20;


  get("familyResult").innerHTML = `

    <div class="lx-result">

      <small>
        LONG-TERM FAMILY REQUIREMENT
      </small>

      <h2>
        ${shortMoney(total)}
      </h2>

      <p>
        Education + weddings + healthcare +
        family expenses + parents support ka
        combined estimate.
      </p>

    </div>

  `;
}


/* =========================================================
   START BUTTON
   ========================================================= */

if (startButton) {

  startButton.addEventListener(
    "click",
    openProfile
  );

}
