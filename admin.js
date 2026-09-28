
// ==========================================
// ANONG MERON? - ADMIN DASHBOARD
// SUPABASE VERSION
// ==========================================


// ==========================================
// GET CURRENT ADMIN
// ==========================================

const adminUser =
    typeof getCurrentUser === "function"
        ? getCurrentUser()
        : null;


// ==========================================
// DISPLAY ADMIN NAME
// ==========================================

function displayAdminName() {

    const adminNameElement =
        document.getElementById("admin-name");

    if (!adminNameElement) {
        return;
    }

    if (adminUser && adminUser.fullName) {

        adminNameElement.textContent =
            adminUser.fullName;

    } else {

        adminNameElement.textContent =
            "Admin";

    }
}


// ==========================================
// FORMAT CURRENCY
// ==========================================

function formatCurrency(amount) {

    return "₱" +
        Number(amount || 0).toLocaleString(
            "en-PH",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatOrderDate(dateValue) {

    if (!dateValue) {
        return "No date";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "No date";
    }

    return date.toLocaleString(
        "en-PH",
        {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// CHECK TODAY
// ==========================================

function isToday(dateValue) {

    if (!dateValue) {
        return false;
    }

    const orderDate =
        new Date(dateValue);

    const today =
        new Date();

    return (
        orderDate.getFullYear() === today.getFullYear() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getDate() === today.getDate()
    );
}


// ==========================================
// GET ORDERS FROM SUPABASE
// ==========================================

async function getOrders() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client is not available."
        );

        return [];
    }


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("orders")

            .select(`
    id,
    order_number,
    user_id,
    employee_name,
    department,
    payment,
    total,
    status,
    admin_archived,
    created_at,
    order_items (
                    id,
                    order_id,
                    product_id,
                    product_name,
                    price,
                    quantity,
                    subtotal
                )
            `)

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "Error loading orders:",
                error
            );

            return [];
        }


        if (!Array.isArray(data)) {
            return [];
        }


        return data.map(order => {

            return {

                id:
                    order.id,

                orderNumber:
                    order.order_number,

                userId:
                    order.user_id,

                employeeName:
                    order.employee_name,

                department:
                    order.department,

                payment:
                    order.payment,

                total:
                    Number(order.total) || 0,

                status:
    order.status || "Pending",

adminArchived:
    order.admin_archived === true,

date:
    order.created_at,

                items:
                    Array.isArray(order.order_items)

                        ? order.order_items.map(item => {

                            return {

                                id:
                                    item.id,

                                orderId:
                                    item.order_id,

                                productId:
                                    item.product_id,

                                name:
                                    item.product_name,

                                price:
                                    Number(item.price) || 0,

                                quantity:
                                    Number(item.quantity) || 0,

                                subtotal:
                                    Number(item.subtotal) || 0

                            };

                        })

                        : []

            };

        });

    } catch (error) {

        console.error(
            "Unexpected error loading orders:",
            error
        );

        return [];
    }
}


// ==========================================
// GET ORDER ITEMS SUMMARY
// ==========================================

function getOrderItemsSummary(order) {

    if (
        !order.items ||
        !Array.isArray(order.items) ||
        order.items.length === 0
    ) {

        return "No items";
    }


    return order.items

        .map(item => {

            const quantity =
                Number(item.quantity) || 1;

            const itemName =
                item.name || "Unknown Item";

            const subtotal =
                Number(item.subtotal) ||
                (
                    Number(item.price) *
                    quantity
                );


            return `
                <div class="admin-item-line">

                    <span>
                        ${quantity}x
                        ${escapeHTML(itemName)}
                    </span>

                    <span>
                        ${formatCurrency(subtotal)}
                    </span>

                </div>
            `;

        })

        .join("");
}


// ==========================================
// CREATE ORDER CARD
// ==========================================

