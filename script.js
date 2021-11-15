const modal = {
  open() {
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close() {
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

const storageSystem = {
  get() {
    return JSON.parse(localStorage.getItem('dev:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem('dev:transactions', JSON.stringify(transactions))
  }
}

const transactions = {
  all: storageSystem.get(),

  add(transaction) {
    transactions.all.push(transaction)

    app.reload()
  },

  remove(index) {
    transactions.all.splice(index, 1)

    app.reload()
  },

  incomes() {
    let income = 0

    transactions.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })

    return income
  },
  expenses() {
    let expense = 0

    transactions.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },
  total() {
    return transactions.incomes() + transactions.expenses()
  }
}

const DOM = {
  // balanço
  updateBalance() {
    document.querySelector('#incomeDisplay').innerHTML = useful.formatCurrency(
      transactions.incomes()
    )
    document.querySelector('#expenseDisplay').innerHTML = useful.formatCurrency(
      transactions.expenses()
    )
    document.querySelector('#totalDisplay').innerHTML = useful.formatCurrency(
      transactions.total()
    )
  },

  // transações
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transactions, index) {
    const tr = document.createElement('tr')

    tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },
  innerHTMLTransaction(transactions, index) {
    const cssClass = transactions.amount > 0 ? 'income' : 'expense'
    const amount = useful.formatCurrency(transactions.amount)

    const html = `
     <td class="description">${transactions.description}</td>
     <td class="${cssClass}">${amount}</td>
     <td class="date">${transactions.date}</td>
     <td>
       <img onclick="transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação" />
     </td> 
    `

    return html
  },

  clearContainerTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const useful = {
  formatAmount(value) {
    value = Number(value.replace(/\,\./g), '') * 100

    return value
  },

  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')

    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  }
}

const form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: form.description.value,
      amount: form.amount.value,
      date: form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = form.getValues()

    if (
      description.trim() === '' ||
      amount.trim() === '' ||
      date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os dados de transação.')
    }
  },

  formatValues() {
    let { description, amount, date } = form.getValues()

    amount = useful.formatAmount(amount)
    date = useful.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    form.description.value = ''
    form.amount.value = ''
    form.date.value = ''
  },

  submit(event) {
    event.preventDefault()

    try {
      form.validateFields()
      const transaction = form.formatValues()
      transactions.add(transaction)
      form.clearFields()
      modal.close()
    } catch (error) {
      alert(error.message)
    }
  }
}

const app = {
  init() {
    transactions.all.forEach(DOM.addTransaction)

    DOM.updateBalance()

    storageSystem.set(transactions.all)
  },

  reload() {
    DOM.clearContainerTransactions()
    app.init()
  }
}

app.init()
