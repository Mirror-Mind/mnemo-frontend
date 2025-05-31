"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { IconBrandGithub, IconBrandGoogle, IconLoader, IconAlertCircle, IconLink, IconCheck, IconLock, IconBrandWhatsapp, IconBrandLinkedin } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePhoneNumberAction, removePhoneNumberAction } from "./actions";

type Account = {
  id: string;
  providerId: string;
  accessToken: string | null;
  scope?: string | null;
};

// Extended user type with accounts property
type ExtendedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  accounts?: Account[];
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean | null;
  [key: string]: any; // Allow other properties
}

// Add type for provider profile data
type ProviderProfile = {
  name?: string;
  email?: string;
  image?: string | null;
}

type SessionData = {
  user: ExtendedUser;
}

type Provider = "github" | "google" | "linkedin";

export default function ProvidersPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberVerified, setPhoneNumberVerified] = useState<boolean | null>(null);
  const [phoneUpdateError, setPhoneUpdateError] = useState<string | null>(null);
  const [phoneUpdateSuccess, setPhoneUpdateSuccess] = useState<string | null>(null);
  const [isRemovingPhone, setIsRemovingPhone] = useState(false);
  const [isPhoneNumberSaved, setIsPhoneNumberSaved] = useState(false);
  const [providerProfiles, setProviderProfiles] = useState<Record<string, ProviderProfile>>({});
  
  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      try {
        const { data, error } = await authClient.getSession();
        
        if (error) {
          setError(error.message || "An error occurred");
          return;
        }
        
        setSession(data as SessionData);
        
        // Extract linked providers from accounts - use type assertion for safety
        if (data?.user && 'accounts' in data.user) {
          const userAccounts = (data.user as ExtendedUser).accounts || [];
          setAccounts(userAccounts);
          
          // Extract provider-specific profile data if available
          const profiles: Record<string, ProviderProfile> = {};
          
          // Use user's own profile as default for all providers
          const defaultProfile: ProviderProfile = {
            name: data.user.name,
            email: data.user.email,
            image: data.user.image || null
          };
          
          // Set default profiles for known providers
          // We need to use a different function that doesn't depend on the state
          const isConnected = (providerId: string, accts: Account[]) => {
            return accts.some(account => account.providerId === providerId);
          };
          
          if (isConnected('google', userAccounts)) {
            profiles['google'] = { ...defaultProfile };
          }
          
          if (isConnected('github', userAccounts)) {
            profiles['github'] = { ...defaultProfile };
          }
          
          setProviderProfiles(profiles);
        }
        if (data?.user && 'phoneNumber' in data.user && data.user.phoneNumber) {
          setPhoneNumber(data.user.phoneNumber as string);
          setIsPhoneNumberSaved(true);
        } else {
          setIsPhoneNumberSaved(false);
        }
        // Set initial verification status if available
        if (data?.user && 'phoneNumberVerified' in data.user) {
           setPhoneNumberVerified(data.user.phoneNumberVerified as boolean | null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch session data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchSession();
  }, []);

  const handleConnectProvider = async (provider: Provider) => {
    try {
      await authClient.linkSocial({
        provider,
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            // Refresh the page to update linked providers
            window.location.reload();
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Failed to connect account");
          }
        }
      });
    } catch (err: any) {
      setError(err.message || `Failed to connect ${provider}`);
    }
  };

  const handleUnlinkProvider = async (provider: string) => {
    try {
      // Clear any existing messages
      setError("");
      setSuccessMessage(null);
      
      // Show loading state for this specific provider
      setIsDisconnecting(provider);
      
      // Find the account ID for the selected provider
      const account = accounts.find(acc => acc.providerId === provider);
      
      if (!account) {
        throw new Error(`No account found for provider ${provider}`);
      }
      
      console.log("Unlinking provider:", provider, "with account ID:", account.id);
      await authClient.unlinkAccount({
        providerId: provider,
      });
      
      // Success - refresh session data
      const { data } = await authClient.getSession();
      if (data?.user && 'accounts' in data.user) {
        setAccounts((data.user as ExtendedUser).accounts || []);
        setSuccessMessage(`Successfully disconnected ${provider} account`);
      }
      
      setIsDisconnecting(null);
    } catch (err: any) {
      console.error("Error unlinking account:", err);
      setError(err.message || `Failed to unlink ${provider} account`);
      setIsDisconnecting(null);
    }
  };

  const isProviderConnected = (providerId: string, accountsToCheck?: Account[]) => {
    const accountsToUse = accountsToCheck || accounts;
    return accountsToUse.some(account => account.providerId === providerId);
  };

  const getAccountScope = (providerId: string) => {
    const account = accounts.find(account => account.providerId === providerId);
    const scopeString = account?.scope;
    if (!scopeString) {
      return [];
    }
    // Detect separator (comma or space) and split, then trim/filter
    const separator = scopeString.includes(',') ? ',' : ' ';
    return scopeString.split(separator).map(s => s.trim()).filter(s => s.length > 0);
  };

  // Handler for updating phone number
  const handleUpdatePhoneNumber = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    console.log("Attempting to update phone number..."); // Log 1
    setPhoneUpdateError(null); // Clear previous errors
    setPhoneUpdateSuccess(null); // Clear previous success messages
    setIsRemovingPhone(false); // Ensure removing state is false

    startTransition(async () => {
      console.log(`Calling updatePhoneNumberAction with number: ${phoneNumber}`); // Log 2
      const result = await updatePhoneNumberAction({ phoneNumber });
      console.log("updatePhoneNumberAction result:", result); // Log 3

      if (result?.failure) {
        setPhoneUpdateError(result.failure);
      } else if (result?.success) {
        setPhoneUpdateSuccess(result.success);
        setIsPhoneNumberSaved(true);
        // Optionally refetch session or update local state if needed
        // For now, just show success message. The input is already controlled.
         const { data } = await authClient.getSession();
         if (data?.user && 'phoneNumber' in data.user && data.user.phoneNumber) {
            setPhoneNumber(data.user.phoneNumber as string);
         }
         // Refresh verification status after update
         if (data?.user && 'phoneNumberVerified' in data.user) {
            setPhoneNumberVerified(data.user.phoneNumberVerified as boolean | null);
         }
      }
    });
  };

  // Handler for removing phone number
  const handleRemovePhoneNumber = async () => {
    setIsRemovingPhone(true); // Start loading
    setPhoneUpdateError(null); // Clear previous errors/success messages
    setPhoneUpdateSuccess(null);

    startTransition(async () => {
      const result = await removePhoneNumberAction();
      if (result?.failure) {
        setPhoneUpdateError(result.failure); // Show error in the same alert area
      } else if (result?.success) {
        setPhoneUpdateSuccess(result.success); // Show success
        setPhoneNumber(""); // Clear local state
        setPhoneNumberVerified(null);
        setIsPhoneNumberSaved(false);
        // Optionally refetch session if other derived state depends on it
        // const { data } = await authClient.getSession(); // Example refetch
        window.location.reload(); // Reload the page on successful disconnect
      }
      setIsRemovingPhone(false); // Stop loading
    });
  };

  if (loading) {
    return (
      <div className="px-4 lg:px-6 grid gap-4">
        <Skeleton className="w-1/2 h-[20px] rounded-full" />
        <Skeleton className="w-2/3 h-[20px] rounded-full" />
        <Separator className="mb-4" />
        <Skeleton className="w-full h-[150px] rounded-lg" />
        <Skeleton className="w-full h-[150px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 lg:px-6">
      <div>
        <h3 className="text-lg font-medium">Connected Accounts</h3>
        <p className="text-sm text-muted-foreground">
          Manage your connected accounts and authentication methods.
        </p>
      </div>
      <Separator />

      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="default">
          <IconCheck className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Phone Number / WhatsApp Card - MOVED TO TOP */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <IconBrandWhatsapp className="h-5 w-5" /> WhatsApp / Phone Number
          </CardTitle>
          <CardDescription>
            Connect your phone number for notifications and verification (optional).
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdatePhoneNumber}>
          <CardContent className="space-y-4">
             {isPhoneNumberSaved && (
               <p className="text-sm text-green-600 flex items-center">
                 <IconCheck className="h-4 w-4 mr-1" /> Connected
               </p>
             )}
             {phoneUpdateError && (
               <Alert variant="destructive">
                 <IconAlertCircle className="h-4 w-4" />
                 <AlertTitle>Update Failed</AlertTitle>
                 <AlertDescription>{phoneUpdateError}</AlertDescription>
               </Alert>
             )}
             {phoneUpdateSuccess && (
               <Alert variant="default" className="mb-2">
                 <IconCheck className="h-4 w-4" />
                 <AlertTitle>Success</AlertTitle>
                 <AlertDescription>{phoneUpdateSuccess}</AlertDescription>
               </Alert>
             )}
            <div className="space-y-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                name="phoneNumber" 
                type="tel" // Use type='tel' for phone numbers
                placeholder="e.g., +14155552671" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isPending || isRemovingPhone} // Disable during update or removal
              />
               <p className="text-xs text-muted-foreground">
                 Include your country code (e.g., +1 for US).
               </p>
            </div>
             {isPhoneNumberSaved && (
               <div className="flex items-center text-sm pt-2">
                 {phoneNumberVerified === true ? (
                   <><IconCheck className="h-4 w-4 mr-1 text-green-600" /> Verified</>
                 ) : phoneNumberVerified === false ? (
                    <><IconAlertCircle className="h-4 w-4 mr-1 text-yellow-600" /> Verification Pending</>
                 ) : (
                    <><IconLock className="h-4 w-4 mr-1 text-muted-foreground" /> Not Verified</> // Or some other status if needed
                 )}
               </div>
             )}
          </CardContent>
          <CardFooter className="border-t px-6 py-3 justify-between">
            <Button type="submit" size="sm" disabled={isPending || isRemovingPhone || !phoneNumber}> 
              {isPending && !isRemovingPhone ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isPhoneNumberSaved ? 'Update Number' : 'Save Number'}
            </Button>
            {isPhoneNumberSaved && (
              <Button 
                type="button" // Important: type='button' to prevent form submission
                variant="destructive" 
                onClick={handleRemovePhoneNumber} 
                disabled={isPending || isRemovingPhone}
                size="sm"
              >
                {isRemovingPhone ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
                Remove Number
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {/* Google Provider Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <IconBrandGoogle className="h-5 w-5" /> Google
          </CardTitle>
          <CardDescription>
            Connect your Google account for seamless sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProviderConnected('google') ? (
            <div>
              <p className="text-sm text-green-600 flex items-center mb-2">
                <IconCheck className="h-4 w-4 mr-1" /> Connected
              </p>
              
              {/* Display Google profile info if available */}
              {providerProfiles['google'] && (
                <div className="flex items-center gap-3 mt-3 mb-3">
                  {providerProfiles['google'].image && (
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <img 
                        src={providerProfiles['google'].image} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    {providerProfiles['google'].name && (
                      <p className="font-medium">{providerProfiles['google'].name}</p>
                    )}
                    {providerProfiles['google'].email && (
                      <p className="text-xs text-muted-foreground">{providerProfiles['google'].email}</p>
                    )}
                  </div>
                </div>
              )}
              
              {getAccountScope('google').length > 0 && (
                <details className="mt-1 text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View Scopes ({getAccountScope('google').length})</summary>
                  <div className="mt-1 space-y-0.5 pl-4 text-muted-foreground">
                    {getAccountScope('google').map(scope => (
                      <div key={scope}>{scope}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not connected.</p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          {isProviderConnected('google') ? (
            <Button 
              variant="destructive" 
              onClick={() => handleUnlinkProvider('google')} 
              disabled={isDisconnecting === 'google'}
              size="sm"
            >
              {isDisconnecting === 'google' ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : <IconLink className="mr-2 h-4 w-4" />} 
              Disconnect Google
            </Button>
          ) : (
            <Button onClick={() => handleConnectProvider('google')} size="sm">
               <IconLink className="mr-2 h-4 w-4" /> Connect Google
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* GitHub Provider Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <IconBrandGithub className="h-5 w-5" /> GitHub
          </CardTitle>
          <CardDescription>
            Link your GitHub account to access related features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProviderConnected('github') ? (
            <div>
              <p className="text-sm text-green-600 flex items-center mb-2">
                 <IconCheck className="h-4 w-4 mr-1" /> Connected
              </p>
              
              {/* Display GitHub profile info if available */}
              {providerProfiles['github'] && (
                <div className="flex items-center gap-3 mt-3 mb-3">
                  {providerProfiles['github'].image && (
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <img 
                        src={providerProfiles['github'].image} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    {providerProfiles['github'].name && (
                      <p className="font-medium">{providerProfiles['github'].name}</p>
                    )}
                    {providerProfiles['github'].email && (
                      <p className="text-xs text-muted-foreground">{providerProfiles['github'].email}</p>
                    )}
                  </div>
                </div>
              )}
              
              {getAccountScope('github').length > 0 && (
                <details className="mt-1 text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View Scopes ({getAccountScope('github').length})</summary>
                  <div className="mt-1 space-y-0.5 pl-4 text-muted-foreground">
                    {getAccountScope('github').map(scope => (
                      <div key={scope}>{scope}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not connected.</p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
           {isProviderConnected('github') ? (
            <Button 
              variant="destructive" 
              onClick={() => handleUnlinkProvider('github')} 
              disabled={isDisconnecting === 'github'}
              size="sm"
            >
              {isDisconnecting === 'github' ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : <IconLink className="mr-2 h-4 w-4" />} 
              Disconnect GitHub
            </Button>
          ) : (
            <Button onClick={() => handleConnectProvider('github')} size="sm"> 
              <IconLink className="mr-2 h-4 w-4" /> Connect GitHub
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* LinkedIn Provider Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <IconBrandLinkedin className="h-5 w-5" /> LinkedIn
          </CardTitle>
          <CardDescription>
            Connect your LinkedIn account to access your professional profile and network.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProviderConnected('linkedin') ? (
            <div>
              <p className="text-sm text-green-600 flex items-center mb-2">
                <IconCheck className="h-4 w-4 mr-1" /> Connected
              </p>
              
              {/* Display LinkedIn profile info if available */}
              {providerProfiles['linkedin'] && (
                <div className="flex items-center gap-3 mt-3 mb-3">
                  {providerProfiles['linkedin'].image && (
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <img 
                        src={providerProfiles['linkedin'].image} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    {providerProfiles['linkedin'].name && (
                      <p className="font-medium">{providerProfiles['linkedin'].name}</p>
                    )}
                    {providerProfiles['linkedin'].email && (
                      <p className="text-xs text-muted-foreground">{providerProfiles['linkedin'].email}</p>
                    )}
                  </div>
                </div>
              )}
              
              {getAccountScope('linkedin').length > 0 && (
                <details className="mt-1 text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View Scopes ({getAccountScope('linkedin').length})</summary>
                  <div className="mt-1 space-y-0.5 pl-4 text-muted-foreground">
                    {getAccountScope('linkedin').map(scope => (
                      <div key={scope}>{scope}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not connected.</p>
          )}
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          {isProviderConnected('linkedin') ? (
            <Button 
              variant="destructive" 
              onClick={() => handleUnlinkProvider('linkedin')} 
              disabled={isDisconnecting === 'linkedin'}
              size="sm"
            >
              {isDisconnecting === 'linkedin' ? <IconLoader className="mr-2 h-4 w-4 animate-spin" /> : <IconLink className="mr-2 h-4 w-4" />} 
              Disconnect LinkedIn
            </Button>
          ) : (
            <Button onClick={() => handleConnectProvider('linkedin')} size="sm">
              <IconLink className="mr-2 h-4 w-4" /> Connect LinkedIn
            </Button>
          )}
        </CardFooter>
      </Card>

    </div>
  );
} 