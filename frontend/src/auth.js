import { useOktaAuth } from "@okta/okta-react";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const { authState } = useOktaAuth();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    if (!authState?.isAuthenticated) {
      setUser(null);
      setRole(null);
      return;
    }

    const claims = authState.idToken?.claims;
    const groups = claims?.groups || [];

    const derivedRole = groups.includes("consumer")
      ? "consumer"
      : groups.includes("data_provider")
      ? "data provider"
      : groups.includes("data_recipient")
      ? "data recipient"
      : null;

    setUser({
      email: claims?.email,
      firstName: claims?.firstName,
      sub: claims?.sub,
      groups,
    });

    setRole(derivedRole);
  }, [authState]);

  return { user, role };
};
