// Order management functionality
const orderElements = {
    ordersSection: document.getElementById('orders-section'),
    ordersList: document.getElementById('orders-list'),
    orderStatusFilter: document.getElementById('order-status-filter'),
    orderSearchInput: document.getElementById('order-search-input'),
    orderSearchBtn: document.getElementById('order-search-btn')
};

// Order status definitions
const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    HOLD: 'hold'
};

const ORDER_STATUS_LABELS = {
    [ORDER_STATUS.PENDING]: 'Pending',
    [ORDER_STATUS.PROCESSING]: 'Processing',
    [ORDER_STATUS.SHIPPED]: 'Shipped',
    [ORDER_STATUS.DELIVERED]: 'Delivered',
    [ORDER_STATUS.CANCELLED]: 'Cancelled',
    [ORDER_STATUS.HOLD]: 'On Hold'
};

const ORDER_STATUS_COLORS = {
    [ORDER_STATUS.PENDING]: 'status-pending',
    [ORDER_STATUS.PROCESSING]: 'status-processing',
    [ORDER_STATUS.SHIPPED]: 'status-shipped',
    [ORDER_STATUS.DELIVERED]: 'status-delivered',
    [ORDER_STATUS.CANCELLED]: 'status-cancelled',
    [ORDER_STATUS.HOLD]: 'status-hold'
};

// Initialize order management
function initOrderManagement() {
    setupOrderEventListeners();
}

// Setup order event listeners
function setupOrderEventListeners() {
    // Order filter listeners
    if (orderElements.orderStatusFilter) {
        orderElements.orderStatusFilter.addEventListener('change', filterOrders);
    }
    
    if (orderElements.orderSearchBtn) {
        orderElements.orderSearchBtn.addEventListener('click', searchOrders);
    }
    
    if (orderElements.orderSearchInput) {
        orderElements.orderSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchOrders();
        });
    }
}

// Render orders list
function renderOrders() {
    if (!orderElements.ordersList) return;
    
    if (!appState.currentUser) {
        orderElements.ordersList.innerHTML = '<div class="no-orders">Please login to view your orders</div>';
        return;
    }
    
    const userOrders = appState.orders.filter(order => order.customerId === appState.currentUser.id);
    
    if (userOrders.length === 0) {
        orderElements.ordersList.innerHTML = '<div class="no-orders">You have no orders yet</div>';
        return;
    }
    
    // Sort by date descending
    const sortedOrders = [...userOrders].sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    );
    
    orderElements.ordersList.innerHTML = '';
    
    sortedOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        orderElements.ordersList.appendChild(orderCard);
    });
}

// Create order card
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    orderCard.dataset.orderId = order.id;
    
    const statusClass = ORDER_STATUS_COLORS[order.status] || 'status-pending';
    const statusText = ORDER_STATUS_LABELS[order.status] || 'Pending';
    
    orderCard.innerHTML = `
        <div class="order-header">
            <div>
                <div class="order-number">Order #${order.id}</div>
                <div class="order-date">${formatDate(order.date || order.createdAt)}</div>
            </div>
            <div class="order-status ${statusClass}">${statusText}</div>
        </div>
        <div class="order-summary">
            <div class="order-customer">${order.customerName || appState.currentUser.name}</div>
            <div class="order-total">$${order.total ? order.total.toFixed(2) : '0.00'}</div>
        </div>
    `;
    
    // Add click event to view order details
    orderCard.addEventListener('click', (e) => {
        if (!e.target.classList.contains('cancel-order-btn') && 
            !e.target.closest('.cancel-order-btn')) {
            showOrderDetail(order.id);
        }
    });
    
    return orderCard;
}

