// Admin state management
let adminState = {
    currentSection: 'products',
    filteredProducts: [],
    filteredOrders: [],
    filteredCustomers: []
};

// DOM Elements for admin panel
const adminElements = {
    // Section links
    productSectionLink: document.querySelector('[data-section="products"]'),
    orderSectionLink: document.querySelector('[data-section="orders"]'),
    customerSectionLink: document.querySelector('[data-section="customers"]'),
    
    // Sections
    productsSection: document.getElementById('products-section'),
    ordersSection: document.getElementById('orders-section'),
    customersSection: document.getElementById('customers-section'),
    
    // Product management
    productSearch: document.getElementById('product-search'),
    productStatusFilter: document.getElementById('product-status-filter'),
    productSearchBtn: document.getElementById('product-search-btn'),
    adminProductList: document.getElementById('admin-product-list'),
    
    // Order management
    orderSearch: document.getElementById('order-search'),
    orderStatusFilter: document.getElementById('order-status-filter'),
    orderSearchBtn: document.getElementById('order-search-btn'),
    adminOrdersList: document.getElementById('admin-orders-list'),
    
    // Customer management
    customerSearch: document.getElementById('customer-search'),
    customerSearchBtn: document.getElementById('customer-search-btn'),
    adminCustomersList: document.getElementById('admin-customers-list'),
    
    // Buttons
    addProductBtn: document.getElementById('add-product-btn'),
    refreshBtn: document.getElementById('refresh-btn'),
    exportBtn: document.getElementById('export-btn'),
    
    // Statistics
    totalProducts: document.getElementById('total-products'),
    activeProducts: document.getElementById('active-products'),
    totalOrders: document.getElementById('total-orders'),
    totalRevenue: document.getElementById('total-revenue')
};

// Initialize admin panel
function initAdminPanel() {
    setupAdminEventListeners();
    loadAdminData();
    updateStatistics();
    showProductsSection();
}

// Setup admin event listeners
function setupAdminEventListeners() {
    // Section navigation
    adminElements.productSectionLink.addEventListener('click', () => showSection('products'));
    adminElements.orderSectionLink.addEventListener('click', () => showSection('orders'));
    adminElements.customerSectionLink.addEventListener('click', () => showSection('customers'));
    
    // Product management
    adminElements.addProductBtn.addEventListener('click', showAddProductModal);
    adminElements.productSearchBtn.addEventListener('click', searchProducts);
    adminElements.productSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchProducts();
    });
    
    // Order management
    adminElements.orderSearchBtn.addEventListener('click', searchOrders);
    adminElements.orderSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchOrders();
    });
    
    // Customer management
    adminElements.customerSearchBtn.addEventListener('click', searchCustomers);
    adminElements.customerSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchCustomers();
    });
    
    // Refresh and export
    adminElements.refreshBtn.addEventListener('click', refreshAdminData);
    adminElements.exportBtn.addEventListener('click', exportData);
}

// Load admin data
function loadAdminData() {
    // Load from localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    adminState.filteredProducts = [...products];
    adminState.filteredOrders = [...orders];
    adminState.filteredCustomers = [...users];
    
    renderProductsTable();
    renderOrdersTable();
    renderCustomersTable();
}

// Show section
function showSection(section) {
    // Update active link
    adminElements.productSectionLink.classList.remove('active');
    adminElements.orderSectionLink.classList.remove('active');
    adminElements.customerSectionLink.classList.remove('active');
    
    // Hide all sections
    adminElements.productsSection.style.display = 'none';
    adminElements.ordersSection.style.display = 'none';
    adminElements.customersSection.style.display = 'none';
    
    // Show selected section
    if (section === 'products') {
        adminElements.productSectionLink.classList.add('active');
        adminElements.productsSection.style.display = 'block';
        adminState.currentSection = 'products';
    } else if (section === 'orders') {
        adminElements.orderSectionLink.classList.add('active');
        adminElements.ordersSection.style.display = 'block';
        adminState.currentSection = 'orders';
    } else if (section === 'customers') {
        adminElements.customerSectionLink.classList.add('active');
        adminElements.customersSection.style.display = 'block';
        adminState.currentSection = 'customers';
    }
}

// Show products section
function showProductsSection() {
    showSection('products');
}

