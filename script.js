/* =========================================================
   ANONG MERON? - CUSTOMER SCRIPT
   ========================================================= */
/* =========================================================
   ANONG MERON? - APP MODAL
   ========================================================= */

function createAppModal() {

    if (document.getElementById("app-modal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "app-modal";
    modal.className = "app-modal";

    modal.innerHTML = `

        <div class="app-modal-overlay">

            <div class="app-modal-card">

                <div
                    class="app-modal-icon"
                    id="app-modal-icon"
                >
                    !
                </div>

                <h3
                    id="app-modal-title"
                >
                    Anong Meron?
                </h3>

                <p
                    id="app-modal-message"
                ></p>

                <div
                    class="app-modal-buttons"
                    id="app-modal-buttons"
                >

                    <button
                        type="button"
                        class="app-modal-button app-modal-cancel"
                        id="app-modal-cancel"
                    >
                        CANCEL
                    </button>

                    <button
                        type="button"
                        class="app-modal-button app-modal-confirm"
                        id="app-modal-confirm"
                    >
                        OK
                    </button>

                </div>

            </div>

        </div>

    `;

    document.body.appendChild(modal);

}


/* =========================================================
   APP ALERT
   ========================================================= */

function appAlert(
    message,
    title = "Anong Meron?"
) {

    return new Promise(resolve => {

        createAppModal();

        const modal =
            document.getElementById(
                "app-modal"
            );

        const titleElement =
            document.getElementById(
                "app-modal-title"
            );

        const messageElement =
            document.getElementById(
                "app-modal-message"
            );

        const icon =
            document.getElementById(
                "app-modal-icon"
            );

        const buttons =
            document.getElementById(
                "app-modal-buttons"
            );

        const cancelButton =
            document.getElementById(
                "app-modal-cancel"
            );

        const confirmButton =
            document.getElementById(
                "app-modal-confirm"
            );


        titleElement.textContent =
            title;

        messageElement.textContent =
            message;


        icon.textContent =
            "✓";

        icon.className =
            "app-modal-icon success";


        cancelButton.style.display =
            "none";

        confirmButton.style.display =
            "block";


        confirmButton.textContent =
            "OK";


        modal.classList.add(
            "show"
        );


        function closeModal() {

            modal.classList.remove(
                "show"
            );

            confirmButton.removeEventListener(
                "click",
                closeModal
            );

            resolve();

        }


        confirmButton.addEventListener(
            "click",
            closeModal
        );

    });

}


/* =========================================================
   APP CONFIRM
   ========================================================= */

function appConfirm(
    message,
    title = "Please Confirm"
) {

    return new Promise(resolve => {

        createAppModal();

        const modal =
            document.getElementById(
                "app-modal"
            );

        const titleElement =
            document.getElementById(
                "app-modal-title"
            );

        const messageElement =
            document.getElementById(
                "app-modal-message"
            );

        const icon =
            document.getElementById(
                "app-modal-icon"
            );

        const cancelButton =
            document.getElementById(
                "app-modal-cancel"
            );

        const confirmButton =
            document.getElementById(
                "app-modal-confirm"
            );


        titleElement.textContent =
            title;

        messageElement.textContent =
            message;


        icon.textContent =
            "?";

        icon.className =
            "app-modal-icon question";


        cancelButton.style.display =
            "block";

        confirmButton.style.display =
            "block";


        cancelButton.textContent =
            "CANCEL";

        confirmButton.textContent =
            "CONFIRM";


        modal.classList.add(
            "show"
        );


        function closeModal(result) {

            modal.classList.remove(
                "show"
            );

            cancelButton.removeEventListener(
                "click",
                cancelHandler
            );

            confirmButton.removeEventListener(
                "click",
                confirmHandler
            );

            resolve(result);

        }


        function cancelHandler() {

            closeModal(false);

        }


        function confirmHandler() {

            closeModal(true);

        }


        cancelButton.addEventListener(
            "click",
            cancelHandler
        );

        confirmButton.addEventListener(
            "click",
            confirmHandler
        );

    });

}
let cart = [];

/*
 * CHECKOUT LOCK
 *
 * false = customer can still buy products
 * true  = customer is currently at checkout
 *
 * IMPORTANT:
 * Opening CART does NOT lock buying.
 * Opening CHECKOUT locks buying.
 */
let checkoutLocked = false;


/* =========================================================
   GET CUSTOMER MENU ITEMS FROM SUPABASE
   ========================================================= */



async function getAdminMenuItems() {

    try {

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            console.error(
                "Supabase client is not available."
            );

            return [];

        }


        const {
            data,
            error
        } = await supabaseClient

            .from("products")

            .select(
                "id, name, category, price, description, image_url, available, created_at"
            )

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Error loading products from Supabase:",
                error
            );

            return [];

        }


        console.log(
            "PRODUCTS FROM SUPABASE:",
            data
        );


        if (!Array.isArray(data)) {

            return [];

        }


        return data.map(
            item => ({

                id:
                    item.id,

                name:
                    item.name,

                category:
                    item.category,

                price:
                    Number(item.price) || 0,

                description:
                    item.description || "",

                image:
                    item.image_url || "",

                available:
                    item.available === true

            })
        );


    } catch (error) {

        console.error(
            "Unexpected error loading customer menu:",
            error
        );

        return [];

    }

}






/* =========================================================
   QUANTITY FUNCTIONS
   ========================================================= */

function changeQuantity(productId, amount) {

    const input =
        document.getElementById(productId);

    if (!input) {
        return;
    }

    let value =
        parseInt(input.value) || 1;

    value += amount;

    if (value < 1) {
        value = 1;
    }

    input.value = value;

}


function changeQty(button, amount) {

    /*
     * DO NOT ALLOW PRODUCT QUANTITY
     * CHANGES WHEN CHECKOUT IS ACTIVE.
     */

    if (checkoutLocked) {

        appAlert(
            "You are currently at checkout. Please tap ORDER MORE first before adding another product."
        );

        return;

    }


    const container =
        button.closest(".quantity-control");

    if (!container) {
        return;
    }

    const input =
        container.querySelector("input");

    if (!input) {
        return;
    }

    let value =
        parseInt(input.value) || 1;

    value += amount;

    if (value < 1) {
        value = 1;
    }

    input.value = value;

}


/* =========================================================
   UPDATE BUY BUTTON STATE
   ========================================================= */

function updateBuyButtonState() {

    const buyButtons =
        document.querySelectorAll(
            ".buy-button:not(.sold-out)"
        );


    buyButtons.forEach(
        button => {

            /*
             * LOCK BUY BUTTONS ONLY
             * WHEN CHECKOUT IS ACTIVE.
             */

            button.disabled =
                checkoutLocked;

            if (checkoutLocked) {

                button.classList.add(
                    "buy-locked"
                );

                button.setAttribute(
                    "title",
                    "Please tap ORDER MORE first."
                );

            } else {

                button.classList.remove(
                    "buy-locked"
                );

                button.removeAttribute(
                    "title"
                );

            }

        }
    );


    const quantityButtons =
        document.querySelectorAll(
            ".product-card .quantity-control button"
        );


    quantityButtons.forEach(
        button => {

            button.disabled =
                checkoutLocked;

        }
    );

}


/* =========================================================
   BUY PRODUCT
   ========================================================= */

function buyProduct(
    productName,
    price,
    productId
) {

    /*
     * CHECKOUT LOCK
     */

    if (checkoutLocked) {

        appAlert(
            "You are currently at checkout. Please tap ORDER MORE first before adding another product."
        );

        return;

    }


    let selectedQuantity = 1;

    const quantityInput =
        document.getElementById(
            `qty-${productId}`
        );

    if (quantityInput) {

        selectedQuantity =
            parseInt(
                quantityInput.value
            ) || 1;

    }


    addToCart(
        productName,
        Number(price),
        selectedQuantity,
        productId
    );

}


/* =========================================================
   ADD TO CART
   ========================================================= */

