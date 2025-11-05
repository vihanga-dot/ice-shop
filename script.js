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
    if (
      window.location.protocol === "file:" ||
      error.message.includes("Failed to fetch")
    ) {
      console.warn(
        "Running in local file environment - products will be loaded when served through a web server."
      );
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

  // --- 5. Authentication Status Check ---
  // Check authentication status and update UI
  checkAuthStatus();

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
  // Check if user is authenticated before allowing to place an order
  isUserSignedIn().then(isSignedIn => {
    if (!isSignedIn) {
      // Redirect to login if not authenticated
      alert("Please log in to place an order.");
      window.location.href = "login.html";
      return;
    }
    
    // If user is signed in, proceed with order form initialization
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

    // Get current user's email to prefill form if available
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email) {
      document.getElementById("email").value = currentUser.email;
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
  });
}

/*
========================================
    Order Management Functions
========================================
*/

// Function to save order to Firebase Firestore
async function saveOrder(order) {
  try {
    // Add the order to Firestore
    const docRef = await db.collection('orders').add({
      ...order,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log("Order saved successfully to Firestore with ID: ", docRef.id);
    return true;
  } catch (error) {
    console.error("Error saving order to Firestore:", error);
    return false;
  }
}

// Function to retrieve all orders from Firebase Firestore
async function getAllOrders() {
  try {
    const snapshot = await db.collection('orders')
      .orderBy('createdAt', 'desc') // Order by creation time, newest first
      .get();
    
    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Add the document ID to the order object
      orders.push({
        id: doc.id,
        ...data
      });
    });
    
    return orders;
  } catch (error) {
    console.error("Error fetching orders from Firestore:", error);
    return [];
  }
}

// Function to get order by ID from Firebase Firestore
async function getOrderById(orderId) {
  try {
    const doc = await db.collection('orders').doc(orderId).get();
    
    if (doc.exists) {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    } else {
      console.error("Order not found in Firestore");
      return null;
    }
  } catch (error) {
    console.error("Error fetching order from Firestore:", error);
    return null;
  }
}

// Function to update an existing order in Firebase Firestore
async function updateOrder(updatedOrder) {
  try {
    // Remove the id field since we're using it as the document ID
    const { id, ...orderData } = updatedOrder;
    
    await db.collection('orders').doc(id).update(orderData);
    
    console.log("Order updated successfully in Firestore");
    return true;
  } catch (error) {
    console.error("Error updating order in Firestore:", error);
    return false;
  }
}

// Function to update order status in Firebase Firestore
async function updateOrderStatus(orderId, newStatus) {
  try {
    await db.collection('orders').doc(orderId).update({
      status: newStatus
    });
    
    // Reload the order list to reflect the change
    if (typeof loadAndDisplayOrders === "function") {
      loadAndDisplayOrders();
    }
    
    // Show confirmation
    alert(`Order #${orderId} status updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating order status in Firestore:", error);
    alert(`Error updating order status: ${error.message}`);
  }
}

/*
========================================
    Firebase Authentication Functions
========================================
*/

// Firebase configuration - You need to add your own Firebase config from your Firebase project
const firebaseConfig = {
  apiKey: "AIzaSyCoUQgoOlDtHCzpoGWVcf3oDTcB4xBx5lU",
  authDomain: "scoop-shop-8f279.firebaseapp.com",
  projectId: "scoop-shop-8f279",
  storageBucket: "scoop-shop-8f279.firebasestorage.app",
  messagingSenderId: "778069988687",
  appId: "1:778069988687:web:9d8f3ef566bbc0c77b613a",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Function to sign up with email and password
function signUp(email, password) {
  return auth
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed up successfully
      const user = userCredential.user;
      console.log("User registered:", user);
      return { success: true, user: user };
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Sign up error:", errorCode, errorMessage);
      return { success: false, error: errorMessage };
    });
}

// Function to sign in with email and password
function signIn(email, password) {
  return auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in successfully
      const user = userCredential.user;
      console.log("User signed in:", user);
      return { success: true, user: user };
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Sign in error:", errorCode, errorMessage);
      return { success: false, error: errorMessage };
    });
}

// Function to sign in with Google
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth
    .signInWithPopup(provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = result.credential;
      const token = credential.accessToken;
      const user = result.user;

      console.log("User signed in with Google:", user);
      return { success: true, user: user };
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      const credential = error.credential;

      console.error("Google sign in error:", errorCode, errorMessage);
      return { success: false, error: errorMessage };
    });
}

// Function to sign out
function signOut() {
  return auth
    .signOut()
    .then(() => {
      console.log("User signed out");
      return { success: true };
    })
    .catch((error) => {
      console.error("Sign out error:", error);
      return { success: false, error: error.message };
    });
}

// Function to check if user is signed in
function isUserSignedIn() {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
}

// Function to get current user
function getCurrentUser() {
  return auth.currentUser;
}

// Export functionality no longer needed as orders are stored in Firestore
function exportOrders() {
  alert("Orders are now stored in Firebase. No need to export.");
}

// File loading functionality no longer needed as orders are stored in Firestore
function handleFileSelect(evt) {
  alert(
    "Orders are now stored in Firebase. File loading is no longer needed."
  );
}

// Function to check authentication status and update UI
function checkAuthStatus() {
  // Wait for Firebase to initialize, then check auth status
  isUserSignedIn().then(isSignedIn => {
    updateAuthUI(isSignedIn);
    
    // Set up auth state listener to handle changes in authentication status
    auth.onAuthStateChanged(user => {
      updateAuthUI(!!user);
    });
  });
}

// Function to update the authentication UI elements
function updateAuthUI(isSignedIn) {
  // Find the login link in the navigation menu (the one with href="login.html")
  const navLoginLink = document.querySelector('a[href="login.html"]');
  
  if (navLoginLink) {
    if (isSignedIn) {
      // User is signed in - change login link to logout functionality
      navLoginLink.textContent = 'Logout';
      navLoginLink.href = '#';
      // Remove any previous event listener and add the logout functionality
      navLoginLink.onclick = function(e) {
        e.preventDefault();
        signOut().then(() => {
          console.log('Successfully signed out');
          // The UI will be updated automatically by the auth state listener
        }).catch((error) => {
          console.error('Error signing out:', error);
        });
      };
    } else {
      // User is not signed in - ensure it's a login link
      navLoginLink.textContent = 'Login';
      navLoginLink.href = 'login.html';
      navLoginLink.onclick = null;
    }
  }
}

// Function to check authentication status and update UI
function checkAuthStatus() {
  isUserSignedIn().then(isSignedIn => {
    updateAuthUI(isSignedIn);
    
    // Set up auth state listener to handle changes in authentication status
    auth.onAuthStateChanged(user => {
      updateAuthUI(!!user);
    });
  });
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
  
  // Check authentication status and update UI
  checkAuthStatus();
});
