"use client";

import React from "react";
import { useRegisterStore } from "@/lib/store/registerStore";
import { Role } from "@/utils/Roles";
import { useRouter } from "next/navigation";

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const { 
    formData, 
    errors, 
    isSubmitting, 
    setField, 
    submitRegistration, 
    resetForm 
  } = useRegisterStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitRegistration();
    
    if (result.success) {
      // Show success message or redirect
      alert("Registration successful!");
      resetForm();
      router.push("/login");
    }
  };

  const handleReset = () => {
    resetForm();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-5">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
          Register
        </h1>

        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            className={`p-2 text-lg border rounded-md bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
              errors.fullName 
                ? "border-red-500 focus:ring-red-400" 
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.fullName && (
            <span className="text-sm text-red-600 dark:text-red-400">
              {errors.fullName}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setField("email", e.target.value)}
            className={`p-2 text-lg border rounded-md bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
              errors.email 
                ? "border-red-500 focus:ring-red-400" 
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.email && (
            <span className="text-sm text-red-600 dark:text-red-400">
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setField("password", e.target.value)}
            className={`p-2 text-lg border rounded-md bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
              errors.password 
                ? "border-red-500 focus:ring-red-400" 
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.password && (
            <span className="text-sm text-red-600 dark:text-red-400">
              {errors.password}
            </span>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            className={`p-2 text-lg border rounded-md bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 ${
              errors.confirmPassword 
                ? "border-red-500 focus:ring-red-400" 
                : "border-gray-300 focus:ring-blue-400"
            }`}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-600 dark:text-red-400">
              {errors.confirmPassword}
            </span>
          )}
        </div>

        {/* Role Selection */}
        <div className="flex flex-col gap-1">
          <select
            value={formData.role}
            onChange={(e) => setField("role", e.target.value as Role)}
            className="p-2 text-lg border border-gray-300 rounded-md bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Object.values(Role).map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
          {errors.role && (
            <span className="text-sm text-red-600 dark:text-red-400">
              {errors.role}
            </span>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 text-red-600 bg-red-100 dark:bg-red-900/30 rounded-md text-center">
            {errors.submit}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 p-3 text-lg font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            disabled={isSubmitting}
            className="p-3 text-lg font-bold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>

        {/* Link to Login */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <a 
            href="/login" 
            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
          >
            Login here
          </a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
