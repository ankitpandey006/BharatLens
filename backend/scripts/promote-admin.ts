import { supabase } from "../src/config/supabase";

async function promoteToAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: ts-node scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const { data, error } = await supabase
    .from("users")
    .update({ role: "admin" })
    .eq("email", email)
    .select();

  if (error) {
    console.error("Error:", error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.error("User not found");
    process.exit(1);
  }

  console.log("User promoted to admin:", data[0]);
  process.exit(0);
}

promoteToAdmin();
