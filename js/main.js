const baseUrl = "https://dummyjson.com";

const productsPerPage = 20;
let currentPage = 1,
  category = "",
  products = [],
  categories = [],
  cart = JSON.parse(localStorage.getItem("cart")) || [];

function addLocalStorage(arr) {
  localStorage.setItem("cart", JSON.stringify(arr));
}
// get loader element
const loader = document.getElementById("loader");

// fetch categories and products function
async function getCategoriesAndProducts(skip) {
  try {
    loader.classList.remove("d-none");
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch(`${baseUrl}/products/categories`),
      fetch(`${baseUrl}/products?limit=${productsPerPage}&skip=${skip}`),
    ]);

    const categories = await categoriesResponse.json();
    const products = await productsResponse.json();

    return { categories, products };
  } catch (error) {
    console.error("Ma'lumotlar olinmadi: ", error);
  } finally {
    loader.classList.add("d-none");
  }
}

const selectCategory = document.getElementById("category-select");
// render categories function
function renderCategories(categories) {
  selectCategory.innerHTML = "";

  // create default option
  const defaultOption = document.createElement("option");
  defaultOption.selected = true;
  defaultOption.id = "default-option";
  defaultOption.value = "";
  defaultOption.textContent = "Kategoriyani tanlang";
  selectCategory.appendChild(defaultOption);

  // create and append category options
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    option.style.textTransform = "capitalize";
    selectCategory.appendChild(option);
  });
  selectCategory.addEventListener("change", (evt) => {
    category = evt.target.value;
    console.log(category);
    render();
  });
}

// render products function
function renderProducts(products) {
  const productsWrapper = document.getElementById("products-wrappper");
  productsWrapper.innerHTML = "";

  if (products.length) {
    products.forEach((product) => {
      let index = cart.findIndex((item) => item.id === product.id);

      // create col for gid
      const col = document.createElement("div");
      col.classList.add("col-3");

      // create card
      const card = document.createElement("div");
      card.classList.add("card", "text-center");

      // create product image
      const img = document.createElement("img");
      img.classList.add("card-img-top");
      img.src = product.images[0];
      img.alt = product.title;
      img.height = 200;

      // create card body element
      const cardBody = document.createElement("div");
      cardBody.classList.add("card-body");

      // create product title
      const title = document.createElement("h5");
      title.classList.add("card-title", "text-cut");
      title.textContent = product.title;

      // create product description
      const description = document.createElement("p");
      description.classList.add("card-text", "text-cut");
      description.textContent = product.description.slice(20);

      // create product price

      const price = document.createElement("h6");
      price.classList.add("card-text");
      price.textContent = product.price + " $";

      // create button group
      const buttonGroup = document.createElement("div");
      buttonGroup.classList.add("d-flex", "align-items-center");
      const quantityGroup = document.createElement("div");
      quantityGroup.classList.add("btn-group", 'btn-group-product');
      quantityGroup.setAttribute('data-id', product.id);
      if (index === -1) {
        quantityGroup.classList.add("d-none");
      }
      quantityGroup.setAttribute("role", "group");
      quantityGroup.setAttribute("aria-label", "Basic example");

      const quantityDisplay = document.createElement("button");
      quantityDisplay.setAttribute("type", "button");
      quantityDisplay.setAttribute("data-id", product.id);
      quantityDisplay.classList.add("btn", "btn-primary", "product-count");
      if(index !== -1){
        quantityDisplay.textContent = cart[index].count;
      }
      quantityDisplay.disabled = true;

      const primaryButton = document.createElement("button");
      primaryButton.setAttribute('data-id', product.id);
      primaryButton.classList.add("btn", "btn-primary", 'primary-btn-product');
      primaryButton.type = "button";
      primaryButton.textContent = "Add to Cart";
      if (index !== -1) {
        primaryButton.classList.add("d-none");
      }
      primaryButton.addEventListener("click", () => {
        primaryButton.classList.add("d-none");
        quantityGroup.classList.remove("d-none");
        quantityDisplay.textContent = '1';
        cart.push({ ...product, count: 1 });
        renderCart(cart);
        addLocalStorage(cart);
      });


      const decreaseButton = document.createElement("button");
      decreaseButton.setAttribute("type", "button");
      decreaseButton.classList.add("btn", "btn-primary");
      decreaseButton.textContent = "-";
      decreaseButton.addEventListener("click", () => {
        let index = cart.findIndex((item) => item.id === product.id);
        if (cart[index].count > 1) {
          cart[index].count -= 1;
          quantityDisplay.textContent = cart[index].count;
          renderCart(cart);
          addLocalStorage(cart);
        }
      });

      const increaseButton = document.createElement("button");
      increaseButton.setAttribute("type", "button");
      increaseButton.classList.add("btn", "btn-primary");
      increaseButton.textContent = "+";
      increaseButton.addEventListener("click", () => {
        let index = cart.findIndex((item) => item.id === product.id);
        cart[index].count += 1;
        quantityDisplay.textContent = cart[index].count;
        renderCart(cart);
        addLocalStorage(cart);
      });

      // Append elements to construct the card
      quantityGroup.appendChild(decreaseButton);
      quantityGroup.appendChild(quantityDisplay);
      quantityGroup.appendChild(increaseButton);

      buttonGroup.appendChild(primaryButton);
      buttonGroup.appendChild(quantityGroup);

      cardBody.appendChild(title);
      cardBody.appendChild(price);
      cardBody.appendChild(description);
      cardBody.appendChild(buttonGroup);

      card.appendChild(img);
      card.appendChild(cardBody);

      col.appendChild(card);
      productsWrapper.appendChild(col);
    });
  } else {
    productsWrapper.innerHTML = "<h4>Mahsulotlar yo'q  </h4>";
  }
}

