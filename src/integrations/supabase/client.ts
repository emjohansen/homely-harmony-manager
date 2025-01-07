// This is a mock client that replaces the Supabase client
// It provides the same interface but uses localStorage

export const supabase = {
  auth: {
    getSession: async () => ({
      data: { session: null },
      error: null
    }),
    getUser: async () => ({
      data: { user: null },
      error: null
    }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } }
    }),
    signOut: async () => ({ error: null })
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => ({
        data: { path },
        error: null
      }),
      getPublicUrl: (path: string) => ({
        data: { publicUrl: path }
      })
    })
  },
  from: (table: string) => ({
    select: (query?: string) => ({
      eq: (column: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null })
      }),
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        data: [],
        error: null
      })
    }),
    insert: async (data: any) => ({
      data: null,
      error: null,
      select: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    update: async (data: any) => ({
      data: null,
      error: null,
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      })
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        data: null,
        error: null
      })
    })
  })
};