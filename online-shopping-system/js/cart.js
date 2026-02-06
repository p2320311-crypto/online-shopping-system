// Cart functionality - Fixed version with safe DOM operations

// Gallery state for product detail
const galleryState = {
    currentImageIndex: 0,
    productImages: [],
    currentProductForGallery: null
};

// Add product to cart - FIXED: Prevent event bubbling and double adding
function addToCart(productId) {
    console.log('DEBUG: addToCart called for product:', productId, 'at:', new Date().toTimeString());
    
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
    
    // Check if product is active
    if (product.status !== 'active') {
        alert('This product is not available!');
        return;
    }
    
    const existingItem = appState.cart.find(item => item.productId === productId);
    
    if (existingItem) {
        // Check if adding more than available stock
        if (existingItem.quantity + 1 > product.stock) {
            alert(`Only ${product.stock} items available in stock!`);
            return;
        }
        existingItem.quantity += 1;
    } else {
        appState.cart.push({
            productId,
            quantity: 1,
            price: product.price,
            name: product.name,
            image: product.image || product.thumbnail || product.images?.[0],
            sku: product.sku
        });
    }
    
    saveStateToStorage();
    updateUI();
    
    // Show success message
    showNotification(`${product.name} added to cart!`, 'success');
}

// Add to cart from product detail modal
function addToCartFromDetail() {
    if (!appState.currentProductDetail) return;
    
    const quantityInput = document.getElementById('detail-quantity');
    if (!quantityInput) return;
    
    const quantity = parseInt(quantityInput.value);
    const productId = appState.currentProductDetail.id;
    
    if (quantity < 1) {
        alert('Quantity must be at least 1');
        return;
    }
    
    const product = appState.products.find(p => p.id === productId);
    if (!product) return;
    
    // Check stock
    if (quantity > product.stock) {
        alert(`Only ${product.stock} items available in stock!`);
        return;
    }
    
    // Check if product is active
    if (product.status !== 'active') {
        alert('This product is not available!');
        return;
    }
    
    const existingItem = appState.cart.find(item => item.productId === productId);
    
    if (existingItem) {
        const newTotal = existingItem.quantity + quantity;
        if (newTotal > product.stock) {
            alert(`Only ${product.stock - existingItem.quantity} more items available!`);
            return;
        }
        existingItem.quantity = newTotal;
    } else {
        appState.cart.push({
            productId,
            quantity: quantity,
            price: product.price,
            name: product.name,
            image: product.image || product.thumbnail || product.images?.[0],
            sku: product.sku
        });
    }
    
    saveStateToStorage();
    updateUI();
    
    const productDetailModal = document.getElementById('product-detail-modal');
    if (productDetailModal) {
        productDetailModal.style.display = 'none';
    }
    
    showNotification(`${quantity} × ${product.name} added to cart!`, 'success');
}

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = elements.cartTotal;
    
    if (!cartItemsContainer || !cartTotalElement) {
        console.error('Cart display elements not found');
        return;
    }
    
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
            <img src="${item.image || 'https://via.placeholder.com/60/e0e0e0/969696?text=No+Image'}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-sku">SKU: ${item.sku || 'N/A'}</div>
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
            updateQuantity(item.productId, -1);
        });
        cartItem.querySelector('.increase-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            updateQuantity(item.productId, 1);
        });
        cartItem.querySelector('.quantity-input').addEventListener('change', (e) => {
            e.stopPropagation();
            const newQuantity = parseInt(e.target.value);
            if (!isNaN(newQuantity) && newQuantity > 0) {
                updateQuantity(item.productId, newQuantity - item.quantity);
            }
        });
        cartItem.querySelector('.remove-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromCart(item.productId);
        });
    });
    
    cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

// Update product quantity
function updateQuantity(productId, delta) {
    const item = appState.cart.find(item => item.productId === productId);
    if (!item) return;
    
    const product = appState.products.find(p => p.id === productId);
    const newQuantity = item.quantity + delta;
    
    if (newQuantity < 1) {
        removeFromCart(productId);
    } else if (newQuantity > product.stock) {
        alert(`Only ${product.stock} items available in stock!`);
    } else {
        item.quantity = newQuantity;
        saveStateToStorage();
        updateCartDisplay();
        updateUI();
    }
}