// render pagination function
function renderPagination(pages) {
  const paginationEl = document.getElementById("pagination");
  paginationEl.innerHTML = "";

  const totalPages = Math.ceil(pages / productsPerPage);

  const prevLi = document.createElement("li");
  prevLi.classList.add("page-item");
  if (currentPage === 1) {
    prevLi.classList.add("disabled");
  }

  const prevLink = document.createElement("a");
  prevLink.classList.add("page-link");
  prevLink.href = "#";
  prevLink.textContent = "Prev";
  prevLink.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  });
  prevLi.appendChild(prevLink);

  paginationEl.appendChild(prevLi);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    const pageLink = document.createElement("a");
    pageLink.classList.add("page-link");
    if (i === currentPage) {
      pageLink.classList.add("active");
    }
    pageLink.textContent = i;
    pageLink.href = "#";
    pageLink.addEventListener("click", () => {
      currentPage = i;
      render();
    });

    li.appendChild(pageLink);
    paginationEl.appendChild(li);
  }
  const nextLi = document.createElement("li");
  nextLi.classList.add("page-item");
  if (currentPage === totalPages) {
    nextLi.classList.add("disabled");
  }
  const nextLink = document.createElement("a");
  nextLink.classList.add("page-link");
  nextLink.href = "#";
  nextLink.textContent = "Next";
  nextLink.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  });
  nextLi.appendChild(nextLink);

  paginationEl.appendChild(nextLi);
}

