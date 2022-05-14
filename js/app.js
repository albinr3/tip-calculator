const makeOrderBtn = document.querySelector("#guardar-cliente");
const form = document.querySelector("form");
const table = document.querySelector("#mesa");
const hour = document.querySelector("#hora");
const divSummary = document.querySelector("#divResumen");

let customer = {
    table: "",
    hour: "",
    order: []
};

const categories = {
    1: "Food",
    2: "Drinks",
    3: "Postres"
};

makeOrderBtn.addEventListener("click", validation);

function makeOrder() {
    const hour = document.querySelector("#hora").value;
    const table = document.querySelector("#mesa").value;

    //add the values to the object, there are 2 ways

    // customer.table = table;
    // customer.hour = hour;

    customer = {...customer, table, hour }

    //hide modal
    const formModal = document.querySelector("#formulario");
    const bootstrapModal = bootstrap.Modal.getInstance(formModal);
    bootstrapModal.hide();

    //show hidden seccions
    showSections();

    //Get the food from the API
    getFood();

}

function validation() {

    //check if there are empty fields
    const emptyFields = [table.value, hour.value].some( field => field === "");
    console.log(table.value);
    if(emptyFields) {
        //check if there is an previus error
        const errorExist = document.querySelector(".invalid-feedback");
        if(!errorExist) {
            const error = document.createElement("div");
            error.classList.add("invalid-feedback", "d-block", "text-center");
            error.textContent = "Error, there is an empty field!!";
            form.appendChild(error);

            //delete the error after 3 seconds
            setTimeout(() => {
                error.remove();
            }, 3000);
    
        }
    
    } else {
        makeOrder();
    }
}


//show hidden seccions
function showSections() {
    const hideSeccions = document.querySelectorAll(".d-none");
    hideSeccions.forEach( seccion => seccion.classList.remove("d-none"));
}

//get the food from the API JSON-SERVER
function getFood() {
    const url = `http://localhost:3000/platillos`;

    fetch(url)
        .then( response => response.json())
        .then( result => showFoodHtml(result))
}

//show the food on the html after get the info from the api
function showFoodHtml(foodArray) {
    const divContainer = document.querySelector("#divPlatillos");

    foodArray.forEach( food => {
        const rowFood = document.createElement("div");
        rowFood.classList.add("row", "py-3", "border-top");

        const name = document.createElement("div");
        name.classList.add("col-md-4");
        name.textContent = food.nombre;

        const price = document.createElement("div");
        price.classList.add("col-md-3", "fw-bold");
        price.textContent = `$${food.precio}`;
        
        const category = document.createElement("div");
        category.classList.add("col-md-3");
        category.textContent = categories [food.categoria];

        const input = document.createElement("input");
        input.type = "number";
        input.min = 0;
        input.id = `product-${food.id}`;
        input.classList.add("form-control");
        input.value = 0;

        //detect when user change the value and add it to the list
        input.onchange = function() {
            const quantity = Number(input.value);

            //we pass an object with the food info and the quantity
            //we use the spread operator to merge food object with quantity
            addFoodToList({...food, quantity});
        }

        const quantityDiv = document.createElement("div");
        quantityDiv.classList.add("col-md-2");
        quantityDiv.appendChild(input);

        rowFood.appendChild(name);
        rowFood.appendChild(price);
        rowFood.appendChild(category);
        rowFood.appendChild(quantityDiv);
        divContainer.appendChild(rowFood);
    })



}