// Filter orders by status
function filterOrders() {
    const statusFilter = orderElements.orderStatusFilter ? orderElements.orderStatusFilter.value : 'all';
    const searchQuery = orderElements.orderSearchInput ? orderElements.orderSearchInput.value.toLowerCase().trim() : '';
    
    if (!appState.currentUser || !orderElements.ordersList) return;
    
    let filteredOrders = appState.orders.filter(order => 
        order.customerId === appState.currentUser.id
    );
    
    // Apply status filter
    if (statusFilter !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        filteredOrders = filteredOrders.filter(order => 
            order.id.toLowerCase().includes(searchQuery) ||
            order.customerName.toLowerCase().includes(searchQuery)
        );
    }
    
    // Sort by date descending
    filteredOrders.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    
    orderElements.ordersList.innerHTML = '';
    
    if (filteredOrders.length === 0) {
        orderElements.ordersList.innerHTML = '<div class="no-orders">No orders found</div>';
        return;
    }
    
    filteredOrders.forEach(order => {
        const orderCard = createOrderCard(order);
        orderElements.ordersList.appendChild(orderCard);
    });
}

// Search orders
function searchOrders() {
    filterOrders();
}

// Show order detail
function showOrderDetail(orderId) {
    console.log('Showing order detail for:', orderId);
    
    const order = appState.orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }
    
    // Update order summary information
    updateOrderSummary(order);
    
    // Update order items list
    updateOrderItems(order);
    
    // Update status history
    updateStatusHistory(order);
    
    // Update order actions
    updateOrderActions(order);
    
    // Show modal
    const orderDetailModal = document.getElementById('order-detail-modal');
    if (orderDetailModal) {
        orderDetailModal.style.display = 'flex';
    } else {
        console.error('Order detail modal not found');
    }
}

// Update order summary information
function updateOrderSummary(order) {
    // Define all elements with fallback
    const elements = {
        orderId: document.getElementById('detail-order-id'),
        orderDate: document.getElementById('detail-order-date'),
        orderStatus: document.getElementById('detail-order-status'),
        customerName: document.getElementById('detail-customer-name'),
        customerEmail: document.getElementById('detail-customer-email'),
        shippingAddress: document.getElementById('detail-shipping-address'),
        orderTotal: document.getElementById('detail-order-total')
    };
    
    // Update order ID
    if (elements.orderId) {
        elements.orderId.textContent = order.id || 'N/A';
    }
    
    // Update order date
    if (elements.orderDate) {
        const date = order.date || order.createdAt;
        elements.orderDate.textContent = date ? formatDate(date) : 'N/A';
    }
    
    // Update order status
    if (elements.orderStatus) {
        const statusClass = ORDER_STATUS_COLORS[order.status] || 'status-pending';
        const statusText = ORDER_STATUS_LABELS[order.status] || 'Pending';
        elements.orderStatus.textContent = statusText;
        elements.orderStatus.className = `status-badge ${statusClass}`;
    }
    
    // Update customer name
    if (elements.customerName) {
        elements.customerName.textContent = order.customerName || 
            (appState.currentUser ? appState.currentUser.name : 'N/A');
    }
    
    // Update customer email
    if (elements.customerEmail) {
        elements.customerEmail.textContent = order.customerEmail || 
            (appState.currentUser ? appState.currentUser.email : 'N/A');
    }
    
    // Update shipping address
    if (elements.shippingAddress) {
        elements.shippingAddress.textContent = order.shippingAddress || 'N/A';
    }
    
    // Update order total
    if (elements.orderTotal) {
        elements.orderTotal.textContent = order.total ? `$${order.total.toFixed(2)}` : '$0.00';
    }
}

