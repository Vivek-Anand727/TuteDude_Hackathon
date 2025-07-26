import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SanchayKart Flex</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6">
              🚀 Revolutionary Marketplace
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Vendors set their price,
              <br />
              Suppliers make offers
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              The first dynamic bidding marketplace for street vendors. Get raw materials at your preferred price through real-time negotiations and group buying.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register?role=vendor">
                <Button size="lg" className="w-full sm:w-auto">
                  I'm a Vendor
                </Button>
              </Link>
              <Link to="/register?role=supplier">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  I'm a Supplier
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How SanchayKart Flex Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Post Your Request</h3>
              <p className="text-sm text-muted-foreground">
                Vendors post what they need with their desired price and quantity
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Receive Offers</h3>
              <p className="text-sm text-muted-foreground">
                Suppliers browse and make competitive offers with their best prices
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Group Buying</h3>
              <p className="text-sm text-muted-foreground">
                Form groups to negotiate better prices and split bulk orders
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Deals</h3>
              <p className="text-sm text-muted-foreground">
                Complete transactions with confidence through our secure platform
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-card">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of vendors and suppliers who are already using SanchayKart Flex to get better deals.
          </p>
          <Link to="/register">
            <Button size="lg" className="shadow-glow">
              Start Trading Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 SanchayKart Flex. Revolutionizing vendor-supplier connections.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;