function createOrderCard(order) {

    const status =
        String(order.status || "Pending")
            .trim();

    const normalizedStatus =
        status.toLowerCase();


    const statusClass =
        normalizedStatus === "completed"
            ? "completed-status"
            : "pending-status";


    return `

        <div
            class="admin-order-card"
            data-order-id="${escapeHTML(order.id)}"
            data-order-number="${escapeHTML(
                order.orderNumber || ""
            )}"
            data-customer="${escapeHTML(
                order.employeeName || ""
            ).toLowerCase()}">


            <!-- ORDER HEADER -->

            <div class="order-header">

                <div>

                    <strong>
                        Order #${escapeHTML(
                            order.orderNumber || "N/A"
                        )}
                    </strong>

                    <small>
                        ${formatOrderDate(order.date)}
                    </small>

                </div>

                <span class="${statusClass}">
                    ${escapeHTML(status)}
                </span>

            </div>


            <!-- CUSTOMER INFORMATION -->

            <div class="customer-info">

                <strong>
                    ${escapeHTML(
                        order.employeeName ||
                        "Unknown Employee"
                    )}
                </strong>

                <span>
                    ${escapeHTML(
                        order.department ||
                        "No Department"
                    )}
                </span>

            </div>


            <!-- ORDER ITEMS -->

            <div class="admin-items">

                ${getOrderItemsSummary(order)}

            </div>


            <!-- ORDER TOTAL AND PAYMENT -->

            <div class="order-total">

                <div class="order-total-amount">

                    Total:
                    ${formatCurrency(order.total)}

                </div>

                <div class="order-payment-method">

                    Payment Method:
                    ${escapeHTML(
                        order.payment || "Cash"
                    )}

                </div>

            </div>


            <!-- ACTION -->

            ${
                normalizedStatus === "pending"

                    ? `

                        <button
                            class="complete-order-button"
                            onclick="completeOrder('${escapeHTML(
                                order.id
                            )}')">

                            ✓ Mark as Completed

                        </button>

                    `

                    : ""
            }

        </div>

    `;
}


// ==========================================
// SORT ORDERS
// ==========================================

function sortOrdersNewestFirst(orders) {

    return [...orders].sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.date || 0
                ).getTime();

            const dateB =
                new Date(
                    b.date || 0
                ).getTime();

            return dateB - dateA;

        }
    );
}


// ==========================================
// UPDATE DASHBOARD SUMMARY
// ==========================================

async function updateDashboardSummary() {

    const orders =
        await getOrders();


    const pendingOrders =
        orders.filter(order => {

            const status =
                String(
                    order.status || ""
                )
                .trim()
                .toLowerCase();

            return status === "pending";

        });


    const completedOrders =
    orders.filter(order => {

        const status =
            String(
                order.status || ""
            )
            .trim()
            .toLowerCase();

        return (
            status === "completed" &&
            order.adminArchived !== true
        );

    });


    const todaySales =
        completedOrders

            .filter(order =>
                isToday(order.date)
            )

            .reduce(
                (total, order) => {

                    return total +
                        (
                            Number(order.total) ||
                            0
                        );

                },
                0
            );


    const pendingCount =
        document.getElementById(
            "pending-count"
        );

    if (pendingCount) {

        pendingCount.textContent =
            pendingOrders.length;

    }


    const completedCount =
        document.getElementById(
            "completed-count"
        );

    if (completedCount) {

        completedCount.textContent =
            completedOrders.length;

    }


    const todaySalesElement =
        document.getElementById(
            "today-sales"
        );

    if (todaySalesElement) {

        todaySalesElement.textContent =
            formatCurrency(todaySales);

    }
}


// ==========================================
// RENDER PENDING ORDERS
// ==========================================

async function renderPendingOrders() {

    const container =
        document.getElementById(
            "pending-orders"
        );

    if (!container) {
        return;
    }


    const orders =
        sortOrdersNewestFirst(
            (
                await getOrders()
            )
            .filter(order => {

                const status =
                    String(
                        order.status || ""
                    )
                    .trim()
                    .toLowerCase();

                return status === "pending";

            })
        );


    if (orders.length === 0) {

        container.innerHTML = `

            <div class="no-orders">

                No pending orders.

            </div>

        `;

        return;
    }


    container.innerHTML =
        orders

            .map(order =>
                createOrderCard(order)
            )

            .join("");
}


// ==========================================
// RENDER COMPLETED ORDERS
// ==========================================

