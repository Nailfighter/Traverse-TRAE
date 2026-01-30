import React, { useState, useEffect } from "react";
import {
  Alert,
  Form,
  Input,
  Checkbox,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "./RouterPage";
import { useNavigate } from "react-router-dom";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

async function handleEmailLogin({
  email,
  password,
  fullName,
  isSigningUp,
  navigate,
  setAuthErrorMessage,
}) {
  setAuthErrorMessage("");

  const { error } = isSigningUp
    ? await supabase.auth.signUp({
        email,
        password,
        options: { data: { fullName } },
      })
    : await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setAuthErrorMessage(error.message);
    return false;
  } else {
    setAuthErrorMessage("");
    if (isSigningUp) {
      addToast({
        title: "Sign Up Successful",
        description: "Please re-enter your password to login",
        color: "primary",
        duration: 5000,
      });

      return true;
    } else {
      navigate("/app");
      return true;
    }
  }
}

async function handlePasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  return { error };
}

const handleGuestLogin = async (navigate, setAuthErrorMessage) => {
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    setAuthErrorMessage(error.message);
    return false;
  } else {
    setAuthErrorMessage("");
    navigate("/app");
    return true;
  }
};

const Logo = () => (
  <div className="flex items-center gap-2 justify-center py-3 bg-white">
    <PaperAirplaneIcon className="h-8 w-8 text-black transform rotate-[315deg] translate-x-0.5" />

    <h1 className=" mt-2 text-3xl font-bold text-gray-800">Traverse</h1>
  </div>
);

