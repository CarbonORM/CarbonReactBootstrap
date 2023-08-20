import {iGetC6RestResponse, restRequest, GET} from "@carbonorm/carbonnode";
import {updateRestfulObjectArrays} from "@carbonorm/carbonreact";
import axiosInstance from "variables/axiosInstance";
import {C6, iCarbons, RestShortTableNames} from "C6";


export default restRequest<{}, iCarbons, {}, iGetC6RestResponse<iCarbons>, RestShortTableNames>({
    C6: C6,
    restURL: 'http://local.carbonphp.com:8080/rest/',
    axios: axiosInstance,
    tableName: C6.carbons.TABLE_NAME,
    requestMethod: GET,
    queryCallback: (request) => {
        request.success = 'Successfully received features!'
        request.error = 'An unknown issue occurred fetching features!'
        return request
    },
    responseCallback: (response, _request) => {
        updateRestfulObjectArrays<iCarbons>((response?.data?.rest || []), "carbons", "entity_pk")
    }
})