// Remove product from cart
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
    
    // Check stock availability
    for (const cartItem of appState.cart) {
        const product = appState.products.find(p => p.id === cartItem.productId);
        if (!product) continue;
        
        if (cartItem.quantity > product.stock) {
            alert(`Insufficient stock for ${product.name}! Only ${product.stock} available.`);
            return;
        }
    }
    
    // Create order
    const orderId = 'ORD' + Date.now();
    const orderTotal = appState.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    const newOrder = {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        customerId: appState.currentUser.id,
        customerName: appState.currentUser.name,
        customerEmail: appState.currentUser.email,
        total: orderTotal,
        status: 'pending',
        items: appState.cart.map(item => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
            image: item.image
        })),
        shippingAddress: appState.currentUser.address,
        createdAt: new Date().toISOString(),
        statusHistory: [
            {
                status: 'pending',
                date: new Date().toISOString(),
                note: 'Order placed'
            }
        ]
    };
    
    // Update product stock
    appState.cart.forEach(cartItem => {
        const product = appState.products.find(p => p.id === cartItem.productId);
        if (product) {
            product.stock -= cartItem.quantity;
        }
    });
    
    appState.orders.push(newOrder);
    appState.cart = [];
    
    saveStateToStorage();
    updateCartDisplay();
    updateUI();
    
    toggleCartSidebar();
    showNotification(`Order ${orderId} created successfully!`, 'success');
}

// Show product detail - FIXED: Safe DOM operations
function showProductDetail(productId) {
    const product = appState.products.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    appState.currentProductDetail = product;
    galleryState.currentProductForGallery = product;
    
    // Get all DOM elements safely
    const elementsToUpdate = {
        'modal-product-name': product.name,
        'modal-product-description': product.description || 'No description available',
        'modal-product-sku': product.sku || 'N/A',
        'modal-product-category': product.category || 'Uncategorized',
        'modal-product-stock': product.stock || 0
    };
    
    // Update each element safely
    Object.entries(elementsToUpdate).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
    
    // Update price with discount handling
    const priceElement = document.getElementById('modal-product-price');
    const discountBadge = document.getElementById('modal-product-discount');
    
    if (priceElement) {
        if (product.discount > 0) {
            const discountedPrice = product.price * (1 - product.discount / 100);
            priceElement.innerHTML = `
                <span style="color: #dc3545; text-decoration: line-through;">$${product.price.toFixed(2)}</span>
                <span style="color: #4a6cf7;"> $${discountedPrice.toFixed(2)}</span>
            `;
            
            if (discountBadge) {
                discountBadge.textContent = `-${product.discount}%`;
                discountBadge.style.display = 'inline-block';
            }
        } else {
            priceElement.textContent = `$${product.price.toFixed(2)}`;
            if (discountBadge) {
                discountBadge.style.display = 'none';
            }
        }
    }
    
    // Update brand if element exists
    const brandElement = document.getElementById('modal-product-brand');
    if (brandElement) {
        brandElement.textContent = product.brand || 'N/A';
    }
    
    // Update rating if element exists
    const ratingElement = document.getElementById('modal-product-rating');
    if (ratingElement && product.rating) {
        const stars = Math.round(product.rating);
        ratingElement.innerHTML = Array.from({length: 5}, (_, i) => 
            `<i class="fas fa-star${i < stars ? '' : '-half-alt'}"></i>`
        ).join('');
    }
    
    // Update review count if element exists
    const reviewCount = document.getElementById('modal-product-reviews');
    if (reviewCount) {
        reviewCount.textContent = `(${product.reviews || 0} reviews)`;
    }
    
    // Update stock status
    const stockElement = document.getElementById('modal-product-stock');
    if (stockElement) {
        stockElement.textContent = product.stock > 0 ? `${product.stock} in stock` : 'Out of stock';
        stockElement.className = `stock-status ${product.stock > 10 ? 'in-stock' : 
            product.stock > 0 ? 'low-stock' : 'out-of-stock'}`;
    }
    
    // Update tags if element exists
    const tagsElement = document.getElementById('modal-product-tags');
    if (tagsElement && product.tags && Array.isArray(product.tags)) {
        tagsElement.innerHTML = product.tags.map(tag => 
            `<span class="product-tag">${tag}</span>`
        ).join('');
    } else if (tagsElement) {
        tagsElement.innerHTML = '';
    }
    
    // Update product images
    galleryState.productImages = product.images || [product.image || product.thumbnail];
    if (galleryState.productImages.length === 0) {
        galleryState.productImages = ['https://via.placeholder.com/400x400/e0e0e0/969696?text=No+Image'];
    }
    galleryState.currentImageIndex = 0;
    
    // Update gallery
    updateProductGallery();
    
    // Handle video section if it exists
    const videoSection = document.getElementById('video-section');
    if (videoSection) {
        if (product.video) {
            videoSection.style.display = 'block';
            const videoElement = document.getElementById('product-video');
            if (videoElement) {
                videoElement.querySelector('source').src = product.video.url;
                videoElement.load();
            }
        } else {
            videoSection.style.display = 'none';
        }
    }
    
    // Update quantity input
    const quantityInput = document.getElementById('detail-quantity');
    if (quantityInput) {
        quantityInput.value = 1;
        quantityInput.max = product.stock;
    }
    
    // Load detailed information and related products
    loadProductTabs(product);
    loadRelatedProducts(product);
    
    // Show modal
    const productDetailModal = document.getElementById('product-detail-modal');
    if (productDetailModal) {
        productDetailModal.style.display = 'flex';
    } else {
        console.error('Product detail modal not found');
    }
}

