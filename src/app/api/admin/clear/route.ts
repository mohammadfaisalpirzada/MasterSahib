import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { supabaseRest } from '@/lib/supabase-rest';
export async function DELETE(){if(!await isAdmin())return NextResponse.json({error:'Unauthorized'},{status:401});const r=await supabaseRest('district_east_teachers?id=not.is.null',{method:'DELETE'});if(!r.ok){const d=await r.json();return NextResponse.json({error:d.message||'Delete failed'},{status:500});}return NextResponse.json({ok:true});}
