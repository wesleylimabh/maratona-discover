const Modal = {
  title: document.querySelector('#form h2'),
  button: document.querySelector('#form form button'),

  toggle() {
    document
      .querySelector('.modal-overlay')
      .classList.toggle('active');
  },

  update() {
    this.title.innerText = "Editar Transação";
    this.button.innerText = "Editar"
  },

  setDefault() {
    this.title.innerText = "Nova Transação";
    this.button.innerText = "Salvar"
  }
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem(
      "dev.finances:transactions", 
      JSON.stringify(transactions)
    );
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);
    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },

  update(transaction) {
    Transaction.all[transaction.transactionId] = transaction
    App.reload();
  },
  
  incomes() {
    let income = 0;
    
    Transaction.all.forEach(transaction => {
      if(transaction.amount > 0) {
        income += transaction.amount
      }
    });

    return income;
  },

  expenses() {
    let expense = 0;
    
    Transaction.all.forEach(transaction => {
      if(transaction.amount < 0) {
        expense += transaction.amount
      }
    });

    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }
}

const DOM = {
  transactionContainer: document.querySelector("#transactions #data-table tbody"),
  
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionContainer.appendChild(tr);
  },
  
  innerHTMLTransaction(transaction, index) { 
    const { description, amount, date } = transaction;
    const CSSclass = amount > 0 ? "income" : "expense"
    const formatedCurrency = Utils.formatCurrency(amount);
      const html = `
      <tr>
        <td class="description">${description}</td>
        <td class="${CSSclass}">${formatedCurrency}</td>
        <td class="date">${date}</td>
        <td class="options">
          <img title="Remover" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
          <img title="Editar" onclick="Form.updateTransaction(${index})" src="./assets/edit.svg" alt="Editar transação">
        </td>
      </tr>
      `;

    return html;
  },

  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes());

    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses());


    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total());
    
  },

  clearTransactions() {
    DOM.transactionContainer.innerHTML = "";
  }
}

const Utils = {
  formatAmount(value) {
    return Math.round(Number(value) * 100) ;
    
  },

  formatDate(date) {
    const [year, month, day] = date.split("-");
    return `${day}/${month}/${year}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g,"");
    value = Number(value) / 100;

    value = value.toLocaleString("pt-br", { style: 'currency', currency: 'BRL'});
    return signal + value;
    // return new Intl.NumberFormat(
    //   'pt-br', 
    //   { style: 'currency', currency: 'BRL' }
    //   ).format(numberValue / 100);

  },
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),
  transactionId: document.querySelector('input#transaction'),

  getValues() {
    transactionId = Form.transactionId && Form.transactionId.value || '' 
    return {
      transactionId,
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues();
    if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }
  },

  formatValues() {
    let { description, amount, date, transactionId } = Form.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      transactionId,
      description,
      amount,
      date
    }

  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
    Form.transactionId.value = "";
  },

  updateTransaction(index) {
    Modal.toggle();
    Modal.update();

    const {description, amount, date} = Transaction.all[index];
    const [day, month, year] = date.split("/");

    Form.description.value = description;
    Form.amount.value = Number(amount) / 100; 
    Form.date.value = `${year}-${month}-${day}`;
    Form.transactionId.value = index;
  },

  submit(event) {
    event.preventDefault();

    try {
      Form.validateFields();

      const transaction = Form.formatValues();

      if(transaction.transactionId === ''){
        Transaction.add(transaction);
      } else {
        Transaction.update(transaction);
      }

      Form.clearFields();
      
      Modal.toggle();
      Modal.setDefault();
    } catch (error) {
      alert(error.message)
    }
  }
}


const App = {
  init() {
    Transaction.all.forEach(DOM.addTransaction);
    DOM.updateBalance();

    Storage.set(Transaction.all);
  },

  reload() {
    DOM.clearTransactions();
    App.init();
  }
}

App.init()

