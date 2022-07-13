const books = []
const RENDER_EVENT = 'render-books';
const SAVED_EVENT = 'saved-books';
const STORAGE_KEY = 'books_vaults';

document.addEventListener('DOMContentLoaded', function(){
    const submitForm = document.getElementById('form')
    submitForm.addEventListener('submit', function(event){
        event.preventDefault()
        addBooks()
    })
    if(isStorageExist()){
        loadDatafromStorage()
    }
})

document.addEventListener(SAVED_EVENT, function(){
    // alert('Data Berhasil Disimpan')
})

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert("Browser tidak mendukung local storage")
        return false
    }
    return true
}

function generateID(){
    return +new Date()
}

function generateBookObject(id, title, author, year, isComplete){
    return {
        id, 
        title,
        author,
        year,
        isComplete,
    }
}

function saveData(){
    if(isStorageExist()){
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

function addBooks(){
    const bookTitle = document.getElementById('title').value.toLowerCase()
    const bookAuthor = document.getElementById('author').value
    const bookYear = document.getElementById('year').value
    const generatedID = generateID()
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, false)
    books.push(bookObject)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function loadDatafromStorage(){
    const alldata = localStorage.getItem(STORAGE_KEY)
    let data = JSON.parse(alldata)
    if(data !== null){
        for(const book of data){
            books.push(book)
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT))
}

document.addEventListener(RENDER_EVENT, function(){
    const notDoneList = document.getElementById('notDone')
    notDoneList.innerHTML = ''

    const doneList = document.getElementById('done')
    doneList.innerHTML = ''

    for(const book of books){
        const bookElement = makeBook(book)
        if (!book.isDone) {
            notDoneList.append(bookElement)
        } else {
            doneList.append(bookElement)
        }
    }
})

function makeBook(bookObject){
    const bookTitle = document.createElement('h3')
    bookTitle.innerHTML = bookObject.title

    const bookAuthor = document.createElement('p')
    bookAuthor.innerHTML = bookObject.author
    const bookYear = document.createElement('p')
    bookYear.innerHTML = bookObject.year

    const separator = document.createElement('p')
    separator.innerHTML = '&nbsp-&nbsp'

    const bookContainerInner = document.createElement('div')
    bookContainerInner.append(bookAuthor)
    bookContainerInner.append(separator)
    bookContainerInner.append(bookYear)
    bookContainerInner.classList.add('itemInner')

    const container = document.createElement('li');
    container.classList.add('item');
    container.append(bookTitle);
    container.append(bookContainerInner)
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isDone) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');
        undoButton.addEventListener('click', function(){
            undoBookFromDone(bookObject.id);
        });
    
        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.addEventListener('click', function () {
            removeBookFromDone(bookObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.id = 'editBtn'
        editButton.addEventListener('click', function (event) {
            event.preventDefault()
            editBook(bookObject.id);
        });
    
        container.append(undoButton, trashButton, editButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');
        checkButton.addEventListener('click', function () {
            addBookToDone(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');
        trashButton.addEventListener('click', function () {
            removeBookFromDone(bookObject.id);
        });

        const editButton = document.createElement('button');
        editButton.classList.add('edit-button')
        editButton.id = 'editBtn'
        editButton.addEventListener('click', function (event) {
            event.preventDefault()
            editBook(bookObject.id);
        });
        
        container.append(checkButton, trashButton, editButton);
    }
    
    return container;
}

function findBook(bookId){
    for(const book of books){
        if(book.id === bookId){
            return book
        }
    }
    return null
}

function findBookIndex(bookId){
    for(const index in books){
        if (books[index].id === bookId) {
            return index
        }
    }
    return -1
}

function addBookToDone(bookId){
    const bookTarget = findBook(bookId)
    if(bookTarget == null) return
    bookTarget.isDone = true
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function removeBookFromDone(bookId){
    const bookTarget = findBookIndex(bookId)
    if(bookTarget === -1) return
    books.splice(bookTarget, 1)
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function undoBookFromDone(bookId){
    const bookTarget = findBook(bookId)
    if(bookTarget == null) return
    bookTarget.isDone = false
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveData()
}

function editBook(bookId){
    const bookTarget = findBook(bookId)
    const modal = document.getElementById("myModal")
    const span = document.getElementsByClassName("close")[0]
    modal.style.display = "block"
    span.onclick = function(){
        modal.style.display = "none"
    }
    window.onclick = function(event){
        if(event.target == modal){
            modal.style.display = "none"
        }
    }
    const submitEditedTitle = document.getElementById('editedTitle')
    const editedTitle = document.getElementById('editTitleInput')
    const editedAuthor = document.getElementById('editAuthorinput')
    const editedYear = document.getElementById('editYearInput')
    if(bookTarget === -1) return
    submitEditedTitle.addEventListener('submit', function(event){
        event.preventDefault()
        bookTarget.title = editedTitle.value
        bookTarget.author = editedAuthor.value
        bookTarget.year = editedYear.value
        document.dispatchEvent(new Event(RENDER_EVENT))
        saveData()
        modal.style.display = "none"
    })
}

function searchbook(){
    let search = document.getElementById('search').value.toLowerCase()
    let ulNotDone = document.getElementById("notDone")
    let ulDone = document.getElementById("done")
    let liNotDone = ulNotDone.getElementsByTagName('li')
    let liDone = ulDone.getElementsByTagName('li')
    for(let i = 0; i < liNotDone.length; i++){
        let h3Element = liNotDone[i].getElementsByTagName("h3")[0]
        let txtValue = h3Element.innerText || h3Element.textContent
        if(txtValue.toLowerCase().indexOf(search) > -1){
            liNotDone[i].style.display = ""
        }else{
            liNotDone[i].style.display = "none"
        }
    }
    for(let i = 0; i < liDone.length; i++){
        let h3Element = liDone[i].getElementsByTagName("h3")[0]
        let txtValue = h3Element.innerText || h3Element.textContent
        if(txtValue.toLowerCase().indexOf(search) > -1){
            liDone[i].style.display = ""
        }else{
            liDone[i].style.display = "none"
        }
    }
}
