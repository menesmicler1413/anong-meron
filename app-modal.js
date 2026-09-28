/* =========================================================
   ANONG MERON? - SHARED APP MODAL
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

                <h3 id="app-modal-title">
                    Anong Meron?
                </h3>

                <p id="app-modal-message"></p>

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
            document.getElementById("app-modal");

        const titleElement =
            document.getElementById("app-modal-title");

        const messageElement =
            document.getElementById("app-modal-message");

        const icon =
            document.getElementById("app-modal-icon");

        const cancelButton =
            document.getElementById("app-modal-cancel");

        const confirmButton =
            document.getElementById("app-modal-confirm");


        titleElement.textContent = title;

        messageElement.textContent = message;


        icon.textContent = "✓";

        icon.className =
            "app-modal-icon success";


        cancelButton.style.display = "none";

        confirmButton.style.display = "block";

        confirmButton.textContent = "OK";


        modal.classList.add("show");


        function closeModal() {

            modal.classList.remove("show");

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
            document.getElementById("app-modal");

        const titleElement =
            document.getElementById("app-modal-title");

        const messageElement =
            document.getElementById("app-modal-message");

        const icon =
            document.getElementById("app-modal-icon");

        const cancelButton =
            document.getElementById("app-modal-cancel");

        const confirmButton =
            document.getElementById("app-modal-confirm");


        titleElement.textContent = title;

        messageElement.textContent = message;


        icon.textContent = "?";

        icon.className =
            "app-modal-icon question";


        cancelButton.style.display = "block";

        confirmButton.style.display = "block";


        cancelButton.textContent = "CANCEL";

        confirmButton.textContent = "CONFIRM";


        modal.classList.add("show");


        function closeModal(result) {

            modal.classList.remove("show");

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