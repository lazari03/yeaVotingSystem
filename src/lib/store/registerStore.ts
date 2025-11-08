import { create } from 'zustand';
import { Role } from '@/utils/Roles';

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

interface RegisterState {
  formData: RegisterFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  
  // Actions
  setField: (field: keyof RegisterFormData, value: string | Role) => void;
  clearError: (field: string) => void;
  validateForm: () => boolean;
  submitRegistration: () => Promise<{ success: boolean; error?: string }>;
  resetForm: () => void;
}

const initialFormData: RegisterFormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: Role.Admin,
};

export const useRegisterStore = create<RegisterState>((set, get) => ({
  formData: initialFormData,
  errors: {},
  isSubmitting: false,

  setField: (field, value) => {
    set((state) => ({
      formData: { ...state.formData, [field]: value },
      errors: { ...state.errors, [field]: '' }, // Clear field error on change
    }));
  },

  clearError: (field) => {
    set((state) => {
      const newErrors = { ...state.errors };
      delete newErrors[field];
      return { errors: newErrors };
    });
  },

  validateForm: () => {
    const { formData } = get();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    set({ errors: newErrors });
    return Object.keys(newErrors).length === 0;
  },

  submitRegistration: async () => {
    const { formData, validateForm } = get();

    if (!validateForm()) {
      return { success: false, error: 'Please fix validation errors' };
    }

    set({ isSubmitting: true, errors: {} });

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      set({ isSubmitting: false });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      set({ 
        isSubmitting: false,
        errors: { submit: errorMessage }
      });
      return { success: false, error: errorMessage };
    }
  },

  resetForm: () => {
    set({ formData: initialFormData, errors: {}, isSubmitting: false });
  },
}));
