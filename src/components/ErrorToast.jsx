import { toast } from '@/components/ui/use-toast';

// Replacement for alert(): shows the message in the app's own toaster instead of a
// blocking browser dialog. The <Toaster /> mounted in App renders it.
export function useErrorToast() {
  return (title, description) => toast({ variant: 'destructive', title, description });
}

export default useErrorToast;