// Render products table
function renderProductsTable() {
    const tbody = adminElements.adminProductList;
    tbody.innerHTML = '';
    
    if (adminState.filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 2rem; color: #777;">
                    No products found
                </td>
            </tr>
        `;
        return;
    }
    
    adminState.filteredProducts.forEach(product => {
        const statusClass = product.status === 'active' ? 'status-active' : 
                          product.stock <= 0 ? 'status-out-of-stock' : 'status-inactive';
        const statusText = product.status === 'active' ? 'Active' : 
                          product.stock <= 0 ? 'Out of Stock' : 'Inactive';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.id}</td>
            <td><strong>${product.sku}</strong></td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                    ${product.name}
                </div>
            </td>
            <td>${product.category || 'Uncategorized'}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-outline btn-sm edit-product-btn" data-id="${product.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-outline btn-sm toggle-product-btn" data-id="${product.id}">
                        <i class="fas fa-power-off"></i> ${product.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button class="btn btn-outline btn-sm delete-product-btn" data-id="${product.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Add event listeners
        tr.querySelector('.edit-product-btn').addEventListener('click', () => showEditProductModal(product.id));
        tr.querySelector('.toggle-product-btn').addEventListener('click', () => toggleProductStatus(product.id));
        tr.querySelector('.delete-product-btn').addEventListener('click', () => deleteProduct(product.id));
    });
}

// Render orders table
function renderOrdersTable() {
    const tbody = adminElements.adminOrdersList;
    tbody.innerHTML = '';
    
    if (adminState.filteredOrders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem; color: #777;">
                    No orders found
                </td>
            </tr>
        `;
        return;
    }
    
    adminState.filteredOrders.forEach(order => {
        const statusClass = order.status === 'shipped' ? 'status-shipped' : 
                          order.status === 'completed' ? 'status-completed' : 'status-pending';
        const statusText = order.status === 'shipped' ? 'Shipped' : 
                          order.status === 'completed' ? 'Completed' : 'Pending';
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${order.id}</strong></td>
            <td>${order.date}</td>
            <td>${order.customerName}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-outline btn-sm view-order-btn" data-id="${order.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-outline btn-sm update-order-btn" data-id="${order.id}">
                        <i class="fas fa-sync-alt"></i> Update Status
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Add event listeners
        tr.querySelector('.view-order-btn').addEventListener('click', () => showOrderDetailModal(order.id));
        tr.querySelector('.update-order-btn').addEventListener('click', () => showUpdateOrderStatusModal(order.id));
    });
}

// Render customers table
function renderCustomersTable() {
    const tbody = adminElements.adminCustomersList;
    tbody.innerHTML = '';
    
    if (adminState.filteredCustomers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #777;">
                    No customers found
                </td>
            </tr>
        `;
        return;
    }
    
    adminState.filteredCustomers.forEach(customer => {
        // Count orders for this customer
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const customerOrders = orders.filter(order => order.customerId === customer.id);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.address || 'Not provided'}</td>
            <td>${customer.registeredDate || 'N/A'}</td>
            <td>${customerOrders.length}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-outline btn-sm view-customer-btn" data-id="${customer.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        // Add event listener
        tr.querySelector('.view-customer-btn').addEventListener('click', () => showCustomerDetailModal(customer.id));
    });
}

// Search products
function searchProducts() {
    const query = adminElements.productSearch.value.toLowerCase().trim();
    const statusFilter = adminElements.productStatusFilter.value;
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    adminState.filteredProducts = products.filter(product => {
        // Text search
        const matchesText = !query || 
            product.name.toLowerCase().includes(query) ||
            product.sku.toLowerCase().includes(query) ||
            product.id.toString().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query));
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && product.status === 'active') ||
            (statusFilter === 'inactive' && product.status !== 'active');
        
        return matchesText && matchesStatus;
    });
    
    renderProductsTable();
}

// Search orders
function searchOrders() {
    const query = adminElements.orderSearch.value.toLowerCase().trim();
    const statusFilter = adminElements.orderStatusFilter.value;
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    adminState.filteredOrders = orders.filter(order => {
        // Text search
        const matchesText = !query || 
            order.id.toLowerCase().includes(query) ||
            order.customerName.toLowerCase().includes(query);
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || 
            order.status === statusFilter;
        
        return matchesText && matchesStatus;
    });
    
    renderOrdersTable();
}

// Search customers
function searchCustomers() {
    const query = adminElements.customerSearch.value.toLowerCase().trim();
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    adminState.filteredCustomers = users.filter(user => {
        return !query || 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query);
    });
    
    renderCustomersTable();
}

// Show add product modal
function showAddProductModal() {
    const modal = createModal('Add New Product', `
        <form id="add-product-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="product-sku">SKU *</label>
                    <input type="text" id="product-sku" required>
                </div>
                <div class="form-group">
                    <label for="product-name">Product Name *</label>
                    <input type="text" id="product-name" required>
                </div>
            </div>
            <div class="form-group">
                <label for="product-description">Description *</label>
                <textarea id="product-description" rows="3" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="product-price">Price ($) *</label>
                    <input type="number" id="product-price" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="product-stock">Stock Quantity *</label>
                    <input type="number" id="product-stock" min="0" required>
                </div>
            </div>
            <div class="form-group">
                <label for="product-images">Product Images (URLs, one per line)</label>
                <textarea id="product-images" rows="3" placeholder="https://example.com/image1.jpg\nhttps://example.com/image2.jpg"></textarea>
                <small>Enter one image URL per line</small>
            </div>
            <div class="form-group">
                <label for="product-thumbnail">Thumbnail Image URL</label>
                <input type="text" id="product-thumbnail" placeholder="https://example.com/thumbnail.jpg">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="product-category">Category</label>
                    <input type="text" id="product-category">
                </div>
                <div class="form-group">
                    <label for="product-status">Status</label>
                    <select id="product-status">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Add Product</button>
                <button type="button" class="btn btn-outline close-modal-btn">Cancel</button>
            </div>
        </form>
    `);
    
    modal.querySelector('#add-product-form').addEventListener('submit', handleAddProduct);
}


// Show edit product modal with multiple image support
// 在 admin/admin.js 中更新 showEditProductModal 函数
// 在 admin/admin.js 中更新产品编辑表单
function showEditProductModal(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Prepare data for form
    const imagesText = (product.images || []).join('\n');
    const tagsText = (product.tags || []).join(', ');
    const specsText = product.specifications ? JSON.stringify(product.specifications, null, 2) : '';
    
    const modal = createModal('Edit Product - Advanced', `
        <form id="edit-product-form" data-id="${productId}" class="advanced-product-form">
            <!-- Basic Information Tab -->
            <div class="form-tabs">
                <button type="button" class="form-tab active" data-tab="basic">Basic Info</button>
                <button type="button" class="form-tab" data-tab="details">Details</button>
                <button type="button" class="form-tab" data-tab="specs">Specifications</button>
                <button type="button" class="form-tab" data-tab="media">Media</button>
            </div>
            
            <div class="form-tab-content active" id="tab-basic">
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-product-sku">SKU *</label>
                        <input type="text" id="edit-product-sku" value="${product.sku}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-name">Product Name *</label>
                        <input type="text" id="edit-product-name" value="${product.name}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-product-description">Short Description *</label>
                    <textarea id="edit-product-description" rows="2" required>${product.description}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="edit-product-detailed">Detailed Description (HTML) *</label>
                    <textarea id="edit-product-detailed" rows="8" required>${product.detailedDescription || ''}</textarea>
                    <small class="form-text">Supports HTML formatting: &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-product-price">Price ($) *</label>
                        <input type="number" id="edit-product-price" value="${product.price}" min="0" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-discount">Discount (%)</label>
                        <input type="number" id="edit-product-discount" value="${product.discount || 0}" min="0" max="100" step="1">
                    </div>
                </div>
            </div>
            
            <!-- Details Tab -->
            <div class="form-tab-content" id="tab-details">
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-product-category">Category *</label>
                        <input type="text" id="edit-product-category" value="${product.category || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-product-subcategory">Subcategory</label>
                        <input type="text" id="edit-product-subcategory" value="${product.subcategory || ''}">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-product-brand">Brand</label>
                        <input type="text" id="edit-product-brand" value="${product.brand || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-product-stock">Stock Quantity *</label>
                        <input type="number" id="edit-product-stock" value="${product.stock}" min="0" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-product-tags">Tags (comma separated)</label>
                    <input type="text" id="edit-product-tags" value="${tagsText}" 
                           placeholder="smartphone, mobile, premium, 5g">
                    <small class="form-text">Separate tags with commas</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-product-rating">Rating (0-5)</label>
                        <input type="number" id="edit-product-rating" value="${product.rating || 0}" 
                               min="0" max="5" step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="edit-product-reviews">Review Count</label>
                        <input type="number" id="edit-product-reviews" value="${product.reviews || 0}" min="0">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="edit-product-weight">Weight</label>
                        <input type="text" id="edit-product-weight" value="${product.weight || ''}" 
                               placeholder="0.5kg">
                    </div>
                    <div class="form-group">
                        <label for="edit-product-dimensions">Dimensions</label>
                        <input type="text" id="edit-product-dimensions" value="${product.dimensions || ''}" 
                               placeholder="160.8 x 78.1 x 7.85 mm">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="edit-product-warranty">Warranty</label>
                    <input type="text" id="edit-product-warranty" value="${product.warranty || ''}" 
                           placeholder="1 year">
                </div>
                
                <div class="form-group">
                    <label for="edit-product-status">Status</label>
                    <select id="edit-product-status">
                        <option value="active" ${product.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${product.status !== 'active' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
            </div>
            
            <!-- Specifications Tab -->
            <div class="form-tab-content" id="tab-specs">
                <div class="form-group">
                    <label for="edit-product-specs">Specifications (JSON Format)</label>
                    <textarea id="edit-product-specs" rows="10" 
                              placeholder='{
  "color": ["Black", "Silver"],
  "storage": ["256GB", "512GB"],
  "display": "6.7-inch OLED",
  "processor": "A16 Bionic",
  "ram": "8GB"
}'>${specsText}</textarea>
                    <small class="form-text">Enter specifications in JSON format. Example above.</small>
                </div>
            </div>
            
            <!-- Media Tab -->
            <div class="form-tab-content" id="tab-media">
                <div class="form-group">
                    <label for="edit-product-images">Product Images (URLs, one per line)</label>
                    <textarea id="edit-product-images" rows="4">${imagesText}</textarea>
                    <small class="form-text">Enter one image URL per line</small>
                </div>
                
                <div class="form-group">
                    <label for="edit-product-thumbnail">Thumbnail Image URL</label>
                    <input type="text" id="edit-product-thumbnail" value="${product.thumbnail || ''}" 
                           placeholder="https://example.com/thumbnail.jpg">
                </div>
                
                <div class="form-group">
                    <label>Video (Optional)</label>
                    <div class="form-row">
                        <div class="form-group">
                            <input type="text" id="edit-product-video-url" value="${product.video?.url || ''}" 
                                   placeholder="Video URL (MP4)">
                        </div>
                        <div class="form-group">
                            <input type="text" id="edit-product-video-thumbnail" value="${product.video?.thumbnail || ''}" 
                                   placeholder="Video Thumbnail URL">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Save Changes</button>
                <button type="button" class="btn btn-outline close-modal-btn">Cancel</button>
            </div>
        </form>
    `, 'modal-wide');
    
    // Setup tab switching
    setupFormTabs();
    
    // Setup image management
    setupImageManagement(productId);
    
    modal.querySelector('#edit-product-form').addEventListener('submit', handleEditProduct);
}

// Setup form tabs
function setupFormTabs() {
    const tabs = document.querySelectorAll('.form-tab');
    const tabContents = document.querySelectorAll('.form-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabId}`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Update handleEditProduct to save all attributes
function handleEditProduct(e) {
    e.preventDefault();
    
    const productId = parseInt(e.target.getAttribute('data-id'));
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) return;
    
    // Parse tags
    const tagsText = document.getElementById('edit-product-tags').value;
    const tags = tagsText.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    
    // Parse specifications (try JSON, fallback to empty object)
    let specifications = {};
    const specsText = document.getElementById('edit-product-specs').value.trim();
    if (specsText) {
        try {
            specifications = JSON.parse(specsText);
        } catch (error) {
            console.error('Invalid JSON in specifications:', error);
        }
    }
    
    // Parse images
    const imagesText = document.getElementById('edit-product-images').value;
    const images = imagesText.split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);
    
    // Check video
    const videoUrl = document.getElementById('edit-product-video-url').value.trim();
    const videoThumbnail = document.getElementById('edit-product-video-thumbnail').value.trim();
    
    const productUpdate = {
        ...products[productIndex],
        // Basic info
        sku: document.getElementById('edit-product-sku').value,
        name: document.getElementById('edit-product-name').value,
        description: document.getElementById('edit-product-description').value,
        detailedDescription: document.getElementById('edit-product-detailed').value,
        price: parseFloat(document.getElementById('edit-product-price').value),
        discount: parseFloat(document.getElementById('edit-product-discount').value) || 0,
        
        // Details
        category: document.getElementById('edit-product-category').value,
        subcategory: document.getElementById('edit-product-subcategory').value || undefined,
        brand: document.getElementById('edit-product-brand').value || undefined,
        stock: parseInt(document.getElementById('edit-product-stock').value),
        tags: tags.length > 0 ? tags : undefined,
        rating: parseFloat(document.getElementById('edit-product-rating').value) || 0,
        reviews: parseInt(document.getElementById('edit-product-reviews').value) || 0,
        weight: document.getElementById('edit-product-weight').value || undefined,
        dimensions: document.getElementById('edit-product-dimensions').value || undefined,
        warranty: document.getElementById('edit-product-warranty').value || undefined,
        status: document.getElementById('edit-product-status').value,
        
        // Specifications
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        
        // Media
        images: images.length > 0 ? images : undefined,
        thumbnail: document.getElementById('edit-product-thumbnail').value || undefined,
        image: images.length > 0 ? images[0] : document.getElementById('edit-product-thumbnail').value || products[productIndex].image
    };
    
    // Video
    if (videoUrl) {
        productUpdate.video = {
            url: videoUrl,
            thumbnail: videoThumbnail || undefined
        };
    } else {
        delete productUpdate.video;
    }
    
    products[productIndex] = productUpdate;
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update appState
    if (window.appState) {
        window.appState.products = products;
        window.appState.filteredProducts = products.filter(p => p.status === 'active');
    }
    
    closeModal();
    loadAdminData();
    updateStatistics();
    showNotification('Product updated successfully!', 'success');
}

// 设置图片管理功能
function setupImageManagement(productId) {
    const previewContainer = document.getElementById(`image-preview-${productId}`);
    const textarea = document.getElementById('edit-product-images');
    
    if (!previewContainer || !textarea) return;
    
    // 移除图片按钮事件
    previewContainer.querySelectorAll('.remove-image-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const currentImages = textarea.value.split('\n').filter(url => url.trim());
            currentImages.splice(index, 1);
            textarea.value = currentImages.join('\n');
            updateImagePreview(productId, currentImages);
        });
    });
    
    // 文本区域变化时更新预览
    textarea.addEventListener('input', function() {
        const images = this.value.split('\n').filter(url => url.trim());
        updateImagePreview(productId, images);
    });
}

