const sizes = [80, 140, 240, 370, 660];
const listeners = [];


const sanitizeId = (str) => {
    return str.replace(/[^a-zA-Z0-9_-]/g, "_");
}

const addListener = (element, event, handler)  => {
    listeners.push({ element, event, handler });
}

const removeListeners = () => {
    listeners.forEach(i => {
        i.element.removeEventListener(i.event, i.handler)
    })
    listeners.length = 0;
}

const changeAmount = (sign) => {
    const classInfo = JSON.parse(localStorage.getItem("classInfo")) || [];
    const selectedSize = document.querySelector(".sizeSelect").value;
    if (!selectedSize) {
        return;
    }
    
    const amountInput = parseInt(document.querySelector(".changeAmount").value);

    if (isNaN(amountInput) || amountInput < 0) {
        alert("Skriv inn et gyldig antall!")
        return;
    }

    const table = document.querySelector(".logTable");
    const row = table.querySelector(`tr[data-size="${selectedSize}"]`);

    if (!row) {
        console.warn("Fant ingen rad for:", selectedSize);
        return;
    }

    const amountCell = row.cells[2];

    let currentAmount = parseInt(amountCell.textContent);
    let sum = sign * amountInput
    currentAmount += sum;

    if (currentAmount < 0) {
        currentAmount = 0;
        sum = sum + (parseInt(amountCell.textContent) - sum);
    }  
    amountCell.textContent = currentAmount;

    if (sum == 0) {
        return;
    }

    const today = new Date();

    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();

    const formattedDate = `${day}.${month}.${year}`;

    const classIndexRow = classInfo.info.findIndex(entry => entry.Navn == selectedSize);
    
    

    if (classIndexRow !== -1) {
        const logButton = document.querySelector(`#logButton-${classInfo.info[classIndexRow].Navn}`);
        if (!classInfo.info[classIndexRow].logg) classInfo.info[classIndexRow].logg = [];
        classInfo.info[classIndexRow].logg.push([formattedDate, sum]);
        let classStabelMengde = classInfo.info[classIndexRow]["Mengde per stabel"];
        let classStabelBeholdning = classInfo.info[classIndexRow]["Beholdning i stabel"];

        classStabelBeholdning = currentAmount;

        if (classStabelMengde == 0 && classStabelBeholdning) {
            classStabelMengde = 1;
            row.cells[1] = classStabelMengde;
        }

        classInfo.info[classIndexRow]["Mengde per stabel"] = classStabelMengde;
        classInfo.info[classIndexRow]["Beholdning i stabel"] = classStabelBeholdning;
        classInfo.info[classIndexRow].totalStabel += sum * classStabelMengde;

        localStorage.setItem("classInfo", JSON.stringify(classInfo));
        if (logButton) {
            logButton.dataset.array = JSON.stringify(classInfo.info[classIndexRow].logg);
        }
    }
    

    fetch("/api/classUpdate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(classInfo)
    })
    .then(response => response.json())
    .then(result => {
    })
    .catch(error => console.error(error));
    
}

const setStack = () => {
    const classInfo = JSON.parse(localStorage.getItem("classInfo"));

    const selectedSize = document.querySelector(".sizeSelect").value;
    const volume = parseInt(document.querySelector(".stackVolume").value);

    const classIndexRow = classInfo.info.findIndex(entry => entry.Navn == selectedSize);

    if (isNaN(volume) || volume < 0) {
        alert("Skriv inn et gyldig antall!")
        return;
    }

    const table = document.querySelector(".logTable");
    const row = table.querySelector(`tr[data-size="${selectedSize}"]`);
    row.cells[1].textContent = volume;
    classInfo.info[classIndexRow]["Mengde per stabel"] = volume;

    const expression = classInfo.info[classIndexRow].totalStabel / classInfo.info[classIndexRow]["Mengde per stabel"];
    classInfo.info[classIndexRow]["Beholdning i stabel"] = Math.ceil(expression);

    row.cells[2].textContent = classInfo.info[classIndexRow]["Beholdning i stabel"];

    fetch("/api/classUpdate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(classInfo)
    })
    .then(response => response.json())
    .then(result => {
    })
    .catch(error => console.error(error));
    localStorage.setItem("classInfo", JSON.stringify(classInfo));
}

const removeLog = (backgroundLog) => {
    document.body.removeChild(backgroundLog);
}


const convertDate = (dateStr) => {
    const [day, month, year] = dateStr.split(".");
    return new Date(`${year}-${month}-${day}`);
}

