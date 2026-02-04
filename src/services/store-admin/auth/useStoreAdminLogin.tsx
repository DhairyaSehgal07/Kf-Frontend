import { useMutation } from '@tanstack/react-query';
import type {
  StoreAdminLoginInput,
  StoreAdminLoginApiResponse,
} from '@/types/store-admin';
import queryClient from '@/lib/queryClient';
import storeAdminAxiosClient from '@/lib/axios';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useStore } from '@/stores/store';
import type { ColdStorage } from '@/types/cold-storage';

/** API error shape (400, 401, 429, 500): { success, error: { code, message } } */
type StoreAdminLoginApiError = {
  success?: boolean;
  message?: string;
  error?: { code?: string; message?: string };
};

const DEFAULT_ERROR_MESSAGE = 'Login failed. Please try again.';

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check mobile number and password.',
  401: 'Invalid mobile number or password.',
  429: 'Too many login attempts. Please try again later.',
  500: 'Something went wrong. Please try again later.',
};

function getStoreAdminLoginErrorMessage(
  data: StoreAdminLoginApiError | undefined,
  status?: number
): string {
  const fromBody =
    data?.error?.message ??
    data?.message ??
    (status !== undefined && status in STATUS_ERROR_MESSAGES
      ? STATUS_ERROR_MESSAGES[status]
      : null);
  return fromBody ?? DEFAULT_ERROR_MESSAGE;
}

export const useStoreAdminLogin = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/store-admin/login/' });
  const { setAdminData, setLoading } = useStore();

  return useMutation<
    StoreAdminLoginApiResponse,
    AxiosError<StoreAdminLoginApiError>,
    StoreAdminLoginInput
  >({
    mutationKey: ['store-admin', 'login'],

    mutationFn: async (payload) => {
      setLoading(true);

      const { data } =
        await storeAdminAxiosClient.post<StoreAdminLoginApiResponse>(
          '/store-admin/login',
          payload
        );

      return data;
    },

    onSuccess: (data) => {
      setLoading(false);

      if (!data.success || !data.data) {
        toast.error(data.message || 'Login failed: No data received');
        return;
      }

      const { storeAdmin, token } = data.data;

      // Transform the API response to match our StoreAdmin type
      // The API returns coldStorageId as an object, but our type expects it as a string
      const coldStorage: ColdStorage = {
        _id: storeAdmin.coldStorageId._id,
        name: storeAdmin.coldStorageId.name,
        address: storeAdmin.coldStorageId.address,
        mobileNumber: storeAdmin.coldStorageId.mobileNumber,
        capacity: storeAdmin.coldStorageId.capacity,
        imageUrl: storeAdmin.coldStorageId.imageUrl || '',
        isPaid: storeAdmin.coldStorageId.isPaid,
        isActive: storeAdmin.coldStorageId.isActive,
        plan: storeAdmin.coldStorageId.plan as ColdStorage['plan'],
        admins: storeAdmin.coldStorageId.admins,
        links: storeAdmin.coldStorageId.links,
        incomingOrders: storeAdmin.coldStorageId.incomingOrders,
        outgoingOrders: storeAdmin.coldStorageId.outgoingOrders,
        createdAt: storeAdmin.coldStorageId.createdAt,
        updatedAt: storeAdmin.coldStorageId.updatedAt,
      };

      // Create StoreAdmin with coldStorageId as string
      const admin = {
        _id: storeAdmin._id,
        coldStorageId: storeAdmin.coldStorageId._id,
        name: storeAdmin.name,
        mobileNumber: storeAdmin.mobileNumber,
        role: storeAdmin.role,
        isVerified: storeAdmin.isVerified,
        failedLoginAttempts: storeAdmin.failedLoginAttempts,
        lockedUntil: storeAdmin.lockedUntil,
        createdAt: storeAdmin.createdAt,
        updatedAt: storeAdmin.updatedAt,
      };

      // Store admin + coldStorage + token
      setAdminData(admin, coldStorage, token);

      toast.success(data.message || 'Logged in successfully!');

      queryClient.invalidateQueries({ queryKey: ['store-admin', 'profile'] });

      // ✅ TanStack Router navigation - redirect to original destination or default
      const redirectTo =
        (search as { redirect?: string })?.redirect || '/store-admin/daybook';

      // If redirect is a full URL, use window.location, otherwise use router navigation
      if (redirectTo.startsWith('http')) {
        window.location.href = redirectTo;
      } else {
        navigate({
          to: redirectTo,
          replace: true,
        });
      }
    },

    onError: (error) => {
      setLoading(false);

      const status = error.response?.status;
      const errMsg =
        error.response?.data !== undefined
          ? getStoreAdminLoginErrorMessage(
              error.response.data as StoreAdminLoginApiError,
              status
            )
          : status !== undefined && status in STATUS_ERROR_MESSAGES
            ? STATUS_ERROR_MESSAGES[status]
            : error.message || DEFAULT_ERROR_MESSAGE;

      toast.error(errMsg);
    },
  });
};
