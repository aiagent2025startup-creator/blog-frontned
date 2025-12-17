import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Phone, ArrowRight, Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";

export default function LoginV2() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  const isValidEmail = (emailToCheck: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToCheck);
  };

  const isValidPassword = (passwordToCheck: string) => {
    return passwordToCheck.length >= 6;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!password || !isValidPassword(password)) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userFromResponse = data.data?.user ?? data.data ?? data.user ?? data;

      if (!userFromResponse || (!userFromResponse._id && !userFromResponse.id)) {
        toast({
          title: "Login Failed",
          description: "User data missing from response",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const userId = userFromResponse._id || userFromResponse.id;

      setUser({
        id: userId,
        name: userFromResponse.name || "",
        email: userFromResponse.email || "",
        avatar: userFromResponse.avatar || "",
        bio: userFromResponse.bio || "",
        followers: userFromResponse.followers || 0,
        following: userFromResponse.following || 0,
        blogCount: userFromResponse.blogCount || 0,
        totalLikes: userFromResponse.totalLikes || 0,
      });

      toast({
        title: "Welcome back!",
        description: `Logged in as ${userFromResponse.name}`,
      });

      setIsLoading(false);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to server",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    setMobileLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/auth/mobile/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Failed to Send OTP",
          description: data.message || "Invalid phone number",
          variant: "destructive",
        });
        setMobileLoading(false);
        return;
      }

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: `OTP sent to +91${phone}`,
      });
      setMobileLoading(false);
    } catch (error) {
      console.error("OTP error:", error);
      toast({
        title: "Error",
        description: "Failed to send OTP",
        variant: "destructive",
      });
      setMobileLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({
        title: "OTP Required",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }

    setMobileLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/auth/mobile/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Invalid OTP",
          description: data.message || "OTP verification failed",
          variant: "destructive",
        });
        setMobileLoading(false);
        return;
      }

      const userFromResponse = data.user;
      const userId = userFromResponse._id || userFromResponse.id;

      setUser({
        id: userId,
        name: userFromResponse.name || "",
        email: userFromResponse.email || "",
        avatar: userFromResponse.avatar || "",
        bio: userFromResponse.bio || "",
        followers: userFromResponse.followers || 0,
        following: userFromResponse.following || 0,
        blogCount: userFromResponse.blogCount || 0,
        totalLikes: userFromResponse.totalLikes || 0,
      });

      toast({
        title: "Welcome!",
        description: `Logged in as ${userFromResponse.name}`,
      });

      setMobileLoading(false);
      navigate("/");
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Error",
        description: "OTP verification failed",
        variant: "destructive",
      });
      setMobileLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    // In production, this would redirect to GitHub OAuth flow
    // For now, we'll show a placeholder
    toast({
      title: "GitHub Login",
      description: "Redirecting to GitHub...",
    });
    // window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=user:email`;
  };

  const handleGoogleLogin = async () => {
    // In production, this would use Google Sign-In SDK
    toast({
      title: "Google Login",
      description: "Redirecting to Google...",
    });
    // window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?...`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">B</span>
              </div>
              <span className="font-display font-bold text-2xl">BlogSphere</span>
            </Link>
            <h1 className="font-display font-bold text-3xl mb-2">Welcome back</h1>
            <p className="text-muted-foreground">
              Sign in to continue to your account
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
            </TabsList>

            {/* Email Tab */}
            <TabsContent value="email" className="space-y-6">
              <form onSubmit={handleEmailLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Remember me
                  </Label>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            {/* Mobile Tab */}
            <TabsContent value="mobile" className="space-y-6">
              <div className="space-y-6">
                {!otpSent ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          +91
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="9876543210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="pl-16"
                          maxLength={10}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We'll send a verification code to your number
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      onClick={handleSendOTP}
                      disabled={mobileLoading || phone.length !== 10}
                    >
                      {mobileLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">Enter OTP</Label>
                      <div className="relative">
                        <Input
                          id="otp"
                          type="text"
                          placeholder="000000"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="text-center text-2xl tracking-widest"
                          maxLength={6}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Check SMS for the 6-digit code
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="gradient"
                      size="lg"
                      className="w-full"
                      onClick={handleVerifyOTP}
                      disabled={mobileLoading || otp.length !== 6}
                    >
                      {mobileLoading ? "Verifying..." : "Verify OTP"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setPhone("");
                      }}
                    >
                      Change Number
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGoogleLogin}
              className="w-full"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGitHubLogin}
              className="w-full"
            >
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </Button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex flex-1 gradient-hero p-12 items-center justify-center">
        <div className="max-w-lg text-center text-primary-foreground">
          <h2 className="font-display font-bold text-4xl mb-4">
            Welcome to BlogSphere
          </h2>
          <p className="text-lg opacity-90 mb-8">
            Sign in to access your articles, connect with readers, and share your stories with millions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="font-display font-bold text-3xl">50K+</p>
              <p className="text-sm opacity-80">Writers</p>
            </div>
            <div className="w-px h-12 bg-primary-foreground/30" />
            <div className="text-center">
              <p className="font-display font-bold text-3xl">1M+</p>
              <p className="text-sm opacity-80">Articles</p>
            </div>
            <div className="w-px h-12 bg-primary-foreground/30" />
            <div className="text-center">
              <p className="font-display font-bold text-3xl">10M+</p>
              <p className="text-sm opacity-80">Readers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
