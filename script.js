/*
========================================
    Global Variables
========================================
*/
let allProducts = []; // Will be populated by loadProducts()

/*
========================================
    Fetch Products Function
========================================
*/
async function loadProducts() {
  try {
    const response = await fetch("products.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    allProducts = await response.json();
    console.log("Products loaded successfully:", allProducts); // Debugging line
  } catch (error) {
    console.error("Could not fetch products:", error);
    
    // For local file access (file:// protocol) or CORS errors, just initialize with an empty array
    // since fetch won't work with local files due to security restrictions
    if (window.location.protocol === 'file:' || error.message.includes('Failed to fetch')) {
      console.warn("Running in local file environment - products will be loaded when served through a web server.");
      allProducts = []; // Initialize with empty array so the application doesn't break
    } else {
      // For other types of errors (network, server, etc.)
      const productGrid = document.getElementById("product-grid");
      if (productGrid) {
        productGrid.innerHTML =
          '<p style="color: var(--primary-color);">Could not load flavors. Please run this page through a web server.</p>';
      }
      allProducts = []; // Initialize with empty array to prevent other errors
    }
  }
}

/*
========================================
    Global Listeners & Functions
    (Run on all pages)
========================================
*/
document.addEventListener("DOMContentLoaded", async () => {
  // --- 0. Load Products First ---
  // We wait for the products to load before running any page-specific logic
  await loadProducts();

  // --- 1. Responsive Navigation ---
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close menu when a link is clicked
    document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  // --- 2. Dark Mode Toggle ---
  const themeToggle = document.querySelector(".theme-toggle");
  const body = document.body;

  // Check for saved preference
  if (localStorage.getItem("theme") === "light") {
    body.classList.add("light-mode");
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    body.classList.remove("light-mode");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }

  themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    if (body.classList.contains("light-mode")) {
      localStorage.setItem("theme", "light");
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      localStorage.setItem("theme", "dark");
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
  });

  // --- 3. Active Page Link highlighting ---
  const currentPage = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll(".nav-menu a");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").split("/").pop();
    if (
      linkPage === currentPage ||
      (currentPage === "" && linkPage === "index.html")
    ) {
      link.classList.add("active");
    }
  });

  // --- 4. AOS-style Scroll Animations ---
  const animatedElements = document.querySelectorAll(".fade-in");

  // Define observer in a variable so it can be used later for dynamically added elements
  window.scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          window.scrollObserver.unobserve(entry.target); // Stop observing once visible
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of the element is visible
    }
  );

  animatedElements.forEach((el) => window.scrollObserver.observe(el));

  /*
    ========================================
        Page-Specific Logic
    ========================================
    */
  // This logic now runs AFTER products are loaded
  console.log("Products loaded, running page-specific logic");
  console.log("Current page ID:", document.body.id); // Debugging line

  // --- Home Page ---
  if (document.body.id === "home-page") {
    console.log("Initializing home page"); // Debugging line
    initTestimonialSlider();
  }

  // --- Products Page ---
  if (document.body.id === "products-page") {
    console.log("Initializing products page"); // Debugging line
    initProductsPage();
  }

  // --- Product Details Page ---
  if (document.body.id === "product-detail-page") {
    console.log("Initializing product detail page"); // Debugging line
    initProductDetailPage();
  }

  // --- Order Page ---
  if (document.body.id === "order-page") {
    console.log("Initializing order page"); // Debugging line
    initOrderPage();
  }

  // --- Admin Orders Page ---
  if (document.body.id === "admin-orders-page") {
    console.log("Initializing admin orders page"); // Debugging line
    initAdminOrdersPage();
  }
}); // End of DOMContentLoaded

/*
========================================
    Home Page Functions
========================================
*/
function initTestimonialSlider() {
  const slider = document.querySelector(".testimonial-slider");
  const slides = document.querySelectorAll(".testimonial");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  
  // Check if all required elements exist before initializing
  if (!slider || !slides.length || !prevBtn || !nextBtn) {
    console.log("Testimonial elements not found, skipping initialization");
    return;
  }
  
  let currentIndex = 0;

  function showSlide(index) {
    if (index >= slides.length) {
      currentIndex = 0;
    } else if (index < 0) {
      currentIndex = slides.length - 1;
    } else {
      currentIndex = index;
    }
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  nextBtn.addEventListener("click", () => showSlide(currentIndex + 1));
  prevBtn.addEventListener("click", () => showSlide(currentIndex - 1));
}

/*
========================================
    Products Page Functions
========================================
*/
function initProductsPage() {
  const grid = document.getElementById("product-grid");
  const searchBar = document.getElementById("search-bar");

  // 1. Render all products (which are now loaded)
  renderProducts(allProducts, grid);

  // 2. Add search functionality
  searchBar.addEventListener("keyup", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredProducts = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
    );
    renderProducts(filteredProducts, grid);
  });
}

