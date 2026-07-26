import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import { registerAction } from "../actions";

export const metadata: Metadata = { title: "Criar conta · Lume" };

export default function RegistroPage() {
  return <AuthCard mode="registro" action={registerAction} />;
}
