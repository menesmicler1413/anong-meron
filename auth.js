// ==========================================
// ANONG MERON? - AUTHENTICATION SYSTEM
// ==========================================


// ==========================================
// SUPABASE CHECK
// ==========================================

function isSupabaseReady() {

    return (
        typeof supabaseClient !== "undefined" &&
        supabaseClient
    );

}


// ==========================================
// CURRENT USER
// ==========================================

function getCurrentUser() {

    const savedUser =
        localStorage.getItem("currentUser");

    if (!savedUser) {
        return null;
    }

    try {

        return JSON.parse(savedUser);

    } catch (error) {

        console.error(
            "Invalid current user:",
            error
        );

        localStorage.removeItem("currentUser");

        return null;
    }

}


// ==========================================
// LOGOUT
// ==========================================


async function logoutUser() {

    localStorage.removeItem("currentUser");

    if (isSupabaseReady()) {

        try {

            await supabaseClient.auth.signOut();

        } catch (error) {

            console.error(
                "Supabase logout error:",
                error
            );

        }

    }

}

// ==========================================
// REQUIRE CUSTOMER LOGIN
// ==========================================

function requireCustomerLogin() {

    const currentUser =
        getCurrentUser();

    if (
        !currentUser ||
        currentUser.role !== "customer"
    ) {

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}

// ==========================================
// REQUIRE ADMIN LOGIN
// ==========================================

function requireAdminLogin() {

    const currentUser =
        getCurrentUser();

    if (
        !currentUser ||
        currentUser.role !== "admin"
    ) {

        window.location.href =
            "admin-login.html";

        return false;
    }

    return true;
}


// ==========================================
// INTERNAL AUTH EMAIL
// ==========================================

function createInternalAuthEmail(username) {

    return (
        String(username || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9._-]/g, "")
        +
        "@example.com"
    );

}


// ==========================================
// REGISTER CUSTOMER
// ==========================================

async function registerCustomer(
    fullName,
    employeeId,
    department,
    username,
    password,
    invitationCode
) {

    // ======================================
    // NORMALIZE INPUT
    // ======================================

    fullName =
        String(fullName || "").trim();

    employeeId =
        String(employeeId || "").trim();

    department =
        String(department || "").trim();

    username =
        String(username || "")
            .trim()
            .toLowerCase();

    password =
        String(password || "");

    invitationCode =
        String(invitationCode || "")
            .trim()
            .toUpperCase();


    // ======================================
    // SUPABASE CHECK
    // ======================================

    if (!isSupabaseReady()) {

        return {
            success: false,
            message:
                "Supabase is not available."
        };

    }


    // ======================================
    // REQUIRED FIELDS
    // ======================================

    if (
        !fullName ||
        !employeeId ||
        !department ||
        !username ||
        !password ||
        !invitationCode
    ) {

        return {
            success: false,
            message:
                "Please complete all fields."
        };

    }


    // ======================================
    // USERNAME VALIDATION
    // ======================================

    if (
        username.length < 3
    ) {

        return {
            success: false,
            message:
                "Username must be at least 3 characters."
        };

    }


    if (
        !/^[a-z0-9._-]+$/.test(username)
    ) {

        return {
            success: false,
            message:
                "Username can only contain letters, numbers, dot, underscore, or dash."
        };

    }


    // ======================================
    // PASSWORD VALIDATION
    // ======================================

    if (
        password.length < 6
    ) {

        return {
            success: false,
            message:
                "Password must be at least 6 characters."
        };

    }


    // ======================================
    // CALL EDGE FUNCTION
    // ======================================

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .functions
                .invoke(
                    "register-customer",
                    {
                        body: {

                            fullName:
                                fullName,

                            employeeId:
                                employeeId,

                            department:
                                department,

                            username:
                                username,

                            password:
                                password,

                            invitationCode:
                                invitationCode

                        }
                    }
                );


        // ==================================
        // EDGE FUNCTION ERROR
        // ==================================

        if (error) {

            console.error(
                "Registration function error:",
                error
            );

            let message =
                "Unable to connect to the registration server.";

            try {

                if (
                    error.context
                ) {

                    const response =
                        error.context;

                    if (
                        typeof response.json ===
                        "function"
                    ) {

                        const errorData =
                            await response.json();

                        if (
                            errorData &&
                            errorData.message
                        ) {

                            message =
                                errorData.message;

                        }

                    }

                }

            } catch (
                parseError
            ) {

                console.warn(
                    "Could not parse registration error:",
                    parseError
                );

            }

            return {
                success: false,
                message:
                    message
            };

        }


        // ==================================
        // NO RESPONSE
        // ==================================

        if (!data) {

            return {
                success: false,
                message:
                    "No response from registration server."
            };

        }


        // ==================================
        // RETURN RESULT
        // ==================================

        return {

            success:
                data.success === true,

            message:
                data.message ||
                (
                    data.success
                        ? "Account created successfully!"
                        : "Unable to create account."
                )

        };


    } catch (error) {

        console.error(
            "Customer registration error:",
            error
        );

        return {
            success: false,
            message:
                "Something went wrong while creating the account."
        };

    }

}


