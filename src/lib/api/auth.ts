import { supabase } from '../supabase';

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'HR_ADMIN' | 'EMPLOYEE';
}

export interface SignInData {
  email: string;
  password: string;
}

export const authApi = {
  /**
   * Sign up a new user - simplified to only create auth user
   * User and employee records will be created on first login
   */
  async signUp(data: SignUpData) {
    try {
      // Just create the auth user - metadata will store the name
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: data.role || 'EMPLOYEE',
          },
          emailRedirectTo: undefined, // Disable email confirmation redirect
        },
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user');
      }

      console.log('Auth user created successfully:', authData.user.id);
      return { user: authData.user, session: authData.session };
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  /**
   * Create user and employee records (called on first login)
   */
  async createUserRecords(userId: string, email: string, firstName: string, lastName: string, role: 'HR_ADMIN' | 'EMPLOYEE' = 'EMPLOYEE') {
    console.log('🔧 createUserRecords called with:', { userId, email, firstName, lastName, role });

    try {
      // Check if user record already exists
      const { data: existingUser, error: checkUserError } = await supabase
        .from('users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkUserError) {
        console.error('❌ Error checking existing user:', checkUserError);
      }

      if (!existingUser) {
        console.log('📝 Attempting to create user record...');

        // Create user record
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            user_id: userId,
            email: email,
            role: role,
          })
          .select()
          .single();

        if (userError) {
          console.error('❌ User table insert error:', userError);
          console.error('❌ Error details:', JSON.stringify(userError, null, 2));
          throw new Error(`Failed to create user record: ${userError.message}`);
        } else {
          console.log('✅ User record created successfully:', newUser);
        }
      } else {
        console.log('ℹ️ User record already exists');
      }

      // Check if employee record already exists
      const { data: existingEmployee, error: checkEmpError } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (checkEmpError) {
        console.error('❌ Error checking existing employee:', checkEmpError);
      }

      if (!existingEmployee) {
        console.log('📝 Attempting to create employee record...');

        // Create employee record
        const employeeCode = `EMP-${String(Date.now()).slice(-4)}`;

        const { data: newEmployee, error: employeeError } = await supabase
          .from('employees')
          .insert({
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            employee_code: employeeCode,
            join_date: new Date().toISOString().split('T')[0],
            employment_status: 'ACTIVE',
          })
          .select()
          .single();

        if (employeeError) {
          console.error('❌ Employee table insert error:', employeeError);
          console.error('❌ Error details:', JSON.stringify(employeeError, null, 2));
          throw new Error(`Failed to create employee record: ${employeeError.message}`);
        } else {
          console.log('✅ Employee record created successfully:', newEmployee);
        }
      } else {
        console.log('ℹ️ Employee record already exists');
      }

      console.log('✅ createUserRecords completed successfully');
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in createUserRecords:', error);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      throw error; // NOW WE THROW so we can see what's failing!
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData) {
    console.log('🔐 Attempting to sign in:', data.email);

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      console.error('❌ Sign in failed:', error);
      throw error;
    }

    console.log('✅ Auth sign in successful, user:', authData.user?.id);

    // Create user and employee records if they don't exist
    if (authData.user) {
      const metadata = authData.user.user_metadata;

      try {
        await this.createUserRecords(
          authData.user.id,
          authData.user.email || data.email,
          metadata?.first_name || 'User',
          metadata?.last_name || 'User',
          metadata?.role || 'EMPLOYEE'
        );

        // Update last login
        console.log('📝 Updating last login timestamp...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('user_id', authData.user.id);

        if (updateError) {
          console.warn('⚠️ Failed to update last login:', updateError);
        } else {
          console.log('✅ Last login updated');
        }
      } catch (recordError: any) {
        console.error('❌ Failed to create/update user records:', recordError);
        // Sign out the user if we can't create their records
        await this.signOut();
        throw new Error(`Database setup failed: ${recordError.message}. Please contact support.`);
      }
    }

    console.log('✅ Sign in completed successfully');
    return authData;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current user session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get the current user with role information
   */
  async getCurrentUser() {
    console.log('🔍 getCurrentUser called');

    const timeoutMs = 10000; // 10 second timeout

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getCurrentUser timeout after 10 seconds')), timeoutMs)
      );

      // Wrap the actual work in a promise race
      const result = await Promise.race([
        (async () => {
          console.log('📞 Calling supabase.auth.getUser()...');
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError) {
            console.error('❌ Auth error in getCurrentUser:', authError);
            throw authError;
          }
          if (!user) {
            console.log('⚠️ No auth user found');
            return null;
          }

          console.log('📝 Auth user found:', user.id);
          console.log('📝 Attempting to fetch user data from public.users table...');

          // Use maybeSingle with timeout to prevent hanging on RLS issues
          const userQueryPromise = supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          const queryTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Users table query timeout')), 5000)
          );

          let userData, userError;
          try {
            const result = await Promise.race([userQueryPromise, queryTimeout]);
            userData = result.data;
            userError = result.error;
          } catch (error: any) {
            console.error('❌ Users table query timed out or failed:', error);
            // Continue with basic user info
            userData = null;
            userError = null;
          }

          if (userError) {
            console.error('❌ Error fetching from users table:', userError);
            console.error('❌ Error code:', userError.code);
            console.error('❌ Error details:', userError.details);
            console.error('❌ Error hint:', userError.hint);
            console.error('❌ Error message:', userError.message);

            // Return basic user info if table query fails
            console.log('⚠️ Returning basic user info without users table data');
            return {
              ...user,
              role: 'EMPLOYEE',
              user_id: user.id,
              email: user.email,
            };
          }

          if (!userData) {
            console.warn('⚠️ User exists in auth but not in users table');
            return {
              ...user,
              role: 'EMPLOYEE',
              user_id: user.id,
              email: user.email,
            };
          }

          console.log('✅ User data fetched successfully from users table');
          return { ...user, ...userData };
        })(),
        timeoutPromise
      ]);

      return result;
    } catch (error: any) {
      console.error('❌ Unexpected error in getCurrentUser:', error);

      // If it's a timeout, try to return basic info from auth
      if (error.message?.includes('timeout')) {
        console.log('⏰ Timeout occurred, attempting to get basic auth user...');
        try {
          const { data: { user } } = await Promise.race([
            supabase.auth.getUser(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Auth timeout')), 2000)
            )
          ]) as any;

          if (user) {
            console.log('✅ Returning basic auth user after timeout');
            return {
              ...user,
              role: 'EMPLOYEE',
              user_id: user.id,
              email: user.email,
            };
          }
        } catch (fallbackError) {
          console.error('❌ Fallback auth also failed:', fallbackError);
        }
      }

      throw error;
    }
  },

  /**
   * Get the current employee profile
   */
  async getCurrentEmployee() {
    console.log('🔍 getCurrentEmployee called');

    const timeoutMs = 10000; // 10 second timeout

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('getCurrentEmployee timeout after 10 seconds')), timeoutMs)
      );

      const result = await Promise.race([
        (async () => {
          const { data: { user }, error: authError } = await supabase.auth.getUser();

          if (authError) {
            console.error('❌ Auth error in getCurrentEmployee:', authError);
            throw authError;
          }
          if (!user) {
            console.log('⚠️ No user found in getCurrentEmployee');
            return null;
          }

          console.log('📝 Fetching employee data for user:', user.id);

          // Create individual timeout for employee query
          const employeeQueryPromise = supabase
            .from('employees')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          const employeeTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Employee query timeout')), 5000)
          );

          let employeeData, employeeError;
          try {
            const result = await Promise.race([employeeQueryPromise, employeeTimeout]);
            employeeData = result.data;
            employeeError = result.error;
          } catch (error: any) {
            console.error('❌ Employee query timed out:', error);
            throw new Error('Failed to fetch employee data: timeout');
          }

          if (employeeError) {
            console.error('❌ Error fetching employee:', employeeError);
            throw employeeError;
          }

          if (!employeeData) {
            console.log('⚠️ No employee record found');
            return null;
          }

          console.log('✅ Employee data found:', employeeData.employee_id);

          // Now try to get related data separately (more resilient) with shorter timeouts
          let department = null;
          let position = null;

          if (employeeData.department_id) {
            try {
              const deptPromise = supabase
                .from('departments')
                .select('*')
                .eq('department_id', employeeData.department_id)
                .maybeSingle();

              const deptTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Department query timeout')), 2000)
              );

              const { data: deptData } = await Promise.race([deptPromise, deptTimeout]) as any;
              department = deptData;
            } catch (error) {
              console.warn('⚠️ Failed to fetch department, continuing without it:', error);
            }
          }

          if (employeeData.position_id) {
            try {
              const posPromise = supabase
                .from('positions')
                .select('*')
                .eq('position_id', employeeData.position_id)
                .maybeSingle();

              const posTimeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Position query timeout')), 2000)
              );

              const { data: posData } = await Promise.race([posPromise, posTimeout]) as any;
              position = posData;
            } catch (error) {
              console.warn('⚠️ Failed to fetch position, continuing without it:', error);
            }
          }

          // Get email from users table
          let userEmail = user.email;
          try {
            const userPromise = supabase
              .from('users')
              .select('email')
              .eq('user_id', user.id)
              .maybeSingle();

            const userTimeout = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('User email query timeout')), 2000)
            );

            const { data: userData } = await Promise.race([userPromise, userTimeout]) as any;
            userEmail = userData?.email || user.email;
          } catch (error) {
            console.warn('⚠️ Failed to fetch user email, using auth email:', error);
          }

          console.log('✅ Employee data loaded successfully');

          return {
            ...employeeData,
            department,
            position,
            email: userEmail,
          };
        })(),
        timeoutPromise
      ]);

      return result;
    } catch (error: any) {
      console.error('❌ Unexpected error in getCurrentEmployee:', error);
      throw error;
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