async function renderCompletedOrders() {

    const container =
        document.getElementById(
            "completed-orders"
        );

    if (!container) {
        return;
    }


    const orders =
        sortOrdersNewestFirst(
            (
                await getOrders()
            )
            .filter(order => {

                const status =
                    String(
                        order.status || ""
                    )
                    .trim()
                    .toLowerCase();

                return (
    status === "completed" &&
    order.adminArchived !== true
);

            })
        );


    if (orders.length === 0) {

        container.innerHTML = `

            <div class="no-orders">

                No completed orders.

            </div>

        `;

        return;
    }


    container.innerHTML =
        orders

            .map(order =>
                createOrderCard(order)
            )

            .join("");
}


// ==========================================
// SEARCH ORDERS
// ==========================================

function searchOrders() {

    const searchInput =
        document.getElementById(
            "order-search"
        );

    if (!searchInput) {
        return;
    }


    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    const activeFilter =
        document.querySelector(
            ".order-filter.active"
        );


    const filter =
        activeFilter
            ? activeFilter.dataset.filter
            : "pending";


    const container =
        filter === "completed"

            ? document.getElementById(
                "completed-orders"
            )

            : document.getElementById(
                "pending-orders"
            );


    if (!container) {
        return;
    }


    const cards =
        container.querySelectorAll(
            ".admin-order-card"
        );


    cards.forEach(card => {

        const customer =
            card.dataset.customer || "";

        const orderNumber =
            (
                card.dataset.orderNumber ||
                ""
            ).toLowerCase();


        const matches =
            customer.includes(searchText) ||
            orderNumber.includes(searchText);


        card.style.display =
            matches
                ? ""
                : "none";

    });
}


// ==========================================
// FILTER ORDERS
// ==========================================

function setupOrderFilters() {

    const filterButtons =
        document.querySelectorAll(
            ".order-filter"
        );


    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            async function() {

                filterButtons.forEach(
                    btn => {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                const filter =
                    this.dataset.filter;


                const pendingContainer =
                    document.getElementById(
                        "pending-orders"
                    );

                const completedContainer =
                    document.getElementById(
                        "completed-orders"
                    );


                if (filter === "pending") {

                    if (pendingContainer) {

                        pendingContainer.style.display =
                            "";

                    }

                    if (completedContainer) {

                        completedContainer.style.display =
                            "none";

                    }

                } else {

                    if (pendingContainer) {

                        pendingContainer.style.display =
                            "none";

                    }

                    if (completedContainer) {

                        completedContainer.style.display =
                            "";

                    }

                }


                await renderPendingOrders();

                await renderCompletedOrders();

                searchOrders();

            }
        );

    });


    const searchInput =
        document.getElementById(
            "order-search"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            searchOrders
        );

    }
}


// ==========================================
// COMPLETE ORDER
// ==========================================

// ==========================================
// COMPLETE ORDER
// ==========================================

async function completeOrder(orderId) {

    const confirmComplete =
        await appConfirm(
            "Mark this order as completed?",
            "Complete Order"
        );

    if (!confirmComplete) {
        return;
    }

    try {

        console.log(
            "Attempting to complete order:",
            orderId
        );


        // ==================================
        // CHECK CURRENT AUTH USER
        // ==================================

        const {
            data: authData,
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError) {
            throw authError;
        }


        console.log(
            "CURRENT AUTH USER ID:",
            authData?.user?.id
        );


        // ==================================
        // CHECK ADMIN PROFILE
        // ==================================

        const {
            data: adminProfile,
            error: profileError
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, full_name, username, role"
            )
            .eq(
                "id",
                authData?.user?.id
            )
            .maybeSingle();


        if (profileError) {
            throw profileError;
        }


        console.log(
            "CURRENT ADMIN PROFILE:",
            adminProfile
        );


        // ==================================
        // UPDATE ORDER
        // ==================================

        const {
            data: updatedOrder,
            error: updateError
        } = await supabaseClient
            .from("orders")
            .update({
                status: "Completed"
            })
            .eq("id", orderId)
            .select(
                "id, order_number, status"
            );


        console.log(
            "UPDATED ORDER:",
            updatedOrder
        );


        console.log(
            "UPDATE ERROR:",
            updateError
        );


        if (updateError) {
            throw updateError;
        }


        // ==================================
        // VERIFY UPDATE
        // ==================================

        if (
            !updatedOrder ||
            updatedOrder.length === 0
        ) {

            throw new Error(
                "No order was updated. The admin UPDATE permission in Supabase is blocking this operation."
            );

        }


        // ==================================
        // SUCCESS
        // ==================================

        console.log(
            "ORDER COMPLETED SUCCESSFULLY:",
            updatedOrder
        );


        await refreshAdminDashboard();


        await appAlert(
            "Order marked as completed.",
            "Order Completed"
        );


    } catch (error) {

        console.error(
            "COMPLETE ORDER ERROR:",
            error
        );


        await appAlert(
            "Unable to complete the order.\n\n" +
            error.message,
            "Complete Order"
        );

    }
}