function addToCart(
    productName,
    price,
    quantity = 1,
    productId = null
) {

    /*
     * CHECKOUT LOCK
     */

    if (checkoutLocked) {

        appAlert(
            "You are currently at checkout. Please tap ORDER MORE first before adding another product."
        );

        return;

    }


    const finalProductId =
        productId ||
        Date.now().toString();


    /*
     * CHECK DUPLICATE PRODUCT
     *
     * IMPORTANT:
     * If the product is already in the cart,
     * DO NOT add another item.
     *
     * DO NOT increase the quantity automatically.
     *
     * Customer must adjust the quantity
     * from the Cart using + / -.
     */

    const existingItem =
        cart.find(
            item =>
                String(item.productId) ===
                String(finalProductId)
        );


    if (existingItem) {

        appAlert(
            `${productName} is already in your cart. Please adjust the quantity in your cart.`
        );

        /*
         * Reset the product quantity selector
         * back to 1.
         */

        const existingQuantityInput =
            document.getElementById(
                `qty-${finalProductId}`
            );

        if (existingQuantityInput) {

            existingQuantityInput.value =
                1;

        }

        return;

    }


    /*
     * ADD NEW PRODUCT
     */

    cart.push({

        productId:
            finalProductId,

        name:
            productName,

        price:
            Number(price),

        quantity:
            Number(quantity) || 1

    });


    /*
     * UPDATE CART
     */

    updateCartCount();

    renderCart();

    renderCheckout();


    /*
     * RESET PRODUCT QUANTITY
     */

    const quantityInput =
        document.getElementById(
            `qty-${finalProductId}`
        );

    if (quantityInput) {

        quantityInput.value = 1;

    }


    /*
     * KEEP BUY BUTTONS ENABLED
     *
     * Customer is still browsing.
     */

    updateBuyButtonState();


    appAlert(
        `${productName} added to your cart.`
    );

}


/* =========================================================
   UPDATE CART COUNT
   ========================================================= */

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cart-count"
        );

    if (!cartCount) {
        return;
    }


    const totalQuantity =
        cart.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );


    cartCount.textContent =
        totalQuantity;

}


/* =========================================================
   SHOW CART
   ========================================================= */

function showCart() {

    const cartSection =
        document.getElementById(
            "cart-section"
        );

    const checkoutSection =
        document.getElementById(
            "checkout-section"
        );

    const confirmationSection =
        document.getElementById(
            "confirmation-section"
        );

    const historySection =
        document.getElementById(
            "order-history-section"
        );


    /*
     * HIDE OTHER SECTIONS
     */

    if (checkoutSection) {

        checkoutSection.style.display =
            "none";

    }


    if (confirmationSection) {

        confirmationSection.style.display =
            "none";

    }


    if (historySection) {

        historySection.style.display =
            "none";

    }


    /*
     * IF CART IS EMPTY
     */

    if (cart.length === 0) {

        if (cartSection) {

            cartSection.style.display =
                "none";

        }

        updateCartCount();

        checkoutLocked = false;

        updateBuyButtonState();

        goToHome();

        return;

    }


    /*
     * SHOW CART
     *
     * IMPORTANT:
     * Opening CART does NOT lock buying.
     */

    if (cartSection) {

        cartSection.style.display =
            "block";

    }


    updateCartCount();

    renderCart();

    updateBuyButtonState();


    if (cartSection) {

        cartSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }

}


/* =========================================================
   RENDER CART
   ========================================================= */

