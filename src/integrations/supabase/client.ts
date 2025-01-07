type MockResponse = {
  data: any;
  error: any;
};

type MockQueryBuilder = {
  select: (columns?: string) => MockQueryBuilder;
  eq: (column: string, value: any) => MockQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder;
  single: () => Promise<MockResponse>;
  maybeSingle: () => Promise<MockResponse>;
};

// Mock Supabase client for local storage implementation
const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } }
    }),
    signOut: () => Promise.resolve({ error: null })
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: File) => Promise.resolve({ data: null, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } })
    })
  },
  from: (table: string): MockQueryBuilder => {
    const queryBuilder: MockQueryBuilder = {
      select: (columns?: string) => queryBuilder,
      eq: (column: string, value: any) => queryBuilder,
      order: (column: string, options?: { ascending?: boolean }) => queryBuilder,
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null })
    };

    return {
      ...queryBuilder,
      insert: (values: any) => queryBuilder,
      update: (values: any) => queryBuilder,
      delete: () => queryBuilder,
    };
  }
};

export const supabase = mockSupabaseClient;