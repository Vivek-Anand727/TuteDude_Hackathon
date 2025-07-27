// components/vendor/CreateGroupDialog.jsx
"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const CreateGroupDialog = ({ open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    item: "",
    quantity: "",
    desiredPrice: "",
    location: "",
    maxMembers: 20,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.item || !formData.quantity || !formData.desiredPrice || !formData.location) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log("🚀 Creating group with data:", formData);
      console.log("🔑 Token:", localStorage.getItem("token") ? "Present" : "Missing");
      
      const response = await axios.post(
        `${backendURL}/api/groups/create`,
        formData,
        getAuthHeaders()
      );

      console.log("✅ Group created successfully:", response.data);

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message || "Group created successfully!",
        });

        // Reset form
        setFormData({
          name: "",
          description: "",
          item: "",
          quantity: "",
          desiredPrice: "",
          location: "",
          maxMembers: 20,
        });

        // Close dialog
        onOpenChange(false);
      }
    } catch (error) {
      console.error("❌ Error creating group:", error);
      console.error("Response:", error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to create group";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to buy items together and get better prices.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Rice Buyers Group"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item">Item *</Label>
              <Input
                id="item"
                type="text"
                placeholder="e.g., Basmati Rice"
                value={formData.item}
                onChange={(e) => handleInputChange("item", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the group..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Your Quantity *</Label>
              <Input
                id="quantity"
                type="text"
                placeholder="e.g., 50kg"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desiredPrice">Desired Price (₹) *</Label>
              <Input
                id="desiredPrice"
                type="number"
                placeholder="e.g., 100"
                value={formData.desiredPrice}
                onChange={(e) => handleInputChange("desiredPrice", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., Delhi"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxMembers">Max Members</Label>
              <Input
                id="maxMembers"
                type="number"
                placeholder="20"
                value={formData.maxMembers}
                onChange={(e) => handleInputChange("maxMembers", Number(e.target.value))}
                min={2}
                max={100}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
