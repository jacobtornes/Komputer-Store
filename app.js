//This function makes sure that a condition is true.

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Converting number to NOK format

const numToNok = (Number) => {
  return new Intl.NumberFormat("no-NO", {
    style: "currency",
    currency: "NOK",
  }).format(Number);
};

//Constructor for the Bank class
function Bank(balance) {
  this.balance = balance;
  this.outstandingLoan = 0;
}

//Function that handles the user getting a loan.

Bank.prototype.getLoan = function (amount) {
  assert(
    amount <= this.balance * 2,
    "The amount is too high. Max loan is your current bank balance *2 "
  );
  assert(this.outstandingLoan === 0, "Please repay your existing loan first");
  this.outstandingLoan = amount;
  this.balance += amount;
};

//Function that handles a loan repay.

Bank.prototype.repayLoan = function (amount) {
  assert(this.balance >= amount, "Not enough money");
  assert(
    amount <= this.outstandingLoan,
    "Down payment must be less than outstanding loan."
  );
  this.balance -= amount;
  this.outstandingLoan -= amount;
};

//Function that makes sure a deposit must have a larger amount than 0.

Bank.prototype.depositFunds = function (amount) {
  assert(amount > 0, "Amount must be greater than 0");
  this.balance += amount;
};

//Constructor for the Work class.

function Work(bank) {
  this.bank = bank;
  this.pay = 0;
}

//Helper function that increases the pay 100 each time the user works.

Work.prototype.doWork = function () {
  this.pay += 100;
};

//

Work.prototype.sendToBank = function () {
  this.bank.depositFunds(this.pay);
  if (this.bank.outstandingLoan > 0) {
    //Transfer 10 % of pay.
    const downPayment = Math.min(this.bank.outstandingLoan, 0.1 * this.pay); //Makes sure we don't pay too much.
    this.bank.repayLoan(downPayment);
  }
  this.pay = 0;
};

function updateUI() {
  const repayLoanButton = document.getElementById("repay-loan-button");
  const showBalanceElement = document.getElementById("show-balance");
  const loanAmountElement = document.getElementById("loan-amount");
  showBalanceElement.innerText = window.myBank.balance;
  loanAmountElement.innerText = window.myBank.outstandingLoan;

  if (window.myBank.outstandingLoan > 0 && window.myWork.pay>0) {
    repayLoanButton.classList.remove("hidden");
  } else {
    repayLoanButton.classList.add("hidden");
  }

  const payAmountElement = document.getElementById("pay-amount");
  payAmountElement.innerText = `Pay: ${numToNok(window.myWork.pay)}`;
}

document.addEventListener("DOMContentLoaded", function (event) {
  // your code to run when the DOM is ready
  window.myBank = new Bank(200);
  window.myWork = new Work(window.myBank);
  updateUI();

  //Bank action buttons
  const getLoanButton = document.getElementById("loan-button");
  const buyLaptopButton = document.getElementById("buy-laptop-button");
  const repayLoanButton = document.getElementById("repay-loan-button");

  //Work section elements
  const increasePayButton = document.getElementById("increase-pay");
  
  const sendToBankButton = document.getElementById("send-to-bank");

  getLoanButton.addEventListener("click", function () {
    // display an input box
    const amount = prompt("Enter loan amount:");

    // convert the amount to a number
    const loanAmount = Number(amount);
    try {
      window.myBank.getLoan(loanAmount);
      updateUI();
    } catch (error) {
      alert(error.message);
    }
  });

  
  //Implementing the doWork method from Work and with an eventlistener.
  increasePayButton.addEventListener("click", function () {
    window.myWork.doWork();
    updateUI();
  });

  sendToBankButton.addEventListener("click", function () {
    window.myWork.sendToBank();
    updateUI();
    
  });

  repayLoanButton.addEventListener("click",function(){
    
    //the full value should go towards the outstanding loan and not the bank account.
    
    if (window.myBank.outstandingLoan > 0) {
    const downPayment = Math.min(window.myBank.outstandingLoan,  window.myWork.pay);
    window.myBank.depositFunds(downPayment);
    window.myWork.pay-=downPayment;
    window.myBank.depositFunds(downPayment);
    window.myBank.repayLoan(downPayment);
    updateUI();
    }
  })

  buyLaptopButton.addEventListener("click", function () {
    //make sure the user have enough money in the bank.
    // a message must be shown that you cannot afford the laptop.
    try {
      assert(
        window.selectedLaptop.price <= window.myBank.balance,
        "You don't have enough money to buy this laptop."
      );
    } catch (error) {
      alert(error.message);
      return;
    }

    //When you have sufficient “Money” in the account, the amount must
    //be deducted from the bank and you must
    // receive a message that you are now the owner of the new laptop!
    window.myBank.balance -= window.selectedLaptop.price;
    updateUI();
    alert("You are now the owner of the new laptop!");
  });
});

function Test() {
  //Testing bank and work functions.

  var minBank = new Bank(1000);
  minBank.getLoan(1000);
  var newWork = new Work(minBank);
  newWork.doWork();
  newWork.doWork();
  assert(newWork.pay === 200, "Payment is not correct");
  newWork.sendToBank();
  assert(newWork.pay === 0, "Pay should be 0 after sending to bank.");
  console.log(minBank);
  assert(minBank.outstandingLoan === 980, "Loan should be 980");
  assert(minBank.balance === 2180, "balance is incorrect");
  console.log(newWork);
  console.log("Test succeeded.");
}

let data = [];

async function fetchData() {
  const response = await fetch(
    "https://hickory-quilled-actress.glitch.me/computers"
  );
  data = await response.json();
  addLaptops(data);
}

fetchData();

const addLaptops = (laptops) => {
  laptops.forEach((element) => addLaptop(element));
};

const addLaptop = (laptop) => {
  const laptopElement = document.createElement("option"); //Creates option html elements
  laptopElement.value = laptop.id;
  laptopElement.appendChild(document.createTextNode(laptop.title));
  const laptopSelect = document.getElementById("laptop-select");
  laptopSelect.appendChild(laptopElement);
};

function selectLaptop(id) {
  const selectedLaptop = data.find((laptop) => laptop.id == id);
  window.selectedLaptop = selectedLaptop;
  const laptopNameElement = document.getElementById("laptop-name");
  const laptopDescriptionElement =
    document.getElementById("laptop-description");
  const laptopPriceElement = document.getElementById("laptop-price");
  const laptopFeaturesElement = document.getElementById("laptop-features");
  const laptopImageElement = document.getElementById("laptop-image");
  laptopNameElement.innerText = selectedLaptop.title; //Selecting the title data
  laptopDescriptionElement.innerText = selectedLaptop.description; //Selecting the description data
  laptopPriceElement.innerText = selectedLaptop.price; //selecting the price data
  laptopFeaturesElement.innerText = selectedLaptop.specs; //Selecting the specs.
  laptopImageElement.setAttribute(
    "src",
    "https://hickory-quilled-actress.glitch.me/" + selectedLaptop.image
  );
  const buyButton = document.getElementById("buy-laptop-button");
  buyButton.disabled = false;
}