function renderCart() {

    const cartSection =
        document.getElementById(
            "cart-section"
        );

    const cartItems =
        document.getElementById(
            "cart-items"
        );

    const cartContent =
        document.getElementById(
            "cart-content"
        );

    const cartSummary =
        document.querySelector(
            "#cart-section .cart-summary"
        );

    const cartTotal =
        document.getElementById(
            "cart-total"
        );

    const checkoutButton =
        document.querySelector(
            "#cart-section .checkout-button"
        );


    if (!cartItems) {
        return;
    }


    /*
     * EMPTY CART
     */

    if (cart.length === 0) {

        cartItems.innerHTML = "";


        if (cartSummary) {

            cartSummary.style.display =
                "none";

        }


        if (checkoutButton) {

            checkoutButton.style.display =
                "none";

        }


        if (cartTotal) {

            cartTotal.textContent =
                "₱0.00";

        }


        if (cartContent) {

            cartContent.style.display =
                "block";

        }


        /*
         * CART IS EMPTY
         *
         * Hide Cart section.
         */

        if (cartSection) {

            cartSection.style.display =
                "none";

        }

        return;

    }


    /*
     * CART HAS ITEMS
     */

    if (cartSection) {

        cartSection.style.display =
            "block";

    }


    if (cartSummary) {

        cartSummary.style.display =
            "flex";

    }


    if (checkoutButton) {

        checkoutButton.style.display =
            "block";

    }


    let total = 0;

    cartItems.innerHTML = "";


    /*
     * DISPLAY CART ITEMS
     */

    cart.forEach(
        (item, index) => {

            const subtotal =
                Number(item.price) *
                Number(item.quantity);

            total += subtotal;


            const cartItem =
                document.createElement(
                    "div"
                );


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div class="cart-item-info">

                    <strong>
                        ${escapeHTML(item.name)}
                    </strong>

                    <span>
                        ₱${Number(item.price).toFixed(2)}
                        each
                    </span>

                </div>


                <div class="cart-item-controls">

                    <button
                        type="button"
                        onclick="updateCartItemQuantity(${index}, -1)"
                    >
                        −
                    </button>

                    <span>
                        ${Number(item.quantity)}
                    </span>

                    <button
                        type="button"
                        onclick="updateCartItemQuantity(${index}, 1)"
                    >
                        +
                    </button>

                </div>


                <div class="cart-item-subtotal">

                    ₱${subtotal.toFixed(2)}

                </div>


                <button
                    type="button"
                    class="remove-cart-item"
                    onclick="removeCartItem(${index})"
                >
                    ✕
                </button>

            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    if (cartTotal) {

        cartTotal.textContent =
            `₱${total.toFixed(2)}`;

    }

}


/* =========================================================
   UPDATE CART ITEM QUANTITY
   ========================================================= */

function updateCartItemQuantity(
    index,
    amount
) {

    if (!cart[index]) {
        return;
    }


    /*
     * Cart quantity can only be changed
     * while not locked.
     *
     * This means:
     * - Customer can adjust Cart normally.
     * - Once Checkout is active, Cart is locked.
     */

    if (checkoutLocked) {

        appAlert(
            "You are currently at checkout. Please tap ORDER MORE first."
        );

        return;

    }


    cart[index].quantity =
        Number(
            cart[index].quantity
        ) +
        Number(amount);


    /*
     * Remove item when quantity
     * reaches zero.
     */

    if (
        cart[index].quantity <= 0
    ) {

        cart.splice(
            index,
            1
        );

    }


    updateCartCount();

    renderCart();

    renderCheckout();

    updateBuyButtonState();


    /*
     * IF CART IS EMPTY
     */

    if (cart.length === 0) {

        checkoutLocked = false;

        hideSecondarySections();

        goToHome();

    }

}


/* =========================================================
   REMOVE CART ITEM
   ========================================================= */

function removeCartItem(index) {

    if (!cart[index]) {
        return;
    }


    /*
     * Cart can only be edited while
     * checkout is not active.
     */

    if (checkoutLocked) {

        appAlert(
            "You are currently at checkout. Please tap ORDER MORE first."
        );

        return;

    }


    cart.splice(
        index,
        1
    );


    updateCartCount();

    renderCart();

    renderCheckout();

    updateBuyButtonState();


    /*
     * IF NOTHING IS LEFT
     */

    if (cart.length === 0) {

        checkoutLocked = false;

        hideSecondarySections();

        goToHome();

    }

}


/* =========================================================
   SHOW CHECKOUT
   ========================================================= */

function showCheckout() {

    if (cart.length === 0) {

        appAlert(
            "Your cart is empty. Please add a product first."
        );

        return;

    }


    /*
     * GET CURRENT LOGGED-IN CUSTOMER
     */

    const currentUser =
        typeof getCurrentUser === "function"
            ? getCurrentUser()
            : null;


    /*
     * IF THERE IS NO LOGGED-IN USER,
     * RETURN TO LOGIN.
     */

    if (!currentUser) {

        appAlert(
            "Your session has expired. Please login again."
        );

        window.location.href =
            "login.html";

        return;

    }


    /*
     * CHECKOUT LOCK
     */

    checkoutLocked = true;

    updateBuyButtonState();


    /*
     * GET CHECKOUT FIELDS
     */

    const employeeNameInput =
        document.getElementById(
            "checkout-name"
        );


    const departmentInput =
        document.getElementById(
            "checkout-department"
        );


    /*
     * AUTOMATICALLY FILL EMPLOYEE NAME
     */

    if (employeeNameInput) {

        employeeNameInput.value =
            currentUser.fullName ||
            currentUser.username ||
            "";

    }


    /*
     * AUTOMATICALLY FILL DEPARTMENT
     */

    if (departmentInput) {

        departmentInput.value =
            currentUser.department ||
            "";

    }


    /*
     * GET SECTIONS
     */

    const cartSection =
        document.getElementById(
            "cart-section"
        );

    const checkoutSection =
        document.getElementById(
            "checkout-section"
        );

    const confirmationSection =
        document.getElementById(
            "confirmation-section"
        );

    const historySection =
        document.getElementById(
            "order-history-section"
        );


    /*
     * HIDE CART
     */

    if (cartSection) {

        cartSection.style.display =
            "none";

    }


    /*
     * SHOW CHECKOUT
     */

    if (checkoutSection) {

        checkoutSection.style.display =
            "block";

    }


    /*
     * HIDE OTHER SECTIONS
     */

    if (confirmationSection) {

        confirmationSection.style.display =
            "none";

    }


    if (historySection) {

        historySection.style.display =
            "none";

    }


    /*
     * SHOW ORDER MORE BUTTON
     */

    const orderMoreButton =
        document.querySelector(
            "#checkout-section .order-more-button"
        );


    if (orderMoreButton) {

        orderMoreButton.style.display =
            "block";

    }


    /*
     * RENDER ORDER ITEMS
     */

    renderCheckout();


    /*
     * SCROLL TO CHECKOUT
     */

    if (checkoutSection) {

        checkoutSection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


/* =========================================================
   ORDER MORE
   ========================================================= */

function orderMore() {

    /*
     * DO NOT CLEAR THE CART.
     *
     * Existing products remain.
     */

    if (cart.length === 0) {

        checkoutLocked = false;

        hideSecondarySections();

        goToHome();

        return;

    }


    /*
     * UNLOCK BUYING
     */

    checkoutLocked = false;

    updateBuyButtonState();


    /*
     * HIDE CHECKOUT / CART / HISTORY
     */

    hideSecondarySections();


    /*
     * SHOW HOME / PRODUCT MENU
     *
     * Existing cart is preserved.
     */

    showCategory(
        "all",
        document.querySelector(
            ".category.active"
        )
    );


    /*
     * HOME NAVIGATION STATE
     */

    const homeButton =
        document.getElementById(
            "home-nav-button"
        );

    const historyButton =
        document.getElementById(
            "history-nav-button"
        );


    if (homeButton) {

        homeButton.classList.add(
            "active"
        );

    }


    if (historyButton) {

        historyButton.classList.remove(
            "active"
        );

    }


    updateCartCount();

    updateBuyButtonState();


    /*
     * RETURN TO TOP
     */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   RENDER CHECKOUT
   ========================================================= */

function renderCheckout() {

    const checkoutItems =
        document.getElementById(
            "checkout-items"
        );

    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    if (!checkoutItems) {
        return;
    }


    let total = 0;

    checkoutItems.innerHTML = "";


    cart.forEach(
        item => {

            const subtotal =
                Number(item.price) *
                Number(item.quantity);

            total += subtotal;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "checkout-item";


            row.innerHTML = `

                <span>

                    ${escapeHTML(item.name)}

                    × ${Number(item.quantity)}

                </span>

                <strong>

                    ₱${subtotal.toFixed(2)}

                </strong>

            `;


            checkoutItems.appendChild(
                row
            );

        }
    );


    if (checkoutTotal) {

        checkoutTotal.textContent =
            `₱${total.toFixed(2)}`;

    }

}


/* =========================================================
   PLACE ORDER
   ========================================================= */

/* =========================================================
   PLACE ORDER
   ========================================================= */



async function placeOrder() {

    /* =====================================================
       VALIDATE CART
    ===================================================== */

    if (!Array.isArray(cart) || cart.length === 0) {

        await appAlert(
            "Your cart is empty.",
            "Empty Cart"
        );

        return;
    }


    /* =====================================================
       GET CURRENT USER
    ===================================================== */

    const currentUser =
        typeof getCurrentUser === "function"
            ? getCurrentUser()
            : null;


    if (!currentUser) {

        await appAlert(
            "Please login first.",
            "Login Required"
        );

        return;
    }


    /* =====================================================
       GET PAYMENT METHOD
       Uses the actual HTML element:
       #payment-method
    ===================================================== */

    const paymentElement =
        document.getElementById("payment-method");


    const payment =
        paymentElement
            ? paymentElement.value
            : "";


    if (!payment) {

        await appAlert(
            "Please select a payment method.",
            "Payment Required"
        );

        return;
    }


    /* =====================================================
       CHECK SUPABASE
    ===================================================== */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        await appAlert(
            "Supabase is not available.",
            "Error"
        );

        return;
    }


    /* =====================================================
       CUSTOMER INFORMATION
    ===================================================== */

    const employeeName =
        currentUser.fullName ||
        currentUser.username ||
        "";


    const department =
        currentUser.department ||
        "";


    /* =====================================================
       SAVE CART BEFORE ANYTHING CLEARS IT
       This is important for confirmation display.
    ===================================================== */

    const orderedItems =
        cart.map(item => ({
            productId:
                item.productId ||
                item.id,

            name:
                item.name,

            price:
                Number(item.price) || 0,

            quantity:
                Number(item.quantity) || 0,

            subtotal:
                (
                    Number(item.price) || 0
                ) *
                (
                    Number(item.quantity) || 0
                )
        }));


    /* =====================================================
       CALCULATE TOTAL
    ===================================================== */

    const total =
        orderedItems.reduce(
            (sum, item) =>
                sum + item.subtotal,
            0
        );


    /* =====================================================
       DISABLE PLACE ORDER BUTTON
    ===================================================== */

    const placeOrderButton =
        document.querySelector(
            "#place-order-button"
        ) ||
        document.querySelector(
            ".place-order-button"
        ) ||
        document.querySelector(
            'button[onclick="placeOrder()"]'
        );


    if (placeOrderButton) {

        placeOrderButton.disabled = true;

        placeOrderButton.textContent =
            "Placing Order...";

    }


    try {

        /* =================================================
           GET AUTH USER
        ================================================= */

        const {
            data: {
                user: authUser
            },
            error: authError
        } =
            await supabaseClient.auth.getUser();


        if (
            authError ||
            !authUser
        ) {

            throw new Error(
                "Your login session has expired. Please login again."
            );
        }


        /* =================================================
           GENERATE RANDOM 4-DIGIT ORDER NUMBER
        ================================================= */

        let orderNumber = null;


        for (
            let attempt = 0;
            attempt < 20;
            attempt++
        ) {

            const randomNumber =
                Math.floor(
                    1000 +
                    Math.random() * 9000
                );


            const {
                data: existingPending,
                error: checkError
            } =
                await supabaseClient
                    .from("orders")
                    .select("id")
                    .eq(
                        "order_number",
                        randomNumber
                    )
                    .eq(
                        "status",
                        "Pending"
                    )
                    .limit(1);


            if (checkError) {

                console.error(
                    "Error checking order number:",
                    checkError
                );

                throw checkError;
            }


            if (
                !existingPending ||
                existingPending.length === 0
            ) {

                orderNumber =
                    randomNumber;

                break;
            }
        }


        if (!orderNumber) {

            throw new Error(
                "Unable to generate a unique order number."
            );
        }


        /* =================================================
           CREATE ORDER
        ================================================= */

        const {
            data: orderData,
            error: orderError
        } =
            await supabaseClient
                .from("orders")
                .insert([
                    {
                        order_number:
                            orderNumber,

                        user_id:
                            authUser.id,

                        employee_name:
                            employeeName,

                        department:
                            department,

                        payment:
                            payment,

                        total:
                            total,

                        status:
                            "Pending"
                    }
                ])
                .select()
                .single();


        if (orderError) {

            console.error(
                "Error creating order:",
                orderError
            );

            throw orderError;
        }


        /* =================================================
           CREATE ORDER ITEMS
        ================================================= */

        const orderItems =
            orderedItems.map(item => ({
                order_id:
                    orderData.id,

                product_id:
                    item.productId,

                product_name:
                    item.name,

                price:
                    item.price,

                quantity:
                    item.quantity,

                subtotal:
                    item.subtotal
            }));


        const {
            error: itemsError
        } =
            await supabaseClient
                .from("order_items")
                .insert(orderItems);


        if (itemsError) {

            console.error(
                "Error creating order items:",
                itemsError
            );


            /* Remove incomplete order */

            await supabaseClient
                .from("orders")
                .delete()
                .eq(
                    "id",
                    orderData.id
                );


            throw itemsError;
        }


        /* =================================================
           SAVE UPDATE FLAG
        ================================================= */

        localStorage.setItem(
            "ordersUpdated",
            Date.now().toString()
        );


        /* =================================================
           GET CONFIRMED ORDER NUMBER
           DIRECTLY FROM SUPABASE
        ================================================= */

        const confirmedOrderNumber =
            orderData.order_number;


        /* =================================================
           SHOW CONFIRMATION
        ================================================= */

        const cartSection =
            document.getElementById(
                "cart-section"
            );


        const checkoutSection =
            document.getElementById(
                "checkout-section"
            );


        const confirmationSection =
            document.getElementById(
                "confirmation-section"
            );


        const orderHistorySection =
            document.getElementById(
                "order-history-section"
            );


        if (cartSection) {

            cartSection.style.display =
                "none";

        }


        if (checkoutSection) {

            checkoutSection.style.display =
                "none";

        }


        if (orderHistorySection) {

            orderHistorySection.style.display =
                "none";

        }


        if (confirmationSection) {

            confirmationSection.style.display =
                "block";

        }


        /* =================================================
           ORDER NUMBER
        ================================================= */

        const confirmationOrderNumber =
            document.getElementById(
                "order-number"
            );


        if (confirmationOrderNumber) {

            confirmationOrderNumber.textContent =
                String(
                    confirmedOrderNumber
                );

        }


        /* =================================================
           EMPLOYEE
        ================================================= */

        const confirmationName =
            document.getElementById(
                "confirm-name"
            );


        if (confirmationName) {

            confirmationName.textContent =
                employeeName;

        }


        /* =================================================
           DEPARTMENT
        ================================================= */

        const confirmationDepartment =
            document.getElementById(
                "confirm-department"
            );


        if (confirmationDepartment) {

            confirmationDepartment.textContent =
                department;

        }


        /* =================================================
           PAYMENT
        ================================================= */

        const confirmationPayment =
            document.getElementById(
                "confirm-payment"
            );


        if (confirmationPayment) {

            confirmationPayment.textContent =
                payment;

        }


        /* =================================================
           TOTAL
        ================================================= */

        const confirmationTotal =
            document.getElementById(
                "confirm-total"
            );


        if (confirmationTotal) {

            confirmationTotal.textContent =
                `₱${total.toFixed(2)}`;

        }


        /* =================================================
           ORDERED ITEMS
        ================================================= */

        const confirmationItems =
            document.getElementById(
                "confirmation-items"
            );


        if (confirmationItems) {

            confirmationItems.innerHTML =
                orderedItems
                    .map(item => {

                        return `
                            <div class="confirmation-item">

                                <div class="confirmation-item-info">

                                    <strong>
                                        ${item.name}
                                    </strong>

                                    <span>
                                        ${item.quantity}
                                        ×
                                        ₱${item.price.toFixed(2)}
                                    </span>

                                </div>

                                <strong>
                                    ₱${item.subtotal.toFixed(2)}
                                </strong>

                            </div>
                        `;

                    })
                    .join("");

        }


        /* =================================================
           CLEAR CART ONLY AFTER CONFIRMATION IS PREPARED
        ================================================= */

        cart = [];

        checkoutLocked = false;


        /* =================================================
           UPDATE CART COUNT
        ================================================= */

        updateCartCount();


        /* =================================================
           RESET PAYMENT
        ================================================= */

        if (paymentElement) {

            paymentElement.value = "";

        }


        /* =================================================
           RESTORE BUTTON
        ================================================= */

        if (placeOrderButton) {

            placeOrderButton.disabled =
                false;

            placeOrderButton.textContent =
                "Place Order";

        }


        /* =================================================
           SCROLL TO CONFIRMATION
        ================================================= */

        if (confirmationSection) {

            confirmationSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }


    } catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );


        await appAlert(
            "Something went wrong while placing your order. Please try again.",
            "Order Failed"
        );


        if (placeOrderButton) {

            placeOrderButton.disabled =
                false;

            placeOrderButton.textContent =
                "Place Order";

        }

    }

}





/* =========================================================
   BACK TO HOME
   ========================================================= */

function backToHome() {

    checkoutLocked = false;

    updateBuyButtonState();

    hideSecondarySections();

    goToHome();

}


/* =========================================================
   GO TO HOME
   ========================================================= */

function goToHome() {

    /*
     * HOME SHOULD HIDE
     * CART / CHECKOUT / CONFIRMATION /
     * HISTORY SECTIONS.
     *
     * IMPORTANT:
     * This function does NOT automatically
     * unlock checkout.
     */

    const cartSection =
        document.getElementById(
            "cart-section"
        );

    const checkoutSection =
        document.getElementById(
            "checkout-section"
        );

    const confirmationSection =
        document.getElementById(
            "confirmation-section"
        );

    const historySection =
        document.getElementById(
            "order-history-section"
        );


    if (cartSection) {

        cartSection.style.display =
            "none";

    }


    if (checkoutSection) {

        checkoutSection.style.display =
            "none";

    }


    if (confirmationSection) {

        confirmationSection.style.display =
            "none";

    }


    if (historySection) {

        historySection.style.display =
            "none";

    }


    showCategory(
        "all",
        document.querySelector(
            ".category.active"
        )
    );


    updateBuyButtonState();


    const homeButton =
        document.getElementById(
            "home-nav-button"
        );

    const historyButton =
        document.getElementById(
            "history-nav-button"
        );


    if (homeButton) {

        homeButton.classList.add(
            "active"
        );

    }


    if (historyButton) {

        historyButton.classList.remove(
            "active"
        );

    }


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================================
   HIDE SECONDARY SECTIONS
   ========================================================= */

function hideSecondarySections() {

    const cartSection =
        document.getElementById(
            "cart-section"
        );

    const checkoutSection =
        document.getElementById(
            "checkout-section"
        );

    const confirmationSection =
        document.getElementById(
            "confirmation-section"
        );

    const historySection =
        document.getElementById(
            "order-history-section"
        );


    if (cartSection) {

        cartSection.style.display =
            "none";

    }


    if (checkoutSection) {

        checkoutSection.style.display =
            "none";

    }


    if (confirmationSection) {

        confirmationSection.style.display =
            "none";

    }


    if (historySection) {

        historySection.style.display =
            "none";

    }

}


/* =========================================================
   CATEGORY SYSTEM
   ========================================================= */

const categoryIds = {

    almusal:
        "category-almusal",

    meryenda:
        "category-meryenda",

    ulam:
        "category-ulam",

    desserts:
        "category-desserts",

    others:
        "category-others"

};


/* =========================================================
   NORMALIZE CATEGORY
   ========================================================= */

function normalizeCategory(value) {

    const category =
        String(value || "")
            .toLowerCase()
            .trim();


    if (
        category === "almusal" ||
        category === "breakfast"
    ) {

        return "almusal";

    }


    if (
        category === "meryenda" ||
        category === "merienda" ||
        category === "snacks" ||
        category === "snack"
    ) {

        return "meryenda";

    }


    if (
        category === "ulam" ||
        category === "viand" ||
        category === "viands"
    ) {

        return "ulam";

    }


    if (
        category === "desserts" ||
        category === "dessert"
    ) {

        return "desserts";

    }


    if (
        category === "others" ||
        category === "other"
    ) {

        return "others";

    }


    return "others";

}


/* =========================================================
   SHOW CATEGORY
   ========================================================= */

function showCategory(
    category,
    button
) {

    const sections =
        document.querySelectorAll(
            ".category-section"
        );


    sections.forEach(
        section => {

            section.style.display =
                "none";

        }
    );


    if (category === "all") {

        sections.forEach(
            section => {

                section.style.display =
                    "block";

            }
        );

    } else {

        const sectionId =
            categoryIds[category];


        if (sectionId) {

            const selectedSection =
                document.getElementById(
                    sectionId
                );


            if (selectedSection) {

                selectedSection.style.display =
                    "block";

            }

        }

    }


    document
        .querySelectorAll(
            ".category"
        )
        .forEach(
            categoryButton => {

                categoryButton.classList.remove(
                    "active"
                );

            }
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    updateBuyButtonState();

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   ESCAPE TEXT FOR INLINE JAVASCRIPT
   ========================================================= */

function escapeQuotes(text) {

    return String(text ?? "")

        .replace(
            /\\/g,
            "\\\\"
        )

        .replace(
            /'/g,
            "\\'"
        );

}


/* =========================================================
   GET CATEGORY CONTAINER
   ========================================================= */

function getCategoryContainer(
    category
) {

    const sectionId =
        categoryIds[category];


    if (!sectionId) {
        return null;
    }


    const section =
        document.getElementById(
            sectionId
        );


    if (!section) {
        return null;
    }


    return section.querySelector(
        ".products"
    );

}


/* =========================================================
   CREATE ADMIN PRODUCT CARD
   ========================================================= */

function createAdminProductCard(
    item
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "product-card admin-generated-product";


    const productId =
        String(
            item.id ||
            item._id ||
            Date.now()
        ).replace(
            /[^a-zA-Z0-9_-]/g,
            ""
        );


    const productName =
        item.name ||
        "Unnamed Product";


    const price =
        Number(item.price) || 0;


    const description =
        item.description ||
        "";


    const image =
        item.image ||
        "images/default-food.png";


    const available =
        item.available !== false;


    const displayName =
        escapeHTML(
            productName
        );


    const displayDescription =
        escapeHTML(
            description
        );


    const displayImage =
        escapeHTML(
            image
        );


    const javascriptName =
        escapeQuotes(
            productName
        );


    card.innerHTML = `

        <div class="product-image-wrapper">

    <img
        class="product-image ${
            available ? "" : "product-unavailable-image"
        }"
        src="${displayImage}"
        alt="${displayName}"
        loading="lazy"
        onerror="
            this.onerror=null;
            this.src='images/default-food.png';
        "
    >

    ${
        !available
            ? `
                <div class="unavailable-overlay">
                    <span>UNAVAILABLE</span>
                </div>
            `
            : ""
    }

</div>


        <div class="product-info">

            <h3>
                ${displayName}
            </h3>


            ${
                displayDescription
                    ? `

                        <p class="product-description">

                            ${displayDescription}

                        </p>

                    `
                    : ""
            }


            <div class="product-bottom">

                <strong class="product-price">

                    ₱${price.toFixed(2)}

                </strong>


                ${
                    available
                        ? `

                            <div class="product-actions">

                                <div class="quantity-control">

                                    <button
                                        type="button"
                                        onclick="changeQty(this, -1)"
                                    >
                                        −
                                    </button>


                                    <input
                                        type="number"
                                        id="qty-${productId}"
                                        value="1"
                                        min="1"
                                        readonly
                                    >


                                    <button
                                        type="button"
                                        onclick="changeQty(this, 1)"
                                    >
                                        +
                                    </button>

                                </div>


                                <button
                                    type="button"
                                    class="buy-button"
                                    onclick="
                                        buyProduct(
                                            '${javascriptName}',
                                            ${price},
                                            '${productId}'
                                        )
                                    "
                                >

                                    BUY

                                </button>

                            </div>

                        `
                        : `

                            <button
                                type="button"
                                class="buy-button sold-out"
                                disabled
                            >

                                Unavailable

                            </button>

                        `
                }

            </div>

        </div>

    `;


    return card;

}


/* =========================================================
   SHOW EMPTY CATEGORY MESSAGE
   ========================================================= */

function showEmptyMessage(
    container,
    message
) {

    if (!container) {
        return;
    }


    const emptyMessage =
        document.createElement(
            "div"
        );


    emptyMessage.className =
        "empty-category";


    emptyMessage.innerHTML = `

        <p>

            ${escapeHTML(message)}

        </p>

    `;


    container.appendChild(
        emptyMessage
    );

}


/* =========================================================
   SYNC CUSTOMER MENU FROM SUPABASE
   ========================================================= */


async function syncCustomerMenu() {

    console.log(
        "========== CUSTOMER MENU SYNC =========="
    );


    /*
     * GET PRODUCTS FROM SUPABASE
     */

    const menuItems =
        await getAdminMenuItems();


    console.log(
        "MENU ITEMS RECEIVED:",
        menuItems
    );


    const containers = {};


    /*
     * GET ALL CATEGORY CONTAINERS
     */

    Object.keys(categoryIds)
        .forEach(
            category => {

                containers[category] =
                    getCategoryContainer(
                        category
                    );


                console.log(
                    "CATEGORY CONTAINER:",
                    category,
                    containers[category]
                );

            }
        );


    /*
     * CLEAR CURRENT CUSTOMER PRODUCTS
     */

    Object.values(containers)
        .forEach(
            container => {

                if (container) {

                    container.innerHTML =
                        "";

                }

            }
        );


    /*
     * ADD SUPABASE PRODUCTS
     */

    menuItems.forEach(
        item => {

            console.log(
                "PROCESSING PRODUCT:",
                item.name,
                "| CATEGORY:",
                item.category
            );


            const category =
                normalizeCategory(
                    item.category
                );


            console.log(
                "NORMALIZED CATEGORY:",
                category
            );


            const container =
                containers[category];


            if (!container) {

                console.error(
                    "NO CONTAINER FOUND FOR:",
                    category
                );

                return;

            }


            const card =
                createAdminProductCard(
                    item
                );


            container.appendChild(
                card
            );


            console.log(
                "PRODUCT ADDED TO CATEGORY:",
                item.name,
                "→",
                category
            );

        }
    );


    /*
     * EMPTY CATEGORY MESSAGES
     */

    const emptyMessages = {

        almusal:
            "There are no products available in this category yet.",

        meryenda:
            "There are no products available in this category yet.",

        ulam:
            "There are no ulam available today.",

        desserts:
            "There are no desserts available today.",

        others:
            "There are no products available in this category yet."

    };


    Object.keys(containers)
        .forEach(
            category => {

                const container =
                    containers[category];


                if (!container) {
                    return;
                }


                const products =
                    container.querySelectorAll(
                        ".product-card"
                    );


                if (
                    products.length === 0
                ) {

                    showEmptyMessage(
                        container,
                        emptyMessages[
                            category
                        ]
                    );

                }

            }
        );


    /*
     * SETUP CAROUSELS
     */

    setupProductSliders();


    /*
     * UPDATE BUY BUTTONS
     */

    updateBuyButtonState();


    console.log(
        "========== MENU SYNC COMPLETE =========="
    );

}



/* =========================================================
   PRODUCT CAROUSEL / SLIDER
   ========================================================= */

function setupProductSliders() {

    const containers =
        document.querySelectorAll(
            ".category-section .products"
        );


    containers.forEach(
        container => {

            const existingWrapper =
                container.parentElement?.classList.contains(
                    "carousel-wrapper"
                )
                    ? container.parentElement
                    : null;


            if (existingWrapper) {

                existingWrapper.parentNode.insertBefore(
                    container,
                    existingWrapper
                );


                existingWrapper.remove();

            }


            const productCards =
                container.querySelectorAll(
                    ".product-card"
                );


            if (
                productCards.length <= 1
            ) {

                return;

            }


            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "carousel-wrapper";


            container.parentNode.insertBefore(
                wrapper,
                container
            );


            wrapper.appendChild(
                container
            );


            const previousButton =
                document.createElement(
                    "button"
                );


            previousButton.type =
                "button";


            previousButton.className =
                "carousel-button carousel-prev";


            previousButton.innerHTML =
                "‹";


            const nextButton =
                document.createElement(
                    "button"
                );


            nextButton.type =
                "button";


            nextButton.className =
                "carousel-button carousel-next";


            nextButton.innerHTML =
                "›";


            wrapper.appendChild(
                previousButton
            );


            wrapper.appendChild(
                nextButton
            );


            const scrollAmount =
                280;


            previousButton.addEventListener(
                "click",
                () => {

                    container.scrollBy({

                        left:
                            -scrollAmount,

                        behavior:
                            "smooth"

                    });

                }
            );


            nextButton.addEventListener(
                "click",
                () => {

                    container.scrollBy({

                        left:
                            scrollAmount,

                        behavior:
                            "smooth"

                    });

                }
            );


            function updateButtons() {

                const maxScroll =
                    container.scrollWidth -
                    container.clientWidth;


                const currentScroll =
                    container.scrollLeft;


                previousButton.style.display =
                    currentScroll <= 5
                        ? "none"
                        : "flex";


                nextButton.style.display =
                    currentScroll >=
                    maxScroll - 5
                        ? "none"
                        : "flex";

            }


            container.addEventListener(
                "scroll",
                updateButtons
            );


            window.addEventListener(
                "resize",
                updateButtons
            );


            setTimeout(
                updateButtons,
                100
            );

        }
    );

}


/* =========================================================
   ORDER HISTORY - GET CURRENT USER
   ========================================================= */

function getHistoryUser() {

    if (
        typeof getCurrentUser !==
        "function"
    ) {

        return null;

    }


    return getCurrentUser();

}


/* =========================================================
   ORDER HISTORY - GET USER ORDERS
   ========================================================= */

/* =========================================================
   ORDER HISTORY - GET USER ORDERS FROM SUPABASE
   ========================================================= */

async function getCustomerOrders() {

    const currentUser =
        getHistoryUser();


    if (!currentUser) {
        return [];
    }


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

        /*
         * GET AUTHENTICATED USER
         */

        const {
            data: authData,
            error: authError
        } =
            await supabaseClient.auth.getUser();


        if (
            authError ||
            !authData?.user
        ) {

            console.error(
                "Unable to get authenticated customer:",
                authError
            );

            return [];

        }


        /*
         * GET CUSTOMER ORDERS
         */

        const {
            data,
            error
        } =
            await supabaseClient

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

                .eq(
                    "user_id",
                    authData.user.id
                )

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Error loading customer orders:",
                error
            );

            return [];

        }


        if (!Array.isArray(data)) {

            return [];

        }


        /*
         * CONVERT SUPABASE FORMAT
         * INTO THE FORMAT USED BY
         * THE EXISTING HISTORY UI.
         */

      const orders = data.map(order => ({

                id:
                    order.id,

                orderNumber:
                    order.order_number,

                employeeName:
                    order.employee_name || "",

                department:
                    order.department || "",

                payment:
                    order.payment || "",

                total:
                    Number(order.total) || 0,

                status:
                    order.status || "Pending",

                date:
                    order.created_at,

                username:
                    currentUser.username || "",

                employeeId:
                    currentUser.employeeId || "",

                items:
                    Array.isArray(
                        order.order_items
                    )

                        ? order.order_items.map(
                            item => ({

                                productId:
                                    item.product_id,

                                name:
                                    item.product_name,

                                price:
                                    Number(
                                        item.price
                                    ) || 0,

                                quantity:
                                    Number(
                                        item.quantity
                                    ) || 0,

                                subtotal:
                                    Number(
                                        item.subtotal
                                    ) || 0

                            })
                        )

                        : []

            })
        );
        window.customerLatestOrders = orders;

return orders;


    } catch (error) {

        console.error(
            "Unexpected customer order history error:",
            error
        );

        return [];

    }

}


/* =========================================================
   ORDER HISTORY - GET HISTORY STORAGE KEY
   ========================================================= */

function getHistoryStorageKey() {

    const currentUser =
        getHistoryUser();


    if (!currentUser) {
        return null;
    }


    const identifier =
        currentUser.username ||
        currentUser.employeeId ||
        "customer";


    return (
        "hiddenOrderHistory_" +
        String(identifier)
    );

}


/* =========================================================
   ORDER HISTORY - GET HIDDEN ORDERS
   ========================================================= */

function getHiddenHistoryOrders() {

    const historyKey =
        getHistoryStorageKey();


    if (!historyKey) {
        return [];
    }


    try {

        const hidden =
            JSON.parse(
                localStorage.getItem(
                    historyKey
                ) || "[]"
            );


        return Array.isArray(hidden)

            ? hidden.map(
                id =>
                    String(id)
            )

            : [];

    } catch (error) {

        console.error(
            "Error loading hidden order history:",
            error
        );

        return [];

    }

}


/* =========================================================
   ORDER HISTORY - SAVE HIDDEN ORDERS
   ========================================================= */

function saveHiddenHistoryOrders(
    orderIds
) {

    const historyKey =
        getHistoryStorageKey();


    if (!historyKey) {
        return;
    }


    localStorage.setItem(

        historyKey,

        JSON.stringify(

            orderIds.map(
                id =>
                    String(id)
            )

        )

    );

}


/* =========================================================
   ORDER HISTORY - SHOW
   ========================================================= */

async function showOrderHistory() {

    hideSecondarySections();


    const historySection =
        document.getElementById(
            "order-history-section"
        );


    if (historySection) {

        historySection.style.display =
            "block";

       await renderOrderHistory();

    }


    const homeButton =
        document.getElementById(
            "home-nav-button"
        );


    const historyButton =
        document.getElementById(
            "history-nav-button"
        );


    if (homeButton) {

        homeButton.classList.remove(
            "active"
        );

    }


    if (historyButton) {

        historyButton.classList.add(
            "active"
        );

    }


    updateBuyButtonState();


    if (historySection) {

        historySection.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }

}


/* =========================================================
   ORDER HISTORY - RENDER
   ========================================================= */

async function renderOrderHistory() {

    const historyList =
        document.getElementById(
            "order-history-list"
        );


    if (!historyList) {
        return;
    }


    const allCustomerOrders =
    await getCustomerOrders();


    const hiddenOrders =
        getHiddenHistoryOrders();


    const visibleOrders =
        allCustomerOrders.filter(

            order =>
                !hiddenOrders.includes(
                    String(order.id)
                )

        );


    if (
        visibleOrders.length === 0
    ) {

        historyList.innerHTML = `

            <div class="empty-order-history">

                <div class="empty-order-history-icon">

                    🧾

                </div>

                <h3>

                    No Order History

                </h3>

                <p>

                    Your previous orders will appear here.

                </p>

            </div>

        `;

        return;

    }


    visibleOrders.sort(
        (a, b) => {

            const dateA =
                new Date(
                    a.date
                ).getTime() || 0;


            const dateB =
                new Date(
                    b.date
                ).getTime() || 0;


            return dateB - dateA;

        }
    );


    historyList.innerHTML = "";


    visibleOrders.forEach(
        order => {

            const orderCard =
                document.createElement(
                    "div"
                );


            orderCard.className =
                "order-history-card";


            const orderId =
                String(order.id)
                    .replace(
                        /[^a-zA-Z0-9_-]/g,
                        ""
                    );


            const orderDate =
                formatOrderDate(
                    order.date
                );


            const status =
                order.status ||
                "Pending";


            const safeStatusClass =
                String(status)
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9_-]/g,
                        ""
                    );


            orderCard.innerHTML = `

                <button
                    type="button"
                    class="order-history-header"
                    onclick="toggleOrderReceipt('${orderId}')"
                >

                    <div class="order-history-main">

                        <strong>

                            Order #${escapeHTML(
                                order.orderNumber
                            )}

                        </strong>

                        <span>

                            ${escapeHTML(
                                orderDate
                            )}

                        </span>

                    </div>


                    <div class="order-history-right">

                        <span
                            class="order-history-status status-${safeStatusClass}"
                        >

                            ${escapeHTML(
                                status
                            )}

                        </span>


                        <span
                            class="order-history-arrow"
                            id="order-arrow-${orderId}"
                        >

                            ›

                        </span>

                    </div>

                </button>


                <div
                    class="order-receipt"
                    id="order-receipt-${orderId}"
                    style="display: none;"
                >

                    ${createOrderReceipt(order)}

                </div>

            `;


            historyList.appendChild(
                orderCard
            );

        }
    );

}


