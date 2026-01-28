// --- TOAST FUNCTION ---
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.innerText = message;
    toast.className = "show";
    setTimeout(function () { toast.className = toast.className.replace("show", ""); }, 3000);
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = "flex";
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

// Scroll
function scrollToGrid() {
    document.getElementById('cafeGrid').scrollIntoView({ behavior: 'smooth' });
}

// Switch Tabs (Partner Login)
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-container .tab');

    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// --- CUSTOMER MENU LOGIC ---
let cart = [];
const itemPrices = {
    'Burger': 149, 'Pizza': 299, 'Coffee': 99,
    'Pasta': 249, 'Fries': 129, 'Shake': 119
};

function openMenu(cafeName) {
    // Update Title
    document.getElementById('menuTitle').innerHTML = cafeName.toLowerCase().replace(/ /g, '_') + ' <span class="blue-tick">✔</span>';
    // Show Menu View
    document.getElementById('landingView').style.display = 'none';
    document.getElementById('menuView').style.display = 'block';
    window.scrollTo(0, 0);
}

function closeMenu() {
    document.getElementById('menuView').style.display = 'none';
    document.getElementById('landingView').style.display = 'block';
}

function switchMenuTab(tabName) {
    const menuGrid = document.querySelector('.menu-grid');
    const ordersContent = document.getElementById('ordersTabContent');
    const tabs = document.querySelectorAll('.menu-tab');

    // Simple toggle for now (Menu vs Orders vs Others)
    if (tabName === 'menu') {
        menuGrid.style.display = 'grid';
        ordersContent.style.display = 'none';
    } else if (tabName === 'orders') {
        menuGrid.style.display = 'none';
        ordersContent.style.display = 'block';
        renderMyOrders();
    } else {
        menuGrid.style.display = 'none';
        ordersContent.style.display = 'none';
    }

    // Update Tabs UI
    tabs.forEach(t => t.classList.remove('active'));
    if (tabName === 'menu') tabs[0].classList.add('active');
    if (tabName === 'reviews') tabs[1].classList.add('active');
    if (tabName === 'info') tabs[2].classList.add('active');
    if (tabName === 'orders') tabs[3].classList.add('active');
}

function addToCart(itemName) {
    let price = itemPrices[itemName] || 0;
    cart.push({ name: itemName, price: price });
    document.getElementById('cartCount').innerText = cart.length;
    showToast(itemName + " added to cart! 🛒");
}

function placeOrder() {
    if (cart.length > 0) {
        openBillModal();
    } else {
        showToast("Your cart is empty! 🍽️");
    }
}

// --- BILL & RECEIPT LOGIC ---
function openBillModal() {
    const today = new Date().toLocaleDateString();
    document.getElementById('billDate').innerText = "Date: " + today;

    const listContainer = document.getElementById('billItems');
    listContainer.innerHTML = '';

    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price;
        listContainer.innerHTML += `
            <div class="bill-row">
                <span>${item.name}</span>
                <span>₹${item.price}</span>
            </div>
        `;
    });

    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    document.getElementById('billSubtotal').innerText = "₹" + subtotal;
    document.getElementById('billTax').innerText = "₹" + tax;
    document.getElementById('billGrandTotal').innerText = "₹" + total;

    openModal('billModal');
}

function confirmPayment(method) {
    // Save to LocalStorage
    const orderData = {
        date: new Date().toLocaleString(),
        items: [...cart],
        total: parseInt(document.getElementById('billGrandTotal').innerText.replace('₹', ''))
    };

    let history = JSON.parse(localStorage.getItem('myOrders')) || [];
    history.unshift(orderData); // Add to top
    localStorage.setItem('myOrders', JSON.stringify(history));

    // Reset
    cart = [];
    document.getElementById('cartCount').innerText = 0;
    closeModal('billModal');
    showToast("Payment Successful via " + method.toUpperCase() + "! 🎉");

    // Switch to history tab to show user
    switchMenuTab('orders');
}

function renderMyOrders() {
    const history = JSON.parse(localStorage.getItem('myOrders')) || [];
    const container = document.getElementById('historyList');

    if (history.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; margin-top:50px;">No past orders found.</p>';
        return;
    }

    container.innerHTML = '';
    history.forEach(order => {
        const itemNames = order.items.map(i => i.name).join(', ');
        container.innerHTML += `
            <div class="history-item">
                <div class="history-top">
                    <span>${order.date}</span>
                    <span style="color:#249a3e">PAID</span>
                </div>
                <div class="history-items">${itemNames}</div>
                <div class="history-total">Total: ₹${order.total}</div>
            </div>
        `;
    });
}


// --- DASHBOARD LOGIC ---

