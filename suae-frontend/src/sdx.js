export const sdx={
    setData:function(data){
        Object.keys(data).forEach((k)=>{
            this.d[k]=data[k];
        })
        // Keep top-level mirrors in sync for headers consumption
        if (typeof data.institute_id !== 'undefined') {
            this.institute_id = data.institute_id;
        }
        this.changeState();
    },

    // Fix 1.2: Ensure institute context is set before any API calls
    ensureInstituteContext: async function() {
        // If already set, return it
        if (this.institute_id) {
            console.log('[context] Institute ID already set:', this.institute_id);
            return this.institute_id;
        }

        // Try to fetch and set if missing
        const { default: InstituteService } = await import('./services/InstituteService');
        try {
            const { data } = await InstituteService.getInstituteId();
            const fetchedId = Number(
                data?.data?.institute_id || 
                data?.institute_id || 
                data?.result?.institute_id || 
                0
            );
            if (fetchedId) {
                this.setData({ institute_id: fetchedId });
                console.log('[context] Institute ID fetched and set:', fetchedId);
                return fetchedId;
            } else {
                console.warn('[context] Institute ID not found in response:', data);
                return null;
            }
        } catch (error) {
            console.error('[context] Failed to fetch institute ID:', error.message);
            return null;
        }
    },

    d:{
    },
    institute_id: null
}