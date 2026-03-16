import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://knfhskpahmjvnrsztscy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuZmhza3BhaG1qdm5yc3p0c2N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMDI2NjcsImV4cCI6MjA4ODY3ODY2N30.6QsL-KuxRuTTHKTW7B_lBdINQGMCvkP9GWO8HlCGooY';

export const supabase = createClient(supabaseUrl, supabaseKey);
