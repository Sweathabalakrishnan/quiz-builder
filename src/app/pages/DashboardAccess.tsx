import { FormEvent, useState } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { grantDashboardAccess, getDashboardPasscode } from '../utils/dashboard-access';
import { toast } from 'sonner';

interface DashboardAccessProps {
  onUnlock: () => void;
}

export function DashboardAccess({ onUnlock }: DashboardAccessProps) {
  const [passcode, setPasscode] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passcode === getDashboardPasscode()) {
      grantDashboardAccess();
      toast.success('Dashboard unlocked');
      onUnlock();
      return;
    }

    toast.error('Incorrect passcode');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(92,70,160,0.14),_transparent_45%),linear-gradient(180deg,_#fcfbff_0%,_#f7f4fd_100%)] px-4 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <Card className="app-panel w-full overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-[#281C59] to-[#5c46a0]"></div>
          <CardHeader className="app-panel-header space-y-4">
            <div className="app-icon-badge h-14 w-14 rounded-2xl">
              <Lock className="size-7" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">Owner Dashboard Access</CardTitle>
              <CardDescription className="mt-2 text-base text-slate-600">
                Enter your passcode to open the quiz dashboard. Shared student links will continue to work without this.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="dashboard-passcode" className="text-sm font-medium text-slate-700">
                  Dashboard passcode
                </label>
                <Input
                  id="dashboard-passcode"
                  type="password"
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  placeholder="Enter passcode"
                  className="app-input"
                />
              </div>

              <Button type="submit" className="w-full text-white shadow-lg shadow-[#281C59]/20">
                <LogIn className="mr-2 size-4" />
                Open Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
