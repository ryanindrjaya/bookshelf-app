const bukus = [];
const RENDER_EVENT = "render-buku";
const SAVED_EVENT = "saved-buku";
const STORAGE_KEY = "BOOKSHELF_APPS";
const searchBar = document.getElementById("search");

document.addEventListener(RENDER_EVENT, function(){
  const bukuBelumBaca = document.getElementById("bukus");
  bukuBelumBaca.innerHTML = "";
  
  const bukuSudahBaca = document.getElementById("bukus-selesai");
  bukuSudahBaca.innerHTML = "";
  
  for(let itemBuku of bukus){
    const elemenBuku = makeBuku(itemBuku);
    
    if(itemBuku.isCompleted == false){
      bukuBelumBaca.append(elemenBuku);
    } else {
      bukuSudahBaca.append(elemenBuku);
    }
  }
});

searchBar.addEventListener('keyup', function(e){
  const searchString = e.target.value.toLowerCase();
  const filteredBuku = bukus.filter((buku) => {
    return (
      buku.judul.toLowerCase().includes(searchString) ||
      buku.penulis.toLowerCase().includes(searchString)
    );
  })
  displayBuku(filteredBuku);
})


document.addEventListener(SAVED_EVENT, function(){
  console.log(localStorage.getItem(STORAGE_KEY));
})

document.addEventListener("DOMContentLoaded", function(){

  const submitForm = document.getElementById("inputBuku");

  submitForm.addEventListener("submit", function(event){
    event.preventDefault();
    addBuku();
    addToast();
  })

  if(isStorageExist()){
    loadDataFromStorage();
  }
})

function isStorageExist() /* boolean */ {
  if(typeof(Storage) === undefined){
    alert("Browser anda tidak mendukung local storage");
    return false;
  }
  return true;
}

function addBuku() {
  const judulBuku = document.getElementById("inputJudulBuku").value;
  const penulisBuku = document.getElementById("inputPenulisBuku").value;
  const tahunBuku = document.getElementById("inputTahunBuku").value;
  const bukuSelesai = isBukuSudahDibaca();

  const generatedID = generateId();
  const objekBuku = generateObjekBuku(generatedID, judulBuku, penulisBuku, tahunBuku, bukuSelesai);
  bukus.push(objekBuku);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function isBukuSudahDibaca(){
  const check = document.getElementById("inputBukuSelesai");

  if(check.checked){
    return true;
  } else {
    return false;
  }
}

function generateId() {
  return +new Date();
}

function generateObjekBuku(id, judul, penulis, tahun, isCompleted) {
  return {
    id,
    judul,
    penulis,
    tahun,
    isCompleted
  }
}

function makeBuku(objekBuku) {

  const judulBuku = document.createElement("h2");
  judulBuku.innerText = objekBuku.judul;

  const penulisBuku = document.createElement("p");
  penulisBuku.innerText = `Penulis: ${objekBuku.penulis}`;

  const tahunBuku = document.createElement("p");
  tahunBuku.innerText = `Tahun: ${objekBuku.tahun}`;

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("buttonItem");
  buttonContainer.setAttribute("id", `todo-${objekBuku.id}`)

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(judulBuku, penulisBuku, tahunBuku, buttonContainer);

  const container = document.createElement("div");
  container.classList.add("item");
  container.append(textContainer);
  container.setAttribute("id", `todo-${objekBuku.id}`);


  if(objekBuku.isCompleted){
    const undoButton = document.createElement("span");
    undoButton.classList.add("undo-button");
    undoButton.innerHTML = "<button>Belum Selesai dibaca</button>";
    undoButton.addEventListener("click", function(){
      undoBukuSelesaiDibaca(objekBuku.id);
    });
    
    const hapusBuku = document.createElement("span");
    hapusBuku.classList.add("hapus-buku");
    hapusBuku.innerHTML = "<button>Hapus buku</button>";
    hapusBuku.addEventListener("click", function(){
      hapusBukuSelesaiDibaca(objekBuku.id);
    });

    buttonContainer.append(undoButton, hapusBuku);

  } else {

    const selesaiBaca = document.createElement("span");
    selesaiBaca.classList.add("selesai-baca");
    selesaiBaca.innerHTML = "<button>Selesai dibaca</button>";
    selesaiBaca.addEventListener("click", function(){
      bukuSelesaiDibaca(objekBuku.id);
    });

    const hapusBuku = document.createElement("span");
    hapusBuku.classList.add("hapus-buku");
    hapusBuku.innerHTML = "<button>Hapus buku</button>";
    hapusBuku.addEventListener("click", function(){
      hapusBukuSelesaiDibaca(objekBuku.id);
    });

    buttonContainer.append(selesaiBaca, hapusBuku);
  }

  return container;

}

function hapusBukuSelesaiDibaca(bukuId) {
  const targetBuku = findIndexBuku(bukuId);
  if(targetBuku === -1) return;
  bukus.splice(targetBuku, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  delToast();
}

function undoBukuSelesaiDibaca(todoId) {
  const targetBuku = findBuku(todoId);
  if(targetBuku == null) return;

  targetBuku.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  addToast();
}

function findIndexBuku(todoId) {
  for(index in bukus){
    if(bukus[index].id === todoId){
      return index;
    }
  }
  return -1;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if(data !== null){
    for(let buku of data){
      bukus.push(buku);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function bukuSelesaiDibaca(bukuId) {

  const targetBuku = findBuku(bukuId);
  if(targetBuku == null) return;

  targetBuku.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  selesaiToast();
}

function findBuku(bukuId){
  for(itemBuku of bukus){
    if(itemBuku.id === bukuId){
      return itemBuku;
    }
  }
  return null;
}

function saveData() {
  if(isStorageExist()){
    const parsed = JSON.stringify(bukus);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function showTambahBuku() {
  const showInputSection = document.getElementById("inputSection");
  if (showInputSection.style.display === "none"){
    showInputSection.style.display = "flex";
  } else {
    showInputSection.style.display = "none";
  }
}

function addToast(){
  const toast = document.getElementById("toast");
  toast.innerText = "Berhasil menambahkan Buku belum dibaca.";
  toast.className = "show";
  setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

function delToast(){
  const delToast = document.getElementById("toast");
  delToast.innerText = "Berhasil menghapus buku!";
  toast.className = "show";
  setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

function selesaiToast(){
  const delToast = document.getElementById("toast");
  delToast.innerText = "Berhasil menambahkan buku sudah dibaca.";
  toast.className = "show";
  setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

function displayBuku(bukus) {
  const displayBuku = document.getElementById("displayBuku");
  displayBuku.innerHTML = "";


  for(let itemBuku of bukus){
    const elemenBuku = makeBuku(itemBuku);

    displayBuku.append(elemenBuku);
  }
}

