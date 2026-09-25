import axios from "../utils/axios";

class ClientService{
    list(params){
        return axios.get("clients", {params});
    }
    all(params){
        return axios.get("clients/ALL", {params});
    }
    detail(id){
        return axios.get("clientDetail/"+(id || ''));
    }
    save(data){
        return axios.post("saveClient", data);
    }
    delete(id){
        return axios.post("deleteClient", {id});
    }

    choiceFillingStarted(){
        return axios.post("client/choiceFillingStarted");
    }
    choiceFillingClosed(){
        return axios.post("client/choiceFillingClosed");
    }

    setChoiceFillingStarted(started){
        return axios.post("client/setChoiceFillingStarted", {started});
    }
    //Unlock choice filling from inst side 
    unlockStudentChoice(student_id){
        return axios.post("studentUnlockchoicefilling", {student_id});
    }
    //Check course lock status
    checkStudentCourseLimit(student_id){
        return axios.post("checkStudentCourseLimit", {student_id})
    }
    unlockInstitudeChoices(student_id, institute_courseid){
        return axios.post("unlockInstitudeChoices", {student_id,institute_courseid})
    }
}

// eslint-disable-next-line
export default new ClientService();