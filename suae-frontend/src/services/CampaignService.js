// // import axiosnode from "../utils/axiosnode"
// // class CampaignService {
// //     getAllEmailCampaign(params) {
// //         return axiosnode.get("campaigns", { params })
// //     }
// //     createCampaign(payload) {
// //         return axiosnode.post("campaigns", payload)
// //     }
// //     deleteCampaign(id) {
// //         return axiosnode.delete(`campaigns/${id}`)
// //     }

// //     // Featured listing admin APIs for Recommendation Badge custom text
// //     getFeaturedListingAdmin(params) {
// //         // GET /featured-listings/admin?discipline_id=..&course_id=..
// //         return axiosnode.get("featured-listings/admin", { params })
// //     }

// //     saveOrUpdateFeaturedListing(payload) {
// //         // POST /featured-listings/admin
// //         // payload = { discipline_id, course_id, institute_course_id, custom_text, status }
// //         return axiosnode.post("featured-listings/admin", payload)
// //     }
// // }
// // const campaignService = new CampaignService()
// // export default campaignService


// import axiosnode from "../utils/axiosnode"
// class CampaignService {
//     getAllEmailCampaign(params) {
//         return axiosnode.get("campaigns", { params })
//     }
//     createCampaign(payload) {
//         return axiosnode.post("campaigns", payload)
//     }
//     deleteCampaign(id) {
//         return axiosnode.delete(`campaigns/${id}`)
//     }

//     // Featured listing admin APIs for Recommendation Badge custom text
//     getFeaturedListingAdmin(params) {
//         // GET /featured-listings/admin?discipline_id=..&course_id=..
//         return axiosnode.get("featured-listings/admin", { params })
//     }

//     saveOrUpdateFeaturedListing(payload) {
//         // POST /featured-listings/admin
//         // payload = { discipline_id, course_id, institute_course_id, custom_text, status }
//         return axiosnode.post("featured-listings/admin", payload)
//     }
    
//     addCampaignRecipients(campaignId, payload) {
//         // POST /campaigns/:id/recipients
//         // payload = { student_ids: [], variables: {} }
//         return axiosnode.post(`campaigns/${campaignId}/recipients`, payload)
//     }
    
//     getCampaignRecipients(campaignId, params = {}) {
//         // GET /campaigns/:id/recipients
//         // params = { page, page_size, student_id, name, has_logs, log_status }
//         return axiosnode.get(`campaigns/${campaignId}/recipients`, { params })
//     }
    
//     // Get campaign details by ID
//     getCampaignDetails(campaignId) {
//         return axiosnode.get(`campaigns/${campaignId}`)
//     }
    
//     // Update campaign by ID
//     updateCampaign(campaignId, payload) {
//         return axiosnode.put(`campaigns/${campaignId}`, payload)
//     }
// }
// const campaignService = new CampaignService()
// export default campaignService

import axiosnode from "../utils/axiosnode"
class CampaignService {
    getAllEmailCampaign(params) {
        return axiosnode.get("campaigns", { params })
    }
    createCampaign(payload) {
        return axiosnode.post("campaigns", payload)
    }
    deleteCampaign(id) {
        return axiosnode.delete(`campaigns/${id}`)
    }

    // Featured listing admin APIs for Recommendation Badge custom text
    getFeaturedListingAdmin(params) {
        // GET /featured-listings/admin?discipline_id=..&course_id=..
        return axiosnode.get("featured-listings/admin", { params })
    }

    saveOrUpdateFeaturedListing(payload) {
        // POST /featured-listings/admin
        // payload = { discipline_id, course_id, institute_course_id, custom_text, status }
        return axiosnode.post("featured-listings/admin", payload)
    }

    updateFeaturedListingById(id, payload) {
        return axiosnode.put(`featured-listings/admin/${id}`, payload)
    }

    deleteFeaturedListingById(id) {
        return axiosnode.delete(`featured-listings/admin/${id}`)
    }

    addCampaignRecipients(campaignId, payload) {
        // POST /campaigns/:id/recipients
        // payload = { student_ids: [], variables: {} }
        return axiosnode.post(`campaigns/${campaignId}/recipients`, payload)
    }

    getCampaignRecipients(campaignId, params = {}) {
        // GET /campaigns/:id/recipients
        // params = { page, page_size, student_id, name, has_logs, log_status }
        return axiosnode.get(`campaigns/${campaignId}/recipients`, { params })
    }

    // Get campaign details by ID
    getCampaignDetails(campaignId) {
        return axiosnode.get(`campaigns/${campaignId}`)
    }

    // Update campaign by ID
    updateCampaign(campaignId, payload) {
        return axiosnode.put(`campaigns/${campaignId}`, payload)
    }

    // Get campaign logs
    getCampaignLogs(campaignId, params = {}) {
        return axiosnode.get(`campaigns/${campaignId}/logs`, { params });
    }

    // Send campaign
    sendCampaign(campaignId, data = {}) {
        return axiosnode.post(`campaigns/${campaignId}/send`, data);
    } 
}
const campaignService = new CampaignService()
export default campaignService
