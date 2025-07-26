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

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/login`, loginData);
      const { token, user } = res.data;

      console.log("Login response:", res.data); // 🔍 Helpful debug

      if (!user?.role) {
        alert("Role missing in user response");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      alert("Login successful!");
      navigate(`/${user.role}/dashboard`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Login failed");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/api/auth/register`, {
        ...registerData,
        role: selectedRole,
      });

      const { token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", selectedRole);

      alert("Registration successful!");
      navigate(`/${selectedRole}/dashboard`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "Registration failed");
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
                  />
                </div>
                <Button className="w-full" onClick={handleLogin}>
                  Sign In
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
                        className={`p-3 rounded-lg border transition-all ${
                          selectedRole === role
                            ? "border-primary bg-primary/10 shadow-glow"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
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
                  },
                  {
                    label: "Email",
                    key: "email",
                    type: "email",
                    placeholder: "Enter your email",
                  },
                  {
                    label: "Location",
                    key: "location",
                    type: "text",
                    placeholder: "City, Pincode",
                  },
                  {
                    label: "Phone",
                    key: "phone",
                    type: "text",
                    placeholder: "Phone number",
                  },
                  {
                    label: "Password",
                    key: "password",
                    type: "password",
                    placeholder: "Create a password",
                  },
                ].map(({ label, key, type, placeholder }) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key}>{label}</Label>
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
                    />
                  </div>
                ))}

                <Button className="w-full" onClick={handleRegister}>
                  Create Account as{" "}
                  {selectedRole === "vendor" ? "Vendor" : "Supplier"}
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
