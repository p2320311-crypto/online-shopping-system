// Global State Management
let appState = {
    currentUser: null,
    products: [],
    filteredProducts: [],
    currentPage: 1,
    itemsPerPage: 12,
    cart: [],
    orders: [],
    currentProductDetail: null,
    isSearching: false
};

// Gallery state
let galleryState = {
    currentImageIndex: 0,
    productImages: [],
    currentProductForGallery: null
};

// DOM Element References
const elements = {
    productList: document.getElementById('product-list'),
    cartCount: document.getElementById('cart-count'),
    cartTotal: document.getElementById('cart-total'),
    cartSidebar: document.getElementById('cart-sidebar'),
    closeCartBtn: document.getElementById('close-cart'),
    cartLink: document.getElementById('cart-link'),
    productSection: document.getElementById('product-section'),
    ordersSection: document.getElementById('orders-section'),
    ordersLink: document.getElementById('orders-link'),
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    prevPageBtn: document.getElementById('prev-page'),
    nextPageBtn: document.getElementById('next-page'),
    pageInfo: document.getElementById('page-info'),
    checkoutBtn: document.getElementById('checkout-btn'),
    productDetailModal: document.getElementById('product-detail-modal')
};

// 修复1: 确保showLoginModal函数存在
function showLoginModal() {
    console.log('showLoginModal called');
    // 简化版本，实际应该调用auth.js中的函数
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
        modalContainer.innerHTML = `
            <div class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Login</h3>
                        <button class="close-btn close-modal-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body">
                        <form id="simple-login-form">
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="simple-email" required>
                            </div>
                            <div class="form-group">
                                <label>Password</label>
                                <input type="password" id="simple-password" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Login</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // 添加关闭事件
        modalContainer.querySelector('.close-modal-btn').addEventListener('click', () => {
            modalContainer.innerHTML = '';
        });
        
        // 简单登录逻辑
        modalContainer.querySelector('#simple-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('simple-email').value;
            const password = document.getElementById('simple-password').value;
            
            if (email && password) {
                // 模拟用户
                appState.currentUser = {
                    id: 1,
                    name: email.split('@')[0],
                    email: email,
                    address: 'Test Address'
                };
                localStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
                updateUserDisplay();
                modalContainer.innerHTML = '';
                alert('Login successful!');
            }
        });
    }
}

// 修复2: 更新用户显示
function updateUserDisplay() {
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const userInfo = document.getElementById('user-info');
    const usernameSpan = document.getElementById('username');
    
    if (appState.currentUser) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (usernameSpan) usernameSpan.textContent = appState.currentUser.name;
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

// Initialize Application
function initApp() {
    console.log('Initializing app...');
    
    // Load state from localStorage
    loadStateFromStorage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load product data
    loadProducts();
    
    // Update UI
    updateUI();
    
    console.log('App initialization complete');
}

// Load state from localStorage
function loadStateFromStorage() {
    const savedUser = localStorage.getItem('currentUser');
    const savedCart = localStorage.getItem('cart');
    const savedOrders = localStorage.getItem('orders');
    const savedProducts = localStorage.getItem('products');
    
    if (savedUser) appState.currentUser = JSON.parse(savedUser);
    if (savedCart) appState.cart = JSON.parse(savedCart);
    if (savedOrders) appState.orders = JSON.parse(savedOrders);
    if (savedProducts) {
        appState.products = JSON.parse(savedProducts);
        appState.filteredProducts = [...appState.products];
    }
}

// Save state to localStorage
function saveStateToStorage() {
    localStorage.setItem('currentUser', JSON.stringify(appState.currentUser));
    localStorage.setItem('cart', JSON.stringify(appState.cart));
    localStorage.setItem('orders', JSON.stringify(appState.orders));
    localStorage.setItem('products', JSON.stringify(appState.products));
}

// Setup event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Shopping cart related
    if (elements.cartLink) {
        elements.cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar();
        });
    }
    
    if (elements.closeCartBtn) {
        elements.closeCartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleCartSidebar();
        });
    }
    
    // Orders related
    if (elements.ordersLink) {
        elements.ordersLink.addEventListener('click', (e) => {
            e.preventDefault();
            showOrders(e);
        });
    }
    
    // Pagination controls
    if (elements.prevPageBtn) {
        elements.prevPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(-1);
        });
    }
    
    if (elements.nextPageBtn) {
        elements.nextPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(1);
        });
    }
    
    // Search functionality
    if (elements.searchBtn) {
        elements.searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
    }
    
    if (elements.searchInput) {
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
    
    // Checkout functionality
    if (elements.checkoutBtn) {
        elements.checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            checkout();
        });
    }
    
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }
    
    // Close cart sidebar when clicking outside
    document.addEventListener('click', (e) => {
        if (elements.cartSidebar && 
            !elements.cartSidebar.contains(e.target) && 
            !elements.cartLink.contains(e.target) &&
            elements.cartSidebar.style.display === 'block') {
            toggleCartSidebar();
        }
        
        // Close product detail modal when clicking outside
        if (elements.productDetailModal && 
            e.target === elements.productDetailModal) {
            elements.productDetailModal.style.display = 'none';
        }
    });
}

// Toggle cart sidebar
function toggleCartSidebar(e) {
    if (e) e.preventDefault();
    
    if (!elements.cartSidebar) return;
    
    if (elements.cartSidebar.style.display === 'block') {
        elements.cartSidebar.style.display = 'none';
    } else {
        elements.cartSidebar.style.display = 'block';
        updateCartDisplay();
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = elements.cartTotal;
    
    if (!cartItemsContainer || !cartTotalElement) return;
    
    if (appState.cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotalElement.textContent = '$0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    appState.cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} × ${item.quantity}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn decrease-btn" data-id="${item.productId}">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.productId}">
                <button class="quantity-btn increase-btn" data-id="${item.productId}">+</button>
                <button class="remove-btn" data-id="${item.productId}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
        
        // Add event listeners
        cartItem.querySelector('.decrease-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            updateCartQuantity(item.productId, -1);
        });
        cartItem.querySelector('.increase-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            updateCartQuantity(item.productId, 1);
        });
        cartItem.querySelector('.quantity-input').addEventListener('change', (e) => {
            e.stopPropagation();
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity) && newQuantity > 0) {
                updateCartQuantity(item.productId, newQuantity - item.quantity);
            }
        });
        cartItem.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromCart(item.productId);
        });
    });
    
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

// Update cart quantity
function updateCartQuantity(productId, delta) {
    const item = appState.cart.find(item => item.productId === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 1) {
        removeFromCart(productId);
    } else {
        item.quantity = newQuantity;
        saveStateToStorage();
        updateCartDisplay();
        updateUI();
    }
}

// Remove from cart
function removeFromCart(productId) {
    appState.cart = appState.cart.filter(item => item.productId !== productId);
    saveStateToStorage();
    updateCartDisplay();
    updateUI();
    showNotification('Item removed from cart', 'info');
}

// Checkout
function checkout() {
    if (!appState.currentUser) {
        alert('Please login first!');
        showLoginModal();
        return;
    }
    
    if (appState.cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    // Create order
    const orderId = 'ORD' + Date.now();
    const orderTotal = appState.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const newOrder = {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        customerId: appState.currentUser.id,
        customerName: appState.currentUser.name,
        total: orderTotal,
        status: 'pending',
        items: appState.cart.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
        })),
        shippingAddress: appState.currentUser.address,
        createdAt: new Date().toISOString()
    };
    
    appState.orders.push(newOrder);
    appState.cart = [];
    
    saveStateToStorage();
    updateCartDisplay();
    updateUI();
    
    toggleCartSidebar();
    showNotification(`Order ${orderId} created successfully!`, 'success');
}

// 修复3: 简化产品数据，修复图片URL
function loadProducts() {
    // If no products in localStorage, load default products
    if (appState.products.length === 0) {
        appState.products = [
            {
                id: 1,
                sku: 'SMART-001',
                name: 'Smartphone X Pro',
                price: 2999.00,
                images: [
                    'https://via.placeholder.com/400x400/4a6cf7/ffffff?text=Smartphone+Front',
                    'https://via.placeholder.com/400x400/4a6cf7/ffffff?text=Smartphone+Back',
                    'https://via.placeholder.com/400x400/4a6cf7/ffffff?text=Smartphone+Side'
                ],
                thumbnail: 'https://via.placeholder.com/300x300/4a6cf7/ffffff?text=Smartphone',
                description: 'Latest smartphone with high-performance processor and excellent camera',
                detailedDescription: `
                    <h4>Advanced Features</h4>
                    <p>The Smartphone X Pro features cutting-edge technology for the ultimate mobile experience:</p>
                    <ul>
                        <li><strong>6.7-inch Super Retina XDR display</strong> with ProMotion technology</li>
                        <li><strong>A16 Bionic chip</strong> for unprecedented performance</li>
                        <li><strong>Pro camera system</strong> with 48MP main camera</li>
                        <li><strong>5G capable</strong> for ultra-fast downloads</li>
                        <li><strong>All-day battery life</strong> with fast charging</li>
                    </ul>
                `,
                category: 'Electronics',
                subcategory: 'Smartphones',
                brand: 'TechBrand',
                tags: ['smartphone', 'mobile', 'flagship', '5g', 'camera', 'premium'],
                specifications: {
                    color: ['Space Gray', 'Silver', 'Gold'],
                    storage: ['256GB', '512GB', '1TB'],
                    display: '6.7-inch OLED',
                    processor: 'A16 Bionic',
                    ram: '8GB',
                    battery: '4323mAh'
                },
                rating: 4.8,
                reviews: 1250,
                stock: 50,
                status: 'active',
                createdAt: '2024-01-15',
                isFeatured: true,
                discount: 0,
                weight: '0.5kg',
                dimensions: '160.8 x 78.1 x 7.85 mm',
                warranty: '1 year'
            },
            {
                id: 2,
                sku: 'LAP-002',
                name: 'UltraBook Pro Laptop',
                price: 5999.00,
                images: [
                    'https://via.placeholder.com/400x400/34c759/ffffff?text=Laptop+Front',
                    'https://via.placeholder.com/400x400/34c759/ffffff?text=Laptop+Open',
                    'https://via.placeholder.com/400x400/34c759/ffffff?text=Laptop+Side'
                ],
                thumbnail: 'https://via.placeholder.com/300x300/34c759/ffffff?text=Laptop',
                description: 'Professional laptop with 16-inch display and powerful performance',
                detailedDescription: `
                    <h4>Professional Performance</h4>
                    <p>The UltraBook Pro is designed for professionals who demand the best:</p>
                    <ul>
                        <li><strong>16-inch Liquid Retina XDR display</strong> with Extreme Dynamic Range</li>
                        <li><strong>M2 Pro chip</strong> with 12-core CPU and 19-core GPU</li>
                        <li><strong>Up to 96GB unified memory</strong> for demanding workflows</li>
                        <li><strong>Professional connectivity</strong> with Thunderbolt 4 ports</li>
                        <li><strong>All-day battery life</strong> for mobile productivity</li>
                    </ul>
                `,
                category: 'Electronics',
                subcategory: 'Laptops',
                brand: 'TechBrand',
                tags: ['laptop', 'professional', 'portable', 'performance', 'workstation'],
                specifications: {
                    color: ['Space Gray', 'Silver'],
                    storage: ['512GB', '1TB', '2TB'],
                    display: '16.2-inch Liquid Retina XDR',
                    processor: 'M2 Pro',
                    ram: '32GB',
                    graphics: '19-core GPU',
                    battery: '100Wh',
                    weight: '2.15kg'
                },
                rating: 4.9,
                reviews: 890,
                stock: 30,
                status: 'active',
                createdAt: '2024-01-14',
                isFeatured: true,
                discount: 10
            }
        ];
        
        appState.filteredProducts = appState.products.filter(product => product.status === 'active');
        saveStateToStorage();
    }
    
    renderProducts();
}

// Render product list
function renderProducts() {
    if (!elements.productList) return;
    
    elements.productList.innerHTML = '';
    
    // Filter only active products for customers
    let productsToShow = appState.filteredProducts.filter(product => product.status === 'active');
    
    const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
    const endIndex = startIndex + appState.itemsPerPage;
    const paginatedProducts = productsToShow.slice(startIndex, endIndex);
    
    if (paginatedProducts.length === 0) {
        elements.productList.innerHTML = '<p class="no-products">No products found</p>';
    } else {
        paginatedProducts.forEach(product => {
            const productCard = createProductCard(product);
            elements.productList.appendChild(productCard);
        });
    }
    
    updatePaginationInfo(productsToShow.length);
}

// 修复4: 简化产品卡片创建，确保点击事件工作
// Create product card with safe event handling
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    
    const hasMultipleImages = (product.images && product.images.length > 1) || product.video;
    const imageCount = product.images ? product.images.length : 1;
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.thumbnail || product.image || product.images?.[0] || 'https://via.placeholder.com/300x200/e0e0e0/969696?text=No+Image'}" 
                 alt="${product.name}" 
                 class="product-img">
            ${hasMultipleImages ? `
                <div class="image-count-badge">
                    <i class="fas fa-images"></i> ${imageCount}
                    ${product.video ? ' + Video' : ''}
                </div>
            ` : ''}
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description ? (product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description) : 'No description available'}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
                <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
                <button class="btn btn-outline view-detail-btn" data-id="${product.id}">
                    <i class="fas fa-info-circle"></i> Details
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners with proper event handling
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    const viewDetailBtn = card.querySelector('.view-detail-btn');
    
    if (addToCartBtn) {
        // Clone and replace to prevent duplicate event listeners
        const newAddToCartBtn = addToCartBtn.cloneNode(true);
        addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);
        
        newAddToCartBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            e.preventDefault(); // Prevent any default behavior
            const productId = parseInt(newAddToCartBtn.dataset.id);
            if (!isNaN(productId)) {
                addToCart(productId);
            }
        });
    }
    
    if (viewDetailBtn) {
        // Clone and replace to prevent duplicate event listeners
        const newViewDetailBtn = viewDetailBtn.cloneNode(true);
        viewDetailBtn.parentNode.replaceChild(newViewDetailBtn, viewDetailBtn);
        
        newViewDetailBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            e.preventDefault(); // Prevent any default behavior
            const productId = parseInt(newViewDetailBtn.dataset.id);
            if (!isNaN(productId)) {
                showProductDetail(productId);
            }
        });
    }
    
    // Click on card to show details - but not when clicking buttons
    card.addEventListener('click', (e) => {
        // Only trigger if the click wasn't on a button
        if (!e.target.closest('.add-to-cart-btn') && 
            !e.target.closest('.view-detail-btn') &&
            !e.target.classList.contains('add-to-cart-btn') &&
            !e.target.classList.contains('view-detail-btn')) {
            const productId = parseInt(card.dataset.id);
            if (!isNaN(productId)) {
                showProductDetail(productId);
            }
        }
    });
    
    return card;
}

// Add to cart function
function addToCart(productId) {
    if (!appState.currentUser) {
        alert('Please login first!');
        showLoginModal();
        return;
    }
    
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product is in stock
    if (product.stock <= 0) {
        alert('This product is out of stock!');
        return;
    }
    
    const existingItem = appState.cart.find(item => item.productId === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        appState.cart.push({
            productId,
            quantity: 1,
            price: product.price,
            name: product.name,
            image: product.thumbnail,
            sku: product.sku
        });
    }
    
    saveStateToStorage();
    updateUI();
    updateCartDisplay();
    
    // Show success message
    showNotification(`${product.name} added to cart!`, 'success');
}

// 修复5: 简化的产品详情显示
function showProductDetail(productId) {
    console.log('showProductDetail called for product:', productId);
    
    const product = appState.products.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    appState.currentProductDetail = product;
    galleryState.currentProductForGallery = product;
    
    // 获取或创建模态框元素
    let modal = document.getElementById('product-detail-modal');
    if (!modal) {
        console.error('Product detail modal not found');
        return;
    }
    
    // 设置模态框内容
    const modalContent = `
        <div class="modal-content modal-wide">
            <div class="modal-header">
                <h3>${product.name}</h3>
                <button class="close-btn close-product-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div style="display: flex; gap: 2rem;">
                    <div style="flex: 1;">
                        <img src="${product.thumbnail || 'https://via.placeholder.com/400x400'}" 
                             alt="${product.name}" 
                             style="width: 100%; border-radius: 8px;">
                        <div style="margin-top: 1rem;">
                            <div style="font-size: 1.8rem; font-weight: bold; color: #4a6cf7;">
                                $${product.price.toFixed(2)}
                            </div>
                            <div style="margin-top: 1rem;">
                                <button id="modal-add-to-cart" class="btn btn-primary" style="width: 100%;">
                                    <i class="fas fa-cart-plus"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <div style="margin-bottom: 1rem;">
                            <p><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
                            <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
                            <p><strong>Category:</strong> ${product.category}${product.subcategory ? ` › ${product.subcategory}` : ''}</p>
                            <p><strong>Stock:</strong> ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                        </div>
                        
                        <div style="margin-top: 2rem;">
                            <h4>Description</h4>
                            <div>${product.detailedDescription || product.description}</div>
                        </div>
                        
                        ${product.tags && product.tags.length > 0 ? `
                            <div style="margin-top: 1rem;">
                                <strong>Tags:</strong>
                                <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; margin-top: 0.5rem;">
                                    ${product.tags.map(tag => `<span style="background: #e3f2fd; color: #1976d2; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.8rem;">${tag}</span>`).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.innerHTML = modalContent;
    modal.style.display = 'flex';
    
    // 添加关闭按钮事件
    const closeBtn = modal.querySelector('.close-product-modal');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }
    
    // 添加添加到购物车按钮事件
    const addToCartBtn = modal.querySelector('#modal-add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.onclick = function() {
            addToCart(product.id);
            modal.style.display = 'none';
        };
    }
    
    // 点击模态框外部关闭
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Show orders page
function showOrders(e) {
    e.preventDefault();
    elements.productSection.style.display = 'none';
    elements.ordersSection.style.display = 'block';
    renderOrders();
}

// Change page
function changePage(delta) {
    const newPage = appState.currentPage + delta;
    const totalPages = Math.ceil(appState.filteredProducts.length / appState.itemsPerPage);
    
    if (newPage >= 1 && newPage <= totalPages) {
        appState.currentPage = newPage;
        renderProducts();
    }
}

// Perform search
function performSearch() {
    const query = elements.searchInput.value.toLowerCase().trim();
    
    if (!query) {
        // If search is empty, show all active products
        appState.filteredProducts = appState.products.filter(product => product.status === 'active');
        appState.isSearching = false;
    } else {
        // Search in product name, description, and SKU
        appState.filteredProducts = appState.products.filter(product => 
            product.status === 'active' && (
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query)
            )
        );
        appState.isSearching = true;
    }
    
    appState.currentPage = 1; // Reset to first page
    renderProducts();
}

// Update UI
function updateUI() {
    // Update cart count
    const totalItems = appState.cart.reduce((total, item) => total + item.quantity, 0);
    if (elements.cartCount) {
        elements.cartCount.textContent = totalItems;
    }
    
    // Update user display
    updateUserDisplay();
}

// Update pagination info
function updatePaginationInfo(totalProducts) {
    const totalPages = Math.ceil(totalProducts / appState.itemsPerPage);
    if (elements.pageInfo) {
        elements.pageInfo.textContent = `Page ${appState.currentPage} of ${totalPages}`;
    }
    
    if (elements.prevPageBtn) {
        elements.prevPageBtn.disabled = appState.currentPage === 1;
    }
    if (elements.nextPageBtn) {
        elements.nextPageBtn.disabled = appState.currentPage === totalPages;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 1rem 1.5rem;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 3000;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Render orders
function renderOrders() {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    if (appState.orders.length === 0) {
        ordersList.innerHTML = '<div class="no-orders">You have no orders yet</div>';
        return;
    }
    
    ordersList.innerHTML = '';
    
    appState.orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-number">Order #${order.id}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <div class="order-status status-pending">${order.status}</div>
            </div>
            <div class="order-summary">
                <div class="order-customer">${order.customerName}</div>
                <div class="order-total">$${order.total.toFixed(2)}</div>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', initApp);

// Export functions for other modules
window.appState = appState;
window.toggleCartSidebar = toggleCartSidebar;
window.showLoginModal = showLoginModal;
window.updateCartDisplay = updateCartDisplay;
window.showProductDetail = showProductDetail;