const logEvent = (logButton) => {
    let handler = [];
    const existedContainer = document.querySelector("#logContainer");
    if (existedContainer) {
        document.body.removeChild(existedContainer);
    }

    const backgroundLog = document.createElement("div");
    backgroundLog.style.backgroundColor = "rgba(0,0,0,0.1)";
    backgroundLog.style.width = "100vw";
    backgroundLog.style.height = "100vh";
    backgroundLog.style.position = "fixed";
    backgroundLog.style.display = "flex";
    backgroundLog.style.justifyContent = "center";
    backgroundLog.style.alignItems = "center";
    backgroundLog.style.zIndex = 1000;

    handler = () => removeLog(backgroundLog);
    backgroundLog.addEventListener("click", handler);
    addListener(backgroundLog, "click", handler);


    const container = document.createElement("div");
    const logObj = document.createElement("div");

    container.className = "table-wrapper";
    container.id = "logContainer";
    container.style.backgroundColor = "lightgrey";
    container.style.width = "250px";
    container.style.height = "300px";
    container.style.zIndex = 1000;
    container.style.position = "fixed";
    container.style.overflow = "hidden";
    container.style.borderRadius = "25px";
    container.style.border = "2px solid black";

    logObj.className = "log";
    logObj.style.width = "100%";
    logObj.style.height = "100%";
    logObj.style.zIndex = 1000;
    logObj.style.alignSelf = "center";
    logObj.style.backgroundColor = "lightgrey";
    logObj.style.borderRadius = "22px";
    logObj.style.margin = "0px";

    // Important for scroll
    logObj.style.overflow = "auto";
    
    const table = document.createElement("table");
    table.className = "logTable";
    table.style.width = "100%";
    table.style.margin = "0px";
    
    const hrow = table.insertRow();
    const th1 = document.createElement("th");
    const th2 = document.createElement("th");
    
    th1.textContent = "Date";
    th2.textContent = "Description";

    hrow.appendChild(th1);
    hrow.appendChild(th2);


    const logInfo = JSON.parse(logButton.dataset.array);
    logInfo.sort((a, b) => convertDate(b[0]) - convertDate(a[0]));

    for (let i = 0; i < logInfo.length; i++) {
        const row = table.insertRow();
        const c1 = row.insertCell(0);
        const c2 = row.insertCell(1);

        c1.textContent = logInfo[i][0];
        c2.textContent = logInfo[i][1];
    }

    logObj.appendChild(table);
    container.appendChild(logObj);
    backgroundLog.appendChild(container);
    document.body.appendChild(backgroundLog);

    handler = (e) => {
        e.stopPropagation();
    }

    logObj.addEventListener("click", handler);
    addListener(logObj, "click", handler);
}

const rowDeletion = (row, table) => {
    const classInfo = JSON.parse(localStorage.getItem("classInfo"));
    const sizeSelect = document.querySelector(".sizeSelect");
    const options = sizeSelect.querySelectorAll("option");
    const optionElement = Array.from(options).find(entry => entry.textContent == row.cells[0].textContent);

    const rowIndex = row.rowIndex - 1;
    if (classInfo.info[rowIndex]) {
        const confirmDelete = confirm(`Er du sikker på at du vil slette raden: ${classInfo.info[rowIndex].Navn}?`);
        if (confirmDelete) {
            
            fetch("/api/deleteRow", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(classInfo)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Server-feil");
                } 
                return response.json();
            })
            .then(result => {
                if (optionElement) {
                    sizeSelect.removeChild(optionElement);
                }

                table.deleteRow(rowIndex + 1);
            })
            .catch(error => console.error(error));

            classInfo.info.splice(rowIndex, 1);
            localStorage.setItem("classInfo", JSON.stringify(classInfo));

            alert("Raden ble slettet!");
        }
    }
}

const rowCreater = (rowInfo, i) => {
    let handler = [];
    const table = document.querySelector(".logTable");
    const row = table.insertRow();
    row.setAttribute("data-size", rowInfo["Navn"]);

    const c1 = row.insertCell(0);
    const c2 = row.insertCell(1);
    const c3 = row.insertCell(2);
    const c4 = row.insertCell(3);

    c1.textContent = rowInfo["Navn"];
    c2.textContent = rowInfo["Mengde per stabel"] || 0;
    c3.textContent = rowInfo["Beholdning i stabel"] || 0;


    const iconsContainer = document.createElement("div");
    iconsContainer.className = "action-icons";

    const logButton = document.createElement("button");
    logButton.textContent = "📕";
    logButton.className = "Logg";
    logButton.id = `logButton-${rowInfo["Navn"]}`;

    const delButton = document.createElement("button");
    delButton.innerHTML = "🗑️"; // søppelbøtte
    delButton.title = "Slett";
    delButton.className = "delete-icon";

    handler = () => rowDeletion(row, table);
    delButton.addEventListener("click", handler);
    addListener(delButton, "click", handler);

    const array = JSON.stringify(rowInfo["logg"]);
    logButton.dataset.array = array;

    handler = () => logEvent(logButton);
    logButton.addEventListener("click", handler);
    addListener(logButton, "click", handler);

    iconsContainer.appendChild(logButton);
    iconsContainer.appendChild(delButton);
    c4.appendChild(iconsContainer);
}

