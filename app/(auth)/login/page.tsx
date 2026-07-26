import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import { loginAction } from "../actions";

export const metadata: Metadata = { title: "Entrar · Lume" };

export default function LoginPage() {
  return <AuthCard mode="login" action={loginAction} />;
}