// 更新图片预览
function updateImagePreview(productId, images) {
    const previewContainer = document.getElementById(`image-preview-${productId}`);
    if (!previewContainer) return;
    
    previewContainer.innerHTML = images.map((img, index) => `
        <div class="image-preview-item" data-index="${index}">
            <img src="${img}" alt="Preview ${index + 1}" onerror="this.src='https://via.placeholder.com/100/e0e0e0/969696?text=Error'">
            <button type="button" class="remove-image-btn" data-index="${index}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // 重新绑定移除按钮事件
    previewContainer.querySelectorAll('.remove-image-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            images.splice(index, 1);
            const textarea = document.getElementById('edit-product-images');
            textarea.value = images.join('\n');
            updateImagePreview(productId, images);
        });
    });
}

// Show order detail modal
// Show order detail modal
function showOrderDetailModal(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const statusText = order.status === 'shipped' ? 'Shipped' : 
                      order.status === 'completed' ? 'Completed' : 'Pending';
    
    const modal = createModal(`Order Details - ${orderId}`, `
        <div class="order-detail-modal">
            <div class="order-info">
                <p><strong>Order ID:</strong> ${order.id}</p>
                <p><strong>Order Date:</strong> ${order.date}</p>
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                <p><strong>Status:</strong> <span class="status-badge ${order.status === 'shipped' ? 'status-shipped' : 
                    order.status === 'completed' ? 'status-completed' : 'status-pending'}">${statusText}</span></p>
            </div>
            
            <div class="order-line-items">
                <h4>Order Items</h4>
                ${order.items.map(item => `
                    <div class="order-line-item">
                        <div>
                            <strong>${item.name}</strong><br>
                            SKU: ${item.sku}<br>
                            Quantity: ${item.quantity} × $${item.price.toFixed(2)}
                        </div>
                        <div>$${item.subtotal.toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-total" style="text-align: right; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #4a6cf7;">
                <h3>Total: $${order.total.toFixed(2)}</h3>
            </div>
            
            <div class="modal-actions" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="btn btn-primary" id="print-order-btn">Print Receipt</button>
                <button class="btn btn-outline" id="close-detail-modal-btn">Close</button>
            </div>
        </div>
    `, 'modal-wide');
    
    // Add event listener for print button
    modal.querySelector('#print-order-btn').addEventListener('click', () => {
        window.print();
    });
    
    // Add event listener for close button
    modal.querySelector('#close-detail-modal-btn').addEventListener('click', () => {
        closeModal();
    });
}

// Create modal (reusable) - 修复这个函数确保Close按钮工作
function createModal(title, content, extraClass = '') {
    const modalContainer = document.getElementById('modal-container');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content ${extraClass}">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn close-modal-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modalContainer.innerHTML = '';
    modalContainer.appendChild(modal);
    
    // Add close event for the X button
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
}

// Close modal - 确保能正常工作
function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
}

