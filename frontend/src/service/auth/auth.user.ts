import apiClient from "../../api/client";

// Types
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}


export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    accessToken: string;
  };
}

export const UserAuthService ={


  async register (
  payload: RegisterPayload
): Promise<RegisterResponse>{
  const { data } = await apiClient.post<RegisterResponse>(
    "/users/register",
    payload
  );
  return data;
},

//Login
async login(payload:LoginPayload):Promise<AuthResponse>{
  const {data} = await apiClient.post<AuthResponse>("/users/login",payload);
  return data
}
}

