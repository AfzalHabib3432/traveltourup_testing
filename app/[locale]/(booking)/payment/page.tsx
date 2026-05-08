import { redirect } from "next/navigation";

/** Legacy URL: payment is scoped under /cars, /hotels, or /flights. */
export default function Page() {
  redirect("/");
}