const AuthPage = () => {
  const navigate = useNavigate();

  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState("");

  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [resetErrorMessage, setResetErrorMessage] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    const savedInfo = localStorage.getItem("rememberedInfo");
    if (savedInfo) {
      const { email, password, fullName } = JSON.parse(savedInfo);
      setEmail(email || "");
      setPassword(password || "");
      setFullName(fullName || "");
    }
  }, []);

  const validateCredentials = () => {
    let hasError = false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      hasError = true;
    } else {
      setEmailError("");
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters with one uppercase letter and one number"
      );
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (isSigningUp) {
      if (!fullName.trim()) {
        setFullNameError("Full name is required");
        hasError = true;
      } else {
        setFullNameError("");
      }
    } else {
      setFullNameError("");
    }

    return hasError;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (validateCredentials()) return;

    const success = await handleEmailLogin({
      email,
      password,
      fullName,
      isSigningUp,
      navigate,
      setAuthErrorMessage,
    });

    // If signup was successful, switch to sign in mode
    if (success && isSigningUp) {
      setIsSigningUp(false);
      // Clear form fields except email for convenience
      setPassword("");
      setFullName("");
    }
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setIsForgotPasswordOpen(true);
    setResetEmail(email); // Pre-fill with current email if available
    setResetEmailError("");
    setResetSuccessMessage("");
    setResetErrorMessage("");
  };

  const validateResetEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetEmailError("Please enter a valid email address");
      return false;
    }
    setResetEmailError("");
    return true;
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();

    if (!validateResetEmail()) return;

    setIsResetLoading(true);
    setResetErrorMessage("");

    try {
      const { error } = await handlePasswordReset(resetEmail);

      if (error) {
        setResetErrorMessage(error.message);
      } else {
        setResetSuccessMessage(
          "Password reset email sent successfully! Check your inbox."
        );
        setTimeout(() => {
          setIsForgotPasswordOpen(false);
          setResetSuccessMessage("");
        }, 3000);
      }
    } catch (err) {
      setResetErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsForgotPasswordOpen(false);
    setResetEmail("");
    setResetEmailError("");
    setResetSuccessMessage("");
    setResetErrorMessage("");
  };

  // Clear verification message when switching between sign up/sign in
  const handleToggleAuth = (newIsSigningUp) => {
    setIsSigningUp(newIsSigningUp);
    setAuthErrorMessage("");
  };

  const authBackgroundStyle = ["/ULURU.jpg", "/Sunset2.jpg"];
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    setBackgroundImage(
      authBackgroundStyle[
        Math.floor(Math.random() * authBackgroundStyle.length)
      ]
    );
  }, []);

  return (
    <>
      <div
        className="bg-cover bg-center h-screen w-full p-20 flex items-center justify-center bg-gray-100"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="w-full h-full rounded-4xl border-8 border-white overflow-hidden flex">
          <div className="relative flex flex-grow flex-col justify-end  p-10 text-white rounded-r-4xl overflow-visible bg-gradient-to-t from-black/70 via-black/40 to-transparent">
            <CutOut className="absolute top-0 right-0 fill-white" />
            <CutOut className="absolute bottom-0 right-0 rotate-90 fill-white" />
            <div className="z-10">
              <h1 className="text-6xl font-extrabold tracking-tight">
                Travel Smarter.
              </h1>
              <h2 className="text-2xl font-semibold text-gray-200 mt-2">
                Your next adventure, perfectly mapped.
              </h2>
            </div>
          </div>
          <div className="w-140 flex flex-col bg-white ">
            <Logo />
            <div className=" p-20 pt-10 flex-grow-1 flex flex-col gap-8 justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold">
                  {isSigningUp ? "Create Account" : "Welcome Back"}
                </h2>
                <p className="text-gray-500">
                  {isSigningUp
                    ? "Fill in your details to create an account"
                    : "Enter your email and password to access your trips"}
                </p>
              </div>
              <AnimatePresence>
                {authErrorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">
                            {authErrorMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Form
                className="w-full flex flex-col gap-8 items-center"
                onSubmit={(e) => {
                  handleEmailSubmit(e);
                }}
              >
                <motion.div
                  layout
                  className="w-full gap-4 flex flex-col"
                  transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                  style={{ minHeight: isSigningUp ? "280px" : "200px" }}
                >
                  <div className="w-full">
                    <label className="block mb-1 font-medium" htmlFor="email">
                      Email
                    </label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      className="w-full"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError("");
                      }}
                      isInvalid={!!emailError}
                      errorMessage={emailError}
                    />
                  </div>

                  <AnimatePresence initial={false}>
                    {isSigningUp && (
                      <motion.div
                        key="fullname"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                      >
                        <label
                          className="block mb-1 font-medium"
                          htmlFor="fullname"
                        >
                          Full Name
                        </label>
                        <Input
                          id="fullname"
                          placeholder="Enter your full name"
                          className="w-full"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (fullNameError) setFullNameError("");
                          }}
                          isInvalid={!!fullNameError}
                          errorMessage={fullNameError}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="w-full">
                    <label
                      className="block mb-1 font-medium"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <Input
                      id="password"
                      placeholder="Enter your password"
                      className="w-full"
                      type={isVisible ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError("");
                      }}
                      isInvalid={!!passwordError}
                      errorMessage={passwordError}
                      endContent={
                        <button
                          aria-label="toggle password visibility"
                          className="focus:outline-none"
                          type="button"
                          onClick={toggleVisibility}
                        >
                          {isVisible ? (
                            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                          ) : (
                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                          )}
                        </button>
                      }
                    />
                  </div>

                  <div className="w-full flex items-center justify-end text-sm font-medium">
                    {!isSigningUp && (
                      <a
                        href="#"
                        onClick={handleForgotPasswordClick}
                        className="text-black hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </a>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  layout
                  className="w-[70%] gap-4 flex flex-col"
                  transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
                >
                  <Button
                    name="emailSignIn"
                    type="submit"
                    variant="light"
                    className="bg-black w-full font-semibold text-white hover:!bg-[#2e2e2e]"
                  >
                    {isSigningUp ? "Sign Up" : "Sign In"}
                  </Button>

                  <p className="text-center text-sm text-gray-600">
                    {isSigningUp ? (
                      <>
                        Already have an account?{" "}
                        <motion.a
                          href="#"
                          className="text-black font-semibold hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleAuth(false);
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          Sign In
                        </motion.a>
                      </>
                    ) : (
                      <>
                        Don't have an account?{" "}
                        <motion.a
                          href="#"
                          className="text-black font-semibold hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            handleToggleAuth(true);
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          Sign Up
                        </motion.a>
                      </>
                    )}
                  </p>
                </motion.div>

                <div className="flex items-center w-full gap-4 ">
                  <hr className="flex-grow border-gray-300" />
                  <span className="text-sm text-gray-500">or</span>
                  <hr className="flex-grow border-gray-300" />
                </div>

                <div className="text-center w-[70%]">
                  <p className="text-sm text-gray-500 mb-2">
                    Not sure yet? Try one trip for free without signing up.
                  </p>
                  <Button
                    variant="flat"
                    className="w-full text-sm font-medium bg-gray-100 text-black hover:bg-gray-200"
                    onPress={() =>
                      handleGuestLogin(navigate, setAuthErrorMessage)
                    }
                  >
                    Try One Trip Free as Guest
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isForgotPasswordOpen}
        onClose={handleModalClose}
        placement="center"
        backdrop="blur"
      >
        <ModalContent>
          <form onSubmit={handlePasswordResetSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Reset Password</h2>
              <p className="text-sm text-gray-500 font-normal">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>
            </ModalHeader>
            <ModalBody>
              <AnimatePresence>
                {resetSuccessMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-green-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            {resetSuccessMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {resetErrorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-red-800">
                            {resetErrorMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="w-full">
                <label className="block mb-2 font-medium" htmlFor="resetEmail">
                  Email Address
                </label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="Enter your email address"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    if (resetEmailError) setResetEmailError("");
                  }}
                  isInvalid={!!resetEmailError}
                  errorMessage={resetEmailError}
                  autoFocus
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="light"
                onPress={handleModalClose}
                disabled={isResetLoading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={isResetLoading}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isResetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};
const CutOut = ({ className }) => (
  <svg width="25" height="25" viewBox="0 0 200 200" className={className}>
    <defs>
      <mask id="cutout">
        <rect width="200" height="200" fill="white" />
        <circle cx="0" cy="200" r="200" fill="black" />
      </mask>
    </defs>
    <rect width="200" height="200" fill="white" mask="url(#cutout)" />
  </svg>
);

export const EyeSlashFilledIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M21.2714 9.17834C20.9814 8.71834 20.6714 8.28834 20.3514 7.88834C19.9814 7.41834 19.2814 7.37834 18.8614 7.79834L15.8614 10.7983C16.0814 11.4583 16.1214 12.2183 15.9214 13.0083C15.5714 14.4183 14.4314 15.5583 13.0214 15.9083C12.2314 16.1083 11.4714 16.0683 10.8114 15.8483C10.8114 15.8483 9.38141 17.2783 8.35141 18.3083C7.85141 18.8083 8.01141 19.6883 8.68141 19.9483C9.75141 20.3583 10.8614 20.5683 12.0014 20.5683C13.7814 20.5683 15.5114 20.0483 17.0914 19.0783C18.7014 18.0783 20.1514 16.6083 21.3214 14.7383C22.2714 13.2283 22.2214 10.6883 21.2714 9.17834Z"
      fill="currentColor"
    />
    <path
      d="M14.0206 9.98062L9.98062 14.0206C9.47062 13.5006 9.14062 12.7806 9.14062 12.0006C9.14062 10.4306 10.4206 9.14062 12.0006 9.14062C12.7806 9.14062 13.5006 9.47062 14.0206 9.98062Z"
      fill="currentColor"
    />
    <path
      d="M18.25 5.74969L14.86 9.13969C14.13 8.39969 13.12 7.95969 12 7.95969C9.76 7.95969 7.96 9.76969 7.96 11.9997C7.96 13.1197 8.41 14.1297 9.14 14.8597L5.76 18.2497H5.75C4.64 17.3497 3.62 16.1997 2.75 14.8397C1.75 13.2697 1.75 10.7197 2.75 9.14969C3.91 7.32969 5.33 5.89969 6.91 4.91969C8.49 3.95969 10.22 3.42969 12 3.42969C14.23 3.42969 16.39 4.24969 18.25 5.74969Z"
      fill="currentColor"
    />
    <path
      d="M14.8581 11.9981C14.8581 13.5681 13.5781 14.8581 11.9981 14.8581C11.9381 14.8581 11.8881 14.8581 11.8281 14.8381L14.8381 11.8281C14.8581 11.8881 14.8581 11.9381 14.8581 11.9981Z"
      fill="currentColor"
    />
    <path
      d="M21.7689 2.22891C21.4689 1.92891 20.9789 1.92891 20.6789 2.22891L2.22891 20.6889C1.92891 20.9889 1.92891 21.4789 2.22891 21.7789C2.37891 21.9189 2.56891 21.9989 2.76891 21.9989C2.96891 21.9989 3.15891 21.9189 3.30891 21.7689L21.7689 3.30891C22.0789 3.00891 22.0789 2.52891 21.7689 2.22891Z"
      fill="currentColor"
    />
  </svg>
);

export const EyeFilledIcon = (props) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M21.25 9.14969C18.94 5.51969 15.56 3.42969 12 3.42969C10.22 3.42969 8.49 3.94969 6.91 4.91969C5.33 5.89969 3.91 7.32969 2.75 9.14969C1.75 10.7197 1.75 13.2697 2.75 14.8397C5.06 18.4797 8.44 20.5597 12 20.5597C13.78 20.5597 15.51 20.0397 17.09 19.0697C18.67 18.0897 20.09 16.6597 21.25 14.8397C22.25 13.2797 22.25 10.7197 21.25 9.14969ZM12 16.0397C9.76 16.0397 7.96 14.2297 7.96 11.9997C7.96 9.76969 9.76 7.95969 12 7.95969C14.24 7.95969 16.04 9.76969 16.04 11.9997C16.04 14.2297 14.24 16.0397 12 16.0397Z"
      fill="currentColor"
    />
    <circle
      cx="12"
      cy="11.9997"
      r="3.99999"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);

export default AuthPage;
