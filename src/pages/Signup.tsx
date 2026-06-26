import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const passwordRequirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[!@#$%^&*]/.test(password) },
  ];
  const passwordStrength = passwordRequirements.filter((r) => r.met).length;

  const { session, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session) {
      navigate("/dashboard");
    }
  }, [session, authLoading, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      // ── Step 0: Validate Referral Code (Optional) ──────────────────────────
      if (referralCode.trim()) {
        const formattedCode = referralCode.toUpperCase().trim();
        const { data: codeData, error: codeError } = await supabase
          .from("referral_codes")
          .select("code")
          .eq("code", formattedCode)
          .single();

        if (codeError || !codeData) {
          toast.error("Invalid referral code. Please check and try again.");
          setLoading(false);
          return;
        }
      }

      // ── Step 1: Supabase — create auth user FIRST (prevents Firebase orphans) ─
      // "Confirm email" is turned OFF in Supabase, so no email is sent.
      // Creating Supabase first ensures password reset always works.
      const { data: sbData, error: sbError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      let supabaseUserId = sbData?.user?.id;

      if (sbError) {
        if (!sbError.message.includes("already registered")) {
          throw sbError;
        }
        // Retry scenario — previous attempt created Supabase user but failed later.
        // Sign in to get the existing user's ID so we can still create a profile.
        const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
        if (signInData?.user?.id) {
          supabaseUserId = signInData.user.id;
        }
      }

      // ── Step 2: Firebase — create account + send verification email ──────────
      try {
        const firebaseCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(firebaseCredential.user, { displayName: name });
        await sendEmailVerification(firebaseCredential.user);
      } catch (firebaseError: any) {
        // Firebase failed — sign out of Supabase so the retry can work cleanly
        await supabase.auth.signOut();
        throw firebaseError;
      }

      // ── Step 3: Supabase — create profile row using Supabase UUID ─────────────
      if (supabaseUserId) {
        await supabase.from("profiles").upsert({
          id: supabaseUserId,
          full_name: name,
          email: email,
          referred_by: referralCode ? referralCode.toUpperCase().trim() : null,
          updated_at: new Date().toISOString(),
        });
      }

      // ── Step 4: Sign out of Supabase — user must verify email first ───────────
      await supabase.auth.signOut();

      toast.success("Account created! Please check your email to verify.");
      setVerificationSent(true);
    } catch (error: any) {
      const code = error.code;
      if (code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists.");
      } else if (code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else if (code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Verification sent screen ────────────────────────────────────────────────
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="border-0 shadow-medium">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-base mt-2">
                A verification link was sent to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <p className="text-sm text-center text-muted-foreground">
                Click the link in the email to verify your account. Once verified, come back and sign in.
              </p>
              <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-secondary/20 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">NAVSPRO</h1>
            <p className="text-xl text-primary-foreground/80 mb-8">Start Your Career Journey Today</p>

            <div className="glass-dark rounded-2xl p-6 border border-primary-foreground/10 max-w-md text-left">
              <h3 className="font-semibold text-lg mb-4">What you'll get:</h3>
              <ul className="space-y-3">
                {[
                  "Comprehensive career assessment",
                  "Personalized development roadmap",
                  "AI-powered mentor guidance",
                  "Progress tracking & insights",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-primary-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-primary-foreground/60 mt-6">
              Join 10,000+ students already on their path to success
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-primary">NAVSPRO</h1>
            <p className="text-muted-foreground">Start Your Career Journey</p>
          </div>

          <Card className="border-0 shadow-medium">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>Enter your details to get started with NAVSPRO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="referralCode"
                      type="text"
                      placeholder="Enter sales executive code (optional)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="pl-10 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {password && (
                    <div className="space-y-2 pt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${passwordStrength >= level
                                ? passwordStrength <= 1
                                  ? "bg-destructive"
                                  : passwordStrength <= 2
                                    ? "bg-warning"
                                    : passwordStrength <= 3
                                      ? "bg-secondary"
                                      : "bg-success"
                                : "bg-muted"
                              }`}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {passwordRequirements.map((req, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-1.5 text-xs transition-colors ${req.met ? "text-success" : "text-muted-foreground"
                              }`}
                          >
                            <Check className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
                            {req.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    className="mt-0.5"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground leading-relaxed">
                    I agree to the{" "}
                    <span className="text-secondary">Terms of Service</span>
                    {" "}and{" "}
                    <span className="text-secondary">Privacy Policy</span>
                  </Label>
                </div>

                <div className="pt-2">
                  <Button variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-secondary hover:text-secondary/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
