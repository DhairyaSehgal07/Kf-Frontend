import { memo } from 'react';
import { ArrowUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// import { useNavigate } from '@tanstack/react-router';
// import { prefetchAllFarmers } from '@/services/base/store-admin/functions/useGetAllFarmers';

const ActionButtons = memo(function ActionButtons() {
  // const navigate = useNavigate();

  // const prefetchedRef = useRef(false);

  // const handlePrefetch = useCallback(() => {
  //   if (prefetchedRef.current) return;

  //   prefetchedRef.current = true;
  //   prefetchAllFarmers();
  // }, []);

  // const goToIncoming = useCallback(() => {
  //   navigate({ to: '/store-admin/incoming' });
  // }, [navigate]);

  // const goToOutgoing = useCallback(() => {
  //   navigate({ to: '/store-admin/outgoing' });
  // }, [navigate]);

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <Button
        variant="default"
        // onClick={goToIncoming}
        className="font-custom flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <ArrowUp className="h-4 w-4 shrink-0" />
        <span className="truncate">Add Incoming</span>
      </Button>

      <Button
        variant="outline"
        // onClick={goToOutgoing}
        className="font-custom flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        <span className="truncate">Add Outgoing</span>
      </Button>
    </div>
  );
});

export default ActionButtons;
