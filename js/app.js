const makeOrderBtn = document.querySelector("#guardar-cliente");
const form = document.querySelector("form");
const table = document.querySelector("#mesa");
const hour = document.querySelector("#hora");

let customer = {
    table: "",
    hour: "",
    order: []
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
        row.classList.add("row");

        const name = document.createElement("div");
        name.classList.add("col-md-4");
        name.textContent = food.nombre;
        
        row.appendChild(name);
        divContainer.appendChild(row);
    })



}