// ==========================================
// CLEAR COMPLETED ORDERS
// ARCHIVE FOR ADMIN ONLY
// ==========================================

async function clearCompletedOrders() {

    /*
     * GET ALL ORDERS
     */

    const orders =
        await getOrders();


    /*
     * FIND COMPLETED ORDERS
     * THAT ARE NOT YET ARCHIVED
     */

    const completedOrders =
        orders.filter(order => {

            const status =
                String(
                    order.status || ""
                )
                .trim()
                .toLowerCase();

            return (
                status === "completed" &&
                order.adminArchived !== true
            );

        });


    /*
     * NO COMPLETED ORDERS
     */

    if (completedOrders.length === 0) {

        await appAlert(
            "There are no completed orders to clear.",
            "No Completed Orders"
        );

        return;

    }


    /*
     * CONFIRMATION
     */

    const confirmClear =
        await appConfirm(
            "Are you sure you want to clear all completed orders?\n\n" +
            "The orders will be removed from the Admin Completed Orders list, " +
            "but customer order history will remain.",
            "Clear Completed Orders"
        );


    if (!confirmClear) {

        return;

    }


    try {

        /*
         * GET COMPLETED ORDER IDS
         */

        const completedOrderIds =
            completedOrders.map(
                order => order.id
            );


        console.log(
            "Completed order IDs to archive:",
            completedOrderIds
        );


        /*
         * ==========================================
         * ARCHIVE COMPLETED ORDERS
         * ==========================================
         *
         * IMPORTANT:
         * DO NOT DELETE THE ORDERS.
         *
         * Customer history still needs these records.
         */

        const {
            data: archivedOrders,
            error: archiveError
        } = await supabaseClient

            .from("orders")

            .update({
                admin_archived: true
            })

            .in(
                "id",
                completedOrderIds
            )

            .select(
                "id, order_number, admin_archived"
            );


        if (archiveError) {

            console.error(
                "Error archiving completed orders:",
                archiveError
            );


            await appAlert(
                "Unable to clear completed orders.\n\n" +
                archiveError.message,
                "Archive Failed"
            );


            return;

        }


        /*
         * CHECK IF ORDERS WERE ACTUALLY ARCHIVED
         */

        if (
            !archivedOrders ||
            archivedOrders.length === 0
        ) {

            console.error(
                "No completed orders were archived."
            );


            await appAlert(
                "No completed orders were cleared.\n\n" +
                "Please check the Admin UPDATE permission in Supabase.",
                "Clear Failed"
            );


            return;

        }


        /*
         * SUCCESS
         */

        console.log(
            "Successfully archived completed orders:",
            archivedOrders
        );


        /*
         * REFRESH ADMIN DASHBOARD
         */

        await refreshAdminDashboard();


        /*
         * SHOW SUCCESS MESSAGE
         */

        await appAlert(
            archivedOrders.length +
            " completed order" +
            (
                archivedOrders.length === 1
                    ? ""
                    : "s"
            ) +
            " cleared from the Admin list.",
            "Orders Cleared"
        );


    } catch (error) {

        console.error(
            "Unexpected error clearing completed orders:",
            error
        );


        await appAlert(
            "An unexpected error occurred.\n\n" +
            error.message,
            "Error"
        );

    }

}


