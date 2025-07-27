import { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Store } from "lucide-react";
import { Link } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "vendor";
  const [selectedRole, setSelectedRole] = useState<"vendor" | "supplier">(defaultRole as "vendor" | "supplier");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Helper function to setup axios defaults after authentication
  const setupAxiosAuth = (token: string) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      alert("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, loginData);
      const { token, user } = res.data;

      console.log("Login response:", res.data); 

      if (!user?.role) {
        alert("Role missing in user response");
        return;
      }

      // ✅ Store credentials
      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("userName", user.name);
      
      // ✅ Setup axios defaults for future requests
      setupAxiosAuth(token);

      alert("Login successful!");
      navigate(`/${user.role}/dashboard`);
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Login failed";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const { name, email, password, location, phone } = registerData;
    
    if (!name || !email || !password || !location) {
      alert("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        ...registerData,
        role: selectedRole,
      });

      const { token, user } = res.data;

      // ✅ Store credentials
      localStorage.setItem("token", token);
      localStorage.setItem("role", selectedRole);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("userName", user.name);
      
      // ✅ Setup axios defaults for future requests
      setupAxiosAuth(token);

      alert("Registration successful!");
      navigate(`/${selectedRole}/dashboard`);
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Registration failed";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SanchayKart Flex</span>
          </Link>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* LOGIN */}
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    disabled={isLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </TabsContent>

              {/* REGISTER */}
              <TabsContent value="register" className="space-y-4">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label>I am a:</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(["vendor", "supplier"] as const).map((role) => (
                      <button
                        type="button"
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        disabled={isLoading}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedRole === role
                            ? "border-primary bg-primary/10 shadow-glow"
                            : "border-border bg-card hover:border-primary/50"
                        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          {role === "vendor" ? (
                            <ShoppingCart className="w-6 h-6 text-primary" />
                          ) : (
                            <Store className="w-6 h-6 text-primary" />
                          )}
                          <span className="text-sm font-medium capitalize">{role}</span>
                          <Badge variant="outline" className="text-xs">
                            {role === "vendor" ? "Buyer" : "Seller"}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Register Fields */}
                {[
                  {
                    label: "Full Name",
                    key: "name",
                    type: "text",
                    placeholder: "Enter your full name",
                    required: true,
                  },
                  {
                    label: "Email",
                    key: "email",
                    type: "email",
                    placeholder: "Enter your email",
                    required: true,
                  },
                  {
                    label: "Location",
                    key: "location",
                    type: "text",
                    placeholder: "City, Pincode",
                    required: true,
                  },
                  {
                    label: "Phone",
                    key: "phone",
                    type: "text",
                    placeholder: "Phone number",
                    required: false,
                  },
                  {
                    label: "Password",
                    key: "password",
                    type: "password",
                    placeholder: "Create a password",
                    required: true,
                  },
                ].map(({ label, key, type, placeholder, required }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>
                      {label} {required && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id={key}
                      type={type}
                      placeholder={placeholder}
                      value={(registerData as any)[key]}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          [key]: e.target.value,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                ))}

                <Button 
                  className="w-full" 
                  onClick={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading 
                    ? "Creating Account..." 
                    : `Create Account as ${selectedRole === "vendor" ? "Vendor" : "Supplier"}`
                  }
                </Button>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;