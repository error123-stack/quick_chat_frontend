import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { AuthContext } from "./authContext";

// ✅ Set backend URL from environment variable
const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  // Store authentication state
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // list of currently online users
  const [socket, setSocket] = useState(null); // active socket connection
  const socketRef = useRef(null); // reference to socket instance (stable across re-renders)
  const [pendingVerificationEmail, setPendingVerificationEmail] =
    useState(null);
  const [pendingVerificationInfo, setPendingVerificationInfo] = useState(null);

  const connectSocket = useCallback((userData) => {
    if (!userData || socketRef.current) return;

    const nextSocket = io(backendUrl, {
      query: { userId: userData._id },
      transports: ["websocket"],
      autoConnect: false,
    });
    socketRef.current = nextSocket;
    setSocket(nextSocket);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
    };
    const handleOnlineUsers = (userIds) => {
      setOnlineUsers((prev) => {
        if (
          prev.length === userIds.length &&
          prev.every((userId, index) => userId === userIds[index])
        ) {
          return prev;
        }
        return userIds;
      });
    };
    const handleDisconnect = () => setOnlineUsers([]);

    socket.on("connect", handleConnect);
    socket.on("getOnlineUsers", handleOnlineUsers);
    socket.on("disconnect", handleDisconnect);
    socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("getOnlineUsers", handleOnlineUsers);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [socket]);

  const checkAuth = useCallback(
    async (signal) => {
      try {
        const { data } = await axios.get("/api/auth/check", { signal });
        if (!data.success) return null;
        setAuthUser(data.user);
        connectSocket(data.user);
        return data.user;
      } catch (error) {
        if (error.response?.status !== 401 && error.code !== "ERR_CANCELED") {
          toast.error(error.message);
        }
        return null;
      }
    },
    [connectSocket],
  );

  // ✅ Handle login / signup
  const login = useCallback(
    async (state, credentials) => {
      try {
        const { data } = await axios.post(`/api/auth/${state}`, credentials);
        if (data.success) {
          if (data.requiresVerification) {
            setPendingVerificationEmail(data.email || credentials.email);
            setPendingVerificationInfo({
              emailSent: data.emailSent,
              otp: data.otp,
              verifyUrl: data.verifyUrl,
              devOtp: data.devOtp,
              devVerifyUrl: data.devVerifyUrl,
              mailError: data.mailError,
              userFacingMailError: data.userFacingMailError,
              mailProvider: data.mailProvider,
            });
            toast.success(data.message);
            return { requiresVerification: true };
          }

          if (data.userData) {
            setAuthUser(data.userData);
            setPendingVerificationEmail(null);
            setPendingVerificationInfo(null);
            toast.success(data.message);
            connectSocket(data.userData); // connect to socket after login
            return { success: true };
          }

          toast.success(data.message);
          return { success: true };
        } else {
          if (data.requiresVerification) {
            setPendingVerificationEmail(data.email || credentials.email);
            setPendingVerificationInfo({
              emailSent: data.emailSent,
              otp: data.otp,
              verifyUrl: data.verifyUrl,
              devOtp: data.devOtp,
              devVerifyUrl: data.devVerifyUrl,
              mailError: data.mailError,
              userFacingMailError: data.userFacingMailError,
              mailProvider: data.mailProvider,
            });
          }
          toast.error(data.message);
          return {
            success: false,
            requiresVerification: data.requiresVerification || false,
          };
        }
      } catch (error) {
        toast.error(error.message);
        return { success: false };
      }
    },
    [connectSocket],
  );

  // ✅ Verify email with OTP or token
  const verifyEmail = useCallback(
    async (payload) => {
      try {
        const { data } = await axios.post("/api/auth/verify-email", payload);
        if (data.success) {
          setAuthUser(data.userData);
          setPendingVerificationEmail(null);
          setPendingVerificationInfo(null);
          toast.success(data.message);
          connectSocket(data.userData);
          return { success: true };
        } else {
          toast.error(data.message);
          return { success: false, message: data.message };
        }
      } catch (error) {
        toast.error(error.message);
        return { success: false, message: error.message };
      }
    },
    [connectSocket],
  );

  // ✅ Resend verification email
  const resendVerificationEmail = useCallback(async (email) => {
    try {
      const { data } = await axios.post("/api/auth/resend-verification-email", {
        email,
      });
      if (data.success) {
        setPendingVerificationInfo({
          emailSent: data.emailSent,
          otp: data.otp,
          verifyUrl: data.verifyUrl,
          devOtp: data.devOtp,
          devVerifyUrl: data.devVerifyUrl,
          mailError: data.mailError,
          userFacingMailError: data.userFacingMailError,
          mailProvider: data.mailProvider,
        });
        if (data.alreadyVerified) {
          toast.success(data.message);
          return { success: true, alreadyVerified: true };
        }
        toast.success(data.message);
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false };
      }
    } catch (error) {
      toast.error(error.message);
      return { success: false };
    }
  }, []);

  // ✅ Clear verification state
  const clearVerificationState = useCallback(() => {
    setPendingVerificationEmail(null);
    setPendingVerificationInfo(null);
  }, []);

  // ✅ Complete OAuth login after redirect callback
  const completeOAuthLogin = useCallback(async () => {
    const user = await checkAuth();
    if (!user) throw new Error("Authentication failed");
    toast.success("Signed in successfully");
  }, [checkAuth]);

  // ✅ Logout user and clear session
  const logout = useCallback(async () => {
    try {
      await axios.post("/api/auth/logout");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAuthUser(null);
      setOnlineUsers([]);
      setPendingVerificationEmail(null);
      setPendingVerificationInfo(null);
      setSocket(null);
    }
  }, []);

  // ✅ Update user profile
  const updateProfile = useCallback(async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user); // update user state
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, []);

  // Restore the session from the HttpOnly auth cookie.
  useEffect(() => {
    localStorage.removeItem("token");
    const controller = new AbortController();
    checkAuth(controller.signal);

    return () => {
      controller.abort();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [checkAuth]);

  // ✅ Values exposed to other components
  const value = useMemo(
    () => ({
      axios,
      authUser,
      onlineUsers,
      socket,
      login,
      verifyEmail,
      resendVerificationEmail,
      clearVerificationState,
      logout,
      updateProfile,
      completeOAuthLogin,
      pendingVerificationEmail,
      pendingVerificationInfo,
    }),
    [
      authUser,
      onlineUsers,
      socket,
      login,
      verifyEmail,
      resendVerificationEmail,
      clearVerificationState,
      logout,
      updateProfile,
      completeOAuthLogin,
      pendingVerificationEmail,
      pendingVerificationInfo,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
