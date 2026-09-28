
/* =========================================
   ANONG MERON? - INVITATION CODE MANAGEMENT
========================================= */


/* =========================================
   GET ALL INVITATION CODES
========================================= */


async function getAllInvitationCodes() {

    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("invitation_codes")
            .select("*")
            .order("created_at", {
                ascending: false
            });

        console.log(
            "INVITATION CODES FROM SUPABASE:",
            data
        );

        console.log(
            "INVITATION CODE ERROR:",
            error
        );

        if (error) {

            console.error(
                "Unable to load invitation codes:",
                error
            );

            return [];

        }

        if (!Array.isArray(data)) {

            return [];

        }

        console.log(
            "TOTAL INVITATION CODES:",
            data.length
        );

        console.log(
            "USED INVITATION CODES:",
            data.filter(
                code => code.status === "used"
            )
        );

        return data;

    } catch (error) {

        console.error(
            "Unexpected invitation code error:",
            error
        );

        return [];

    }

}


/* =========================================
   GENERATE RANDOM CODE
========================================= */

function createRandomInvitationCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let randomPart = "";


    for (let i = 0; i < 6; i++) {

        const randomIndex =
            Math.floor(
                Math.random() *
                characters.length
            );

        randomPart +=
            characters[randomIndex];

    }


    return "AM-2026-" + randomPart;

}


/* =========================================
   GENERATE NEW INVITATION CODE
========================================= */

async function generateInvitationCode() {

    try {

        let newCode;

        let existingCode = true;


        /*
         * Make sure the generated code
         * does not already exist.
         */

        while (existingCode) {

            newCode =
                createRandomInvitationCode();


            const {
                data,
                error
            } = await supabaseClient
                .from("invitation_codes")
                .select("id")
                .eq("code", newCode)
                .maybeSingle();


            if (error) {

                console.error(
                    "Error checking invitation code:",
                    error
                );


                await appAlert(
                    "Unable to generate invitation code.",
                    "Generation Failed"
                );


                return;

            }


            existingCode =
                !!data;

        }


        /*
         * Save the new code to Supabase.
         */

        const {
            data,
            error
        } = await supabaseClient
            .from("invitation_codes")
            .insert([
                {
                    code: newCode,
                    status: "active"
                }
            ])
            .select()
            .single();


        if (error) {

            console.error(
                "Error creating invitation code:",
                error
            );


            await appAlert(
                "Unable to create invitation code.",
                "Creation Failed"
            );


            return;

        }


        /*
         * Refresh the displayed codes.
         */

        await renderInvitationCodes();


        /*
         * Automatically copy the code.
         */

        let copied = false;


        if (
            navigator.clipboard &&
            navigator.clipboard.writeText
        ) {

            try {

                await navigator.clipboard.writeText(
                    newCode
                );

                copied = true;

            } catch (copyError) {

                console.warn(
                    "Could not copy invitation code:",
                    copyError
                );

            }

        }


        /*
         * Show result.
         */

        if (copied) {

            await appAlert(
                "New invitation code created:\n\n" +
                newCode +
                "\n\nThe code has also been copied to your clipboard.",
                "Invitation Code Created"
            );

        } else {

            await appAlert(
                "New invitation code created:\n\n" +
                newCode +
                "\n\nPlease copy the code manually.",
                "Invitation Code Created"
            );

        }


    } catch (error) {

        console.error(
            "Unexpected invitation code error:",
            error
        );


        await appAlert(
            "Unable to create invitation code.",
            "Creation Failed"
        );

    }

}


/* =========================================
   DISABLE INVITATION CODE
========================================= */

async function disableInvitationCode(id) {

    try {

        /*
         * Get the code first.
         */

        const {
            data: code,
            error: findError
        } = await supabaseClient
            .from("invitation_codes")
            .select("*")
            .eq("id", id)
            .single();


        if (findError || !code) {

            console.error(
                "Invitation code not found:",
                findError
            );


            await appAlert(
                "The invitation code could not be found.",
                "Code Not Found"
            );


            return;

        }


        /*
         * Only active codes can be disabled.
         */

        if (code.status !== "active") {

            return;

        }


        const confirmDisable =
            await appConfirm(
                "Disable invitation code " +
                code.code +
                "?",
                "Disable Invitation Code"
            );


        if (!confirmDisable) {

            return;

        }


        /*
         * Update status in Supabase.
         */

        const {
            error
        } = await supabaseClient
            .from("invitation_codes")
            .update({
                status: "disabled"
            })
            .eq("id", id);


        if (error) {

            console.error(
                "Error disabling invitation code:",
                error
            );


            await appAlert(
                "Unable to disable invitation code.",
                "Update Failed"
            );


            return;

        }


        await renderInvitationCodes();


        await appAlert(
            "The invitation code has been disabled.",
            "Code Disabled"
        );


    } catch (error) {

        console.error(
            "Unexpected disable error:",
            error
        );


        await appAlert(
            "Unable to disable invitation code.",
            "Update Failed"
        );

    }

}


