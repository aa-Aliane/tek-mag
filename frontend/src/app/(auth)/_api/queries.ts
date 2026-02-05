import { login, logout, fetchCurrentUser } from "./fethcers";
import { useMutation } from "@tanstack/react-query";

interface loginParams {
  username: string;
  password: string;
}
const useLogin = () => {
  // Dans la v5, tout doit être passé dans un objet { mutationFn, ... }
  const { mutate, isPending, error } = useMutation({
    mutationFn: ({ username, password }: loginParams) =>
      login(username, password),
  });

  // Note : 'isLoading' est devenu 'isPending' dans la v5 pour les mutations
  return { login: mutate, isLoading: isPending, error };
};
export { useLogin };