function handleLogin() {
    showToast("Logging in... 🔐");
    setTimeout(() => {
        closeModal('partnerModal');
        document.getElementById('landingView').style.display = 'none';
        document.getElementById('dashboardView').style.display = 'flex';
        showToast("Welcome to Dashboard! 🚀");
        renderLiveOrders();
        renderQRCodes();
    }, 1000);
}

function handleLogout() {
    showToast("Logging out...");
    setTimeout(() => {
        document.getElementById('dashboardView').style.display = 'none';
        document.getElementById('landingView').style.display = 'block';
    }, 1000);
}

function acceptOrder(orderId) {
    const orderElement = document.getElementById(orderId);
    orderElement.style.opacity = '0';
    setTimeout(() => {
        orderElement.style.display = 'none';

        // Remove from localStorage
        let liveOrders = JSON.parse(localStorage.getItem('liveOrders')) || [];
        liveOrders = liveOrders.filter(o => o.id !== orderId);
        localStorage.setItem('liveOrders', JSON.stringify(liveOrders));

        showToast("Order Sent to Kitchen! 👨‍🍳");
    }, 300);
}

function switchDashboardTab(tab) {
    const panels = document.querySelectorAll('.panel'); // floor, live, qr
    const floorPlan = panels[0];
    const liveOrders = panels[1];
    const qrPanel = document.getElementById('qrPanel');

    if (tab === 'qr') {
        floorPlan.style.display = 'none';
        liveOrders.style.display = 'none';
        qrPanel.style.display = 'block';
        document.getElementById('nav-dashboard').classList.remove('active');
        document.getElementById('nav-qr').classList.add('active');
    } else {
        floorPlan.style.display = 'block';
        liveOrders.style.display = 'block';
        qrPanel.style.display = 'none';
        document.getElementById('nav-dashboard').classList.add('active');
        document.getElementById('nav-qr').classList.remove('active');
    }
}

function renderQRCodes() {
    const grid = document.getElementById('qrGrid');
    if (grid.children.length > 0) return;

    for (let i = 1; i <= 3; i++) {
        grid.innerHTML += `
            <div class="qr-card">
                <h3 style="margin-bottom:10px;">Table ${i}</h3>
                <div class="qr-img">QR CODE</div>
                <button class="btn-print" onclick="window.print()">
                    <span>🖨️</span> Print
                </button>
            </div>
        `;
    }
}

// --- DEMO DATA LOGIC ---

function initDemoData() {
    // 1. Live Orders (Dashboard)
    if (!localStorage.getItem('liveOrders')) {
        const dummyLiveOrders = [
            { id: 'order1', table: 'Table 2', time: '2m ago', details: '1x Cappuccino, 1x Sandwich' },
            { id: 'order2', table: 'Table 6', time: '5m ago', details: '2x Burgers, 2x Coke' },
            { id: 'order3', table: 'Table 11', time: 'Just now', details: '1x Pasta Alfredo' },
            { id: 'order4', table: 'Table 3', time: '8m ago', details: '1x Pizza' }
        ];
        localStorage.setItem('liveOrders', JSON.stringify(dummyLiveOrders));
    }

    // 2. Past Orders (Customer App)
    if (!localStorage.getItem('myOrders')) {
        const dummyHistory = [
            { date: new Date().toLocaleDateString(), items: [{ name: 'Burger', price: 149 }, { name: 'Fries', price: 129 }], total: 292 },
            { date: 'Yesterday', items: [{ name: 'Coffee', price: 99 }], total: 104 }
        ];
        localStorage.setItem('myOrders', JSON.stringify(dummyHistory));
    }
}

function renderLiveOrders() {
    const container = document.getElementById('liveOrdersList');
    if (!container) return; // Might not exist if not in dashboard

    const orders = JSON.parse(localStorage.getItem('liveOrders')) || [];
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center; padding:20px;">No live orders.</p>';
        return;
    }

    orders.forEach(order => {
        container.innerHTML += `
            <div class="order-item" id="${order.id}">
                <div class="order-top">
                    <span>${order.table}</span>
                    <span style="color:#aaa;">${order.time}</span>
                </div>
                <div class="order-details">
                    ${order.details}
                </div>
                <button class="btn-accept" onclick="acceptOrder('${order.id}')">Accept Order</button>
            </div>
        `;
    });
}

function resetDemo() {
    if (confirm('Reset Demo Data? This will clear all orders.')) {
        localStorage.clear();
        location.reload();
    }
}

// Filter Logic
function filterCafes() {
    console.log("Searching...");
}

// Close modal on outside click
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// Init on Load
window.onload = function () {
    initDemoData();
};
