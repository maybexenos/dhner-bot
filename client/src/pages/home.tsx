import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import type { User } from "@shared/schema";

interface CookieStatus {
  hasData: boolean;
  type: string;
  preview: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cookieInput, setCookieInput] = useState("");

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/me"],
  });

  const { data: cookieStatus, refetch: refetchCookie } = useQuery<CookieStatus>({
    queryKey: ["/api/bot/cookie"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/me"], null);
      setLocation("/login");
    },
  });

  const saveCookieMutation = useMutation({
    mutationFn: async (cookie: string) => {
      const res = await apiRequest("POST", "/api/bot/cookie", { cookie });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Cookie saved!", description: "Bot will reload automatically if already running." });
      setCookieInput("");
      refetchCookie();
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐐</span>
            <div>
              <h1 className="text-2xl font-bold">GoatBot V2</h1>
              <p className="text-gray-400 text-sm">Dashboard</p>
            </div>
          </div>
          <Button
            variant="outline"
            data-testid="button-logout"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-base">Logged in as</CardTitle>
          </CardHeader>
          <CardContent>
            <span data-testid="text-username" className="text-green-400 font-semibold text-lg">
              {user?.username}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Facebook Cookie Login</CardTitle>
            <CardDescription className="text-gray-400">
              Paste your Facebook cookie/appState here. Bot will use this to login automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {cookieStatus?.hasData && (
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-green-400 font-medium">Cookie saved</p>
                  <p data-testid="text-cookie-preview" className="text-xs text-gray-400 truncate">
                    {cookieStatus.preview}
                  </p>
                </div>
                <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs shrink-0">
                  {cookieStatus.type}
                </Badge>
              </div>
            )}

            {!cookieStatus?.hasData && (
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                <p className="text-sm text-red-400">No cookie saved yet</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                Supported formats:
              </p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>AppState JSON array (from cookie editors like EditThisCookie)</li>
                <li>Raw cookie string (key=value; key=value...)</li>
                <li>Facebook token (starts with EAAAA...)</li>
                <li>Netscape cookie file format</li>
              </ul>
            </div>

            <Textarea
              data-testid="input-cookie"
              value={cookieInput}
              onChange={(e) => setCookieInput(e.target.value)}
              placeholder='Paste your cookie here... e.g. [{"key":"c_user","value":"..."}] or c_user=123; xs=abc;'
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 font-mono text-xs min-h-32 resize-y"
            />

            <Button
              data-testid="button-save-cookie"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!cookieInput.trim() || saveCookieMutation.isPending}
              onClick={() => saveCookieMutation.mutate(cookieInput)}
            >
              {saveCookieMutation.isPending ? "Saving..." : "Save Cookie & Apply"}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              If the bot is already running, it will auto-reload the new cookie.
              Otherwise start the <span className="text-gray-300">Bot</span> workflow manually.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
