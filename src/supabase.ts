import { createClient } from '@supabase/supabase-js'

// Sua URL e Chave Pública (Anon Key) oficiais do projeto
const supabaseUrl = 'https://gthvtgxjrvyndlewndyi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0aHZ0Z3hqcnZ5bmRsZXduZHlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTA2OTgsImV4cCI6MjA5MDQ2NjY5OH0.BgZSs7RMVvXuTs_qYfR8trBAKUNab-xXgxKwKJ87cKo'

export const supabase = createClient(supabaseUrl, supabaseKey)