// Show customer detail modal
function showCustomerDetailModal(customerId) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const customer = users.find(u => u.id === customerId);
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const customerOrders = orders.filter(order => order.customerId === customerId);
    
    if (!customer) return;
    
    const modal = createModal(`Customer Details - ${customer.name}`, `
        <div class="customer-detail-modal">
            <div class="customer-info">
                <p><strong>Customer ID:</strong> ${customer.id}</p>
                <p><strong>Name:</strong> ${customer.name}</p>
                <p><strong>Email:</strong> ${customer.email}</p>
                <p><strong>Shipping Address:</strong> ${customer.address}</p>
                <p><strong>Registered Date:</strong> ${customer.registeredDate || 'N/A'}</p>
                <p><strong>Total Orders:</strong> ${customerOrders.length}</p>
                <p><strong>Total Spent:</strong> $${customerOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
            </div>
            
            ${customerOrders.length > 0 ? `
                <div class="customer-orders" style="margin-top: 1.5rem;">
                    <h4>Order History</h4>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;">
                        <thead>
                            <tr>
                                <th style="padding: 0.5rem; border-bottom: 1px solid #eee;">Order ID</th>
                                <th style="padding: 0.5rem; border-bottom: 1px solid #eee;">Date</th>
                                <th style="padding: 0.5rem; border-bottom: 1px solid #eee;">Total</th>
                                <th style="padding: 0.5rem; border-bottom: 1px solid #eee;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${customerOrders.map(order => `
                                <tr>
                                    <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${order.id}</td>
                                    <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">${order.date}</td>
                                    <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">$${order.total.toFixed(2)}</td>
                                    <td style="padding: 0.5rem; border-bottom: 1px solid #eee;">
                                        <span class="status-badge ${order.status === 'shipped' ? 'status-shipped' : 
                                            order.status === 'completed' ? 'status-completed' : 'status-pending'}">
                                            ${order.status === 'shipped' ? 'Shipped' : 
                                             order.status === 'completed' ? 'Completed' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            <div class="modal-actions" style="margin-top: 1.5rem;">
                <button class="btn btn-outline close-modal-btn">Close</button>
            </div>
        </div>
    `, 'modal-wide');
}

// Show update order status modal with all options
function showUpdateOrderStatusModal(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const modal = createModal('Update Order Status', `
        <form id="update-order-status-form" data-id="${orderId}">
            <div class="form-group">
                <label for="order-status-select">Order Status</label>
                <select id="order-status-select">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    <option value="hold" ${order.status === 'hold' ? 'selected' : ''}>On Hold</option>
                </select>
            </div>
            <div class="form-group">
                <label for="order-date">Status Date</label>
                <input type="datetime-local" id="order-date" value="${new Date().toISOString().slice(0, 16)}">
            </div>
            <div class="form-group">
                <label for="order-notes">Notes (Optional)</label>
                <textarea id="order-notes" rows="3" placeholder="Add any notes about this order..."></textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">Update Status</button>
                <button type="button" class="btn btn-outline close-modal-btn">Cancel</button>
            </div>
        </form>
    `);
    
    modal.querySelector('#update-order-status-form').addEventListener('submit', handleUpdateOrderStatus);
}

// Handle update order status with date tracking
function handleUpdateOrderStatus(e) {
    e.preventDefault();
    
    const orderId = e.target.getAttribute('data-id');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return;
    
    const newStatus = document.getElementById('order-status-select').value;
    const statusDate = document.getElementById('order-date').value || new Date().toISOString();
    const notes = document.getElementById('order-notes').value;
    
    // Update status-specific dates
    const updates = {};
    if (newStatus === 'shipped') {
        updates.shippedDate = statusDate;
    } else if (newStatus === 'cancelled') {
        updates.cancelledDate = statusDate;
    }
    
    // Initialize status history if not exists
    if (!orders[orderIndex].statusHistory) {
        orders[orderIndex].statusHistory = [
            {
                status: orders[orderIndex].status,
                date: orders[orderIndex].createdAt || orders[orderIndex].date,
                note: 'Order placed'
            }
        ];
    }
    
    // Add new status to history
    orders[orderIndex].statusHistory.push({
        status: newStatus,
        date: statusDate,
        note: notes || `Status changed to ${newStatus}`
    });
    
    orders[orderIndex] = {
        ...orders[orderIndex],
        ...updates,
        status: newStatus,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Update appState in main.js
    if (window.appState) {
        window.appState.orders = orders;
    }
    
    closeModal();
    loadAdminData();
    updateStatistics();
    showNotification(`Order status updated to ${newStatus}`, 'success');
}

// Handle add product with multiple images
function handleAddProduct(e) {
    e.preventDefault();
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Generate new product ID
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    
    // Parse image URLs
    const imagesText = document.getElementById('product-images').value;
    const images = imagesText.split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);
    
    const newProduct = {
        id: newId,
        sku: document.getElementById('product-sku').value,
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value),
        images: images.length > 0 ? images : undefined,
        thumbnail: document.getElementById('product-thumbnail').value || undefined,
        category: document.getElementById('product-category').value || 'Uncategorized',
        image: images.length > 0 ? images[0] : document.getElementById('product-thumbnail').value || `https://via.placeholder.com/300x200/4a6cf7/ffffff?text=${encodeURIComponent(document.getElementById('product-name').value)}`,
        status: document.getElementById('product-status').value,
        createdAt: new Date().toISOString().split('T')[0]
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update appState in main.js
    if (window.appState) {
        window.appState.products = products;
        window.appState.filteredProducts = products.filter(p => p.status === 'active');
    }
    
    closeModal();
    loadAdminData();
    updateStatistics();
    showNotification('Product added successfully!', 'success');
}



