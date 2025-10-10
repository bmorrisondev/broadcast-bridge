import { redirect } from "next/navigation";

export default function AppIndexPage() {
  return redirect("/app/episodes");
}
