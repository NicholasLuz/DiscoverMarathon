// const modal = {
//     open(){
//         // Adicionar a classe active ao modal
//         document.querySelector('.modalOverlay').classList.add('active')
//     },
//     close(){
//         // Remover a classe active do modal
//         document.querySelector('.modalOverlay').classList.remove('active')
//     }
// }

function modalToggle(){
    var element = document.querySelector(`.modalOverlay`);
    element.classList.toggle(`active`);
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [] //transforma a string salva no local storage em um array
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) //transforma array em string, pois local storage só armazena string
    },
}

const Transaction = {
    all: Storage.get(),
    
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach((transaction) => {
        if(transaction.amount >=0) {
                income += transaction.amount;
            }
        })

        return income;
    },

    expenses() {
        let expense = 0;

        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })

        return expense
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector(`#dataTable tbody`),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount >= 0 ? `income` : `expense`

        const amount = utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img class="imgCursor" onclick=Transaction.remove(${index}) src="./assets/minus.svg" alt="Remove Transaction">
            </td>
            `
        
        return html
    },
    updateBalance() {
        document.getElementById(`incomeDisplay`).innerHTML = utils.formatCurrency(Transaction.incomes())
        document.getElementById(`expenseDisplay`).innerHTML = utils.formatCurrency(Transaction.expenses())
        document.getElementById(`totalDisplay`).innerHTML = utils.formatCurrency(Transaction.total())

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ``
    }
}

// DOM.addTransaction(transactions[0])

const utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? `-` : ``

        value = String(value).replace(/\D/g, ``)

        value = Number(value)/100

        value = value.toLocaleString(`pt-BR`, {
            style: `currency`,
            currency: `BRL`,
        })

        return signal + value
    },

    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
}

// guardar no local Storage do navegador


const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        }) /* forEach funcionalidade para Arrays */

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

const Form = {
    description: document.querySelector(`input#description`),
    amount: document.querySelector(`input#amount`),
    date: document.querySelector(`input#date`),

    getValues() {
        return{
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
 
    validateFields(){
        const {description, amount, date} = Form.getValues()

        if(description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === "") {
            throw new Error(`Todos os campos devem ser preenchidos`) 
        }

    },

    formatData(){
        let {description, amount, date} = Form.getValues()
        
        amount = utils.formatAmount(amount)

        date = utils.formatDate(date)

        return {
            description,
            amount,
            date,
        }
    },

    saveTransaction(transaction){
        Transaction.add(transaction)
    },

    clearFields(){
        Form.description.value = ``
        Form.amount.value = ``
        Form.date.value = ``
    },

    submit(event) {

        event.preventDefault()

        try {
            //verificar se todas as informações foram preenchidas
            Form.validateFields()

            //formatar dados para salvar
            const transaction = Form.formatData()

            //salvar
            Form.saveTransaction(transaction)

            //apagar dados do formulário
            Form.clearFields()

            //fechar modal e atualizar app
            modalToggle()

        } catch (error) {
            alert(error.message) //alerta para caso não sejam preenchidos todos campos
        }
    }
}


App.init()

// Transaction.add({
//     description: `Alo`,
//     amount: 30000,
//     date: `25/03/2022`,
// })

// Transaction.remove(3)