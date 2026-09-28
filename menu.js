/* =========================================================
   ANONG MERON? - ADMIN MENU
   SUPABASE VERSION
   ========================================================= */

let menuItems = [];
let editingMenuId = null;
let selectedImageFile = null;
let currentImageUrl = "";


/* =========================================================
   CATEGORY NAMES
   ========================================================= */

function getCategoryName(category) {

    const categories = {
        almusal: "Almusal",
        meryenda: "Meryenda",
        ulam: "Ulam",
        desserts: "Desserts",
        others: "Others"
    };

    return categories[category] || category;
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   FORMAT PRICE
   ========================================================= */

function formatPrice(price) {

    const number = Number(price);

    if (Number.isNaN(number)) {
        return "₱0.00";
    }

    return "₱" + number.toFixed(2);
}


/* =========================================================
   LOAD PRODUCTS FROM SUPABASE
   ========================================================= */

async function loadMenu() {

    const menuList = document.getElementById("menu-list");

    if (!menuList) {
        return;
    }

    menuList.innerHTML = `
        <div class="empty-menu">
            <p>Loading products...</p>
            <span>Please wait.</span>
        </div>
    `;

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .select("*")
            .order("created_at", {
                ascending: true
            });

        if (error) {

            console.error(
                "Supabase load products error:",
                error
            );

            throw error;
        }

        menuItems = data || [];

        displayMenu();

    } catch (error) {

        console.error(error);

        menuList.innerHTML = `
            <div class="empty-menu">
                <p>Unable to load products.</p>
                <span>
                    Please check your Supabase connection and try again.
                </span>
            </div>
        `;

        updateMenuCount();
    }
}


/* =========================================================
   DISPLAY MENU
   ========================================================= */