// create cart item function
function createCartItem(cartItem) {
  const cartProduct = document.createElement("div");
  cartProduct.classList.add("cart-product", "border-bottom");

  const row = document.createElement("div");
  row.classList.add("row", "align-items-center");

  const col1 = document.createElement("div");
  col1.classList.add("col-4");

  const image = document.createElement("img");
  image.classList.add("w-100");
  image.src = cartItem.images[0];
  image.alt = cartItem.title;

  col1.appendChild(image);

  const col2 = document.createElement("div");
  col2.classList.add("col-4");

  const productInfo = document.createElement("div");
  const productName = document.createElement("p");
  productName.textContent = cartItem.title;

  const productPrice = document.createElement("p");
  productPrice.textContent = `Narxi: $${cartItem.price}`;

  productInfo.appendChild(productName);
  productInfo.appendChild(productPrice);

  col2.appendChild(productInfo);

  const col3 = document.createElement("div");
  col3.classList.add("col-4");

  const buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group");
  buttonGroup.setAttribute("role", "group");
  buttonGroup.setAttribute("aria-label", "Basic example");

  const quantityDisplay = document.createElement("button");
  quantityDisplay.setAttribute("type", "button");
  quantityDisplay.classList.add("btn", "btn-primary", "disabled");
  quantityDisplay.textContent = cartItem.count;

  const decreaseButton = document.createElement("button");
  decreaseButton.setAttribute("type", "button");
  decreaseButton.classList.add("btn", "btn-primary");
  decreaseButton.textContent = "-";
  decreaseButton.addEventListener("click", () => {
    if (cartItem.count > 1) {
      cartItem.count--;
      quantityDisplay.textContent = cartItem.count;
      const el = [...document.querySelectorAll(".product-count")].find(
        (item) => parseInt(item.getAttribute("data-id")) === cartItem.id
      );
      el.textContent = cartItem.count;
      renderCartCount(cart);
      addLocalStorage(cart);
    }
  });

  const increaseButton = document.createElement("button");
  increaseButton.setAttribute("type", "button");
  increaseButton.classList.add("btn", "btn-primary");
  increaseButton.textContent = "+";
  increaseButton.addEventListener("click", () => {
    cartItem.count++;
    quantityDisplay.textContent = cartItem.count;
    const el = [...document.querySelectorAll(".product-count")].find(
      (item) => parseInt(item.getAttribute("data-id")) === cartItem.id
    );
    el.textContent = cartItem.count;
    renderCartCount(cart);
    addLocalStorage(cart);
  });

  buttonGroup.appendChild(decreaseButton);
  buttonGroup.appendChild(quantityDisplay);
  buttonGroup.appendChild(increaseButton);

  const removeButton = document.createElement("button");
  removeButton.classList.add("btn", "btn-danger", "ms-3");
  const trashIcon = document.createElement("i");
  trashIcon.classList.add("bi", "bi-trash-fill");
  removeButton.appendChild(trashIcon);
  removeButton.addEventListener('click', () => {
    cart = cart.filter(item => item.id !== cartItem.id);
    renderCart(cart);
    addLocalStorage(cart);
    const primaryBtn = [...document.querySelectorAll(".primary-btn-product")].find(
      (item) => parseInt(item.getAttribute("data-id")) === cartItem.id
    );
    const btnGroup = [...document.querySelectorAll(".btn-group-product")].find(
      (item) => parseInt(item.getAttribute("data-id")) === cartItem.id
    );
    btnGroup.classList.add('d-none');
    primaryBtn.classList.remove('d-none');
  })

  col3.appendChild(buttonGroup);
  col3.appendChild(removeButton);

  row.appendChild(col1);
  row.appendChild(col2);
  row.appendChild(col3);

  cartProduct.appendChild(row);

  return cartProduct;
}

// render Cart function
function renderCart(items) {
  const cartWrapper = document.getElementById("cart-wrapper");
  cartWrapper.innerHTML = "";
  items.forEach((cartProduct) => {
    cartWrapper.appendChild(createCartItem(cartProduct));
  });
  renderCartCount(items);
}

// render cart counts
function renderCartCount(items) {
  document.getElementById("cart-count").innerText = items.reduce(
    (count, obj) => {
      return count + obj.count;
    },
    0
  );
}

async function render() {
  const { products, categories } = await getCategoriesAndProducts(
    (currentPage - 1) * 20
  );
  console.log(products, categories);
  let arr = [];
  if (category) {
    arr = products.products.filter((item) => category === item.category);
  } else {
    arr = [...products.products];
  }
  renderCategories(categories);
  renderProducts(arr);
  renderPagination(products.total);
  renderCart(cart);
}

render();