function addFoodToList(foodObject) {

    let {order} = customer;
    //first we check if the user put quantity to the food
    if(foodObject.quantity > 0) {
        //here we check if the food already exist
        if( order.some( orderTemp => orderTemp.id === foodObject.id)) {
            const updatedFoodObject = order.map( orderTemp => {
                if(orderTemp.id === foodObject.id) {
                    orderTemp.quantity = foodObject.quantity;
                }
                return orderTemp;
            });
        
        //we assign the new array to the orders
        customer.order = [...updatedFoodObject];
        
        } else {
            //food does not exist, so we add for the first time
            customer.order = [...order, foodObject];
            
        }
    } else {
        //delete food when the quantity is 0
        const result = order.filter( orderTemp => orderTemp.id != foodObject.id);
        customer.order = [...result]
    }

    //Clear previus html of the summary
    clearHtml();

    //check if there is not orders, to show empty message
    if(customer.order.length <= 0) {
        emptyMessage();
    }

    
    //this will print the html of all the orders in the summary
    updateSummary(customer.order);
}

function updateSummary(orders) {
    

    const summary = document.createElement("div");
    summary.classList.add("col-md-6", 'card', 'py-5', 'px-3', 'shadow');

    //table info
    const tableSummary = document.createElement("p");
    tableSummary.classList.add("fw-bold");
    tableSummary.innerHTML = `
        Table: <span class="fw-normal">${customer.table}</span>
    `;

    //hour info
    const hourSummary = document.createElement("p");
    hourSummary.classList.add("fw-bold");
    hourSummary.innerHTML = `
    Hour: <span class="fw-normal">${customer.hour}</span>
    `;

    //section title
    const title = document.createElement("h3");
    title.textContent = "Food eaten";
    title.classList.add("my-4", 'text-center');

    //iterate over the ordered list
    const group = document.createElement('ul');
    group.classList.add('list-group');
    const {order} = customer;

    //adding the info of each fod tp the summary html
    order.forEach( orderTemp => {
        const {nombre, quantity, precio, id} = orderTemp;

        //here we create and item of the list
        const rowOrder = document.createElement('li');
        rowOrder.classList.add("list-group-item");
        
        //name of each food
        const name = document.createElement('h4');
        name.classList.add("my-4");
        name.textContent = nombre;

        //quantity of each food
        const quantityEl = document.createElement("p");
        quantityEl.classList.add("fw-bold");
        quantityEl.innerHTML = `
        Quantity: <span class="fw-normal">${quantity}</span>
        `;

        //price of each food
        const price = document.createElement("p");
        price.classList.add("fw-bold");
        price.innerHTML = `
        Price: <span class="fw-normal">$${precio}</span>
        `;

        //subtotal of the food
        const subtotal = document.createElement("p");
        subtotal.classList.add("fw-bold");
        subtotal.innerHTML = `
        Subtotal: <span class="fw-normal">$${precio * quantity}</span>
        `;

        //button to delete
        const buttonDelete = document.createElement('button');
        buttonDelete.classList.add('btn', 'btn-danger');
        buttonDelete.textContent = 'Delete from the order';
        buttonDelete.onclick = function() {
            deleteOrder(id);
        }

        //here we add each text to the LI and then to the UL
        rowOrder.appendChild(name);
        rowOrder.appendChild(quantityEl);
        rowOrder.appendChild(price);
        rowOrder.appendChild(subtotal);
        rowOrder.appendChild(buttonDelete);

        group.appendChild(rowOrder);

    } )

    summary.appendChild(title);
    summary.appendChild(tableSummary);
    summary.appendChild(hourSummary);

    summary.appendChild(group);

    divSummary.appendChild(summary);

    //tips form
    tipForm();
}

//clear the html of the summary
function clearHtml() {
    
    while(divSummary.firstChild) {
        divSummary.removeChild(divSummary.firstChild);
    }
}

//function to delete a single order
function deleteOrder(id) {
    const {order} = customer;
    const updatedOrder = order.filter( orderTemp => orderTemp.id != id);
    customer.order = [...updatedOrder];

    //Clear previus html of the summary
    clearHtml();

    //check if there is not orders, to show empty message
    if(customer.order.length <= 0) {
        emptyMessage();
    }

    //this will print the html of all the orders in the summary
    updateSummary(customer.order);

    //the food got deleted so we reset the quantity on the form to 0
    const deletedFood = document.querySelector(`#product-${id}`);
    deletedFood.value = 0;
}