/* =========================================
   COPY INVITATION CODE
========================================= */

async function copyInvitationCode(code) {

    if (
        navigator.clipboard &&
        navigator.clipboard.writeText
    ) {

        try {

            await navigator.clipboard.writeText(
                code
            );


            await appAlert(
                "Invitation code copied:\n\n" +
                code,
                "Code Copied"
            );


            return;

        } catch (error) {

            console.warn(
                "Clipboard copy failed:",
                error
            );

        }

    }


    /*
     * Clipboard is unavailable.
     * Show the code using the custom modal
     * instead of the browser prompt().
     */

    await appAlert(
        "Please copy this invitation code manually:\n\n" +
        code,
        "Copy Invitation Code"
    );

}


/* =========================================
   FORMAT DATE
========================================= */

function formatInvitationDate(dateString) {

    if (!dateString) {

        return "—";

    }


    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-PH",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeInvitationHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================================
   RENDER ACTIVE CODE
========================================= */

function renderActiveInvitationCode(code) {

    return `

        <div class="invitation-code-card">

            <div class="invitation-code-main">

                <div class="invitation-code-value">

                    ${escapeInvitationHTML(code.code)}

                </div>

                <span class="invitation-status active">
                    AVAILABLE
                </span>

            </div>


            <div class="invitation-code-details">

                Created:
                ${formatInvitationDate(code.created_at)}

            </div>


            <div class="invitation-actions">

                <button
                    class="invitation-copy-button"
                    onclick="copyInvitationCode('${code.code}')"
                >
                    📋 Copy Code
                </button>


                <button
                    class="invitation-disable-button"
                    onclick="disableInvitationCode('${code.id}')"
                >
                    Disable
                </button>

            </div>

        </div>

    `;

}

async function deleteCustomerAccount(invitationCode, usedBy) {

    const confirmed =
        await appConfirm(
            "Delete the account of " +
            usedBy +
            "?\n\n" +
            "This will permanently delete the customer account and the invitation code used by this account.",
            "Delete Customer Account"
        );

    if (!confirmed) {
        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.functions.invoke(
                "delete-customer-account",
                {
                    body: {
                        invitationCode:
                            invitationCode
                    }
                }
            );


        if (error) {

            console.error(
                "Delete customer account error:",
                error
            );

            await appAlert(
                "Unable to delete the customer account.\n\n" +
                error.message,
                "Deletion Failed"
            );

            return;
        }


        if (
            !data ||
            !data.success
        ) {

            await appAlert(
                data?.message ||
                "Unable to delete the customer account.",
                "Deletion Failed"
            );

            return;
        }


        await appAlert(
            "The account of " +
            usedBy +
            " and its invitation code have been deleted.",
            "Account Deleted"
        );


        /*
         * Realtime will normally refresh the list.
         * Refresh once here as well so the admin
         * sees the result immediately.
         */

        await renderInvitationCodes();


    } catch (error) {

        console.error(
            "Unexpected delete account error:",
            error
        );

        await appAlert(
            "Unable to delete the customer account. Please try again.",
            "Deletion Failed"
        );

    }

}
/* =========================================
   RENDER USED CODE
========================================= */

function renderUsedInvitationCode(code) {

    return `

        <div class="invitation-code-card">

            <div class="invitation-code-main">

                <div class="invitation-code-value">

                    ${escapeInvitationHTML(code.code)}

                </div>

                <span class="invitation-status used">
                    USED
                </span>

            </div>


            <div class="invitation-code-details">

                Used by:

                <strong>
                    ${escapeInvitationHTML(
                        code.used_by || "Unknown"
                    )}
                </strong>

                <br>

                Employee ID:

                <strong>
                    ${escapeInvitationHTML(
                        code.used_employee_id || "—"
                    )}
                </strong>

                <br>

                Used:

                ${formatInvitationDate(code.used_at)}

            </div>


            <div class="invitation-actions">

                <button
                    class="invitation-delete-button"
                    onclick="deleteCustomerAccount(
                        '${code.code}',
                        '${escapeInvitationHTML(
                            code.used_by || "Unknown"
                        )}'
                    )"
                >
                    Delete Account
                </button>

            </div>

        </div>

    `;

}


/* =========================================
   RENDER DISABLED CODE
========================================= */

function renderDisabledInvitationCode(code) {

    return `

        <div class="invitation-code-card">

            <div class="invitation-code-main">

                <div class="invitation-code-value">

                    ${escapeInvitationHTML(code.code)}

                </div>

                <span class="invitation-status disabled">
                    DISABLED
                </span>

            </div>


            <div class="invitation-code-details">

                Created:

                ${formatInvitationDate(code.created_at)}

            </div>

        </div>

    `;

}


/* =========================================
   RENDER ALL INVITATION CODES
========================================= */

async function renderInvitationCodes() {

    const codes =
        await getAllInvitationCodes();


    const activeContainer =
        document.getElementById(
            "active-invitation-codes"
        );


    const usedContainer =
        document.getElementById(
            "used-invitation-codes"
        );


    const disabledContainer =
        document.getElementById(
            "disabled-invitation-codes"
        );


    if (
        !activeContainer ||
        !usedContainer ||
        !disabledContainer
    ) {

        return;

    }


    const activeCodes =
        codes.filter(
            code =>
                code.status === "active"
        );


    const usedCodes =
        codes.filter(
            code =>
                code.status === "used"
        );


    const disabledCodes =
        codes.filter(
            code =>
                code.status === "disabled"
        );


    /* ======================================
       ACTIVE
    ====================================== */

    if (activeCodes.length === 0) {

        activeContainer.innerHTML = `

            <div class="invitation-empty">
                No available invitation codes.
            </div>

        `;

    } else {

        activeContainer.innerHTML =
            activeCodes
                .map(
                    renderActiveInvitationCode
                )
                .join("");

    }


    /* ======================================
       USED
    ====================================== */

    if (usedCodes.length === 0) {

        usedContainer.innerHTML = `

            <div class="invitation-empty">
                No used invitation codes yet.
            </div>

        `;

    } else {

        usedContainer.innerHTML =
            usedCodes
                .map(
                    renderUsedInvitationCode
                )
                .join("");

    }


    /* ======================================
       DISABLED
    ====================================== */

    if (disabledCodes.length === 0) {

        disabledContainer.innerHTML = `

            <div class="invitation-empty">
                No disabled invitation codes.
            </div>

        `;

    } else {

        disabledContainer.innerHTML =
            disabledCodes
                .map(
                    renderDisabledInvitationCode
                )
                .join("");

    }

}
/* =========================================
   INVITATION CODE REALTIME
========================================= */

let invitationRealtimeChannel = null;

function startInvitationRealtime() {

    if (
        typeof supabaseClient === "undefined" ||
        !supabaseClient
    ) {
        console.error(
            "Supabase client is not available for invitation realtime."
        );
        return;
    }

    if (invitationRealtimeChannel) {
        try {
            supabaseClient.removeChannel(
                invitationRealtimeChannel
            );
        } catch (error) {
            console.warn(
                "Unable to remove old invitation realtime channel:",
                error
            );
        }

        invitationRealtimeChannel = null;
    }

    console.log(
        "Starting Invitation Code Realtime..."
    );

    invitationRealtimeChannel =
        supabaseClient
            .channel("admin-invitation-realtime")

            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "invitation_codes"
                },
                async payload => {

                    console.log(
                        "================================="
                    );

                    console.log(
                        "INVITATION REALTIME EVENT RECEIVED:"
                    );

                    console.log(
                        payload
                    );

                    console.log(
                        "================================="
                    );

                    await renderInvitationCodes();
                }
            )

            .subscribe(status => {

                console.log(
                    "Invitation Realtime Status:",
                    status
                );

                if (status === "SUBSCRIBED") {

                    console.log(
                        "✅ INVITATION REALTIME CONNECTED"
                    );

                }

                if (status === "CHANNEL_ERROR") {

                    console.error(
                        "❌ INVITATION REALTIME CHANNEL ERROR"
                    );

                }

                if (status === "TIMED_OUT") {

                    console.error(
                        "❌ INVITATION REALTIME TIMED OUT"
                    );

                }

                if (status === "CLOSED") {

                    console.warn(
                        "⚠️ INVITATION REALTIME CLOSED"
                    );

                }
            });
}
/* =========================================
   INITIALIZE PAGE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        await renderInvitationCodes();
 startInvitationRealtime();
    }
);

