import {iPostC6RestResponse, restRequest, POST} from "@carbonorm/carbonnode";
import {updateRestfulObjectArrays} from "@carbonorm/carbonreact";
import axiosInstance from "variables/axiosInstance";
import {C6, iUsers, RestShortTableNames} from "../../C6";


export default restRequest<{

}, iUsers, {}, iPostC6RestResponse<iUsers>, RestShortTableNames>({
    C6: C6,
    restURL: 'http://local.carbonphp.com:8080/rest/',
    axios: axiosInstance,
    tableName: C6.users.TABLE_NAME,
    requestMethod: POST,
    queryCallback: (request) => {
        request.success = 'Successfully created user!'
        request.error = 'An unknown issue occurred creating the user!'
        return request
    },
    responseCallback: (response, _request) => {
        updateRestfulObjectArrays<iUsers>([response?.data?.rest], "carbon_users", "user_id")
    }
})
