import axiosnode from "../utils/axiosnode";

class ApplicationEngineService {
  listForms(params) {
    return axiosnode.get("application-engine/forms", { params });
  }

  getActiveForm() {
    return axiosnode.get("application-engine/active");
  }

  getFormById(id) {
    return axiosnode.get(`application-engine/forms/${id}`);
  }

  saveForm(payload) {
    return axiosnode.post("application-engine/forms", payload);
  }

  deleteForm(id) {
    return axiosnode.delete(`application-engine/forms/${id}`);
  }

  saveSection(payload) {
    return axiosnode.post("application-engine/sections", payload);
  }

  deleteSection(id) {
    return axiosnode.delete(`application-engine/sections/${id}`);
  }

  saveField(payload) {
    return axiosnode.post("application-engine/fields", payload);
  }

  deleteField(id) {
    return axiosnode.delete(`application-engine/fields/${id}`);
  }

  saveFullSchema(formId, payload) {
    return axiosnode.post(`application-engine/forms/${formId}/full-schema`, payload);
  }
}

const applicationEngineService = new ApplicationEngineService();
export default applicationEngineService;