function displayMenu() {

    const menuList = document.getElementById("menu-list");

    if (!menuList) {
        return;
    }

    updateMenuCount();

    if (!menuItems.length) {

        menuList.innerHTML = `
            <div class="empty-menu">
                <p>No products added yet.</p>
                <span>
                    Click "+ Add Product" to add today's menu.
                </span>
            </div>
        `;

        return;
    }

    const categories = [
        "almusal",
        "meryenda",
        "ulam",
        "desserts",
        "others"
    ];

    let html = "";

    categories.forEach(category => {

        const products = menuItems.filter(item =>
            String(item.category).toLowerCase() === category
        );

        if (!products.length) {
            return;
        }

        html += `
            <div class="menu-category-group">

                <div class="menu-category-title">

                    <h3>
                        ${escapeHTML(getCategoryName(category))}
                    </h3>

                    <span>
                        ${products.length}
                        ${products.length === 1 ? "Product" : "Products"}
                    </span>

                </div>

                <div class="menu-items-grid">
        `;

        products.forEach(item => {

            const imageHTML = item.image_url
                ? `
                    <img
                        src="${escapeHTML(item.image_url)}"
                        alt="${escapeHTML(item.name)}"
                        class="menu-item-image"
                        loading="lazy"
                    >
                `
                : `
                    <div class="no-menu-image">
                        🍽️
                    </div>
                `;

            const availabilityText = item.available
                ? "Available"
                : "Unavailable";

            const availabilityClass = item.available
                ? "available"
                : "unavailable";

            html += `
                <div class="menu-item-card">

                    <div class="menu-item-image-container">
                        ${imageHTML}
                    </div>

                    <div class="menu-item-details">

                        <div class="menu-item-info">

                            <h4>
                                ${escapeHTML(item.name)}
                            </h4>

                            <div class="menu-item-price">
                                ${formatPrice(item.price)}
                            </div>

                            ${
                                item.description
                                    ? `
                                        <p class="menu-item-description">
                                            ${escapeHTML(item.description)}
                                        </p>
                                    `
                                    : ""
                            }

                            <span class="menu-item-availability ${availabilityClass}">
                                ${availabilityText}
                            </span>

                        </div>

                        <div class="menu-item-actions">

                            <button
                                type="button"
                                class="edit-menu-button"
                                onclick="editMenuItem('${escapeHTML(item.id)}')"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="availability-menu-button"
                                onclick="toggleAvailability('${escapeHTML(item.id)}')"
                            >
                                ${
                                    item.available
                                        ? "Disable"
                                        : "Enable"
                                }
                            </button>

                            <button
                                type="button"
                                class="delete-menu-button"
                                onclick="deleteMenuItem('${escapeHTML(item.id)}')"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    menuList.innerHTML = html;
}


/* =========================================================
   MENU COUNT
   ========================================================= */

function updateMenuCount() {

    const countElement =
        document.getElementById("menu-count");

    if (!countElement) {
        return;
    }

    const count = menuItems.length;

    countElement.textContent =
        `${count} ${count === 1 ? "Product" : "Products"}`;
}


/* =========================================================
   OPEN ADD PRODUCT
   ========================================================= */

function openAddMenu() {

    editingMenuId = null;
    selectedImageFile = null;
    currentImageUrl = "";

    const modal =
        document.getElementById("menu-modal");

    const title =
        document.getElementById("modal-title");

    const name =
        document.getElementById("menu-name");

    const image =
        document.getElementById("menu-image");

    const category =
        document.getElementById("menu-category");

    const price =
        document.getElementById("menu-price");

    const description =
        document.getElementById("menu-description");

    const previewContainer =
        document.getElementById("image-preview-container");

    const preview =
        document.getElementById("menu-image-preview");

    if (title) {
        title.textContent = "Add Product";
    }

    if (name) {
        name.value = "";
    }

    if (image) {
        image.value = "";
    }

    if (category) {
        category.value = "almusal";
    }

    if (price) {
        price.value = "";
    }

    if (description) {
        description.value = "";
    }

    if (previewContainer) {
        previewContainer.style.display = "none";
    }

    if (preview) {
        preview.src = "";
    }

    if (modal) {
        modal.style.display = "flex";
    }

    setTimeout(() => {

        if (name) {
            name.focus();
        }

    }, 100);
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeMenuModal() {

    const modal =
        document.getElementById("menu-modal");

    if (modal) {
        modal.style.display = "none";
    }

    editingMenuId = null;
    selectedImageFile = null;
    currentImageUrl = "";
}


/* =========================================================
   COMPRESS IMAGE
   ========================================================= */

function compressImage(file) {

    return new Promise((resolve, reject) => {

        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();

        reader.onload = event => {

            const img = new Image();

            img.onload = () => {

                const MAX_SIZE = 1000;

                let width = img.width;
                let height = img.height;

                if (width > MAX_SIZE || height > MAX_SIZE) {

                    if (width > height) {

                        height =
                            Math.round(
                                height * MAX_SIZE / width
                            );

                        width = MAX_SIZE;

                    } else {

                        width =
                            Math.round(
                                width * MAX_SIZE / height
                            );

                        height = MAX_SIZE;
                    }
                }

                const canvas =
                    document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const context =
                    canvas.getContext("2d");

                context.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                canvas.toBlob(
                    blob => {

                        if (!blob) {

                            reject(
                                new Error(
                                    "Unable to compress image."
                                )
                            );

                            return;
                        }

                        resolve(blob);

                    },
                    "image/jpeg",
                    0.75
                );
            };

            img.onerror = () => {

                reject(
                    new Error(
                        "Invalid image file."
                    )
                );
            };

            img.src = event.target.result;
        };

        reader.onerror = () => {

            reject(
                new Error(
                    "Unable to read image."
                )
            );
        };

        reader.readAsDataURL(file);
    });
}


/* =========================================================
   IMAGE PREVIEW
   ========================================================= */

function previewMenuImage(event) {

    const file =
        event.target.files?.[0];

    if (!file) {

        selectedImageFile = null;

        return;
    }

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image file.");

        event.target.value = "";

        selectedImageFile = null;

        return;
    }

    selectedImageFile = file;

    const previewContainer =
        document.getElementById(
            "image-preview-container"
        );

    const preview =
        document.getElementById(
            "menu-image-preview"
        );

    if (!previewContainer || !preview) {
        return;
    }

    const previewUrl =
        URL.createObjectURL(file);

    preview.src = previewUrl;

    previewContainer.style.display = "block";

    preview.onload = () => {

        URL.revokeObjectURL(previewUrl);

    };
}


/* =========================================================
   UPLOAD IMAGE TO SUPABASE STORAGE
   ========================================================= */

async function uploadProductImage(file) {

    if (!file) {
        return null;
    }

    const compressedBlob =
        await compressImage(file);

    if (!compressedBlob) {

        throw new Error(
            "Unable to process product image."
        );
    }

    const filePath =
        `products/${crypto.randomUUID()}.jpg`;

    const {
        error: uploadError
    } = await supabaseClient
        .storage
        .from("product-images")
        .upload(
            filePath,
            compressedBlob,
            {
                contentType: "image/jpeg",
                upsert: false
            }
        );

    if (uploadError) {

        console.error(
            "Storage upload error:",
            uploadError
        );

        throw uploadError;
    }

    const {
        data
    } = supabaseClient
        .storage
        .from("product-images")
        .getPublicUrl(filePath);

    if (!data?.publicUrl) {

        throw new Error(
            "Unable to get product image URL."
        );
    }

    return data.publicUrl;
}


/* =========================================================
   GET STORAGE PATH FROM IMAGE URL
   ========================================================= */

function getStoragePathFromUrl(url) {

    if (!url) {
        return null;
    }

    const marker =
        "/storage/v1/object/public/product-images/";

    const index =
        url.indexOf(marker);

    if (index === -1) {
        return null;
    }

    return url.substring(
        index + marker.length
    );
}


/* =========================================================
   DELETE IMAGE FROM STORAGE
   ========================================================= */

async function deleteProductImage(imageUrl) {

    const path =
        getStoragePathFromUrl(imageUrl);

    if (!path) {
        return;
    }

    try {

        const {
            error
        } = await supabaseClient
            .storage
            .from("product-images")
            .remove([path]);

        if (error) {

            console.warn(
                "Unable to delete old image:",
                error
            );
        }

    } catch (error) {

        console.warn(
            "Storage delete error:",
            error
        );
    }
}


/* =========================================================
   SAVE PRODUCT
   ========================================================= */

async function saveMenuItem() {

    const nameInput =
        document.getElementById("menu-name");

    const categoryInput =
        document.getElementById("menu-category");

    const priceInput =
        document.getElementById("menu-price");

    const descriptionInput =
        document.getElementById("menu-description");

    const saveButton =
        document.getElementById("save-menu-button");

    const name =
        nameInput?.value.trim() || "";

    const category =
        categoryInput?.value || "";

    const price =
        Number(priceInput?.value);

    const description =
        descriptionInput?.value.trim() || "";


    /* =========================
       VALIDATION
       ========================= */

    if (!name) {

        alert("Please enter the product name.");

        nameInput?.focus();

        return;
    }

    if (!category) {

        alert("Please select a category.");

        categoryInput?.focus();

        return;
    }

    if (
        !priceInput?.value ||
        Number.isNaN(price) ||
        price < 0
    ) {

        alert("Please enter a valid price.");

        priceInput?.focus();

        return;
    }


    /* =========================
       DISABLE BUTTON
       ========================= */

    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";
    }


    try {

        let imageUrl =
            currentImageUrl;


        /* =========================
           UPLOAD NEW IMAGE
           ========================= */

        if (selectedImageFile) {

            imageUrl =
                await uploadProductImage(
                    selectedImageFile
                );
        }


        /* =========================
           EDIT EXISTING PRODUCT
           ========================= */

        if (editingMenuId) {

            const oldProduct =
                menuItems.find(
                    item =>
                        String(item.id) ===
                        String(editingMenuId)
                );

            const {
    data: updatedProduct,
    error
} = await supabaseClient
    .from("products")
    .update({
        name: name,
        category: category,
        price: price,
        description: description,
        image_url: imageUrl || null
    })
    .eq("id", editingMenuId)
    .select("id, name, category");

console.log(
    "UPDATED PRODUCT RESULT:",
    updatedProduct
);

console.log(
    "UPDATED PRODUCT ERROR:",
    error
);

if (error) {
    throw error;
}
            if (error) {

                console.error(
                    "Update product error:",
                    error
                );

                throw error;
            }

            if (
                selectedImageFile &&
                oldProduct?.image_url &&
                oldProduct.image_url !== imageUrl
            ) {

                await deleteProductImage(
                    oldProduct.image_url
                );
            }

            showSaveNotification(
                "Product updated successfully!"
            );
        }


        /* =========================
           ADD NEW PRODUCT
           ========================= */

        else {

            const {
                error
            } = await supabaseClient
                .from("products")
                .insert({
                    name: name,
                    category: category,
                    price: price,
                    description: description,
                    image_url: imageUrl || null,
                    available: true
                });

            if (error) {

                console.error(
                    "Insert product error:",
                    error
                );

                throw error;
            }

            showSaveNotification(
                "Product added successfully!"
            );
        }


        /* =========================
           REFRESH MENU
           ========================= */

        await loadMenu();

        closeMenuModal();

    } catch (error) {

        console.error(
            "Save product error:",
            error
        );

        let message =
            "Unable to save the product.";

        if (error?.message) {

            message +=
                "\n\n" +
                error.message;
        }

        alert(message);

    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Product";
        }
    }
}


/* =========================================================
   EDIT PRODUCT
   ========================================================= */

function editMenuItem(id) {

    const item =
        menuItems.find(
            product =>
                String(product.id) ===
                String(id)
        );

    if (!item) {

        alert("Product not found.");

        return;
    }

    editingMenuId = item.id;

    selectedImageFile = null;

    currentImageUrl =
        item.image_url || "";

    const modal =
        document.getElementById("menu-modal");

    const title =
        document.getElementById("modal-title");

    const name =
        document.getElementById("menu-name");

    const image =
        document.getElementById("menu-image");

    const category =
        document.getElementById("menu-category");

    const price =
        document.getElementById("menu-price");

    const description =
        document.getElementById("menu-description");

    const previewContainer =
        document.getElementById(
            "image-preview-container"
        );

    const preview =
        document.getElementById(
            "menu-image-preview"
        );

    if (title) {
        title.textContent = "Edit Product";
    }

    if (name) {
        name.value = item.name || "";
    }

    if (image) {
        image.value = "";
    }

   if (category) {

    console.log(
        "EDIT PRODUCT CATEGORY:",
        item.category
    );

    category.value =
        String(item.category || "")
            .trim()
            .toLowerCase();

    console.log(
        "CATEGORY SELECTED:",
        category.value
    );
}

    if (price) {

        price.value =
            item.price ?? "";
    }

    if (description) {

        description.value =
            item.description || "";
    }

    if (
        previewContainer &&
        preview &&
        item.image_url
    ) {

        preview.src =
            item.image_url;

        previewContainer.style.display =
            "block";

    } else if (previewContainer) {

        previewContainer.style.display =
            "none";
    }

    if (modal) {

        modal.style.display =
            "flex";
    }
}


/* =========================================================
   DELETE PRODUCT
   ========================================================= */

async function deleteMenuItem(id) {

    const item =
        menuItems.find(
            product =>
                String(product.id) ===
                String(id)
        );

    if (!item) {

        alert("Product not found.");

        return;
    }

    const confirmed =
        confirm(
            `Are you sure you want to delete "${item.name}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        const {
            error
        } = await supabaseClient
            .from("products")
            .delete()
            .eq("id", id);

        if (error) {

            console.error(
                "Delete product error:",
                error
            );

            throw error;
        }

        if (item.image_url) {

            await deleteProductImage(
                item.image_url
            );
        }

        showSaveNotification(
            "Product deleted successfully!"
        );

        await loadMenu();

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "Unable to delete the product.\n\n" +
            (error?.message || "")
        );
    }
}


/* =========================================================
   TOGGLE AVAILABILITY
   ========================================================= */

/* =========================================================
   TOGGLE AVAILABILITY
   ========================================================= */

async function toggleAvailability(id) {

    const item =
        menuItems.find(
            product =>
                String(product.id) ===
                String(id)
        );

    if (!item) {

        alert("Product not found.");

        return;
    }

    const newAvailability =
        !Boolean(item.available);

    console.log(
        "TOGGLE AVAILABILITY:",
        {
            id: id,
            oldValue: item.available,
            newValue: newAvailability
        }
    );

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("products")
            .update({
                available: newAvailability
            })
            .eq("id", id)
            .select();

        console.log(
            "AVAILABILITY UPDATE RESULT:",
            {
                data: data,
                error: error
            }
        );

        if (error) {

            console.error(
                "Availability update error:",
                error
            );

            throw error;
        }

        if (!data || data.length === 0) {

            throw new Error(
                "The product was not updated. Please check the Supabase RLS policy for the products table."
            );
        }

        showSaveNotification(
            newAvailability
                ? "Product is now available!"
                : "Product is now unavailable!"
        );

        menuItems = menuItems.map(product => {

            if (
                String(product.id) ===
                String(id)
            ) {

                return {
                    ...product,
                    available: newAvailability
                };
            }

            return product;
        });

        displayMenu();

    } catch (error) {

        console.error(
            "Toggle availability error:",
            error
        );

        alert(
            "Unable to update product availability.\n\n" +
            (error?.message || "")
        );
    }
}

