import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
} from "firebase/auth";

export const handleCreateUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const handleSignIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const handleGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  console.log("In google", result);

  // Save in drizzle db
  // TODO
  return result;
};

export const handleSignOut = () => {
  return auth.signOut();
};

export const handlePasswordReset = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const handlePasswordChange = (password: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No user is currently logged in");
  }
  return updatePassword(currentUser, password);
};

export const handleEmailVerification = () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("No user is currently logged in");
  }
  return sendEmailVerification(currentUser, {
    url: `${window.location.origin}/`,
  });
};
