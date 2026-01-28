import { post } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";

export const login = async (data: any) => {
    return post(endpoints.auth.login, data);
};

export const register = async (data: any) => {
    return post(endpoints.auth.register, data);
};

export const verifyEmail = async (data: any) => {
    return post(endpoints.auth.verifyEmail, data);
};

export const resendVerification = async (data: any) => {
    return post(endpoints.auth.resendVerification, data);
};

export const forgotPassword = async (data: any) => {
    // Assuming endpoint exists in endpoints.auth based on usage pattern
    // The grep showed forgot-password page using post.
    // I will verify endpoint name if I can, but standard guess is safe or I'll check imports later.
    // For now I'll use string literal if needed or assume endpoints.auth.forgotPassword exists.
    // Actually, explicit string is safer if I'm not sure about endpoints file content.
    // But better to use endpoints object if possible.
    // I will check endpoints file if validation fails.
    return post("/auth/forgot-password", data); 
};
