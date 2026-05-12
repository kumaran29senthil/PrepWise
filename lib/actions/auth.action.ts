"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

// Session duration (1 week)
const SESSION_DURATION = 60 * 60 * 24 * 7;

// Set session cookie
export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();

  // Create session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION * 1000, // milliseconds
  });

  // Set cookie in the browser
  cookieStore.set("session", sessionCookie, {
    maxAge: SESSION_DURATION,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    // check if user exists in db
    const userRecord = await db.collection("users").doc(uid).get();
    if (userRecord.exists)
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };

    // save user to db
    await db.collection("users").doc(uid).set({
      name,
      email,
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error: any) {
    console.error("Error creating user:", error);

    // Handle Firebase specific errors
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "This email is already in use",
      };
    }

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord)
      return {
        success: false,
        message: "User does not exist. Create an account.",
      };

    await setSessionCookie(idToken);
  } catch (error: any) {
    console.error("Sign in error:", error);

    return {
      success: false,
      message: "Failed to log into account. Please try again.",
    };
  }
}

// Sign out user by clearing the session cookie
export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

// Get current user from session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // get user info from db
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    // If user doc doesn't exist in Firestore but session is valid,
    // auto-create it from Firebase Auth to prevent redirect loops
    if (!userRecord.exists) {
      const firebaseUser = await auth.getUser(decodedClaims.uid);
      const newUserData = {
        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "User",
        email: firebaseUser.email || "",
      };
      await db.collection("users").doc(decodedClaims.uid).set(newUserData);
      return { ...newUserData, id: decodedClaims.uid } as User;
    }

    const data = userRecord.data();
    return {
      name: data?.name,
      email: data?.email,
      id: userRecord.id,
      isAdmin: data?.isAdmin || false,
    } as User;
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}

// ─── Admin Functions ────────────────────────────────────

// Get all users (admin only)
export async function getAllUsers(): Promise<AdminUserRow[]> {
  const currentUser = await getCurrentUser();
  if (!currentUser?.isAdmin) return [];

  // Batch-fetch everything in parallel (avoids N+1 per-user queries)
  const [usersSnapshot, allInterviewsSnap, allFeedbackSnap] = await Promise.all([
    db.collection("users").get(),
    db.collection("interviews").get(),
    db.collection("feedback").get(),
  ]);

  // Build per-user interview count map
  const interviewCountMap = new Map<string, number>();
  allInterviewsSnap.docs.forEach((doc) => {
    const uid = doc.data().userId;
    if (uid) interviewCountMap.set(uid, (interviewCountMap.get(uid) || 0) + 1);
  });

  // Build per-user score aggregation map
  const scoreMap = new Map<string, { total: number; count: number }>();
  allFeedbackSnap.docs.forEach((doc) => {
    const data = doc.data();
    const uid = data.userId;
    if (uid) {
      const existing = scoreMap.get(uid) || { total: 0, count: 0 };
      existing.total += data.totalScore || 0;
      existing.count += 1;
      scoreMap.set(uid, existing);
    }
  });

  const users: AdminUserRow[] = usersSnapshot.docs.map((doc) => {
    const data = doc.data();
    const userId = doc.id;
    const scores = scoreMap.get(userId);

    return {
      id: userId,
      name: data.name || "Unknown",
      email: data.email || "",
      isAdmin: data.isAdmin || false,
      interviewCount: interviewCountMap.get(userId) || 0,
      avgScore: scores ? Math.round(scores.total / scores.count) : 0,
    };
  });

  return users;
}

// Toggle admin status (admin only)
export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  const currentUser = await getCurrentUser();
  if (!currentUser?.isAdmin) return { success: false, error: "Unauthorized" };

  // Prevent removing your own admin status
  if (currentUser.id === userId && !isAdmin) {
    return { success: false, error: "Cannot remove your own admin status" };
  }

  try {
    await db.collection("users").doc(userId).update({ isAdmin });
    return { success: true };
  } catch (error) {
    console.error("Error toggling admin:", error);
    return { success: false, error: "Failed to update user" };
  }
}