function renderProducts(products, gridElement) {
  console.log("Rendering products:", products); // Debugging line
  gridElement.innerHTML = ""; // Clear existing grid

  if (products.length === 0) {
    console.log("No products to render"); // Debugging line
    gridElement.innerHTML = "<p>No flavors found!</p>";
    return;
  }

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card fade-in";
    card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p>$${product.price.toFixed(2)}</p>
                <a href="#" class="btn order-btn" data-id="${
                  product.id
                }">View Details</a>
            </div>
        `;
    gridElement.appendChild(card);
  });

  // Add event listeners to new buttons
  gridElement.querySelectorAll(".order-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = e.target.getAttribute("data-id");
      // Store the ID and redirect
      localStorage.setItem("selectedProductId", id);
      window.location.href = "product-detail.html";
    });
  });

  // Observe all newly added fade-in elements with the global observer
  gridElement.querySelectorAll(".fade-in").forEach((el) => {
    if (!el.classList.contains("visible")) {
      window.scrollObserver.observe(el);
    }
  });

  console.log("Products rendered successfully"); // Debugging line
}

/*
========================================
    Product Detail Page Functions
========================================
*/
function initProductDetailPage() {
  const productId = localStorage.getItem("selectedProductId");
  if (!productId) {
    window.location.href = "products.html";
    return;
  }

  // allProducts is already loaded by the time this runs
  const product = allProducts.find((p) => p.id == productId);

  if (!product) {
    alert("Product not found.");
    window.location.href = "products.html";
    return;
  }

  // Populate page
  document.getElementById("product-image").src = product.image;
  document.getElementById("product-name").textContent = product.name;
  document.getElementById(
    "product-price"
  ).textContent = `$${product.price.toFixed(2)}`;
  document.getElementById("product-description").textContent =
    product.description;
  document.getElementById(
    "product-ingredients"
  ).textContent = `Ingredients: ${product.ingredients}`;

  // Quantity selector logic
  const qtyInput = document.getElementById("quantity");
  const qtyMinus = document.getElementById("qty-minus");
  const qtyPlus = document.getElementById("qty-plus");

  qtyMinus.addEventListener("click", () => {
    let currentQty = parseInt(qtyInput.value);
    if (currentQty > 1) {
      qtyInput.value = currentQty - 1;
    }
  });

  qtyPlus.addEventListener("click", () => {
    let currentQty = parseInt(qtyInput.value);
    qtyInput.value = currentQty + 1;
  });

  // "Proceed to Order" button
  document.getElementById("proceed-to-order").addEventListener("click", () => {
    const selectedQuantity = parseInt(qtyInput.value);

    const orderItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: selectedQuantity,
      image: product.image,
    };

    localStorage.setItem("cartItem", JSON.stringify(orderItem));
    window.location.href = "order.html";
  });
}

/*
========================================
    Order Page Functions
========================================
*/
function initOrderPage() {
  const orderItemData = localStorage.getItem("cartItem");
  const summaryContainer = document.getElementById("order-summary-items");
  const totalElement = document.getElementById("order-total");

  if (orderItemData) {
    const item = JSON.parse(orderItemData);

    summaryContainer.innerHTML = `
            <div class="summary-item" style="display: flex; justify-content: space-between; align-items: center;">
                <img src="${item.image}" alt="${
      item.name
    }" width="50" style="border-radius: 5px; margin-right: 10px;">
                <span style="flex-grow: 1;">${item.name} (x${
      item.quantity
    })</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;

    totalElement.textContent = `$${(item.price * item.quantity).toFixed(2)}`;
  } else {
    summaryContainer.innerHTML = "<p>Your cart is empty.</p>";
    totalElement.textContent = "$0.00";
  }

  // Form submission & modal
  const orderForm = document.getElementById("order-form");
  const modalOverlay = document.getElementById("confirmation-modal");
  const closeModalBtn = document.getElementById("close-modal");

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;
    const deliveryType = document.querySelector(
      'input[name="deliveryType"]:checked'
    ).value;

    if (name && email && phone) {
      // Get cart item from localStorage
      const orderItemData = localStorage.getItem("cartItem");

      if (orderItemData) {
        const item = JSON.parse(orderItemData);

        // Create order object - remove image from saved data
        const order = {
          id: Date.now(), // Generate unique ID
          customerId: email, // Use email as customer identifier
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          customerAddress: address,
          deliveryType: deliveryType,
          items: [
            {
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              // Removed image property to keep the order data clean
            },
          ],
          total: item.price * item.quantity,
          orderDate: new Date().toISOString(),
          status: "pending",
        };

        // Save order to Google Sheets
        saveOrder(order).then(success => {
          if (success) {
            modalOverlay.classList.add("visible");
            localStorage.removeItem("cartItem");
          } else {
            alert("There was an error saving your order. Please try again.");
          }
        }).catch(error => {
          console.error('Error saving order:', error);
          alert("There was an error saving your order. Please try again.");
        });
      } else {
        alert("No items in cart. Please select an item first.");
      }
    } else {
      let missingFields = [];
      if (!name) missingFields.push("Name");
      if (!email) missingFields.push("Email");
      if (!phone) missingFields.push("Phone");

      alert(
        "Please fill in the following required fields: " +
          missingFields.join(", ") +
          "."
      );
    }
  });

  closeModalBtn.addEventListener("click", () => {
    modalOverlay.classList.remove("visible");
    window.location.href = "index.html";
  });
}