// ==========================================
// CUSTOMER LOGIN
// ==========================================

async function loginCustomer(
    username,
    password
) {

    username =
        String(username || "")
            .trim()
            .toLowerCase();

    password =
        String(password || "");


    // ======================================
    // VALIDATE
    // ======================================

    if (
        !username ||
        !password
    ) {

        return {

            success: false,

            message:
                "Please enter your username and password."

        };

    }


    // ======================================
    // SUPABASE CHECK
    // ======================================

    if (!isSupabaseReady()) {

        return {

            success: false,

            message:
                "Supabase is not available."

        };

    }


    // ======================================
    // INTERNAL AUTH EMAIL
    // ======================================

    const authEmail =
        createInternalAuthEmail(
            username
        );


    // ======================================
    // SUPABASE LOGIN
    // ======================================

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .signInWithPassword({

                email:
                    authEmail,

                password:
                    password

            });


    if (error) {

        console.error(
            "Customer login error:",
            error
        );

        return {

            success: false,

            message:
                "Incorrect username or password."

        };

    }


    const user =
        data.user;


    if (!user) {

        return {

            success: false,

            message:
                "Unable to load account."

        };

    }


    // ======================================
    // GET PROFILE
    // ======================================

    const {
        data: profile,
        error: profileError
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                user.id
            )
            .single();


    if (
        profileError ||
        !profile
    ) {

        await supabaseClient
            .auth
            .signOut();

        return {

            success: false,

            message:
                "Employee profile not found."

        };

    }


    // ======================================
    // CHECK ROLE
    // ======================================

    if (
        profile.role !== "customer"
    ) {

        await supabaseClient
            .auth
            .signOut();

        return {

            success: false,

            message:
                "This account is not an employee account."

        };

    }


    // ======================================
    // CURRENT USER
    // ======================================

    const currentUser = {

        id:
            user.id,

        fullName:
            profile.full_name,

        employeeId:
            profile.employee_id || "",

        department:
            profile.department || "",

        username:
            profile.username,

        role:
            profile.role

    };


    // ======================================
    // SAVE CURRENT USER
    // ======================================

    localStorage.setItem(
        "currentUser",
        JSON.stringify(
            currentUser
        )
    );


    return {

        success: true,

        user:
            currentUser

    };

}


// ==========================================
// ADMIN LOGIN
// ==========================================

async function loginAdmin(email, password) {

    if (!isSupabaseReady()) {
        throw new Error("Supabase is not available.");
    }

    const cleanEmail = String(email || "").trim();

    if (!cleanEmail) {
        throw new Error("Please enter your admin email.");
    }

    if (!password) {
        throw new Error("Please enter your password.");
    }


    // ==========================================
    // SUPABASE AUTH LOGIN
    // ==========================================

    const {
        data: authData,
        error: authError
    } = await supabaseClient.auth.signInWithPassword({
        email: cleanEmail,
        password: password
    });


    if (authError) {

        console.error(
            "Admin authentication error:",
            authError
        );

        throw new Error(
            "Invalid admin email or password."
        );

    }


    const authUser = authData?.user;

    if (!authUser) {

        throw new Error(
            "Unable to identify admin account."
        );

    }


    // ==========================================
    // GET PROFILE
    // ==========================================

    const {
        data: profile,
        error: profileError
    } = await supabaseClient
        .from("profiles")
        .select(`
            id,
            full_name,
            employee_id,
            department,
            username,
            role
        `)
        .eq("id", authUser.id)
        .single();


    if (profileError) {

        console.error(
            "Admin profile error:",
            profileError
        );

        await supabaseClient.auth.signOut();

        throw new Error(
            "Admin profile could not be loaded."
        );

    }


    // ==========================================
    // ADMIN ROLE CHECK
    // ==========================================

    if (!profile || profile.role !== "admin") {

        await supabaseClient.auth.signOut();

        throw new Error(
            "This account does not have administrator access."
        );

    }


    // ==========================================
    // SAVE CURRENT ADMIN
    // ==========================================

    const currentUser = {

        id: profile.id,

        fullName:
            profile.full_name || "",

        employeeId:
            profile.employee_id || "",

        department:
            profile.department || "",

        username:
            profile.username || "",

        role:
            profile.role,

        email:
            authUser.email || cleanEmail

    };


    localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
    );


    console.log(
        "Admin login successful:",
        currentUser
    );


    return currentUser;
}


// ==========================================
// TOGGLE PASSWORD
// ==========================================

function togglePassword(
    inputId
) {

    const input =
        document.getElementById(
            inputId
        );

    if (!input) {
        return;
    }


    if (
        input.type ===
        "password"
    ) {

        input.type =
            "text";

    } else {

        input.type =
            "password";

    }

}