// Toggle product status
function toggleProductStatus(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) return;
    
    products[productIndex].status = products[productIndex].status === 'active' ? 'inactive' : 'active';
    localStorage.setItem('products', JSON.stringify(products));
    
    // Update appState in main.js
    if (window.appState) {
        window.appState.products = products;
        window.appState.filteredProducts = products.filter(p => p.status === 'active');
    }
    
    loadAdminData();
    updateStatistics();
    showNotification(`Product ${products[productIndex].status === 'active' ? 'enabled' : 'disabled'}`, 'success');
}

// Delete product
function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const filteredProducts = products.filter(p => p.id !== productId);
    
    localStorage.setItem('products', JSON.stringify(filteredProducts));
    
    // Update appState in main.js
    if (window.appState) {
        window.appState.products = filteredProducts;
        window.appState.filteredProducts = filteredProducts.filter(p => p.status === 'active');
    }
    
    loadAdminData();
    updateStatistics();
    showNotification('Product deleted successfully!', 'success');
}

// Update statistics
function updateStatistics() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    adminElements.totalProducts.textContent = totalProducts;
    adminElements.activeProducts.textContent = activeProducts;
    adminElements.totalOrders.textContent = totalOrders;
    adminElements.totalRevenue.textContent = `$${totalRevenue.toFixed(2)}`;
}

// Refresh admin data
function refreshAdminData() {
    loadAdminData();
    updateStatistics();
    showNotification('Data refreshed successfully!', 'success');
}

// Export data
function exportData() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const data = {
        exportedAt: new Date().toISOString(),
        products,
        orders,
        users
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `online-shopping-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!', 'success');
}

// Create modal (reusable)
function createModal(title, content, extraClass = '') {
    const modalContainer = document.getElementById('modal-container');
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content ${extraClass}">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-btn close-modal-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    modalContainer.innerHTML = '';
    modalContainer.appendChild(modal);
    
    // Add close event
    modal.querySelector('.close-modal-btn').addEventListener('click', closeModal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    return modal;
}

// Close modal
function closeModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = '';
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-notification"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles for notification
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
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Add close button event
    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', initAdminPanel);