//message about empty order

function emptyMessage() {

    const message = document.createElement('p');
    message.innerHTML = '<p class="text-center">Añade los elementos del pedido</p>'
    divSummary.appendChild(message);
    
}

//form for the tip
function tipForm() {
    const divTip = document.createElement('div');
    divTip.classList.add('form', 'col-md-6');

    const formTip = document.createElement('div');
    formTip.classList.add('card', 'py-2', 'px-3', 'shadow', 'div-form');

    const title = document.createElement('h3');
    title.classList.add('my-4', 'text-center');
    title.textContent = 'Tip';

    //radio button 10%
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'tip';
    radio10.value = 10;
    radio10.classList.add('form-check-input');
    radio10.onclick = function() {
        calcTip(radio10.value);
    };
    const radio10Label = document.createElement('label');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');
    

    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');

    //add radio and radio label to the radio div
    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    //radio button 25% 
    const radio25 = document.createElement('input');
    radio25.type = 'radio';
    radio25.name = 'tip';
    radio25.value = 25;
    radio25.classList.add('form-check-input');
    radio25.onclick = function() {
        calcTip(radio25.value);
    };

    const radio25Label = document.createElement('label');
    radio25Label.textContent = '25%';
    radio25Label.classList.add('form-check-label');

    const radio25Div = document.createElement('div');
    radio25Div.classList.add('form-check');

    //add radio and radio label to the radio div
    radio25Div.appendChild(radio25);
    radio25Div.appendChild(radio25Label);


    formTip.appendChild(title);
    formTip.appendChild(radio10Div);
    formTip.appendChild(radio25Div);
    divTip.appendChild(formTip);
    divSummary.appendChild(divTip);

}

//calc the tip
function calcTip(tipValue) {
    const {order} = customer;

    let subtotal = 0;

    //calc the subtotal to pay
    order.forEach( orderTemp => {
        subtotal += orderTemp.quantity * orderTemp.precio;
    });

    //with this we calc the tip 
    const selectedTip = tipValue;
    const totalTip = (selectedTip/100) * subtotal;
    
    //subtotal + tip you want to give
    const totalToPay = subtotal + totalTip;

    showTotalHtml(totalTip, subtotal, totalToPay);
}

function showTotalHtml(tip, subtotal, total) {

    //first we verify if you already had a total to pay and we delete it
    const totalToPayExist = document.querySelector('.subtotals');
    if(totalToPayExist) {
        totalToPayExist.remove();
    };

    //second we create a div to storage subtotal, tip and total
    const ammountDiv = document.createElement('div');
    ammountDiv.classList.add('subtotals');

    //subtotal
    const subtotalParrafer = document.createElement('p');
    subtotalParrafer.classList.add('fw-bold', 'fs-3', 'mt-5');
    subtotalParrafer.innerHTML = `
        SubTotal: <span class='fw-normal'>$${subtotal}</span>
    `;

    ammountDiv.appendChild(subtotalParrafer);

    //tip
    const tipParrafer = document.createElement('p');
    tipParrafer.classList.add('fw-bold', 'fs-3', 'mt-2');
    tipParrafer.innerHTML = `
        Tip: <span class='fw-normal'>$${tip}</span>
    `;

    ammountDiv.appendChild(tipParrafer);

    //total
    const totalParrafer = document.createElement('p');
    totalParrafer.classList.add('fw-bold', 'fs-3', 'mt-2', 'border', 'total-pay');
    totalParrafer.innerHTML = `
        Total To Pay: <span class='fw-normal'>$${total}</span>
    `;

    ammountDiv.appendChild(totalParrafer);

    //here we select the form that have the radio buttons
    const divForm = document.querySelector('.div-form');
    divForm.appendChild(ammountDiv);



}