import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, Cookie } from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  preferences: boolean;
  analytical: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    preferences: true,
    analytical: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsOpen(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      preferences: true,
      analytical: true,
      marketing: true,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setIsOpen(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      preferences: false,
      analytical: false,
      marketing: false,
    };
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    setIsOpen(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setIsOpen(false);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-muted-foreground text-sm">
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
            By clicking "Accept All", you consent to our use of cookies.
          </p>

          {!showDetails ? (
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDetails(true)}
                className="w-full justify-between"
              >
                Customize Settings
                <ChevronDown className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRejectAll}
                  className="flex-1"
                >
                  Reject All
                </Button>
                <Button
                  variant="default"
                  onClick={handleAcceptAll}
                  className="flex-1"
                >
                  Accept All
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setShowDetails(false)}
                className="w-full justify-between p-0 h-auto font-normal"
              >
                Hide Details
                <ChevronUp className="h-4 w-4" />
              </Button>

              {/* Necessary Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Necessary cookies</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Some cookies are required to provide core functionality. The website won't function 
                      properly without these cookies and they are enabled by default and cannot be disabled.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.necessary}
                    disabled={true}
                    className="ml-4"
                  />
                </div>
                <div className="ml-4 space-y-1 text-sm text-muted-foreground">
                  <div>• Authentication & Session Management</div>
                  <div>• Security & CSRF Protection</div>
                  <div>• Essential Site Functionality</div>
                </div>
              </div>

              <Separator />

              {/* Preferences Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Preferences</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Preference cookies enable the website to remember information to customize 
                      how the website looks or behaves for each user. This may include storing selected 
                      currency, region, language or color theme.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.preferences}
                    onCheckedChange={(checked) => updatePreference('preferences', checked)}
                    className="ml-4"
                  />
                </div>
                <div className="ml-4 space-y-1 text-sm text-muted-foreground">
                  <div>• Theme & Language Settings</div>
                  <div>• User Interface Preferences</div>
                  <div>• Location & Currency Settings</div>
                </div>
              </div>

              <Separator />

              {/* Analytical Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Analytical cookies</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analytical cookies help us improve our website by collecting and reporting 
                      information on its usage.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytical}
                    onCheckedChange={(checked) => updatePreference('analytical', checked)}
                    className="ml-4"
                  />
                </div>
                <div className="ml-4 space-y-1 text-sm text-muted-foreground">
                  <div>• Google Analytics</div>
                  <div>• Hotjar</div>
                  <div>• Microsoft Clarity</div>
                  <div>• Usage Statistics</div>
                </div>
              </div>

              <Separator />

              {/* Marketing Cookies */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Marketing cookies</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Marketing cookies are used to track visitors across websites to allow publishers to 
                      display relevant and engaging advertisements. By enabling marketing cookies, you 
                      grant permission for personalized advertising across various platforms.
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => updatePreference('marketing', checked)}
                    className="ml-4"
                  />
                </div>
                <div className="ml-4 space-y-1 text-sm text-muted-foreground">
                  <div>• Google Ads</div>
                  <div>• Facebook Pixel</div>
                  <div>• Social Media Integration</div>
                  <div>• Personalized Advertising</div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleRejectAll}
                  className="flex-1"
                >
                  Reject All
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSavePreferences}
                  className="flex-1"
                >
                  Save Preferences
                </Button>
                <Button
                  variant="default"
                  onClick={handleAcceptAll}
                  className="flex-1"
                >
                  Accept All
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsent;