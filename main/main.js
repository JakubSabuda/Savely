// SELECT ELEMENTS
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");

const balanceEl = document.querySelector(".balance .value");
const incomeTotalEl = document.querySelector(".income-total");
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");

// SELECT BUTTONS
const expenseBtn = document.querySelector(".tab1");
const incomeBtn = document.querySelector(".tab2");
const allBtn = document.querySelector(".tab3");

// INPUT BUTTONS
const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");

const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");


// VARIABLES
let balance = 0,
  income = 0,
  outcome = 0;
const DELETE = "delete",
  EDIT = "edit";

//FIRESTORE
var db = firebase.firestore();
var usernameFromLogin = sessionStorage.getItem("username")
// GET SAVED DATA FROM DB
updateInterface();

// EVENT LISTENERS
expenseBtn.addEventListener("click", function () {
  show(expenseEl);
  hide([incomeEl, allEl]);
  active(expenseBtn);
  inactive([incomeBtn, allBtn]);
});
incomeBtn.addEventListener("click", function () {
  show(incomeEl);
  hide([expenseEl, allEl]);
  active(incomeBtn);
  inactive([expenseBtn, allBtn]);
});
allBtn.addEventListener("click", function () {
  show(allEl);
  hide([incomeEl, expenseEl]);
  active(allBtn);
  inactive([incomeBtn, expenseBtn]);
});

addExpense.addEventListener("click", function () {
  // IF ONE OF THE INPUTS IS EMPTY => EXIT
  if (!expenseTitle.value || !expenseAmount.value) return;

  
  let expense = {
    type: "expense",
    title: expenseTitle.value,
    amount: parseInt(expenseAmount.value),
    username: usernameFromLogin,
  };

  ///
  //SAVE EXPENSES TO DB
  ///
  db.collection("expenses").add(expense)
  .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      updateInterface();
      clearInput([expenseTitle, expenseAmount]);
  })
  .catch((error) => {
      console.error("Error adding document: ", error);
  });
});

addIncome.addEventListener("click", function () {
  // IF ONE OF THE INPUTS IS EMPTY => EXIT
  if (!incomeTitle.value || !incomeAmount.value) return;

  let income = {
    type: "income",
    title: incomeTitle.value,
    amount: parseInt(incomeAmount.value),
    username: usernameFromLogin,
  };

  ///
  //SAVE INCOME TO DB
  ///
  db.collection("income").add(income)
  .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      updateInterface();
      clearInput([incomeTitle, incomeAmount]);
  })
  .catch((error) => {
      console.error("Error adding document: ", error);
  });

});

incomeList.addEventListener("click", deleteOrEdit);
expenseList.addEventListener("click", deleteOrEdit);
allList.addEventListener("click", deleteOrEdit);

// HELPERS
function deleteOrEdit(event) {
  const targetBtn = event.target;

  const entry = targetBtn.parentNode;

  if (targetBtn.id == DELETE) {
    deleteItem(entry);
  } else if (targetBtn.id == EDIT) {
    editItem(entry);
  }
}

function deleteItem(entry) {
  const type = (entry.classList[0] === "income" ? "income" : "expenses");
  db.collection(type)
    .doc(entry.id)
    .delete()
    .then(function() { updateInterface(); })
    .catch(function (error) { console.log(error); });
}


function editItem(entry) {
  const type = (entry.classList[0] === "income" ? "income" : "expenses");
  db.collection(type).doc(entry.id).get().then((doc) => {
    if (!doc.exists) {
      return;
    }
    doc = doc.data();
    if (doc.type == "income") {
      incomeAmount.value = doc.amount;
      incomeTitle.value = doc.title;
    } else if (doc.type == "expense") {
      expenseAmount.value = doc.amount;
      expenseTitle.value = doc.title;
    }
    deleteItem(entry);
  });

}

function updateInterface() {

  clearElement([expenseList, incomeList, allList]);

  const incomesAmounts = [];
  const expensesAmounts = [];

  //Firestore GET INCOME
  db.collection('income').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().username == usernameFromLogin){
        showItem(incomeList, doc.data().type, doc.data().title, doc.data().amount, doc.id);
        incomesAmounts.push(doc.data().amount);
        updateBalanceUI(incomesAmounts, expensesAmounts);
        
        showItem(allList, doc.data().type, doc.data().title, doc.data().amount, doc.id);
        console.log(`GET income ${doc.id} => ${doc.data()}`);
        }
      });
  });

//Firestore GET EXPENSES
  db.collection('expenses').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        if (doc.data().username == usernameFromLogin){
        showItem(expenseList, doc.data().type, doc.data().title, doc.data().amount, doc.id);
        expensesAmounts.push(doc.data().amount);
        updateBalanceUI(incomesAmounts, expensesAmounts);
        
        showItem(allList, doc.data().type, doc.data().title, doc.data().amount, doc.id);
        console.log(`GET expense ${doc.id} => ${doc.data()}`);
        }
    });
  });
  
}

function updateBalanceUI(incomesAmounts, expensesAmounts) {
  income = calculateTotal(incomesAmounts);
  outcome = calculateTotal(expensesAmounts);
  balance = Math.abs(calculateBalance(income, outcome));

  // SIGN
  let bilansSign = income >= outcome ? "" : "- ";

  // UPDATE UI
  balanceEl.innerHTML = `${bilansSign}${balance} z??`;
  outcomeTotalEl.innerHTML = `-${outcome} z??`;
  incomeTotalEl.innerHTML = `${income} z??`;
}

function showItem(list, type, title, amount, id) {
  const entry = ` <li id = "${id}" class="${type}">
                        <div class="entry">${title}: ${amount} z??</div>
                        <div id="edit"></div>
                        <div id="delete"></div>
                    </li>`;

  const position = "afterbegin";

  list.insertAdjacentHTML(position, entry);
}

function clearElement(elements) {
  elements.forEach((element) => {
    element.innerHTML = "";
  });
}

//CALCULATE BALANCES
function calculateTotal(amounts) {
  let sum = 0;

  amounts.forEach((amount) => {
    sum += amount;
  });

  return sum;
}

function calculateBalance(income, outcome) {
  return income - outcome;
}

function clearInput(inputs) {
  inputs.forEach((input) => {
    input.value = "";
  });
}
function show(element) {
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach((element) => {
    element.classList.add("hide");
  });
}

function active(element) {
  element.classList.add("active");
}

function inactive(elements) {
  elements.forEach((element) => {
    element.classList.remove("active");
  });
}


