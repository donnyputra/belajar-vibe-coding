import { db } from "../db/index";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function registerUser(payload: any) {
  const { name, email, password } = payload;

  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });
}

export async function loginUser(payload: any) {
  const { email, password } = payload;

  // Cari user berdasarkan email
  const result = await db.select().from(users).where(eq(users.email, email));
  if (result.length === 0) {
    throw new Error("Email atau password salah");
  }

  const user = result[0];

  // Cocokkan password dengan hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  // Generate UUID token
  const token = crypto.randomUUID();

  // Simpan session ke database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
}