/*
========================================
    Order Management Functions
========================================
*/
// Google Sheets Configuration
const GOOGLE_SHEETS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxhE_X9PL6ZehTLBni3WxLjhNbFJF_sL4ZfyCKyzV1bA5NcWYF-SnyW4wo6NLXqK1vfyw/exec'; // Replace with actual URL

// Function to save order to Google Sheets
async function saveOrder(order) {
  try {
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'saveOrder',
        order: order
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('Order saved successfully to Google Sheets');
      return true;
    } else {
      console.error('Error saving order:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error saving order to Google Sheets:', error);
    return false;
  }
}

// Function to retrieve all orders from Google Sheets
async function getAllOrders() {
  try {
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getAllOrders'
      })
    });
    
    const result = await response.json();
    if (result.success) {
      return result.orders || [];
    } else {
      console.error('Error fetching orders:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error fetching orders from Google Sheets:', error);
    return [];
  }
}

// Function to get order by ID from Google Sheets
async function getOrderById(orderId) {
  try {
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'getOrderById',
        orderId: orderId
      })
    });
    
    const result = await response.json();
    if (result.success) {
      return result.order;
    } else {
      console.error('Error fetching order:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching order from Google Sheets:', error);
    return null;
  }
}

// Function to update an existing order in Google Sheets
async function updateOrder(updatedOrder) {
  try {
    const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'updateOrder',
        order: updatedOrder
      })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('Order updated successfully in Google Sheets');
      return true;
    } else {
      console.error('Error updating order:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Error updating order in Google Sheets:', error);
    return false;
  }
}

// Function to update order status in Google Sheets
async function updateOrderStatus(orderId, newStatus) {
  try {
    const order = await getOrderById(orderId);
    
    if (order) {
      order.status = newStatus;
      
      const response = await fetch(GOOGLE_SHEETS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateOrder',
          order: order
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Reload the order list to reflect the change
        if (typeof loadAndDisplayOrders === 'function') {
          loadAndDisplayOrders();
        }
        
        // Show confirmation
        alert(`Order #${orderId} status updated to ${newStatus}`);
      } else {
        alert(`Error updating order: ${result.error}`);
      }
    } else {
      alert(`Order #${orderId} not found`);
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    alert(`Error updating order status: ${error.message}`);
  }
}

/*
========================================
    Admin Orders Page Functions
========================================
*/
function initAdminOrdersPage() {
  // Check if user is already authenticated
  if (localStorage.getItem("adminAuthenticated") === "true") {
    showOrdersDashboard();
  } else {
    showPasswordPrompt();
  }
}

function showPasswordPrompt() {
  document.getElementById("password-protected-section").style.display = "none";
  document.getElementById("password-section").style.display = "block";

  document
    .getElementById("submit-password")
    .addEventListener("click", checkPassword);
  document
    .getElementById("admin-password")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        checkPassword();
      }
    });
}