// ==========================================
// REFRESH ADMIN DASHBOARD
// ==========================================

async function refreshAdminDashboard() {

    await updateDashboardSummary();

    await renderPendingOrders();

    await renderCompletedOrders();

    searchOrders();

}


// ==========================================
// MAINTENANCE MODE
// ==========================================

async function getMaintenanceStatus() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("app_settings")

            .select("id, maintenance_mode")

            .limit(1)
            .single();


        if (error) {

            console.error(
                "Error checking maintenance status:",
                error
            );

            return false;
        }


        return data?.maintenance_mode === true;

    } catch (error) {

        console.error(
            "Unexpected maintenance error:",
            error
        );

        return false;
    }
}


// ==========================================
// DISPLAY MAINTENANCE STATUS
// ==========================================

function updateMaintenanceUI(isMaintenance) {

    const toggle =
        document.getElementById(
            "maintenance-toggle"
        );


    const status =
        document.getElementById(
            "maintenance-status"
        );


    if (toggle) {

        toggle.checked =
            isMaintenance;

    }


    if (status) {

        status.textContent =
            isMaintenance
                ? "Maintenance Mode is ON. Customers cannot access the store."
                : "Maintenance Mode is OFF. The store is available to customers.";

    }

}


// ==========================================
// LOAD MAINTENANCE STATUS
// ==========================================

async function loadMaintenanceStatus() {

    const isMaintenance =
        await getMaintenanceStatus();


    updateMaintenanceUI(
        isMaintenance
    );

}


// ==========================================
// TOGGLE MAINTENANCE MODE
// ==========================================

async function toggleMaintenanceMode() {

    const toggle =
        document.getElementById(
            "maintenance-toggle"
        );


    if (!toggle) {

        return;

    }


    const newStatus =
        toggle.checked;


    try {

        /*
         * Disable switch while saving
         */

        toggle.disabled = true;


        /*
         * Get settings row
         */

        const {
            data: settings,
            error: settingsError
        } = await supabaseClient

            .from("app_settings")

            .select("id")

            .limit(1)
            .single();


        if (settingsError) {

            console.error(
                "Unable to get maintenance settings:",
                settingsError
            );


            await appAlert(
                "Unable to update Maintenance Mode.\n\n" +
                settingsError.message,
                "Maintenance Mode"
            );


            toggle.checked =
                !newStatus;


            return;

        }


        /*
         * Update maintenance mode
         */

        const {
            data,
            error
        } = await supabaseClient

            .from("app_settings")

            .update({
                maintenance_mode: newStatus,
                updated_at: new Date().toISOString()
            })

            .eq(
                "id",
                settings.id
            )

            .select();


        if (error) {

            console.error(
                "Error updating maintenance mode:",
                error
            );


            await appAlert(
                "Unable to update Maintenance Mode.\n\n" +
                error.message,
                "Maintenance Mode"
            );


            toggle.checked =
                !newStatus;


            return;

        }


        /*
         * Verify update
         */

        if (
            !data ||
            data.length === 0
        ) {

            await appAlert(
                "Maintenance Mode was not updated.",
                "Maintenance Mode"
            );


            toggle.checked =
                !newStatus;


            return;

        }


        /*
         * Update admin display
         */

        updateMaintenanceUI(
            newStatus
        );


        console.log(
            "Maintenance Mode updated:",
            newStatus
        );


    } catch (error) {

        console.error(
            "Unexpected maintenance error:",
            error
        );


        toggle.checked =
            !newStatus;


        await appAlert(
            "An unexpected error occurred.\n\n" +
            error.message,
            "Maintenance Mode"
        );


    } finally {

        toggle.disabled = false;

    }

}


// ==========================================
// MAINTENANCE REALTIME
// ==========================================

let maintenanceRealtimeChannel = null;


