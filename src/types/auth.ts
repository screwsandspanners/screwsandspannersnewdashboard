export interface LoginResponse {
    status: boolean;
    message: string;
    has_otp_verification: boolean;
    token: string;
    user_data: UserData;
    business: Business;
    bank: Bank;
  }
  
  export interface UserData {
    user_id: number;
    uniq_id: string;
    type: string;
    firstname: string;
    lastname: string;
    email: string;
    phone_number: number;
    avatar: string | null;
    trades: Trade[];
  }
  
  export interface Trade {
    // Add fields when the backend starts returning them.
    [key: string]: any;
  }
  
  export interface Business {
    id: number | null;
    user_id: number;
    registration_number: string | null;
    year_incorporation: number | null;
    business_name: string | null;
    business_email: string | null;
    business_address: string | null;
    badge: boolean;
    verified: boolean;
    latitude: number | null;
    longitude: number | null;
    business_phone: string | null;
    phone_code: string | null;
    documents: string | null;
    id_card: string | null;
    upload_id: string | null;
    selected_skill: string | null;
    means_of_identification: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  }
  
  export interface Bank {
    id: number | null;
    user_id: number;
    bvn: string | null;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_account_name: string | null;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  }