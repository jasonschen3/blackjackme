import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useAuth();
  console.log(currentUser);

  return currentUser ? <>{children}</> : <Navigate to="/login" />;
}