/* =========================================================
   SAVE NOTIFICATION
   ========================================================= */

function showSaveNotification(message) {

    const notification =
        document.getElementById(
            "save-notification"
        );

    const notificationText =
        document.getElementById(
            "save-notification-text"
        );

    if (!notification) {
        return;
    }

    if (notificationText) {

        notificationText.textContent =
            message;
    }

    notification.classList.add("show");

    setTimeout(() => {

        notification.classList.remove("show");

    }, 2500);
}


/* =========================================================
   INITIALIZE BUTTONS
   ========================================================= */

function initializeMenuButtons() {

    const addButton =
        document.getElementById(
            "add-product-button"
        );

    const closeButton =
        document.getElementById(
            "close-menu-modal"
        );

    const cancelButton =
        document.getElementById(
            "cancel-menu-button"
        );

    const saveButton =
        document.getElementById(
            "save-menu-button"
        );

    const imageInput =
        document.getElementById(
            "menu-image"
        );

    const modal =
        document.getElementById(
            "menu-modal"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            openAddMenu
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeMenuModal
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeMenuModal
        );
    }


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveMenuItem
        );
    }


    if (imageInput) {

        imageInput.addEventListener(
            "change",
            previewMenuImage
        );
    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

                    closeMenuModal();
                }
            }
        );
    }
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        initializeMenuButtons();

        await loadMenu();

    }
);