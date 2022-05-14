const makeOrderBtn = document.querySelector("#guardar-cliente");
const form = document.querySelector("form");
const table = document.querySelector("#mesa");
const hour = document.querySelector("#hora");

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
        const row = document.createElement("div");
        row.classList.add("row", "py-3", "border-top");

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

        row.appendChild(name);
        row.appendChild(price);
        row.appendChild(category);
        row.appendChild(quantityDiv);
        divContainer.appendChild(row);
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
        console.log(customer)
        } else {
            //food does not exist, so we add for the first time
            customer.order = [...order, foodObject];
            console.log(customer)
        }

        

    }
}