const addRow = () => {
    let handler = [];
    const sizeSelect = document.querySelector(".sizeSelect");
    const table = document.querySelector(".logTable");
    const nameInput = document.querySelector(".row-name-input");
    

    const row = table.insertRow();

   const classInfo = JSON.parse(localStorage.getItem("classInfo")) || { info: [] };

    const oldClassInfo = JSON.parse(JSON.stringify(classInfo));

    const name = sanitizeId(nameInput.value.trim());
    nameInput.value = "";

    if (!name) {
        alert("Skriv inn et navn!");
        return;
    }

    let isMultiple = false;
    isMultiple = classInfo.info.some(radInfo => radInfo.Navn == name);
    if (isMultiple) {
        alert(`Det finnes allerede en rad med navnet "${name}".`);
        return;
    }

    const opt = document.createElement("option");
    opt.textContent = name;

    const rowList = { Navn: name, "Mengde per stabel": 0, "Beholdning i stabel": 0, logg: [], totalStabel: 0}
    fetch("/api/addRow", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ row: rowList, klasse: oldClassInfo})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("server-feil");
        }
        return response.json();
    })
    .then(result => {
        row.setAttribute("data-size", name);

        const c1 = row.insertCell(0);
        const c2 = row.insertCell(1);
        const c3 = row.insertCell(2);
        const c4 = row.insertCell(3);

        const iconsContainer = document.createElement("div");
        iconsContainer.className = "action-icons";

        c1.textContent = name;
        c2.textContent = 0;
        c3.textContent = 0;

        const logButton = document.createElement("button");
        logButton.textContent = "📕";
        logButton.className = "Logg";
        logButton.id = `logButton-${name}`;

        const delButton = document.createElement("button");
        delButton.innerHTML = "🗑️"; // søppelbøtte
        delButton.title = "Slett";
        delButton.className = "delete-icon";

        handler = () => rowDeletion(row, table);
        delButton.addEventListener("click", handler);
        addListener(delButton, "click", handler);

        const array = JSON.stringify([]);
        logButton.dataset.array = array;

        classInfo.info.push(rowList);
        localStorage.setItem("classInfo", JSON.stringify(classInfo));

        handler = () => logEvent(logButton);
        logButton.addEventListener("click", handler);
        addListener(logButton, "click", handler);

        sizeSelect.appendChild(opt);
        iconsContainer.appendChild(logButton);
        iconsContainer.appendChild(delButton);
        c4.appendChild(iconsContainer);
        location.reload();
    })
    .catch(error => console.error(error));
}

const locationChanger = (e) => {
    e.preventDefault();
    removeListeners();
    localStorage.removeItem("classInfo");
    window.location.href = "/index.html";
}

function isTouchOnly() {
    // Returnerer true hvis enheten støtter touch og ikke har mus
    const touchSupported = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    const hasMouse = window.matchMedia('(pointer:fine)').matches; // fin peker = mus / stylus
    return touchSupported && !hasMouse;
}

const showHiddenButtons = () => {
    if (isTouchOnly()) {
        document.body.classList.add("touch-only");
        document.body.classList.remove("mouse-only");
    } else {
        document.body.classList.remove("touch-only");
        document.body.classList.add("mouse-only");
    }
}

document.addEventListener("DOMContentLoaded", () => {


    let handler = [];
    const backButton = document.querySelector("#backButton");
    backButton.addEventListener("click", locationChanger);
    addListener(backButton, "click", locationChanger);

    const table = document.querySelector(".logTable");
    table.innerHTML = `<tr>
        <th>Navn/Størrelse</th>
        <th>Mengde per stabel</th>
        <th>Beholdning i stabler</th>
        <th>Handling</th>
    </tr>`;

    const plussObj = document.querySelector(".pluss");
    const minusObj = document.querySelector(".minus");
    const setStackObj = document.querySelector(".setStackVolume");
    const addRowButton = document.querySelector(".add-row-btn");

    handler = () => changeAmount(1);
    plussObj.addEventListener("click", handler);
    addListener(plussObj, "click", changeAmount);

    handler= () => changeAmount(-1);
    minusObj.addEventListener("click", () => changeAmount(-1));
    addListener(minusObj, "click", handler);

    setStackObj.addEventListener("click", setStack);
    addRowButton.addEventListener("click", addRow);

    addListener(setStackObj, "click", setStack);
    addListener(addRowButton, "click", addRow);



    let i = 0;
    const classInfo = JSON.parse(localStorage.getItem("classInfo")) || [];
    if (classInfo) {
        const header = document.querySelector("header");
        const overskrift = header.querySelector("h1");
        if (classInfo.navn) {
            overskrift.textContent = `${classInfo.navn}-Oversikt`
        }
        
    }

    if (classInfo && classInfo["info"]) {
        classInfo["info"].forEach(rowInfo => {
            const sizeSelect = document.querySelector(".sizeSelect");
            const opt = document.createElement("option");
            opt.textContent = rowInfo["Navn"];


            sizeSelect.appendChild(opt);
            rowCreater(rowInfo, i)
            i++;

        });
    }
    showHiddenButtons();
});