// Update order items list
function updateOrderItems(order) {
    const orderItemsList = document.getElementById('order-items-list');
    const orderItemsTotal = document.getElementById('order-items-total');
    
    if (!orderItemsList || !orderItemsTotal) {
        console.error('Order items elements not found');
        return;
    }
    
    // Clear existing content
    orderItemsList.innerHTML = '';
    
    // Check if order has items
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        orderItemsList.innerHTML = `
            <tr>
                <td colspan="5" class="no-items-message">
                    No items found in this order
                </td>
            </tr>
        `;
        orderItemsTotal.textContent = '$0.00';
        return;
    }
    
    // Calculate total
    let total = 0;
    
    // Add each order item
    order.items.forEach((item) => {
        const subtotal = (item.quantity || 0) * (item.price || 0);
        total += subtotal;
        
        // Find product details
        const product = appState.products.find(p => p.id === item.productId);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="product-cell">
                    <div class="product-image">
                        <img src="${item.image || (product ? product.thumbnail : 'https://via.placeholder.com/60/e0e0e0/969696?text=No+Image')}" 
                             alt="${item.name}">
                    </div>
                    <div class="product-info">
                        <div class="product-name">${item.name || 'Unknown Product'}</div>
                        ${product && product.description ? 
                            `<div class="product-description">${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</div>` : ''}
                    </div>
                </div>
            </td>
            <td>${item.sku || product?.sku || 'N/A'}</td>
            <td>${item.quantity || 0}</td>
            <td>$${(item.price || 0).toFixed(2)}</td>
            <td>$${subtotal.toFixed(2)}</td>
        `;
        
        orderItemsList.appendChild(row);
    });
    
    // Update total
    orderItemsTotal.textContent = `$${total.toFixed(2)}`;
}

// Update status history
function updateStatusHistory(order) {
    const statusHistoryContainer = document.getElementById('detail-status-history');
    
    if (!statusHistoryContainer) {
        console.error('Status history container not found');
        return;
    }
    
    // Clear existing content
    statusHistoryContainer.innerHTML = '';
    
    // Get status history
    const statusHistory = order.statusHistory || [
        {
            status: ORDER_STATUS.PENDING,
            date: order.createdAt || order.date,
            note: 'Order placed'
        }
    ];
    
    // Add each status event
    statusHistory.forEach((event) => {
        const statusEvent = document.createElement('div');
        statusEvent.className = `status-event ${event.status}`;
        
        const statusTitle = ORDER_STATUS_LABELS[event.status] || event.status;
        
        statusEvent.innerHTML = `
            <div class="status-title">${statusTitle}</div>
            ${event.note ? `<div class="status-note">${event.note}</div>` : ''}
            <div class="status-date">${formatDateTime(event.date)}</div>
        `;
        
        statusHistoryContainer.appendChild(statusEvent);
    });
    
    // If no status history, show message
    if (statusHistory.length === 0) {
        statusHistoryContainer.innerHTML = '<div class="no-items-message">No status history available</div>';
    }
}

// Update order actions
function updateOrderActions(order) {
    const orderActionsContainer = document.getElementById('detail-order-actions');
    
    if (!orderActionsContainer) {
        console.error('Order actions container not found');
        return;
    }
    
    // Clear existing content
    orderActionsContainer.innerHTML = '';
    
    // Customer can cancel pending or hold orders
    if (order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.HOLD) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-outline';
        cancelBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Order';
        cancelBtn.addEventListener('click', () => {
            cancelOrder(order.id);
            // Close modal
            const orderDetailModal = document.getElementById('order-detail-modal');
            if (orderDetailModal) {
                orderDetailModal.style.display = 'none';
            }
        });
        orderActionsContainer.appendChild(cancelBtn);
    }
    
    // Add print button
    const printBtn = document.createElement('button');
    printBtn.className = 'btn btn-outline';
    printBtn.innerHTML = '<i class="fas fa-print"></i> Print Invoice';
    printBtn.addEventListener('click', () => {
        printOrder(order);
    });
    orderActionsContainer.appendChild(printBtn);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-primary';
    closeBtn.innerHTML = '<i class="fas fa-times"></i> Close';
    closeBtn.addEventListener('click', () => {
        const orderDetailModal = document.getElementById('order-detail-modal');
        if (orderDetailModal) {
            orderDetailModal.style.display = 'none';
        }
    });
    orderActionsContainer.appendChild(closeBtn);
}

// Cancel order
function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) {
        return;
    }
    
    const orderIndex = appState.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        alert('Order not found!');
        return;
    }
    
    // Check if order can be cancelled
    const order = appState.orders[orderIndex];
    if (![ORDER_STATUS.PENDING, ORDER_STATUS.HOLD].includes(order.status)) {
        alert('This order cannot be cancelled.');
        return;
    }
    
    // Update order status
    appState.orders[orderIndex].status = ORDER_STATUS.CANCELLED;
    appState.orders[orderIndex].cancelledDate = new Date().toISOString();
    
    // Initialize status history if not exists
    if (!appState.orders[orderIndex].statusHistory) {
        appState.orders[orderIndex].statusHistory = [
            {
                status: order.status,
                date: order.createdAt || order.date,
                note: 'Order placed'
            }
        ];
    }
    
    // Add cancellation to status history
    appState.orders[orderIndex].statusHistory.push({
        status: ORDER_STATUS.CANCELLED,
        date: new Date().toISOString(),
        note: 'Order cancelled by customer'
    });
    
    // Restore product stock
    if (appState.orders[orderIndex].items && Array.isArray(appState.orders[orderIndex].items)) {
        appState.orders[orderIndex].items.forEach(item => {
            const product = appState.products.find(p => p.id === item.productId);
            if (product) {
                product.stock += (item.quantity || 0);
            }
        });
    }
    
    saveStateToStorage();
    
    // Refresh orders display
    renderOrders();
    
    showNotification(`Order ${orderId} cancelled successfully!`, 'success');
}

// Print order
function printOrder(order) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - Order #${order.id}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    line-height: 1.6;
                }
                .invoice-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .invoice-header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                }
                .invoice-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-bottom: 30px;
                }
                .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                .invoice-table th {
                    background-color: #4a6cf7;
                    color: white;
                    padding: 12px;
                    text-align: left;
                }
                .invoice-table td {
                    padding: 12px;
                    border-bottom: 1px solid #ddd;
                }
                .invoice-total {
                    text-align: right;
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-top: 20px;
                }
                .status-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.9em;
                }
                .status-pending { background-color: #fff3cd; color: #856404; }
                .status-shipped { background-color: #d1ecf1; color: #0c5460; }
                .status-delivered { background-color: #d4edda; color: #155724; }
                .status-cancelled { background-color: #f8d7da; color: #721c24; }
                @media print {
                    .no-print { display: none; }
                    body { margin: 0; }
                }
            </style>
        </head>
        <body>
            <div class="invoice-container">
                <div class="invoice-header">
                    <h1>INVOICE</h1>
                    <p>Order #${order.id}</p>
                    <p>Date: ${formatDate(order.date || order.createdAt)}</p>
                </div>
                
                <div class="invoice-details">
                    <div>
                        <h3>Customer Information</h3>
                        <p><strong>Name:</strong> ${order.customerName || 'N/A'}</p>
                        <p><strong>Email:</strong> ${order.customerEmail || 'N/A'}</p>
                        <p><strong>Status:</strong> 
                            <span class="status-badge status-${order.status}">
                                ${ORDER_STATUS_LABELS[order.status] || order.status}
                            </span>
                        </p>
                    </div>
                    <div>
                        <h3>Shipping Address</h3>
                        <p>${order.shippingAddress || 'N/A'}</p>
                    </div>
                </div>
                
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(order.items || []).map(item => `
                            <tr>
                                <td>${item.name || 'Unknown Product'}</td>
                                <td>${item.sku || 'N/A'}</td>
                                <td>${item.quantity || 0}</td>
                                <td>$${(item.price || 0).toFixed(2)}</td>
                                <td>$${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="invoice-total">
                    <p><strong>Total Amount:</strong> $${order.total ? order.total.toFixed(2) : '0.00'}</p>
                </div>
                
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #4a6cf7; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Print Invoice
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        Close
                    </button>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

// Format date and time for display
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return 'N/A';
    
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

// Initialize orders module
document.addEventListener('DOMContentLoaded', initOrderManagement);