function setupMaintenanceRealtime() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client is not available for Maintenance Realtime."
        );

        return;

    }


    if (maintenanceRealtimeChannel) {

        supabaseClient.removeChannel(
            maintenanceRealtimeChannel
        );

    }


    maintenanceRealtimeChannel =
        supabaseClient

            .channel(
                "admin-maintenance-realtime"
            )

            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "app_settings"
                },
                payload => {

                    console.log(
                        "Maintenance Mode Realtime:",
                        payload
                    );


                    const isMaintenance =
                        payload.new?.maintenance_mode === true;


                    updateMaintenanceUI(
                        isMaintenance
                    );

                }
            )

            .subscribe(
                status => {

                    console.log(
                        "Admin Maintenance Realtime:",
                        status
                    );

                }
            );

}


// ==========================================
// INITIALIZE
// ==========================================

async function initializeAdminDashboard() {

    displayAdminName();

    setupOrderFilters();

    await refreshAdminDashboard();

    await loadMaintenanceStatus();

    setupRealtimeOrders();

    setupMaintenanceRealtime();

}


// =========================================================
// CUSTOMER MAINTENANCE MODE
// =========================================================

let customerMaintenanceChannel = null;


// =========================================================
// CHECK MAINTENANCE MODE
// =========================================================

async function checkMaintenanceMode() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        return;

    }


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("app_settings")

            .select("maintenance_mode")

            .limit(1)
            .single();


        if (error) {

            console.error(
                "Error checking Maintenance Mode:",
                error
            );

            return;

        }


        updateCustomerMaintenanceScreen(
            data?.maintenance_mode === true
        );


    } catch (error) {

        console.error(
            "Unexpected Maintenance Mode error:",
            error
        );

    }

}


// =========================================================
// UPDATE CUSTOMER MAINTENANCE SCREEN
// =========================================================

function updateCustomerMaintenanceScreen(
    isMaintenance
) {

    const maintenanceScreen =
        document.getElementById(
            "maintenance-screen"
        );


    if (!maintenanceScreen) {

        return;

    }


    if (isMaintenance) {

        maintenanceScreen.style.display =
            "flex";


        /*
         * Prevent normal app interaction
         */

        document.body.classList.add(
            "maintenance-active"
        );

    } else {

        maintenanceScreen.style.display =
            "none";


        document.body.classList.remove(
            "maintenance-active"
        );

    }

}


// =========================================================
// CUSTOMER MAINTENANCE REALTIME
// =========================================================

function setupCustomerMaintenanceRealtime() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        return;

    }


    if (customerMaintenanceChannel) {

        supabaseClient.removeChannel(
            customerMaintenanceChannel
        );

    }


    customerMaintenanceChannel =
        supabaseClient

            .channel(
                "customer-maintenance-realtime"
            )

            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "app_settings"
                },
                payload => {

                    console.log(
                        "CUSTOMER MAINTENANCE REALTIME:",
                        payload
                    );


                    const isMaintenance =
                        payload.new?.maintenance_mode === true;


                    updateCustomerMaintenanceScreen(
                        isMaintenance
                    );

                }
            )

            .subscribe(
                status => {

                    console.log(
                        "Customer Maintenance Realtime:",
                        status
                    );

                }
            );

}


// =========================================================
// START CUSTOMER MAINTENANCE CHECK
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        await checkMaintenanceMode();

        setupCustomerMaintenanceRealtime();

    }
);


function maintenanceLogout() {

    logoutUser();

    window.location.href =
        "login.html";

}


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await initializeAdminDashboard();

    }
);


// ==========================================
// UPDATE WHEN PAGE GETS FOCUS
// ==========================================

window.addEventListener(
    "focus",
    async function() {

        await refreshAdminDashboard();

    }
);


// ==========================================
// SUPABASE REALTIME - LIVE ORDER UPDATES
// ==========================================

function setupRealtimeOrders() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client is not available for Realtime."
        );

        return;
    }


    supabaseClient

        .channel("admin-orders-realtime")

        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "orders"
            },

            async function(payload) {

                console.log(
                    "🔥 REALTIME ORDER EVENT RECEIVED!"
                );

                console.log(
                    "Event type:",
                    payload.eventType
                );

                console.log(
                    "New order:",
                    payload.new
                );

                console.log(
                    "Old order:",
                    payload.old
                );

                await refreshAdminDashboard();

            }
        )

        .subscribe(function(status) {

            console.log(
                "Admin Orders Realtime:",
                status
            );

        });

}

