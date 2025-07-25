import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dzvxcpsbaqjlcjaqgfit.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dnhjcHNiYXFqbGNqYXFnZml0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjE5ODEsImV4cCI6MjA2OTAzNzk4MX0.uguVbv7itOy6Ax-sZQZnlnIZ2wfEHm4bkjEZKIV2uug'

export const supabase = createClient(supabaseUrl, supabaseKey)

