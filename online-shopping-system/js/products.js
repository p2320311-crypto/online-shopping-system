// Render orders list - 关键修复：移除Close按钮
function renderOrders() {
    const ordersList = document.getElementById('orders-list');
    
    if (appState.orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">No orders yet</p>';
        return;
    }
    
    ordersList.innerHTML = '';
    
    // Sort by date descending
    const sortedOrders = [...appState.orders].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    sortedOrders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        const statusClass = order.status === 'shipped' ? 'status-shipped' : 
                          order.status === 'completed' ? 'status-completed' : 'status-pending';
        const statusText = order.status === 'shipped' ? 'Shipped' : 
                          order.status === 'completed' ? 'Completed' : 'Pending';
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <span class="order-number">Order #: ${order.id}</span>
                    <span class="order-date">${order.date}</span>
                </div>
                <div>
                    <span class="order-total">$${order.total.toFixed(2)}</span>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
            </div>
            <div class="order-items">
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                <h4>Order Items:</h4>
                <ul>
                    ${order.items.map(item => `
                        <li>${item.name} (SKU: ${item.sku}) × ${item.quantity} = $${item.subtotal.toFixed(2)}</li>
                    `).join('')}
                </ul>
            </div>
        `;
        
        ordersList.appendChild(orderCard);
    });
}

// Add admin link to page
function addAdminLink() {
    const adminLink = document.createElement('a');
    adminLink.href = 'admin/index.html';
    adminLink.className = 'admin-link';
    adminLink.innerHTML = '<i class="fas fa-cogs"></i> Admin Panel';
    document.body.appendChild(adminLink);
}

// Initialize products module
document.addEventListener('DOMContentLoaded', () => {
    addAdminLink();
});

// Export functions
window.renderOrders = renderOrders;