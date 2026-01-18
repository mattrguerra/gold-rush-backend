// Add this route to your server.js or create a separate routes/addons.js file

// GET /api/addons - Fetch all active add-ons
app.get('/api/addons', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('addons')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true });

        if (error) throw error;

        res.json({ addons: data });
    } catch (err) {
        console.error('Error fetching addons:', err);
        res.status(500).json({ error: 'Failed to fetch add-ons' });
    }
});

// If you want to store addon selections with bookings, update your bookings POST route:
// Add addon_ids (array) and total_price to the insert

/*
Example updated bookings insert:

const { data, error } = await supabase
    .from('bookings')
    .insert([{
        service_id: req.body.service_id,
        addon_ids: req.body.addon_ids || [],  // Add this column to bookings table
        scheduled_date: req.body.scheduled_date,
        scheduled_time: req.body.scheduled_time,
        customer_name: req.body.name,
        customer_email: req.body.email,
        customer_phone: req.body.phone,
        vehicle_type: req.body.vehicle_type,
        address: req.body.address,
        notes: req.body.notes,
        total_price: req.body.total_price,  // Add this column to bookings table
        status: 'pending'
    }])
    .select();
*/

// To add the columns to your bookings table, run this SQL in Supabase:
/*
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS addon_ids INTEGER[],
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10,2);
*/