// Update product gallery safely
function updateProductGallery() {
    if (!galleryState.currentProductForGallery) return;
    
    const mainImage = document.getElementById('modal-main-image');
    const imageCounter = document.getElementById('image-counter');
    const thumbnailGallery = document.getElementById('thumbnail-gallery');
    
    // Check if elements exist
    if (!mainImage || !imageCounter || !thumbnailGallery) {
        console.warn('Gallery elements not found');
        return;
    }
    
    // Set main image
    if (galleryState.productImages[galleryState.currentImageIndex]) {
        mainImage.src = galleryState.productImages[galleryState.currentImageIndex];
        mainImage.alt = `${galleryState.currentProductForGallery.name} - Image ${galleryState.currentImageIndex + 1}`;
    }
    
    // Update counter
    imageCounter.textContent = `${galleryState.currentImageIndex + 1} / ${galleryState.productImages.length}`;
    
    // Update thumbnail gallery
    thumbnailGallery.innerHTML = '';
    
    galleryState.productImages.forEach((imageUrl, index) => {
        const thumbnailItem = document.createElement('div');
        thumbnailItem.className = `thumbnail-item ${index === galleryState.currentImageIndex ? 'active' : ''}`;
        thumbnailItem.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `${galleryState.currentProductForGallery.name} - Thumbnail ${index + 1}`;
        img.loading = 'lazy';
        
        // Handle image error
        img.onerror = function() {
            this.src = 'https://via.placeholder.com/80/e0e0e0/969696?text=Image+Error';
        };
        
        thumbnailItem.appendChild(img);
        
        // Click thumbnail to switch main image
        thumbnailItem.addEventListener('click', () => {
            galleryState.currentImageIndex = index;
            updateProductGallery();
        });
        
        thumbnailGallery.appendChild(thumbnailItem);
    });
    
    // Show/hide navigation buttons
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    if (prevBtn && nextBtn) {
        if (galleryState.productImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }
}

// Load product tabs safely
function loadProductTabs(product) {
    // Description tab
    const descriptionTab = document.getElementById('tab-description');
    if (descriptionTab) {
        descriptionTab.innerHTML = product.detailedDescription || 
            `<p>${product.description || 'No detailed description available.'}</p>`;
    }
    
    // Specifications tab
    const specsTab = document.getElementById('tab-specifications');
    if (specsTab) {
        if (product.specifications && Object.keys(product.specifications).length > 0) {
            specsTab.innerHTML = `
                <table class="specs-table">
                    <tbody>
                        ${Object.entries(product.specifications).map(([key, value]) => `
                            <tr>
                                <th>${formatSpecKey(key)}</th>
                                <td>${Array.isArray(value) ? value.join(', ') : value}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            specsTab.innerHTML = '<p>No specifications available for this product.</p>';
        }
    }
    
    // Details tab
    const detailsTab = document.getElementById('tab-details');
    if (detailsTab) {
        const details = [];
        
        if (product.weight) details.push(`<p><strong>Weight:</strong> ${product.weight}</p>`);
        if (product.dimensions) details.push(`<p><strong>Dimensions:</strong> ${product.dimensions}</p>`);
        if (product.warranty) details.push(`<p><strong>Warranty:</strong> ${product.warranty}</p>`);
        if (product.isFeatured) details.push('<p><strong>Featured Product</strong></p>');
        
        detailsTab.innerHTML = details.length > 0 ? details.join('') : 
            '<p>No additional details available.</p>';
    }
    
    // Setup tab switching
    setupInfoTabs();
}

// Load related products safely
function loadRelatedProducts(currentProduct) {
    const relatedContainer = document.getElementById('related-products');
    if (!relatedContainer) return;
    
    // Find related products (same category or shared tags)
    const relatedProducts = appState.products.filter(product => 
        product.id !== currentProduct.id &&
        product.status === 'active' &&
        (product.category === currentProduct.category ||
         (product.tags && currentProduct.tags && 
          product.tags.some(tag => currentProduct.tags.includes(tag))))
    ).slice(0, 4); // Show up to 4 related products
    
    if (relatedProducts.length === 0) {
        relatedContainer.innerHTML = '<p>No related products found.</p>';
        return;
    }
    
    relatedContainer.innerHTML = relatedProducts.map(product => `
        <div class="related-product" data-id="${product.id}">
            <img src="${product.thumbnail || product.images?.[0] || 'https://via.placeholder.com/150/e0e0e0/969696?text=No+Image'}" 
                 alt="${product.name}">
            <div class="related-product-info">
                <div class="related-product-name">${product.name}</div>
                <div class="related-product-price">$${product.price.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
    
    // Add click events to related products
    relatedContainer.querySelectorAll('.related-product').forEach(item => {
        item.addEventListener('click', () => {
            const productId = parseInt(item.dataset.id);
            if (!isNaN(productId)) {
                showProductDetail(productId);
            }
        });
    });
}

// Format specification keys for display
function formatSpecKey(key) {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/Ram/i, 'RAM')
        .replace(/Gpu/i, 'GPU')
        .replace(/Cpu/i, 'CPU')
        .replace(/Ssd/i, 'SSD')
        .replace(/Hdd/i, 'HDD');
}

// Setup info tabs safely
function setupInfoTabs() {
    const tabs = document.querySelectorAll('.info-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabs.length === 0 || tabContents.length === 0) {
        return;
    }
    
    tabs.forEach(tab => {
        // Remove existing event listeners to prevent duplicates
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        newTab.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const tabId = newTab.dataset.tab;
            if (!tabId) return;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            newTab.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabId}`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Ensure first tab is active
    if (tabs.length > 0 && !tabs[0].classList.contains('active')) {
        tabs[0].classList.add('active');
    }
    
    // Ensure first content is active
    const firstTabId = tabs[0]?.dataset.tab;
    if (firstTabId) {
        const firstContent = document.getElementById(`tab-${firstTabId}`);
        if (firstContent) {
            firstContent.classList.add('active');
        }
    }
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

// Add animation styles if not already present
if (!document.querySelector('#cart-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-animation-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .close-notification {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            font-size: 0.9rem;
        }
        
        .empty-cart {
            text-align: center;
            color: #777;
            padding: 2rem;
        }
        
        .no-products {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            color: #777;
        }
    `;
    document.head.appendChild(style);
}

// Initialize gallery navigation
document.addEventListener('DOMContentLoaded', () => {
    // Previous image button
    const prevBtn = document.getElementById('prev-image');
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (galleryState.productImages.length > 1) {
                galleryState.currentImageIndex = (galleryState.currentImageIndex - 1 + galleryState.productImages.length) % galleryState.productImages.length;
                updateProductGallery();
            }
        });
    }
    
    // Next image button
    const nextBtn = document.getElementById('next-image');
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (galleryState.productImages.length > 1) {
                galleryState.currentImageIndex = (galleryState.currentImageIndex + 1) % galleryState.productImages.length;
                updateProductGallery();
            }
        });
    }
    
    // Quantity controls
    const decreaseQty = document.getElementById('decrease-qty');
    const increaseQty = document.getElementById('increase-qty');
    const detailQuantity = document.getElementById('detail-quantity');
    
    if (decreaseQty && detailQuantity) {
        decreaseQty.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const current = parseInt(detailQuantity.value);
            if (current > 1) {
                detailQuantity.value = current - 1;
            }
        });
    }
    
    if (increaseQty && detailQuantity) {
        increaseQty.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const current = parseInt(detailQuantity.value);
            const max = parseInt(detailQuantity.max);
            if (current < max) {
                detailQuantity.value = current + 1;
            }
        });
    }
    
    // Add to cart from detail modal
    const addToCartDetail = document.getElementById('add-to-cart-detail');
    if (addToCartDetail) {
        addToCartDetail.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCartFromDetail();
        });
    }
});