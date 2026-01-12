let classes = [];
const listeners = [];

const sanitizeId = (str) => {
    return str.replace(/[^a-zA-Z0-9_-]/g, "_");
}

const addListener = (element, event, handler)  => {
    listeners.push({ element, event, handler });
}

const removeListeners = () => {
    listeners.forEach(i => {
        i.element.removeEventListener(i.event, i.handler);
    })
    listeners.length = 0;
}

const deleteClass = (event, element) => {
    event.stopPropagation();
    const title = element.querySelector(".class-title");
    const confirmDelete = confirm(`Er du sikker på at du vil slette klassen: ${title.textContent}?`);
    if (confirmDelete) {
        fetch("/api/deleteClass", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "tekst": title.textContent })
        })

        .then(response => {
            if (!response.ok) {
                throw new Error("server-feil");
            }
            return response.json();
        })
        .then(result => {
            element.remove();
        })
        .catch(error => console.error(error));
        
    }
}

const formEvent = (event, formObj, classes) => {
    let handler = [];
    event.preventDefault();
    const newClass = document.createElement("div");

    const nameInput = document.querySelector("#className");
    const classTable = document.querySelector(".class-container");

    if (!classTable) return;

    const messageDiv = document.querySelector("#message");

    const name = sanitizeId(nameInput.value.trim());
    let isMultiple = false;
    isMultiple = classes.some(classParm => classParm.navn === name);

    const title = document.createElement("span");
    title.className = "class-title";
    title.textContent = name;

    const deleteBtn = document.createElement("span");
    deleteBtn.className = "delete-x";
    deleteBtn.innerHTML = "&times;";

    handler = (event) => deleteClass(event, newClass);
    deleteBtn.addEventListener("click", handler);
    addListener(deleteBtn, "click", handler);

    if (isMultiple) {
        messageDiv.textContent = `Det finnes allerede en klasse med navnet "${name}"`;
        messageDiv.style.color = "Red";
        return; 
    }
    

    if (!name) {
        messageDiv.textContent = "Skriv inn et navn!";
        messageDiv.style.color = "Red";
        return;
    }

    newClass.className = "class-box";
    
    newClass.appendChild(title);
    newClass.appendChild(deleteBtn);
    classTable.appendChild(newClass);


    formObj.reset();

    const list = { 
        navn: name, 
        info: []
    };
    classes.push(list);

    handler = (e) => classEvent(e, list, newClass);
    newClass.addEventListener("click", handler);
    addListener(newClass, "click", handler);

    fetch("/api/lagreKlasser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(list)
    })
    .then(response => response.json())
    .then(result => {
        location.reload();
    })
    .catch(error => console.error(error));
}

const classEvent = (event, classObj, element) => {
    event.preventDefault();
    const title = element.querySelector(".class-title");

    const classElements = document.querySelectorAll(`.${element.className}`);
    let isElement = false;
    classElements.forEach(classElement => {
        
        const titleTest = classElement.querySelector(".class-title");
        if (titleTest.textContent == title.textContent) {
            isElement = true;
        }
    });

    if (!isElement) {
        return;
    }

    localStorage.setItem("classInfo", JSON.stringify(classObj));
    removeListeners()
    window.location.href = "/public/Dunker.html";
}

document.addEventListener("DOMContentLoaded", () => {
    let handler = [];
    const classForm = document.querySelector("#newClassForm");
    
    fetch("/api/henteKlasser")
    .then(response => response.json())
    .then(serverClasses => {
        classes = serverClasses;
        classes.forEach(classObj => {
            const classTable = document.querySelector(".class-container");
            if (!classTable) return;
            
            const main = document.createElement("div");
            main.className = "class-box";

            const title = document.createElement("span");
            title.className = "class-title";
            title.textContent = classObj["navn"];

            const deleteBtn = document.createElement("span");
            deleteBtn.className = "delete-x";
            deleteBtn.innerHTML = "&times;"; // x

            handler = (event) => deleteClass(event, main);
            deleteBtn.addEventListener("click", handler);
            addListener(deleteBtn, "click", handler);
            
            main.appendChild(title);
            main.appendChild(deleteBtn);
            classTable.appendChild(main);

            handler = (event) => classEvent(event, classObj, main);
            main.addEventListener("click", handler); 
            addListener(main, "click", handler);
        });
    })
    .catch(error => console.error(error));

    if (classForm) {
        handler = (event) => formEvent(event, classForm, classes);
        classForm.addEventListener("submit", handler);
        addListener(classForm, "submit", handler);
    }
});