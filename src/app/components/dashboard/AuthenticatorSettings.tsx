import { useState, useEffect } from "react";
import { Mail, Smartphone, Shield, Check, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { authAPI } from "../../../api/client.js";

interface AuthenticatorSettingsProps {
  userEmail: string;
  onLogout: () => void;
}

export function AuthenticatorSettings({ userEmail, onLogout }: AuthenticatorSettingsProps) {
  const [authMethod, setAuthMethod] = useState<"email" | "sms">("email");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await authAPI.getProfile();
        if (response.user) {
          setTwoFactorEnabled(response.user.twoFactorEnabled || true);
          setAuthMethod(response.user.twoFactorMethod || "email");
          setPhoneNumber(response.user.phoneNumber || "");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    
    try {
      await authAPI.updateProfile({
        twoFactorEnabled,
        twoFactorMethod: authMethod,
        phoneNumber: authMethod === "sms" ? phoneNumber : "",
      });
      setSuccess("Security settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleManageTrustedDevices = () => {
    alert("Manage Trusted Devices\n\nYou can manage your trusted devices from here. Currently, your Chrome on Windows device is trusted for 30 days.");
  };

  const handleResetToDefault = () => {
    if (confirm("Are you sure you want to reset all security settings to default?")) {
      setAuthMethod("email");
      setPhoneNumber("");
      setTwoFactorEnabled(true);
      setSuccess("Settings have been reset to default!");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl">Security Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your authentication and security preferences
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Require verification code for login
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>

          {twoFactorEnabled && (
            <>
              <Separator />
              
              <div className="space-y-4">
                <Label>Choose Authentication Method</Label>
                <RadioGroup value={authMethod} onValueChange={(value: "email" | "sms") => setAuthMethod(value)}>
                  {/* Email Authentication */}
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="email" id="email" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="email" className="cursor-pointer flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Email Verification
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive verification codes via email
                      </p>
                      <div className="mt-3 bg-blue-50 p-3 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Email:</strong> {userEmail}
                        </p>
                      </div>
                      {authMethod === "email" && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          <span>Currently active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SMS Authentication */}
                  <div className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="sms" id="sms" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="sms" className="cursor-pointer flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-green-600" />
                        SMS Verification
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Receive verification codes via text message
                      </p>
                      <div className="mt-3 space-y-2">
                        <Label htmlFor="phone">Mobile Number</Label>
                        <Input
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+63 912 345 6789"
                        />
                      </div>
                      {authMethod === "sms" && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                          <Check className="h-4 w-4" />
                          <span>Currently active</span>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm text-yellow-800">
                      Security Recommendation
                    </p>
                    <p className="text-xs text-yellow-700">
                      We recommend keeping 2FA enabled for maximum security. 
                      {authMethod === "sms" 
                        ? " SMS verification provides instant access to codes on your mobile device."
                        : " Email verification is secure and works on any device with internet access."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Trusted Devices */}
      <Card>
        <CardHeader>
          <CardTitle>Trusted Devices</CardTitle>
          <CardDescription>
            Devices that won't require verification for 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm">Current Device</p>
                <p className="text-xs text-muted-foreground">Chrome on Windows • Added today</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleManageTrustedDevices}
            >
              Manage Trusted Devices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
        <Button 
          variant="outline"
          onClick={handleResetToDefault}
        >
          Reset to Default
        </Button>
      </div>

      {/* Logout Section */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <LogOut className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-600">Logout</CardTitle>
          </div>
          <CardDescription>
            Sign out of your account on this device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You will be signed out of your E-wallet account and returned to the login page.
          </p>
          <Button
            onClick={() => {
              if (confirm("Are you sure you want to logout?")) {
                onLogout();
              }
            }}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