/* =========================================================
   ORDER HISTORY - TOGGLE RECEIPT
   ========================================================= */

function toggleOrderReceipt(
    orderId
) {

    const safeOrderId =
        String(orderId)
            .replace(
                /[^a-zA-Z0-9_-]/g,
                ""
            );


    const receipt =
        document.getElementById(
            `order-receipt-${safeOrderId}`
        );


    const arrow =
        document.getElementById(
            `order-arrow-${safeOrderId}`
        );


    if (!receipt) {
        return;
    }


    const isHidden =
        receipt.style.display ===
        "none";


    if (isHidden) {

        receipt.style.display =
            "block";


        if (arrow) {

            arrow.style.transform =
                "rotate(90deg)";

        }

    } else {

        receipt.style.display =
            "none";


        if (arrow) {

            arrow.style.transform =
                "rotate(0deg)";

        }

    }

}


/* =========================================================
   ORDER HISTORY - CREATE RECEIPT
   ========================================================= */

function createOrderReceipt(
    order
) {

    let itemsHTML = "";


    if (
        Array.isArray(order.items) &&
        order.items.length > 0
    ) {

        order.items.forEach(
            item => {

                const price =
                    Number(
                        item.price
                    ) || 0;


                const quantity =
                    Number(
                        item.quantity
                    ) || 0;


                const subtotal =
                    Number(
                        item.subtotal ??
                        (
                            price *
                            quantity
                        )
                    );


                itemsHTML += `

                    <div class="receipt-item">

                        <div class="receipt-item-info">

                            <strong>

                                ${escapeHTML(
                                    item.name
                                )}

                            </strong>

                            <span>

                                ₱${price.toFixed(2)}

                                × ${quantity}

                            </span>

                        </div>


                        <strong>

                            ₱${subtotal.toFixed(2)}

                        </strong>

                    </div>

                `;

            }
        );

    } else {

        itemsHTML = `

            <p class="receipt-empty">

                No item details available.

            </p>

        `;

    }


    const total =
        Number(
            order.total
        ) || 0;


    return `

        <div class="receipt-content">

            <div class="receipt-header">

                <strong>

                    Anong Meron?

                </strong>

                <span>

                    Order Receipt

                </span>

            </div>


            <div class="receipt-details">

                <div>

                    <span>

                        Order #

                    </span>

                    <strong>

                        ${escapeHTML(
                            order.orderNumber
                        )}

                    </strong>

                </div>


                <div>

                    <span>

                        Date

                    </span>

                    <strong>

                        ${escapeHTML(
                            formatOrderDate(
                                order.date
                            )
                        )}

                    </strong>

                </div>


                <div>

                    <span>

                        Employee

                    </span>

                    <strong>

                        ${escapeHTML(
                            order.employeeName
                        )}

                    </strong>

                </div>


                <div>

                    <span>

                        Department

                    </span>

                    <strong>

                        ${escapeHTML(
                            order.department
                        )}

                    </strong>

                </div>

            </div>


            <div class="receipt-items">

                <h4>

                    Ordered Items

                </h4>

                ${itemsHTML}

            </div>


            <div class="receipt-total">

                <span>

                    Total

                </span>

                <strong>

                    ₱${total.toFixed(2)}

                </strong>

            </div>


            <div class="receipt-footer">

                <div>

                    <span>

                        Payment

                    </span>

                    <strong>

                        ${escapeHTML(
                            order.payment
                        )}

                    </strong>

                </div>


                <div>

                    <span>

                        Status

                    </span>

                    <strong>

                        ${escapeHTML(
                            order.status ||
                            "Pending"
                        )}

                    </strong>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   ORDER HISTORY - FORMAT DATE
   ========================================================= */

function formatOrderDate(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleString(

        "en-PH",

        {

            year:
                "numeric",

            month:
                "long",

            day:
                "numeric",

            hour:
                "numeric",

            minute:
                "2-digit"

        }

    );

}


/* =========================================================
   ORDER HISTORY - DELETE ALL
   ========================================================= */
async function deleteAllOrderHistory() {

    const customerOrders =
        await getCustomerOrders();


    const hiddenOrders =
        getHiddenHistoryOrders();


    const visibleOrders =
        customerOrders.filter(

            order =>
                !hiddenOrders.includes(
                    String(order.id)
                )

        );


    if (
        visibleOrders.length === 0
    ) {

        appAlert(
            "There is no order history to delete."
        );

        return;

    }


    const confirmDelete =
    await appConfirm(
        "Are you sure you want to delete all of your order history?",
        "Delete Order History"
    );


if (!confirmDelete) {
    return;
}


    const allOrderIds =
        customerOrders.map(

            order =>
                String(order.id)

        );


    saveHiddenHistoryOrders(
        allOrderIds
    );


    renderOrderHistory();


    appAlert(
        "Your order history has been deleted."
    );

}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */
document.addEventListener(
    "DOMContentLoaded",
    async () => {

        checkoutLocked = false;

        hideSecondarySections();

        /*
         * CHECK MAINTENANCE MODE
         */

        await checkMaintenanceMode();
        startMaintenanceRealtime();

        /*
         * LOAD PRODUCTS FROM SUPABASE
         */

        await syncCustomerMenu();

        updateCartCount();

        showCategory(
            "all",
            document.querySelector(
                ".category.active"
            )
        );

        updateBuyButtonState();

    }
);  


/* =========================================================
   REAL-TIME MENU / ORDER UPDATE
   ========================================================= */

/* =========================================================
   REAL-TIME MENU / ORDER UPDATE
   ========================================================= */

/*
 * OLD LOCALSTORAGE LISTENER
 *
 * Kept for compatibility with any old localStorage
 * events that may still exist.
 */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key === "menuItems"
        ) {

            syncCustomerMenu();

        }


        if (
            event.key === "orders" ||
            event.key === "ordersUpdated"
        ) {

            const historySection =
                document.getElementById(
                    "order-history-section"
                );


            if (
                historySection &&
                historySection.style.display ===
                    "block"
            ) {

                renderOrderHistory();

            }

        }

    }
);

/* =========================================================
   SUPABASE REALTIME - CUSTOMER ORDERS
   ========================================================= */

let customerOrdersRealtimeChannel = null;


/*
 * START CUSTOMER ORDER REALTIME
 */

async function startCustomerOrdersRealtime() {

    /*
     * CHECK SUPABASE
     */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client is not available for customer realtime."
        );

        return;

    }


    /*
     * GET CURRENT AUTH USER
     */

    let authUser = null;

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getUser();


        if (error) {

            console.error(
                "Realtime auth error:",
                error
            );

            return;

        }


        authUser =
            data?.user || null;

    } catch (error) {

        console.error(
            "Unexpected realtime auth error:",
            error
        );

        return;

    }


    /*
     * NO LOGGED-IN CUSTOMER
     */

    if (!authUser) {

        console.log(
            "No authenticated customer. Realtime not started."
        );

        return;

    }


    /*
     * REMOVE OLD CHANNEL
     */

    if (customerOrdersRealtimeChannel) {

        try {

            await supabaseClient
                .removeChannel(
                    customerOrdersRealtimeChannel
                );

        } catch (error) {

            console.warn(
                "Unable to remove old customer realtime channel:",
                error
            );

        }

        customerOrdersRealtimeChannel = null;

    }


    /*
     * CREATE REALTIME CHANNEL
     */

    customerOrdersRealtimeChannel =
        supabaseClient

            .channel(
                "customer-orders-" +
                authUser.id
            )


            /*
             * ORDER UPDATED
             */

            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "orders",
                    filter:
                        "user_id=eq." +
                        authUser.id
                },
                async payload => {

                    console.log(
                        "CUSTOMER ORDER UPDATED REALTIME:",
                        payload
                    );


                    /*
                     * IMPORTANT:
                     *
                     * Always reload the customer's
                     * orders from Supabase.
                     *
                     * Hindi na kailangan na
                     * Order History ang bukas.
                     */

                    try {

                        const latestOrders =
                            await getCustomerOrders();


                        /*
                         * Store latest orders
                         * temporarily in memory.
                         */

                        window.customerLatestOrders =
                            latestOrders;


                        /*
                         * If Order History is open,
                         * immediately redraw it.
                         */

                        const historySection =
                            document.getElementById(
                                "order-history-section"
                            );


                        if (
                            historySection &&
                            historySection.style.display ===
                                "block"
                        ) {

                            renderOrderHistory();

                        }


                        /*
                         * Update confirmation
                         * if it is currently visible.
                         */

                        updateVisibleOrderStatus(
                            latestOrders
                        );

                    } catch (error) {

                        console.error(
                            "Failed to refresh customer orders realtime:",
                            error
                        );

                    }

                }
            )


            /*
             * NEW ORDER
             */

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "orders",
                    filter:
                        "user_id=eq." +
                        authUser.id
                },
                async payload => {

                    console.log(
                        "CUSTOMER NEW ORDER REALTIME:",
                        payload
                    );


                    try {

                        const latestOrders =
                            await getCustomerOrders();


                        window.customerLatestOrders =
                            latestOrders;


                        const historySection =
                            document.getElementById(
                                "order-history-section"
                            );


                        if (
                            historySection &&
                            historySection.style.display ===
                                "block"
                        ) {

                            renderOrderHistory();

                        }


                        updateVisibleOrderStatus(
                            latestOrders
                        );

                    } catch (error) {

                        console.error(
                            "Failed to refresh new customer order:",
                            error
                        );

                    }

                }
            )
            /*
             * ORDER DELETED
             */

            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "orders",
                    filter:
                        "user_id=eq." +
                        authUser.id
                },
                async payload => {

                    console.log(
                        "CUSTOMER ORDER DELETED REALTIME:",
                        payload
                    );


                    try {

                        const latestOrders =
                            await getCustomerOrders();


                        window.customerLatestOrders =
                            latestOrders;


                        /*
                         * If Order History is open,
                         * immediately redraw it.
                         */

                        const historySection =
                            document.getElementById(
                                "order-history-section"
                            );


                        if (
                            historySection &&
                            historySection.style.display ===
                                "block"
                        ) {

                            renderOrderHistory();

                        }


                        /*
                         * Update confirmation
                         * if currently visible.
                         */

                        updateVisibleOrderStatus(
                            latestOrders
                        );


                    } catch (error) {

                        console.error(
                            "Failed to refresh deleted customer order realtime:",
                            error
                        );

                    }

                }
            )

            /*
             * SUBSCRIBE
             */

            .subscribe(
                status => {

                    console.log(
                        "Customer Orders Realtime:",
                        status
                    );


                    if (
                        status === "SUBSCRIBED"
                    ) {

                        console.log(
                            "Customer Orders Realtime: SUBSCRIBED"
                        );

                    }


                    if (
                        status === "CHANNEL_ERROR"
                    ) {

                        console.error(
                            "Customer Orders Realtime: CHANNEL_ERROR"
                        );

                    }


                    if (
                        status === "TIMED_OUT"
                    ) {

                        console.error(
                            "Customer Orders Realtime: TIMED_OUT"
                        );

                    }

                }
            );

}

/* =========================================================
   SUPABASE REALTIME - CUSTOMER MENU
   ========================================================= */

let customerMenuRealtimeChannel = null;


/*
 * START CUSTOMER MENU REALTIME
 *
 * Automatically refreshes the customer menu when
 * products are added, edited, deleted, or changed
 * between Available / Unavailable.
 */

function startCustomerMenuRealtime() {

    /*
     * CHECK SUPABASE
     */

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client is not available for menu realtime."
        );

        return;

    }


    /*
     * REMOVE OLD CHANNEL
     *
     * Prevent duplicate realtime listeners.
     */

    if (customerMenuRealtimeChannel) {

        try {

            supabaseClient.removeChannel(
                customerMenuRealtimeChannel
            );

        } catch (error) {

            console.warn(
                "Unable to remove old menu realtime channel:",
                error
            );

        }

        customerMenuRealtimeChannel = null;

    }


    /*
     * CREATE REALTIME CHANNEL
     */

    customerMenuRealtimeChannel =
        supabaseClient

            .channel(
                "customer-menu-realtime"
            )


            /*
             * PRODUCT ADDED
             */

            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "products"
                },
                async payload => {

                    console.log(
                        "CUSTOMER MENU - PRODUCT ADDED:",
                        payload
                    );

                    await syncCustomerMenu();

                    updateBuyButtonState();

                }
            )


            /*
             * PRODUCT UPDATED
             *
             * Includes:
             * - name
             * - price
             * - category
             * - description
             * - image
             * - available / unavailable
             */

            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "products"
                },
                async payload => {

                    console.log(
                        "CUSTOMER MENU - PRODUCT UPDATED:",
                        payload
                    );

                    await syncCustomerMenu();

                    updateBuyButtonState();

                }
            )


            /*
             * PRODUCT DELETED
             */

            .on(
                "postgres_changes",
                {
                    event: "DELETE",
                    schema: "public",
                    table: "products"
                },
                async payload => {

                    console.log(
                        "CUSTOMER MENU - PRODUCT DELETED:",
                        payload
                    );

                    await syncCustomerMenu();

                    updateBuyButtonState();

                }
            )


            /*
             * SUBSCRIBE
             */

            .subscribe(
                status => {

                    console.log(
                        "Customer Menu Realtime:",
                        status
                    );


                    if (
                        status === "SUBSCRIBED"
                    ) {

                        console.log(
                            "Customer Menu Realtime: SUBSCRIBED"
                        );

                    }


                    if (
                        status === "CHANNEL_ERROR"
                    ) {

                        console.error(
                            "Customer Menu Realtime: CHANNEL_ERROR"
                        );

                    }


                    if (
                        status === "TIMED_OUT"
                    ) {

                        console.error(
                            "Customer Menu Realtime: TIMED_OUT"
                        );

                    }

                }
            );

}
/* =========================================================
   UPDATE VISIBLE ORDER STATUS
   ========================================================= */

function updateVisibleOrderStatus(orders) {

    /*
     * No orders
     */

    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        return;

    }


    /*
     * Get latest order
     */

    const latestOrder =
        orders[0];


    if (!latestOrder) {

        return;

    }


    /*
     * Confirmation section
     */

    const confirmationSection =
        document.getElementById(
            "confirmation-section"
        );


    /*
     * If confirmation is visible,
     * update its order status if
     * a status element exists.
     */

    if (
        confirmationSection &&
        confirmationSection.style.display === "block"
    ) {

        const statusElement =
            document.getElementById(
                "confirmation-status"
            );


        if (statusElement) {

            statusElement.textContent =
                latestOrder.status || "Pending";

        }

    }

}


/* =========================================================
   START CUSTOMER REALTIME WHEN PAGE LOADS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * Give Supabase Auth a little time
         * to restore the current session.
         */

        setTimeout(
            () => {

                startCustomerOrdersRealtime();

                startCustomerMenuRealtime();

            },
            500
        );

    }
);


/* =========================================================
   REFRESH MENU WHEN CUSTOMER RETURNS
   ========================================================= */
window.addEventListener(
    "focus",
    async () => {

        await syncCustomerMenu();

        updateBuyButtonState();

    }
);


/* =========================================================
   SERVICE WORKER
   ========================================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker

                .register(
                    "./service-worker.js"
                )

                .then(
                    registration => {

                        console.log(
                            "Service Worker registered:",
                            registration.scope
                        );

                    }
                )

                .catch(
                    error => {

                        console.error(
                            "Service Worker registration failed:",
                            error
                        );

                    }
                );

        }
    );

}


/* =========================================================
   CANCEL ORDER
   ========================================================= */

async function cancelOrder() {

    const confirmCancel =
    await appConfirm(
        "Are you sure you want to cancel your order?",
        "Cancel Order"
    );


if (!confirmCancel) {
    return;
}




    /*
     * UNLOCK
     */

    checkoutLocked = false;


    /*
     * CLEAR CART
     */

    cart = [];


    updateCartCount();


    /*
     * HIDE SECONDARY SECTIONS
     */

    hideSecondarySections();


    /*
     * RESET CART DISPLAY
     */

    renderCart();


    /*
     * RESET CHECKOUT ITEMS
     */

    const checkoutItems =
        document.getElementById(
            "checkout-items"
        );


    if (checkoutItems) {

        checkoutItems.innerHTML =
            "";

    }


    /*
     * RESET CHECKOUT TOTAL
     */

    const checkoutTotal =
        document.getElementById(
            "checkout-total"
        );


    if (checkoutTotal) {

        checkoutTotal.textContent =
            "₱0.00";

    }


    /*
     * RESET CHECKOUT FORM
     */

   const employeeName =
    document.getElementById(
        "checkout-name"
    );


const department =
    document.getElementById(
        "checkout-department"
    );


    if (employeeName) {

        employeeName.value =
            "";

    }


    if (department) {

        department.value =
            "";

    }


    /*
     * RESET PAYMENT
     */

    const paymentMethod =
    document.getElementById(
        "payment-method"
    );


if (paymentMethod) {

    paymentMethod.value =
        "";

}


    /*
     * RESTORE CUSTOMER INFORMATION
     */

    const currentUser =
        typeof getCurrentUser === "function"

            ? getCurrentUser()

            : null;


    if (currentUser) {

        if (employeeName) {

            employeeName.value =
                currentUser.fullName ||
                currentUser.username ||
                "";

        }


        if (department) {

            department.value =
                currentUser.department ||
                "";

        }

    }


    /*
     * ENABLE BUY BUTTONS
     */

    updateBuyButtonState();


    /*
     * RETURN TO HOME
     */

    goToHome();

}
// ==========================================
// CUSTOMER MAINTENANCE MODE
// ==========================================

async function checkMaintenanceMode() {

    const maintenanceScreen =
        document.getElementById(
            "maintenance-screen"
        );

    if (!maintenanceScreen) {
        return;
    }


    try {

        const {
            data,
            error
        } = await supabaseClient

            .from("app_settings")

            .select(
                "maintenance_mode"
            )

            .eq("id", 1)

            .single();


        if (error) {

            console.error(
                "Error checking maintenance mode:",
                error
            );

            maintenanceScreen.style.display =
                "none";

            return;
        }


        const maintenanceMode =
            data.maintenance_mode === true;


        if (maintenanceMode) {

            maintenanceScreen.style.display =
                "flex";

            document.body.style.overflow =
                "hidden";

        } else {

            maintenanceScreen.style.display =
                "none";

            document.body.style.overflow =
                "";

        }


    } catch (error) {

        console.error(
            "Unexpected maintenance error:",
            error
        );

        maintenanceScreen.style.display =
            "none";

    }

}
/* =========================================================
   CUSTOMER MAINTENANCE MODE REALTIME
   ========================================================= */

let maintenanceRealtimeChannel = null;


function startMaintenanceRealtime() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {

        console.error(
            "Supabase client is not available for maintenance realtime."
        );

        return;

    }


    /*
     * REMOVE OLD CHANNEL
     */

    if (maintenanceRealtimeChannel) {

        try {

            supabaseClient.removeChannel(
                maintenanceRealtimeChannel
            );

        } catch (error) {

            console.warn(
                "Unable to remove old maintenance realtime channel:",
                error
            );

        }

        maintenanceRealtimeChannel = null;

    }


    /*
     * CREATE REALTIME CHANNEL
     */

    maintenanceRealtimeChannel =
        supabaseClient

            .channel(
                "customer-maintenance-realtime"
            )

            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "app_settings",
                    filter: "id=eq.1"
                },
                async payload => {

                    console.log(
                        "CUSTOMER MAINTENANCE UPDATED REALTIME:",
                        payload
                    );


                    /*
                     * RECHECK CURRENT MAINTENANCE STATUS
                     */

                    await checkMaintenanceMode();
                    startMaintenanceRealtime();
                }
            )

            .subscribe(status => {

                console.log(
                    "Customer Maintenance Realtime:",
                    status
                );


                if (
                    status === "SUBSCRIBED"
                ) {

                    console.log(
                        "Customer Maintenance Realtime: SUBSCRIBED"
                    );

                }


                if (
                    status === "CHANNEL_ERROR"
                ) {

                    console.error(
                        "Customer Maintenance Realtime: CHANNEL_ERROR"
                    );

                }


                if (
                    status === "TIMED_OUT"
                ) {

                    console.error(
                        "Customer Maintenance Realtime: TIMED_OUT"
                    );

                }

            });

}
/* =========================================================
   MAINTENANCE LOGOUT
   ========================================================= */

function maintenanceLogout() {

    /*
     * CLEAR CUSTOMER LOGIN SESSION
     */

    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");

    /*
     * RETURN TO LOGIN PAGE
     */

    window.location.href = "login.html";

}