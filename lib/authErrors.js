export function getAuthError(err) {
    switch (err.body?.code) {
        case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
            return {
                status: 409,
                body: {
                    success: false,
                    error: "An account with that email already exists.",
                },
            };
        
        case "PASSWORD_TOO_SHORT":
            return {
                status: 400,
                body: {
                    success: false,
                    error: "Password too short. Please choose a longer password.",
                },
            };
    
        default:
            return {
                status: 500,
                message: "Registration failed. Please try again later.",
            }
    }
}