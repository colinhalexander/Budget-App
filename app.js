// BUDGET CONTROLLER
var budgetController = (function() { //keep track of incomes, expenses, budget, percentages
    
    // function constructors:
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1
    };
    
    Expense.prototype.calcPercentage = function(totalInc) {
        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) { // will differentiate later from Expense
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    // for calculating total income and expenses
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        
        data.totals[type] = sum;
    };
    
    // main data structure
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return {
        addItem: function(type, des, val) { // (inc/exp, description, value)
            var newItem, ID;
            
            //create new ID, based on ID of last element in array
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //create new inc or exp item
            if (type === 'exp') {
                newItem = new Expense(ID, des, val); 
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // push into data structure
            data.allItems[type].push(newItem)
            
            //return new element
            return newItem;
        },
        deleteItem: function(type, id) {
            
            // need to make sure you get both the ID and index even when items have been deleted
            var idArray, index;
            
            idArray = data.allItems[type].map(function(current){
                return current.id;
            });
            
            index = idArray.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
            
        },
        calculateBudget: function() {
            
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate percentage of income spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function() {
            
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            });  
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        getPercentages: function() {
            var allPercent = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPercent;
        },
        testing: function() {
            console.log(data);
        }
    };
    
})();

// USER INTERFACE CONTROLLER
var UIController = (function() {
    
    var DOMstrings = {            // central storage place for strings that will be repeated,
        inputType: '.add__type',  // makes it easier to change and update
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
        var numSplit, int, dec;
            
        // add a plus or minus based on type
        // two decimal points
        // comma separating 000,000s 
            
        num = Math.abs(num);
        num = num.toFixed(2);
            
        numSplit = num.split('.');
            
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
            
        dec = numSplit[1];
            
        num = '$' + int + '.' + dec;
            
        type === 'inc' ? num = '+ ' + num : num = '- ' + num;
            
        return num;
            
    };
    
    var nodeListForEach = function(list, callback) {
                
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    
    // get input
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) { //object is a newItem, type is inc/exp
            
            var html, newHtml, element;
             
            // create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">%P/C%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close outline"></i></button> </div> </div> </div>';
            }

            // replace placeholder text with actual data from obj

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert HTML code into DOM

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            
            var el = document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            var fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
                
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget >= 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensePercentLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },
        
        displayMonth: function() {
            var now, month, date;
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            
            now = new Date();
            month = months[now.getMonth()];
            
            date = month + ' ' + now.getFullYear();
            
            document.querySelector(DOMstrings.dateLabel).textContent = date;
        },
        
        changeType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', ' +
                DOMstrings.inputDescription + ', ' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            /*
            .right { float: right; }
            .red { color: #FF5049 !important; }
            .red-focus:focus { border: 1px solid #FF5049 !important; }
            */
            
        },
        
        getDOMstrings: function() {
            return DOMstrings;
    }
    };
    
    
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings(); //only need domstrings in this module for E-listeners
        
        document.querySelector(DOM.inputBtn).addEventListener('click', cntrlAddItem);

        document.addEventListener('keypress', function(event) {

            if (event.keycode === 13 || event.which === 13) {
                cntrlAddItem();
            }
            
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
        
    };
    
    var updateBudget = function() {
        
        // 4. calculate budget
        budgetCtrl.calculateBudget();
        
        // 5. return budget
        var budget = budgetCtrl.getBudget();
        
        // 6. display budget on UI
        UICtrl.displayBudget(budget);
        
    }
    
    var updatePercentages = function() {
        
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();        
        
        // 3. update UI
        UICtrl.displayPercentages(percentages);
    }
    
    var cntrlAddItem = function() {
        
        var input, newItem;
        
        // 1. get input data
        input = UICtrl.getInput();        
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) { // prevent blank/incomplete entries
            
            // 2. add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add item to UI
            UICtrl.addListItem(newItem, input.type);

            // 4 clear fields after adding
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();
            
            // 6. calculate and update percentages
            updatePercentages();
        }
        
    }
    
    var ctrlDeleteItem = function(event) {
        
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            // inc-1?
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. delete item from data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. delete item from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. update and display new budget data
            updateBudget();
            
            // 4. calculate and update percentages
            updatePercentages();
        }
    };
    
    // create init function
    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
        }
        
    };
    
    
})(budgetController, UIController);


controller.init(); // only outer line of code























































