function checkPassword() {
  const passwordInput = document.getElementById("admin-password").value;
  // For this implementation, using a simple hardcoded password
  // In a real application, you would have more secure authentication
  const correctPassword = "scoopadmin123"; // Set a default password

  if (passwordInput === correctPassword) {
    localStorage.setItem("adminAuthenticated", "true");
    showOrdersDashboard();
  } else {
    alert("Incorrect password. Please try again.");
    document.getElementById("admin-password").value = "";
    document.getElementById("admin-password").focus();
  }
}

async function showOrdersDashboard() {
  document.getElementById("password-section").style.display = "none";
  document.getElementById("password-protected-section").style.display = "block";
  document.getElementById("logout-btn").style.display = "inline-block";

  // Load and display orders
  await loadAndDisplayOrders();

  // Set up export button
  document
    .getElementById("export-orders-btn")
    .addEventListener("click", exportOrders);

  // Set up load button
  document.getElementById("load-orders-btn").addEventListener("click", () => {
    document.getElementById("file-input").click();
  });

  // Set up file input change event
  document
    .getElementById("file-input")
    .addEventListener("change", handleFileSelect);

  // Set up logout button
  document.getElementById("logout-btn").addEventListener("click", logout);
}

function logout() {
  localStorage.removeItem("adminAuthenticated");
  document.getElementById("password-protected-section").style.display = "none";
  document.getElementById("logout-btn").style.display = "none";
  showPasswordPrompt();
}

async function loadAndDisplayOrders() {
  const orders = await getAllOrders();
  const ordersList = document.getElementById("orders-list");

  if (orders.length === 0) {
    ordersList.innerHTML = "<p>No orders found.</p>";
    return;
  }

  // Sort orders by date (newest first)
  orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  ordersList.innerHTML = "";

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "order-card";
    
    // Create status update button only if status is 'pending'
    let statusButton = '';
    if (order.status === 'pending') {
      statusButton = `<button class="update-status-btn" data-order-id="${order.id}">Mark as Complete</button>`;
    } else {
      statusButton = `<span class="order-status-completed">Completed</span>`;
    }
    
    orderCard.innerHTML = `
            <div class="order-header">
                <h3>Order #${order.id}</h3>
                <div class="order-status">${order.status}</div>
            </div>
            <div class="order-details">
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Phone:</strong> ${order.customerPhone}</p>
                <p><strong>Delivery Type:</strong> ${order.deliveryType}</p>
                <p><strong>Address:</strong> ${
                  order.customerAddress || "N/A"
                }</p>
                <p><strong>Order Date:</strong> ${new Date(
                  order.orderDate
                ).toLocaleString()}</p>
                <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            </div>
            <div class="order-items">
                <h4>Items:</h4>
                ${order.items
                  .map(
                    (item) => `
                    <div class="order-item">
                        <div>
                            <p><strong>${item.name}</strong></p>
                            <p>Quantity: ${
                              item.quantity
                            } | Price: $${item.price.toFixed(2)} each</p>
                        </div>
                    </div>
                `
                  )
                  .join("")}
            </div>
            <div class="order-actions">
                ${statusButton}
            </div>
        `;
        
    ordersList.appendChild(orderCard);
  });
  
  // Add event listeners to the update status buttons
  document.querySelectorAll('.update-status-btn').forEach(button => {
    button.addEventListener('click', function() {
      const orderId = parseInt(this.getAttribute('data-order-id'));
      updateOrderStatus(orderId, 'completed');
    });
  });
}

// Export functionality no longer needed as orders are stored in Google Sheets
function exportOrders() {
  alert("Orders are now stored in Google Sheets. No need to export.");
}

// File loading functionality no longer needed as orders are stored in Google Sheets
function handleFileSelect(evt) {
  alert("Orders are now stored in Google Sheets. File loading is no longer needed.");
}

// Slide-in animation trigger on page load
document.addEventListener("DOMContentLoaded", () => {
  const iceCreamImage = document.getElementById("iceCreamImage");
  // Only run animation if the ice cream image element exists (on home page)
  if (iceCreamImage) {
    // Add a slight delay to ensure the page is fully loaded before starting the animation
    setTimeout(() => {
      iceCreamImage.classList.add("slide-in");
    }, 300);
  }
});
