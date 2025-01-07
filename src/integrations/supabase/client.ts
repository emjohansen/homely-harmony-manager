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
  insert: (values: any) => MockQueryBuilder;
  update: (values: any) => MockQueryBuilder;
  delete: () => MockQueryBuilder;
  data?: any;
  error?: any;
};

// Mock Supabase client for local storage implementation
const mockSupabaseClient = {
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: (callback?: Function) => ({
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
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      insert: (values: any) => queryBuilder,
      update: (values: any) => queryBuilder,
      delete: () => queryBuilder,
      data: null,
      error: null
    };

    return queryBuilder;
  },
  // Add missing Supabase client properties
  supabaseUrl: '',
  supabaseKey: '',
  realtime: { connect: () => {}, disconnect: () => {} },
  realtimeUrl: '',
  rest: { signal: undefined },
  headers: {},
  auth: {
    ...mockSupabaseClient.auth,
    onAuthStateChange: (callback?: Function) => ({
      data: { subscription: { unsubscribe: () => {} } }
    })
  }
};

export const supabase = mockSupabaseClient as any; // Type assertion to satisfy SupabaseClient interface