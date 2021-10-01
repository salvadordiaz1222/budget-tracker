let db;

const request = indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = (event) => {
  db = event.target.result;
  db.createObjectStore("BudgetStore", {
    autoIncrement: true,
  });
};

request.onerror = (event) => {
  console.log(event.target.errorCode);
};

request.onsuccess = (event) => {
  db = event.target.result;
  if (navigator.onLine) {
    addToDataBase();
  }
};

function saveRecord(singleTransaction) {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");

  store.add(singleTransaction);
}

function addToDataBase() {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const store = transaction.objectStore("BudgetStore");
  const getAllTransaction = store.getAll();

  getAllTransaction.onsuccess = function () {
    if (getAllTransaction.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAllTransaction.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          return response.json();
        })
        .then(function () {
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          const store = transaction.objectStore("BudgetStore");
          store.clear();
        });
    }
  };
}

window.addEventListener("online", addToDataBase);
