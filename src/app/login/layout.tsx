import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to the Inceptia 2K26 portal to access your team dashboard and check-in pass.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
